import { useState } from 'react'
import styled, { keyframes } from 'styled-components'
import { useFastingTimer } from '../../hooks/useFastingTimer'
import { useMetabolicMotivation } from '../../hooks/useMetabolicMotivation'
import { useApp } from '../../context/AppContext'
import { MetabolicArc } from '../MetabolicArc/MetabolicArc'
import { PanicButton } from '../PanicButton/PanicButton'
import { FastTypeSelector } from '../FastTypeSelector/FastTypeSelector'
import { formatWeight, WeightUnit } from '../../utils/weightConverter'
import { FastType, FastGoal } from '../../types'
import { getCurrentPhase } from '../../utils/metabolicPhases'
import { getRotatingTip, CATEGORY_META } from '../../data/fastingTips'
import { Flame, TrendingDown, Activity, Lightbulb } from 'lucide-react'

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
`

const slideUpStagger = keyframes`
  from { opacity: 0; transform: translateY(20px) scale(0.97); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
`

const tipSwap = keyframes`
  0%   { opacity: 0; transform: translateY(8px); }
  15%  { opacity: 1; transform: translateY(0); }
  85%  { opacity: 1; transform: translateY(0); }
  100% { opacity: 1; transform: translateY(0); }
`

const gradientShimmer = keyframes`
  0%   { background-position: -200% center; }
  100% { background-position: 200% center; }
`

const pulseScale = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.02); }
`

const DashboardContainer = styled.div`
  width: 100%;
  color: ${props => props.theme.colors.text.primary};
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px 32px 64px;       /* generous bottom padding */
  background: #F5F6FA;
  text-align: center;
`

// Stage - Central area with wheel always visible
const Stage = styled.div`
  width: 100%;
  max-width: 1200px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${props => props.theme.spacing.lg};
  margin: 0 auto;
`

// Wheel Container — allows the wheel to shrink proportionally via max-height
const WheelContainer = styled.div`
  width: 100%;
  max-width: 550px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 0 auto;
`

// Content Below Wheel - Changes based on state
const ContentBelow = styled.div<{ $isActive: boolean }>`
  width: 100%;
  animation: ${fadeIn} 0.3s ease-in-out;
`

// Idle State - Control Deck - CENTERED
const IdleContent = styled.div`
  width: 100%;
  max-width: 1000px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${props => props.theme.spacing.md};
  margin: 0 auto;
`

// Active State - Stats Grid (Horizontal) - responsive columns
const StatsGrid = styled.div`
  width: 100%;
  max-width: 1000px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${props => props.theme.spacing.md};
  margin: 0 auto ${props => props.theme.spacing.xl} auto;
`

const MetricCard = styled.div<{ $delay?: number }>`
  background: #FFFFFF;
  border-radius: 16px;
  padding: ${props => props.theme.spacing.lg};
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.sm};
  animation: ${slideUpStagger} 0.5s ease-out both;
  animation-delay: ${props => (props.$delay || 0) * 0.1}s;
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.09);
  }
`

const MetricHeader = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
`

const MetricIcon = styled.div<{ $color: string }>`
  width: 20px;
  height: 20px;
  color: ${props => props.$color};
  display: flex;
  align-items: center;
  justify-content: center;
  
  svg {
    width: 100%;
    height: 100%;
    stroke-width: 2;
  }
`

const MetricLabel = styled.div`
  font-size: ${props => props.theme.typography.fontSize.xs};
  color: ${props => props.theme.colors.text.secondary};
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: ${props => props.theme.typography.fontWeight.medium};
`

const MetricValue = styled.div<{ $color?: string }>`
  font-size: ${props => props.theme.typography.fontSize['2xl']};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  color: ${props => props.$color || props.theme.colors.text.primary};
  font-variant-numeric: tabular-nums;
  line-height: 1.2;
`

const MetricUnit = styled.span`
  font-size: ${props => props.theme.typography.fontSize.base};
  color: ${props => props.theme.colors.text.secondary};
  font-weight: ${props => props.theme.typography.fontWeight.normal};
  margin-left: ${props => props.theme.spacing.xs};
`

const MetricSubtext = styled.div`
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.text.muted};
`

// ── Tip Card (Dynamic Tips) ─────────────────────────────────────────
const TipCard = styled.div`
  width: 100%;
  max-width: 1000px;
  background: #FFFFFF;
  border-radius: 20px;
  padding: 24px 28px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  margin: 0 auto ${props => props.theme.spacing.lg} auto;
  animation: ${tipSwap} 0.5s ease-out;
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 8px 24px -4px rgba(0, 0, 0, 0.08);
  }
`

const TipHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
`

const TipHeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`

const TipIconWrapper = styled.div`
  width: 20px;
  height: 20px;
  color: #E17055;
  display: flex;
  align-items: center;
  justify-content: center;

  svg {
    width: 100%;
    height: 100%;
    stroke-width: 2;
  }
`

const TipLabel = styled.div`
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #718096;
`

const TipCategoryBadge = styled.span<{ $color: string }>`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: ${p => p.$color};
  background: ${p => p.$color}12;
`

const TipCategoryDot = styled.span<{ $color: string }>`
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: ${p => p.$color};
  flex-shrink: 0;
`

const TipText = styled.p`
  font-size: 0.95rem;
  color: #2D3436;
  line-height: 1.7;
  margin: 0;
`

const TipSource = styled.div`
  font-size: 0.75rem;
  color: #A0AEC0;
  margin-top: 10px;
  font-style: italic;
`

// ── Phase status message (smaller, below tip) ───────────────────────
const PhaseMessage = styled.div`
  width: 100%;
  max-width: 1000px;
  text-align: center;
  margin: 0 auto ${props => props.theme.spacing.md} auto;
  font-size: 0.85rem;
  color: #718096;
  font-style: italic;
`

// Progress Bar
const ProgressBar = styled.div<{ $progress: number }>`
  width: 100%;
  max-width: 400px;
  height: 6px;
  background: #DFE6E9;
  border-radius: ${props => props.theme.borderRadius.md};
  overflow: hidden;
  margin-top: ${props => props.theme.spacing.md};
`

const ProgressFill = styled.div<{ $progress: number }>`
  height: 100%;
  width: ${props => Math.min(props.$progress * 100, 100)}%;
  background: linear-gradient(90deg, #FF9966, #FF5E62);
  transition: width 0.3s ease;
  border-radius: ${props => props.theme.borderRadius.md};
`

const ProgressText = styled.div`
  font-size: ${props => props.theme.typography.fontSize.xs};
  color: ${props => props.theme.colors.text.secondary};
  text-align: center;
  margin-top: ${props => props.theme.spacing.xs};
`

// Footer Actions (centered at bottom)
const FooterActions = styled.footer`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.md};
  width: 100%;
  max-width: 1000px;
  align-items: center;
  margin: ${props => props.theme.spacing.xl} auto 0 auto;
  padding-top: ${props => props.theme.spacing.xl};
  animation: ${fadeIn} 0.6s ease-in-out;
`

const PanicButtonWrapper = styled.div`
  width: 100%;
`

const EndFastButton = styled.button`
  padding: 1rem 2rem;
  font-size: ${props => props.theme.typography.fontSize.lg};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  background: linear-gradient(135deg, #FF9966 0%, #FF5E62 100%);
  color: #FFFFFF;
  border: none;
  border-radius: ${props => props.theme.borderRadius.md};
  cursor: pointer;
  transition: all 0.25s ease;
  box-shadow: 0 10px 20px rgba(255, 94, 98, 0.3);
  width: 100%;
  animation: ${pulseScale} 3s ease-in-out infinite;
  
  &:hover {
    transform: translateY(-3px) scale(1.02);
    box-shadow: 0 16px 32px rgba(255, 94, 98, 0.45);
    animation: none;
  }
  
  &:active {
    transform: translateY(-1px) scale(0.98);
    box-shadow: 0 6px 12px rgba(255, 94, 98, 0.25);
  }
`

// Confirmation Message
const ConfirmationMessage = styled.div`
  font-size: ${props => props.theme.typography.fontSize.base};
  color: ${props => props.theme.colors.text.secondary};
  text-align: center;
  margin-bottom: ${props => props.theme.spacing.sm};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  animation: ${fadeIn} 0.3s ease-in-out;
`

// Start Fast Button (in idle state) — shimmer gradient effect
const StartFastButton = styled.button`
  padding: 1rem 2rem;
  font-size: ${props => props.theme.typography.fontSize.lg};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  background: linear-gradient(
    135deg,
    #FF9966 0%, #FF5E62 40%, #FFB366 60%, #FF5E62 100%
  );
  background-size: 300% 100%;
  color: #FFFFFF;
  border: none;
  border-radius: ${props => props.theme.borderRadius.md};
  cursor: pointer;
  transition: all 0.25s ease;
  box-shadow: 0 10px 20px rgba(255, 94, 98, 0.3);
  width: 100%;
  max-width: 900px;
  margin-top: ${props => props.theme.spacing.sm};
  animation: ${fadeIn} 0.4s ease-in-out, ${gradientShimmer} 4s ease infinite;
  position: relative;
  overflow: hidden;
  
  &:hover:not(:disabled) {
    transform: translateY(-3px) scale(1.01);
    box-shadow: 0 16px 32px rgba(255, 94, 98, 0.4);
  }
  
  &:active:not(:disabled) {
    transform: translateY(-1px) scale(0.99);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
    animation: ${fadeIn} 0.4s ease-in-out;
  }
`

export function Dashboard() {
  const { state, dispatch } = useApp()
  const { 
    isActive, 
    hours, 
    minutes, 
    seconds, 
    elapsedSeconds,
    countdownHours,
    countdownMinutes,
    countdownSeconds,
    remainingSeconds,
    weightLoss,
    targetHours,
    progress,
    startFast, 
    endFast 
  } = useFastingTimer()

  const {
    fatBurnedInGrams,
    currentMessage,
    projectedFinalWeightLoss,
    caloriesBurned,
    projectedCalories
  } = useMetabolicMotivation(elapsedSeconds, targetHours)

  const [selectedFastType, setSelectedFastType] = useState<FastType | null>(
    state.fastGoal?.fastType || null
  )

  const formatTime = (h: number, m: number, s: number) => {
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }

  const handleStartFast = () => {
    if (!selectedFastType) return
    
    const fastGoal: FastGoal = {
      targetHours: selectedFastType.hours,
      fastType: selectedFastType
    }
    
    dispatch({ type: 'SET_FAST_GOAL', payload: fastGoal })
    startFast(selectedFastType.hours)
  }

  const currentPhase = getCurrentPhase(hours + minutes / 60)

  return (
    <DashboardContainer>
      <Stage>
        {/* Wheel - Always Visible */}
        <WheelContainer>
          <MetabolicArc 
            hours={hours + minutes / 60} 
            timerText={isActive ? formatTime(countdownHours, countdownMinutes, countdownSeconds) : (selectedFastType ? formatTime(selectedFastType.hours, 0, 0) : '00:00:00')}
            isActive={isActive}
            idleText={
              !isActive && selectedFastType 
                ? `GOAL: ${selectedFastType.hours}h`
                : undefined
            }
            size={isActive ? 'large' : 'normal'}
            targetHours={targetHours || selectedFastType?.hours}
          />
        </WheelContainer>

        {/* Progress Bar (if target set and active) */}
        {isActive && targetHours && (
          <>
            <ProgressBar $progress={progress}>
              <ProgressFill $progress={progress} />
            </ProgressBar>
            <ProgressText>
              {Math.min(Math.round(progress * 100), 100)}% of {targetHours}h goal
            </ProgressText>
          </>
        )}

        {/* Content Below Wheel - Changes based on state */}
        <ContentBelow $isActive={isActive}>
          {isActive ? (
            <>
              {/* Stats Grid - Horizontal */}
              <StatsGrid>
                <MetricCard $delay={0}>
                  <MetricHeader>
                    <MetricIcon $color="#ED8936">
                      <Flame />
                    </MetricIcon>
                    <MetricLabel>Fat Burned</MetricLabel>
                  </MetricHeader>
                  <MetricValue $color="#ED8936">
                    {fatBurnedInGrams.toFixed(2)}
                    <MetricUnit>g</MetricUnit>
                  </MetricValue>
                  <MetricSubtext>
                    {caloriesBurned.toLocaleString()} kcal burned
                  </MetricSubtext>
                </MetricCard>

                <MetricCard $delay={1}>
                  <MetricHeader>
                    <MetricIcon $color="#FF5E62">
                      <TrendingDown />
                    </MetricIcon>
                    <MetricLabel>Projected Loss</MetricLabel>
                  </MetricHeader>
                  <MetricValue $color="#374151">
                    {formatWeight(weightLoss, (state.config?.weightUnit || 'kg') as WeightUnit)}
                    <MetricUnit>{state.config?.weightUnit || 'kg'}</MetricUnit>
                  </MetricValue>
                  {targetHours && (
                    <MetricSubtext>
                      Target: {formatWeight(projectedFinalWeightLoss, (state.config?.weightUnit || 'kg') as WeightUnit)} {state.config?.weightUnit || 'kg'}
                    </MetricSubtext>
                  )}
                </MetricCard>

                <MetricCard $delay={2}>
                  <MetricHeader>
                    <MetricIcon $color={currentPhase.color}>
                      <Activity />
                    </MetricIcon>
                    <MetricLabel>Current Phase</MetricLabel>
                  </MetricHeader>
                  <MetricValue $color={currentPhase.color}>
                    {currentPhase.name}
                  </MetricValue>
                  <MetricSubtext>
                    {countdownHours}h {countdownMinutes}m remaining
                  </MetricSubtext>
                </MetricCard>
              </StatsGrid>

              {/* Dynamic Tip — rotates every 2 minutes */}
              {(() => {
                const tip = getRotatingTip(hours + minutes / 60, elapsedSeconds, 2)
                if (!tip) return null
                const catMeta = CATEGORY_META[tip.category]
                return (
                  <TipCard key={tip.id}>
                    <TipHeader>
                      <TipHeaderLeft>
                        <TipIconWrapper><Lightbulb /></TipIconWrapper>
                        <TipLabel>Fasting Tip</TipLabel>
                      </TipHeaderLeft>
                      <TipCategoryBadge $color={catMeta.color}>
                        <TipCategoryDot $color={catMeta.color} />
                        {catMeta.label}
                      </TipCategoryBadge>
                    </TipHeader>
                    <TipText>{tip.text}</TipText>
                    {tip.source && <TipSource>{tip.source}</TipSource>}
                  </TipCard>
                )
              })()}

              {/* Phase status message */}
              {currentMessage && (
                <PhaseMessage>
                  {currentMessage.phase} Phase — {currentMessage.message}
                </PhaseMessage>
              )}

              {/* Footer Actions - Centered */}
              <FooterActions>
                <PanicButtonWrapper>
                  <PanicButton />
                </PanicButtonWrapper>
                <EndFastButton onClick={endFast}>
                  End Fast
                </EndFastButton>
              </FooterActions>
            </>
          ) : (
            <IdleContent>
              <FastTypeSelector
                selectedType={selectedFastType}
                onSelect={setSelectedFastType}
              />
              {selectedFastType && (
                <ConfirmationMessage>
                  Ready to start a {selectedFastType.hours} hours fast?
                </ConfirmationMessage>
              )}
              <StartFastButton 
                onClick={handleStartFast}
                disabled={!selectedFastType}
              >
                Start Fast
              </StartFastButton>
            </IdleContent>
          )}
        </ContentBelow>
      </Stage>
    </DashboardContainer>
  )
}
