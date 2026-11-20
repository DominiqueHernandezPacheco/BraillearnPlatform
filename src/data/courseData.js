// src/data/courseData.js
//
// Estructura:  módulo → capítulos → pasos (lessons).
//  · `lessons` es una lista plana; cada paso apunta a su capítulo con `chapter`.
//  · Tipos de paso: info · check (pregunta de opción múltiple) · explore (celda
//    para tocar) · vowel_learning · mini_drill · quiz · true_false · memory.
//  · `iconType` es un texto (no un componente) para que estos datos puedan venir
//    de una API; ver src/utils/iconMap.jsx.

const VOWELS = ['a', 'e', 'i', 'o', 'u'];

// Un solo paso al principio del módulo explicando los controles — antes cada
// letra repetía las mismas instrucciones (ver buildNarration en
// utils/lessonNarration.js), lo cual se volvía cansado a la quinta vez.
// Va dentro del capítulo de la letra A: si alguien la olvida, "Anterior" la
// tiene a un paso de distancia y el botón de Braulio la repite.
const INTRO_LESSON = {
    id: '2-intro', chapter: 'a', type: 'info',
    title: "Antes de empezar",
    content: "En cada letra puedes escuchar su ritmo con la barra espaciadora. En los ejercicios de práctica, la formas con el teclado: F, D y S son los puntos 1, 2 y 3; J, K y L son el 4, 5 y 6. Cuando termines, Enter verifica tu patrón.",
    highlight: "Espacio escucha, F-D-S-J-K-L construye, Enter verifica — y doble toque a Shift si quieres oír cómo suenan los puntos.",
    iconType: "grip",
};

const VOWEL_LESSONS = [
    {
        id: '2-a', type: 'vowel_learning', char: 'a', title: "Letra A",
        audioDesc: "Letra A. Es la más sencilla de las cinco vocales: un solo punto, arriba a la izquierda. Con ella empieza el alfabeto Braille, igual que en el alfabeto normal.",
        visualDesc: "El punto más simple: solo el de arriba a la izquierda.",
        patternExp: "Punto 1.", rhythm: "Ta",
        // Solo en la primera letra: el recordatorio de qué tecla usar justo
        // cuando toca usarla, no solo en el paso intro de más arriba.
        controlsHint: "Presiona la barra espaciadora para escucharlo, o el botón en pantalla.",
    },
    {
        id: '2-a-drill', type: 'mini_drill', char: 'a', title: "Práctica: Letra A", question: "Forma la letra A.",
        controlsHint: "Usa el teclado Braille: F, D y S son los puntos 1, 2 y 3; J, K y L son el 4, 5 y 6. Cuando termines, presiona Enter para verificar.",
    },
    {
        id: '2-e', type: 'vowel_learning', char: 'e', title: "Letra E",
        audioDesc: "Letra E. Dos puntos en diagonal: el de arriba a la izquierda, y otro a la mitad pero del lado derecho. Recuerda esta pareja: la I usa los mismos dos puntos, nada más que del lado contrario.",
        visualDesc: "Dos puntos en diagonal: uno arriba a la izquierda, otro a la mitad a la derecha.",
        patternExp: "Puntos 1 y 5.", rhythm: "Ta... Ta",
    },
    { id: '2-e-drill', type: 'mini_drill', char: 'e', title: "Práctica: Letra E", question: "Forma la letra E." },
    {
        id: '2-i', type: 'vowel_learning', char: 'i', title: "Letra I",
        audioDesc: "Letra I. También son dos puntos en diagonal, pero invertidos respecto a la E: aquí el de arriba está a la derecha, y el de la mitad a la izquierda.",
        visualDesc: "Dos puntos en diagonal, al revés que la E.",
        patternExp: "Puntos 2 y 4.", rhythm: "Ta... Ta",
    },
    { id: '2-i-drill', type: 'mini_drill', char: 'i', title: "Práctica: Letra I", question: "Forma la letra I." },
    {
        id: '2-o', type: 'vowel_learning', char: 'o', title: "Letra O",
        audioDesc: "Letra O. Toma la E que ya conoces, arriba a la izquierda y a la mitad a la derecha, y agrégale un punto más abajo a la izquierda. Tres puntos en total.",
        visualDesc: "Los dos puntos de la izquierda, arriba y abajo, más uno a la mitad derecha.",
        patternExp: "Puntos 1, 3 y 5.", rhythm: "Ta-Ta... Ta",
    },
    { id: '2-o-drill', type: 'mini_drill', char: 'o', title: "Práctica: Letra O", question: "Forma la letra O." },
    {
        id: '2-u', type: 'vowel_learning', char: 'u', title: "Letra U",
        audioDesc: "Letra U. Comparte con la O los dos puntos de la izquierda, arriba y abajo. La diferencia está en el punto derecho: en la O va a la mitad, en la U va hasta abajo.",
        visualDesc: "Los mismos dos puntos de la izquierda que la O, pero el de la derecha va hasta abajo.",
        patternExp: "Puntos 1, 3 y 6.", rhythm: "Ta-Ta... ... Ta",
    },
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
        lessons: [INTRO_LESSON, ...VOWEL_LESSONS.map((lesson) => ({ ...lesson, chapter: lesson.char }))],
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
