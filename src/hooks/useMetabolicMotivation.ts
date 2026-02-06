import { useMemo } from 'react'
import { useApp } from '../context/AppContext'

interface MotivationalMessage {
  hours: number
  message: string
  phase: string
}

const MOTIVATIONAL_MESSAGES: MotivationalMessage[] = [
  { hours: 0, message: 'Digestion Phase: Enjoy the energy from your last meal.', phase: 'Anabolic' },
  { hours: 4, message: 'Insulin Normalizing: Your body is preparing for metabolic transition.', phase: 'Catabolic' },
  { hours: 8, message: 'Glycogen in Use: Energy reserves being mobilized.', phase: 'Catabolic' },
  { hours: 12, message: 'Low Insulin: The door to fat burning has opened.', phase: 'Catabolic' },
  { hours: 16, message: 'Peak Focus: BDNF (Brain Derived Neurotrophic Factor) increasing.', phase: 'Fat Burning' },
  { hours: 18, message: 'Autophagy Activated: Cellular cleanup in progress.', phase: 'Fat Burning' },
  { hours: 20, message: 'Intensified Fat Burning: Metabolism optimized.', phase: 'Fat Burning' },
  { hours: 24, message: 'Ketosis Established: Maximum fat burning efficiency.', phase: 'Ketosis' },
  { hours: 36, message: 'Deep Autophagy: Cellular regeneration at peak.', phase: 'Ketosis' },
  { hours: 48, message: 'Elevated Growth Hormone: Accelerated recovery and repair.', phase: 'Ketosis' },
  { hours: 72, message: 'Advanced Fasting State: Metabolic benefits maximized.', phase: 'Ketosis' },
  { hours: 96, message: 'Mental Resilience: Clarity and focus at elevated levels.', phase: 'Ketosis' },
  { hours: 120, message: 'Prolonged Fast: Complete metabolic transformation.', phase: 'Ketosis' },
]

/**
 * Custom hook for metabolic motivation calculations and messages
 */
export function useMetabolicMotivation(secondsFasted: number, targetHours: number | null) {
  const { state } = useApp()
  const profile = state.profile

  // Calculate fat burned in grams (4 decimal precision)
  const fatBurnedInGrams = useMemo(() => {
    if (!profile?.tmb || secondsFasted <= 0) return 0

    // TMB in kcal/day -> kcal/second
    const kcalPerSecond = profile.tmb / 86400
    
    // Total calories burned during fast
    const totalKcal = kcalPerSecond * secondsFasted
    
    // Convert to grams of fat (7700 kcal = 1 kg = 1000g)
    // So: 7700 kcal = 1000g, therefore 1 kcal = 1000/7700 g
    const gramsPerKcal = 1000 / 7700
    const fatBurned = totalKcal * gramsPerKcal
    
    // Return with 4 decimal precision
    return parseFloat(fatBurned.toFixed(4))
  }, [profile?.tmb, secondsFasted])

  // Get current motivational message based on hours fasted
  const currentMessage = useMemo(() => {
    const hoursFasted = secondsFasted / 3600
    
    // Find the most appropriate message (highest milestone <= current hours)
    let selectedMessage = MOTIVATIONAL_MESSAGES[0]
    
    for (let i = MOTIVATIONAL_MESSAGES.length - 1; i >= 0; i--) {
      if (hoursFasted >= MOTIVATIONAL_MESSAGES[i].hours) {
        selectedMessage = MOTIVATIONAL_MESSAGES[i]
        break
      }
    }
    
    return selectedMessage
  }, [secondsFasted])

  // Project final weight loss at target completion
  const projectedFinalWeightLoss = useMemo(() => {
    if (!profile?.tmb || !targetHours || targetHours <= 0) return 0

    const targetSeconds = targetHours * 3600
    
    // TMB in kcal/day -> kcal/second
    const kcalPerSecond = profile.tmb / 86400
    
    // Total calories that would be burned at target
    const totalKcal = kcalPerSecond * targetSeconds
    
    // Convert to kg (7700 kcal = 1 kg)
    const kgPerKcal = 1 / 7700
    const weightLossKg = totalKcal * kgPerKcal
    
    return parseFloat(weightLossKg.toFixed(3))
  }, [profile?.tmb, targetHours])

  // Calculate calories burned so far
  const caloriesBurned = useMemo(() => {
    if (!profile?.tmb || secondsFasted <= 0) return 0
    
    const kcalPerSecond = profile.tmb / 86400
    const totalKcal = kcalPerSecond * secondsFasted
    
    return Math.round(totalKcal)
  }, [profile?.tmb, secondsFasted])

  // Calculate projected calories at target
  const projectedCalories = useMemo(() => {
    if (!profile?.tmb || !targetHours || targetHours <= 0) return 0
    
    const targetSeconds = targetHours * 3600
    const kcalPerSecond = profile.tmb / 86400
    const totalKcal = kcalPerSecond * targetSeconds
    
    return Math.round(totalKcal)
  }, [profile?.tmb, targetHours])

  return {
    fatBurnedInGrams,
    currentMessage,
    projectedFinalWeightLoss,
    caloriesBurned,
    projectedCalories
  }
}
