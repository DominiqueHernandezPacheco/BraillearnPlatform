// Fase 2b: preguntas abiertas del asistente de voz "Braulio", vía la API de
// Claude (Anthropic) — para todo lo que el enrutador local de comandos
// (src/utils/voiceIntents.js) no reconoce: preguntas sobre Braille, sobre la
// lección actual, o instrucciones dichas de forma libre (navegar, ajustar
// accesibilidad, etc.).
//
// Corre en el proceso principal de Electron para que la API key nunca llegue
// al renderer (ni a las DevTools). Requiere ANTHROPIC_API_KEY en el .env.
//
// VELOCIDAD: la respuesta se dice en voz alta, así que cada segundo de espera
// se nota. Por pedido explícito: prioriza velocidad sobre calidad, con
// balance. Por eso:
//   · Haiku 4.5 en vez de Sonnet — para preguntas cortas sobre Braille y para
//     elegir una herramienta, no hace falta el modelo más grande, y responde
//     bastante más rápido.
//   · La respuesta se pide en STREAMING y se entrega oración por oración
//     (`onSentence`) apenas cada una está completa — quien llama puede
//     empezar a sintetizar y reproducir la primera frase sin esperar a que
//     termine toda la respuesta.
//   · `max_tokens` bajo y el prompt pide respuestas más cortas: menos texto
//     que generar (más rápido) y menos texto que sintetizar después.
//   · Toda petición tiene un tope de tiempo — si Claude no contesta en ese
//     plazo, se corta y se avisa, en vez de dejar a Braulio "pensando" para
//     siempre sin responder nada.
const Anthropic = require('@anthropic-ai/sdk');

const MODEL_ID = 'claude-haiku-4-5-20251001';
const MAX_TOKENS = 300;
const MAX_TOOL_ITERATIONS = 3;
const REQUEST_TIMEOUT_MS = 7000; // por intento; con 1 reintento, ~14s en el peor caso

let client = null;
function getClient() {
    if (client) return client;
    if (!process.env.ANTHROPIC_API_KEY) return null;
    // Lee ANTHROPIC_API_KEY del entorno automáticamente.
    client = new Anthropic({ timeout: REQUEST_TIMEOUT_MS, maxRetries: 1 });
    return client;
}

function checkSetup() {
    if (!process.env.ANTHROPIC_API_KEY) {
        return { ready: false, reason: 'Falta ANTHROPIC_API_KEY en el archivo .env' };
    }
    return { ready: true };
}

// Los únicos "tools" que Claude puede usar: pedir una navegación o un ajuste
// de accesibilidad. Nada de acceso a archivos, red, ni ejecución de código —
// Claude solo puede "pedir" la acción; quien la ejecuta de verdad es el
// renderer (App.jsx), no Claude.
const NAVIGATE_TOOL = {
    name: 'navigate_app',
    description:
        'Navega la aplicación Braillearn a una sección específica, o abre un módulo/lección. ' +
        'Úsala solo cuando el usuario haya pedido explícitamente ir a algún lugar o abrir algo.',
    input_schema: {
        type: 'object',
        properties: {
            destination: {
                type: 'string',
                enum: [
                    'inicio',
                    'cursos',
                    'mensajes',
                    'cuentos',
                    'ultima-leccion',
                    'modulo-1',
                    'modulo-2',
                    'modulo-3',
                ],
                description:
                    'inicio=página principal, cursos=camino de módulos, ' +
                    'mensajes=donde un familiar escribe un mensaje que llega al display Braille, ' +
                    'cuentos=biblioteca de cuentos para leer en el display Braille o escuchar, ' +
                    'ultima-leccion=retomar donde se quedó, ' +
                    'modulo-1=Introducción, modulo-2=Las Vocales, modulo-3=Retos.',
            },
        },
        required: ['destination'],
        additionalProperties: false,
    },
};

const ACCESSIBILITY_TOOL = {
    name: 'set_accessibility',
    description:
        'Cambia un ajuste de accesibilidad de la app (letra más grande/chica, alto contraste, ' +
        'reducir animaciones). Úsala cuando el usuario pida ajustar cómo se ve o se siente la ' +
        'interfaz — por ejemplo "no veo bien las letras", "hazlo más grande", "mucho brillo", etc. ' +
        'No la uses para la velocidad o el tipo de voz hablada, eso no se puede cambiar por voz.',
    input_schema: {
        type: 'object',
        properties: {
            setting: {
                type: 'string',
                enum: [
                    'font-bigger',
                    'font-smaller',
                    'font-reset',
                    'high-contrast-on',
                    'high-contrast-off',
                    'reduce-motion-on',
                    'reduce-motion-off',
                ],
            },
        },
        required: ['setting'],
        additionalProperties: false,
    },
};

const TOOLS = [NAVIGATE_TOOL, ACCESSIBILITY_TOOL];

// Nombres tal como los conoce quien usa la app (Claude solo debe decir estos,
// nunca el nombre técnico interno — 'plataforma' es el slug de ruta de Inicio)
// y una descripción de una frase, para que no tenga que adivinar qué hace cada
// sección (p. ej. en Mensajes es el familiar quien ESCRIBE, no quien recibe).
const PAGE_INFO = {
    plataforma: { label: 'Inicio', desc: 'la página principal, con tu progreso y accesos rápidos' },
    cursos: { label: 'Cursos', desc: 'el camino de módulos y lecciones para aprender Braille' },
    mensajes: { label: 'Mensajes', desc: 'donde un familiar o docente escribe un mensaje corto que llega al display Braille' },
    cuentos: { label: 'Cuentos', desc: 'la biblioteca de cuentos, para leerlos en el display Braille, escucharlos con sonidos y vibraciones' },
};

// Si hay una lección abierta ahora mismo (ver src/hooks/useActiveLesson.js),
// arma la frase con el progreso exacto — para preguntas como "¿cuánto me
// falta?", "¿en qué paso voy?" o "¿en qué capítulo estoy?".
function buildLessonProgressNote(activeLesson) {
    if (!activeLesson) return '';

    // Pantalla de "¡terminaste el módulo!" — sin esto, Claude no tiene forma de
    // saber a qué destino corresponde "el siguiente módulo" que le ofrecen.
    if (activeLesson.kind === 'finished') {
        const { moduleTitle, moduleIndex = 0, moduleTotal, nextModuleId, nextModuleTitle } = activeLesson;
        const nextPart = nextModuleId
            ? `La pantalla le ofrece dos botones: "Seguir con el Módulo ${nextModuleId} (${nextModuleTitle})" y ` +
              '"Volver al camino". Si pide continuar, seguir, avanzar, o algo como "el siguiente módulo", usa ' +
              `navigate_app con destination="modulo-${nextModuleId}". Si pide volver al camino o a cursos, usa ` +
              'destination="cursos".'
            : 'Era el último módulo — no hay uno siguiente. Si pide continuar o seguir, dile que ya terminó ' +
              'todos los módulos y puede repasar el que quiera; usa navigate_app con destination="cursos" si ' +
              'pide volver al camino.';
        return (
            `PANTALLA ACTUAL: el usuario acaba de terminar el Módulo ${moduleIndex + 1} de ${moduleTotal} ` +
            `("${moduleTitle}"). ${nextPart}`
        );
    }

    if (!activeLesson.stepTotal) return '';
    const {
        moduleTitle, moduleIndex = 0, moduleTotal, isRandom,
        chapterTitle, chapterIndex, chapterTotal,
        stepIndex, stepTotal, stepTitle,
    } = activeLesson;

    const stepWord = isRandom ? 'ejercicio' : 'paso';
    const parts = [`está en el Módulo ${moduleIndex + 1} de ${moduleTotal} ("${moduleTitle}")`];
    if (chapterTitle && Number.isInteger(chapterIndex) && chapterTotal > 1) {
        parts.push(`capítulo ${chapterIndex + 1} de ${chapterTotal} ("${chapterTitle}")`);
    }
    parts.push(`${stepWord} ${stepIndex + 1} de ${stepTotal} ("${stepTitle}")`);

    const remaining = Math.max(0, stepTotal - stepIndex - 1);
    const remainingText = remaining === 0
        ? 'Es el último paso de este módulo.'
        : remaining === 1
            ? `Le falta 1 ${stepWord} para terminar este módulo.`
            : `Le faltan ${remaining} ${stepWord}s para terminar este módulo.`;

    return (
        `PROGRESO DE LA LECCIÓN: ${parts.join(', ')}. ${remainingText} ` +
        'Si pregunta cuánto le falta, en qué paso, capítulo o módulo va, o algo parecido, contesta con ' +
        'estos datos exactos — no inventes ni digas que no sabes.'
    );
}

function buildSystemPrompt(context) {
    const pageInfo = PAGE_INFO[context?.currentPage];
    const pageLabel = pageInfo?.label || context?.currentPage;
    const lessonNote = buildLessonProgressNote(context?.activeLesson);
    return (
        'Eres "Braulio", el asistente de voz de Braillearn, una plataforma que enseña Braille a ' +
        'personas ciegas o con baja visión en México. Respondes siempre en español de México, de forma ' +
        'breve, cálida y clara — lo que digas se va a leer en voz alta con síntesis de voz, así que ' +
        'evita listas, markdown, símbolos o texto pensado para leerse con los ojos. ' +
        'Si el usuario pide ir a algún lugar de la app o abrir un módulo, usa navigate_app. Si pide ' +
        'ajustar cómo se ve la interfaz (tamaño de letra, contraste, animaciones), usa set_accessibility. ' +
        'Si pregunta algo sobre el sistema Braille, sobre su lección, o sobre la plataforma, respóndele ' +
        'directamente con una explicación MUY corta (1-3 frases breves). Si de plano no sabes o no ' +
        'aplica, dilo brevemente en vez de inventar.\n\n' +
        'MUY IMPORTANTE: esto es un comando de voz de un solo turno — el usuario NO puede contestarte, ' +
        'no hay micrófono abierto esperando su respuesta hasta que vuelva a decir "Braulio" desde cero. ' +
        'Por eso NUNCA hagas preguntas de aclaración ni le pidas que elija entre opciones. Si algo es ' +
        'ambiguo, toma la interpretación más razonable y actúa o responde directamente con ella (puedes ' +
        'mencionar de pasada qué asumiste, en una frase, pero sin preguntar). Da una sola respuesta ' +
        'completa y ciérrala ahí.\n\n' +
        'TONO: cálido y directo, de tú, sin apodos ni muletillas como "amigo" — no hace falta para sonar cercano.\n\n' +
        'TRANSCRIPCIÓN IMPERFECTA: a veces el micrófono empieza a grabar un poco tarde y el texto llega ' +
        'incompleto o cortado a la mitad — roto de verdad, sin verbo ni estructura, tipo "cuantos que" o ' +
        '"...anto me falta". SOLO en ese caso (el texto en sí está quebrado) contesta en una frase corta y ' +
        'neutral, algo como "No alcancé a escuchar bien, repítelo" (esto NO es una pregunta de aclaración: ' +
        'es una respuesta completa y autosuficiente, no rompe la regla de arriba). Si en cambio el texto es ' +
        'una pregunta clara y completa que simplemente no puedes contestar por falta de información (por ' +
        'ejemplo, te preguntan tu progreso pero no te dieron esos datos), NO digas que no escuchaste bien — ' +
        'usa la instrucción de arriba: dilo brevemente, sin inventar.\n\n' +
        'VELOCIDAD: cada respuesta se escucha en voz alta con una espera de red de por medio, así que ' +
        'cada palabra de más cuesta tiempo real — prioriza contestar corto y directo sobre ser ' +
        'exhaustivo. Cuando uses navigate_app o set_accessibility, SIEMPRE acompaña esa misma llamada ' +
        'con tu frase de confirmación en el mismo turno — no esperes a "ver" el resultado de la ' +
        'herramienta antes de hablar, ya sabes que va a funcionar. Nunca llames a una herramienta sin ' +
        'texto y dejes la confirmación para un turno después.\n\n' +
        (pageLabel
            ? `UBICACIÓN ACTUAL: el usuario está ahora mismo en la sección "${pageLabel}" de la app` +
              (pageInfo?.desc ? ` (${pageInfo.desc})` : '') +
              '. Las secciones son Inicio, Cursos, Cuentos y Mensajes. Si pregunta en qué página, sección o ' +
              'pantalla está, o algo como "¿dónde estoy?", contesta con ESTE nombre exacto — nunca digas ' +
              'que no lo sabes ni menciones el nombre técnico de la ruta.'
            : '') +
        (lessonNote ? `\n\n${lessonNote}` : '')
    );
}

// Del texto acumulado (`buffer`), entrega las oraciones que ya quedaron
// completas después de `consumed` (punto/signo de cierre + espacio), sin
// tocar lo que todavía podría seguir creciendo. Se usa para hablar cada
// oración apenas está lista, sin esperar a que termine toda la respuesta.
function extractReadySentences(buffer, consumed) {
    const sentences = [];
    const re = /[.!?…]+(?=\s)/g;
    re.lastIndex = consumed;
    let match;
    let lastEnd = consumed;
    while ((match = re.exec(buffer))) {
        const end = match.index + match[0].length;
        const sentence = buffer.slice(lastEnd, end).trim();
        if (sentence) sentences.push(sentence);
        lastEnd = end;
    }
    return { sentences, newConsumedLength: lastEnd };
}

/**
 * @param {string} userText - lo que transcribió el motor de voz
 * @param {{currentPage?: string}} context
 * @param {{onSentence?: (sentence: string) => void}} options - si se pasa,
 *   se llama con cada oración en cuanto queda completa (antes de que termine
 *   toda la respuesta).
 * @returns {Promise<{text: string, actions: Array<{tool: string, input: object}>}>}
 */
async function ask(userText, context = {}, { onSentence } = {}) {
    const c = getClient();
    if (!c) throw new Error('ANTHROPIC_API_KEY no configurada');

    const messages = [{ role: 'user', content: userText }];
    let finalText = '';
    const actions = [];

    for (let i = 0; i < MAX_TOOL_ITERATIONS; i++) {
        let buffer = '';
        let consumed = 0;

        const stream = c.messages.stream({
            model: MODEL_ID,
            max_tokens: MAX_TOKENS,
            system: buildSystemPrompt(context),
            tools: TOOLS,
            messages,
        });

        if (onSentence) {
            stream.on('text', (delta) => {
                buffer += delta;
                const { sentences, newConsumedLength } = extractReadySentences(buffer, consumed);
                consumed = newConsumedLength;
                sentences.forEach(onSentence);
            });
        }

        const response = await stream.finalMessage();

        const textBlocks = response.content.filter((b) => b.type === 'text').map((b) => b.text);
        const turnText = textBlocks.join(' ').trim();
        if (turnText) finalText = turnText;

        // Lo que quedó sin formar una oración completa (o la respuesta entera,
        // si no se pidió streaming) se manda al final de este turno.
        if (onSentence && buffer.length > consumed) {
            const tail = buffer.slice(consumed).trim();
            if (tail) onSentence(tail);
        }

        const toolUseBlocks = response.content.filter((b) => b.type === 'tool_use');
        if (response.stop_reason !== 'tool_use' || toolUseBlocks.length === 0) break;

        messages.push({ role: 'assistant', content: response.content });

        const toolResults = [];
        for (const toolUse of toolUseBlocks) {
            actions.push({ tool: toolUse.name, input: toolUse.input || {} });
            toolResults.push({ type: 'tool_result', tool_use_id: toolUse.id, content: 'ok' });
        }
        messages.push({ role: 'user', content: toolResults });

        // Si ya tenemos acción(es) y algo de texto para decir, no hace falta
        // seguir dándole más vueltas al loop.
        if (actions.length && finalText) break;
    }

    return { text: finalText, actions };
}

module.exports = { ask, checkSetup };
