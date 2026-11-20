import { displayActions, getDisplaySettings } from './displayStore';

// Cliente de la API del display (braille_translate). Los mismos endpoints que
// usa la herramienta displaySetUp:
//   POST /users/login      form (username, password)  -> { access_token }
//   GET  /device/status    -> { connected, cells, current_line, total_lines }
//   POST /device/next | /device/prev | /device/off
//   POST /traducir         manda el texto; el display lo parte en líneas
//
// Ojo: lo que tarda la API en contestar /traducir, /device/next y /device/prev
// es lo que tarda el display en FORMAR la línea (espera su "done").

export const API_URL = (
    (typeof localStorage !== 'undefined' && localStorage.getItem('braillearn_api_url'))
    || import.meta.env.VITE_API_URL
    || 'https://api.braillearn.app'
).replace(/\/$/, '');

export class DisplayApiError extends Error {
    constructor(status, message) {
        super(message);
        this.status = status;
    }
}

async function call(path, { method = 'GET', query, json, form, timeout = 15000, auth = true } = {}) {
    const url = new URL(`${API_URL}${path}`);
    if (query) Object.entries(query).forEach(([k, v]) => url.searchParams.set(k, v));

    const headers = {};
    const token = getDisplaySettings().token;
    if (auth && token) headers.Authorization = `Bearer ${token}`;

    let body;
    if (form) {
        headers['Content-Type'] = 'application/x-www-form-urlencoded';
        body = new URLSearchParams(form);
    } else if (json) {
        headers['Content-Type'] = 'application/json';
        body = JSON.stringify(json);
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);
    let res;
    try {
        res = await fetch(url, { method, headers, body, signal: controller.signal });
    } catch (error) {
        throw new DisplayApiError(0, error.name === 'AbortError' ? 'El servidor tardó demasiado en contestar.' : 'No pude conectar con el servidor.');
    } finally {
        clearTimeout(timer);
    }

    const data = await res.json().catch(() => null);
    if (res.status === 401 && auth) {
        displayActions.signOut();
        throw new DisplayApiError(401, 'Tu sesión venció. Inicia sesión otra vez.');
    }
    if (!res.ok) {
        const detail = typeof data?.detail === 'string' ? data.detail : `El servidor respondió ${res.status}.`;
        throw new DisplayApiError(res.status, detail);
    }
    return data ?? {};
}

export const displayClient = {
    login: async (email, password) => {
        const data = await call('/users/login', { method: 'POST', form: { username: email, password }, auth: false });
        return data.access_token;
    },

    getStatus: () => call('/device/status'),
    nextLine: () => call('/device/next', { method: 'POST', timeout: 130000 }),
    prevLine: () => call('/device/prev', { method: 'POST', timeout: 130000 }),
    off: () => call('/device/off', { method: 'POST' }),

    // No sé qué versión del backend está desplegada: una espera el texto en la
    // URL (?text=) y otra en el cuerpo JSON junto con char_qty, la cantidad de
    // celdas por línea. Se mandan ambos y se prueba con y sin la barra final.
    sendText: async (text, cells) => {
        const options = { method: 'POST', query: { text, char_qty: cells }, json: { text, char_qty: cells }, timeout: 130000 };
        try {
            return await call('/traducir/', options);
        } catch (error) {
            if (![0, 404, 405].includes(error.status)) throw error;
            return call('/traducir', options);
        }
    },
};
