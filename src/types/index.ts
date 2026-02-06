export interface Config {
  vaultPath: string
  theme: 'dark' | 'light'
  notifications: boolean
  dangerZones: Array<{ start: number; end: number }>
  weightUnit: 'kg' | 'lbs' // Preferred weight unit for display
}

export interface Profile {
  name?: string // User's display name
  avatar?: string // Base64 encoded image or path to avatar file
  weight: number // kg
  height: number // cm
  tmb: number // Taxa Metabólica Basal (kcal/dia)
  age: number
  gender: 'male' | 'female'
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active' // Nível de atividade física
}

export interface FastType {
  id: string
  name: string
  hours: number
  isCustom: boolean
}

export interface FastGoal {
  targetHours: number
  fastType: FastType | null
}

export interface FastEntry {
  id: string
  startTime: number
  endTime?: number
  duration?: number // segundos
  weightLoss?: number // kg projetado
}

export interface ProgressEntry {
  id: string
  date: string // ISO string
  weight?: number // kg (optional — not everyone has a scale)
  photoPath?: string // relative path inside vault/photos/
  notes?: string
}

// Extended version with base64 photo for rendering
export interface ProgressEntryWithPhoto extends ProgressEntry {
  photoBase64?: string | null
}

export interface History {
  fasts: FastEntry[]
  progressEntries?: ProgressEntry[]
}

export type ActiveView = 'timer' | 'history' | 'profile'

export interface AppState {
  vaultPath: string | null
  config: Config | null
  profile: Profile | null
  history: History | null
  fastGoal: FastGoal | null
  activeView: ActiveView
  currentFast: {
    startTime: number | null
    isActive: boolean
    targetHours: number | null
  }
}

export type AppAction =
  | { type: 'SET_VAULT_PATH'; payload: string }
  | { type: 'SET_CONFIG'; payload: Config }
  | { type: 'SET_PROFILE'; payload: Profile }
  | { type: 'SET_HISTORY'; payload: History }
  | { type: 'SET_FAST_GOAL'; payload: FastGoal }
  | { type: 'SET_ACTIVE_VIEW'; payload: ActiveView }
  | { type: 'START_FAST'; payload: { startTime: number; targetHours: number } }
  | { type: 'END_FAST' }
  | { type: 'UPDATE_PROFILE'; payload: Partial<Profile> }
  | { type: 'RESET_APP' }
