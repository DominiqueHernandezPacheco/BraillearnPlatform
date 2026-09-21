import { useState, useEffect, useRef, useCallback } from 'react';
import { useAudio } from '../context/AudioContext';
import { PHRASES } from '../utils/assistantPhrases';

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

const COMMAND_TIMEOUT_MS = 6000;

// Cuánto espera el "Dime" hablado por si el comando llega pegado a "Braulio"
// (en ese caso los dos eventos llegan casi a la vez, en pocos milisegundos).
const DIME_DELAY_MS = 120;

// Mantener Ctrl izquierdo este tiempo (solo, sin otra tecla) activa a Braulio.
const HOLD_TO_TALK_MS = 350;
// Pausa entre el sonidito y el inicio de la grabación, para que no se grabe el sonidito.
const CAPTURE_START_DELAY_MS = 220;

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
    const { speak, beginAssistantTurn, playCue } = useAudio();
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
    const playCueRef = useRef(playCue);
    useEffect(() => { playCueRef.current = playCue; }, [playCue]);
    const dimeTimerRef = useRef(null);

    // Respuesta inmediata en cuanto se oye "Braulio": el sonidito, la pausa de lo
    // que estuviera diciendo y el estado "escuchando". El "Dime" hablado sale un
    // instante después y SOLO si no vino ya el comando pegado ("Braulio, ve a
    // cursos"): en ese caso decir "Dime" estorbaría a la respuesta.
    const acknowledgeWake = useCallback(({ dimeDelayMs = DIME_DELAY_MS } = {}) => {
        beginTurnRef.current?.();
        playCueRef.current?.('wake');
        setStatus('listening');
        clearTimeout(dimeTimerRef.current);
        dimeTimerRef.current = setTimeout(
            () => speakRef.current(PHRASES.dime, true, { priority: true }),
            dimeDelayMs,
        );
    }, []);

    // Captura a mano en curso (tecla o botón) — ver "Activar a mano" más abajo.
    const captureActiveRef = useRef(false);   // hay una captura en curso o por empezar
    const captureStartedRef = useRef(false);  // el micrófono ya empezó a grabar
    const captureTimerRef = useRef(null);

    const handleCommand = useCallback(async (transcript) => {
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


    // ── Modo web-fallback (reconocimiento continuo del navegador) ──────
    const startListeningForCommand = useCallback(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            speakRef.current('No puedo escuchar comandos todavía, falta configurar el reconocimiento de voz.', true, { priority: true });
            return;
        }
        const recognition = new SpeechRecognition();
        recognition.lang = 'es-MX';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        capturingCommandRef.current = true;
        const timeout = setTimeout(() => recognition.stop(), COMMAND_TIMEOUT_MS);

        recognition.onresult = (event) => {
            clearTimeout(timeout);
            handleCommand(event.results[0][0].transcript.trim());
        };
        recognition.onerror = (event) => {
            clearTimeout(timeout);
            console.error('[Braulio] Error de reconocimiento:', event.error);
            setStatus('idle');
        };
        recognition.onend = () => {
            clearTimeout(timeout);
            capturingCommandRef.current = false;
            setStatus((prev) => (prev === 'listening' ? 'idle' : prev));
            if (fallbackShouldRunRef.current && resumeContinuousRef.current) {
                setTimeout(resumeContinuousRef.current, 250);
            }
        };

        recognitionRef.current = recognition;
        setStatus('listening');
        recognition.start();
    }, [handleCommand]);

    const handleWakeWeb = useCallback(() => {
        acknowledgeWake({ dimeDelayMs: 0 });
        setTimeout(startListeningForCommand, 400);
    }, [startListeningForCommand, acknowledgeWake]);

    // ── Activar a mano: botón en pantalla o mantener Ctrl izquierdo ────────────
    // Sin audífonos el micrófono oye a la vez la voz de Braulio y la tuya, y la
    // palabra clave no siempre logra "cortarlo". Con la tecla no hace falta: al
    // pulsarla Braulio calla al instante y el micrófono queda solo para ti.
    // (Modo push-to-talk: mantienes para hablar, sueltas para que procese.)
    const modeRef = useRef(mode);
    useEffect(() => { modeRef.current = mode; }, [mode]);

    // Empieza una captura. autoStop: corta sola al dejar de hablar (botón).
    const startManualCapture = useCallback(({ autoStop }) => {
        if (captureActiveRef.current) return;
        captureActiveRef.current = true;
        captureStartedRef.current = false;
        clearTimeout(dimeTimerRef.current);
        beginTurnRef.current?.();     // calla a Braulio / pausa la lección
        playCueRef.current?.('wake');
        setStatus('listening');

        if (modeRef.current === 'web-fallback') {
            // Navegador: se detiene la escucha continua y se abre la del comando.
            capturingCommandRef.current = true;
            recognitionRef.current?.stop();
            captureTimerRef.current = setTimeout(() => {
                captureStartedRef.current = true;
                startListeningForCommand();
            }, CAPTURE_START_DELAY_MS + 130);
            return;
        }

        // Electron: un instante para que el sonidito no se cuele en la grabación.
        captureTimerRef.current = setTimeout(async () => {
            let res;
            try {
                res = await window.electronAPI.startVoiceCapture?.({ autoStop });
            } catch (err) {
                res = { ok: false, reason: err?.message };
            }
            if (res?.ok) {
                captureStartedRef.current = true;
                return;
            }
            captureActiveRef.current = false;
            setStatus('idle');
            speakRef.current(res?.reason || PHRASES.noMic, true, { priority: true });
        }, CAPTURE_START_DELAY_MS);
    }, [startListeningForCommand]);

    // Suelta la tecla: termina de grabar y procesa lo que dijiste.
    const finishManualCapture = useCallback(() => {
        if (!captureActiveRef.current) return;
        captureActiveRef.current = false;
        const started = captureStartedRef.current;
        captureStartedRef.current = false;

        if (!started) {
            // Soltó antes de que empezara a grabar: no hay nada que procesar.
            clearTimeout(captureTimerRef.current);
            if (modeRef.current === 'web-fallback') {
                capturingCommandRef.current = false;
                resumeContinuousRef.current?.();
            }
            setStatus('idle');
            return;
        }
        setStatus('processing');
        if (modeRef.current === 'web-fallback') recognitionRef.current?.stop();
        else window.electronAPI.stopVoiceCapture?.();
    }, []);

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
                        acknowledgeWake({ dimeDelayMs: 0 });
                        setTimeout(startListeningForCommand, 500);
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
                if (fallbackShouldRunRef.current && !capturingCommandRef.current) {
                    setTimeout(runContinuous, 250);
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
    }, [handleCommand, startListeningForCommand, acknowledgeWake]);

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
