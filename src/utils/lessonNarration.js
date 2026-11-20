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

// Versión corta (ajuste "Narración breve"): solo dónde estás. En el primer paso
// también dice el módulo; el contenido completo se oye tocando a Braulio.
export const buildBriefNarration = (lesson, index, total, moduleName) => {
    const where = index === 0 && moduleName ? `Estás en ${moduleName}. ` : '';
    return `${where}Paso ${index + 1} de ${total}.${lesson.title ? ` ${lesson.title}.` : ''}`;
};

export const buildNarration = (lesson, index, total) => {
    const step = `Paso ${index + 1} de ${total}. `;

    switch (lesson.type) {
        case 'info':
            return `${step}${lesson.title}. ${lesson.content} ${lesson.highlight || ''}`;
        case 'vowel_learning':
            // Los controles (espaciadora, doble Shift) ya se explicaron una
            // sola vez en el paso "Antes de empezar" del módulo — repetirlos
            // en cada letra se sentía cansado a la quinta vez. `controlsHint`
            // solo existe en la primera letra: ahí sí conviene recordarlo justo
            // cuando toca usarlo, no solo en el paso intro de más arriba.
            return `${step}${lesson.title}. ${lesson.audioDesc}${lesson.controlsHint ? ` ${lesson.controlsHint}` : ''}`;
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
            // Mismo caso: los controles del teclado Braille ya se explicaron
            // en "Antes de empezar", no hace falta repetirlos en cada ejercicio
            // — salvo en el primero (ver `controlsHint` arriba).
            return `${step}${lesson.title}. ${lesson.question}${lesson.controlsHint ? ` ${lesson.controlsHint}` : ''}`;
        case 'memory':
            return `${step}${lesson.title}. ${lesson.question}`;
        default:
            return step;
    }
};
