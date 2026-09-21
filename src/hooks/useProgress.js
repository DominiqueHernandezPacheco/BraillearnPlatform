import { useCallback, useSyncExternalStore } from 'react';

// Progreso de aprendizaje, compartido por toda la plataforma.
//
// Antes cada componente que llamaba a useProgress() creaba su PROPIA copia
// del estado (leída una sola vez de localStorage), así que App.jsx —y con
// él "llévame a mi última lección" por voz— veía datos desactualizados hasta
// recargar. Ahora es un almacén único a nivel de módulo; todos los hooks se
// suscriben al mismo estado, y otra pestaña también lo mantiene al día.
//
// Forma guardada en localStorage (compatible con versiones anteriores):
//   completedLessons: number[]            ids de módulos terminados
//   lastLesson:       number | null       id del último módulo abierto
//   stepProgress:     { [moduleId]: n }   paso más lejano alcanzado (índice)

const STORAGE_KEY = 'braillearn_progress';
const EMPTY = { completedLessons: [], lastLesson: null, stepProgress: {} };

const read = () => {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? { ...EMPTY, ...JSON.parse(raw) } : EMPTY;
    } catch {
        return EMPTY;
    }
};

let state = read();
const listeners = new Set();

const commit = (next) => {
    if (next === state) return;
    state = next;
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
        /* sin almacenamiento disponible: el estado sigue vivo en memoria */
    }
    listeners.forEach((l) => l());
};

const subscribe = (listener) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
};
const getSnapshot = () => state;

if (typeof window !== 'undefined') {
    window.addEventListener('storage', (e) => {
        if (e.key === STORAGE_KEY) {
            state = read();
            listeners.forEach((l) => l());
        }
    });
}

const markLessonComplete = (moduleId) => {
    if (state.completedLessons.includes(moduleId)) return;
    commit({ ...state, completedLessons: [...state.completedLessons, moduleId] });
};

const updateLastLesson = (moduleId) => {
    if (state.lastLesson === moduleId) return;
    commit({ ...state, lastLesson: moduleId });
};

// Guarda el paso más lejano alcanzado dentro de un módulo (para "continuar").
const saveStep = (moduleId, stepIndex) => {
    const previous = state.stepProgress[moduleId] ?? -1;
    if (stepIndex <= previous) return;
    commit({ ...state, stepProgress: { ...state.stepProgress, [moduleId]: stepIndex } });
};

// Tras terminar un módulo, el siguiente intento vuelve a empezar desde el paso 1.
const clearSteps = (moduleId) => {
    if (!(moduleId in state.stepProgress)) return;
    const { [moduleId]: _removed, ...rest } = state.stepProgress;
    commit({ ...state, stepProgress: rest });
};

export const useProgress = () => {
    const snapshot = useSyncExternalStore(subscribe, getSnapshot);

    const getPercentage = useCallback(
        (totalModules) => {
            if (!totalModules) return 0;
            return Math.round((snapshot.completedLessons.length / totalModules) * 100);
        },
        [snapshot.completedLessons],
    );

    return {
        completedLessons: snapshot.completedLessons,
        lastLesson: snapshot.lastLesson,
        stepProgress: snapshot.stepProgress,
        markLessonComplete,
        updateLastLesson,
        saveStep,
        clearSteps,
        getPercentage,
    };
};
