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
  // Activar a Braulio a mano (sin decir la palabra clave). start devuelve
  // { ok, reason? }; el texto llega por onCommandCaptured. autoStop: corta solo
  // al dejar de hablar (botón); sin autoStop sigue hasta stopVoiceCapture()
  // (mantener una tecla).
  startVoiceCapture: (options) => ipcRenderer.invoke('braulio-capture-start', options),
  stopVoiceCapture: () => ipcRenderer.invoke('braulio-capture-stop'),
  // Avisa cuando Braulio empieza/termina de hablar, para que el motor de voz
  // local no intente detectar "Braulio" en su propia voz.
  setAssistantSpeaking: (speaking) => ipcRenderer.send('braulio-assistant-speaking', !!speaking),
  // Avisa que ya terminó de decir "Dime" (o el equivalente) y se puede grabar
  // el comando de verdad — ver 'braulio-ready-to-listen' en main.cjs.
  notifyReadyToListen: () => ipcRenderer.send('braulio-ready-to-listen'),
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
  // Cada oración de la respuesta de Claude, en cuanto está lista (antes de
  // que termine toda la respuesta) — ver 'ask-claude' arriba.
  onAnswerChunk: (callback) => {
    const listener = (_event, sentence) => callback(sentence);
    ipcRenderer.on('braulio-answer-chunk', listener);
    return () => ipcRenderer.removeListener('braulio-answer-chunk', listener);
  },

  // Fase 3: voz de Braulio con Piper (local). Devuelve { audio: ArrayBuffer, error? }
  synthesizeSpeech: (text, voiceId, rate) => ipcRenderer.invoke('synthesize-speech', { text, voiceId, rate }),
  getTtsStatus: () => ipcRenderer.invoke('tts-status'),
  getTtsVoices: () => ipcRenderer.invoke('tts-voices'),
});
