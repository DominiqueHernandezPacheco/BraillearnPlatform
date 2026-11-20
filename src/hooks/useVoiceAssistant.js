import { useState, useEffect, useRef, useCallback } from 'react';
import { useAudio } from '../context/AudioContext';
import { PHRASES } from '../utils/assistantPhrases';
import useWaitUntilNotSpeaking from './useWaitUntilNotSpeaking';

// Asistente de voz "Braulio".
//
//   1. "electron": dentro de la app de escritorio, el proceso principal
//      escucha el micrófono y transcribe 100% local (Porcupine + STT, o
//      Whisper local como respaldo — main.cjs decide cuál) y avisa por IPC.
//      El renderer NO usa el reconocimiento de voz del navegador aquí:
//      no funciona dentro de Electron (le falta la llave de Google que
//      solo traen los builds oficiales de Chrome/Edge).
//   2. "web-fallback": si se abre la app en un navegador normal (sin
//      Electron), usa el reconocimiento de voz continuo del navegador.
//      Solo sirve para pruebas rápidas en Chrome/Edge — no en Brave ni
//      en Electron.
//
// NOTA DE DISEÑO: `speak` (de AudioContext) y `onCommand` (de quien use
// este hook) cambian de identidad con cada tanto — por eso las funciones de
// aquí abajo los leen desde una ref ("siempre la versión más reciente") en
// vez de tenerlos como dependencia directa. Si dependieran de ellos
// directamente, el efecto que arranca/para el reconocimiento de voz se
// reiniciaría cada vez que cualquiera de esas dos funciones cambiara de
// referencia — y en el modo respaldo eso puede pasar varias veces justo al
// cargar la página (el navegador dispara "onvoiceschanged" más de una vez),
// cortando el micrófono antes de que el usuario alcance a decir nada.

// Modo web-fallback: cuánto silencio (sin resultados nuevos, ni parciales)
// cuenta como "ya terminaste de hablar". Antes de esto, quien decidía era el
// propio navegador con una sesión de reconocimiento de una sola vez — corta
// en cuanto SU heurística interna detecta cualquier pausa, incluida una
// pausa natural a medio pensar la frase ("Qué es... costoso aprender
// braille" salía transcrito solo como "Qué es"). Ahora usamos reconocimiento
// continuo y decidimos nosotros cuándo cortar, con un margen más generoso.
const WEB_COMMAND_SILENCE_MS = 1500;
// Tope absoluto por si nunca se detecta ni una palabra.
const WEB_COMMAND_MAX_MS = 12000;

// Cuánto espera el "Dime" hablado por si el comando llega pegado a "Braulio"
// (en ese caso los dos eventos llegan casi a la vez, en pocos milisegundos).
const DIME_DELAY_MS = 120;

// Mantener Ctrl izquierdo este tiempo (solo, sin otra tecla) activa a Braulio.
const HOLD_TO_TALK_MS = 350;
// Pausa entre el sonidito y el inicio de la grabación, para que no se grabe el sonidito.
const CAPTURE_START_DELAY_MS = 220;

// Seguro final: si el estado no vuelve a "idle" en este tiempo (Whisper muy
// lento, Claude sin responder, algo que nadie atrapó), se reinicia solo con
// un aviso — mejor eso que quedarse "pensando" para siempre sin contestar.
//
// Tiene que cubrir el peor caso REAL del lado de Electron, no solo "se ve
// razonable": esperar "Dime" (hasta 3s) + grabar el comando (hasta 8s,
// COMMAND_MAX_SECONDS en localVoiceService.cjs) + transcribirlo (hasta 12s,
// COMMAND_TRANSCRIBE_TIMEOUT_MS) suman 23s. Con 16s, este aviso se disparaba
// ANTES de que el motor de voz terminara — y como el resultado tardío igual
// llegaba después (el IPC sigue vivo), se veía un "me tardé" seguido de un
// "Comando capturado" fantasma de un intento que ya se había dado por perdido.
const STUCK_TIMEOUT_MS = 26000;

// Errores de los que no tiene caso reintentar en modo web-fallback.
const FATAL_ERRORS = new Set(['not-allowed', 'service-not-allowed', 'audio-capture']);
const MAX_CONSECUTIVE_FAILURES = 5;

const normalize = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

/**
 * @param {(transcript: string) => void | Promise<void>} onCommand - se llama
 * con el texto capturado cada vez que hay un comando (o '' si te quedaste en
 * silencio). Aquí solo se maneja la captura de voz; qué HACER con el texto
 * (navegar, preguntarle a Claude, etc.) lo decide quien use este hook.
 */
const useVoiceAssistant = (onCommand) => {
    const { speak, beginAssistantTurn, endAssistantTurn, playCue } = useAudio();
    const waitUntilNotSpeaking = useWaitUntilNotSpeaking();
    const [status, setStatus] = useState('idle'); // idle | listening | processing
    const [lastCommand, setLastCommand] = useState('');
    // Se decide una sola vez, de forma síncrona. En Electron el motor de voz
    // (Porcupine o Whisper local) puede tardar varios segundos en arrancar
    // -sobre todo Whisper, que carga un modelo- así que arranca en
    // "electron-loading" hasta que main.cjs avise que ya está listo.
    const [mode, setMode] = useState(() => {
        if (window.electronAPI?.getWakeWordStatus) return 'electron-loading';
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        return SpeechRecognition ? 'web-fallback' : 'unavailable';
    });
    const recognitionRef = useRef(null);
    const fallbackShouldRunRef = useRef(false);
    const capturingCommandRef = useRef(false);
    const resumeContinuousRef = useRef(null);
    const consecutiveFailuresRef = useRef(0);

    // "Siempre la versión más reciente" — ver nota de diseño arriba.
    const speakRef = useRef(speak);
    useEffect(() => { speakRef.current = speak; }, [speak]);
    const onCommandRef = useRef(onCommand);
    useEffect(() => { onCommandRef.current = onCommand; }, [onCommand]);
    const beginTurnRef = useRef(beginAssistantTurn);
    useEffect(() => { beginTurnRef.current = beginAssistantTurn; }, [beginAssistantTurn]);
    const endTurnRef = useRef(endAssistantTurn);
    useEffect(() => { endTurnRef.current = endAssistantTurn; }, [endAssistantTurn]);
    const playCueRef = useRef(playCue);
    useEffect(() => { playCueRef.current = playCue; }, [playCue]);
    const dimeTimerRef = useRef(null);
    // El motor de voz local no se entera de que este aviso se disparó — sigue
    // trabajando de fondo y, si termina, igual manda su resultado por IPC.
    // Sin esto, ese resultado tardío se procesaba como si fuera un comando
    // nuevo (a veces llegando DESPUÉS de que ya intentaste otra vez), dejando
    // una respuesta fuera de lugar. Se limpia solo al arrancar el siguiente
    // intento de verdad (acknowledgeWake / startManualCapture) — no aquí.
    const ignoreNextResultRef = useRef(false);

    // Ver STUCK_TIMEOUT_MS arriba. Corre en cada cambio de estado: "escuchando"
    // y "procesando" tienen cada uno su propio plazo (no se suman entre sí).
    useEffect(() => {
        if (status === 'idle') return undefined;
        const timer = setTimeout(() => {
            console.warn('[Braulio] Se tardó demasiado sin responder, reinicio el estado.');
            ignoreNextResultRef.current = true;
            captureActiveRef.current = false;
            captureStartedRef.current = false;
            setStatus('idle');
            speakRef.current(PHRASES.tooSlow, true, { priority: true });
            endTurnRef.current?.();
        }, STUCK_TIMEOUT_MS);
        return () => clearTimeout(timer);
    }, [status]);

    // Respuesta inmediata en cuanto se oye "Braulio": el sonidito, la pausa de lo
    // que estuviera diciendo y el estado "escuchando". El "Dime" hablado sale un
    // instante después y SOLO si no vino ya el comando pegado ("Braulio, ve a
    // cursos"): en ese caso decir "Dime" estorbaría a la respuesta.
    //
    // IMPORTANTE: el motor de voz local NO empieza a grabar el comando hasta que
    // "Dime" termina de sonar (ver notifyReadyToListen más abajo) — si grabara
    // desde antes, el micrófono captaría esa misma voz y la confundiría con el
    // comando del usuario. Ya no hay un sonido aparte para avisar esto (sonaba a
    // demasiados pitidos seguidos) — el aviso a main.cjs sigue pasando igual,
    // solo que en silencio.
    // `onReady` (opcional): se llama exactamente cuando "Dime" termina de sonar
    // de verdad — en vez de que cada quien que llama a esto adivine con un
    // setTimeout fijo cuánto va a tardar la síntesis de voz (Piper/ElevenLabs
    // pueden variar), lo cual en modo web-fallback dejaba al reconocimiento del
    // navegador arrancar mientras "Dime" seguía sonando y se escuchaba a sí mismo.
    const acknowledgeWake = useCallback(({ dimeDelayMs = DIME_DELAY_MS, onReady } = {}) => {
        ignoreNextResultRef.current = false; // esto SÍ es un intento nuevo, su resultado cuenta
        beginTurnRef.current?.();
        playCueRef.current?.('wake');
        setStatus('listening');
        clearTimeout(dimeTimerRef.current);
        dimeTimerRef.current = setTimeout(() => {
            speakRef.current(PHRASES.dime, true, {
                priority: true,
                onDone: () => {
                    console.log('[Braulio] "Dime" terminó de sonar, ya puede grabar el comando.');
                    window.electronAPI?.notifyReadyToListen?.();
                    onReady?.();
                },
            });
        }, dimeDelayMs);
    }, []);

    // Captura a mano en curso (tecla o botón) — ver "Activar a mano" más abajo.
    const captureActiveRef = useRef(false);   // hay una captura en curso o por empezar
    const captureStartedRef = useRef(false);  // el micrófono ya empezó a grabar
    const captureTimerRef = useRef(null);

    const handleCommand = useCallback(async (transcript) => {
        if (ignoreNextResultRef.current) {
            ignoreNextResultRef.current = false;
            console.warn('[Braulio] Ignorando resultado tardío de un intento ya abandonado:', JSON.stringify(transcript));
            return;
        }
        clearTimeout(dimeTimerRef.current); // ya hay comando: no hace falta el "Dime"
        captureActiveRef.current = false;
        captureStartedRef.current = false;
        setLastCommand(transcript);
        setStatus('processing');
        console.log('[Braulio] Comando capturado:', JSON.stringify(transcript));
        try {
            await onCommandRef.current?.(transcript);
        } catch (err) {
            console.error('[Braulio] Error manejando el comando:', err);
        } finally {
            setStatus('idle');
        }
    }, []);

    // ── Electron: espera el aviso de main.cjs de que el motor ya cargó ──────
    useEffect(() => {
        if (mode !== 'electron-loading') return;

        let cancelled = false;
        const applyStatus = (s) => {
            if (cancelled) return;
            if (s?.ready) {
                setMode('electron');
            } else {
                console.warn('[Braulio] Ningún motor de voz local arrancó en Electron:', s?.reason);
                setMode('unavailable');
            }
        };

        // Por si la ventana se recargó DESPUÉS de que main.cjs ya hubiera
        // avisado (ese aviso solo se manda una vez): preguntamos el estado
        // actual de una vez, que si ya está listo responde al toque.
        window.electronAPI.getWakeWordStatus?.().then((s) => {
            if (s?.ready) applyStatus(s);
        });

        // Y nos quedamos escuchando por si en este momento SÍ seguía cargando.
        const unsubscribe = window.electronAPI.onVoiceEngineStatus(applyStatus);

        return () => {
            cancelled = true;
            unsubscribe?.();
        };
    }, [mode]);

    // ── Electron: ya listo, solo reacciona a los eventos del proceso principal ──
    useEffect(() => {
        if (mode !== 'electron') return;

        const unsubWake = window.electronAPI.onWakeWord(() => acknowledgeWake());
        const unsubCommand = window.electronAPI.onCommandCaptured((text) => {
            handleCommand(text);
        });
        // Sigue escuchando por si el motor de voz se cae MÁS TARDE (p.ej. el
        // micrófono falla y no se pudo recuperar) — si no, la insignia se
        // quedaría diciendo "listo" para siempre aunque ya no esté escuchando.
        const unsubStatus = window.electronAPI.onVoiceEngineStatus((s) => {
            if (!s?.ready) {
                console.warn('[Braulio] El motor de voz se cayó:', s?.reason);
                setMode('unavailable');
            }
        });

        return () => {
            unsubWake?.();
            unsubCommand?.();
            unsubStatus?.();
        };
    }, [mode, handleCommand, acknowledgeWake]);


    // ── Modo web-fallback: captura del comando ──────────────────────────
    // Continuo + resultados parciales, en vez de una sola sesión que el
    // navegador corta solo (ver WEB_COMMAND_SILENCE_MS arriba). Cada
    // resultado — final o parcial — reinicia el plazo de silencio; solo
    // cuando de verdad pasa ese rato sin nada nuevo se corta la sesión y se
    // usa lo acumulado. Así una pausa natural a medio pensar la frase ya no
    // corta el comando a la mitad.
    const startListeningForCommand = useCallback((isRetry = false) => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            speakRef.current('No puedo escuchar comandos todavía, falta configurar el reconocimiento de voz.', true, { priority: true });
            return;
        }
        const recognition = new SpeechRecognition();
        recognition.lang = 'es-MX';
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.maxAlternatives = 1;

        capturingCommandRef.current = true;
        let finalTranscript = '';
        let silenceTimer = null;

        const scheduleSilenceStop = () => {
            clearTimeout(silenceTimer);
            silenceTimer = setTimeout(() => recognition.stop(), WEB_COMMAND_SILENCE_MS);
        };
        // Tope absoluto por si nunca se detecta ni una palabra.
        const hardTimer = setTimeout(() => recognition.stop(), WEB_COMMAND_MAX_MS);

        // Aviso de "ya puedes hablar" disparado por el evento REAL de inicio
        // del navegador, no por un temporizador adivinado — crear la sesión y
        // que de verdad empiece a escuchar no es instantáneo, y sin esta señal
        // quien hablaba justo al terminar "Dime" a veces perdía su primer
        // intento (el reconocimiento todavía no arrancaba de verdad). No se
        // repite en el reintento silencioso de abajo, para no sonar dos veces.
        recognition.onstart = () => { if (!isRetry) playCueRef.current?.('ready'); };

        recognition.onresult = (event) => {
            // Cualquier resultado —parcial o final— es "sigue hablando":
            // reinicia el plazo de silencio en vez de cortar a la primera pausa.
            scheduleSilenceStop();
            for (let i = event.resultIndex; i < event.results.length; i++) {
                const result = event.results[i];
                if (result.isFinal) finalTranscript += `${result[0].transcript} `;
            }
        };
        recognition.onerror = (event) => {
            console.error('[Braulio] Error de reconocimiento:', event.error);
        };
        recognition.onend = () => {
            clearTimeout(silenceTimer);
            clearTimeout(hardTimer);
            const text = finalTranscript.trim();
            // El primer intento justo después de "Dime" a veces no alcanza a
            // arrancar a tiempo (arrancar la sesión del navegador no es
            // instantáneo) y no captura nada — en vez de obligar a decir
            // "Braulio" o mantener Ctrl otra vez, se reintenta UNA sola vez
            // en silencio antes de darse por vencido.
            if (!text && !isRetry) {
                console.log('[Braulio] Primer intento sin voz, reintentando una vez...');
                startListeningForCommand(true);
                return;
            }
            capturingCommandRef.current = false;
            setStatus((prev) => (prev === 'listening' ? 'idle' : prev));
            // No reanudar de inmediato: justo ahora es cuando Braulio empieza a
            // contestar. Si la escucha continua arrancara ya, se oiría a sí
            // mismo — se espera a que de verdad termine de hablar.
            if (fallbackShouldRunRef.current && resumeContinuousRef.current) {
                waitUntilNotSpeaking(() => resumeContinuousRef.current?.(), { floorMs: 250 });
            }
            handleCommand(text);
        };

        recognitionRef.current = recognition;
        setStatus('listening');
        recognition.start();
    }, [handleCommand, waitUntilNotSpeaking]);

    const handleWakeWeb = useCallback(() => {
        acknowledgeWake({ dimeDelayMs: 0, onReady: startListeningForCommand });
    }, [startListeningForCommand, acknowledgeWake]);

    // ── Activar a mano: botón en pantalla o mantener Ctrl izquierdo ────────────
    // Sin audífonos el micrófono oye a la vez la voz de Braulio y la tuya, y la
    // palabra clave no siempre logra "cortarlo". Con la tecla no hace falta: al
    // pulsarla Braulio calla al instante y el micrófono queda solo para ti.
    // (Modo push-to-talk: mantienes para hablar, sueltas para que procese.)
    const modeRef = useRef(mode);
    useEffect(() => { modeRef.current = mode; }, [mode]);

    const stopRequestedRef = useRef(false); // se soltó la tecla antes de que arrancara la grabación

    // Suelta la tecla: termina de grabar y procesa lo que dijiste. Si se suelta
    // ANTES de que la grabación de verdad haya arrancado (todavía en el instante
    // de espera tras el sonidito, ver CAPTURE_START_DELAY_MS), no se aborta sin
    // más — eso dejaba una pulsación breve sin ningún resultado, ni sonido ni
    // aviso. Se marca para cortar en cuanto arranque, y así igual se procesa lo
    // poco que se alcanzó a decir.
    const finishManualCapture = useCallback(() => {
        if (!captureActiveRef.current) return;
        if (!captureStartedRef.current) {
            console.log('[Braulio] Ctrl soltado antes de empezar a grabar; se procesará en cuanto arranque.');
            stopRequestedRef.current = true;
            return;
        }
        captureActiveRef.current = false;
        captureStartedRef.current = false;
        stopRequestedRef.current = false;
        console.log('[Braulio] Ctrl soltado, terminando de grabar...');
        setStatus('processing');
        if (modeRef.current === 'web-fallback') recognitionRef.current?.stop();
        else window.electronAPI.stopVoiceCapture?.();
    }, []);

    // Empieza una captura. autoStop: corta sola al dejar de hablar (botón).
    const startManualCapture = useCallback(({ autoStop }) => {
        if (captureActiveRef.current) return;
        ignoreNextResultRef.current = false; // esto SÍ es un intento nuevo, su resultado cuenta
        captureActiveRef.current = true;
        captureStartedRef.current = false;
        stopRequestedRef.current = false;
        clearTimeout(dimeTimerRef.current);
        // force: true — si ya estaba a media respuesta, esto lo corta de
        // verdad en vez de ser un no-op (ver beginAssistantTurn). Activar a
        // mano es una interrupción explícita del usuario, a diferencia de la
        // palabra clave, que si acaso puede ir pegada al final de algo que
        // Braulio ya estaba diciendo.
        beginTurnRef.current?.({ force: true }); // calla a Braulio / pausa la lección
        playCueRef.current?.('wake');
        setStatus('listening');
        console.log('[Braulio] Ctrl mantenido: preparando el micrófono...');

        if (modeRef.current === 'web-fallback') {
            // Navegador: se detiene la escucha continua y se abre la del comando.
            // Mismo criterio que en Electron (ver comentario de abajo): con Ctrl
            // mantenido no hay pausa — perder las primeras palabras por esperar
            // a que no se cuele el pitido es peor que el pitido mismo. Antes esto
            // esperaba SIEMPRE ~350ms, incluso con Ctrl, y se perdía el principio
            // de lo que decías ("ve a mensajes" salía como "mensajes").
            capturingCommandRef.current = true;
            recognitionRef.current?.stop();
            const webStartDelay = autoStop ? CAPTURE_START_DELAY_MS + 130 : 0;
            captureTimerRef.current = setTimeout(() => {
                captureStartedRef.current = true;
                if (stopRequestedRef.current) { finishManualCapture(); return; }
                startListeningForCommand();
            }, webStartDelay);
            return;
        }

        // Electron: al mantener la tecla, el micrófono arranca YA — perder las
        // primeras palabras es peor que dejar el pitido colarse un instante (un
        // tono corto no se transcribe como texto). Solo el botón (autoStop, que
        // corta solo al detectar silencio) espera un poco: si no, confundiría el
        // propio pitido con "ya empezaste a hablar" y podría cortar de más.
        const startDelay = autoStop ? CAPTURE_START_DELAY_MS : 0;
        captureTimerRef.current = setTimeout(async () => {
            let res;
            try {
                res = await window.electronAPI.startVoiceCapture?.({ autoStop });
            } catch (err) {
                res = { ok: false, reason: err?.message };
            }
            if (res?.ok) {
                captureStartedRef.current = true;
                console.log('[Braulio] Grabando con Ctrl...');
                // Ya soltó la tecla mientras esto arrancaba: se corta ya mismo.
                if (stopRequestedRef.current) finishManualCapture();
                return;
            }
            captureActiveRef.current = false;
            console.error('[Braulio] No se pudo activar el micrófono con Ctrl:', res?.reason);
            setStatus('idle');
            speakRef.current(res?.reason || PHRASES.noMic, true, { priority: true });
        }, startDelay);
    }, [startListeningForCommand, finishManualCapture]);

    // Mantener Ctrl IZQUIERDO (la esquina inferior izquierda del teclado, fácil
    // de ubicar al tacto). Solo cuenta si se mantiene un momento SIN tocar otra
    // tecla ni el ratón: así Ctrl+C, AltGr, Ctrl+clic o la tecla que usan los
    // lectores de pantalla para callarse no activan a Braulio por accidente.
    useEffect(() => {
        if (mode !== 'electron' && mode !== 'web-fallback') return undefined;

        let holdTimer = null;
        let holding = false;
        let combo = false;
        const isLeftCtrl = (e) => e.key === 'Control' && e.location === 1;

        const release = () => {
            clearTimeout(holdTimer);
            if (holding) {
                holding = false;
                finishManualCapture();
            }
        };
        const markCombo = () => {
            combo = true;
            clearTimeout(holdTimer);
        };
        const onKeyDown = (e) => {
            if (!isLeftCtrl(e)) {
                markCombo();
                return;
            }
            if (e.repeat) return;
            combo = false;
            clearTimeout(holdTimer);
            holdTimer = setTimeout(() => {
                if (combo) return;
                holding = true;
                startManualCapture({ autoStop: false });
            }, HOLD_TO_TALK_MS);
        };
        const onKeyUp = (e) => { if (isLeftCtrl(e)) release(); };

        window.addEventListener('keydown', onKeyDown, true);
        window.addEventListener('keyup', onKeyUp, true);
        window.addEventListener('pointerdown', markCombo, true);
        window.addEventListener('wheel', markCombo, { capture: true, passive: true });
        window.addEventListener('blur', release);
        return () => {
            clearTimeout(holdTimer);
            window.removeEventListener('keydown', onKeyDown, true);
            window.removeEventListener('keyup', onKeyUp, true);
            window.removeEventListener('pointerdown', markCombo, true);
            window.removeEventListener('wheel', markCombo, true);
            window.removeEventListener('blur', release);
        };
    }, [mode, startManualCapture, finishManualCapture]);

    const startFallbackListening = useCallback(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) return;

        fallbackShouldRunRef.current = true;

        const runContinuous = () => {
            if (!fallbackShouldRunRef.current || capturingCommandRef.current) return;

            const recognition = new SpeechRecognition();
            recognition.lang = 'es-MX';
            recognition.continuous = true;
            recognition.interimResults = false;

            recognition.onresult = (event) => {
                const result = event.results[event.results.length - 1];
                const transcript = result[0].transcript.trim();
                const normalized = normalize(transcript);
                consecutiveFailuresRef.current = 0;

                if (normalized.includes('braulio')) {
                    const afterWake = transcript.slice(normalized.indexOf('braulio') + 'braulio'.length).trim();

                    if (afterWake.length > 2) {
                        recognition.stop();
                        // Comando pegado a la palabra clave: sonidito y pausa YA, luego actúa.
                        beginTurnRef.current?.();
                        playCueRef.current?.('wake');
                        handleCommand(afterWake.replace(/^[,:.]\s*/, ''));
                    } else {
                        capturingCommandRef.current = true;
                        recognition.stop();
                        acknowledgeWake({ dimeDelayMs: 0, onReady: startListeningForCommand });
                    }
                }
            };

            recognition.onerror = (event) => {
                if (FATAL_ERRORS.has(event.error)) {
                    console.error('[Braulio] (fallback) error irrecuperable, deteniendo:', event.error);
                    fallbackShouldRunRef.current = false;
                    setMode('unavailable');
                    return;
                }
                if (event.error === 'no-speech') return;

                console.warn('[Braulio] (fallback) error:', event.error);
                consecutiveFailuresRef.current += 1;
                if (consecutiveFailuresRef.current >= MAX_CONSECUTIVE_FAILURES) {
                    console.error(`[Braulio] (fallback) ${MAX_CONSECUTIVE_FAILURES} fallos seguidos, deteniendo.`);
                    fallbackShouldRunRef.current = false;
                    setMode('unavailable');
                }
            };

            recognition.onend = () => {
                // Igual que al reanudar tras un comando: si esto se reinicia
                // mientras Braulio sigue hablando (p.ej. una respuesta larga
                // cortada por un 'no-speech'), se vuelve a escuchar a sí mismo.
                if (fallbackShouldRunRef.current && !capturingCommandRef.current) {
                    waitUntilNotSpeaking(runContinuous, { floorMs: 250 });
                }
            };

            recognitionRef.current = recognition;
            try {
                recognition.start();
            } catch {
                setTimeout(runContinuous, 500);
            }
        };

        resumeContinuousRef.current = runContinuous;
        runContinuous();
    }, [handleCommand, startListeningForCommand, acknowledgeWake, waitUntilNotSpeaking]);

    useEffect(() => {
        if (mode === 'web-fallback') {
            startFallbackListening();
            return () => {
                fallbackShouldRunRef.current = false;
                resumeContinuousRef.current = null;
                recognitionRef.current?.stop();
            };
        }
    }, [mode, startFallbackListening]);

    // El botón en pantalla: graba hasta que dejes de hablar (sin tener que mantener nada).
    const triggerManuallyElectron = useCallback(() => startManualCapture({ autoStop: true }), [startManualCapture]);

    const triggerManually =
        mode === 'electron' ? triggerManuallyElectron :
            mode === 'web-fallback' ? handleWakeWeb :
                () => {}; // 'electron-loading' / 'unavailable': el botón sale deshabilitado

    return { status, lastCommand, mode, triggerManually };
};

export default useVoiceAssistant;
