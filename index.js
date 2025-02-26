const { app, BrowserWindow, ipcMain, dialog, Menu } = require('electron');
const Store = require('electron-store');
const fs = require('fs/promises');
const path = require('path'); 
const musicMetadata = require('music-metadata');
const slugify = require('slugify');
const { globalShortcut } = require('electron');

// 修改存储设置
const store = new Store({
  defaults: {
    theme: 'light-purple',
    musicFolders: [],
    playlist: [],
    lastPlayedIndex: 0,
    lastPlayedTime: 0,
    isFirstTime: true
  }
});
// 添加IPC处理
ipcMain.handle('get-theme', () => store.get('theme'));
ipcMain.on('save-theme', (_, theme) => store.set('theme', theme));

//去重函数
function deduplicatePlaylist(playlist) {
  const uniqueTracks = [];
  const trackMap = new Map(); // 用于存储已存在的歌曲路径

  for (const track of playlist) {
    if (!trackMap.has(track.path)) {
      trackMap.set(track.path, true); // 标记路径为已存在
      uniqueTracks.push(track);
    }
  }

  return uniqueTracks;
}

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

  //去重处理
  const currentList = store.get('playlist');
  const newList = [...currentList, ...musicFiles];
  const uniqueList = deduplicatePlaylist(newList); // 去重

  store.set('playlist', uniqueList); // 保存去重后的播放列表

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

  globalShortcut.register('CommandOrControl+Shift+P', () => {
    mainWindow.webContents.openDevTools();
  });
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
    },
    {
      label: 'setting',
      submenu: [
        {
          label: 'theme',
          submenu: [
            {
              label: '轻浅紫',
              click: () => mainWindow.webContents.send('change-theme', 'light-purple')
            },
            {
              label: '柠檬黄',
              click: () => mainWindow.webContents.send('change-theme', 'lemon-yellow')
            },
            {
              label: '薄荷绿',
              click: () => mainWindow.webContents.send('change-theme', 'mint-green')
            },
            {
            label: '浅草绿',
            click: () => mainWindow.webContents.send('change-theme', 'meadow-green')
            
          },
          {
            label: '西瓜红',
            click: () => mainWindow.webContents.send('change-theme', 'watermelon-red')
           
          },
          {
            label: '天空蓝',
            click: () =>  mainWindow.webContents.send('change-theme', 'sky-blue')
           
          },
          {
            label: '鲜橙橙',
            click: () => mainWindow.webContents.send('change-theme', 'vivid-orange')
            
          }
            // 添加其他主题...
          ]
        },
      ]
    },
    {
      label: 'about',
      submenu:[
        {
          label: '关于我',
          click: () => {
            dialog.showMessageBox({
              title: '关于我',
              message: '2025'
            });
          }
        },
        {
          label: '联系我',
          click: () => {
            dialog.showMessageBox({
              title: '联系我',
              message: '邮箱：'
            });
          }
        }
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

//处理保存完整播放列表
ipcMain.on('save-full-playlist', (_, playlist) => {
  const uniqueList = deduplicatePlaylist(playlist); // 去重
  store.set('playlist', uniqueList); // 保存去重后的播放列表
});

ipcMain.handle('get-playlist', () => {
  const playlist = store.get('playlist');
  const uniqueList = deduplicatePlaylist(playlist); // 加载时去重
  return {
    playlist: uniqueList,
    lastPlayedIndex: store.get('lastPlayedIndex'),
    lastPlayedTime: store.get('lastPlayedTime')
  };
});

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
  globalShortcut.unregisterAll();
});