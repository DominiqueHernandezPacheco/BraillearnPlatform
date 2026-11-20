// Mide cuánto tarda Braulio en EMPEZAR a contestar una pregunta abierta, desde
// que ya hay texto transcrito hasta el primer audio, comparando:
//
//   primera versión (commit 23a05ad): Sonnet sin streaming + Piper dice TODA la respuesta
//   versión actual:                   Haiku con streaming + ElevenLabs dice la PRIMERA oración
//
// NO incluye el micrófono ni el reconocimiento de voz (Whisper), ni lo que tarda
// el navegador en arrancar el audio. Gasta unas pocas llamadas a Claude y ~500
// caracteres de ElevenLabs. Uso:
//
//   node scripts/bench-voice-latency.cjs

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
require('dotenv').config({ path: path.join(ROOT, '.env'), quiet: true });

const OLD_COMMIT = '23a05ad';
const OLD_FILE = path.join(__dirname, '.old-claudeService.tmp.cjs');
fs.writeFileSync(OLD_FILE, execFileSync('git', ['show', `${OLD_COMMIT}:electron/claude/claudeService.cjs`], { cwd: ROOT }));
process.on('exit', () => fs.rmSync(OLD_FILE, { force: true }));

const oldClaude = require(OLD_FILE);
const newClaude = require('../electron/claude/claudeService.cjs');
const piper = require('../electron/tts/piperService.cjs');
const tts = require('../electron/tts/ttsService.cjs');

const QUESTIONS = [
    '¿Quién inventó el Braille?',
    '¿Cuántos puntos tiene una celda Braille y cómo se numeran?',
    '¿Por qué el Braille usa seis puntos y no más?',
    'Explícame cómo escribir mi nombre en Braille',
    '¿Qué diferencia hay entre Braille grado 1 y grado 2?',
    '¿Cuánto tiempo tarda alguien en aprender Braille?',
];
const CONTEXT = { currentPage: 'cursos' };

const now = () => Number(process.hrtime.bigint() / 1000000n);
const median = (a) => {
    const s = [...a].sort((x, y) => x - y);
    const m = s.length >> 1;
    return s.length % 2 ? s[m] : Math.round((s[m - 1] + s[m]) / 2);
};

(async () => {
    try { await piper.synthesize('Prueba de arranque.', undefined, 1); } catch { /* sin Piper no hay comparación */ }

    const rows = [];
    for (const q of QUESTIONS) {
        const row = { q };
        try {
            let t = now();
            const old = await oldClaude.ask(q, CONTEXT);
            row.oldLlm = now() - t;
            t = now();
            await piper.synthesize(old.text, undefined, 1);
            row.oldTts = now() - t;
        } catch (e) { row.oldErr = e.message.slice(0, 100); }

        try {
            let t = now();
            let firstAt = null;
            let first = null;
            await newClaude.ask(q, CONTEXT, { onSentence: (s) => { if (firstAt === null) { firstAt = now() - t; first = s; } } });
            row.newLlmFirst = firstAt;
            t = now();
            const out = await tts.synthesize(first, undefined, 1);
            row.newTts = now() - t;
            row.newCloud = out.mime === 'audio/mpeg' && !out.cached;
        } catch (e) { row.newErr = e.message.slice(0, 100); }

        rows.push(row);
        console.log(JSON.stringify(row));
    }

    const ok = rows.filter((r) => r.oldLlm != null && r.oldTts != null && r.newLlmFirst != null && r.newTts != null && r.newCloud);
    if (!ok.length) {
        console.log('\nNinguna muestra válida (revisa ANTHROPIC_API_KEY, ELEVENLABS_* y que Piper esté instalado).');
        return;
    }
    const oldTotal = ok.map((r) => r.oldLlm + r.oldTts);
    const newTotal = ok.map((r) => r.newLlmFirst + r.newTts);
    console.log(`\nMuestras válidas: ${ok.length} de ${rows.length}`);
    console.log(`Primera versión: ${median(oldTotal)} ms (mediana) · rango ${Math.min(...oldTotal)}–${Math.max(...oldTotal)} ms`);
    console.log(`Versión actual:  ${median(newTotal)} ms (mediana) · rango ${Math.min(...newTotal)}–${Math.max(...newTotal)} ms`);
    console.log(`Reducción de la mediana: ${Math.round((1 - median(newTotal) / median(oldTotal)) * 100)} %`);
})();
