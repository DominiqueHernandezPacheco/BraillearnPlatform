import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

// 1. Creamos el contexto
const AudioContext = createContext();

// 2. Creamos el Provider (el componente que envolverá tu App)
export const AudioProvider = ({ children }) => {
    const [isMuted, setIsMuted] = useState(false);

    // Cancelar voz al desmontar o si se mutea
    useEffect(() => {
        if (isMuted) window.speechSynthesis.cancel();
    }, [isMuted]);

    const toggleMute = () => setIsMuted(prev => !prev);

    // La función SPEAK ahora vive aquí para TODOS
    const speak = useCallback((text, shouldInterrupt = true) => {
        if (isMuted) return;
        
        if (shouldInterrupt) {
            window.speechSynthesis.cancel();
        }
        
        const u = new SpeechSynthesisUtterance(text);
        u.lang = 'es-ES'; // Ojo: Aquí luego pondremos las voces neuronales
        u.rate = 1.0;
        window.speechSynthesis.speak(u);
    }, [isMuted]);

    const cancelSpeech = useCallback(() => {
        window.speechSynthesis.cancel();
    }, []);

    // Valores que todos los componentes podrán usar
    const value = {
        isMuted,
        toggleMute,
        speak,
        cancelSpeech
    };

    return <AudioContext.Provider value={value}>{children}</AudioContext.Provider>;
};

// 3. Hook personalizado para usarlo fácil
export const useAudio = () => {
    const context = useContext(AudioContext);
    if (!context) {
        throw new Error("useAudio debe usarse dentro de un AudioProvider");
    }
    return context;
};