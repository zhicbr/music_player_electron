const { app, BrowserWindow, ipcMain, dialog, Menu } = require('electron');
const Store = require('electron-store');
const fs = require('fs/promises');
const path = require('path'); 
const musicMetadata = require('music-metadata');
const slugify = require('slugify');

// 修改存储设置
const store = new Store({
  defaults: {
    musicFolders: [],
    playlist: [],
    lastPlayedIndex: 0,
    lastPlayedTime: 0,
    isFirstTime: true
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
          
          let cover = null;
          if (metadata.common.picture?.length > 0) {
            cover = {
              format: metadata.common.picture[0].format,
              data: metadata.common.picture[0].data.toString('base64')
            };
          }
          
          musicFiles.push({
            id: slugify(`${Date.now()}-${entry.name}`, { lower: true, strict: true }),
            path: fullPath,
            title: metadata.common.title || path.parse(entry.name).name,
            artist: metadata.common.artist || 'Unknown Artist',
            duration: metadata.format.duration || 0,
            cover
          });
        } catch (error) {
          console.error('Error parsing music file:', error);
        }
      }
    }
  }
  
  const currentList = store.get('playlist');
  store.set('playlist', [...currentList, ...musicFiles]);

  // 如果是首次扫描，初始化播放状态
  if (store.get('isFirstTime') && musicFiles.length > 0) {
    store.set('isFirstTime', false);
    store.set('lastPlayedIndex', 0);
    store.set('lastPlayedTime', 0);
  }
  
  return musicFiles;
}

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    icon:'resources/picture/icon.png',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true
    }
  });

  mainWindow.loadFile('index.html');

  // 创建菜单
  const menu = Menu.buildFromTemplate([
    {
      label: 'File',
      submenu: [
        {
          label: '选择音乐文件夹',
          click: async () => {
            const result = await dialog.showOpenDialog({
              properties: ['openDirectory']
            });
            if (!result.canceled && result.filePaths.length > 0) {
              const addedFiles = await scanMusicFolder(result.filePaths[0]);
              store.set('musicFolders', [...store.get('musicFolders'), result.filePaths[0]]);
              mainWindow.webContents.send('update-playlist', addedFiles);
            }
          }
        },
        { type: 'separator' },
        { role: 'quit' }
      ]
    }
  ]);

  Menu.setApplicationMenu(menu);
}

// 新增：处理保存播放状态
ipcMain.on('save-playback-state', (_, { index, time }) => {
  store.set('lastPlayedIndex', index);
  store.set('lastPlayedTime', time);
});

ipcMain.handle('get-playlist', () => {
  return {
    playlist: store.get('playlist'),
    lastPlayedIndex: store.get('lastPlayedIndex'),
    lastPlayedTime: store.get('lastPlayedTime')
  };
});

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});