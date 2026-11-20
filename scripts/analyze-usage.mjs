// Analiza los archivos de datos de uso exportados desde la plataforma
// (panel de Accesibilidad → Datos de uso → Exportar datos).
//
//   node scripts/analyze-usage.mjs datos1.json [datos2.json ...]
//
// Junta todos los archivos y resume: lectura con los dedos (tiempo y velocidad
// por línea del display), lecciones (aciertos al primer intento), voz (latencia
// de las respuestas) y operaciones del display real. Con pocos datos los números
// son solo indicativos: el script avisa cuando hay menos de 10 muestras.

import fs from 'node:fs';

const files = process.argv.slice(2);
if (!files.length) {
    console.error('Uso: node scripts/analyze-usage.mjs datos.json [más.json ...]');
    process.exit(1);
}

const events = [];
for (const file of files) {
    const data = JSON.parse(fs.readFileSync(file, 'utf8'));
    events.push(...(Array.isArray(data) ? data : data.events ?? []));
}
if (!events.length) {
    console.log('Los archivos no tienen eventos.');
    process.exit(0);
}

const of = (type) => events.filter((e) => e.type === type);
const quantile = (values, q) => {
    if (!values.length) return null;
    const s = [...values].sort((a, b) => a - b);
    const pos = (s.length - 1) * q;
    const lo = Math.floor(pos);
    return s[lo] + (s[Math.min(lo + 1, s.length - 1)] - s[lo]) * (pos - lo);
};
const median = (v) => quantile(v, 0.5);
const fmt = (n, digits = 1) => (n == null ? '—' : Number(n).toFixed(digits));
const pct = (part, whole) => (whole ? `${((part / whole) * 100).toFixed(0)} %` : '—');
const note = (n) => (n < 10 ? '  (pocas muestras: indicativo)' : '');
const groupBy = (list, key) => list.reduce((acc, item) => {
    (acc[key(item)] ??= []).push(item);
    return acc;
}, {});

const participants = new Set(events.map((e) => e.p));
const sessions = new Set(events.map((e) => e.s));
const times = events.map((e) => e.t).filter(Boolean);
const day = (t) => new Date(t).toISOString().slice(0, 10);

console.log('== Resumen ==');
console.log(`Participantes: ${participants.size} · Sesiones: ${sessions.size} · Eventos: ${events.length}`);
if (times.length) console.log(`Periodo: ${day(Math.min(...times))} a ${day(Math.max(...times))}`);

// ── Lectura con los dedos ────────────────────────────────────────────────────
// Se descartan las líneas con tiempos imposibles (< 0.3 s es un salto; > 120 s es
// que la persona se fue).
const lines = of('story_line').filter((e) => e.dwell_ms >= 300 && e.dwell_ms <= 120000 && e.glyphs > 0);
console.log('\n== Lectura con los dedos ==');
if (!lines.length) {
    console.log('Sin datos.');
} else {
    const dwell = lines.map((e) => e.dwell_ms / 1000);
    const speed = lines.map((e) => e.glyphs / (e.dwell_ms / 1000));
    console.log(`Líneas leídas: ${lines.length}${note(lines.length)}`);
    console.log(`Tiempo por línea: mediana ${fmt(median(dwell))} s (P25–P75: ${fmt(quantile(dwell, 0.25))}–${fmt(quantile(dwell, 0.75))} s)`);
    console.log(`Velocidad: mediana ${fmt(median(speed))} celdas/s`);
    const byCells = groupBy(lines, (e) => e.cells);
    Object.keys(byCells).sort((a, b) => a - b).forEach((cells) => {
        const group = byCells[cells];
        console.log(`  display de ${cells} celdas: ${group.length} líneas · ${fmt(median(group.map((e) => e.dwell_ms / 1000)))} s/línea · ${fmt(median(group.map((e) => e.glyphs / (e.dwell_ms / 1000))))} celdas/s`);
    });
    const byStory = groupBy(lines, (e) => e.story);
    Object.keys(byStory).forEach((story) => {
        console.log(`  ${story}: ${byStory[story].length} líneas · ${fmt(median(byStory[story].map((e) => e.glyphs / (e.dwell_ms / 1000))))} celdas/s`);
    });
    console.log(`Cuentos terminados: ${of('story_done').length}`);
}

// ── Lecciones ────────────────────────────────────────────────────────────────
const answers = of('lesson_answer');
console.log('\n== Lecciones ==');
if (!answers.length) {
    console.log('Sin datos.');
} else {
    const first = answers.filter((e) => e.attempt === 1);
    console.log(`Respuestas: ${answers.length} · pasos contestados: ${first.length}${note(first.length)}`);
    console.log(`Aciertos al primer intento: ${pct(first.filter((e) => e.correct).length, first.length)}`);
    const retries = answers.filter((e) => e.attempt > 1).length;
    console.log(`Reintentos: ${retries}`);
    const byKind = groupBy(first, (e) => e.kind);
    Object.keys(byKind).forEach((kind) => {
        const g = byKind[kind];
        console.log(`  ${kind}: ${pct(g.filter((e) => e.correct).length, g.length)} acierto al 1.er intento (n=${g.length}) · ${fmt(median(g.map((e) => e.ms / 1000)))} s hasta responder`);
    });
    console.log(`Módulos terminados: ${of('module_done').length}`);
}

// ── Voz ──────────────────────────────────────────────────────────────────────
const voice = of('voice_command');
console.log('\n== Voz ==');
if (!voice.length) {
    console.log('Sin datos.');
} else {
    const kind = (k) => voice.filter((e) => e.kind === k);
    console.log(`Comandos: ${voice.length}${note(voice.length)} · locales ${pct(kind('local').length, voice.length)} · a Claude ${pct(kind('claude').length, voice.length)} · sin voz detectada ${pct(kind('empty').length, voice.length)}`);
    const claude = kind('claude').filter((e) => e.ok);
    if (claude.length) {
        console.log(`Respuesta de Claude, primera oración: mediana ${fmt(median(claude.map((e) => e.first_ms).filter((v) => v != null)), 0)} ms`);
        console.log(`Respuesta de Claude, completa: mediana ${fmt(median(claude.map((e) => e.total_ms)), 0)} ms`);
    }
    console.log(`Con error de Claude: ${kind('claude').filter((e) => !e.ok).length}`);
}

// ── Display real ─────────────────────────────────────────────────────────────
const ops = of('display_op');
console.log('\n== Display real ==');
if (!ops.length) {
    console.log('Sin datos.');
} else {
    const okOps = ops.filter((e) => e.ok);
    console.log(`Operaciones: ${ops.length}${note(ops.length)} · fallidas ${pct(ops.length - okOps.length, ops.length)}`);
    console.log(`Tiempo en formar una línea (siguiente/anterior): mediana ${fmt(median(okOps.filter((e) => e.op !== 'load').map((e) => e.ms)), 0)} ms`);
    console.log(`Tiempo en cargar un texto: mediana ${fmt(median(okOps.filter((e) => e.op === 'load').map((e) => e.ms)), 0)} ms`);
}
