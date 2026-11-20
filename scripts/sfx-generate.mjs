// Genera con ElevenLabs los efectos de sonido de los cuentos (src/data/
// sfxCatalog.js) y los guarda en src/assets/sfx/. Solo genera los que faltan,
// así que repetirlo no gasta créditos de más.
//
//   npm run sfx:generate -- --dry               qué falta y cuántos segundos serían
//   npm run sfx:generate                        genera lo que falte
//   npm run sfx:generate -- --only=risa,golpe   solo esos
//   npm run sfx:generate -- --only=risa --force lo regenera aunque ya exista

import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
require('dotenv').config({ path: path.join(root, '.env'), quiet: true });

const eleven = require('../electron/tts/elevenlabsService.cjs');
const { SFX } = await import('../src/data/sfxCatalog.js');

const outDir = path.join(root, 'src', 'assets', 'sfx');
const dry = process.argv.includes('--dry');
const force = process.argv.includes('--force');
const onlyArg = process.argv.find((a) => a.startsWith('--only='));
const only = onlyArg ? onlyArg.split('=')[1].split(',').filter(Boolean) : null;

const unknown = (only ?? []).filter((n) => !SFX[n]);
if (unknown.length) {
    console.error(`No están en el catálogo: ${unknown.join(', ')}`);
    process.exit(1);
}

const fileOf = (name) => path.join(outDir, `${name}.mp3`);
const todo = Object.entries(SFX).filter(([name]) => (!only || only.includes(name)) && (force || !fs.existsSync(fileOf(name))));
const seconds = todo.reduce((n, [, fx]) => n + fx.duration, 0);

console.log(`${todo.length} efectos por generar · ${seconds} s en total (${Object.keys(SFX).length - todo.length} ya existen o se omiten)`);
todo.forEach(([name, fx]) => console.log(`  ${dry ? '·' : ' '} ${name.padEnd(9)} ${String(fx.duration).padStart(4)} s  ${fx.prompt}`));
if (dry || todo.length === 0) process.exit(0);

if (!eleven.isConfigured()) {
    console.error('\nFalta ELEVENLABS_API_KEY en el .env.');
    process.exit(1);
}

fs.mkdirSync(outDir, { recursive: true });
let ok = 0;
let failed = 0;
for (const [name, fx] of todo) {
    try {
        const audio = await eleven.generateSoundEffect(fx.prompt, { durationSeconds: fx.duration });
        fs.writeFileSync(fileOf(name), audio);
        ok += 1;
        console.log(`\n✓ ${name} (${Math.round(audio.length / 1024)} KB)`);
    } catch (err) {
        failed += 1;
        console.log(`\n✗ ${name}: ${eleven.redact(err.message)}`);
        if (err.code === 'auth' || err.code === 'quota') {
            console.log('Me detengo: el problema no es de este efecto sino de la cuenta o la clave.');
            break;
        }
    }
}

try {
    const u = await eleven.getUsage();
    console.log(`\nGenerados: ${ok} · con error: ${failed}. ElevenLabs: ${u.used} de ${u.limit} créditos usados.`);
} catch {
    console.log(`\nGenerados: ${ok} · con error: ${failed}.`);
}
