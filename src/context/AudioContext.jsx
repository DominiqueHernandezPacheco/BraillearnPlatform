import React, { createContext, useContext, useState, useRef, useEffect } from 'react';

const AudioContext = createContext();

export const AudioProvider = ({ children }) => {
    const [isMuted, setIsMuted] = useState(false);
    const [availableVoices, setAvailableVoices] = useState([]);
    const synthRef = useRef(window.speechSynthesis);

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

    // 2. Función inteligente para encontrar la mejor voz
    const getBestVoice = () => {
        if (availableVoices.length === 0) return null;

        // LISTA DE PRIORIDAD (Buscamos estas voces famosas en orden)
        // 'Google' -> Voces de Chrome (muy buenas)
        // 'Microsoft' -> Voces de Edge (excelentes, casi como Azure)
        // 'Paulina' / 'Monica' -> Voces mexicanas/españolas comunes de alta calidad
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

        // Si no encuentra ninguna "famosa", devuelve la primera en español que encuentre
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

        utterance.rate = 1;  // Velocidad
        utterance.pitch = 1; // Tono
        // utterance.lang ya no es tan necesario si asignamos utterance.voice, pero por si acaso:
        utterance.lang = 'es-MX'; 

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
        <AudioContext.Provider value={{ isMuted, toggleMute, speak }}>
            {children}
        </AudioContext.Provider>
    );
};

export const useAudio = () => useContext(AudioContext);