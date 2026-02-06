import { useState, useEffect, useCallback } from 'react'
import { useApp } from '../context/AppContext'
import { useVault } from './useVault'
import { FastEntry } from '../types'

export function useFastingTimer() {
  const { state, dispatch } = useApp()
  const { saveHistory, saveActiveFast } = useVault()
  const [elapsedSeconds, setElapsedSeconds] = useState(0)

  // ── Start Fast: persist to disk immediately ──────────────────────
  const startFast = useCallback(async (targetHours: number) => {
    const startTime = Date.now()
    dispatch({ type: 'START_FAST', payload: { startTime, targetHours } })

    // Persist to active-fast.json so the fast survives app close
    await saveActiveFast({ isActive: true, startTime, targetHours })
  }, [dispatch, saveActiveFast])

  // ── End Fast: clear from disk, save to history ───────────────────
  const endFast = useCallback(async () => {
    if (!state.currentFast.startTime || !state.vaultPath || !state.history) return

    const endTime = Date.now()
    const duration = Math.floor((endTime - state.currentFast.startTime) / 1000)
    const weightLoss = calculateWeightLoss(duration, state.profile?.tmb || 0)

    const newEntry: FastEntry = {
      id: `fast-${Date.now()}`,
      startTime: state.currentFast.startTime,
      endTime,
      duration,
      weightLoss
    }

    const updatedHistory = {
      ...state.history,
      fasts: [...state.history.fasts, newEntry]
    }

    await saveHistory(updatedHistory)

    // Clear the persisted active fast
    await saveActiveFast({ isActive: false, startTime: null, targetHours: null })

    dispatch({ type: 'END_FAST' })
    setElapsedSeconds(0)
  }, [dispatch, state.currentFast.startTime, state.vaultPath, state.history, state.profile, saveHistory, saveActiveFast])

  // ── Tick: recalculate elapsed from absolute timestamps ───────────
  useEffect(() => {
    if (!state.currentFast.isActive || !state.currentFast.startTime) {
      setElapsedSeconds(0)
      return
    }

    // Immediately compute elapsed (critical for hydration after app restart)
    const computeElapsed = () => {
      const now = Date.now()
      return Math.floor((now - state.currentFast.startTime!) / 1000)
    }

    setElapsedSeconds(computeElapsed())

    const interval = setInterval(() => {
      setElapsedSeconds(computeElapsed())
    }, 1000)

    return () => clearInterval(interval)
  }, [state.currentFast.isActive, state.currentFast.startTime])

  // ── Derived values ───────────────────────────────────────────────
  const elapsedHours = Math.floor(elapsedSeconds / 3600)
  const elapsedMinutes = Math.floor((elapsedSeconds % 3600) / 60)
  const elapsedSecs = elapsedSeconds % 60

  const weightLoss = calculateWeightLoss(elapsedSeconds, state.profile?.tmb || 0)

  const targetHours = state.currentFast.targetHours
  const targetTotalSeconds = targetHours ? targetHours * 3600 : 0
  const progress = targetHours ? Math.min(elapsedSeconds / targetTotalSeconds, 1) : 0

  // Countdown: remaining time until target
  const remainingSeconds = Math.max(targetTotalSeconds - elapsedSeconds, 0)
  const countdownHours = Math.floor(remainingSeconds / 3600)
  const countdownMinutes = Math.floor((remainingSeconds % 3600) / 60)
  const countdownSecs = remainingSeconds % 60

  return {
    isActive: state.currentFast.isActive,
    elapsedSeconds,
    // Elapsed (for calculations like metabolic phase, fat burn, etc.)
    hours: elapsedHours,
    minutes: elapsedMinutes,
    seconds: elapsedSecs,
    // Countdown (for display on the timer)
    countdownHours,
    countdownMinutes,
    countdownSeconds: countdownSecs,
    remainingSeconds,
    weightLoss,
    targetHours,
    progress,
    startFast,
    endFast
  }
}

function calculateWeightLoss(seconds: number, tmb: number): number {
  // TMB in kcal/day -> kcal/second
  const kcalPerSecond = tmb / 86400
  // 1kg of fat ≈ 7700 kcal
  const kgPerKcal = 1 / 7700
  const totalKcal = kcalPerSecond * seconds
  return totalKcal * kgPerKcal
}
