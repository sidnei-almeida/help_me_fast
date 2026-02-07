"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// electron/preload.ts
var preload_exports = {};
module.exports = __toCommonJS(preload_exports);
var import_electron = require("electron");
import_electron.contextBridge.exposeInMainWorld("electronAPI", {
  platform: process.platform,
  vault: {
    selectFolder: () => import_electron.ipcRenderer.invoke("dialog:openDirectory"),
    selectImage: () => import_electron.ipcRenderer.invoke("dialog:select-image"),
    saveAvatar: (vaultPath, imageData) => import_electron.ipcRenderer.invoke("vault:save-avatar", vaultPath, imageData),
    loadAvatar: (vaultPath) => import_electron.ipcRenderer.invoke("user:load-avatar", vaultPath),
    readFile: (filePath) => import_electron.ipcRenderer.invoke("vault:read-file", filePath),
    writeFile: (filePath, data) => import_electron.ipcRenderer.invoke("vault:write-file", filePath, data),
    fileExists: (filePath) => import_electron.ipcRenderer.invoke("vault:file-exists", filePath),
    initVault: (vaultPath) => import_electron.ipcRenderer.invoke("vault:init-vault", vaultPath)
  },
  history: {
    addEntry: (vaultPath, entry) => import_electron.ipcRenderer.invoke("history:add-entry", vaultPath, entry),
    getAll: (vaultPath) => import_electron.ipcRenderer.invoke("history:get-all", vaultPath),
    deleteEntry: (vaultPath, entryId) => import_electron.ipcRenderer.invoke("history:delete-entry", vaultPath, entryId)
  },
  window: {
    minimize: () => import_electron.ipcRenderer.send("window:minimize"),
    maximize: () => import_electron.ipcRenderer.send("window:maximize"),
    close: () => import_electron.ipcRenderer.send("window:close"),
    isMaximized: () => import_electron.ipcRenderer.invoke("window:is-maximized"),
    onMaximizedChanged: (callback) => {
      const handler = (_event, value) => callback(value);
      import_electron.ipcRenderer.on("window:maximized-changed", handler);
      return () => import_electron.ipcRenderer.removeListener("window:maximized-changed", handler);
    }
  },
  settings: {
    getLastVault: () => import_electron.ipcRenderer.invoke("settings:get-last-vault"),
    setLastVault: (vaultPath) => import_electron.ipcRenderer.invoke("settings:set-last-vault", vaultPath)
  }
});
//# sourceMappingURL=preload.cjs.map
