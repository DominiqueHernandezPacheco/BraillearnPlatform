import { useRef, useEffect, useCallback } from 'react';
import { useAudio } from '../context/AudioContext';

// Devuelve una función que espera a que Braulio termine de hablar antes de
// hacer algo — para no cortarlo a media frase cuando lo que sigue (la
// narración del siguiente paso, retomar el micrófono, etc.) le "gana" por
// llegar antes de que termine. `floorMs` es una pausa mínima obligatoria
// aparte de esperar el silencio (útil cuando hace falta, p.ej. un margen de
// hardware); por defecto no hay ninguna, y si ya no está hablando corre YA.
const useWaitUntilNotSpeaking = () => {
    // isSpeaking solo es true mientras hay audio SONANDO en este instante —
    // entre una oración encolada y la siguiente hay un hueco (se está
    // sintetizando la próxima) donde isSpeaking ya volvió a false aunque la
    // respuesta sigue en curso. turnActive cubre TODO el turno, de punta a
    // punta (ver AudioContext.jsx) — sin él, ese hueco dejaba reanudar el
    // reconocimiento de voz del navegador a medio contestar, y se escuchaba
    // a sí mismo (una frase de su propia respuesta terminaba "capturada"
    // como si fuera un comando nuevo del usuario).
    const { isSpeaking, turnActive } = useAudio();
    const isSpeakingRef = useRef(isSpeaking || turnActive);
    useEffect(() => { isSpeakingRef.current = isSpeaking || turnActive; }, [isSpeaking, turnActive]);

    return useCallback((cb, { intervalMs = 250, floorMs = 0 } = {}) => {
        const tick = () => {
            if (!isSpeakingRef.current) { cb(); return; }
            setTimeout(tick, intervalMs);
        };
        if (floorMs > 0) setTimeout(tick, floorMs);
        else tick();
    }, []);
};

export default useWaitUntilNotSpeaking;
