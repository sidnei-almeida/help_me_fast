interface VaultAPI {
  selectFolder: () => Promise<string | null>
  selectImage: () => Promise<string | null>
  saveAvatar: (vaultPath: string, imageData: string) => Promise<{ success: boolean; avatarPath?: string; error?: string }>
  loadAvatar: (vaultPath: string) => Promise<string | null>
  readFile: (filePath: string) => Promise<{ success: boolean; data?: unknown; error?: string }>
  writeFile: (filePath: string, data: unknown) => Promise<{ success: boolean; error?: string }>
  fileExists: (filePath: string) => Promise<{ exists: boolean }>
  initVault: (vaultPath: string) => Promise<{ success: boolean; error?: string }>
}

interface HistoryAPI {
  addEntry: (vaultPath: string, entry: { date: string; weight?: number; photoBase64?: string; notes?: string }) => Promise<{ success: boolean; entry?: any; error?: string }>
  getAll: (vaultPath: string) => Promise<{ success: boolean; entries?: any[]; error?: string }>
  deleteEntry: (vaultPath: string, entryId: string) => Promise<{ success: boolean; error?: string }>
}

interface WindowAPI {
  minimize: () => void
  maximize: () => void
  close: () => void
  isMaximized: () => Promise<boolean>
  onMaximizedChanged: (callback: (isMaximized: boolean) => void) => () => void
}

interface SettingsAPI {
  getLastVault: () => Promise<string | null>
  setLastVault: (vaultPath: string) => Promise<{ success: boolean; error?: string }>
}

interface Window {
  electronAPI?: {
    platform: string
    vault: VaultAPI
    history: HistoryAPI
    window: WindowAPI
    settings: SettingsAPI
  }
}
