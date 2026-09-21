// Fase 2b: preguntas abiertas del asistente de voz "Braulio", vía la API de
// Claude (Anthropic) — para todo lo que el enrutador local de comandos
// (src/utils/voiceIntents.js) no reconoce: preguntas sobre Braille, sobre la
// lección actual, o instrucciones dichas de forma libre (navegar, ajustar
// accesibilidad, etc.).
//
// Corre en el proceso principal de Electron para que la API key nunca llegue
// al renderer (ni a las DevTools). Requiere ANTHROPIC_API_KEY en el .env.

const Anthropic = require('@anthropic-ai/sdk');

// Sonnet 5 en vez de Opus 5: para comandos cortos y preguntas de Braille no
// hace falta el modelo más grande, y Sonnet responde bastante más rápido
// (importa mucho aquí, porque la respuesta se dice en voz alta después).
const MODEL_ID = 'claude-sonnet-5';
const MAX_TOOL_ITERATIONS = 3;

let client = null;
function getClient() {
    if (client) return client;
    if (!process.env.ANTHROPIC_API_KEY) return null;
    client = new Anthropic(); // lee ANTHROPIC_API_KEY del entorno automáticamente
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
                    'ultima-leccion',
                    'modulo-1',
                    'modulo-2',
                    'modulo-3',
                ],
                description:
                    'inicio=página principal, cursos=camino de módulos, ' +
                    'mensajes=donde un familiar escribe un mensaje que llega al display Braille, ' +
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

function buildSystemPrompt(context) {
    return (
        'Eres "Braulio", el asistente de voz de Braillearn, una plataforma que enseña Braille a ' +
        'personas ciegas o con baja visión en México. Respondes siempre en español de México, de forma ' +
        'breve, cálida y clara — lo que digas se va a leer en voz alta con síntesis de voz, así que ' +
        'evita listas, markdown, símbolos o texto pensado para leerse con los ojos. ' +
        'Si el usuario pide ir a algún lugar de la app o abrir un módulo, usa navigate_app. Si pide ' +
        'ajustar cómo se ve la interfaz (tamaño de letra, contraste, animaciones), usa set_accessibility. ' +
        'Si pregunta algo sobre el sistema Braille, sobre su lección, o sobre la plataforma, respóndele ' +
        'directamente con una explicación corta (2-4 frases). Si de plano no sabes o no aplica, dilo ' +
        'brevemente en vez de inventar.\n\n' +
        'MUY IMPORTANTE: esto es un comando de voz de un solo turno — el usuario NO puede contestarte, ' +
        'no hay micrófono abierto esperando su respuesta hasta que vuelva a decir "Braulio" desde cero. ' +
        'Por eso NUNCA hagas preguntas de aclaración ni le pidas que elija entre opciones. Si algo es ' +
        'ambiguo, toma la interpretación más razonable y actúa o responde directamente con ella (puedes ' +
        'mencionar de pasada qué asumiste, en una frase, pero sin preguntar). Da una sola respuesta ' +
        'completa y ciérrala ahí.\n\n' +
        'VELOCIDAD: cada respuesta se escucha en voz alta con una espera de red de por medio, así que ' +
        'cada segundo cuenta. Cuando uses navigate_app o set_accessibility, SIEMPRE acompaña esa misma ' +
        'llamada con tu frase de confirmación en el mismo turno — no esperes a "ver" el resultado de la ' +
        'herramienta antes de hablar, ya sabes que va a funcionar. Nunca llames a una herramienta sin ' +
        'texto y dejes la confirmación para un turno después.' +
        (context?.currentPage ? ` El usuario está ahora mismo en la sección "${context.currentPage}" de la app.` : '')
    );
}

/**
 * @param {string} userText - lo que transcribió el motor de voz
 * @param {{currentPage?: string}} context
 * @returns {Promise<{text: string, actions: Array<{tool: string, input: object}>}>}
 */
async function ask(userText, context = {}) {
    const c = getClient();
    if (!c) throw new Error('ANTHROPIC_API_KEY no configurada');

    const messages = [{ role: 'user', content: userText }];
    let finalText = '';
    const actions = [];

    for (let i = 0; i < MAX_TOOL_ITERATIONS; i++) {
        const response = await c.messages.create({
            model: MODEL_ID,
            max_tokens: 1024,
            system: buildSystemPrompt(context),
            tools: TOOLS,
            messages,
        });

        const textBlocks = response.content.filter((b) => b.type === 'text').map((b) => b.text);
        if (textBlocks.length) finalText = textBlocks.join(' ').trim();

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
