"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// electron/main.ts
var import_electron = require("electron");
var import_path = __toESM(require("path"), 1);
var import_fs = require("fs");
var import_fs2 = require("fs");
var isDev = !import_electron.app.isPackaged;
function log(...args) {
  if (isDev)
    console.log(...args);
}
function logError(...args) {
  console.error(...args);
}
if (process.platform === "linux") {
  import_electron.app.commandLine.appendSwitch("ozone-platform-hint", "auto");
  import_electron.app.commandLine.appendSwitch("enable-wayland-ime");
  if (process.env.ELECTRON_DISABLE_GPU === "1") {
    import_electron.app.disableHardwareAcceleration();
  }
}
function createWindow() {
  const preloadPath = import_path.default.join(__dirname, "preload.cjs");
  log("[Main] __dirname:", __dirname);
  log("[Main] preloadPath:", preloadPath);
  log("[Main] preload exists:", (0, import_fs2.existsSync)(preloadPath));
  if (!(0, import_fs2.existsSync)(preloadPath)) {
    logError("[Main] FATAL: preload.cjs not found at", preloadPath);
    import_electron.app.quit();
    return;
  }
  const isWayland = !!(process.env.WAYLAND_DISPLAY || process.env.XDG_SESSION_TYPE === "wayland");
  log("[Main] Display server:", isWayland ? "Wayland" : "X11");
  const mainWindow = new import_electron.BrowserWindow({
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
      enableRemoteModule: false
    },
    autoHideMenuBar: true,
    // Transparent background prevents white flash on load
    backgroundColor: "#F2F2F7",
    show: false
    // Don't show until ready — prevents flash
  });
  mainWindow.once("ready-to-show", () => {
    mainWindow.show();
    if (isDev) {
      mainWindow.webContents.openDevTools({ mode: "detach" });
    }
  });
  mainWindow.webContents.on("preload-error", (_event, _preloadPath, error) => {
    logError("[Main] Preload error:", error);
  });
  import_electron.ipcMain.on("window:minimize", () => {
    mainWindow.minimize();
  });
  import_electron.ipcMain.on("window:maximize", () => {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
  });
  import_electron.ipcMain.on("window:close", () => {
    mainWindow.close();
  });
  import_electron.ipcMain.handle("window:is-maximized", () => {
    return mainWindow.isMaximized();
  });
  mainWindow.on("maximize", () => {
    mainWindow.webContents.send("window:maximized-changed", true);
  });
  mainWindow.on("unmaximize", () => {
    mainWindow.webContents.send("window:maximized-changed", false);
  });
  if (isDev) {
    mainWindow.loadURL("http://localhost:5173");
  } else {
    mainWindow.loadFile(import_path.default.join(__dirname, "../dist/index.html"));
  }
}
function getMime(filePath) {
  const ext = import_path.default.extname(filePath).slice(1).toLowerCase();
  if (ext === "jpg" || ext === "jpeg")
    return "image/jpeg";
  if (ext === "png")
    return "image/png";
  if (ext === "webp")
    return "image/webp";
  if (ext === "gif")
    return "image/gif";
  return "image/png";
}
async function fileToDataURI(filePath) {
  try {
    await import_fs.promises.access(filePath);
    const buf = await import_fs.promises.readFile(filePath);
    return `data:${getMime(filePath)};base64,${buf.toString("base64")}`;
  } catch {
    return null;
  }
}
function getSettingsPath() {
  return import_path.default.join(import_electron.app.getPath("userData"), "settings.json");
}
async function readSettings() {
  try {
    const content = await import_fs.promises.readFile(getSettingsPath(), "utf-8");
    return JSON.parse(content);
  } catch {
    return {};
  }
}
async function writeSettings(data) {
  const current = await readSettings();
  const merged = { ...current, ...data };
  await import_fs.promises.writeFile(getSettingsPath(), JSON.stringify(merged, null, 2), "utf-8");
}
function registerIpcHandlers() {
  import_electron.ipcMain.handle("settings:get-last-vault", async () => {
    log("[IPC] settings:get-last-vault called");
    try {
      const settings = await readSettings();
      if (!settings.lastVaultPath) {
        log("[IPC] No last vault saved");
        return null;
      }
      try {
        const stat = await import_fs.promises.stat(settings.lastVaultPath);
        if (!stat.isDirectory()) {
          log("[IPC] Last vault path is not a directory:", settings.lastVaultPath);
          return null;
        }
      } catch {
        log("[IPC] Last vault path no longer exists:", settings.lastVaultPath);
        return null;
      }
      const configPath = import_path.default.join(settings.lastVaultPath, "config.json");
      try {
        await import_fs.promises.access(configPath);
      } catch {
        log("[IPC] Last vault path has no config.json:", settings.lastVaultPath);
        return null;
      }
      log("[IPC] Last vault found and valid:", settings.lastVaultPath);
      return settings.lastVaultPath;
    } catch (error) {
      logError("[IPC] settings:get-last-vault error:", error);
      return null;
    }
  });
  import_electron.ipcMain.handle("settings:set-last-vault", async (_event, vaultPath) => {
    log("[IPC] settings:set-last-vault called:", vaultPath);
    try {
      await writeSettings({ lastVaultPath: vaultPath });
      return { success: true };
    } catch (error) {
      logError("[IPC] settings:set-last-vault error:", error);
      return { success: false, error: error.message };
    }
  });
  import_electron.ipcMain.handle("dialog:openDirectory", async () => {
    const result = await import_electron.dialog.showOpenDialog({
      properties: ["openDirectory", "createDirectory"],
      title: "Select Vault Folder"
    });
    if (result.canceled || result.filePaths.length === 0)
      return null;
    return result.filePaths[0];
  });
  import_electron.ipcMain.handle("dialog:select-image", async () => {
    log("[IPC] dialog:select-image called");
    const result = await import_electron.dialog.showOpenDialog({
      properties: ["openFile"],
      title: "Select Profile Photo",
      filters: [
        { name: "Images", extensions: ["jpg", "jpeg", "png", "gif", "webp"] }
      ]
    });
    if (result.canceled || result.filePaths.length === 0)
      return null;
    log("[IPC] Image selected:", result.filePaths[0]);
    return await fileToDataURI(result.filePaths[0]);
  });
  import_electron.ipcMain.handle("vault:save-avatar", async (_event, vaultPath, imageData) => {
    log("[IPC] vault:save-avatar called, vaultPath:", vaultPath);
    try {
      const base64Match = imageData.match(/^data:image\/\w+;base64,(.+)$/);
      if (!base64Match) {
        logError("[IPC] vault:save-avatar - Invalid data URI format");
        return { success: false, error: "Invalid image data format" };
      }
      const imageBuffer = Buffer.from(base64Match[1], "base64");
      const avatarFile = import_path.default.join(vaultPath, "avatar.png");
      await import_fs.promises.mkdir(vaultPath, { recursive: true });
      await import_fs.promises.writeFile(avatarFile, imageBuffer);
      log("[IPC] Avatar saved to:", avatarFile, "- size:", imageBuffer.length, "bytes");
      return { success: true, avatarPath: "avatar.png" };
    } catch (error) {
      logError("[IPC] vault:save-avatar error:", error);
      return { success: false, error: error.message };
    }
  });
  import_electron.ipcMain.handle("user:load-avatar", async (_event, vaultPath) => {
    log("[IPC] user:load-avatar called, vaultPath:", vaultPath);
    try {
      const profilePath = import_path.default.join(vaultPath, "profile.json");
      let avatarRelPath = null;
      try {
        const content = await import_fs.promises.readFile(profilePath, "utf-8");
        const profile = JSON.parse(content);
        avatarRelPath = profile.avatar || null;
      } catch {
        log("[IPC] user:load-avatar - no profile.json found");
        return null;
      }
      if (!avatarRelPath) {
        log("[IPC] user:load-avatar - no avatar path in profile");
        return null;
      }
      const absolutePath = import_path.default.isAbsolute(avatarRelPath) ? avatarRelPath : import_path.default.join(vaultPath, avatarRelPath);
      const dataURI = await fileToDataURI(absolutePath);
      log("[IPC] user:load-avatar - result:", dataURI ? `OK (${dataURI.length} chars)` : "null");
      return dataURI;
    } catch (error) {
      logError("[IPC] user:load-avatar error:", error);
      return null;
    }
  });
  import_electron.ipcMain.handle("vault:read-file", async (_event, filePath) => {
    try {
      const content = await import_fs.promises.readFile(filePath, "utf-8");
      return { success: true, data: JSON.parse(content) };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });
  import_electron.ipcMain.handle("vault:write-file", async (_event, filePath, data) => {
    try {
      const dir = import_path.default.dirname(filePath);
      await import_fs.promises.mkdir(dir, { recursive: true });
      await import_fs.promises.writeFile(filePath, JSON.stringify(data, null, 2), "utf-8");
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });
  import_electron.ipcMain.handle("vault:file-exists", async (_event, filePath) => {
    try {
      await import_fs.promises.access(filePath);
      return { exists: true };
    } catch {
      return { exists: false };
    }
  });
  import_electron.ipcMain.handle("vault:init-vault", async (_event, vaultPath) => {
    log("[IPC] vault:init-vault called, path:", vaultPath);
    try {
      const configPath = import_path.default.join(vaultPath, "config.json");
      const profilePath = import_path.default.join(vaultPath, "profile.json");
      const historyPath = import_path.default.join(vaultPath, "history.json");
      const defaultConfig = {
        vaultPath,
        theme: "dark",
        notifications: true,
        dangerZones: [{ start: 18, end: 20 }],
        weightUnit: "kg"
      };
      const defaultProfile = {
        name: "",
        weight: 0,
        height: 0,
        tmb: 0,
        age: 0,
        gender: "male",
        activityLevel: "moderate"
      };
      const defaultHistory = { fasts: [] };
      await import_fs.promises.mkdir(vaultPath, { recursive: true });
      const configExists = await import_fs.promises.access(configPath).then(() => true).catch(() => false);
      const profileExists = await import_fs.promises.access(profilePath).then(() => true).catch(() => false);
      const historyExists = await import_fs.promises.access(historyPath).then(() => true).catch(() => false);
      if (!configExists)
        await import_fs.promises.writeFile(configPath, JSON.stringify(defaultConfig, null, 2), "utf-8");
      if (!profileExists)
        await import_fs.promises.writeFile(profilePath, JSON.stringify(defaultProfile, null, 2), "utf-8");
      if (!historyExists)
        await import_fs.promises.writeFile(historyPath, JSON.stringify(defaultHistory, null, 2), "utf-8");
      log("[IPC] vault:init-vault done");
      return { success: true };
    } catch (error) {
      logError("[IPC] vault:init-vault error:", error);
      return { success: false, error: error.message };
    }
  });
  import_electron.ipcMain.handle("history:add-entry", async (_event, vaultPath, entry) => {
    log("[IPC] history:add-entry called");
    try {
      const historyPath = import_path.default.join(vaultPath, "history.json");
      let history = { fasts: [], progressEntries: [] };
      try {
        const content = await import_fs.promises.readFile(historyPath, "utf-8");
        history = JSON.parse(content);
        if (!history.progressEntries)
          history.progressEntries = [];
      } catch {
      }
      const id = `entry_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      let photoPath;
      if (entry.photoBase64) {
        const photosDir = import_path.default.join(vaultPath, "photos");
        await import_fs.promises.mkdir(photosDir, { recursive: true });
        const base64Match = entry.photoBase64.match(/^data:image\/(\w+);base64,(.+)$/);
        if (base64Match) {
          const ext = base64Match[1] === "jpeg" ? "jpg" : base64Match[1];
          const fileName = `photo_${Date.now()}.${ext}`;
          const filePath = import_path.default.join(photosDir, fileName);
          await import_fs.promises.writeFile(filePath, Buffer.from(base64Match[2], "base64"));
          photoPath = `photos/${fileName}`;
          log("[IPC] Photo saved:", filePath);
        }
      }
      const newEntry = {
        id,
        date: entry.date,
        ...entry.weight !== void 0 && { weight: entry.weight },
        ...photoPath && { photoPath },
        ...entry.notes && { notes: entry.notes }
      };
      history.progressEntries.push(newEntry);
      history.progressEntries.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      await import_fs.promises.writeFile(historyPath, JSON.stringify(history, null, 2), "utf-8");
      log("[IPC] Entry added:", newEntry.id);
      return { success: true, entry: newEntry };
    } catch (error) {
      logError("[IPC] history:add-entry error:", error);
      return { success: false, error: error.message };
    }
  });
  import_electron.ipcMain.handle("history:get-all", async (_event, vaultPath) => {
    log("[IPC] history:get-all called");
    try {
      const historyPath = import_path.default.join(vaultPath, "history.json");
      let history = { fasts: [], progressEntries: [] };
      try {
        const content = await import_fs.promises.readFile(historyPath, "utf-8");
        history = JSON.parse(content);
        if (!history.progressEntries)
          history.progressEntries = [];
      } catch {
        return { success: true, entries: [] };
      }
      const enriched = await Promise.all(
        history.progressEntries.map(async (entry) => {
          let photoBase64 = null;
          if (entry.photoPath) {
            const absPath = import_path.default.join(vaultPath, entry.photoPath);
            photoBase64 = await fileToDataURI(absPath);
          }
          return { ...entry, photoBase64 };
        })
      );
      enriched.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      log("[IPC] Returning", enriched.length, "progress entries");
      return { success: true, entries: enriched };
    } catch (error) {
      logError("[IPC] history:get-all error:", error);
      return { success: false, error: error.message };
    }
  });
  import_electron.ipcMain.handle("history:delete-entry", async (_event, vaultPath, entryId) => {
    log("[IPC] history:delete-entry called, id:", entryId);
    try {
      const historyPath = import_path.default.join(vaultPath, "history.json");
      const content = await import_fs.promises.readFile(historyPath, "utf-8");
      const history = JSON.parse(content);
      if (!history.progressEntries)
        return { success: true };
      const entry = history.progressEntries.find((e) => e.id === entryId);
      if (entry?.photoPath) {
        const photoAbsPath = import_path.default.join(vaultPath, entry.photoPath);
        try {
          await import_fs.promises.unlink(photoAbsPath);
        } catch {
        }
      }
      history.progressEntries = history.progressEntries.filter((e) => e.id !== entryId);
      await import_fs.promises.writeFile(historyPath, JSON.stringify(history, null, 2), "utf-8");
      return { success: true };
    } catch (error) {
      logError("[IPC] history:delete-entry error:", error);
      return { success: false, error: error.message };
    }
  });
}
registerIpcHandlers();
import_electron.app.whenReady().then(() => {
  createWindow();
  import_electron.app.on("activate", () => {
    if (import_electron.BrowserWindow.getAllWindows().length === 0)
      createWindow();
  });
});
import_electron.app.on("window-all-closed", () => {
  if (process.platform !== "darwin")
    import_electron.app.quit();
});
//# sourceMappingURL=main.cjs.map
