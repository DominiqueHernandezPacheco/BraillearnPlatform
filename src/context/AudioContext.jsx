import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react';
import { PRELOAD_PHRASES } from '../utils/assistantPhrases';

const AudioContext = createContext();

// Fase 3: la voz de Braulio ahora es Piper (local, offline) en vez del
// motor del navegador — mucho más natural. Si Piper no está disponible por
// alguna razón (todavía descargando la primera vez, plataforma sin el
// binario, error de red), cae de vuelta a speechSynthesis del navegador
// para que la app nunca se quede muda.
async function requestSpeech(text, voiceId, rate) {
    if (window.electronAPI?.synthesizeSpeech) {
        const result = await window.electronAPI.synthesizeSpeech(text, voiceId, rate);
        if (result?.error) throw new Error(result.error);
        return new Blob([result.audio], { type: result.mime || 'audio/wav' });
    }
    const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, voiceId, rate }),
    });
    if (!res.ok) throw new Error(`El servidor de voz respondió ${res.status}`);
    return res.blob();
}

// Frases cortas ya sintetizadas, en memoria: "Dime" y las confirmaciones se
// repiten mucho y así suenan al instante (sin viaje a Electron ni al servidor).
const SHORT_PHRASE_MAX = 200;
const PHRASE_CACHE_MAX = 80;
const phraseCache = new Map();

async function synthesizeWithPiper(text, voiceId, rate) {
    const cacheable = !voiceId && text.length <= SHORT_PHRASE_MAX;
    const key = `${rate}|${text}`;
    if (cacheable && phraseCache.has(key)) return phraseCache.get(key);

    const blob = await requestSpeech(text, voiceId, rate);
    if (cacheable) {
        phraseCache.set(key, blob);
        if (phraseCache.size > PHRASE_CACHE_MAX) phraseCache.delete(phraseCache.keys().next().value);
    }
    return blob;
}

export const AudioProvider = ({ children }) => {
    const [isMuted, setIsMuted] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false); // Braulio está hablando ahora mismo
    const [availableVoices, setAvailableVoices] = useState([]);
    const synthRef = useRef(window.speechSynthesis);
    const currentAudioRef = useRef(null); // el <audio> de Piper que esté sonando
    // Sube en cada speak(): si una síntesis vieja resuelve DESPUÉS de que ya
    // se pidió hablar de nuevo, se descarta en vez de reproducirse encima de
    // la nueva — sin esto, dos audios solapados sonaban como eco.
    const speakTokenRef = useRef(0);

    // ── Nuevas preferencias del panel de accesibilidad (persistidas) ───────────
    const [speechRate, setSpeechRateState] = useState(
        () => parseFloat(localStorage.getItem('braillearn_speechRate')) || 1.0
    );
    const [selectedVoiceURI, setSelectedVoiceURIState] = useState(
        () => localStorage.getItem('braillearn_voiceURI') || ''
    );

    const setSpeechRate = (rate) => {
        setSpeechRateState(rate);
        localStorage.setItem('braillearn_speechRate', String(rate));
    };
    const setSelectedVoiceURI = (uri) => {
        setSelectedVoiceURIState(uri);
        localStorage.setItem('braillearn_voiceURI', uri);
    };
    // ──────────────────────────────────────────────────────────────────────────

    // 1. Cargar las voces del navegador (respaldo si Piper no está disponible)
    useEffect(() => {
        const loadVoices = () => {
            const voices = synthRef.current.getVoices();
            setAvailableVoices(voices);
        };

        loadVoices();
        // Chrome a veces tarda en cargar las voces, por eso escuchamos el evento
        if (window.speechSynthesis.onvoiceschanged !== undefined) {
            window.speechSynthesis.onvoiceschanged = loadVoices;
        }
    }, []);

    // 2. Función inteligente para encontrar la mejor voz del navegador.
    //    Prioridad: voz seleccionada manualmente → lista de calidad → primera en español.
    const getBestBrowserVoice = () => {
        if (availableVoices.length === 0) return null;

        if (selectedVoiceURI) {
            const chosen = availableVoices.find(v => v.voiceURI === selectedVoiceURI);
            if (chosen) return chosen;
        }

        const priorityKeywords = [
            'Dalia',
            'Microsoft Dalia',
            'Google español',
            'Google',
            'Microsoft Sabina', // Voz mexicana de Edge
            'Paulina',          // Voz mexicana de Windows
            'Mexico',
            'Spanish'
        ];

        for (let keyword of priorityKeywords) {
            const found = availableVoices.find(v =>
                v.name.includes(keyword) || v.lang.includes(keyword)
            );
            if (found && found.lang.startsWith('es')) return found;
        }

        return availableVoices.find(v => v.lang.startsWith('es')) || null;
    };

    // Solo la síntesis más reciente puede cambiar el estado "hablando": los
    // eventos tardíos de un audio ya descartado no lo pisan.
    const markSpeaking = useCallback((token, value) => {
        if (speakTokenRef.current === token) setIsSpeaking(value);
    }, []);

    // ── Turno del asistente ────────────────────────────────────────────────────
    // Cuando el usuario dice "Braulio" en plena lección, lo que Braulio estaba
    // diciendo se PAUSA (no se descarta): el asistente escucha, responde o hace
    // lo que se le pidió y, al terminar el turno, la narración continúa justo
    // donde iba. Si el usuario navegó a otra parte, `stop()` la descarta.
    const turnRef = useRef(false);            // hay un turno del asistente en curso
    const turnTimerRef = useRef(null);        // seguro: un turno nunca dura más de 45 s
    const suspendedRef = useRef(null);        // { audio } | { text } — narración pausada
    const heldRef = useRef(null);             // { text } — narración pedida durante el turno
    const inFlightRef = useRef(null);         // texto de una narración que aún se está sintetizando
    const currentTextRef = useRef('');        // última narración normal pedida
    const pendingPriorityRef = useRef(0);     // respuestas del asistente aún en camino
    const resumeWhenIdleRef = useRef(false);
    const speakRef = useRef(null);
    const maybeResumeRef = useRef(() => {});
    const endAssistantTurnRef = useRef(() => {});

    // ¿Está el asistente ocupado con el usuario? Hay turno abierto, una respuesta
    // suya en camino o su voz sonando.
    const assistantIsBusy = useCallback(() => {
        if (turnRef.current || pendingPriorityRef.current > 0) return true;
        const audio = currentAudioRef.current;
        return !!audio && audio.dataset.priority === '1' && !audio.paused && !audio.ended;
    }, []);

    const discardSuspended = useCallback(() => {
        const suspended = suspendedRef.current;
        suspendedRef.current = null;
        if (suspended?.audio) {
            try { URL.revokeObjectURL(suspended.audio.src); } catch { /* ya liberado */ }
        }
    }, []);

    // Pausa lo que esté sonando y lo guarda para retomarlo.
    const suspendCurrent = useCallback(() => {
        const audio = currentAudioRef.current;
        if (audio && !audio.paused && !audio.ended) {
            audio.pause();
            currentAudioRef.current = null;
            discardSuspended();
            // Lo que decía el asistente mismo no se retoma, solo las narraciones.
            if (audio.dataset.priority !== '1') suspendedRef.current = { audio };
        } else if (synthRef.current.speaking) {
            // La voz del navegador no se puede pausar de forma fiable: se corta y
            // se vuelve a decir la frase completa al terminar el turno.
            synthRef.current.cancel();
            discardSuspended();
            if (currentTextRef.current) suspendedRef.current = { text: currentTextRef.current };
        }
        setIsSpeaking(false);
    }, [discardSuspended]);

    const beginAssistantTurn = useCallback(() => {
        clearTimeout(turnTimerRef.current);
        turnTimerRef.current = setTimeout(() => endAssistantTurnRef.current(), 45000);
        if (turnRef.current) return;
        turnRef.current = true;
        resumeWhenIdleRef.current = false;
        // Una narración que todavía se estaba generando también espera su turno.
        if (inFlightRef.current) heldRef.current = { text: inFlightRef.current };
        suspendCurrent();
    }, [suspendCurrent]);

    // Continúa lo pausado cuando ya no hay turno ni respuesta del asistente sonando.
    const maybeResume = useCallback(() => {
        if (!resumeWhenIdleRef.current || turnRef.current || pendingPriorityRef.current > 0) return;
        const playing = currentAudioRef.current;
        if (playing && !playing.paused && !playing.ended) return; // el asistente aún habla
        if (synthRef.current.speaking) return;
        resumeWhenIdleRef.current = false;

        const held = heldRef.current;
        heldRef.current = null;
        if (held) {
            // Llegó una narración nueva durante el turno (p. ej. otro paso): esa manda.
            discardSuspended();
            setTimeout(() => speakRef.current?.(held.text, true), 250);
            return;
        }

        const suspended = suspendedRef.current;
        suspendedRef.current = null;
        if (!suspended) return;
        setTimeout(() => {
            if (turnRef.current) { suspendedRef.current = suspended; resumeWhenIdleRef.current = true; return; }
            if (suspended.audio) {
                const audio = suspended.audio;
                const token = ++speakTokenRef.current;
                currentAudioRef.current = audio;
                audio.onplay = () => markSpeaking(token, true);
                audio.onpause = () => markSpeaking(token, false);
                audio.onended = () => {
                    try { URL.revokeObjectURL(audio.src); } catch { /* ya liberado */ }
                    markSpeaking(token, false);
                };
                audio.play().catch(() => {});
            } else if (suspended.text) {
                speakRef.current?.(suspended.text, true);
            }
        }, 250);
    }, [discardSuspended, markSpeaking]);

    const endAssistantTurn = useCallback(() => {
        clearTimeout(turnTimerRef.current);
        if (!turnRef.current) return;
        turnRef.current = false;
        resumeWhenIdleRef.current = true;
        maybeResumeRef.current();
    }, []);

    useEffect(() => {
        maybeResumeRef.current = maybeResume;
        endAssistantTurnRef.current = endAssistantTurn;
    }, [maybeResume, endAssistantTurn]);

    const speakWithBrowser = useCallback((text) => {
        if (synthRef.current.speaking) synthRef.current.cancel();
        const token = speakTokenRef.current;
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.onstart = () => markSpeaking(token, true);
        utterance.onend = () => { markSpeaking(token, false); maybeResumeRef.current(); };
        utterance.onerror = () => { markSpeaking(token, false); maybeResumeRef.current(); };
        const bestVoice = getBestBrowserVoice();
        if (bestVoice) utterance.voice = bestVoice;
        utterance.rate = speechRate;
        utterance.pitch = 1;
        utterance.lang = 'es-MX';
        synthRef.current.speak(utterance);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [speechRate, selectedVoiceURI, availableVoices, markSpeaking]);

    // `priority: true` = lo dice el asistente (responde al usuario). Hablarle a
    // Braulio pausa la narración; las narraciones normales que lleguen durante
    // ese turno esperan a que termine.
    const speak = useCallback((text, forceInterrupt = false, { priority = false } = {}) => {
        if (isMuted || !text) return;

        // Mientras el asistente le habla al usuario (o está por hacerlo), las
        // narraciones normales esperan: si no, la del paso o pantalla nuevo le
        // pisa la confirmación y no se oye qué respondió Braulio.
        if (!priority && assistantIsBusy()) {
            heldRef.current = { text };
            resumeWhenIdleRef.current = true;
            return;
        }

        const isBusy = currentAudioRef.current && !currentAudioRef.current.paused;
        if (!forceInterrupt && isBusy) return;

        if (priority) {
            if (!turnRef.current) beginAssistantTurn();
            pendingPriorityRef.current += 1;
        } else {
            // Narración nueva: la que estaba pausada ya quedó vieja.
            discardSuspended();
            heldRef.current = null;
            currentTextRef.current = text;
            inFlightRef.current = text;
        }

        if (currentAudioRef.current) {
            currentAudioRef.current.pause();
            currentAudioRef.current = null;
        }
        if (synthRef.current.speaking) synthRef.current.cancel();

        const myToken = ++speakTokenRef.current;

        // La velocidad se le pide a Piper al sintetizar (--length_scale), no
        // se le aplica al audio ya grabado después — estirar/comprimir un WAV
        // con playbackRate sonaba con eco/artefactos.
        synthesizeWithPiper(text, undefined, speechRate)
            .then((blob) => {
                if (inFlightRef.current === text) inFlightRef.current = null;
                if (speakTokenRef.current !== myToken) return; // ya se pidió otra cosa, descartamos esta
                // Llegó cuando el usuario ya le estaba hablando a Braulio: espera su turno.
                if (!priority && assistantIsBusy()) {
                    heldRef.current = { text };
                    resumeWhenIdleRef.current = true;
                    return;
                }
                const url = URL.createObjectURL(blob);
                const audio = new Audio(url);
                audio.dataset.priority = priority ? '1' : '';
                currentAudioRef.current = audio;
                audio.onplay = () => markSpeaking(myToken, true);
                audio.onpause = () => markSpeaking(myToken, false);
                audio.onended = () => {
                    URL.revokeObjectURL(url);
                    markSpeaking(myToken, false);
                    maybeResumeRef.current();
                };
                audio.play().catch(() => speakWithBrowser(text));
            })
            .catch((err) => {
                if (inFlightRef.current === text) inFlightRef.current = null;
                if (speakTokenRef.current !== myToken) return;
                console.warn('[Audio] Piper no disponible, uso la voz del navegador:', err.message);
                speakWithBrowser(text);
            })
            .finally(() => {
                if (priority) {
                    pendingPriorityRef.current = Math.max(0, pendingPriorityRef.current - 1);
                    maybeResumeRef.current();
                }
            });
    }, [isMuted, speechRate, speakWithBrowser, markSpeaking, beginAssistantTurn, discardSuspended, assistantIsBusy]);

    useEffect(() => { speakRef.current = speak; }, [speak]);

    // Sonidito de "te escucho": dos notas que suben, generadas al momento con Web
    // Audio (no dependen de ninguna voz ni de la red), para que haya respuesta
    // inmediata en cuanto se detecta "Braulio", antes de que hable.
    // (Ojo: aquí `AudioContext` es el contexto de React, no el de Web Audio.)
    const cueContextRef = useRef(null);
    const playCue = useCallback((kind = 'wake') => {
        if (isMuted) return;
        try {
            const Ctx = window.AudioContext || window.webkitAudioContext;
            if (!Ctx) return;
            const ctx = (cueContextRef.current ??= new Ctx());
            if (ctx.state === 'suspended') ctx.resume();
            const notes = kind === 'wake' ? [659.25, 880] : [880, 659.25]; // mi → la (sube = "dime")
            const start = ctx.currentTime;
            notes.forEach((freq, i) => {
                const t = start + i * 0.09;
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'sine';
                osc.frequency.value = freq;
                gain.gain.setValueAtTime(0.0001, t);
                gain.gain.linearRampToValueAtTime(0.16, t + 0.015);
                gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.17);
                osc.connect(gain).connect(ctx.destination);
                osc.start(t);
                osc.stop(t + 0.19);
            });
        } catch { /* sin Web Audio: solo se pierde el sonidito */ }
    }, [isMuted]);

    // Precarga las frases fijas del asistente (el servidor las guarda en disco, así
    // que después de la primera vez ni cuestan ni tardan). Se hace al abrir la app,
    // sin estorbar, y otra vez si cambia la velocidad de la voz.
    useEffect(() => {
        if (isMuted) return undefined;
        let cancelled = false;
        const preload = async () => {
            for (const phrase of PRELOAD_PHRASES) {
                if (cancelled) return;
                try { await synthesizeWithPiper(phrase, undefined, speechRate); } catch { /* se generará al usarla */ }
            }
        };
        const timer = setTimeout(preload, 1500);
        return () => { cancelled = true; clearTimeout(timer); };
    }, [isMuted, speechRate]);

    // Corta lo que Braulio esté diciendo (voz de Piper o del navegador), descarta
    // cualquier síntesis que todavía esté en camino y olvida lo que estaba pausado
    // (se llama al cambiar de pantalla: lo pausado ya no aplica).
    const stop = useCallback(() => {
        speakTokenRef.current += 1;
        currentAudioRef.current?.pause();
        currentAudioRef.current = null;
        synthRef.current.cancel();
        discardSuspended();
        heldRef.current = null;
        inFlightRef.current = null;
        resumeWhenIdleRef.current = false;
        setIsSpeaking(false);
    }, [discardSuspended]);

    const toggleMute = () => {
        setIsMuted(prev => {
            const newState = !prev;
            if (newState) {
                synthRef.current.cancel();
                currentAudioRef.current?.pause();
                discardSuspended();
                heldRef.current = null;
                setIsSpeaking(false);
            }
            return newState;
        });
    };

    useEffect(() => {
        return () => {
            window.speechSynthesis.cancel();
            currentAudioRef.current?.pause();
            clearTimeout(turnTimerRef.current);
        };
    }, []);

    return (
        <AudioContext.Provider value={{
            isMuted,
            toggleMute,
            speak,
            stop,
            beginAssistantTurn,
            endAssistantTurn,
            playCue,
            isSpeaking,
            // Nuevos: expuestos para el panel de accesibilidad
            speechRate,
            setSpeechRate,
            selectedVoiceURI,
            setSelectedVoiceURI,
            availableVoices,
        }}>
            {children}
        </AudioContext.Provider>
    );
};

export const useAudio = () => useContext(AudioContext);
