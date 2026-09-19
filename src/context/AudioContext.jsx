import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react';

const AudioContext = createContext();

// Fase 3: la voz de Braulio ahora es Piper (local, offline) en vez del
// motor del navegador — mucho más natural. Si Piper no está disponible por
// alguna razón (todavía descargando la primera vez, plataforma sin el
// binario, error de red), cae de vuelta a speechSynthesis del navegador
// para que la app nunca se quede muda.
async function synthesizeWithPiper(text, voiceId, rate) {
    if (window.electronAPI?.synthesizeSpeech) {
        const result = await window.electronAPI.synthesizeSpeech(text, voiceId, rate);
        if (result?.error) throw new Error(result.error);
        return new Blob([result.audio], { type: 'audio/wav' });
    }
    const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, voiceId, rate }),
    });
    if (!res.ok) throw new Error(`El servidor de voz respondió ${res.status}`);
    return res.blob();
}

export const AudioProvider = ({ children }) => {
    const [isMuted, setIsMuted] = useState(false);
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

    const speakWithBrowser = useCallback((text) => {
        if (synthRef.current.speaking) synthRef.current.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        const bestVoice = getBestBrowserVoice();
        if (bestVoice) utterance.voice = bestVoice;
        utterance.rate = speechRate;
        utterance.pitch = 1;
        utterance.lang = 'es-MX';
        synthRef.current.speak(utterance);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [speechRate, selectedVoiceURI, availableVoices]);

    const speak = useCallback((text, forceInterrupt = false) => {
        if (isMuted || !text) return;

        const isBusy = currentAudioRef.current && !currentAudioRef.current.paused;
        if (!forceInterrupt && isBusy) return;

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
                if (speakTokenRef.current !== myToken) return; // ya se pidió otra cosa, descartamos esta
                const url = URL.createObjectURL(blob);
                const audio = new Audio(url);
                currentAudioRef.current = audio;
                audio.onended = () => URL.revokeObjectURL(url);
                audio.play().catch(() => speakWithBrowser(text));
            })
            .catch((err) => {
                if (speakTokenRef.current !== myToken) return;
                console.warn('[Audio] Piper no disponible, uso la voz del navegador:', err.message);
                speakWithBrowser(text);
            });
    }, [isMuted, speechRate, speakWithBrowser]);

    const toggleMute = () => {
        setIsMuted(prev => {
            const newState = !prev;
            if (newState) {
                synthRef.current.cancel();
                currentAudioRef.current?.pause();
            }
            return newState;
        });
    };

    useEffect(() => {
        return () => {
            window.speechSynthesis.cancel();
            currentAudioRef.current?.pause();
        };
    }, []);

    return (
        <AudioContext.Provider value={{
            isMuted,
            toggleMute,
            speak,
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
