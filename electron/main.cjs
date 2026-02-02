const { app, BrowserWindow } = require('electron');
const path = require('path');

let mainWindow;

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
    `file://${path.join(__dirname, '../dist/index.html')}`;

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

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});