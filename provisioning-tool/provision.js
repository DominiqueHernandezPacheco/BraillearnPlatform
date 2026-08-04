// Herramienta de aprovisionamiento — la usa el técnico (no la familia) una sola vez
// por cada Raspberry Pi, antes de entregarlo. Su único trabajo es dejar la SD lista
// con el WiFi y un device_id de fábrica.
//
// El emparejamiento con la cuenta de la familia NO pasa por aquí: el backend real
// (braille_translate/routers/device.py) ya resuelve eso solo — cuando el Raspberry
// prenda en casa de la familia y llame a POST /device/pair/request con este mismo
// device_id, la familia (ya logueada en la app con su cuenta) lo confirma ella
// misma desde /device/pair/pending + /device/pair/confirm. Por eso este script no
// pide correo ni llama ninguna API de pairing — eso es self-service, no de fábrica.
//
// Uso: node provision.js   (o "npm start" desde esta carpeta)

import { createInterface } from 'node:readline';
import { generateDeviceId, writeProvisioningFile } from './lib.js';

// Usamos la API clásica de readline (no readline/promises): con esa, question()
// se queda colgado en la segunda pregunta cuando el input no viene de una terminal
// interactiva (por ejemplo, al probar el script con datos por pipe).
const rl = createInterface({ input: process.stdin, output: process.stdout });

// Encadena las preguntas dentro del propio callback de readline, en vez de usar
// await entre llamadas sueltas — así no compite con el evento 'close' que Node
// dispara apenas se agota el input (pasa con pipes, no con una terminal real).
function askAll(questions) {
    return new Promise((resolve) => {
        const answers = [];
        let i = 0;
        function next() {
            if (i >= questions.length) {
                resolve(answers);
                return;
            }
            rl.question(questions[i], (answer) => {
                answers.push(answer);
                i += 1;
                next();
            });
        }
        next();
    });
}

async function main() {
    console.log('== Braillearn — Aprovisionamiento de una unidad nueva ==\n');
    console.log('Esto solo prepara la red y el ID del dispositivo. El emparejamiento');
    console.log('con la cuenta de la familia lo confirma la familia misma desde la app,');
    console.log('cuando el Raspberry ya esté encendido en su casa.\n');

    const [ssid, wifiPassword, sdPath] = await askAll([
        'Nombre de la red WiFi (SSID): ',
        'Contraseña del WiFi: ',
        'Ruta de la partición de arranque de la SD (ej. D:\\): ',
    ]);

    const deviceId = generateDeviceId();

    console.log('\nEscribiendo configuración en la SD...');
    const filePath = await writeProvisioningFile(sdPath, ssid, wifiPassword, deviceId);
    console.log(`  Listo: ${filePath}`);

    console.log('\n== Unidad lista ==');
    console.log(`  ID del dispositivo : ${deviceId}`);
    console.log(`  Red WiFi grabada    : ${ssid}`);
    console.log('\nPega la etiqueta con el ID, saca la SD y métela al Raspberry.');
    console.log('La familia confirma el emparejamiento ella misma desde la app la');
    console.log('primera vez que prenda el equipo en su casa.');

    rl.close();
}

main().catch((err) => {
    console.error('\nAlgo falló durante el aprovisionamiento:', err.message);
    rl.close();
    process.exitCode = 1;
});
