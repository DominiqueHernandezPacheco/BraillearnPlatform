import { createContext, useContext } from 'react';

// true cuando hay que evitar el movimiento decorativo: preferencia del sistema
// (prefers-reduced-motion) o el interruptor "Reducir animaciones" del navbar.
export const CalmMotionContext = createContext(false);

export const useCalmMotion = () => useContext(CalmMotionContext);
