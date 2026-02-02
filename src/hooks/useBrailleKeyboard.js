import { useEffect } from 'react';

/**
 * Hook para simular un teclado Perkins.
 * Mapeo:
 * F = Punto 1 (Índice Izquierdo)
 * D = Punto 2 (Medio Izquierdo)
 * S = Punto 3 (Anular Izquierdo)
 * J = Punto 4 (Índice Derecho)
 * K = Punto 5 (Medio Derecho)
 * L = Punto 6 (Anular Derecho)
 */
const useBrailleKeyboard = (onDotToggle, isEnabled = true) => {
  useEffect(() => {
    if (!isEnabled) return;

    const handleKeyDown = (e) => {
      // Evita conflictos si el usuario escribe en un input normal
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      const key = e.key.toLowerCase();
      // Mapeo de teclas a índices de puntos (0-5)
      const keyMap = {
        'f': 0, // Punto 1
        'd': 1, // Punto 2
        's': 2, // Punto 3
        'j': 3, // Punto 4
        'k': 4, // Punto 5
        'l': 5  // Punto 6
      };

      if (keyMap.hasOwnProperty(key)) {
        // Prevenir scroll u otras acciones del navegador
        // (Aunque para estas teclas letras no suele haber conflicto)
        onDotToggle(keyMap[key]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isEnabled, onDotToggle]);
};

export default useBrailleKeyboard;