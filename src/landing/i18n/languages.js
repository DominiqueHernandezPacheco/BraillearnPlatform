// Idiomas disponibles. `native` es como se muestra en el selector (en su propio
// idioma); `locale` se usa para formatear números.
export const LANGUAGES = [
    { code: 'es', native: 'Español', short: 'ES', locale: 'es-MX' },
    { code: 'en', native: 'English', short: 'EN', locale: 'en-US' },
    { code: 'fr', native: 'Français', short: 'FR', locale: 'fr-FR' },
    { code: 'it', native: 'Italiano', short: 'IT', locale: 'it-IT' },
    { code: 'ko', native: '한국어', short: 'KO', locale: 'ko-KR' },
];

export const DEFAULT_LANGUAGE = 'es';
const STORAGE_KEY = 'braillearn-landing-lang';

export const isSupported = (code) => LANGUAGES.some((lang) => lang.code === code);
export const localeFor = (code) => LANGUAGES.find((lang) => lang.code === code)?.locale ?? 'es-MX';

export function saveLanguage(code) {
    try {
        window.localStorage.setItem(STORAGE_KEY, code);
    } catch {
        // Sin almacenamiento (modo privado, etc.): el idioma vale solo para esta visita.
    }
}

// Prioridad: ?lang=xx en la URL → la última elección guardada → idioma del navegador → español.
export function detectLanguage() {
    try {
        const fromUrl = new URLSearchParams(window.location.search).get('lang');
        if (isSupported(fromUrl)) return fromUrl;
    } catch {
        // URL no legible: se sigue con las demás fuentes.
    }
    try {
        const stored = window.localStorage.getItem(STORAGE_KEY);
        if (isSupported(stored)) return stored;
    } catch {
        // Sin almacenamiento: se sigue con el idioma del navegador.
    }
    const browser = (navigator.languages?.[0] ?? navigator.language ?? '').slice(0, 2).toLowerCase();
    return isSupported(browser) ? browser : DEFAULT_LANGUAGE;
}
