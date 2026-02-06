/**
 * Activity level multipliers for calculating Total Daily Energy Expenditure (TDEE)
 * Based on Harris-Benedict/Mifflin-St Jeor activity factors
 */
export const ACTIVITY_MULTIPLIERS = {
  sedentary: 1.2,      // Little or no exercise
  light: 1.375,        // Light exercise 1-3 days/week
  moderate: 1.55,      // Moderate exercise 3-5 days/week
  active: 1.725,       // Hard exercise 6-7 days/week
  very_active: 1.9     // Very hard exercise, physical job
}

export function calculateTDEE(bmr: number, activityLevel: keyof typeof ACTIVITY_MULTIPLIERS): number {
  return bmr * ACTIVITY_MULTIPLIERS[activityLevel]
}
