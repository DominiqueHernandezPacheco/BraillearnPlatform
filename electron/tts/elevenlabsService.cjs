// Voz natural de "Braulio" con ElevenLabs (nube). Lee ELEVENLABS_API_KEY del
// .env — la clave vive solo aquí (Electron / servidor local), nunca llega al
// navegador.
//
// SEGURIDAD: la clave puede tener permisos de toda la cuenta, así que este
// cliente solo puede llamar a las rutas de la lista blanca de abajo (voces,
// saldo de créditos y texto a voz). Cualquier otra ruta se rechaza aquí mismo.
//
// Se usa igual desde Electron (por IPC) y desde el servidor web (por HTTP);
// ambos entran por electron/tts/ttsService.cjs, que añade caché y respaldo.

const API = 'https://api.elevenlabs.io/v1';

// Calidad máxima (más expresivo, ~2 s por frase) y modelo rápido (~0.7 s).
const DEFAULT_MODEL = 'eleven_multilingual_v2';
const FAST_MODEL = 'eleven_flash_v2_5';

// Más expresiva y "jovial" que el valor por defecto (0.5 / 0).
const VOICE_SETTINGS = {
    stability: 0.4,
    similarity_boost: 0.75,
    style: 0.35,
    use_speaker_boost: true,
};

const ALLOWED = [
    { method: 'GET', path: /^\/voices$/ },
    { method: 'GET', path: /^\/user\/subscription$/ },
    { method: 'POST', path: /^\/text-to-speech\/[A-Za-z0-9]+$/ },
];

const apiKey = () => (process.env.ELEVENLABS_API_KEY || '').trim();
const isConfigured = () => apiKey().length > 0;

// Nunca deja la clave en un mensaje de error o log.
const redact = (value) => {
    const key = apiKey();
    return key ? String(value).split(key).join('***') : String(value);
};

async function request(method, pathname, { query, body } = {}) {
    if (!ALLOWED.some((rule) => rule.method === method && rule.path.test(pathname))) {
        throw new Error(`Ruta de ElevenLabs no permitida: ${method} ${pathname}`);
    }
    if (!isConfigured()) throw new Error('Falta ELEVENLABS_API_KEY en el .env');

    const url = new URL(API + pathname);
    for (const [k, v] of Object.entries(query || {})) url.searchParams.set(k, v);

    let res;
    try {
        res = await fetch(url, {
            method,
            headers: {
                'xi-api-key': apiKey(),
                ...(body ? { 'Content-Type': 'application/json' } : {}),
            },
            body: body ? JSON.stringify(body) : undefined,
            signal: AbortSignal.timeout(20000),
        });
    } catch (err) {
        const e = new Error(`No se pudo contactar a ElevenLabs: ${redact(err.message)}`);
        e.code = 'network';
        throw e;
    }

    if (!res.ok) {
        let detail = '';
        try {
            const data = await res.json();
            detail = data?.detail?.message || data?.detail?.status || JSON.stringify(data?.detail ?? data);
        } catch { /* sin cuerpo JSON */ }
        const e = new Error(`ElevenLabs respondió ${res.status}${detail ? `: ${redact(detail)}` : ''}`);
        e.status = res.status;
        // 401 = clave inválida · 402/429 = sin créditos o demasiadas peticiones
        e.code = res.status === 401 ? 'auth' : (res.status === 402 || res.status === 429 || /quota/i.test(detail)) ? 'quota' : 'http';
        throw e;
    }
    return res;
}

// Voces de la cuenta (solo lectura).
async function listVoices() {
    const res = await request('GET', '/voices');
    const data = await res.json();
    return (data.voices || []).map((v) => ({
        id: v.voice_id,
        name: v.name,
        category: v.category,
        labels: v.labels || {},
        previewUrl: v.preview_url,
    }));
}

// Créditos usados / disponibles este mes (solo lectura).
async function getUsage() {
    const res = await request('GET', '/user/subscription');
    const d = await res.json();
    return {
        used: d.character_count,
        limit: d.character_limit,
        tier: d.tier,
        resetsAt: d.next_character_count_reset_unix ? new Date(d.next_character_count_reset_unix * 1000) : null,
    };
}

// Texto -> MP3. `rate` (velocidad del panel de accesibilidad) se acota al
// rango que admite ElevenLabs para la velocidad (0.7 – 1.2).
async function synthesize(text, { voiceId, modelId = DEFAULT_MODEL, rate = 1 } = {}) {
    if (!voiceId) throw new Error('Falta el id de voz de ElevenLabs (ELEVENLABS_VOICE_ID).');
    const speed = Math.min(1.2, Math.max(0.7, Number(rate) || 1));
    const res = await request('POST', `/text-to-speech/${encodeURIComponent(voiceId)}`, {
        query: { output_format: 'mp3_44100_64' },
        body: {
            text,
            model_id: modelId,
            voice_settings: { ...VOICE_SETTINGS, speed },
            // Los modelos rápidos aceptan fijar el idioma (evita que dude con frases cortas)
            ...(/flash|turbo/.test(modelId) ? { language_code: 'es' } : {}),
        },
    });
    return Buffer.from(await res.arrayBuffer());
}

module.exports = {
    isConfigured,
    listVoices,
    getUsage,
    synthesize,
    redact,
    DEFAULT_MODEL,
    FAST_MODEL,
    VOICE_SETTINGS,
};
