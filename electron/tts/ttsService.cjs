// Punto único de entrada de la voz de "Braulio". Elige el motor y añade:
//   · caché en disco: cada frase se genera UNA sola vez (ahorra créditos y
//     espera; las narraciones de las lecciones se repiten siempre igual);
//   · presupuesto mensual de caracteres, para no agotar el plan gratis;
//   · respaldo automático a Piper (local) si ElevenLabs falla o se acaba.
//
// Variables (.env):
//   ELEVENLABS_API_KEY            clave de ElevenLabs
//   ELEVENLABS_VOICE_ID           id de la voz elegida (ver `npm run tts:audition`)
//   TTS_PROVIDER                  "elevenlabs" | "piper" (por defecto: elevenlabs
//                                 si hay clave y voz; si no, piper)
//   ELEVENLABS_MONTHLY_BUDGET     caracteres/mes que se permite gastar (def. 9000
//                                 de los 10 000 del plan gratis)
//   TTS_CACHE_DIR                 carpeta de la caché (def. .tts-cache o userData)

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const piper = require('./piperService.cjs');
const eleven = require('./elevenlabsService.cjs');

const MAX_CLOUD_CHARS = 1500; // frases más largas van directo a Piper

function cacheDir() {
    if (process.env.TTS_CACHE_DIR) return process.env.TTS_CACHE_DIR;
    try {
        // App empaquetada: carpeta de datos del usuario (el proyecto va dentro de un
        // paquete de solo lectura). En desarrollo se usa .tts-cache del proyecto, la
        // misma que llena `npm run tts:pregenerate`.
        const { app } = require('electron');
        if (app?.isPackaged && app.getPath) return path.join(app.getPath('userData'), 'tts-cache');
    } catch { /* fuera de Electron */ }
    return path.join(__dirname, '..', '..', '.tts-cache');
}

function provider() {
    const wanted = (process.env.TTS_PROVIDER || '').toLowerCase();
    if (wanted === 'piper') return 'piper';
    const ready = eleven.isConfigured() && !!process.env.ELEVENLABS_VOICE_ID;
    return ready ? 'elevenlabs' : 'piper';
}

// ── Presupuesto mensual (contador local, sincronizado con el saldo real) ─────
const monthKey = () => new Date().toISOString().slice(0, 7);
const usageFile = () => path.join(cacheDir(), 'usage.json');
let usage = null;
let usageSynced = false;

function loadUsage() {
    if (usage) return usage;
    try {
        const saved = JSON.parse(fs.readFileSync(usageFile(), 'utf8'));
        usage = saved.month === monthKey() ? saved : { month: monthKey(), chars: 0 };
    } catch {
        usage = { month: monthKey(), chars: 0 };
    }
    return usage;
}

function saveUsage() {
    try {
        fs.mkdirSync(cacheDir(), { recursive: true });
        fs.writeFileSync(usageFile(), JSON.stringify(usage));
    } catch { /* la caché es opcional */ }
}

// Una vez por proceso: si la cuenta ya gastó créditos por otro lado (la web
// de ElevenLabs, las pruebas de voces), toma el número real.
async function syncUsage() {
    if (usageSynced) return;
    usageSynced = true;
    try {
        const remote = await eleven.getUsage();
        const u = loadUsage();
        if (typeof remote.used === 'number' && remote.used > u.chars) {
            u.chars = remote.used;
            saveUsage();
        }
    } catch { /* sin permiso de lectura de saldo: se queda el contador local */ }
}

const budget = () => Number(process.env.ELEVENLABS_MONTHLY_BUDGET) || 9000;

// ── Caché ────────────────────────────────────────────────────────────────────
// Dos modelos: el de calidad máxima se usa para las narraciones fijas (se
// generan por adelantado con `npm run tts:pregenerate`) y el rápido para todo lo
// que se dice al momento (respuestas de Claude, avisos, datos curiosos).
const qualityModel = () => process.env.ELEVENLABS_MODEL || eleven.DEFAULT_MODEL;
const liveModel = () => process.env.ELEVENLABS_LIVE_MODEL || eleven.FAST_MODEL;

function cacheKey(text, voiceId, rate, model) {
    const speed = Math.min(1.2, Math.max(0.7, Number(rate) || 1)).toFixed(2);
    return crypto
        .createHash('sha1')
        .update([model, voiceId, speed, JSON.stringify(eleven.VOICE_SETTINGS), text].join('|'))
        .digest('hex');
}

const cacheFile = (text, voiceId, rate, model) =>
    path.join(cacheDir(), `${cacheKey(text, voiceId, rate, model)}.mp3`);

// `quality: true` fuerza el modelo de calidad máxima (lo usa la pregeneración).
async function synthesizeCloud(text, rate, { quality = false } = {}) {
    const voiceId = process.env.ELEVENLABS_VOICE_ID;
    const model = quality ? qualityModel() : liveModel();

    // Si la frase ya se generó con calidad máxima, se usa esa; si no, la del modelo rápido.
    for (const m of [qualityModel(), liveModel()]) {
        const hit = cacheFile(text, voiceId, rate, m);
        if (fs.existsSync(hit)) return { audio: fs.readFileSync(hit), mime: 'audio/mpeg', cached: true };
    }

    await syncUsage();
    const u = loadUsage();
    if (u.chars + text.length > budget()) {
        const e = new Error(`Presupuesto mensual de voz agotado (${u.chars}/${budget()} caracteres).`);
        e.code = 'budget';
        throw e;
    }

    const audio = await eleven.synthesize(text, { voiceId, rate, modelId: model });
    u.chars += text.length;
    saveUsage();
    try {
        fs.mkdirSync(cacheDir(), { recursive: true });
        fs.writeFileSync(cacheFile(text, voiceId, rate, model), audio);
    } catch { /* la caché es opcional */ }
    return { audio, mime: 'audio/mpeg', cached: false };
}

// Devuelve { audio: Buffer, mime }.
async function synthesize(text, voiceId, rate = 1, { quality = false } = {}) {
    const clean = String(text || '').trim();
    if (!clean) throw new Error('No hay texto para sintetizar.');

    if (provider() === 'elevenlabs' && clean.length <= MAX_CLOUD_CHARS) {
        try {
            return await synthesizeCloud(clean, rate, { quality });
        } catch (err) {
            console.warn('[TTS] ElevenLabs no disponible, uso Piper:', eleven.redact(err.message));
        }
    }
    return { audio: await piper.synthesize(clean, voiceId, rate), mime: 'audio/wav' };
}

function status() {
    const u = loadUsage();
    return {
        provider: provider(),
        elevenlabsConfigured: eleven.isConfigured(),
        voiceSelected: !!process.env.ELEVENLABS_VOICE_ID,
        monthChars: u.chars,
        monthBudget: budget(),
    };
}

module.exports = { synthesize, status, provider };
