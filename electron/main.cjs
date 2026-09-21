const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const { WakeWordService } = require('./wakeword/wakeWordService.cjs');
const { LocalVoiceService } = require('./voice/localVoiceService.cjs');
const claudeService = require('./claude/claudeService.cjs');
const piperService = require('./tts/piperService.cjs');
const ttsService = require('./tts/ttsService.cjs');

let mainWindow;
const wakeWordService = new WakeWordService();
const localVoiceService = new LocalVoiceService();
let voiceMode = 'none'; // 'porcupine' | 'whisper-local' | 'none'

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    title: "Braillearn",
    icon: path.join(__dirname, '../build/icon.ico'),
    autoHideMenuBar: true,
    fullscreen: true, // Inicia en Pantalla Completa
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true
    },
  });

  const startUrl = process.env.VITE_DEV_SERVER_URL ||
    `file://${path.join(__dirname, '../dist/plataforma/index.html')}`;

  // 1. CARGAMOS LA APP (Esta es la línea clave)
  mainWindow.loadURL(startUrl);

  // 2. CONFIGURAMOS LA TECLA ESC
  mainWindow.webContents.on('before-input-event', (event, input) => {
    if (input.key === 'Escape' && input.type === 'keyDown') {
      if (mainWindow.isFullScreen()) {
        mainWindow.setFullScreen(false); // Salir de pantalla completa
        mainWindow.maximize();           // Maximizar (mostrar barra de tareas y título)
      }
    }
  });
}

app.whenReady().then(async () => {
  createWindow();

  // Descarga Piper (motor + voz) en segundo plano desde ya, para que esté
  // lista para cuando Braulio necesite decir algo, no hasta la primera vez.
  piperService.ensureReady().then(
    () => console.log('[Piper] Listo para hablar.'),
    (err) => console.error('[Piper] No se pudo preparar:', err.message),
  );

  // 1. Intenta Porcupine (rápido, bajo consumo) — necesita AccessKey + .ppn.
  const porcupineResult = await wakeWordService.start(() => {
    mainWindow?.webContents.send('wake-word-detected');
  });

  if (porcupineResult?.ready) {
    voiceMode = 'porcupine';
    console.log('[Voice] Usando Porcupine para "Braulio".');
    mainWindow?.webContents.send('voice-engine-status', { ready: true, engine: 'porcupine' });
    return;
  }

  console.warn('[WakeWord] Porcupine no disponible:', porcupineResult?.reason);

  // 2. Respaldo: Whisper local (más pesado, pero no depende de ninguna
  //    cuenta ni de la API de voz del navegador, que no funciona en Electron).
  const whisperResult = await localVoiceService.start({
    onWake: () => mainWindow?.webContents.send('wake-word-detected'),
    onCommand: (text) => mainWindow?.webContents.send('braulio-command-captured', text),
    onModelProgress: (p) => {
      // p.status suele ser 'downloading' | 'progress' | 'done', según el archivo del modelo
      if (p?.status === 'progress' && mainWindow) {
        mainWindow.webContents.send('braulio-model-progress', p);
      }
    },
    // El micrófono ya reintenta solo varias veces (ver localVoiceService.cjs);
    // esto solo se llama si de plano se rindió — antes moría en silencio y la
    // insignia se quedaba mostrando "listo" para siempre aunque ya no escuchara.
    onFatalError: (reason) => {
      voiceMode = 'none';
      console.error('[Voice] El motor de voz se detuvo y no se pudo recuperar:', reason);
      mainWindow?.webContents.send('voice-engine-status', { ready: false, engine: 'none', reason });
    },
  });

  if (whisperResult?.ready) {
    voiceMode = 'whisper-local';
    console.log('[Voice] Usando Whisper local para "Braulio".');
    mainWindow?.webContents.send('voice-engine-status', { ready: true, engine: 'whisper-local' });
  } else {
    console.error('[Voice] Ningún motor de voz quedó disponible:', whisperResult?.reason);
    mainWindow?.webContents.send('voice-engine-status', { ready: false, engine: 'none', reason: whisperResult?.reason });
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

app.on('before-quit', async () => {
  await Promise.all([wakeWordService.stop(), localVoiceService.stop()]);
});

// Permite al renderer preguntar qué motor de voz quedó activo (para mostrar
// el estado correcto en la insignia del asistente, panel de accesibilidad, etc.)
ipcMain.handle('wake-word-status', () => {
  if (voiceMode === 'porcupine') return { ready: true, engine: 'porcupine' };
  if (voiceMode === 'whisper-local') return { ready: true, engine: 'whisper-local' };
  return { ready: false, engine: 'none', reason: 'Ningún motor de voz local pudo iniciar (revisa la consola de Electron).' };
});

// Activar a Braulio a mano (mantener Ctrl / pulsar su botón), sin decir la
// palabra clave: útil cuando no hay audífonos y el micrófono oye a la vez la
// voz de Braulio y la tuya. El comando transcrito llega al renderer por el mismo
// evento de siempre ('braulio-command-captured').
ipcMain.handle('braulio-capture-start', (_event, { autoStop } = {}) => {
  if (voiceMode !== 'whisper-local') {
    return { ok: false, reason: 'Ahora mismo el micrófono no está disponible para activarme con el teclado.' };
  }
  return localVoiceService.startManualCapture({ autoStop: !!autoStop });
});

ipcMain.handle('braulio-capture-stop', async () => {
  await localVoiceService.finishManualCapture();
  return { ok: true };
});

// Fase 2b: preguntas abiertas del asistente de voz -> API de Claude.
// Se llama solo cuando el comando de voz no matcheó ningún comando local
// (ver src/utils/voiceIntents.js).
ipcMain.handle('ask-claude', async (_event, { text, context } = {}) => {
  try {
    return await claudeService.ask(text, context);
  } catch (err) {
    console.error('[Claude] Error:', err.message);
    return { text: '', navigateTo: null, error: err.message };
  }
});

// Síntesis de voz: ElevenLabs si está configurado (con caché y presupuesto
// mensual), y Piper (100% local) como respaldo. Devuelve el audio como
// ArrayBuffer + su tipo (MP3 de ElevenLabs o WAV de Piper) para que el
// renderer lo reproduzca.
ipcMain.handle('synthesize-speech', async (_event, { text, voiceId, rate } = {}) => {
  try {
    const { audio: buffer, mime } = await ttsService.synthesize(text, voiceId, rate);
    return { audio: buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength), mime };
  } catch (err) {
    console.error('[TTS] Error sintetizando:', err.message);
    return { error: err.message };
  }
});

ipcMain.handle('tts-status', () => piperService.checkSetup());
ipcMain.handle('tts-voices', () => piperService.listVoices());
