import { SFX } from '../data/sfxCatalog';

// Efectos de sonido de los cuentos: grabaciones realistas guardadas como
// archivos en src/assets/sfx/<nombre>.mp3 (se generan una sola vez con
// `npm run sfx:generate`, ver src/data/sfxCatalog.js). Vite los empaqueta, así
// que suenan igual en la web y en Electron, sin red. Si falta el archivo de un
// efecto, simplemente no suena.

const files = import.meta.glob('../assets/sfx/*.mp3', { eager: true, query: '?url', import: 'default' });

let ctx = null;
const buffers = new Map(); // nombre -> Promise<AudioBuffer | null>
const playing = new Set(); // { source, gain } sonando ahora mismo

const getCtx = () => {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return null;
    ctx ??= new Ctx();
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
};

function load(name) {
    if (buffers.has(name)) return buffers.get(name);
    const url = files[`../assets/sfx/${name}.mp3`];
    if (!url) return null;
    const c = getCtx();
    if (!c) return null;
    const pending = fetch(url)
        .then((res) => res.arrayBuffer())
        .then((data) => c.decodeAudioData(data))
        .catch(() => null);
    buffers.set(name, pending);
    return pending;
}

// Descarga y decodifica de antemano los efectos de un cuento, para que suenen
// justo en el momento (y no un instante después).
export function preloadStorySfx(names) {
    new Set(names).forEach((name) => load(name));
}

export function playStorySfx(name) {
    const pending = load(name);
    if (!pending) return;
    pending.then((buffer) => {
        const c = getCtx();
        if (!buffer || !c) return;
        const source = c.createBufferSource();
        source.buffer = buffer;
        const gain = c.createGain();
        gain.gain.value = SFX[name]?.volume ?? 0.7;
        source.connect(gain).connect(c.destination);
        const entry = { source, gain };
        playing.add(entry);
        source.onended = () => playing.delete(entry);
        source.start();
    });
}

// Corta con un fundido lo que esté sonando (al pausar, cambiar de modo o salir).
export function stopStorySfx() {
    const c = ctx;
    playing.forEach(({ source, gain }) => {
        try {
            if (c) {
                gain.gain.setValueAtTime(gain.gain.value, c.currentTime);
                gain.gain.linearRampToValueAtTime(0.0001, c.currentTime + 0.2);
            }
            source.stop((c?.currentTime ?? 0) + 0.25);
        } catch { /* ya terminó */ }
    });
    playing.clear();
}
