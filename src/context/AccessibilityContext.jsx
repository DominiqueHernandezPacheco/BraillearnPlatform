import React, { createContext, useContext, useState, useEffect } from 'react';

const AccessibilityContext = createContext();

const STORAGE_KEY = 'braillearn_a11y';

const DEFAULT_PREFS = {
    fontScale:     1,       // 0.875 | 1 | 1.125 | 1.25
    reduceMotion:  false,
    highContrast:  false,
};

export const AccessibilityProvider = ({ children }) => {
    // Carga las preferencias guardadas (mismo patrón que useProgress)
    const [prefs, setPrefs] = useState(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            return saved ? { ...DEFAULT_PREFS, ...JSON.parse(saved) } : DEFAULT_PREFS;
        } catch {
            return DEFAULT_PREFS;
        }
    });

    // Persiste cada vez que cambian
    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    }, [prefs]);

    // Escala de fuente: afecta TODOS los rem de Tailwind porque
    // Tailwind usa rem relativos al <html>, y aquí lo modificamos.
    useEffect(() => {
        document.documentElement.style.fontSize = `${prefs.fontScale * 100}%`;
    }, [prefs.fontScale]);

    // Reducción de movimiento manual: añade/quita la clase .reduce-motion
    // en <html>. Las reglas CSS en index.css se encargan del resto.
    useEffect(() => {
        document.documentElement.classList.toggle('reduce-motion', prefs.reduceMotion);
    }, [prefs.reduceMotion]);

    // Alto contraste: la clase va en <html> para que las variables de color
    // (ver index.css → .high-contrast) alcancen también al fondo del <body>.
    useEffect(() => {
        document.documentElement.classList.toggle('high-contrast', prefs.highContrast);
    }, [prefs.highContrast]);

    // Helpers tipados para que los consumidores no toquen setPrefs directamente
    const setFontScale    = (v) => setPrefs(p => ({ ...p, fontScale: v }));
    const setReduceMotion = (v) => setPrefs(p => ({ ...p, reduceMotion: v }));
    const setHighContrast = (v) => setPrefs(p => ({ ...p, highContrast: v }));

    const resetAll = () => {
        setPrefs(DEFAULT_PREFS);
        // Limpia también las claves de audio para un reset completo
        localStorage.removeItem('braillearn_speechRate');
        localStorage.removeItem('braillearn_voiceURI');
    };

    return (
        <AccessibilityContext.Provider value={{
            fontScale:     prefs.fontScale,
            reduceMotion:  prefs.reduceMotion,
            highContrast:  prefs.highContrast,
            setFontScale,
            setReduceMotion,
            setHighContrast,
            resetAll,
        }}>
            {children}
        </AccessibilityContext.Provider>
    );
};

export const useAccessibility = () => useContext(AccessibilityContext);
