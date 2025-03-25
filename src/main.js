const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

if (require('electron-squirrel-startup')) {
  app.quit();
}

const createWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    icon: path.join(__dirname, 'favicon.ico'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false, 
      preload: path.join(__dirname, 'preload.js') 
    },
  });

  mainWindow.maximize();
  mainWindow.setMenuBarVisibility(false);
  mainWindow.loadFile(path.join(__dirname, 'pages/index.html'));
  // Comment out openDevTools in production
  // mainWindow.webContents.openDevTools();
};

// File operations
const userDataPath = app.getPath('userData');
const notesFilePath = path.join(userDataPath, 'notes.json');

function saveNotesToFile(notes) {
  fs.writeFileSync(notesFilePath, JSON.stringify(notes, null, 2));
}

function loadNotesFromFile() {
  if (fs.existsSync(notesFilePath)) {
    return JSON.parse(fs.readFileSync(notesFilePath));
  }
  return [];
}

// Setup IPC handlers
ipcMain.handle('load-notes', () => {
  return loadNotesFromFile();
});

ipcMain.handle('save-notes', (event, notes) => {
  saveNotesToFile(notes);
  return true;
});

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
