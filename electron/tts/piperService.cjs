// Fase 3: voz de "Braulio" con Piper TTS — modelos de voz open-source que
// se descargan una sola vez y corren 100% local (sin cuenta, sin internet
// después de la primera vez), igual que hicimos con Whisper para el oído.
//
// Piper en sí (rhasspy/piper) quedó archivado, pero su último release trae
// un binario de Windows autocontenido que sigue funcionando perfecto con
// los modelos de voz (formato .onnx), que se siguen publicando en
// huggingface.co/rhasspy/piper-voices.
//
// Se usa igual desde Electron (electron/main.cjs, por IPC) y desde el
// servidor web (server/index.cjs, por HTTP) — este archivo no sabe ni le
// importa quién lo llama.

const fs = require('fs');
const path = require('path');
const os = require('os');
const crypto = require('crypto');
const { execFile } = require('child_process');
const { pipeline } = require('stream/promises');
const AdmZip = require('adm-zip');

const PIPER_RELEASE = 'https://github.com/rhasspy/piper/releases/download/2023.11.14-2/piper_windows_amd64.zip';
const VOICES_BASE = 'https://huggingface.co/rhasspy/piper-voices/resolve/main';

// Catálogo de voces disponibles. El género no viene documentado por Piper
// para casi ninguna voz en español — "sharvard" es la única que se pudo
// confirmar como masculina por una fuente externa (tts.ai). "ald" es la
// alternativa mexicana, género sin confirmar; pruébala junto a "sharvard"
// y quédate con la que suene mejor para Braulio.
const VOICES = {
    'es_ES-sharvard-medium': {
        locale: 'es_ES',
        label: 'Español (España) · Sharvard · masculina (confirmada)',
        quality: 'medium',
        relPath: 'es/es_ES/sharvard/medium/es_ES-sharvard-medium',
    },
    'es_MX-ald-medium': {
        locale: 'es_MX',
        label: 'Español (México) · Ald · género sin confirmar',
        quality: 'medium',
        relPath: 'es/es_MX/ald/medium/es_MX-ald-medium',
    },
};

const DEFAULT_VOICE_ID = 'es_ES-sharvard-medium';

const PIPER_DIR = path.join(__dirname, '..', '..', '.piper');
const BIN_DIR = path.join(PIPER_DIR, 'bin');
const VOICES_DIR = path.join(PIPER_DIR, 'voices');
const PIPER_EXE = path.join(BIN_DIR, 'piper', 'piper.exe');

function voicePaths(voiceId) {
    const dir = path.join(VOICES_DIR, voiceId);
    return {
        dir,
        onnx: path.join(dir, `${voiceId}.onnx`),
        config: path.join(dir, `${voiceId}.onnx.json`),
    };
}

async function downloadFile(url, destPath, onProgress) {
    await fs.promises.mkdir(path.dirname(destPath), { recursive: true });
    const res = await fetch(url);
    if (!res.ok || !res.body) throw new Error(`Descarga falló (${res.status}): ${url}`);

    const total = Number(res.headers.get('content-length')) || 0;
    let loaded = 0;
    const { Readable } = require('stream');
    const source = Readable.fromWeb(res.body);
    source.on('data', (chunk) => {
        loaded += chunk.length;
        if (total) onProgress?.(loaded / total);
    });

    const tmpPath = `${destPath}.part`;
    await pipeline(source, fs.createWriteStream(tmpPath));
    await fs.promises.rename(tmpPath, destPath);
}

function binaryExists() {
    return fs.existsSync(PIPER_EXE);
}

function voiceExists(voiceId) {
    const p = voicePaths(voiceId);
    return fs.existsSync(p.onnx) && fs.existsSync(p.config);
}

async function ensureBinary(onProgress) {
    if (binaryExists()) return;
    console.log('[Piper] Descargando el motor de Piper (una sola vez, ~15MB)...');
    const zipPath = path.join(BIN_DIR, 'piper.zip');
    await downloadFile(PIPER_RELEASE, zipPath, onProgress);
    const zip = new AdmZip(zipPath);
    zip.extractAllTo(BIN_DIR, true);
    await fs.promises.unlink(zipPath);
    if (!binaryExists()) throw new Error('El .zip de Piper no traía piper.exe donde se esperaba.');
    console.log('[Piper] Motor listo.');
}

async function ensureVoice(voiceId, onProgress) {
    if (voiceExists(voiceId)) return;
    const voice = VOICES[voiceId];
    if (!voice) throw new Error(`Voz desconocida: ${voiceId}`);

    console.log(`[Piper] Descargando la voz "${voiceId}" (una sola vez, ~60MB)...`);
    const p = voicePaths(voiceId);
    await downloadFile(`${VOICES_BASE}/${voice.relPath}.onnx`, p.onnx, (f) => onProgress?.(f * 0.9));
    await downloadFile(`${VOICES_BASE}/${voice.relPath}.onnx.json`, p.config, () => onProgress?.(1));
    console.log(`[Piper] Voz "${voiceId}" lista.`);
}

/** Revisa si todo ya está descargado, sin descargar nada. */
function checkSetup(voiceId = DEFAULT_VOICE_ID) {
    return { ready: binaryExists() && voiceExists(voiceId) };
}

function listVoices() {
    return Object.entries(VOICES).map(([id, v]) => ({ id, ...v }));
}

/**
 * Descarga lo que haga falta (binario + voz) la primera vez.
 * @param {(fraction: number, label: string) => void} onProgress
 */
async function ensureReady(voiceId = DEFAULT_VOICE_ID, onProgress) {
    await ensureBinary((f) => onProgress?.(f * 0.3, 'motor'));
    await ensureVoice(voiceId, (f) => onProgress?.(0.3 + f * 0.7, 'voz'));
}

/**
 * Sintetiza `text` con la voz `voiceId` y devuelve un Buffer con el audio WAV.
 * @param {number} rate - velocidad de habla (1 = normal, 1.3 = 30% más rápido).
 * Se le pasa a Piper como --length_scale (inverso de rate) para que la
 * genere ya al ritmo correcto, en vez de "estirar" el audio ya grabado
 * después — eso último es lo que sonaba con eco/artefactos.
 */
async function synthesize(text, voiceId = DEFAULT_VOICE_ID, rate = 1) {
    await ensureReady(voiceId);
    const p = voicePaths(voiceId);
    const outPath = path.join(os.tmpdir(), `braulio-${crypto.randomUUID()}.wav`);
    const lengthScale = (1 / (rate > 0 ? rate : 1)).toFixed(3);

    await new Promise((resolve, reject) => {
        const child = execFile(
            PIPER_EXE,
            ['--model', p.onnx, '--config', p.config, '--length_scale', lengthScale, '--output_file', outPath],
            (err) => (err ? reject(err) : resolve()),
        );
        child.stdin.write(text);
        child.stdin.end();
    });

    const buffer = await fs.promises.readFile(outPath);
    fs.promises.unlink(outPath).catch(() => {});
    return buffer;
}

module.exports = { synthesize, ensureReady, checkSetup, listVoices, DEFAULT_VOICE_ID };
