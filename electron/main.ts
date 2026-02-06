import { app, BrowserWindow, ipcMain, dialog } from 'electron'
import path from 'path'
import { promises as fs } from 'fs'
import { existsSync } from 'fs'

// ─── Environment detection ────────────────────────────────────────────
const isDev = !app.isPackaged

/** Production-safe logger — only logs in dev mode */
function log(...args: unknown[]) {
  if (isDev) console.log(...args)
}
function logError(...args: unknown[]) {
  // Always log errors (stderr), but with context
  console.error(...args)
}

// ─── Wayland / X11 compatibility ──────────────────────────────────────
// Electron needs hints to run properly on Wayland (GNOME 41+, KDE Plasma 6, Hyprland, Sway)
// --ozone-platform-hint=auto lets Electron auto-detect the display server
// This must be set BEFORE app.whenReady()
if (process.platform === 'linux') {
  // Auto-detect Wayland vs X11 — works on GNOME, KDE, Hyprland, Sway, i3, etc.
  app.commandLine.appendSwitch('ozone-platform-hint', 'auto')

  // Enable Wayland input method support (for non-Latin keyboard layouts)
  app.commandLine.appendSwitch('enable-wayland-ime')

  // GPU acceleration fixes for some Linux configurations
  // If the user has issues, they can set ELECTRON_DISABLE_GPU=1
  if (process.env.ELECTRON_DISABLE_GPU === '1') {
    app.disableHardwareAcceleration()
  }
}

// ─── Window creation ──────────────────────────────────────────────────
function createWindow() {
  const preloadPath = path.join(__dirname, 'preload.cjs')

  log('[Main] __dirname:', __dirname)
  log('[Main] preloadPath:', preloadPath)
  log('[Main] preload exists:', existsSync(preloadPath))

  if (!existsSync(preloadPath)) {
    logError('[Main] FATAL: preload.cjs not found at', preloadPath)
    app.quit()
    return
  }

  // Detect if running under Wayland — some WMs handle frameless differently
  const isWayland = !!(
    process.env.WAYLAND_DISPLAY ||
    process.env.XDG_SESSION_TYPE === 'wayland'
  )
  log('[Main] Display server:', isWayland ? 'Wayland' : 'X11')

  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    frame: false,
    // Fallback: if frame:false causes issues on some DEs, titleBarStyle works more reliably
    // titleBarStyle: 'hidden',  // Alternative for problematic DEs
    webPreferences: {
      preload: preloadPath,
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false,
      // Security: disable remote module
      enableRemoteModule: false,
    } as any,
    autoHideMenuBar: true,
    // Transparent background prevents white flash on load
    backgroundColor: '#F2F2F7',
    show: false, // Don't show until ready — prevents flash
  })

  // Show window when renderer is ready (prevents white flash)
  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
    if (isDev) {
      mainWindow.webContents.openDevTools({ mode: 'detach' })
    }
  })

  mainWindow.webContents.on('preload-error', (_event, _preloadPath, error) => {
    logError('[Main] Preload error:', error)
  })

  // ── Window control IPC handlers ────────────────────────────────────
  ipcMain.on('window:minimize', () => {
    mainWindow.minimize()
  })

  ipcMain.on('window:maximize', () => {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize()
    } else {
      mainWindow.maximize()
    }
  })

  ipcMain.on('window:close', () => {
    mainWindow.close()
  })

  ipcMain.handle('window:is-maximized', () => {
    return mainWindow.isMaximized()
  })

  // Notify renderer when maximize state changes
  mainWindow.on('maximize', () => {
    mainWindow.webContents.send('window:maximized-changed', true)
  })
  mainWindow.on('unmaximize', () => {
    mainWindow.webContents.send('window:maximized-changed', false)
  })

  // ── Load content ───────────────────────────────────────────────────
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173')
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
  }
}

// ─── Helper: read image file → data:URI ───────────────────────────────
function getMime(filePath: string): string {
  const ext = path.extname(filePath).slice(1).toLowerCase()
  if (ext === 'jpg' || ext === 'jpeg') return 'image/jpeg'
  if (ext === 'png') return 'image/png'
  if (ext === 'webp') return 'image/webp'
  if (ext === 'gif') return 'image/gif'
  return 'image/png'
}

async function fileToDataURI(filePath: string): Promise<string | null> {
  try {
    await fs.access(filePath)
    const buf = await fs.readFile(filePath)
    return `data:${getMime(filePath)};base64,${buf.toString('base64')}`
  } catch {
    return null
  }
}

// ─── Global Settings (outside vault, in app userData) ─────────────────
function getSettingsPath(): string {
  return path.join(app.getPath('userData'), 'settings.json')
}

async function readSettings(): Promise<{ lastVaultPath?: string }> {
  try {
    const content = await fs.readFile(getSettingsPath(), 'utf-8')
    return JSON.parse(content)
  } catch {
    return {}
  }
}

async function writeSettings(data: Record<string, unknown>): Promise<void> {
  const current = await readSettings()
  const merged = { ...current, ...data }
  await fs.writeFile(getSettingsPath(), JSON.stringify(merged, null, 2), 'utf-8')
}

// ─────────────── IPC Handlers ─────────────────────────────────────────

function registerIpcHandlers() {

  // ── Settings: get last vault path ─────────────────────────────────
  ipcMain.handle('settings:get-last-vault', async () => {
    log('[IPC] settings:get-last-vault called')
    try {
      const settings = await readSettings()
      if (!settings.lastVaultPath) {
        log('[IPC] No last vault saved')
        return null
      }

      // Validate: does the directory still exist?
      try {
        const stat = await fs.stat(settings.lastVaultPath)
        if (!stat.isDirectory()) {
          log('[IPC] Last vault path is not a directory:', settings.lastVaultPath)
          return null
        }
      } catch {
        log('[IPC] Last vault path no longer exists:', settings.lastVaultPath)
        return null
      }

      // Validate: does it have a config.json (is it actually a vault)?
      const configPath = path.join(settings.lastVaultPath, 'config.json')
      try {
        await fs.access(configPath)
      } catch {
        log('[IPC] Last vault path has no config.json:', settings.lastVaultPath)
        return null
      }

      log('[IPC] Last vault found and valid:', settings.lastVaultPath)
      return settings.lastVaultPath
    } catch (error) {
      logError('[IPC] settings:get-last-vault error:', error)
      return null
    }
  })

  // ── Settings: save last vault path ────────────────────────────────
  ipcMain.handle('settings:set-last-vault', async (_event, vaultPath: string) => {
    log('[IPC] settings:set-last-vault called:', vaultPath)
    try {
      await writeSettings({ lastVaultPath: vaultPath })
      return { success: true }
    } catch (error) {
      logError('[IPC] settings:set-last-vault error:', error)
      return { success: false, error: (error as Error).message }
    }
  })

  // ── Dialog: select directory ─────────────────────────────────────────
  ipcMain.handle('dialog:openDirectory', async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openDirectory', 'createDirectory'],
      title: 'Select Vault Folder'
    })
    if (result.canceled || result.filePaths.length === 0) return null
    return result.filePaths[0]
  })

  // ── Dialog: select image → returns base64 data URI for preview ──────
  ipcMain.handle('dialog:select-image', async () => {
    log('[IPC] dialog:select-image called')
    const result = await dialog.showOpenDialog({
      properties: ['openFile'],
      title: 'Select Profile Photo',
      filters: [
        { name: 'Images', extensions: ['jpg', 'jpeg', 'png', 'gif', 'webp'] }
      ]
    })
    if (result.canceled || result.filePaths.length === 0) return null
    log('[IPC] Image selected:', result.filePaths[0])
    return await fileToDataURI(result.filePaths[0])
  })

  // ── Avatar: save base64 data to vault as avatar.png ─────────────────
  ipcMain.handle('vault:save-avatar', async (_event, vaultPath: string, imageData: string) => {
    log('[IPC] vault:save-avatar called, vaultPath:', vaultPath)
    try {
      const base64Match = imageData.match(/^data:image\/\w+;base64,(.+)$/)
      if (!base64Match) {
        logError('[IPC] vault:save-avatar - Invalid data URI format')
        return { success: false, error: 'Invalid image data format' }
      }
      const imageBuffer = Buffer.from(base64Match[1], 'base64')
      const avatarFile = path.join(vaultPath, 'avatar.png')
      await fs.mkdir(vaultPath, { recursive: true })
      await fs.writeFile(avatarFile, imageBuffer)
      log('[IPC] Avatar saved to:', avatarFile, '- size:', imageBuffer.length, 'bytes')
      return { success: true, avatarPath: 'avatar.png' }
    } catch (error) {
      logError('[IPC] vault:save-avatar error:', error)
      return { success: false, error: (error as Error).message }
    }
  })

  // ── Avatar: load from vault → returns base64 data URI ───────────────
  ipcMain.handle('user:load-avatar', async (_event, vaultPath: string) => {
    log('[IPC] user:load-avatar called, vaultPath:', vaultPath)
    try {
      // Read profile.json to find avatar path
      const profilePath = path.join(vaultPath, 'profile.json')
      let avatarRelPath: string | null = null
      try {
        const content = await fs.readFile(profilePath, 'utf-8')
        const profile = JSON.parse(content)
        avatarRelPath = profile.avatar || null
      } catch {
        log('[IPC] user:load-avatar - no profile.json found')
        return null
      }

      if (!avatarRelPath) {
        log('[IPC] user:load-avatar - no avatar path in profile')
        return null
      }

      const absolutePath = path.isAbsolute(avatarRelPath)
        ? avatarRelPath
        : path.join(vaultPath, avatarRelPath)

      const dataURI = await fileToDataURI(absolutePath)
      log('[IPC] user:load-avatar - result:', dataURI ? `OK (${dataURI.length} chars)` : 'null')
      return dataURI
    } catch (error) {
      logError('[IPC] user:load-avatar error:', error)
      return null
    }
  })

  // ── Vault: read JSON file ───────────────────────────────────────────
  ipcMain.handle('vault:read-file', async (_event, filePath: string) => {
    try {
      const content = await fs.readFile(filePath, 'utf-8')
      return { success: true, data: JSON.parse(content) }
    } catch (error) {
      return { success: false, error: (error as Error).message }
    }
  })

  // ── Vault: write JSON file ──────────────────────────────────────────
  ipcMain.handle('vault:write-file', async (_event, filePath: string, data: unknown) => {
    try {
      const dir = path.dirname(filePath)
      await fs.mkdir(dir, { recursive: true })
      await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8')
      return { success: true }
    } catch (error) {
      return { success: false, error: (error as Error).message }
    }
  })

  // ── Vault: check file exists ────────────────────────────────────────
  ipcMain.handle('vault:file-exists', async (_event, filePath: string) => {
    try {
      await fs.access(filePath)
      return { exists: true }
    } catch {
      return { exists: false }
    }
  })

  // ── Vault: initialize ──────────────────────────────────────────────
  ipcMain.handle('vault:init-vault', async (_event, vaultPath: string) => {
    log('[IPC] vault:init-vault called, path:', vaultPath)
    try {
      const configPath = path.join(vaultPath, 'config.json')
      const profilePath = path.join(vaultPath, 'profile.json')
      const historyPath = path.join(vaultPath, 'history.json')

      const defaultConfig = {
        vaultPath,
        theme: 'dark',
        notifications: true,
        dangerZones: [{ start: 18, end: 20 }],
        weightUnit: 'kg'
      }

      const defaultProfile = {
        name: '',
        weight: 0,
        height: 0,
        tmb: 0,
        age: 0,
        gender: 'male',
        activityLevel: 'moderate'
      }

      const defaultHistory = { fasts: [] }

      await fs.mkdir(vaultPath, { recursive: true })

      const configExists = await fs.access(configPath).then(() => true).catch(() => false)
      const profileExists = await fs.access(profilePath).then(() => true).catch(() => false)
      const historyExists = await fs.access(historyPath).then(() => true).catch(() => false)

      if (!configExists) await fs.writeFile(configPath, JSON.stringify(defaultConfig, null, 2), 'utf-8')
      if (!profileExists) await fs.writeFile(profilePath, JSON.stringify(defaultProfile, null, 2), 'utf-8')
      if (!historyExists) await fs.writeFile(historyPath, JSON.stringify(defaultHistory, null, 2), 'utf-8')

      log('[IPC] vault:init-vault done')
      return { success: true }
    } catch (error) {
      logError('[IPC] vault:init-vault error:', error)
      return { success: false, error: (error as Error).message }
    }
  })

  // ── History: add progress entry ─────────────────────────────────────
  ipcMain.handle('history:add-entry', async (_event, vaultPath: string, entry: {
    date: string; weight?: number; photoBase64?: string; notes?: string
  }) => {
    log('[IPC] history:add-entry called')
    try {
      const historyPath = path.join(vaultPath, 'history.json')
      
      // Read existing history
      let history: any = { fasts: [], progressEntries: [] }
      try {
        const content = await fs.readFile(historyPath, 'utf-8')
        history = JSON.parse(content)
        if (!history.progressEntries) history.progressEntries = []
      } catch { /* file doesn't exist yet */ }

      // Generate unique ID
      const id = `entry_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`

      // Save photo to vault/photos/ if provided
      let photoPath: string | undefined
      if (entry.photoBase64) {
        const photosDir = path.join(vaultPath, 'photos')
        await fs.mkdir(photosDir, { recursive: true })
        
        const base64Match = entry.photoBase64.match(/^data:image\/(\w+);base64,(.+)$/)
        if (base64Match) {
          const ext = base64Match[1] === 'jpeg' ? 'jpg' : base64Match[1]
          const fileName = `photo_${Date.now()}.${ext}`
          const filePath = path.join(photosDir, fileName)
          await fs.writeFile(filePath, Buffer.from(base64Match[2], 'base64'))
          photoPath = `photos/${fileName}`
          log('[IPC] Photo saved:', filePath)
        }
      }

      // Create entry
      const newEntry = {
        id,
        date: entry.date,
        ...(entry.weight !== undefined && { weight: entry.weight }),
        ...(photoPath && { photoPath }),
        ...(entry.notes && { notes: entry.notes }),
      }

      history.progressEntries.push(newEntry)

      // Sort by date descending
      history.progressEntries.sort((a: any, b: any) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      )

      await fs.writeFile(historyPath, JSON.stringify(history, null, 2), 'utf-8')
      log('[IPC] Entry added:', newEntry.id)
      return { success: true, entry: newEntry }
    } catch (error) {
      logError('[IPC] history:add-entry error:', error)
      return { success: false, error: (error as Error).message }
    }
  })

  // ── History: get all entries with photos as base64 ──────────────────
  ipcMain.handle('history:get-all', async (_event, vaultPath: string) => {
    log('[IPC] history:get-all called')
    try {
      const historyPath = path.join(vaultPath, 'history.json')
      
      let history: any = { fasts: [], progressEntries: [] }
      try {
        const content = await fs.readFile(historyPath, 'utf-8')
        history = JSON.parse(content)
        if (!history.progressEntries) history.progressEntries = []
      } catch {
        return { success: true, entries: [] }
      }

      // Inject photoBase64 for each entry that has a photoPath
      const enriched = await Promise.all(
        history.progressEntries.map(async (entry: any) => {
          let photoBase64: string | null = null
          if (entry.photoPath) {
            const absPath = path.join(vaultPath, entry.photoPath)
            photoBase64 = await fileToDataURI(absPath)
          }
          return { ...entry, photoBase64 }
        })
      )

      // Sort newest first
      enriched.sort((a: any, b: any) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      )

      log('[IPC] Returning', enriched.length, 'progress entries')
      return { success: true, entries: enriched }
    } catch (error) {
      logError('[IPC] history:get-all error:', error)
      return { success: false, error: (error as Error).message }
    }
  })

  // ── History: delete entry ───────────────────────────────────────────
  ipcMain.handle('history:delete-entry', async (_event, vaultPath: string, entryId: string) => {
    log('[IPC] history:delete-entry called, id:', entryId)
    try {
      const historyPath = path.join(vaultPath, 'history.json')
      const content = await fs.readFile(historyPath, 'utf-8')
      const history = JSON.parse(content)
      if (!history.progressEntries) return { success: true }

      // Find and remove entry, also delete photo file
      const entry = history.progressEntries.find((e: any) => e.id === entryId)
      if (entry?.photoPath) {
        const photoAbsPath = path.join(vaultPath, entry.photoPath)
        try { await fs.unlink(photoAbsPath) } catch { /* ignore */ }
      }

      history.progressEntries = history.progressEntries.filter((e: any) => e.id !== entryId)
      await fs.writeFile(historyPath, JSON.stringify(history, null, 2), 'utf-8')
      return { success: true }
    } catch (error) {
      logError('[IPC] history:delete-entry error:', error)
      return { success: false, error: (error as Error).message }
    }
  })
}

// ─────────────── App Lifecycle ─────────────────────────────────────────

registerIpcHandlers()

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
