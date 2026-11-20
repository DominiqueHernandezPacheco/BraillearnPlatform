// Las frases que Braulio dice siempre igual (narración de lecciones, cuentos y
// frases fijas del asistente): lo que se pregenera y lo que se lleva al servidor.
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const load = (rel) => import(pathToFileURL(path.join(root, rel)).href);

export async function collectPhrases() {
    const { COURSES_DATA } = await load('src/data/courseData.js');
    const { buildNarration } = await load('src/utils/lessonNarration.js');
    const { STORIES } = await load('src/data/storyData.js');
    const { splitSentences } = await load('src/utils/storyText.js');

    const phrases = [];
    // Solo las lecciones con contenido fijo (los retos del módulo 3 son aleatorios).
    for (const m of COURSES_DATA) {
        if (m.random || !m.lessons?.length) continue;
        m.lessons.forEach((lesson, i) => {
            phrases.push({ label: `${m.title.split(':')[0]} · paso ${i + 1}`, text: buildNarration(lesson, i, m.lessons.length).trim() });
        });
    }
    // Los cuentos, oración por oración (así los dice el lector).
    for (const story of STORIES) {
        story.scenes.forEach((scene, i) => {
            splitSentences(scene.text).forEach((sentence, j) => {
                phrases.push({ label: `Cuento «${story.title}» · parte ${i + 1}.${j + 1}`, text: sentence.text });
            });
        });
    }
    return phrases;
}

// Las frases fijas del asistente (confirmaciones, avisos) y las de "narración breve".
export async function collectFixedPhrases() {
    const { PRELOAD_PHRASES } = await load('src/utils/assistantPhrases.js');
    return [...new Set(PRELOAD_PHRASES)].map((text) => ({ label: `fija · ${text.slice(0, 30)}`, text }));
}

export const RATES = [1, 0.75, 1.5]; // Normal, Lenta, Rápida (panel de accesibilidad)
