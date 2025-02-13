const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const Store = require('electron-store');
const fs = require('fs/promises');
const path = require('path'); 
const musicMetadata = require('music-metadata');
const slugify = require('slugify');

const store = new Store({
  defaults: {
    musicFolders: [],
    playlist: []
  }
});

async function scanMusicFolder(folderPath) {
  const entries = await fs.readdir(folderPath, { withFileTypes: true });
  const musicFiles = [];
  
  for (const entry of entries) {
    if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase();
      if (['.mp3', '.wav', '.flac', '.aac'].includes(ext)) {
        try {
          const fullPath = path.join(folderPath, entry.name);
          const metadata = await musicMetadata.parseFile(fullPath);
          
          musicFiles.push({
            id: slugify(`${Date.now()}-${entry.name}`, { lower: true, strict: true }),
            path: fullPath,
            title: metadata.common.title || entry.name,
            artist: metadata.common.artist || 'Unknown Artist',
            duration: metadata.format.duration || 0
          });
        } catch (error) {
          console.error('Error parsing music file:', error);
        }
      }
    }
  }
  
  const currentList = store.get('playlist');
  store.set('playlist', [...currentList, ...musicFiles]);
  return musicFiles;
}

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1000,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true
    }
  });

  mainWindow.loadFile('index.html');
}

ipcMain.handle('open-directory', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openDirectory']
  });
  if (!result.canceled && result.filePaths.length > 0) {
    const addedFiles = await scanMusicFolder(result.filePaths[0]);
    store.set('musicFolders', [...store.get('musicFolders'), result.filePaths[0]]);
    return addedFiles;
  }
  return [];
});

ipcMain.handle('get-playlist', () => {
  return store.get('playlist');
});

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
