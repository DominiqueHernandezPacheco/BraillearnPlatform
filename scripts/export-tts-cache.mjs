// Copia a deploy/tts-cache las voces ya generadas de las frases fijas (lecciones,
// cuentos y avisos del asistente) en las tres velocidades, para llevarlas dentro
// de la imagen del servidor. No gasta créditos: solo copia lo que ya existe.
//
//   npm run tts:export-cache
//
// Antes, genera lo que falte con `npm run tts:pregenerate`.

import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { collectPhrases, collectFixedPhrases, RATES } from './lib/tts-phrases.mjs';

const require = createRequire(import.meta.url);
const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
require('dotenv').config({ path: path.join(root, '.env'), quiet: true });
const tts = require('../electron/tts/ttsService.cjs');

const outDir = path.join(root, 'deploy', 'tts-cache');
fs.rmSync(outDir, { recursive: true, force: true });
fs.mkdirSync(outDir, { recursive: true });

const phrases = [...(await collectPhrases()), ...(await collectFixedPhrases())];
let copied = 0;
let bytes = 0;
const missing = [];
for (const rate of RATES) {
    for (const { label, text } of phrases) {
        const file = tts.findCached(text, rate);
        if (!file) { missing.push(`${label} (velocidad ${rate})`); continue; }
        const dest = path.join(outDir, path.basename(file));
        if (fs.existsSync(dest)) continue; // la misma frase puede repetirse
        fs.copyFileSync(file, dest);
        copied += 1;
        bytes += fs.statSync(dest).size;
    }
}

console.log(`${copied} audios copiados a deploy/tts-cache (${(bytes / 1024 / 1024).toFixed(1)} MB)`);
if (missing.length) {
    console.log(`\nFaltan ${missing.length} (no están en la caché local). Corre \`npm run tts:pregenerate\` para generarlos:`);
    missing.slice(0, 12).forEach((m) => console.log(`  · ${m}`));
    if (missing.length > 12) console.log(`  … y ${missing.length - 12} más`);
}
