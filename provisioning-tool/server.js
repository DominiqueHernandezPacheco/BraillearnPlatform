// Interfaz web de la herramienta de aprovisionamiento. Corre en tu laptop,
// nunca se despliega — es para ti/el técnico, nunca para la familia.
//
// Uso: node server.js   (o "npm start" desde esta carpeta)
// Abre http://localhost:3500 automáticamente.

import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { exec } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { generateDeviceId, writeProvisioningFile, detectCurrentWifi } from './lib.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = 3500;

async function readBody(req) {
    let body = '';
    for await (const chunk of req) body += chunk;
    return body ? JSON.parse(body) : {};
}

function sendJson(res, status, data) {
    res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify(data));
}

const server = createServer(async (req, res) => {
    try {
        if (req.method === 'GET' && req.url === '/') {
            const html = await readFile(path.join(__dirname, 'public', 'index.html'), 'utf-8');
            res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end(html);
            return;
        }

        if (req.method === 'GET' && req.url === '/api/wifi') {
            const info = await detectCurrentWifi();
            sendJson(res, 200, info);
            return;
        }

        if (req.method === 'POST' && req.url === '/api/provision') {
            const { ssid, password, sdPath } = await readBody(req);

            if (!ssid || !sdPath) {
                sendJson(res, 400, { error: 'Falta el nombre de la red o la ruta de la SD.' });
                return;
            }

            const deviceId = generateDeviceId();
            const filePath = await writeProvisioningFile(sdPath, ssid, password || '', deviceId);
            sendJson(res, 200, { deviceId, ssid, filePath });
            return;
        }

        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('No encontrado');
    } catch (err) {
        sendJson(res, 500, { error: err.message });
    }
});

server.listen(PORT, () => {
    const url = `http://localhost:${PORT}`;
    console.log(`Aprovisionamiento corriendo en ${url}`);
    // Abre el navegador automáticamente en Windows (no falla si no puede)
    exec(`start "" "${url}"`, () => {});
});
