// js/theme.js
const { ipcRenderer } = require('electron');

const themes = {
  'light-purple': {
    '--background-color': '#f5e6ff',
    '--visualizer-bg': '#dca3aa4d',
    '--toggle-button-color': '#9a7dff',
    '--list-color': '#e6d5ff',
    '--list-hover': '#d9c7ff',
    '--button-hover': '#6a48cc',
    '--progress-hover': '#8e73d2',
    '--mode-hover': '#3a07e2',
    '--highlight-color': '#7f5fff'
  },
  'lemon-yellow': {
    '--background-color': '#fff9e6',
    '--visualizer-bg': '#ffd7004d',
    '--toggle-button-color': '#ffd700',
    '--list-color': '#fff3cc',
    '--list-hover': '#ffe699',
    '--button-hover': '#ccb300',
    '--progress-hover': '#e6c34d',
    '--mode-hover': '#b38600',
    '--highlight-color': '#ffcc00'
  },
  'meadow-green': {
    '--background-color': '#e6ffe6',
    '--visualizer-bg': 'rgba(127, 255, 127, 0.3)',
    '--toggle-button-color': '#7fff7f',
    '--list-color': '#d5ffd5',
    '--list-hover': '#c7ffc7',
    '--button-hover': '#48cc48',
    '--progress-hover': '#73d273',
    '--mode-hover': '#07e207',
    '--highlight-color': '#66cc66'
  },
  'mint-green': {
    '--background-color': '#e6fff2',
    '--visualizer-bg': '#98fb984d',
    '--toggle-button-color': '#98fb98',
    '--list-color': '#d2ffe6',
    '--list-hover': '#b3ffd9',
    '--button-hover': '#76c7a0',
    '--progress-hover': '#8fd9b6',
    '--mode-hover': '#4d9970',
    '--highlight-color': '#228b22'
  },
  'watermelon-red': {
    '--background-color': '#ffe6e6',
    '--visualizer-bg': 'rgba(255, 107, 107, 0.3)',
    '--toggle-button-color': '#ff6b6b',
    '--list-color': '#ffd5d5',
    '--list-hover': '#ffc7c7',
    '--button-hover': '#cc4848',
    '--progress-hover': '#d27373',
    '--mode-hover': '#e20707',
    '--highlight-color': '#ff6b6b'
  },
  'sky-blue': {
    '--background-color': '#e6f5ff',
    '--visualizer-bg': 'rgba(135, 206, 235, 0.3)',
    '--toggle-button-color': '#87ceeb',
    '--list-color': '#d5ebff',
    '--list-hover': '#c7e3ff',
    '--button-hover': '#489acc',
    '--progress-hover': '#73b3d2',
    '--mode-hover': '#074ce2',
    '--highlight-color': '#6caed9'
  },

  'vivid-orange': {
    '--background-color': '#fff5e6',
    '--visualizer-bg': 'rgba(255, 165, 0, 0.3)',
    '--toggle-button-color': '#ffa500',
    '--list-color': '#ffe5cc',
    '--list-hover': '#ffd699',
    '--button-hover': '#cc8400',
    '--progress-hover': '#d2a34d',
    '--mode-hover': '#b37400',
    '--highlight-color': '#ffa500'
  }
  // 添加其他主题颜色配置...
};

function applyTheme(themeName) {
  const theme = themes[themeName];
  if (!theme) return;

  const root = document.documentElement;
  Object.entries(theme).forEach(([property, value]) => {
    root.style.setProperty(property, value);
  });

  ipcRenderer.send('save-theme', themeName);
}

// 初始化主题
async function initTheme() {
  const savedTheme = await ipcRenderer.invoke('get-theme');
  applyTheme(savedTheme || 'light-purple');
}

module.exports = { applyTheme, initTheme };