import { app, BrowserWindow } from 'electron';

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    backgroundColor: '#0a0a0f',
    titleBarStyle: 'hidden',
    autoHideMenuBar: true,
    webPreferences: { nodeIntegration: false }
  });

  const startUrl = process.env.ELECTRON_START_URL || 'https://taver-tech.vercel.app/';
  win.loadURL(startUrl);
}

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});