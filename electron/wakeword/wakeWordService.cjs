// Servicio de "wake word" (palabra de activación) — corre en el proceso
// principal de Electron, escuchando el micrófono en segundo plano con muy
// bajo consumo de CPU, hasta detectar "Braulio". Cuando la detecta, avisa
// a quien lo esté escuchando (main.cjs) vía callback.
//
// Requiere dos archivos que se generan en https://console.picovoice.ai/
// (sección Porcupine → "Create Custom Wake Word"):
//   - electron/wakeword/Braulio.ppn            (la palabra entrenada)
//   - electron/wakeword/porcupine_params_es.pv  (modelo del idioma, si se
//     entrenó en español; si se entrenó en inglés no hace falta este archivo)
//
// Y la AccessKey de Picovoice en el .env de la raíz del proyecto:
//   PICOVOICE_ACCESS_KEY=xxxxx

const path = require('path');
const fs = require('fs');
const { Porcupine, BuiltinKeyword } = require('@picovoice/porcupine-node');
const { PvRecorder } = require('@picovoice/pvrecorder-node');

const WAKEWORD_DIR = __dirname;
const KEYWORD_PATH = path.join(WAKEWORD_DIR, 'Braulio.ppn');
const MODEL_PATH_ES = path.join(WAKEWORD_DIR, 'porcupine_params_es.pv');

class WakeWordService {
  constructor() {
    this.porcupine = null;
    this.recorder = null;
    this.running = false;
    this._loopPromise = null;
  }

  /**
   * @returns {{ready: boolean, reason?: string}} si faltan archivos o
   * AccessKey, no lanza excepción: devuelve el motivo para que la app
   * pueda seguir funcionando sin wake word mientras se termina de configurar.
   */
  checkSetup() {
    const accessKey = process.env.PICOVOICE_ACCESS_KEY;
    if (!accessKey) {
      return { ready: false, reason: 'Falta PICOVOICE_ACCESS_KEY en el archivo .env' };
    }
    if (!fs.existsSync(KEYWORD_PATH)) {
      return { ready: false, reason: `Falta el archivo ${path.basename(KEYWORD_PATH)} en electron/wakeword/` };
    }
    return { ready: true };
  }

  /**
   * Inicia la escucha continua. Llama a onWake() cada vez que se detecta
   * "Braulio". No bloquea: corre su propio loop async.
   */
  async start(onWake) {
    if (this.running) return;

    const setup = this.checkSetup();
    if (!setup.ready) {
      console.warn(`[WakeWord] Deshabilitado: ${setup.reason}`);
      return setup;
    }

    const accessKey = process.env.PICOVOICE_ACCESS_KEY;
    const hasSpanishModel = fs.existsSync(MODEL_PATH_ES);

    try {
      this.porcupine = hasSpanishModel
        ? new Porcupine(accessKey, [KEYWORD_PATH], [0.5], MODEL_PATH_ES)
        : new Porcupine(accessKey, [KEYWORD_PATH], [0.5]);
    } catch (err) {
      console.error('[WakeWord] Error al inicializar Porcupine:', err.message);
      return { ready: false, reason: err.message };
    }

    this.recorder = new PvRecorder(this.porcupine.frameLength);
    this.recorder.start();
    this.running = true;

    console.log(`[WakeWord] Escuchando "Braulio" (dispositivo: ${this.recorder.getSelectedDevice()})`);

    this._loopPromise = (async () => {
      while (this.running) {
        try {
          const frame = await this.recorder.read();
          const keywordIndex = this.porcupine.process(frame);
          if (keywordIndex !== -1) {
            console.log('[WakeWord] ¡"Braulio" detectado!');
            onWake();
          }
        } catch (err) {
          if (this.running) console.error('[WakeWord] Error en el loop de escucha:', err.message);
          break;
        }
      }
    })();

    return { ready: true };
  }

  async stop() {
    this.running = false;
    if (this._loopPromise) await this._loopPromise.catch(() => {});
    if (this.recorder) {
      try { this.recorder.stop(); this.recorder.release(); } catch { /* noop */ }
      this.recorder = null;
    }
    if (this.porcupine) {
      try { this.porcupine.release(); } catch { /* noop */ }
      this.porcupine = null;
    }
  }
}

module.exports = { WakeWordService };
