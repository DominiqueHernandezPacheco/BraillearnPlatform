const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // Se dispara justo cuando se detecta "Braulio" (antes de capturar el comando)
  onWakeWord: (callback) => {
    const listener = () => callback();
    ipcRenderer.on('wake-word-detected', listener);
    return () => ipcRenderer.removeListener('wake-word-detected', listener);
  },
  // Se dispara con el texto ya transcrito del comando (motor local: Porcupine
  // + STT, o Whisper local — el proceso principal decide cuál usar)
  onCommandCaptured: (callback) => {
    const listener = (_event, text) => callback(text);
    ipcRenderer.on('braulio-command-captured', listener);
    return () => ipcRenderer.removeListener('braulio-command-captured', listener);
  },
  // Progreso de descarga del modelo Whisper (solo la primera vez)
  onModelProgress: (callback) => {
    const listener = (_event, progress) => callback(progress);
    ipcRenderer.on('braulio-model-progress', listener);
    return () => ipcRenderer.removeListener('braulio-model-progress', listener);
  },
  getWakeWordStatus: () => ipcRenderer.invoke('wake-word-status'),
  // Aviso empujado por el proceso principal en cuanto el motor de voz (Porcupine
  // o Whisper local) termina de arrancar — puede tardar varios segundos la
  // primera vez (carga del modelo), así que esto llega después de que la
  // ventana ya está mostrando la app.
  onVoiceEngineStatus: (callback) => {
    const listener = (_event, status) => callback(status);
    ipcRenderer.on('voice-engine-status', listener);
    return () => ipcRenderer.removeListener('voice-engine-status', listener);
  },
  // Fase 2b: pregunta abierta -> Claude. Devuelve { text, navigateTo, error? }
  askClaude: (text, context) => ipcRenderer.invoke('ask-claude', { text, context }),

  // Fase 3: voz de Braulio con Piper (local). Devuelve { audio: ArrayBuffer, error? }
  synthesizeSpeech: (text, voiceId, rate) => ipcRenderer.invoke('synthesize-speech', { text, voiceId, rate }),
  getTtsStatus: () => ipcRenderer.invoke('tts-status'),
  getTtsVoices: () => ipcRenderer.invoke('tts-voices'),
});
