import { useSyncExternalStore } from 'react';

// Estado EFÍMERO (no se guarda en localStorage, se pierde al recargar) de la
// lección que se está viendo ahora mismo — solo mientras dura la sesión.
//
// Existe para que Braulio pueda contestar preguntas de contexto como
// "¿cuánto me falta?" o "¿en qué capítulo voy?" sin que cada componente tenga
// que pasarle esta información a mano por props hasta App.jsx. CourseSection
// es quien la actualiza (ver setActiveLesson); App.jsx solo la lee con el
// hook de abajo para armar el contexto que le manda a Claude.

let state = null;
const listeners = new Set();

const emit = () => listeners.forEach((listener) => listener());

/**
 * @param {{
 *   moduleTitle: string, moduleIndex: number, moduleTotal: number, isRandom: boolean,
 *   chapterTitle?: string, chapterIndex?: number, chapterTotal?: number,
 *   stepIndex: number, stepTotal: number, stepTitle: string, stepType: string,
 * } | null} next
 */
export function setActiveLesson(next) {
    state = next;
    emit();
}

export function clearActiveLesson() {
    if (state === null) return;
    state = null;
    emit();
}

export function getActiveLesson() {
    return state;
}

export function useActiveLesson() {
    return useSyncExternalStore(
        (listener) => {
            listeners.add(listener);
            return () => listeners.delete(listener);
        },
        () => state,
        () => null,
    );
}
