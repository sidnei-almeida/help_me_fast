import { contextBridge, ipcRenderer } from 'electron'

export interface VaultAPI {
  selectFolder: () => Promise<string | null>
  selectImage: () => Promise<string | null>
  saveAvatar: (vaultPath: string, imageData: string) => Promise<{ success: boolean; avatarPath?: string; error?: string }>
  loadAvatar: (vaultPath: string) => Promise<string | null>
  readFile: (filePath: string) => Promise<{ success: boolean; data?: unknown; error?: string }>
  writeFile: (filePath: string, data: unknown) => Promise<{ success: boolean; error?: string }>
  fileExists: (filePath: string) => Promise<{ exists: boolean }>
  initVault: (vaultPath: string) => Promise<{ success: boolean; error?: string }>
}

export interface HistoryAPI {
  addEntry: (vaultPath: string, entry: { date: string; weight?: number; photoBase64?: string; notes?: string }) => Promise<{ success: boolean; entry?: any; error?: string }>
  getAll: (vaultPath: string) => Promise<{ success: boolean; entries?: any[]; error?: string }>
  deleteEntry: (vaultPath: string, entryId: string) => Promise<{ success: boolean; error?: string }>
}

export interface WindowAPI {
  minimize: () => void
  maximize: () => void
  close: () => void
  isMaximized: () => Promise<boolean>
  onMaximizedChanged: (callback: (isMaximized: boolean) => void) => () => void
}

export interface SettingsAPI {
  getLastVault: () => Promise<string | null>
  setLastVault: (vaultPath: string) => Promise<{ success: boolean; error?: string }>
}

contextBridge.exposeInMainWorld('electronAPI', {
  platform: process.platform,
  vault: {
    selectFolder: () => ipcRenderer.invoke('dialog:openDirectory'),
    selectImage: () => ipcRenderer.invoke('dialog:select-image'),
    saveAvatar: (vaultPath: string, imageData: string) => ipcRenderer.invoke('vault:save-avatar', vaultPath, imageData),
    loadAvatar: (vaultPath: string) => ipcRenderer.invoke('user:load-avatar', vaultPath),
    readFile: (filePath: string) => ipcRenderer.invoke('vault:read-file', filePath),
    writeFile: (filePath: string, data: unknown) => ipcRenderer.invoke('vault:write-file', filePath, data),
    fileExists: (filePath: string) => ipcRenderer.invoke('vault:file-exists', filePath),
    initVault: (vaultPath: string) => ipcRenderer.invoke('vault:init-vault', vaultPath),
  } as VaultAPI,
  history: {
    addEntry: (vaultPath: string, entry: any) => ipcRenderer.invoke('history:add-entry', vaultPath, entry),
    getAll: (vaultPath: string) => ipcRenderer.invoke('history:get-all', vaultPath),
    deleteEntry: (vaultPath: string, entryId: string) => ipcRenderer.invoke('history:delete-entry', vaultPath, entryId),
  } as HistoryAPI,
  window: {
    minimize: () => ipcRenderer.send('window:minimize'),
    maximize: () => ipcRenderer.send('window:maximize'),
    close: () => ipcRenderer.send('window:close'),
    isMaximized: () => ipcRenderer.invoke('window:is-maximized'),
    onMaximizedChanged: (callback: (isMaximized: boolean) => void) => {
      const handler = (_event: any, value: boolean) => callback(value)
      ipcRenderer.on('window:maximized-changed', handler)
      return () => ipcRenderer.removeListener('window:maximized-changed', handler)
    },
  } as WindowAPI,
  settings: {
    getLastVault: () => ipcRenderer.invoke('settings:get-last-vault'),
    setLastVault: (vaultPath: string) => ipcRenderer.invoke('settings:set-last-vault', vaultPath),
  } as SettingsAPI,
})
