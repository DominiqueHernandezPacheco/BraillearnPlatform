// Servidor de "Braulio" para el navegador. Hace dos cosas:
//
//   · API: preguntas abiertas a Claude y voz (ElevenLabs con caché). Las claves
//     viven SOLO aquí, nunca llegan al navegador. Reusa la misma lógica que usa
//     Electron (electron/claude/claudeService.cjs y electron/tts/ttsService.cjs).
//   · En producción (NODE_ENV=production) también sirve la web ya compilada
//     (carpeta dist) y activa las protecciones para uso público: topes de texto,
//     límite de peticiones por IP, un cupo diario de voz NUEVA (lo que ya está en
//     la caché no cuenta) y un tope diario de preguntas a Claude. Sin esto,
//     cualquiera podría gastar los créditos.
//
// Desarrollo:  `npm run server` (o `npm run dev:web`, que lo levanta junto con
//              Vite; el navegador le pega vía el proxy de vite.config.js).
// Producción:  ver deploy/README.md.
//
// Variables (todas opcionales salvo las claves):
//   PORT                              puerto (Render y AWS lo asignan; si no, VOICE_SERVER_PORT o 8787)
//   TRUST_PROXY=1                     detrás de un proxy (Caddy/nginx): usa la IP real del visitante
//   ALLOWED_ORIGINS                   orígenes web permitidos (coma). Sin esto, en producción solo mismo origen
//   CLAUDE_PER_MINUTE / CLAUDE_PER_DAY_PER_IP / CLAUDE_PER_DAY
//   TTS_PER_MINUTE / UNCACHED_CHARS_PER_DAY_PER_IP / UNCACHED_CHARS_PER_DAY
//   ENABLE_LIMITS=1                   activa los límites también fuera de producción (para probarlos)

const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const express = require('express');
const cors = require('cors');
const claudeService = require('../electron/claude/claudeService.cjs');
const piperService = require('../electron/tts/piperService.cjs');
const ttsService = require('../electron/tts/ttsService.cjs');

const isProd = process.env.NODE_ENV === 'production';
const protect = isProd || process.env.ENABLE_LIMITS === '1';
const PORT = process.env.PORT || process.env.VOICE_SERVER_PORT || 8787;
const DIST = path.join(__dirname, '..', 'dist');

const num = (name, fallback) => {
    const value = Number(process.env[name]);
    return Number.isFinite(value) && value > 0 ? value : fallback;
};

const LIMITS = {
    claudeText: 400,
    ttsText: 600,
    claudePerMinute: num('CLAUDE_PER_MINUTE', 6),
    claudePerDayPerIp: num('CLAUDE_PER_DAY_PER_IP', 60),
    claudePerDay: num('CLAUDE_PER_DAY', 400),
    ttsPerMinute: num('TTS_PER_MINUTE', 120),
    uncachedCharsPerDayPerIp: num('UNCACHED_CHARS_PER_DAY_PER_IP', 1500),
    uncachedCharsPerDay: num('UNCACHED_CHARS_PER_DAY', 5000),
};

// ── Protecciones ─────────────────────────────────────────────────────────────
const noLimit = (_req, _res, next) => next();

// Ventana deslizante por IP, en memoria.
function rateLimit({ windowMs, max }) {
    if (!protect) return noLimit;
    const hits = new Map();
    setInterval(() => {
        const now = Date.now();
        for (const [ip, list] of hits) {
            const fresh = list.filter((t) => now - t < windowMs);
            if (fresh.length) hits.set(ip, fresh);
            else hits.delete(ip);
        }
    }, windowMs).unref();

    return (req, res, next) => {
        const now = Date.now();
        const list = (hits.get(req.ip) || []).filter((t) => now - t < windowMs);
        if (list.length >= max) {
            res.set('Retry-After', String(Math.ceil(windowMs / 1000)));
            return res.status(429).json({ error: 'Demasiadas peticiones. Espera un momento.' });
        }
        list.push(now);
        hits.set(req.ip, list);
        return next();
    };
}

// Contador por IP y total, que se reinicia cada día.
function dailyCounter() {
    const today = () => new Date().toISOString().slice(0, 10);
    let day = today();
    let total = 0;
    const byIp = new Map();
    const roll = () => {
        if (today() !== day) {
            day = today();
            total = 0;
            byIp.clear();
        }
    };
    return {
        ip(ip) { roll(); return byIp.get(ip) || 0; },
        total() { roll(); return total; },
        add(ip, n) { roll(); byIp.set(ip, (byIp.get(ip) || 0) + n); total += n; },
    };
}

const claudeDaily = dailyCounter();
const ttsDaily = dailyCounter();

// ── App ──────────────────────────────────────────────────────────────────────
const app = express();
app.disable('x-powered-by');
if (process.env.TRUST_PROXY === '1') app.set('trust proxy', 1);

app.use((_req, res, next) => {
    res.set({
        'X-Content-Type-Options': 'nosniff',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'Permissions-Policy': 'microphone=(self), camera=(), geolocation=()',
    });
    next();
});

// CORS: abierto solo en desarrollo. En producción la web y la API comparten
// origen (no hace falta CORS); ALLOWED_ORIGINS permite otros explícitamente.
const allowedOrigins = (process.env.ALLOWED_ORIGINS || '').split(',').map((s) => s.trim()).filter(Boolean);
if (!isProd) app.use(cors());
else if (allowedOrigins.length) app.use(cors({ origin: allowedOrigins }));

app.use(express.json({ limit: '16kb' }));

app.get('/api/health', (_req, res) => {
    if (isProd) return res.json({ ok: true });
    return res.json({ ok: true, claude: claudeService.checkSetup(), tts: ttsService.status() });
});

app.post('/api/ask-claude', rateLimit({ windowMs: 60000, max: LIMITS.claudePerMinute }), async (req, res) => {
    const { text, context } = req.body || {};
    if (!text || typeof text !== 'string' || text.length > LIMITS.claudeText) {
        return res.status(400).json({ error: `Falta "text" (string de hasta ${LIMITS.claudeText} caracteres).` });
    }
    if (protect && (claudeDaily.ip(req.ip) >= LIMITS.claudePerDayPerIp || claudeDaily.total() >= LIMITS.claudePerDay)) {
        return res.status(429).json({ text: '', actions: [], error: 'Se alcanzó el límite diario de preguntas. Vuelve mañana.' });
    }
    claudeDaily.add(req.ip, 1);
    try {
        const result = await claudeService.ask(text, context && typeof context === 'object' ? context : {});
        return res.json(result);
    } catch (err) {
        console.error('[server] Error de Claude:', err.message);
        return res.status(500).json({ text: '', actions: [], error: err.message });
    }
});

// Solo para desarrollo (lista las voces de Piper instaladas).
if (!isProd) {
    app.get('/api/tts/voices', (_req, res) => {
        res.json(piperService.listVoices());
    });
}

app.post('/api/tts', rateLimit({ windowMs: 60000, max: LIMITS.ttsPerMinute }), async (req, res) => {
    const { text, voiceId, rate } = req.body || {};
    if (!text || typeof text !== 'string' || text.length > LIMITS.ttsText) {
        return res.status(400).json({ error: `Falta "text" (string de hasta ${LIMITS.ttsText} caracteres).` });
    }
    const safeRate = Math.min(2, Math.max(0.5, Number(rate) || 1));
    const safeVoice = typeof voiceId === 'string' && /^[A-Za-z0-9_.-]{1,64}$/.test(voiceId) ? voiceId : undefined;
    const chars = text.trim().length;

    // Lo ya guardado se dice siempre; voz NUEVA (que cuesta créditos) tiene un cupo diario.
    if (protect && !ttsService.isCached(text, safeRate)) {
        if (ttsDaily.ip(req.ip) + chars > LIMITS.uncachedCharsPerDayPerIp || ttsDaily.total() + chars > LIMITS.uncachedCharsPerDay) {
            return res.status(429).json({ error: 'Se alcanzó el cupo diario de voz nueva.' });
        }
    }
    try {
        const { audio, mime, cached } = await ttsService.synthesize(text, safeVoice, safeRate);
        if (cached === false) ttsDaily.add(req.ip, chars);
        res.set('Content-Type', mime);
        return res.send(audio);
    } catch (err) {
        console.error('[server] Error de voz:', err.message);
        return res.status(500).json({ error: err.message });
    }
});

// La web compilada (la landing en / y la plataforma en /plataforma/).
if (fs.existsSync(path.join(DIST, 'index.html'))) {
    app.use(express.static(DIST, {
        setHeaders(res, file) {
            if (file.endsWith('.html')) res.set('Cache-Control', 'no-cache');
            else if (file.includes(`${path.sep}assets${path.sep}`)) res.set('Cache-Control', 'public, max-age=31536000, immutable');
        },
    }));
}

// Errores de cuerpo (JSON mal formado o demasiado grande) como JSON, no como HTML.
app.use((err, _req, res, next) => {
    if (res.headersSent) return next(err);
    const status = err.status || err.statusCode || 500;
    return res.status(status).json({ error: status === 413 ? 'La petición es demasiado grande.' : 'Petición no válida.' });
});

app.listen(PORT, () => {
    console.log(`[server] Escuchando en http://localhost:${PORT}${protect ? ' (con protecciones)' : ''}`);
    const status = claudeService.checkSetup();
    if (!status.ready) console.warn('[server] Claude no está listo:', status.reason);
});
