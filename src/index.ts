// src/index.ts
import { app, BrowserWindow, ipcMain, dialog, session } from 'electron'
import { promises as fs } from 'fs'
import path from 'path'

declare const MAIN_WINDOW_WEBPACK_ENTRY: string
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string

if (require('electron-squirrel-startup')) {
  app.quit()
}

app.whenReady().then(() => {
  // DEV: relax CSP so webpack-dev-server + Babylon textures (blob:) work
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    const csp = [
      // webpack dev needs unsafe-eval in many setups
      "default-src 'self' 'unsafe-inline' 'unsafe-eval' data: blob:",
      // Babylon loads textures via blob:
      "img-src 'self' data: blob:",
      // dev server websockets + http
      "connect-src 'self' http://localhost:* ws://localhost:*",
      // workers sometimes used by loaders/decoders
      "worker-src 'self' blob:",
      // allow scripts from self + inline (webpack) + eval (dev)
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      // optional but safe
      "style-src 'self' 'unsafe-inline'",
    ].join('; ')

    const responseHeaders = details.responseHeaders ?? {}
    responseHeaders['Content-Security-Policy'] = [csp]

    callback({ responseHeaders })
  })

  createWindow()
})

/**
 * IPC: Open a native file dialog and return the selected GLB file bytes.
 * Why bytes and not a file path?
 * - In dev, the renderer is served from http://localhost (webpack dev server).
 * - Browsers block XHR/fetch to file:/// paths ("Not allowed to load local resource").
 * - Returning bytes lets the renderer create a Blob URL and load it safely.
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
    data, // Buffer -> will arrive as Uint8Array in the renderer
  }
})

const createWindow = (): void => {
  const mainWindow = new BrowserWindow({
    height: 700,
    width: 1000,
    webPreferences: {
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
    },
  })

  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY)
  mainWindow.webContents.openDevTools()
}


app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})
