//删除应用程序数据目录
//在开发过程中，我们可能需要清除应用程序数据目录，以便重新生成应用程序数据。
const path = require('path');
const fs = require('fs').promises;

const appName = 'music_player_electron';
const appDataPath = process.env.APPDATA || (process.platform == 'darwin' ? process.env.HOME + '/Library/Application Support' : '/var/local');
const appDirectory = path.join(appDataPath, appName);

async function cleanAppData() {
  try {
    await fs.rm(appDirectory, { recursive: true, force: true });
    console.log(`已成功删除目录：${appDirectory}`);
  } catch (err) {
    console.error(`无法删除目录：${appDirectory}`, err);
  }
}

cleanAppData();