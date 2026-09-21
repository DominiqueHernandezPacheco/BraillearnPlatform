// src/data/courseData.js
//
// Estructura:  módulo → capítulos → pasos (lessons).
//  · `lessons` es una lista plana; cada paso apunta a su capítulo con `chapter`.
//  · Tipos de paso: info · check (pregunta de opción múltiple) · explore (celda
//    para tocar) · vowel_learning · mini_drill · quiz · true_false · memory.
//  · `iconType` es un texto (no un componente) para que estos datos puedan venir
//    de una API; ver src/utils/iconMap.jsx.

const VOWELS = ['a', 'e', 'i', 'o', 'u'];

const VOWEL_LESSONS = [
    { id: '2-a', type: 'vowel_learning', char: 'a', title: "Letra A", audioDesc: "Letra A. Punto uno.", visualDesc: "Punto superior izquierdo.", patternExp: "Punto 1.", rhythm: "Ta" },
    { id: '2-a-drill', type: 'mini_drill', char: 'a', title: "Práctica: Letra A", question: "Forma la letra A." },
    { id: '2-e', type: 'vowel_learning', char: 'e', title: "Letra E", audioDesc: "Letra E. Puntos uno y cinco.", visualDesc: "Diagonal bajando.", patternExp: "Puntos 1 y 5.", rhythm: "Ta... Ta" },
    { id: '2-e-drill', type: 'mini_drill', char: 'e', title: "Práctica: Letra E", question: "Forma la letra E." },
    { id: '2-i', type: 'vowel_learning', char: 'i', title: "Letra I", audioDesc: "Letra I. Puntos dos y cuatro.", visualDesc: "Diagonal subiendo.", patternExp: "Puntos 2 y 4.", rhythm: "Ta... Ta" },
    { id: '2-i-drill', type: 'mini_drill', char: 'i', title: "Práctica: Letra I", question: "Forma la letra I." },
    { id: '2-o', type: 'vowel_learning', char: 'o', title: "Letra O", audioDesc: "Letra O. Puntos uno, tres y cinco.", visualDesc: "Triángulo izquierdo.", patternExp: "Puntos 1, 3 y 5.", rhythm: "Ta-Ta... Ta" },
    { id: '2-o-drill', type: 'mini_drill', char: 'o', title: "Práctica: Letra O", question: "Forma la letra O." },
    { id: '2-u', type: 'vowel_learning', char: 'u', title: "Letra U", audioDesc: "Letra U. Puntos uno, tres y seis.", visualDesc: "Puntos extremos.", patternExp: "Puntos 1, 3 y 6.", rhythm: "Ta-Ta... ... Ta" },
    { id: '2-u-drill', type: 'mini_drill', char: 'u', title: "Práctica: Letra U", question: "Forma la letra U." },
];

export const COURSES_DATA = [
    {
        id: 1,
        title: "Módulo 1: Introducción",
        subtitle: "El mundo táctil",
        description: "Qué es el Braille, quién lo creó y cómo es una celda.",
        iconType: "book",
        chapters: [
            { id: 'que-es', title: "¿Qué es el Braille?", summary: "Un código que se lee con los dedos." },
            { id: 'louis', title: "Louis Braille", summary: "La historia de su inventor." },
            { id: 'celda', title: "La celda Braille", summary: "Seis puntos y muchas posibilidades." },
        ],
        lessons: [
            // ── Capítulo 1 · ¿Qué es el Braille? ─────────────────────────────
            {
                id: '1-1', chapter: 'que-es', type: 'info',
                title: "El Braille se lee con los dedos",
                content: "El Braille es un código de puntos en relieve. Se lee pasando la yema de los dedos, de izquierda a derecha, igual que se lee un libro con los ojos.",
                highlight: "Se lee moviendo los dedos de izquierda a derecha.",
                iconType: "hand",
            },
            {
                id: '1-2', chapter: 'que-es', type: 'info',
                title: "Un código, no un idioma",
                content: "El Braille no es un idioma: es un código táctil. Con las mismas celdas se puede escribir en español, en inglés y en muchos otros idiomas.",
                highlight: "Un solo sistema de puntos sirve para muchos idiomas.",
                iconType: "languages",
            },
            {
                id: '1-3', chapter: 'que-es', type: 'check',
                title: "Comprueba lo que aprendiste",
                question: "¿El Braille es un idioma?",
                options: ["Sí, es un idioma", "No, es un código de puntos"],
                answer: 1,
                explain: "Es un código táctil: representa letras, números y signos con puntos en relieve. Por eso sirve para muchos idiomas.",
            },

            // ── Capítulo 2 · Louis Braille ───────────────────────────────────
            {
                id: '1-4', chapter: 'louis', type: 'info',
                title: "Un niño de tres años",
                content: "Louis Braille nació en 1809 en Coupvray, Francia. A los tres años se hirió un ojo con una herramienta del taller de su padre. La herida se infectó y, con el tiempo, perdió la vista.",
                highlight: "Su historia empezó con un accidente en el taller de su papá.",
                iconType: "user",
            },
            {
                id: '1-5', chapter: 'louis', type: 'info',
                title: "Una escuela para ciegos",
                content: "A los diez años entró a una escuela para ciegos en París. Ahí conoció un código de puntos creado para el ejército, la “escritura nocturna”, pero era muy complicado de leer.",
                highlight: "Louis pensó que se podía hacer mucho más simple.",
                iconType: "school",
            },
            {
                id: '1-6', chapter: 'louis', type: 'info',
                title: "Tenía solo 15 años",
                content: "Louis simplificó ese código y lo redujo a celdas de seis puntos. Lo logró cuando tenía apenas 15 años, y publicó su método en 1829.",
                highlight: "Un adolescente cambió el mundo para siempre.",
                iconType: "sparkles",
            },
            {
                id: '1-7', chapter: 'louis', type: 'check',
                title: "Comprueba lo que aprendiste",
                question: "¿Cuántos años tenía Louis Braille cuando creó su sistema?",
                options: ["15 años", "30 años", "50 años"],
                answer: 0,
                explain: "Tenía 15 años. ¡Un adolescente cambió el mundo para siempre!",
            },

            // ── Capítulo 3 · La celda Braille ────────────────────────────────
            {
                id: '1-8', chapter: 'celda', type: 'info',
                title: "La celda de seis puntos",
                content: "Todo el Braille se escribe con una celda de seis puntos: tres a la izquierda y tres a la derecha.",
                highlight: "Los puntos se numeran del 1 al 3 a la izquierda, y del 4 al 6 a la derecha.",
                iconType: "grip",
            },
            {
                id: '1-9', chapter: 'celda', type: 'explore',
                title: "Toca los puntos",
                instruction: "Activa y desactiva los puntos para conocer la celda. Con el teclado: F, D y S son los puntos 1, 2 y 3; J, K y L son el 4, 5 y 6.",
            },
            {
                id: '1-10', chapter: 'celda', type: 'info',
                title: "64 combinaciones",
                content: "Cada punto puede estar levantado o no. Eso da 64 combinaciones posibles, contando la celda vacía. Con ellas se escriben letras, números y signos.",
                highlight: "Con seis puntos alcanza para todo el alfabeto.",
                iconType: "layers",
            },
            {
                id: '1-11', chapter: 'celda', type: 'check',
                title: "Comprueba lo que aprendiste",
                question: "En el Braille tradicional, ¿cuántos puntos tiene una celda?",
                options: ["Cuatro", "Seis", "Doce"],
                answer: 1,
                explain: "Seis: tres a la izquierda y tres a la derecha. El código anterior tenía doce puntos, y Louis lo simplificó.",
            },
        ],
    },
    {
        id: 2,
        title: "Módulo 2: Las Vocales",
        subtitle: "Aprende y practica",
        description: "Domina las 5 vocales con ritmo.",
        iconType: "star",
        chapters: VOWELS.map((v) => ({
            id: v,
            title: `La letra ${v.toUpperCase()}`,
            summary: "Aprende su patrón y forma la letra.",
        })),
        lessons: VOWEL_LESSONS.map((lesson) => ({ ...lesson, chapter: lesson.char })),
    },
    {
        id: 3,
        title: "Módulo 3: Retos",
        subtitle: "Ponte a prueba",
        description: "5 ejercicios distintos cada vez.",
        iconType: "target-module",
        random: true, // sus pasos se generan al abrirlo (ver utils/courseGenerator.js)
        chapters: [
            { id: 'retos', title: "5 retos", summary: "Memorama y ejercicios al azar." },
        ],
        lessons: [], // se llena dinámicamente
    },
];

// Capítulos de un módulo con el rango de pasos que ocupa cada uno.
// Los módulos aleatorios (retos) no tienen pasos fijos: un solo capítulo.
export const getChapterRanges = (module) => {
    const chapters = module.chapters ?? [];
    return chapters.map((chapter) => {
        const indexes = module.lessons
            .map((lesson, i) => (lesson.chapter === chapter.id ? i : -1))
            .filter((i) => i !== -1);
        return {
            ...chapter,
            start: indexes.length ? indexes[0] : 0,
            end: indexes.length ? indexes[indexes.length - 1] : 0,
            steps: indexes.length,
        };
    });
};

// Índice del capítulo al que pertenece un paso (para mostrar "Capítulo 2 de 3").
export const chapterIndexOfStep = (module, stepIndex) => {
    const ranges = getChapterRanges(module);
    const found = ranges.findIndex((r) => stepIndex >= r.start && stepIndex <= r.end);
    return found === -1 ? 0 : found;
};
