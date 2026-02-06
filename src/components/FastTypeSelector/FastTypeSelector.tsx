import { useState } from 'react'
import styled from 'styled-components'
import { COMMON_FAST_TYPES, createCustomFastType } from '../../utils/fastTypes'
import { FastType } from '../../types'

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.md};
  width: 100%;
  max-width: 900px;
  align-items: center;
`

const ControlDeck = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.md};
`

const SectionLabel = styled.div`
  font-size: ${props => props.theme.typography.fontSize.xs};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  color: ${props => props.theme.colors.text.secondary};
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-bottom: ${props => props.theme.spacing.xs};
  padding: 0 ${props => props.theme.spacing.xs};
`

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: ${props => props.theme.spacing.sm};
  width: 100%;
`

const FastTile = styled.button<{ $selected: boolean }>`
  height: 80px;
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  background: ${props => props.$selected 
    ? `${props.theme.colors.accent}08`
    : '#FFFFFF'};
  color: ${props => props.theme.colors.text.primary};
  border: 2px solid ${props => props.$selected 
    ? props.theme.colors.accent
    : '#DFE6E9'};
  border-radius: ${props => props.theme.borderRadius.md};
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: ${props => props.theme.spacing.xs};
  box-shadow: ${props => props.$selected 
    ? `0 0 0 3px ${props.theme.colors.accent}15` 
    : '0 1px 3px rgba(0,0,0,0.04)'};
  transform: ${props => props.$selected ? 'scale(1.02)' : 'scale(1)'};
  
  &:hover {
    transform: ${props => props.$selected ? 'scale(1.02)' : 'translateY(-2px)'};
    border-color: ${props => props.theme.colors.accent};
    box-shadow: ${props => props.theme.shadows.md};
  }
  
  &:active {
    transform: ${props => props.$selected ? 'scale(1.0)' : 'translateY(0)'};
  }
`

const TileHours = styled.div<{ $selected: boolean }>`
  font-size: ${props => props.theme.typography.fontSize.xl};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  color: ${props => props.$selected 
    ? props.theme.colors.accent
    : props.theme.colors.text.primary};
  line-height: 1;
  text-align: center;
  width: 100%;
`

const TileLabel = styled.div`
  font-size: ${props => props.theme.typography.fontSize.xs};
  color: ${props => props.theme.colors.text.secondary};
  font-weight: ${props => props.theme.typography.fontWeight.normal};
  text-align: center;
  line-height: 1.2;
`

// Custom Input as Tile
const CustomTile = styled.div<{ $selected: boolean }>`
  height: 80px;
  padding: ${props => props.$selected 
    ? `${props.theme.spacing.sm} ${props.theme.spacing.md}`
    : props.theme.spacing.sm};
  background: ${props => props.$selected 
    ? `${props.theme.colors.accent}08`
    : '#FFFFFF'};
  border: 2px solid ${props => props.$selected 
    ? props.theme.colors.accent
    : '#DFE6E9'};
  border-radius: ${props => props.theme.borderRadius.md};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: ${props => props.theme.spacing.xs};
  box-shadow: ${props => props.$selected 
    ? `0 0 0 3px ${props.theme.colors.accent}15` 
    : '0 1px 3px rgba(0,0,0,0.04)'};
  transition: all 0.2s ease;
  transform: ${props => props.$selected ? 'scale(1.02)' : 'scale(1)'};
  text-align: center;
`

const CustomInput = styled.input`
  flex: 1;
  width: 100%;
  padding: ${props => props.theme.spacing.xs};
  background: transparent;
  border: 1px solid #DFE6E9;
  border-radius: ${props => props.theme.borderRadius.sm};
  color: ${props => props.theme.colors.text.primary};
  font-size: ${props => props.theme.typography.fontSize.sm};
  text-align: center;
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.accent};
    box-shadow: 0 0 0 2px ${props => props.theme.colors.accent}20;
  }
  
  &::placeholder {
    color: ${props => props.theme.colors.text.muted};
    font-weight: ${props => props.theme.typography.fontWeight.normal};
  }
`

const CustomButton = styled.button`
  width: 100%;
  padding: ${props => props.theme.spacing.xs};
  background: ${props => props.theme.colors.accent};
  color: #FFFFFF;
  border: none;
  border-radius: ${props => props.theme.borderRadius.sm};
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: ${props => props.theme.typography.fontSize.xs};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  
  &:hover {
    background: ${props => props.theme.colors.gradient.end};
    transform: translateY(-1px);
  }
  
  &:active {
    transform: translateY(0);
  }
`

interface FastTypeSelectorProps {
  selectedType: FastType | null
  onSelect: (fastType: FastType) => void
}

export function FastTypeSelector({ selectedType, onSelect }: FastTypeSelectorProps) {
  const [customHours, setCustomHours] = useState('')

  const handleCustomSubmit = () => {
    const hours = parseInt(customHours)
    if (hours > 0 && hours <= 720) {
      onSelect(createCustomFastType(hours))
      setCustomHours('')
    }
  }

  const handleTileClick = (type: FastType) => {
    setCustomHours('') // Clear custom input when selecting a predefined type
    onSelect(type)
  }

  // Organize fast types into categories
  const intermittent = COMMON_FAST_TYPES.filter(t => t.hours <= 20)
  const prolonged = COMMON_FAST_TYPES.filter(t => t.hours > 20)

  // Check if a custom fast type is selected
  const isCustomSelected = selectedType?.isCustom === true

  return (
    <Container>
      <ControlDeck>
        {/* Intermittent Section */}
        <div>
          <SectionLabel>Intermittent</SectionLabel>
          <Grid>
            {intermittent.map((type) => (
              <FastTile
                key={type.id}
                $selected={selectedType?.id === type.id}
                onClick={() => handleTileClick(type)}
              >
                <TileHours $selected={selectedType?.id === type.id}>
                  {type.hours}h
                </TileHours>
                <TileLabel>{type.name.replace(`${type.hours}h`, '').trim()}</TileLabel>
              </FastTile>
            ))}
            {/* Custom Tile */}
            <CustomTile $selected={isCustomSelected}>
              {isCustomSelected ? (
                <>
                  <TileHours $selected={true}>
                    {selectedType.hours}h
                  </TileHours>
                  <TileLabel>Custom</TileLabel>
                </>
              ) : (
                <>
                  <CustomInput
                    type="number"
                    min="1"
                    max="720"
                    value={customHours}
                    onChange={(e) => setCustomHours(e.target.value)}
                    placeholder="Custom"
                    onKeyPress={(e) => e.key === 'Enter' && handleCustomSubmit()}
                  />
                  <CustomButton onClick={handleCustomSubmit}>
                    Add
                  </CustomButton>
                </>
              )}
            </CustomTile>
          </Grid>
        </div>

        {/* Prolonged Section */}
        <div>
          <SectionLabel>Prolonged</SectionLabel>
          <Grid>
            {prolonged.map((type) => (
              <FastTile
                key={type.id}
                $selected={selectedType?.id === type.id}
                onClick={() => handleTileClick(type)}
              >
                <TileHours $selected={selectedType?.id === type.id}>
                  {type.hours}h
                </TileHours>
                <TileLabel>{type.name.replace(`${type.hours}h`, '').replace('Hours', '').trim()}</TileLabel>
              </FastTile>
            ))}
            {/* Fill remaining slots if needed */}
            {prolonged.length < 4 && Array.from({ length: 4 - prolonged.length }).map((_, i) => (
              <div key={`empty-${i}`} style={{ height: '80px' }} />
            ))}
          </Grid>
        </div>
      </ControlDeck>
    </Container>
  )
}
