const { app, BrowserWindow } = require('electron');
const path = require('path');
require('dotenv').config();
const { startLocalServer } = require('./server');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 750,
    minWidth: 1080,
    minHeight: 680,
    backgroundColor: '#0e1320',
    title: 'EdgeTalk',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.loadFile(path.join(__dirname, 'src', 'index.html'));

  // Uncomment while developing the UI:
  // mainWindow.webContents.openDevTools();
}

app.whenReady().then(() => {
  // Built-in local server — currently just a health check, reserved for
  // future on-system communication features.
  startLocalServer();

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
