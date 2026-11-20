// Detección de "Braulio" + captura del comando, 100% local con Whisper
// (vía @xenova/transformers, que corre el modelo con ONNX Runtime — sin
// necesidad de compilar nada ni de cuenta/API externa).
//
// Se usa como respaldo mientras Porcupine no esté configurado (ver
// wakeWordService.cjs). A diferencia del reconocimiento de voz del
// navegador, esto SÍ funciona dentro de Electron y sin internet una vez
// descargado el modelo la primera vez.
//
// Estrategia (simple a propósito, es la Fase 1.5):
//   1. Graba continuo con el micrófono.
//   2. Cada ~1.2s transcribe los últimos ~3.5s de audio y busca "braulio".
//      Si el audio está en silencio (RMS bajo), se salta la transcripción
//      para no gastar CPU de más.
//   3. Al detectarlo: si el usuario ya dijo el comando en la misma frase
//      ("Braulio, llévame a mi última lección"), lo usa directo. Si no,
//      graba ~5s más y transcribe eso como el comando.
//
// La detección de "Braulio" corre EN SEGUNDO PLANO respecto a la lectura del
// micrófono (ver _startWakeCheck): antes, el bucle principal esperaba a que
// Whisper terminara de transcribir cada chequeo antes de seguir leyendo
// audio, así que si justo entonces se mantenía la tecla para hablarle a
// mano, esa voz no se grababa (el micrófono estaba "congelado" esperando al
// chequeo de fondo) — o el comando se perdía en la fila de Whisper sin
// siquiera haber capturado bien lo que se dijo.

const { PvRecorder } = require('@picovoice/pvrecorder-node');

const SAMPLE_RATE = 16000; // PvRecorder siempre entrega a 16kHz, igual que Whisper
const WAKE_WORD = 'braulio';
const WAKE_WINDOW_SECONDS = 2.5; // ventana más corta = transcripción más rápida
const WAKE_POLL_INTERVAL_MS = 600; // revisa más seguido para notar antes que empezaste a hablar (era 900)
const COMMAND_MAX_SECONDS = 8; // tope de seguridad si nunca deja de hablar
const COMMAND_SILENCE_MS = 700; // cuánto silencio después de hablar cuenta como "ya terminó"
const MANUAL_HOLD_MAX_SECONDS = 20; // tope de seguridad si se queda la tecla atorada
const MANUAL_NO_SPEECH_SECONDS = 4; // con el botón: si nadie habla en este tiempo, se cancela
const MANUAL_MIN_SECONDS = 0.4; // menos que esto es un toque accidental, no un comando
const WAKE_TRANSCRIBE_TIMEOUT_MS = 6000; // ventana corta (2.5s de audio): si tarda más, algo va mal
const COMMAND_TRANSCRIBE_TIMEOUT_MS = 12000; // hasta 8s de audio real + margen para transcribirlo
// 0.008 obligaba a gritar; 0.0035 alucinaba con ruido de fondo; 0.005 (punto
// medio anterior) TODAVÍA obliga a hablar fuerte en algunos micrófonos — esto
// depende mucho de la ganancia de cada equipo, así que es una aproximación,
// no un valor definitivo. Un paso más abajo, todavía por encima del piso que
// alucinaba.
const SILENCE_RMS_THRESHOLD = 0.0042;
const MODEL_ID = 'Xenova/whisper-base'; // multilingüe; más preciso que "tiny" con nombres cortos
const MAX_WAKE_WORD_DISTANCE = 3; // tolera errores de transcripción ("brabler", "brauleo" ~ "braulio")

const normalize = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

// Distancia de Levenshtein simple, para tolerar que Whisper transcriba
// "Braulio" como algo parecido pero no idéntico ("brabjo", "brawlio", etc.)
function levenshtein(a, b) {
    const dp = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
    for (let j = 0; j <= b.length; j++) dp[0][j] = j;
    for (let i = 1; i <= a.length; i++) {
        for (let j = 1; j <= b.length; j++) {
            dp[i][j] = a[i - 1] === b[j - 1]
                ? dp[i - 1][j - 1]
                : 1 + Math.min(dp[i - 1][j - 1], dp[i - 1][j], dp[i][j - 1]);
        }
    }
    return dp[a.length][b.length];
}

// Busca "braulio" en el texto ya sea como substring exacto, o como una
// palabra suelta razonablemente parecida. Devuelve el índice donde
// empieza esa palabra en `normalized` (para poder cortar el resto como
// comando), o -1 si no encontró nada suficientemente parecido.
function findWakeWord(normalized) {
    const exactIdx = normalized.indexOf(WAKE_WORD);
    if (exactIdx !== -1) return { index: exactIdx, length: WAKE_WORD.length };

    const words = [...normalized.matchAll(/[a-z]+/g)];
    for (const m of words) {
        if (Math.abs(m[0].length - WAKE_WORD.length) > MAX_WAKE_WORD_DISTANCE) continue;
        if (levenshtein(m[0], WAKE_WORD) <= MAX_WAKE_WORD_DISTANCE) {
            return { index: m.index, length: m[0].length };
        }
    }
    return null;
}

function concatFloat32(frames) {
    const total = frames.reduce((n, f) => n + f.length, 0);
    const out = new Float32Array(total);
    let offset = 0;
    for (const f of frames) {
        out.set(f, offset);
        offset += f.length;
    }
    return out;
}

function rms(audio) {
    let sum = 0;
    for (let i = 0; i < audio.length; i++) sum += audio[i] * audio[i];
    return Math.sqrt(sum / audio.length);
}

function int16FrameToFloat32(frame) {
    const out = new Float32Array(frame.length);
    for (let i = 0; i < frame.length; i++) out[i] = frame[i] / 32768;
    return out;
}

const MAX_RECORDER_RETRIES = 5; // reintentos seguidos antes de rendirse de verdad

class LocalVoiceService {
    constructor() {
        this.recorder = null;
        this.transcriber = null;
        this.running = false;
        this.ringBuffer = [];
        this.ringBufferMaxSamples = Math.round(SAMPLE_RATE * WAKE_WINDOW_SECONDS);
        this._loopPromise = null;
        this._onFatalError = null;
        this._onCommand = null;
        // Captura a demanda (tecla o botón): mientras existe, los cuadros del
        // micrófono se juntan aquí y NO se busca "Braulio" — así no hay
        // detección de palabra clave escuchando (ni a la voz del propio asistente).
        this._manual = null;
        this._transcribeChain = Promise.resolve(); // una transcripción a la vez
        // Ver _startWakeCheck / _handleWakeDetected: el chequeo de "Braulio"
        // corre aparte del bucle que lee el micrófono, para no bloquearlo.
        this._wakeCheckBusy = false; // ya hay un chequeo en curso, no lancemos otro
        this._pendingWake = null;    // resultado de un chequeo que encontró la palabra, listo para atenderse
        // Braulio está hablando por las bocinas ahora mismo (lo avisa el renderer
        // por IPC) — mientras tanto no tiene caso ni buscar la palabra clave, el
        // micrófono solo capta su propia voz. El botón/tecla de activar a mano
        // no pasa por aquí, así que sigue funcionando igual.
        this._assistantSpeaking = false;
        // Entre "detecté 'Braulio'" y "ya puedo empezar a grabar el comando" hay
        // que esperar a que el renderer termine de decir "Dime" — si no, el
        // micrófono graba esa misma voz y la confunde con el comando del usuario.
        this._readyToListenResolve = null;
    }

    // Llamado por IPC desde main.cjs cuando cambia si Braulio está hablando.
    setAssistantSpeaking(speaking) {
        const wasSpeaking = this._assistantSpeaking;
        this._assistantSpeaking = !!speaking;
        // El buffer sigue llenándose aunque Braulio esté hablando (para no
        // perder el principio si lo interrumpes — ver startManualCapture), así
        // que puede traer SU PROPIA voz por las bocinas. Se limpia en CADA
        // cambio de estado (empieza o termina de hablar), no solo al terminar:
        // así ni una detección de palabra clave ni una captura manual
        // arrancada justo al interrumpirlo heredan ese audio.
        if (wasSpeaking !== this._assistantSpeaking) {
            this.ringBuffer = [];
        }
    }

    // Llamado por IPC desde main.cjs cuando el renderer terminó de decir "Dime"
    // (o el equivalente) y ya se puede empezar a grabar el comando de verdad.
    notifyReadyToListen() {
        this._readyToListenResolve?.();
        this._readyToListenResolve = null;
    }

    // Espera esa señal, con un plazo de seguridad por si el aviso nunca llega
    // (el audio falló, la ventana no tiene foco, etc.) — mejor grabar un poco
    // tarde que quedarse esperando para siempre.
    _waitReadyToListen(timeoutMs = 3000) {
        return new Promise((resolve) => {
            this._readyToListenResolve = resolve;
            setTimeout(resolve, timeoutMs);
        });
    }

    _openRecorder() {
        this.recorder = new PvRecorder(512);
        this.recorder.start();
    }

    // Si leer el micrófono falla (glitch del driver, buffer lleno mientras
    // Whisper transcribía, etc.), antes esto mataba la escucha para siempre
    // sin avisar a nadie. Ahora intenta reabrir el micrófono unas cuantas
    // veces antes de rendirse de verdad.
    async _recoverRecorder() {
        try { this.recorder?.stop(); this.recorder?.release(); } catch { /* noop */ }
        try {
            this._openRecorder();
            console.warn('[VoiceLocal] Micrófono reabierto después de un error.');
            return true;
        } catch (err) {
            console.error('[VoiceLocal] No se pudo reabrir el micrófono:', err.message);
            return false;
        }
    }

    async _loadModel(onProgress) {
        // @xenova/transformers es ESM-only; import() dinámico funciona bien
        // desde un archivo .cjs.
        const { pipeline } = await import('@xenova/transformers');
        this.transcriber = await pipeline('automatic-speech-recognition', MODEL_ID, {
            progress_callback: onProgress,
        });
    }

    async start({ onWake, onCommand, onModelProgress, onFatalError } = {}) {
        if (this.running) return { ready: true };
        this._onFatalError = onFatalError || null;
        this._onCommand = onCommand || null;

        console.log('[VoiceLocal] Cargando modelo Whisper (la primera vez se descarga, puede tardar)...');
        try {
            await this._loadModel(onModelProgress);
        } catch (err) {
            console.error('[VoiceLocal] No se pudo cargar el modelo Whisper:', err.message);
            return { ready: false, reason: err.message };
        }
        console.log('[VoiceLocal] Modelo Whisper listo.');

        try {
            this._openRecorder();
        } catch (err) {
            console.error('[VoiceLocal] No se pudo abrir el micrófono:', err.message);
            return { ready: false, reason: err.message };
        }

        this.running = true;
        console.log(`[VoiceLocal] Escuchando "Braulio" (dispositivo: ${this.recorder.getSelectedDevice()})`);
        this._loopPromise = this._runLoop(onWake, onCommand);
        return { ready: true };
    }

    async _runLoop(onWake, onCommand) {
        let samplesSinceLastCheck = 0;
        const checkEverySamples = Math.round(SAMPLE_RATE * (WAKE_POLL_INTERVAL_MS / 1000));
        let consecutiveFailures = 0;

        while (this.running) {
            // Un chequeo de fondo encontró "Braulio" — grabar el comando SÍ
            // necesita control exclusivo del micrófono, así que aquí (y solo
            // aquí) el bucle se detiene a propósito. Si mientras tanto ya
            // empezó una captura manual (Ctrl/botón), esta detección quedó
            // vieja: se descarta en vez de interrumpir lo que ya está en curso.
            if (this._pendingWake) {
                const detection = this._pendingWake;
                this._pendingWake = null;
                if (!this._manual) await this._handleWakeDetected(detection, onWake, onCommand);
                continue;
            }

            let frame;
            try {
                frame = await this.recorder.read();
                consecutiveFailures = 0;
            } catch (err) {
                if (!this.running) break;
                consecutiveFailures += 1;
                console.error(`[VoiceLocal] Error leyendo el micrófono (intento ${consecutiveFailures}/${MAX_RECORDER_RETRIES}):`, err.message);

                if (consecutiveFailures > MAX_RECORDER_RETRIES) {
                    console.error('[VoiceLocal] El micrófono no se pudo recuperar, me detengo.');
                    this._onFatalError?.(err.message);
                    break;
                }
                const recovered = await this._recoverRecorder();
                if (!recovered) {
                    // Espera un poco antes de reintentar en vez de martillar el driver
                    await new Promise((r) => setTimeout(r, 500));
                }
                continue;
            }

            try {
                const floatFrame = int16FrameToFloat32(frame);
                this.ringBuffer.push(floatFrame);
                samplesSinceLastCheck += floatFrame.length;

                let total = this.ringBuffer.reduce((n, f) => n + f.length, 0);
                while (total > this.ringBufferMaxSamples && this.ringBuffer.length > 1) {
                    total -= this.ringBuffer[0].length;
                    this.ringBuffer.shift();
                }

                if (this._manual) {
                    this._feedManual(floatFrame);
                    samplesSinceLastCheck = 0;
                } else if (samplesSinceLastCheck >= checkEverySamples && !this._wakeCheckBusy) {
                    samplesSinceLastCheck = 0;
                    this._startWakeCheck(); // en paralelo — NO se espera aquí, ver más abajo
                }
            } catch (err) {
                // Un error aquí (p.ej. Whisper) no debe tirar todo el bucle de
                // escucha — lo registramos y seguimos en la siguiente vuelta.
                console.error('[VoiceLocal] Error inesperado procesando audio:', err.message);
            }
        }
    }

    // Whisper procesa una transcripción a la vez: si la detección de "Braulio" y
    // una captura manual coincidieran, se ponen en fila en vez de pisarse.
    //
    // Además, nunca se espera para siempre: si tarda más de `timeoutMs` (equipo
    // lento, o simplemente atorado), se avisa como si no se hubiera entendido en
    // vez de dejar a Braulio "pensando" sin contestar nada. La transcripción de
    // verdad sigue corriendo en segundo plano (no se puede cancelar a medias:
    // @xenova/transformers no expone eso), así que solo retrasa la SIGUIENTE
    // transcripción en la fila, no la que el usuario ya dejó de esperar.
    _transcribe(audio, timeoutMs = COMMAND_TRANSCRIBE_TIMEOUT_MS) {
        const run = async () => {
            const result = await this.transcriber(audio, { language: 'spanish', task: 'transcribe' });
            return (result?.text || '').trim();
        };
        const job = this._transcribeChain.then(run, run);
        this._transcribeChain = job.catch(() => {});

        let timer;
        const timeout = new Promise((_, reject) => {
            timer = setTimeout(() => {
                const err = new Error(`Whisper tardó más de ${Math.round(timeoutMs / 1000)}s en transcribir.`);
                err.code = 'timeout';
                reject(err);
            }, timeoutMs);
        });
        job.finally(() => clearTimeout(timer)).catch(() => {});
        return Promise.race([job, timeout]);
    }

    // ── Captura a demanda (mantener una tecla / pulsar el botón) ───────────────
    // autoStop = true: corta sola cuando dejas de hablar (botón en pantalla).
    // autoStop = false: sigue hasta que se llame a finishManualCapture() (mantener tecla).
    startManualCapture({ autoStop = false } = {}) {
        if (!this.running) return { ok: false, reason: 'El motor de voz local no está activo.' };
        if (this._manual) return { ok: true };
        // El renderer espera ~350ms sosteniendo Ctrl antes de avisarle a esto
        // que arranque (para no confundir un toque breve o un Ctrl+C con
        // "quiero hablar") — si empezaste a hablar justo al presionar la
        // tecla, ese principio se decía ANTES de que la grabación arrancara
        // y se perdía ("ve a mensajes" salía transcrito como "masajes").
        // `ringBuffer` ya venía grabando de fondo todo ese rato (lo usa la
        // detección de "Braulio"), así que la captura arranca con eso en vez
        // de en blanco — recupera el principio en lugar de perderlo.
        const seedFrames = [...this.ringBuffer];
        const seedSamples = seedFrames.reduce((n, f) => n + f.length, 0);
        const seedHasSpeech = seedFrames.length > 0 && rms(concatFloat32(seedFrames)) >= SILENCE_RMS_THRESHOLD;
        this.ringBuffer = [];
        this._manual = {
            frames: seedFrames,
            samples: seedSamples,
            recent: seedFrames.slice(-5),
            sawSpeech: seedHasSpeech,
            silentStreak: 0,
            autoStop,
        };
        console.log(
            `[VoiceLocal] Captura manual iniciada (${autoStop ? 'hasta el silencio' : 'mientras mantienes la tecla'}), ` +
            `${(seedSamples / SAMPLE_RATE).toFixed(2)}s de audio previo recuperado.`,
        );
        return { ok: true };
    }

    _feedManual(frame) {
        const m = this._manual;
        if (!m) return;
        m.frames.push(frame);
        m.samples += frame.length;
        m.recent.push(frame);
        if (m.recent.length > 5) m.recent.shift();

        const level = rms(concatFloat32(m.recent));
        if (level >= SILENCE_RMS_THRESHOLD) {
            m.sawSpeech = true;
            m.silentStreak = 0;
        } else if (m.sawSpeech) {
            m.silentStreak += frame.length;
        }

        const silenceDone = m.autoStop && m.sawSpeech && m.silentStreak >= SAMPLE_RATE * (COMMAND_SILENCE_MS / 1000);
        const nothingSaid = m.autoStop && !m.sawSpeech && m.samples >= SAMPLE_RATE * MANUAL_NO_SPEECH_SECONDS;
        const tooLong = m.samples >= SAMPLE_RATE * (m.autoStop ? COMMAND_MAX_SECONDS : MANUAL_HOLD_MAX_SECONDS);
        if (silenceDone || nothingSaid || tooLong) this.finishManualCapture();
    }

    // Cierra la captura, transcribe y entrega el comando (o '' si no hubo nada).
    async finishManualCapture() {
        const m = this._manual;
        if (!m) return;
        this._manual = null;
        this.ringBuffer = [];

        const audio = concatFloat32(m.frames);
        const seconds = audio.length / SAMPLE_RATE;
        // `m.sawSpeech` ya viene calculado por ventanas mientras se grababa (ver
        // _feedManual) — más confiable que promediar el volumen de TODO el clip,
        // que con la tecla mantenida casi siempre trae silencio de sobra al
        // principio o al final y podía diluir una voz corta hasta "no hubo nada".
        if (seconds < MANUAL_MIN_SECONDS || !m.sawSpeech) {
            console.log('[VoiceLocal] Captura manual sin voz, la descarto.');
            this._onCommand?.('');
            return;
        }
        try {
            const text = await this._transcribe(audio, COMMAND_TRANSCRIBE_TIMEOUT_MS);
            console.log(`[VoiceLocal] Captura manual transcrita (${seconds.toFixed(1)} s): "${text}"`);
            this._onCommand?.(text || '');
        } catch (err) {
            console.warn('[VoiceLocal] Error transcribiendo la captura manual:', err.message);
            this._onCommand?.('');
        }
    }

    // Dispara la detección de "Braulio" SIN esperarla (fire-and-forget) — si
    // el bucle principal la esperara, se quedaría sin leer el micrófono
    // mientras Whisper transcribe (puede ser varios segundos), y una
    // captura manual que arrancara justo entonces perdería lo que dijiste.
    // El resultado (si encontró la palabra) se deja en `_pendingWake` para
    // que _runLoop lo atienda en su siguiente vuelta.
    _startWakeCheck() {
        if (!this.running || this._assistantSpeaking) return;
        const audio = concatFloat32(this.ringBuffer);
        const level = rms(audio);
        if (level < SILENCE_RMS_THRESHOLD) return; // silencio, ni lo intentamos

        this._wakeCheckBusy = true;
        this._detectWakeWord(audio, level)
            .then((detection) => {
                if (detection) this._pendingWake = detection;
            })
            .catch((err) => {
                console.warn('[VoiceLocal] Error transcribiendo:', err.message);
            })
            .finally(() => {
                this._wakeCheckBusy = false;
            });
    }

    // Transcribe el audio ya capturado y busca "Braulio" — no toca el
    // micrófono para nada, así que es seguro que corra en paralelo a la
    // lectura de audio del bucle principal.
    async _detectWakeWord(audio, level) {
        const text = await this._transcribe(audio, WAKE_TRANSCRIBE_TIMEOUT_MS);
        // Log de diagnóstico: muestra TODO lo que transcribe, aunque no
        // contenga "braulio" — así vemos si el mic funciona y qué entiende.
        console.log(`[VoiceLocal] (diagnóstico) rms=${level.toFixed(4)} transcripción: "${text}"`);
        if (!text) return null;

        const normalized = normalize(text);
        const match = findWakeWord(normalized);
        if (!match) return null;

        console.log('[VoiceLocal] "Braulio" detectado en:', text);
        const afterWake = text
            .slice(match.index + match.length)
            .trim()
            .replace(/^[,:.]\s*/, '');
        return { afterWake };
    }

    // Ya se detectó "Braulio" (ver _startWakeCheck) — de aquí en adelante SÍ
    // hace falta control exclusivo del micrófono para grabar el comando, así
    // que _runLoop se dedica por completo a esto hasta que termine.
    async _handleWakeDetected({ afterWake }, onWake, onCommand) {
        if (!this.running) return;
        this.ringBuffer = [];
        onWake?.();

        if (afterWake.length > 2) {
            onCommand?.(afterWake);
            return;
        }

        // Espera a que el renderer termine de decir "Dime" antes de grabar — si
        // no, el micrófono capta esa misma voz y la transcribe como si fuera el
        // comando del usuario.
        await this._waitReadyToListen();
        if (!this.running) return;

        const commandAudio = await this._recordUntilSilence();
        if (!this.running) return;

        // Si te quedaste en silencio, ni lo intentamos: Whisper "alucina"
        // palabras random cuando le das audio vacío/ruido de fondo.
        if (rms(commandAudio) < SILENCE_RMS_THRESHOLD) {
            console.log('[VoiceLocal] No dijiste nada después de "Braulio", cancelo.');
            onCommand?.(''); // avisa al renderer para que vuelva a "idle" sin inventar texto
            return;
        }

        try {
            const commandSeconds = commandAudio.length / SAMPLE_RATE;
            const commandText = await this._transcribe(commandAudio, COMMAND_TRANSCRIBE_TIMEOUT_MS);
            console.log(`[VoiceLocal] Comando (tras "Braulio") transcrito (${commandSeconds.toFixed(1)} s): "${commandText}"`);
            if (commandText) onCommand?.(commandText);
            else onCommand?.('');
        } catch (err) {
            console.warn('[VoiceLocal] Error transcribiendo el comando:', err.message);
            onCommand?.('');
        }
    }

    // Graba el comando y corta en cuanto detecta que dejaste de hablar, en
    // vez de esperar siempre los mismos N segundos fijos — la mayoría de
    // comandos duran 1-3s, así que esto ahorra varios segundos por turno.
    //
    // Importante: el volumen se mide sobre una VENTANA de varios cuadros
    // (~150ms), no cuadro por cuadro (32ms) — un solo cuadro es demasiado
    // sensible a ruido de fondo (un pico aislado se malinterpretaba como
    // "ya habló", y el silencio normal después como "ya terminó", cortando
    // la grabación casi al instante).
    async _recordUntilSilence({ maxSeconds = COMMAND_MAX_SECONDS, silenceMs = COMMAND_SILENCE_MS } = {}) {
        const WINDOW_FRAMES = 5; // ~160ms a 512 muestras/cuadro y 16kHz
        const frames = [];
        const recentFrames = [];
        const maxSamples = Math.round(SAMPLE_RATE * maxSeconds);
        const silenceSamplesThreshold = Math.round(SAMPLE_RATE * (silenceMs / 1000));
        let collected = 0;
        let sawSpeech = false;
        let silentStreak = 0;

        while (collected < maxSamples && this.running) {
            let frame;
            try {
                frame = await this.recorder.read();
            } catch (err) {
                console.warn('[VoiceLocal] Error leyendo el micrófono durante el comando:', err.message);
                break; // nos quedamos con lo que ya se alcanzó a grabar
            }
            const floatFrame = int16FrameToFloat32(frame);
            frames.push(floatFrame);
            collected += floatFrame.length;

            recentFrames.push(floatFrame);
            if (recentFrames.length > WINDOW_FRAMES) recentFrames.shift();
            const level = rms(concatFloat32(recentFrames));

            if (level >= SILENCE_RMS_THRESHOLD) {
                sawSpeech = true;
                silentStreak = 0;
            } else if (sawSpeech) {
                silentStreak += floatFrame.length;
                if (silentStreak >= silenceSamplesThreshold) break; // dejó de hablar, cortamos ya
            }
        }
        return concatFloat32(frames);
    }

    async stop() {
        this.running = false;
        if (this._loopPromise) await this._loopPromise.catch(() => {});
        if (this.recorder) {
            try { this.recorder.stop(); this.recorder.release(); } catch { /* noop */ }
            this.recorder = null;
        }
    }
}

module.exports = { LocalVoiceService };
