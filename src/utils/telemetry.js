import { useSyncExternalStore } from 'react';

// Registro ANÓNIMO de señales de uso, para poder analizar cómo se usa la
// plataforma (velocidad de lectura por línea del display, aciertos por lección,
// latencia de la voz). Reglas:
//   · APAGADO por defecto: solo se registra si la persona lo activa (panel de
//     Accesibilidad → "Datos de uso").
//   · SOLO LOCAL: se guarda en este dispositivo; nada se envía a internet. La
//     persona lo exporta a mano si quiere compartirlo.
//   · SIN CONTENIDO: nunca nombres, textos, transcripciones ni audio. Solo
//     identificadores de cuento/lección, índices, conteos y tiempos. Quien llame
//     a track() no debe pasar texto libre.
//   · El participante es un identificador al azar de esta instalación, no una
//     persona; "Borrar datos" elimina todo lo registrado.

const PREFS_KEY = 'braillearn_telemetry';
const EVENTS_KEY = 'braillearn_telemetry_events';
const MAX_EVENTS = 4000;
const SCHEMA_VERSION = 1;

const randomId = () => (
    typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`
);

const SESSION_ID = randomId(); // uno por carga de la página

const readJson = (key, fallback) => {
    try {
        const raw = JSON.parse(localStorage.getItem(key) || 'null');
        return raw ?? fallback;
    } catch {
        return fallback;
    }
};

let prefs = { enabled: false, participant: randomId(), ...readJson(PREFS_KEY, {}) };
let events = null; // se carga la primera vez que hace falta
let snapshot = { enabled: prefs.enabled, count: 0 };
const listeners = new Set();
let persistTimer = null;

const savePrefs = () => {
    try { localStorage.setItem(PREFS_KEY, JSON.stringify(prefs)); } catch { /* sin almacenamiento */ }
};

const load = () => {
    if (events) return events;
    const saved = readJson(EVENTS_KEY, []);
    events = Array.isArray(saved) ? saved : [];
    snapshot = { enabled: prefs.enabled, count: events.length };
    return events;
};

const publish = () => {
    snapshot = { enabled: prefs.enabled, count: events ? events.length : snapshot.count };
    listeners.forEach((l) => l());
};

// Se guarda en lotes, para no escribir en localStorage a cada evento.
const schedulePersist = () => {
    if (persistTimer) return;
    persistTimer = setTimeout(() => {
        persistTimer = null;
        try { localStorage.setItem(EVENTS_KEY, JSON.stringify(events)); } catch { /* lleno: se pierde el lote */ }
    }, 1000);
};

if (typeof window !== 'undefined') {
    window.addEventListener('pagehide', () => {
        if (!events) return;
        try { localStorage.setItem(EVENTS_KEY, JSON.stringify(events)); } catch { /* sin almacenamiento */ }
    });
}

export function track(type, data = {}) {
    if (!prefs.enabled) return;
    load().push({ t: Date.now(), s: SESSION_ID, p: prefs.participant, type, ...data });
    if (events.length > MAX_EVENTS) events.splice(0, events.length - MAX_EVENTS);
    schedulePersist();
    publish();
}

const sessionStart = () => track('session_start', {
    platform: typeof window !== 'undefined' && window.electronAPI ? 'electron' : 'web',
    schema: SCHEMA_VERSION,
});

export function setTelemetryEnabled(enabled) {
    prefs = { ...prefs, enabled };
    savePrefs();
    if (enabled) sessionStart();
    publish();
}

export function clearTelemetry() {
    events = [];
    try { localStorage.removeItem(EVENTS_KEY); } catch { /* nada que borrar */ }
    publish();
}

// Descarga lo registrado como archivo JSON (lo lee scripts/analyze-usage.mjs).
export function exportTelemetry() {
    const payload = {
        app: 'braillearn',
        schema: SCHEMA_VERSION,
        exportedAt: new Date().toISOString(),
        events: load(),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `braillearn-uso-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
}

const subscribe = (listener) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
};

// { enabled, count } para la interfaz.
export const useTelemetry = () => useSyncExternalStore(subscribe, () => {
    if (!events) load();
    return snapshot;
});

if (prefs.enabled) sessionStart();
