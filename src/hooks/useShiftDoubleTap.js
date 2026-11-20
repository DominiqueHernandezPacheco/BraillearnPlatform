import { useEffect, useRef } from 'react';

// Doble toque RÁPIDO de Shift (cualquiera de los dos, dos toques cortos, no
// mantenerlo) — es una tecla grande en la esquina del teclado, fácil de
// encontrar al tacto sin ver la pantalla. Se evitó Ctrl: en algunos equipos
// mantenerlo dispara un gesto propio de Windows (aparece un círculo en
// pantalla) que estorba, y Ctrl ya significa otra cosa si se mantiene
// (hablarle a Braulio, ver useVoiceAssistant.js).
const TAP_MAX_MS = 300;
const DOUBLE_TAP_WINDOW_MS = 500;

const useShiftDoubleTap = (onDoubleTap) => {
    const callbackRef = useRef(onDoubleTap);
    useEffect(() => { callbackRef.current = onDoubleTap; }, [onDoubleTap]);

    useEffect(() => {
        let pressedAt = null;
        let lastTapAt = 0;

        const onKeyDown = (e) => {
            if (e.key !== 'Shift' || e.repeat) return;
            pressedAt = Date.now();
        };
        const onKeyUp = (e) => {
            if (e.key !== 'Shift' || pressedAt === null) return;
            const heldMs = Date.now() - pressedAt;
            pressedAt = null;
            if (heldMs > TAP_MAX_MS) { lastTapAt = 0; return; }

            const now = Date.now();
            if (now - lastTapAt <= DOUBLE_TAP_WINDOW_MS) {
                lastTapAt = 0;
                callbackRef.current?.();
            } else {
                lastTapAt = now;
            }
        };

        window.addEventListener('keydown', onKeyDown);
        window.addEventListener('keyup', onKeyUp);
        return () => {
            window.removeEventListener('keydown', onKeyDown);
            window.removeEventListener('keyup', onKeyUp);
        };
    }, []);
};

export default useShiftDoubleTap;
