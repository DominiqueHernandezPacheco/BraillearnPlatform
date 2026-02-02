// src/data/courseData.js

export const COURSES_DATA = [
    {
        id: 1, 
        title: "Módulo 1: Introducción", 
        subtitle: "El Mundo Táctil", 
        description: "Historia, importancia y curiosidades.", 
        iconType: "book", // Cambiamos el componente por un string ID
        lessons: [
            { 
                id: '1-1', 
                title: "¿Qué es el Braille?", 
                type: 'info', 
                content: "El Braille no es un idioma, ¡es un código táctil! Permite leer y escribir a través del tacto.",
                highlight: "Dato: Se lee moviendo los dedos de izquierda a derecha.",
                iconType: "book-open" // String ID para que la API lo pueda enviar
            },
            { 
                id: '1-2', 
                title: "El Joven Louis Braille", 
                type: 'info', 
                content: "Louis perdió la vista a los 3 años. A los 15, inventó este sistema inspirándose en un código militar nocturno.",
                highlight: "¡Un adolescente cambió el mundo para siempre!",
                iconType: "user"
            },
            { 
                id: '1-3', 
                title: "La Celda Braille", 
                type: 'info', 
                content: "Todo se basa en el 'Signo Generador': una celda con 6 puntos. 3 a la izquierda (1-2-3) y 3 a la derecha (4-5-6).",
                highlight: "Existen 64 combinaciones posibles.",
                iconType: "target"
            }
        ]
    },
    {
        id: 2, 
        title: "Módulo 2: Las Vocales", 
        subtitle: "Aprende y Practica", 
        description: "Domina las 5 vocales con ritmo.", 
        iconType: "star",
        lessons: [
            { id: '2-a', type: 'vowel_learning', char: 'a', title: "Letra A", audioDesc: "Letra A. Punto uno.", visualDesc: "Punto superior izquierdo.", patternExp: "Punto 1.", rhythm: "Ta" },
            { id: '2-a-drill', type: 'mini_drill', char: 'a', title: "Práctica: Letra A", question: "Forma la letra A." },
            { id: '2-e', type: 'vowel_learning', char: 'e', title: "Letra E", audioDesc: "Letra E. Puntos uno y cinco.", visualDesc: "Diagonal bajando.", patternExp: "Puntos 1 y 5.", rhythm: "Ta... Ta" },
            { id: '2-e-drill', type: 'mini_drill', char: 'e', title: "Práctica: Letra E", question: "Forma la letra E." },
            { id: '2-i', type: 'vowel_learning', char: 'i', title: "Letra I", audioDesc: "Letra I. Puntos dos y cuatro.", visualDesc: "Diagonal subiendo.", patternExp: "Puntos 2 y 4.", rhythm: "Ta... Ta" },
            { id: '2-i-drill', type: 'mini_drill', char: 'i', title: "Práctica: Letra I", question: "Forma la letra I." },
            { id: '2-o', type: 'vowel_learning', char: 'o', title: "Letra O", audioDesc: "Letra O. Puntos uno, tres y cinco.", visualDesc: "Triángulo izquierdo.", patternExp: "Puntos 1, 3 y 5.", rhythm: "Ta-Ta... Ta" },
            { id: '2-o-drill', type: 'mini_drill', char: 'o', title: "Práctica: Letra O", question: "Forma la letra O." },
            { id: '2-u', type: 'vowel_learning', char: 'u', title: "Letra U", audioDesc: "Letra U. Puntos uno, tres y seis.", visualDesc: "Puntos extremos.", patternExp: "Puntos 1, 3 y 6.", rhythm: "Ta-Ta... ... Ta" },
            { id: '2-u-drill', type: 'mini_drill', char: 'u', title: "Práctica: Letra U", question: "Forma la letra U." }
        ]
    },
    {
        id: 3, 
        title: "Módulo 3: Retos", 
        subtitle: "Ponte a prueba", 
        description: "5 ejercicios aleatorios.", 
        iconType: "target-module",
        lessons: [] // Esto se llenará dinámicamente
    }
];