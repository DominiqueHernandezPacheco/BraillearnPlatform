import { braillePatterns } from '../constants/braillePatterns.js';

// Lo que Braulio lee en voz alta al llegar a cada paso de una lección.
// Vive aparte de la pantalla porque también lo usa `npm run tts:pregenerate`
// para generar el audio de todas las lecciones por adelantado.

const activeDotsOf = (char) => {
    const dots = braillePatterns[char];
    return dots
        ? dots.map((d, i) => (d ? i + 1 : null)).filter(Boolean).join(' y ')
        : 'ninguno';
};

export const buildNarration = (lesson, index, total) => {
    const step = `Paso ${index + 1} de ${total}. `;

    switch (lesson.type) {
        case 'info':
            return `${step}${lesson.title}. ${lesson.content} ${lesson.highlight || ''}`;
        case 'vowel_learning':
            return `${step}${lesson.title}. ${lesson.audioDesc} Pulsa el botón o la barra espaciadora para escuchar el ritmo Braille.`;
        case 'check':
            return `${step}${lesson.question} ` +
                `Opciones: ${lesson.options.map((o, i) => `${i + 1}: ${o}`).join('. ')}. ` +
                `Elige con las teclas 1 a ${lesson.options.length} y confirma con Enter.`;
        case 'explore':
            return `${step}${lesson.title}. ${lesson.instruction}`;
        case 'quiz':
            return `${step}Pregunta: ${lesson.question} El patrón mostrado tiene los puntos: ${activeDotsOf(lesson.targetChar)}. ` +
                `Opciones: ${lesson.options.map((o, i) => `${i + 1}: ${o.toUpperCase()}`).join(', ')}. ` +
                `Usa las teclas 1, 2 o 3 para responder.`;
        case 'true_false':
            return `${step}Verdadero o Falso: ${lesson.question} El patrón en pantalla tiene los puntos: ${activeDotsOf(lesson.displayChar)}. ` +
                `Pulsa V para Verdadero o F para Falso.`;
        case 'builder':
        case 'mini_drill':
            return `${step}${lesson.title}. ${lesson.question} ` +
                `Usa el teclado Braille: F es punto 1, D es punto 2, S es punto 3, ` +
                `J es punto 4, K es punto 5, L es punto 6. ` +
                `Espacio para escuchar el patrón que construiste. Enter para verificar.`;
        case 'memory':
            return `${step}${lesson.title}. ${lesson.question}`;
        default:
            return step;
    }
};
