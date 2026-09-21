// Prueba de voces de ElevenLabs para Braulio.
//
//   npm run tts:audition -- --list                  solo lista las voces (no gasta créditos)
//   npm run tts:audition                            genera una muestra con las voces candidatas
//   npm run tts:audition -- --voices=Liam,Chris     genera muestras solo de esas voces
//
// Las muestras (MP3) quedan en ./tts-samples. Cada una gasta ~80 créditos del
// plan gratis. Cuando elijas una, pon su id en .env: ELEVENLABS_VOICE_ID=...
//
// Solo usa las llamadas de la lista blanca de electron/tts/elevenlabsService.cjs.

const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env'), quiet: true });
const eleven = require('../electron/tts/elevenlabsService.cjs');

const PHRASE = '¡Hola! Soy Braulio. Hoy vamos a aprender Braille juntos, paso a paso. ¡Tú puedes!';
const OUT_DIR = path.join(__dirname, '..', 'tts-samples');
const DEFAULT_MAX = 6;

const args = process.argv.slice(2);
const flag = (name) => args.find((a) => a === `--${name}` || a.startsWith(`--${name}=`));
const flagValue = (name) => flag(name)?.split('=')[1];

const isMale = (v) => String(v.labels.gender || '').toLowerCase() === 'male';

// Prioriza voces jóvenes y de tono casual/alegre para un Braulio jovial.
function score(v) {
    const l = v.labels;
    const words = `${l.descriptive || ''} ${l.description || ''} ${l.use_case || ''}`.toLowerCase();
    let s = 0;
    if (/young/.test(l.age || '')) s += 3;
    if (/middle/.test(l.age || '')) s += 1;
    if (/(cheer|energ|excit|friend|upbeat|casual|warm|playful|optim|charm|lively|bright)/.test(words)) s += 3;
    if (/(conversation|social)/.test(words)) s += 1;
    if (/(deep|raspy|hoarse|gravel|old|dark|intense|whisper|asmr|anxious|shout)/.test(words)) s -= 3;
    return s;
}

async function main() {
    if (!eleven.isConfigured()) {
        console.error('Falta ELEVENLABS_API_KEY en el .env');
        process.exit(1);
    }

    const voices = await eleven.listVoices();
    const males = voices.filter(isMale);

    console.log(`\nVoces en tu cuenta: ${voices.length} (${males.length} masculinas)\n`);
    for (const v of males.sort((a, b) => score(b) - score(a))) {
        const l = v.labels;
        console.log(
            `  ${v.name.padEnd(14)} ${String(v.category).padEnd(10)} ${String(l.age || '-').padEnd(12)} ` +
            `${String(l.accent || '-').padEnd(12)} ${[l.descriptive, l.use_case].filter(Boolean).join(' · ')}`,
        );
    }

    try {
        const u = await eleven.getUsage();
        console.log(`\nCréditos este mes: ${u.used} de ${u.limit} usados (plan ${u.tier}).`);
    } catch { /* sin permiso de saldo */ }

    if (flag('list')) return;

    const wanted = flagValue('voices');
    let candidates;
    if (wanted) {
        const names = wanted.split(',').map((n) => n.trim().toLowerCase());
        // Basta el principio del nombre: "juan" encuentra "Juan - Friendly & Effortless"
        candidates = voices.filter((v) => names.some((n) => v.name.toLowerCase().startsWith(n)));
    } else {
        candidates = males.sort((a, b) => score(b) - score(a)).slice(0, Number(flagValue('max')) || DEFAULT_MAX);
    }
    if (candidates.length === 0) {
        console.error('\nNo encontré voces que probar.');
        process.exit(1);
    }

    fs.mkdirSync(OUT_DIR, { recursive: true });
    console.log(`\nGenerando ${candidates.length} muestras (~${PHRASE.length} caracteres cada una)…\n`);
    for (const v of candidates) {
        try {
            const audio = await eleven.synthesize(PHRASE, { voiceId: v.id });
            const file = path.join(OUT_DIR, `${v.name.replace(/[^\w-]+/g, '_')}__${v.id}.mp3`);
            fs.writeFileSync(file, audio);
            console.log(`  ✓ ${v.name.padEnd(14)} -> ${path.relative(process.cwd(), file)}`);
        } catch (err) {
            console.log(`  ✗ ${v.name.padEnd(14)} ${eleven.redact(err.message)}`);
        }
    }
    console.log('\nEscúchalas y dime cuál te gusta (el id va en el nombre del archivo).');
}

main().catch((err) => {
    console.error(eleven.redact(err.message));
    process.exit(1);
});
