import { contextBridge, ipcRenderer } from 'electron';

/**
 * Expose a minimal, typed-ish API to the renderer.
 * Renderer will use: window.api.openModelDialog()
 */
contextBridge.exposeInMainWorld('api', {
  openModelDialog: (): Promise<string | null> => ipcRenderer.invoke('open-model-dialog'),
});
