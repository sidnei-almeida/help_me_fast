import { FastType } from '../types'

export const COMMON_FAST_TYPES: FastType[] = [
  { id: '16-8', name: '16:8 Intermittent', hours: 16, isCustom: false },
  { id: '18-6', name: '18:6 Intermittent', hours: 18, isCustom: false },
  { id: '20-4', name: '20:4 Intermittent', hours: 20, isCustom: false },
  { id: '24h', name: '24 Hours', hours: 24, isCustom: false },
  { id: '36h', name: '36 Hours', hours: 36, isCustom: false },
  { id: '48h', name: '48 Hours', hours: 48, isCustom: false },
  { id: '72h', name: '72 Hours', hours: 72, isCustom: false },
  { id: '96h', name: '96 Hours', hours: 96, isCustom: false },
  { id: '120h', name: '120 Hours (5 Days)', hours: 120, isCustom: false },
  { id: '168h', name: '168 Hours (7 Days)', hours: 168, isCustom: false },
]

export function createCustomFastType(hours: number): FastType {
  return {
    id: `custom-${hours}h`,
    name: `${hours} Hours (Custom)`,
    hours,
    isCustom: true
  }
}
