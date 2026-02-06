export interface MetabolicPhase {
  name: string
  color: string
  startHours: number
  endHours: number
}

export const METABOLIC_PHASES: MetabolicPhase[] = [
  {
    name: 'Anabolic',
    color: '#38B2AC', // Soft Teal
    startHours: 0,
    endHours: 4
  },
  {
    name: 'Catabolic',
    color: '#ECC94B', // Warm Gold
    startHours: 4,
    endHours: 16
  },
  {
    name: 'Fat Burning',
    color: '#ED8936', // Brand Orange
    startHours: 16,
    endHours: 24
  },
  {
    name: 'Ketosis',
    color: '#D53F8C', // Deep Rose
    startHours: 24,
    endHours: Infinity
  }
]

export function getCurrentPhase(hours: number): MetabolicPhase {
  return METABOLIC_PHASES.find(
    phase => hours >= phase.startHours && hours < phase.endHours
  ) || METABOLIC_PHASES[METABOLIC_PHASES.length - 1]
}

export function getPhaseProgress(hours: number): number {
  const phase = getCurrentPhase(hours)
  
  if (phase.endHours === Infinity) {
    // For ketosis phase, show progress based on 24h+
    return Math.min((hours - phase.startHours) / 24, 1)
  }
  
  const phaseDuration = phase.endHours - phase.startHours
  const progressInPhase = hours - phase.startHours
  return Math.min(progressInPhase / phaseDuration, 1)
}

export function isDangerZone(hours: number, dangerZones: Array<{ start: number; end: number }>): boolean {
  const currentHour = new Date().getHours()
  return dangerZones.some(zone => currentHour >= zone.start && currentHour < zone.end)
}
