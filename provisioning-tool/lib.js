// Lógica compartida entre la CLI (provision.js) y la interfaz web (server.js),
// para no duplicarla entre las dos.

import { writeFile } from 'node:fs/promises';
import { randomBytes } from 'node:crypto';
import path from 'node:path';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';

const execAsync = promisify(exec);

export function generateDeviceId() {
    const suffix = randomBytes(3).toString('hex').toUpperCase();
    return `BRL-${suffix}`;
}

// Escribe la config de WiFi + el device_id de fábrica en la partición de arranque
// de la SD. NOTA: formato simplificado para el piloto — ver README para el porqué.
export async function writeProvisioningFile(sdPath, ssid, wifiPassword, deviceId) {
    const filePath = path.join(sdPath, 'braillearn-wifi.json');
    const contents = JSON.stringify({ ssid, password: wifiPassword, device_id: deviceId }, null, 2);
    await writeFile(filePath, contents, 'utf-8');
    return filePath;
}

function extractField(text, labels) {
    for (const label of labels) {
        const re = new RegExp(`^\\s*${label}\\s*:\\s*(.+)$`, 'im');
        const match = text.match(re);
        if (match) return match[1].trim().replace(/^"|"$/g, '');
    }
    return '';
}

// Detecta la red WiFi a la que ya está conectada esta laptop (Windows, vía netsh),
// para no tener que escribirla a mano. Soporta las etiquetas en español y en
// inglés porque "netsh" traduce su salida según el idioma de Windows.
// Si no se puede detectar (otro sistema operativo, sin WiFi conectado, etc.),
// devuelve campos vacíos y quien la llame simplemente los deja para llenar a mano.
export async function detectCurrentWifi() {
    try {
        const { stdout: ifaceOut } = await execAsync('netsh wlan show interfaces');
        const ssid = extractField(ifaceOut, ['SSID']);
        if (!ssid) return { ssid: '', password: '' };

        const { stdout: profileOut } = await execAsync(`netsh wlan show profile name="${ssid}" key=clear`);
        const password = extractField(profileOut, ['Contenido de la clave', 'Key Content']);
        return { ssid, password };
    } catch {
        return { ssid: '', password: '' };
    }
}
