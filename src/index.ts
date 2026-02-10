import { app, BrowserWindow, ipcMain, dialog, session } from 'electron'
import { promises as fs } from 'fs'
import path from 'path'

declare const MAIN_WINDOW_WEBPACK_ENTRY: string
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string

if (require('electron-squirrel-startup')) {
  app.quit()
}

/**
 * Create the main browser window.
 */
const createWindow = (): void => {
  const mainWindow = new BrowserWindow({
    height: 700,
    width: 1000,
    webPreferences: {
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY)

  // DevTools in dev only
  if (!app.isPackaged) {
    mainWindow.webContents.openDevTools()
  }
}

/**
 * CSP patching:
 * - DEV needs: unsafe-eval + ws/http localhost for webpack-dev-server
 * - PROD should be stricter: no unsafe-eval, no localhost
 * - Babylon needs: img-src blob: (textures extracted from GLB often become blob URLs)
 */
function setupCsp(): void {
  const isProd = app.isPackaged

  const cspDev = [
    "default-src 'self' 'unsafe-inline' 'unsafe-eval' data: blob:",
    "img-src 'self' data: blob:",
    "connect-src 'self' http://localhost:* ws://localhost:*",
    "worker-src 'self' blob:",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "style-src 'self' 'unsafe-inline'",
  ].join('; ')

  const cspProd = [
    "default-src 'self' 'unsafe-inline' data: blob:",
    "img-src 'self' data: blob:",
    "connect-src 'self'",
    "worker-src 'self' blob:",
    "script-src 'self' 'unsafe-inline'",
    "style-src 'self' 'unsafe-inline'",
  ].join('; ')

  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    const responseHeaders = details.responseHeaders ?? {}
    responseHeaders['Content-Security-Policy'] = [isProd ? cspProd : cspDev]
    callback({ responseHeaders })
  })
}

app.whenReady().then(() => {
  setupCsp()
  createWindow()
})

/**
 * IPC: Open a native file dialog and return the selected GLB file bytes.
 * Why bytes and not a file path?
 * - In dev, the renderer is served from http://localhost (webpack dev server).
 * - Browsers block XHR/fetch to file:/// paths ("Not allowed to load local resource").
 * - Returning bytes lets the renderer create a Blob/File and load it safely.
 */
ipcMain.handle('open-model-dialog', async () => {
  const result = await dialog.showOpenDialog({
    title: 'Import 3D model',
    properties: ['openFile'],
    // For a clean POC: GLB is self-contained (no external textures/bin)
    filters: [{ name: '3D Models', extensions: ['glb'] }],
  })

  if (result.canceled || result.filePaths.length === 0) return null

  const filePath = result.filePaths[0]
  const data = await fs.readFile(filePath)

  return {
    name: path.basename(filePath),
    data, // Buffer -> arrives as Uint8Array in the renderer
  }
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})
