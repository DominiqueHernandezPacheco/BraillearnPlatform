import React, { createContext, useContext, useState, useRef, useEffect } from 'react';

const AudioContext = createContext();

export const AudioProvider = ({ children }) => {
    const [isMuted, setIsMuted] = useState(false);
    const [availableVoices, setAvailableVoices] = useState([]);
    const synthRef = useRef(window.speechSynthesis);

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

    // 1. Cargar las voces cuando el navegador esté listo
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

    // 2. Función inteligente para encontrar la mejor voz.
    //    Prioridad: voz seleccionada manualmente → lista de calidad → primera en español.
    const getBestVoice = () => {
        if (availableVoices.length === 0) return null;

        // Si el usuario eligió una voz específica en el panel, la usamos
        if (selectedVoiceURI) {
            const chosen = availableVoices.find(v => v.voiceURI === selectedVoiceURI);
            if (chosen) return chosen;
        }

        // LISTA DE PRIORIDAD (Buscamos estas voces famosas en orden)
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

        // Si no encuentra ninguna "famosa", devuelve la primera en español
        return availableVoices.find(v => v.lang.startsWith('es')) || null;
    };

    const speak = (text, forceInterrupt = false) => {
        if (isMuted || !text) return;

        if (forceInterrupt) {
            synthRef.current.cancel();
        } else if (synthRef.current.speaking) {
            return;
        }

        const utterance = new SpeechSynthesisUtterance(text);

        const bestVoice = getBestVoice();
        if (bestVoice) {
            utterance.voice = bestVoice;
        }

        utterance.rate  = speechRate; // Usa la velocidad configurada en el panel
        utterance.pitch = 1;
        utterance.lang  = 'es-MX';

        synthRef.current.speak(utterance);
    };

    const toggleMute = () => {
        setIsMuted(prev => {
            const newState = !prev;
            if (newState) synthRef.current.cancel();
            return newState;
        });
    };

    useEffect(() => {
        return () => window.speechSynthesis.cancel();
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
