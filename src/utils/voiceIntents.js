// Fase 2: enrutador local de comandos de voz para "Braulio".
//
// Reglas simples de palabras clave -> acción de navegación. Se revisan en
// orden, la primera que matchea gana. Es instantáneo y no cuesta tokens de
// la API — solo lo que NO matchea aquí se manda a Claude (preguntas
// abiertas sobre la lección o sobre Braille en general).

const RULES = [
    {
        test: /(ultima|última).*(leccion|lección)|donde me quede|donde me quedé|continua(r)?.*quede/,
        intent: { type: 'open-last-lesson' },
    },
    // Módulos por nombre/número (ver src/data/courseData.js — hoy son 3)
    {
        test: /(primer|primera|módulo 1|modulo 1|módulo uno|modulo uno).*(leccion|lección|módulo|modulo)?|introduccion|introducción/,
        intent: { type: 'open-module', moduleId: 1 },
    },
    {
        test: /(segund|módulo 2|modulo 2|módulo dos|modulo dos).*(leccion|lección|módulo|modulo)?|vocales/,
        intent: { type: 'open-module', moduleId: 2 },
    },
    {
        test: /(tercer|tercera|módulo 3|modulo 3|módulo tres|modulo tres).*(leccion|lección|módulo|modulo)?|retos|desafios|desafíos/,
        intent: { type: 'open-module', moduleId: 3 },
    },
    {
        test: /simulador/,
        intent: { type: 'navigate', page: 'simulador', anchor: 'simulador-top' },
    },
    {
        test: /(mis cursos|los cursos|ver cursos|abre.*cursos|mapa de (cursos|modulos|módulos))/,
        intent: { type: 'navigate', page: 'cursos', anchor: 'cursos-top' },
    },
    // Ajustes de accesibilidad por voz (van antes de la regla genérica del
    // panel, para que "hazla más grande" no caiga ahí sino en el ajuste directo)
    {
        test: /(agranda|aumenta|mas grande|más grande|hazla mas grande|hazla más grande).*(letra|texto|fuente)|(letra|texto|fuente).*(mas grande|más grande|grande)/,
        intent: { type: 'set-accessibility', setting: 'font-bigger' },
    },
    {
        test: /(achica|reduce|disminuye|mas chica|más chica|mas pequeñ|más pequeñ|hazla mas chica|hazla más chica).*(letra|texto|fuente)|(letra|texto|fuente).*(mas chica|más chica|mas pequeñ|más pequeñ|chica|pequeñ)/,
        intent: { type: 'set-accessibility', setting: 'font-smaller' },
    },
    {
        test: /(tamaño|letra|texto).*(normal|por defecto|de nuevo|reinicia)|reinicia.*(letra|texto|tamaño)/,
        intent: { type: 'set-accessibility', setting: 'font-reset' },
    },
    {
        test: /(activa|prende|enciende|pon(?:le)?|quiero).*(alto contraste|contraste)/,
        intent: { type: 'set-accessibility', setting: 'high-contrast-on' },
    },
    {
        test: /(desactiva|apaga|quita).*(alto contraste|contraste)/,
        intent: { type: 'set-accessibility', setting: 'high-contrast-off' },
    },
    {
        test: /(reduce|quita|desactiva).*(animacion|animación|movimiento)/,
        intent: { type: 'set-accessibility', setting: 'reduce-motion-on' },
    },
    {
        test: /(activa|permite).*(animacion|animación|movimiento)/,
        intent: { type: 'set-accessibility', setting: 'reduce-motion-off' },
    },
    {
        test: /panel de accesibilidad|opciones de accesibilidad|ajustes de accesibilidad/,
        intent: { type: 'open-accessibility-panel' },
    },
    {
        test: /(pagina|página) principal|menu principal|menú principal|^inicio$|ir a inicio|volver al inicio/,
        intent: { type: 'navigate', page: 'plataforma', anchor: 'inicio' },
    },
    {
        test: /acerca del proyecto|sobre el proyecto|sobre braillearn|quienes somos|quiénes somos/,
        intent: { type: 'navigate', page: 'proyecto', anchor: 'acerca' },
    },
];

/**
 * @param {string} transcriptRaw - lo que transcribió el motor de voz
 * @returns {object|null} un intent reconocido, o null si hay que mandarlo a Claude
 */
export function matchLocalIntent(transcriptRaw) {
    const t = transcriptRaw.toLowerCase();
    for (const rule of RULES) {
        if (rule.test.test(t)) return rule.intent;
    }
    return null;
}
