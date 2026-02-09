import { app, BrowserWindow, ipcMain, dialog } from 'electron';

declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

if (require('electron-squirrel-startup')) {
  app.quit();
}

/**
 * IPC: open a native file dialog and return the selected file path.
 * - Renderer must NOT access filesystem/dialog directly.
 * - Renderer calls this via preload: window.api.openModelDialog()
 */
ipcMain.handle('open-model-dialog', async () => {
  const result = await dialog.showOpenDialog({
    title: 'Import 3D model',
    properties: ['openFile'],
    filters: [{ name: '3D Models', extensions: ['glb', 'gltf'] }],
  });

  if (result.canceled || result.filePaths.length === 0) return null;
  return result.filePaths[0];
});

const createWindow = (): void => {
  const mainWindow = new BrowserWindow({
    height: 700,
    width: 1000,
    webPreferences: {
      /**
       * Preload = the secure bridge between renderer and main.
       * Keep Node APIs out of the renderer.
       */
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
    },
  });

  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);
  mainWindow.webContents.openDevTools();
};

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
