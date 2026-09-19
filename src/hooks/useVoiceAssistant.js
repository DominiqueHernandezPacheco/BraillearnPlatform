import { useState, useEffect, useRef, useCallback } from 'react';
import { useAudio } from '../context/AudioContext';

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
    const { speak } = useAudio();
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

    const handleCommand = useCallback(async (transcript) => {
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

        const unsubWake = window.electronAPI.onWakeWord(() => {
            speakRef.current('Dime', true);
            setStatus('listening');
        });
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
    }, [mode, handleCommand]);

    const triggerManuallyElectron = useCallback(() => {
        // No hay forma de "forzar" el wake word local desde aquí todavía;
        // esto es principalmente útil en modo web-fallback.
        speakRef.current('Todavía no puedo activarme manualmente en este modo, di "Braulio".', true);
    }, []);

    // ── Modo web-fallback (reconocimiento continuo del navegador) ──────
    const startListeningForCommand = useCallback(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            speakRef.current('No puedo escuchar comandos todavía, falta configurar el reconocimiento de voz.', true);
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
        speakRef.current('Dime', true);
        setTimeout(startListeningForCommand, 400);
    }, [startListeningForCommand]);

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
                        handleCommand(afterWake.replace(/^[,:.]\s*/, ''));
                    } else {
                        capturingCommandRef.current = true;
                        recognition.stop();
                        speakRef.current('Dime', true);
                        setStatus('listening');
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
    }, [handleCommand, startListeningForCommand]);

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

    const triggerManually =
        mode === 'electron' ? triggerManuallyElectron :
            mode === 'web-fallback' ? handleWakeWeb :
                () => {}; // 'electron-loading' / 'unavailable': el botón sale deshabilitado

    return { status, lastCommand, mode, triggerManually };
};

export default useVoiceAssistant;
