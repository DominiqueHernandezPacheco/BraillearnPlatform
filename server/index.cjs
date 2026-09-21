// Servidor local mínimo para que el asistente de voz "Braulio" funcione
// también en el navegador (Chrome, para pruebas), no solo dentro de
// Electron. La API key de Anthropic vive SOLO aquí, en el servidor —
// nunca se manda al navegador. Reusa la misma lógica que ya usa Electron
// (electron/claude/claudeService.cjs), para no duplicar el prompt ni las
// herramientas.
//
// Uso: `npm run server` (o `npm run dev:web` para levantarlo junto con Vite).
// El navegador le pega a esto vía el proxy de Vite (ver vite.config.js),
// así que en dev no hace falta configurar CORS manualmente para el puerto
// de Vite, pero lo dejamos habilitado por si se prueba desde otro origen.

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const express = require('express');
const cors = require('cors');
const claudeService = require('../electron/claude/claudeService.cjs');
const piperService = require('../electron/tts/piperService.cjs');
const ttsService = require('../electron/tts/ttsService.cjs');

const PORT = process.env.VOICE_SERVER_PORT || 8787;

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
    res.json({ ok: true, claude: claudeService.checkSetup(), tts: ttsService.status() });
});

app.post('/api/ask-claude', async (req, res) => {
    const { text, context } = req.body || {};
    if (!text || typeof text !== 'string') {
        return res.status(400).json({ error: 'Falta "text" (string) en el body.' });
    }
    try {
        const result = await claudeService.ask(text, context || {});
        res.json(result);
    } catch (err) {
        console.error('[server] Error de Claude:', err.message);
        res.status(500).json({ text: '', actions: [], error: err.message });
    }
});

app.get('/api/tts/voices', (_req, res) => {
    res.json(piperService.listVoices());
});

app.post('/api/tts', async (req, res) => {
    const { text, voiceId, rate } = req.body || {};
    if (!text || typeof text !== 'string') {
        return res.status(400).json({ error: 'Falta "text" (string) en el body.' });
    }
    try {
        const { audio, mime } = await ttsService.synthesize(text, voiceId, rate);
        res.set('Content-Type', mime);
        res.send(audio);
    } catch (err) {
        console.error('[server] Error de voz:', err.message);
        res.status(500).json({ error: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`[server] Escuchando en http://localhost:${PORT}`);
    const status = claudeService.checkSetup();
    if (!status.ready) console.warn('[server] Claude no está listo:', status.reason);
});
