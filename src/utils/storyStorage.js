// Preferencias del lector y progreso de cada cuento, en localStorage.

const PREFS_KEY = 'braillearn_story_prefs';
const PROGRESS_KEY = 'braillearn_story_progress';

const readJson = (key, fallback) => {
    try {
        const raw = JSON.parse(localStorage.getItem(key) || 'null');
        return raw && typeof raw === 'object' ? raw : fallback;
    } catch {
        return fallback;
    }
};

const writeJson = (key, value) => {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch { /* sin almacenamiento: no se guarda */ }
};

// mode: 'listen' (Braulio lee) | 'touch' (con los dedos, al ritmo del display)
// sfx: efectos de sonido · haptic: vibración · display: al escuchar, mandar también la escena al display
const DEFAULT_PREFS = { mode: 'listen', sfx: true, haptic: true, display: false };

export const loadStoryPrefs = () => ({ ...DEFAULT_PREFS, ...readJson(PREFS_KEY, {}) });
export const saveStoryPrefs = (prefs) => writeJson(PREFS_KEY, prefs);

// { [storyId]: { scene: number, done: boolean } }
export const loadStoryProgress = () => readJson(PROGRESS_KEY, {});

export const saveStoryProgress = (storyId, patch) => {
    const all = loadStoryProgress();
    writeJson(PROGRESS_KEY, { ...all, [storyId]: { scene: 0, done: false, ...all[storyId], ...patch } });
};
