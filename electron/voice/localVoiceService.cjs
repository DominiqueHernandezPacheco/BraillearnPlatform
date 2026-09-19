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
// Limitación conocida: mientras transcribe (unos cientos de ms a un par de
// segundos con el modelo "tiny"), no está leyendo el micrófono, así que
// puede perderse un instante de audio. Aceptable para esta fase; si hace
// falta más precisión, se resuelve con un hilo de captura aparte.

const { PvRecorder } = require('@picovoice/pvrecorder-node');

const SAMPLE_RATE = 16000; // PvRecorder siempre entrega a 16kHz, igual que Whisper
const WAKE_WORD = 'braulio';
const WAKE_WINDOW_SECONDS = 2.5; // ventana más corta = transcripción más rápida
const WAKE_POLL_INTERVAL_MS = 900; // revisa más seguido para notar antes que empezaste a hablar
const COMMAND_MAX_SECONDS = 8; // tope de seguridad si nunca deja de hablar
const COMMAND_SILENCE_MS = 700; // cuánto silencio después de hablar cuenta como "ya terminó"
const SILENCE_RMS_THRESHOLD = 0.005; // punto medio: 0.008 obligaba a gritar, 0.0035 alucinaba con ruido
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

                if (samplesSinceLastCheck >= checkEverySamples) {
                    samplesSinceLastCheck = 0;
                    await this._checkForWakeWord(onWake, onCommand);
                }
            } catch (err) {
                // Un error aquí (p.ej. Whisper) no debe tirar todo el bucle de
                // escucha — lo registramos y seguimos en la siguiente vuelta.
                console.error('[VoiceLocal] Error inesperado procesando audio:', err.message);
            }
        }
    }

    async _transcribe(audio) {
        const result = await this.transcriber(audio, { language: 'spanish', task: 'transcribe' });
        return (result?.text || '').trim();
    }

    async _checkForWakeWord(onWake, onCommand) {
        if (!this.running) return;
        const audio = concatFloat32(this.ringBuffer);
        const level = rms(audio);
        if (level < SILENCE_RMS_THRESHOLD) return; // silencio, ni lo intentamos

        let text = '';
        try {
            text = await this._transcribe(audio);
        } catch (err) {
            console.warn('[VoiceLocal] Error transcribiendo:', err.message);
            return;
        }
        // Log de diagnóstico: muestra TODO lo que transcribe, aunque no
        // contenga "braulio" — así vemos si el mic funciona y qué entiende.
        console.log(`[VoiceLocal] (diagnóstico) rms=${level.toFixed(4)} transcripción: "${text}"`);
        if (!text) return;

        const normalized = normalize(text);
        const match = findWakeWord(normalized);
        if (!match) return;

        console.log('[VoiceLocal] "Braulio" detectado en:', text);
        this.ringBuffer = [];
        onWake?.();

        const afterWake = text
            .slice(match.index + match.length)
            .trim()
            .replace(/^[,:.]\s*/, '');

        if (afterWake.length > 2) {
            onCommand?.(afterWake);
            return;
        }

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
            const commandText = await this._transcribe(commandAudio);
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
