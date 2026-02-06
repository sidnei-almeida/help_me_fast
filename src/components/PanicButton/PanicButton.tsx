import { useState } from 'react'
import styled, { keyframes } from 'styled-components'
import { useFastingTimer } from '../../hooks/useFastingTimer'

// ─── Modal animations (premium) ─────────────────────────────────────
const overlayFadeIn = keyframes`
  from { opacity: 0; }
  to   { opacity: 1; }
`

const modalPopIn = keyframes`
  0%   { opacity: 0; transform: scale(0.92); }
  70%  { opacity: 1; transform: scale(1.02); }
  100% { opacity: 1; transform: scale(1); }
`

const Button = styled.button`
  padding: ${props => props.theme.spacing.md} ${props => props.theme.spacing.xl};
  font-size: ${props => props.theme.typography.fontSize.base};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  color: ${props => props.theme.colors.text.primary};
  background: #FFFFFF;
  border: 1.5px solid #DFE6E9;
  border-radius: ${props => props.theme.borderRadius.md};
  cursor: pointer;
  transition: all 0.2s ease;
  width: 100%;
  
  &:hover {
    background: #F8F9FA;
    border-color: ${props => props.theme.colors.text.secondary};
  }
  
  &:active {
    transform: translateY(0);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(45, 52, 54, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(8px);
  animation: ${overlayFadeIn} 0.25s ease-out;
`

const ModalContent = styled.div`
  background: #FFFFFF;
  border-radius: 20px;
  padding: ${props => props.theme.spacing.xxl};
  max-width: 500px;
  width: 90%;
  text-align: center;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15), 0 8px 24px rgba(0, 0, 0, 0.08);
  animation: ${modalPopIn} 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
`

const ModalTitle = styled.h2`
  font-size: ${props => props.theme.typography.fontSize['3xl']};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: ${props => props.theme.spacing.md};
`

const ModalQuestion = styled.p`
  font-size: ${props => props.theme.typography.fontSize.xl};
  color: ${props => props.theme.colors.text.secondary};
  margin-bottom: ${props => props.theme.spacing.xl};
  line-height: 1.6;
`

const ButtonGroup = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.md};
  justify-content: center;
`

const ModalButton = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  padding: ${props => props.theme.spacing.md} ${props => props.theme.spacing.xl};
  font-size: ${props => props.theme.typography.fontSize.base};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  
  ${props => props.$variant === 'primary' ? `
    background: linear-gradient(135deg, #FF9966 0%, #FF5E62 100%);
    color: #FFFFFF;
    box-shadow: 0 4px 14px rgba(255, 94, 98, 0.35);
  ` : `
    background: #F7FAFC;
    color: ${props.theme.colors.text.primary};
    border: 1.5px solid #E2E8F0;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  `}
  
  &:hover {
    transform: translateY(-2px);
    ${props => props.$variant === 'primary'
      ? 'box-shadow: 0 8px 24px rgba(255, 94, 98, 0.4);'
      : 'box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);'}
  }
  
  &:active {
    transform: translateY(0);
  }
`

export function PanicButton() {
  const { isActive, endFast } = useFastingTimer()
  const [showModal, setShowModal] = useState(false)
  const [selectedOption, setSelectedOption] = useState<'real' | 'boredom' | null>(null)

  const handlePanicClick = () => {
    if (!isActive) return
    setShowModal(true)
    setSelectedOption(null)
  }

  const handleRealHunger = async () => {
    setShowModal(false)
    await endFast()
  }

  const handleBoredom = () => {
    setShowModal(false)
    setSelectedOption(null)
    // Here we could add logic to show tips or distractions
  }

  if (!isActive) {
    return null
  }

  return (
    <>
      <Button onClick={handlePanicClick}>
        I'm Hungry / I'm Going to Eat
      </Button>

      {showModal && (
        <ModalOverlay onClick={() => setShowModal(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalTitle>Pattern Interruption</ModalTitle>
            <ModalQuestion>
              Are you experiencing <strong>real hunger</strong> or is it just <strong>boredom/habit</strong>?
            </ModalQuestion>
            <ButtonGroup>
              <ModalButton $variant="secondary" onClick={handleBoredom}>
                It's Boredom/Habit
              </ModalButton>
              <ModalButton $variant="primary" onClick={handleRealHunger}>
                Real Hunger
              </ModalButton>
            </ButtonGroup>
          </ModalContent>
        </ModalOverlay>
      )}
    </>
  )
}
