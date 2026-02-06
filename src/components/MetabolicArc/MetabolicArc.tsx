import { useMemo, useState, useCallback } from 'react'
import styled, { keyframes } from 'styled-components'
import { Zap, Dumbbell, Flame, Brain } from 'lucide-react'
import { isDangerZone } from '../../utils/metabolicPhases'
import { useApp } from '../../context/AppContext'

// ─── Metabolic Stages ───────────────────────────────────────────
const METABOLIC_STAGES = [
  {
    name: 'ANABOLIC',
    label: 'Anabolic',
    color: '#38B2AC',
    endHour: 4,
    icon: Zap,
    description: 'Your body is digesting and absorbing nutrients. Insulin is elevated.',
    proTip: 'Start hydrating now. Add a pinch of salt to your water — your kidneys will flush sodium as insulin drops.',
  },
  {
    name: 'CATABOLIC',
    label: 'Catabolic',
    color: '#ECC94B',
    endHour: 16,
    icon: Dumbbell,
    description: 'Glycogen is running out. Your body starts switching energy sources.',
    proTip: 'Sip Snake Juice (water + salt + potassium + baking soda) to prevent headaches and cramps as electrolytes drop.',
  },
  {
    name: 'FAT_BURN',
    label: 'Fat Burn',
    color: '#ED8936',
    endHour: 24,
    icon: Flame,
    description: 'Full lipolysis and HGH surge. Peak fat oxidation.',
    proTip: 'Zone 2 Cardio (brisk walk) now burns pure fat. Keep electrolytes flowing — magnesium prevents muscle twitching.',
  },
  {
    name: 'KETOSIS',
    label: 'Ketosis',
    color: '#D53F8C',
    endHour: Infinity,
    icon: Brain,
    description: 'Brain running on ketones. Mental focus and clarity at peak.',
    proTip: 'Electrolytes are critical now. Take 200mg magnesium before bed for sleep. Best time to code or study.',
  },
]

// Arc geometry
const ARC_START = 225
const ARC_SPAN  = 270
const STROKE_W  = 28

// ─── Types ──────────────────────────────────────────────────────
interface MetabolicArcProps {
  hours: number
  timerText?: string
  isActive?: boolean
  idleText?: string
  size?: 'normal' | 'large'
  targetHours?: number
}

interface HoveredStage {
  label: string
  color: string
  description: string
  proTip: string
  startHour: number
  endHourDisplay: string
  icon: React.ComponentType<any>
}

// ─── Animations ─────────────────────────────────────────────────
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(6px); }
  to   { opacity: 1; transform: translateY(0); }
`

// ─── Styled Components ──────────────────────────────────────────
const ArcContainer = styled.div<{ $size: 'normal' | 'large' }>`
  width: 100%;
  max-width: ${p => p.$size === 'large' ? '550px' : '420px'};
  aspect-ratio: 1;
  position: relative;
  margin: 0 auto;
  flex-shrink: 1;              /* allow shrinking when viewport is small */
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: visible;
`

const CenterContent = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  z-index: 10;
  pointer-events: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0;
`

const TimerText = styled.div`
  font-size: 3rem;
  font-weight: 700;
  color: #374151;
  font-variant-numeric: tabular-nums;
  font-feature-settings: "tnum";
  letter-spacing: -2px;
  line-height: 1;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
`

const IdleText = styled.div`
  font-size: 1.5rem;
  font-weight: 600;
  color: #636E72;
  letter-spacing: 0.02em;
`

const PhaseBadge = styled.div`
  display: inline-block;
  padding: 6px 20px;
  background: linear-gradient(135deg, #FDCB6E 0%, #E17055 100%);
  color: #FFFFFF;
  border-radius: 20px;
  font-size: ${p => p.theme.typography.fontSize.xs};
  font-weight: ${p => p.theme.typography.fontWeight.semibold};
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-top: 16px;
  box-shadow: 0 4px 12px rgba(225, 112, 85, 0.3);
`

// ── Tooltip ─────────────────────────────────────────────────────
const TooltipOverlay = styled.div`
  position: absolute;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 50;
  pointer-events: none;
  animation: ${fadeIn} 0.2s ease-out;
`

const TooltipCard = styled.div`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(4px);
  border: 1px solid #E2E8F0;
  border-radius: 16px;
  padding: 20px 24px;
  min-width: 280px;
  max-width: 340px;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
`

const TooltipHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
`

const TooltipAvatar = styled.img<{ $isCurrentPhase: boolean; $phaseColor?: string }>`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
  border: 2px solid ${p => p.$isCurrentPhase ? (p.$phaseColor || '#E17055') : '#E2E8F0'};
  box-shadow: ${p => p.$isCurrentPhase ? '0 0 8px rgba(225, 112, 85, 0.3)' : 'none'};
  opacity: ${p => p.$isCurrentPhase ? 1 : 0.55};
  filter: ${p => p.$isCurrentPhase ? 'none' : 'grayscale(80%)'};
  transition: all 0.2s ease;
`

const TooltipDot = styled.div<{ $color: string }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${p => p.$color};
  flex-shrink: 0;
`

const TooltipTitle = styled.div`
  font-size: 0.95rem;
  font-weight: 700;
  color: #2D3748;
  font-family: 'Inter', sans-serif;
`

const TooltipRange = styled.span`
  font-size: 0.8rem;
  font-weight: 400;
  color: #718096;
  margin-left: 8px;
`

const TooltipDesc = styled.div`
  font-size: 0.875rem;
  color: #718096;
  line-height: 1.6;
  margin-bottom: 14px;
`

const TooltipTip = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.875rem;
  color: #2D3748;
  line-height: 1.5;
`

const TooltipIconWrapper = styled.div<{ $color: string }>`
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: ${p => p.$color};
  
  svg {
    width: 100%;
    height: 100%;
    stroke-width: 2;
  }
`

// ─── SVG Helpers ────────────────────────────────────────────────
function polar(cx: number, cy: number, r: number, deg: number) {
  const rad = (deg - 90) * Math.PI / 180
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
}

function arcPath(cx: number, cy: number, r: number, s: number, e: number): string {
  const a = polar(cx, cy, r, s)
  const b = polar(cx, cy, r, e)
  const large = (e - s) >= 180 ? 1 : 0
  return `M ${a.x} ${a.y} A ${r} ${r} 0 ${large} 1 ${b.x} ${b.y}`
}

function wideArcPath(cx: number, cy: number, r: number, s: number, e: number, w: number): string {
  const outer = r + w / 2
  const inner = r - w / 2
  const a1 = polar(cx, cy, outer, s)
  const a2 = polar(cx, cy, outer, e)
  const a3 = polar(cx, cy, inner, e)
  const a4 = polar(cx, cy, inner, s)
  const large = (e - s) >= 180 ? 1 : 0
  return [
    `M ${a1.x} ${a1.y}`,
    `A ${outer} ${outer} 0 ${large} 1 ${a2.x} ${a2.y}`,
    `L ${a3.x} ${a3.y}`,
    `A ${inner} ${inner} 0 ${large} 0 ${a4.x} ${a4.y}`,
    'Z',
  ].join(' ')
}

// ─── Component ──────────────────────────────────────────────────
export function MetabolicArc({
  hours,
  timerText,
  isActive = false,
  idleText,
  size = 'normal',
  targetHours,
}: MetabolicArcProps) {
  const { state } = useApp()
  const dangerZones = state.config?.dangerZones || [{ start: 18, end: 20 }]
  const inDangerZone = isDangerZone(hours, dangerZones)

  const [hoveredStage, setHoveredStage] = useState<HoveredStage | null>(null)
  const [tooltipAvatarError, setTooltipAvatarError] = useState(false)

  const VB = 400
  const R  = 155
  const CX = VB / 2
  const CY = VB / 2

  const maxH = targetHours || 72
  const progress = Math.min(Math.min(hours, maxH) / maxH, 1)

  const hourToAngle = useCallback(
    (h: number) => ARC_START + (Math.min(h, maxH) / maxH) * ARC_SPAN,
    [maxH],
  )

  // ── Single gradient arc path ──────────────────────────────────
  const gradientArc = useMemo(
    () => arcPath(CX, CY, R, ARC_START, ARC_START + ARC_SPAN),
    [CX, CY, R],
  )

  // ── Phase markers (ticks + labels + hover zones) ──────────────
  const phaseMarkers = useMemo(() => {
    const markers: Array<{
      label: string
      color: string
      description: string
      proTip: string
      icon: React.ComponentType<any>
      startHour: number
      clampedEnd: number
      angle: number
      tickA: { x: number; y: number }
      tickB: { x: number; y: number }
      hitD: string
    }> = []

    for (let i = 0; i < METABOLIC_STAGES.length; i++) {
      const stage = METABOLIC_STAGES[i]
      const prevEnd = i === 0 ? 0 : METABOLIC_STAGES[i - 1].endHour
      if (prevEnd >= maxH) break

      const clampedEnd = Math.min(stage.endHour, maxH)
      const startAngle = hourToAngle(prevEnd)
      const endAngle = hourToAngle(clampedEnd)
      const tickAngle = startAngle // Tick at the START of the phase

      // Tick line: perpendicular to arc
      const tickInner = polar(CX, CY, R - STROKE_W / 2 - 2, tickAngle)
      const tickOuter = polar(CX, CY, R + STROKE_W / 2 + 2, tickAngle)

      // Hit-area for hover (the full zone from start to end)
      const hitD = wideArcPath(CX, CY, R, startAngle, endAngle, STROKE_W + 20)

      markers.push({
        label: stage.label,
        color: stage.color,
        description: stage.description,
        proTip: stage.proTip,
        icon: stage.icon,
        startHour: prevEnd,
        clampedEnd,
        angle: tickAngle,
        tickA: tickInner,
        tickB: tickOuter,
        hitD,
      })
    }
    return markers
  }, [maxH, CX, CY, R, hourToAngle])

  // ── Progress knob position ────────────────────────────────────
  const knobAngle = hourToAngle(Math.min(hours, maxH))
  const knob = polar(CX, CY, R, knobAngle)

  // ── Current stage ─────────────────────────────────────────────
  const currentStage =
    METABOLIC_STAGES.find(s => hours < s.endHour) ||
    METABOLIC_STAGES[METABOLIC_STAGES.length - 1]

  const userAvatar = state.profile?.avatar

  // DEBUG
  if (userAvatar) {
    console.log('[MetabolicArc] userAvatar present, length:', userAvatar.length, '| starts with:', userAvatar.substring(0, 30))
  }

  // ── Hover handlers ────────────────────────────────────────────
  const handleEnter = useCallback((m: typeof phaseMarkers[0]) => {
    setHoveredStage({
      label: m.label,
      color: m.color,
      description: m.description,
      proTip: m.proTip,
      icon: m.icon,
      startHour: m.startHour,
      endHourDisplay: m.clampedEnd >= maxH && METABOLIC_STAGES[METABOLIC_STAGES.length - 1].endHour === Infinity
        ? `${maxH}h+`
        : `${m.clampedEnd}h`,
    })
  }, [maxH])

  const handleLeave = useCallback(() => {
    setHoveredStage(null)
    setTooltipAvatarError(false) // Reset error when leaving tooltip
  }, [])

  return (
    <ArcContainer $size={size}>
      <svg viewBox={`0 0 ${VB} ${VB}`} width="100%" height="100%">
        <defs>
          {/* Brand gradient: Gold → Burnt Orange */}
          <linearGradient id="brandGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%"   stopColor="#FDCB6E" />
            <stop offset="100%" stopColor="#E17055" />
          </linearGradient>

          <filter id="knobGlow" x="-100%" y="-100%" width="300%" height="300%">
            <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor="#FDCB6E" floodOpacity="0.5" />
            <feDropShadow dx="0" dy="0" stdDeviation="2" floodColor="#E17055" floodOpacity="0.4" />
            <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodColor="#000" floodOpacity="0.1" />
          </filter>

          {/* Circular clip for avatar knob */}
          <clipPath id="avatarKnobClip">
            <circle cx="0" cy="0" r="14" />
          </clipPath>

          <filter id="avatarKnobShadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="1" stdDeviation="3" floodColor="#E17055" floodOpacity="0.5" />
            <feDropShadow dx="0" dy="0" stdDeviation="1" floodColor="#000" floodOpacity="0.15" />
          </filter>
        </defs>

        {/* ═══ LAYER 1: Single gradient arc (the full "fuel gauge") ═══ */}
        <path
          d={gradientArc}
          fill="none"
          stroke="url(#brandGradient)"
          strokeWidth={STROKE_W}
          strokeLinecap="round"
          opacity={isActive ? 1 : 0.8}
        />

        {/* ═══ LAYER 2: Phase tick marks (clean, no text) ═══ */}
        {phaseMarkers.map((m, i) => {
          if (i === 0) return null
          return (
            <line
              key={`tick-${i}`}
              x1={m.tickA.x} y1={m.tickA.y}
              x2={m.tickB.x} y2={m.tickB.y}
              stroke="rgba(255,255,255,0.6)"
              strokeWidth={2}
              strokeLinecap="round"
            />
          )
        })}

        {/* ═══ LAYER 3: Gray "emptying" mask ═══ */}
        {/* Uses strokeLinecap="butt" to avoid a round-cap artifact at the
            leading edge of the mask when progress is very small */}
        {isActive && progress > 0.005 && (
          <path
            d={gradientArc}
            fill="none"
            stroke="#F5F6FA"
            strokeWidth={STROKE_W + 6}
            strokeLinecap="butt"
            pathLength={1}
            strokeDasharray={`${progress} ${1 - progress}`}
            style={{ transition: 'stroke-dasharray 0.5s ease' }}
          />
        )}

        {/* ═══ LAYER 4: Progress Knob — Avatar or Circle ═══ */}
        {isActive && (
          userAvatar ? (
            <g filter="url(#avatarKnobShadow)" transform={`translate(${knob.x}, ${knob.y})`}>
              {/* White border ring */}
              <circle cx={0} cy={0} r={16} fill="#FFFFFF" stroke="#E17055" strokeWidth={2.5} />
              {/* Clipped avatar image */}
              <image
                href={userAvatar}
                x={-14}
                y={-14}
                width={28}
                height={28}
                clipPath="url(#avatarKnobClip)"
                preserveAspectRatio="xMidYMid slice"
              />
              {/* Subtle pulse animation on the border */}
              <circle cx={0} cy={0} r={16} fill="none" stroke="#E17055" strokeWidth={2} opacity={0.6}>
                <animate attributeName="r" values="16;19;16" dur="2.5s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.6;0;0.6" dur="2.5s" repeatCount="indefinite" />
              </circle>
            </g>
          ) : (
            <g filter="url(#knobGlow)">
              <circle
                cx={knob.x}
                cy={knob.y}
                r={9}
                fill="#FFFFFF"
                stroke="#E17055"
                strokeWidth={2}
              >
                <animate attributeName="r" values="8;10;8" dur="2.5s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="1;0.85;1" dur="2.5s" repeatCount="indefinite" />
              </circle>
              <circle cx={knob.x} cy={knob.y} r={3.5} fill="#E17055" />
            </g>
          )
        )}

        {/* ═══ LAYER 5: Invisible hover hit-areas ═══ */}
        {phaseMarkers.map((m, i) => (
          <path
            key={`hit-${i}`}
            d={m.hitD}
            fill="transparent"
            stroke="transparent"
            strokeWidth={0}
            style={{ cursor: 'pointer' }}
            onMouseEnter={() => handleEnter(m)}
            onMouseLeave={handleLeave}
          />
        ))}

        {/* Danger zone pulse */}
        {inDangerZone && isActive && (() => {
          const angle = hourToAngle(19)
          const pt = polar(CX, CY, R + STROKE_W / 2 + 12, angle)
          return <circle cx={pt.x} cy={pt.y} r={7} fill="#D63031" opacity={0.85} />
        })()}
      </svg>

      {/* ═══ Center content ═══ */}
      <CenterContent>
        {isActive && timerText ? (
          <TimerText>{timerText}</TimerText>
        ) : (
          <IdleText>{idleText || timerText || 'Select Duration'}</IdleText>
        )}
        {isActive && (
          <PhaseBadge>
            {currentStage.label}
          </PhaseBadge>
        )}
      </CenterContent>

      {/* ═══ Tooltip ═══ */}
      {hoveredStage && (() => {
        const isCurrentPhase = currentStage.label === hoveredStage.label
        const IconComponent = hoveredStage.icon
        const hasAvatar = !!userAvatar && !tooltipAvatarError
        
        console.log('[Tooltip] Rendering — hasAvatar:', hasAvatar, '| phase:', hoveredStage.label, '| isCurrentPhase:', isCurrentPhase)
        
        return (
          <TooltipOverlay>
            <TooltipCard>
              <TooltipHeader>
                {hasAvatar ? (
                  <TooltipAvatar 
                    src={userAvatar!} 
                    alt="User" 
                    $isCurrentPhase={isCurrentPhase}
                    $phaseColor={hoveredStage.color}
                    onError={() => {
                      console.error('[Tooltip] Avatar <img> failed to load!')
                      setTooltipAvatarError(true)
                    }}
                  />
                ) : (
                  <TooltipDot $color={hoveredStage.color} />
                )}
                <TooltipTitle>
                  {hoveredStage.label}
                  <TooltipRange>
                    {hoveredStage.startHour}h – {hoveredStage.endHourDisplay}
                  </TooltipRange>
                </TooltipTitle>
              </TooltipHeader>
              <TooltipDesc>{hoveredStage.description}</TooltipDesc>
              <TooltipTip>
                <TooltipIconWrapper $color={hoveredStage.color}>
                  <IconComponent size={16} />
                </TooltipIconWrapper>
                <span>{hoveredStage.proTip}</span>
              </TooltipTip>
            </TooltipCard>
          </TooltipOverlay>
        )
      })()}
    </ArcContainer>
  )
}
