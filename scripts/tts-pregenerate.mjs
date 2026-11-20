// Pregenera (y guarda en la caché) la voz de todas las narraciones fijas de
// las lecciones, para que Braulio las diga al instante en vez de esperar ~2 s
// la primera vez que se llega a cada paso. Se puede repetir sin miedo: lo que
// ya está en caché no vuelve a gastar créditos.
//
//   npm run tts:pregenerate -- --dry     solo cuenta frases y caracteres (no gasta nada)
//   npm run tts:pregenerate              genera lo que falte

import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
require('dotenv').config({ path: path.join(root, '.env'), quiet: true });

const tts = require('../electron/tts/ttsService.cjs');
const { COURSES_DATA } = await import('../src/data/courseData.js');
const { buildNarration } = await import('../src/utils/lessonNarration.js');

const dry = process.argv.includes('--dry');

// Solo las lecciones con contenido fijo (los retos del módulo 3 son aleatorios).
const phrases = [];
for (const m of COURSES_DATA) {
    if (m.random || !m.lessons?.length) continue;
    m.lessons.forEach((lesson, i) => {
        phrases.push({ label: `${m.title.split(':')[0]} · paso ${i + 1}`, text: buildNarration(lesson, i, m.lessons.length).trim() });
    });
}

// Los cuentos: Braulio los dice oración por oración (así el lector ilumina lo
// que va diciendo), con exactamente el texto que usa el lector.
const { STORIES } = await import('../src/data/storyData.js');
const { splitSentences } = await import('../src/utils/storyText.js');
for (const story of STORIES) {
    story.scenes.forEach((scene, i) => {
        splitSentences(scene.text).forEach((sentence, j) => {
            phrases.push({ label: `Cuento «${story.title}» · parte ${i + 1}.${j + 1}`, text: sentence.text });
        });
    });
}

// Las tres velocidades del panel de accesibilidad (Lenta, Normal, Rápida): la
// caché es por velocidad, así que cada una necesita su propia tanda. Se puede
// elegir una con --rate=0.75 (o 1, o 1.5).
const ALL_RATES = [1, 0.75, 1.5];
const rateArg = process.argv.find((a) => a.startsWith('--rate='));
const rates = rateArg ? [Number(rateArg.split('=')[1])] : ALL_RATES;

const totalChars = phrases.reduce((n, p) => n + p.text.length, 0);
console.log(`${phrases.length} frases · ${totalChars} caracteres por velocidad · velocidades: ${rates.join(', ')} · voz: ${tts.provider()}`);
console.log(`Como máximo ${totalChars * rates.length} caracteres si nada estuviera en caché.\n`);
if (dry) process.exit(0);

if (tts.provider() !== 'elevenlabs') {
    console.error('ElevenLabs no está activo (revisa ELEVENLABS_API_KEY y ELEVENLABS_VOICE_ID en el .env).');
    process.exit(1);
}

let fresh = 0;
let cached = 0;
let failed = 0;
for (const rate of rates) {
    console.log(`\n── Velocidad ${rate} ──`);
    for (const { label, text } of phrases) {
        try {
            const result = await tts.synthesize(text, undefined, rate, { quality: true });
            if (result.mime !== 'audio/mpeg') throw new Error('se usó Piper (respaldo), no se guardó');
            if (result.cached) cached += 1;
            else fresh += 1;
            if (!result.cached) console.log(`  ✓ ${label} (${text.length} car.)`);
        } catch (err) {
            failed += 1;
            console.log(`  ✗ ${label}: ${err.message}`);
        }
    }
}

const s = tts.status();
console.log(`\nNuevas: ${fresh} · ya en caché: ${cached} · con error: ${failed}`);
console.log(`Gasto local este mes: ${s.monthChars} de ${s.monthBudget} caracteres.`);
