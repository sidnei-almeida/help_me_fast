import { useCallback } from 'react'
import { useApp } from '../context/AppContext'
import { Config, Profile, History } from '../types'
import { calculateTMB } from '../utils/calculateTMB'

export function useVault() {
  const { state, dispatch } = useApp()

  // ── Load config.json ──────────────────────────────────────────────
  const loadConfig = useCallback(async (vaultPath: string) => {
    if (!window.electronAPI?.vault) return
    const configPath = `${vaultPath}/config.json`
    const result = await window.electronAPI.vault.readFile(configPath)
    if (result.success && result.data) {
      dispatch({ type: 'SET_CONFIG', payload: result.data as Config })
    }
  }, [dispatch])

  // ── Load profile.json + resolve avatar to Base64 ──────────────────
  const loadProfile = useCallback(async (vaultPath: string) => {
    if (!window.electronAPI?.vault) return
    console.log('[useVault] loadProfile called, vaultPath:', vaultPath)

    const profilePath = `${vaultPath}/profile.json`
    const result = await window.electronAPI.vault.readFile(profilePath)
    if (!result.success || !result.data) {
      console.warn('[useVault] loadProfile - failed to read profile.json')
      return
    }

    const profile = result.data as Profile
    console.log('[useVault] Profile loaded from JSON:', {
      name: profile.name,
      avatar: profile.avatar ? `${profile.avatar.substring(0, 40)}...` : 'null',
      weight: profile.weight,
    })

    // ── THE KEY: resolve avatar to Base64 via Main Process ──────────
    // If avatar is a relative path (not data:URI), ask Main to read the file
    if (profile.avatar && !profile.avatar.startsWith('data:')) {
      console.log('[useVault] Avatar is a file path, calling loadAvatar IPC...')
      const dataURI = await window.electronAPI.vault.loadAvatar(vaultPath)
      if (dataURI) {
        console.log('[useVault] Avatar loaded as Base64, length:', dataURI.length)
        profile.avatar = dataURI
      } else {
        console.warn('[useVault] Avatar file could not be loaded, clearing avatar')
        profile.avatar = undefined
      }
    } else if (profile.avatar?.startsWith('data:')) {
      console.log('[useVault] Avatar is already a data URI, length:', profile.avatar.length)
    } else {
      console.log('[useVault] No avatar in profile')
    }

    dispatch({ type: 'SET_PROFILE', payload: profile })
    console.log('[useVault] SET_PROFILE dispatched, avatar present:', !!profile.avatar)
  }, [dispatch])

  // ── Load history.json ─────────────────────────────────────────────
  const loadHistory = useCallback(async (vaultPath: string) => {
    if (!window.electronAPI?.vault) return
    const historyPath = `${vaultPath}/history.json`
    const result = await window.electronAPI.vault.readFile(historyPath)
    if (result.success && result.data) {
      dispatch({ type: 'SET_HISTORY', payload: result.data as History })
    }
  }, [dispatch])

  // ── Load active-fast.json (hydrate running fast) ─────────────────
  const loadActiveFast = useCallback(async (vaultPath: string) => {
    if (!window.electronAPI?.vault) return
    const filePath = `${vaultPath}/active-fast.json`
    const result = await window.electronAPI.vault.readFile(filePath)
    if (!result.success || !result.data) return

    const data = result.data as {
      isActive?: boolean
      startTime?: number
      targetHours?: number
    }

    if (data.isActive && data.startTime && data.targetHours) {
      console.log('[useVault] Hydrating active fast:', {
        startTime: new Date(data.startTime).toISOString(),
        targetHours: data.targetHours,
        elapsedH: ((Date.now() - data.startTime) / 3600000).toFixed(1),
      })
      dispatch({
        type: 'START_FAST',
        payload: { startTime: data.startTime, targetHours: data.targetHours }
      })
    } else {
      console.log('[useVault] No active fast to hydrate')
    }
  }, [dispatch])

  // ── Save active-fast.json ───────────────────────────────────────
  const saveActiveFast = useCallback(async (data: {
    isActive: boolean
    startTime: number | null
    targetHours: number | null
  }) => {
    if (!window.electronAPI?.vault || !state.vaultPath) return
    const filePath = `${state.vaultPath}/active-fast.json`
    await window.electronAPI.vault.writeFile(filePath, data)
    console.log('[useVault] Saved active-fast.json:', data)
  }, [state.vaultPath])

  // ── Initialize vault (create default files) ───────────────────────
  const initializeVault = useCallback(async (vaultPath: string) => {
    if (!window.electronAPI?.vault) return false

    try {
      const initResult = await window.electronAPI.vault.initVault(vaultPath)
      if (!initResult.success) return false

      dispatch({ type: 'SET_VAULT_PATH', payload: vaultPath })

      await Promise.all([
        loadConfig(vaultPath),
        loadProfile(vaultPath),
        loadHistory(vaultPath),
        loadActiveFast(vaultPath),
      ])

      return true
    } catch (error) {
      console.error('[useVault] Error initializing vault:', error)
      return false
    }
  }, [dispatch, loadConfig, loadProfile, loadHistory, loadActiveFast])

  // ── Select vault folder → returns the PATH string (not boolean) ───
  const selectVaultFolder = useCallback(async (): Promise<string | null> => {
    if (!window.electronAPI?.vault) {
      console.error('[useVault] Electron API not available')
      return null
    }

    try {
      const selectedPath = await window.electronAPI.vault.selectFolder()
      if (!selectedPath) return null

      const success = await initializeVault(selectedPath)
      if (success) {
        // Persist the vault path in global settings for auto-load on next launch
        window.electronAPI.settings?.setLastVault(selectedPath).catch(err =>
          console.warn('[useVault] Failed to save last vault:', err)
        )
        return selectedPath
      }
      return null
    } catch (error) {
      console.error('[useVault] Error selecting vault folder:', error)
      throw error
    }
  }, [initializeVault])

  // ── Save config ───────────────────────────────────────────────────
  const saveConfig = useCallback(async (config: Config) => {
    if (!window.electronAPI?.vault || !state.vaultPath) return false
    const configPath = `${state.vaultPath}/config.json`
    const result = await window.electronAPI.vault.writeFile(configPath, config)
    if (result.success) dispatch({ type: 'SET_CONFIG', payload: config })
    return result.success
  }, [dispatch, state.vaultPath])

  // ── Save profile (writes JSON, does NOT handle avatar file) ───────
  const saveProfile = useCallback(async (profile: Profile, vaultPath?: string) => {
    const vault = vaultPath || state.vaultPath
    if (!window.electronAPI?.vault || !vault) return false

    const profileWithTMB = {
      ...profile,
      tmb: profile.tmb || calculateTMB(profile)
    }

    const profilePath = `${vault}/profile.json`
    const result = await window.electronAPI.vault.writeFile(profilePath, profileWithTMB)
    if (result.success) {
      // Don't dispatch yet -- caller should call loadProfile to resolve avatar
      console.log('[useVault] saveProfile wrote profile.json, avatar field:', profileWithTMB.avatar)
    }
    return result.success
  }, [state.vaultPath])

  // ── Save history ──────────────────────────────────────────────────
  const saveHistory = useCallback(async (history: History) => {
    if (!window.electronAPI?.vault || !state.vaultPath) return false
    const historyPath = `${state.vaultPath}/history.json`
    const result = await window.electronAPI.vault.writeFile(historyPath, history)
    if (result.success) dispatch({ type: 'SET_HISTORY', payload: history })
    return result.success
  }, [dispatch, state.vaultPath])

  // ── Delete vault: clear settings, reset state ────────────────────
  const deleteVault = useCallback(async () => {
    // Clear global settings so auto-load doesn't try to reload this vault
    try {
      await window.electronAPI?.settings?.setLastVault('')
    } catch (err) {
      console.warn('[useVault] Failed to clear last vault setting:', err)
    }

    // Reset all app state back to initial (shows VaultSetup)
    dispatch({ type: 'RESET_APP' })
  }, [dispatch])

  return {
    vaultPath: state.vaultPath,
    selectVaultFolder,
    initializeVault,
    loadConfig,
    loadProfile,
    loadHistory,
    loadActiveFast,
    saveConfig,
    saveProfile,
    saveHistory,
    saveActiveFast,
    deleteVault,
  }
}
