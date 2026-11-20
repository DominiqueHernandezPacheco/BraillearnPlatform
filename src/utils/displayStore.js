import { useSyncExternalStore } from 'react';

// Ajustes de conexión con el display, compartidos por toda la plataforma:
//   mode      'sim' (display simulado en pantalla) | 'real' (el de la API)
//   simCells  celdas del display simulado — el real las informa él mismo
//   token     sesión (JWT) de la cuenta del display; email solo para mostrarlo
//
// El token vive en localStorage (igual que en la herramienta displaySetUp).

const KEY = 'braillearn_display';
const DEFAULTS = { mode: 'sim', simCells: 12, token: null, email: '' };

export const MIN_CELLS = 1;
export const MAX_CELLS = 24;

const read = () => {
    try {
        return { ...DEFAULTS, ...JSON.parse(localStorage.getItem(KEY) || '{}') };
    } catch {
        return DEFAULTS;
    }
};

let state = read();
const listeners = new Set();

const commit = (patch) => {
    state = { ...state, ...patch };
    try {
        localStorage.setItem(KEY, JSON.stringify(state));
    } catch { /* sin almacenamiento: queda en memoria */ }
    listeners.forEach((l) => l());
};

const subscribe = (listener) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
};

export const getDisplaySettings = () => state;
export const useDisplaySettings = () => useSyncExternalStore(subscribe, () => state);

export const displayActions = {
    setMode: (mode) => commit({ mode }),
    setSimCells: (n) => commit({ simCells: Math.min(MAX_CELLS, Math.max(MIN_CELLS, Math.round(n) || DEFAULTS.simCells)) }),
    signIn: (token, email) => commit({ token, email, mode: 'real' }),
    // Sesión vencida o cerrada a mano: se vuelve al display simulado.
    signOut: () => commit({ token: null, email: '', mode: 'sim' }),
};
