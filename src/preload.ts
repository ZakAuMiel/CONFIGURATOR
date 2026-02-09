import { contextBridge, ipcRenderer } from 'electron'

/**
 * Secure bridge API exposed to the renderer.
 * Renderer uses: window.api.openModelDialog()
 */
contextBridge.exposeInMainWorld('api', {
  openModelDialog: (): Promise<{ name: string; data: Uint8Array } | null> =>
    ipcRenderer.invoke('open-model-dialog'),
})
