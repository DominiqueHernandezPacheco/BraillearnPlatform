const { contextBridge } = require('electron');

// Aquí expondrás tus funciones en el futuro.
// Por ahora, lo dejamos vacío pero seguro.
contextBridge.exposeInMainWorld('electronAPI', {});