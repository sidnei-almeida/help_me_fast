import { Profile } from '../types'
import { calculateTDEE } from './activityMultipliers'

/**
 * Calculates Basal Metabolic Rate using Mifflin-St Jeor formula
 */
export function calculateBMR(profile: Profile): number {
  const { weight, height, age, gender } = profile
  
  // Mifflin-St Jeor formula
  // Men: BMR = 10 × weight(kg) + 6.25 × height(cm) - 5 × age(years) + 5
  // Women: BMR = 10 × weight(kg) + 6.25 × height(cm) - 5 × age(years) - 161
  
  const baseBMR = 10 * weight + 6.25 * height - 5 * age
  return gender === 'male' ? baseBMR + 5 : baseBMR - 161
}

/**
 * Calculates Total Daily Energy Expenditure (TDEE) including activity level
 */
export function calculateTMB(profile: Profile): number {
  const bmr = calculateBMR(profile)
  return calculateTDEE(bmr, profile.activityLevel)
}
