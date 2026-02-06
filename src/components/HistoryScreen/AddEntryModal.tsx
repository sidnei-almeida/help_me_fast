import { useState } from 'react'
import styled, { keyframes } from 'styled-components'
import { X, Camera, Scale, FileText, Upload } from 'lucide-react'
import { useApp } from '../../context/AppContext'

// ─── Animations ─────────────────────────────────────────────────────

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`

const slideUp = keyframes`
  from { opacity: 0; transform: translateY(24px); }
  to { opacity: 1; transform: translateY(0); }
`

// ─── Styled Components ──────────────────────────────────────────────

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: ${fadeIn} 0.2s ease;
`

const ModalCard = styled.div`
  background: #FFFFFF;
  border-radius: 20px;
  width: 520px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
  animation: ${slideUp} 0.3s ease;
`

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px 28px 0;
`

const ModalTitle = styled.h2`
  font-size: 1.3rem;
  font-weight: 800;
  color: #2D3436;
  letter-spacing: -0.02em;
`

const CloseButton = styled.button`
  width: 36px;
  height: 36px;
  border-radius: 10px;
  border: none;
  background: #F5F6FA;
  color: #636E72;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;

  &:hover {
    background: #E2E8F0;
    color: #2D3436;
  }
`

const ModalBody = styled.div`
  padding: 24px 28px 28px;
  display: flex;
  flex-direction: column;
  gap: 24px;
`

// ── Form Fields ─────────────────────────────────────────────────────

const FieldGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`

const FieldLabel = styled.label`
  font-size: 0.85rem;
  font-weight: 600;
  color: #2D3436;
  display: flex;
  align-items: center;
  gap: 6px;

  svg {
    color: #E17055;
  }
`

const FieldHint = styled.span`
  font-size: 0.8rem;
  font-weight: 400;
  color: #A0AEC0;
  font-style: italic;
`

const DateInput = styled.input`
  padding: 12px 16px;
  border: 1px solid #E2E8F0;
  border-radius: 12px;
  font-size: 0.95rem;
  color: #2D3436;
  background: #F8F9FA;
  outline: none;
  transition: border-color 0.2s;
  font-family: 'Inter', sans-serif;

  &:focus {
    border-color: #E17055;
    background: #FFFFFF;
  }
`

const WeightRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`

const WeightInput = styled.input`
  flex: 1;
  padding: 12px 16px;
  border: 1px solid #E2E8F0;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 600;
  color: #2D3436;
  background: #F8F9FA;
  outline: none;
  transition: border-color 0.2s;
  font-family: 'Inter', sans-serif;

  &:focus {
    border-color: #E17055;
    background: #FFFFFF;
  }

  &::placeholder {
    color: #CBD5E0;
    font-weight: 400;
  }
`

const WeightUnit = styled.span`
  font-size: 0.95rem;
  font-weight: 600;
  color: #718096;
`

const NotesTextarea = styled.textarea`
  padding: 12px 16px;
  border: 1px solid #E2E8F0;
  border-radius: 12px;
  font-size: 0.95rem;
  color: #2D3436;
  background: #F8F9FA;
  outline: none;
  resize: vertical;
  min-height: 80px;
  font-family: 'Inter', sans-serif;
  line-height: 1.5;
  transition: border-color 0.2s;

  &:focus {
    border-color: #E17055;
    background: #FFFFFF;
  }

  &::placeholder {
    color: #CBD5E0;
  }
`

// ── Photo Upload ────────────────────────────────────────────────────

const PhotoDropzone = styled.div<{ $hasPhoto: boolean }>`
  position: relative;
  width: 100%;
  height: ${props => props.$hasPhoto ? '200px' : '140px'};
  border: 2px dashed ${props => props.$hasPhoto ? 'transparent' : '#DFE6E9'};
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  overflow: hidden;
  background: ${props => props.$hasPhoto ? '#000' : '#FAFAFA'};

  &:hover {
    border-color: ${props => props.$hasPhoto ? 'transparent' : '#E17055'};
    background: ${props => props.$hasPhoto ? '#000' : '#FFF5F0'};
  }
`

const PhotoPreview = styled.img`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 14px;
`

const PhotoOverlay = styled.div`
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s;

  ${PhotoDropzone}:hover & {
    opacity: 1;
  }
`

const PhotoOverlayText = styled.span`
  color: #FFFFFF;
  font-size: 0.9rem;
  font-weight: 600;
`

const DropzoneIcon = styled.div`
  color: #CBD5E0;
`

const DropzoneText = styled.div`
  font-size: 0.9rem;
  font-weight: 500;
  color: #718096;
`

const DropzoneHint = styled.div`
  font-size: 0.8rem;
  color: #A0AEC0;
`

// ── Actions ─────────────────────────────────────────────────────────

const ModalFooter = styled.div`
  display: flex;
  gap: 12px;
  padding-top: 8px;
`

const CancelButton = styled.button`
  flex: 1;
  padding: 14px;
  border: 1px solid #E2E8F0;
  border-radius: 12px;
  background: #FFFFFF;
  color: #636E72;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #F5F6FA;
  }
`

const SaveButton = styled.button<{ $disabled: boolean }>`
  flex: 2;
  padding: 14px;
  border: none;
  border-radius: 12px;
  background: ${props => props.$disabled
    ? '#E2E8F0'
    : 'linear-gradient(135deg, #FF9966, #FF5E62)'};
  color: ${props => props.$disabled ? '#A0AEC0' : '#FFFFFF'};
  font-size: 0.95rem;
  font-weight: 700;
  cursor: ${props => props.$disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.2s;
  box-shadow: ${props => props.$disabled
    ? 'none'
    : '0 4px 12px rgba(255, 94, 98, 0.3)'};

  &:hover {
    ${props => !props.$disabled && `
      transform: translateY(-1px);
      box-shadow: 0 6px 20px rgba(255, 94, 98, 0.4);
    `}
  }
`

// ─── Component ──────────────────────────────────────────────────────

interface Props {
  onClose: () => void
  onSaved: () => void
}

export function AddEntryModal({ onClose, onSaved }: Props) {
  const { state } = useApp()

  const today = new Date().toISOString().split('T')[0]
  const [date, setDate] = useState(today)
  const [weight, setWeight] = useState('')
  const [notes, setNotes] = useState('')
  const [photoBase64, setPhotoBase64] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  // Check if anything is filled
  const hasData = weight.trim() !== '' || photoBase64 !== null || notes.trim() !== ''

  const handleSelectPhoto = async () => {
    if (!window.electronAPI?.vault) return
    const base64 = await window.electronAPI.vault.selectImage()
    if (base64) setPhotoBase64(base64)
  }

  const handleSave = async () => {
    if (!hasData || !state.vaultPath || !window.electronAPI?.history) return
    setSaving(true)

    try {
      const entry = {
        date: new Date(date).toISOString(),
        ...(weight.trim() !== '' && { weight: parseFloat(weight) }),
        ...(photoBase64 && { photoBase64 }),
        ...(notes.trim() !== '' && { notes: notes.trim() }),
      }

      const result = await window.electronAPI.history.addEntry(state.vaultPath, entry)
      if (result.success) {
        onSaved()
      }
    } catch (error) {
      console.error('[AddEntry] Error saving:', error)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Overlay onClick={onClose}>
      <ModalCard onClick={e => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>New Entry</ModalTitle>
          <CloseButton onClick={onClose}>
            <X size={18} />
          </CloseButton>
        </ModalHeader>

        <ModalBody>
          {/* Date */}
          <FieldGroup>
            <FieldLabel>Date</FieldLabel>
            <DateInput
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
            />
          </FieldGroup>

          {/* Weight */}
          <FieldGroup>
            <FieldLabel>
              <Scale size={16} />
              Weight
              <FieldHint>No scale? No problem. Leave it empty.</FieldHint>
            </FieldLabel>
            <WeightRow>
              <WeightInput
                type="number"
                step="0.1"
                placeholder="e.g. 85.5"
                value={weight}
                onChange={e => setWeight(e.target.value)}
              />
              <WeightUnit>kg</WeightUnit>
            </WeightRow>
          </FieldGroup>

          {/* Photo */}
          <FieldGroup>
            <FieldLabel>
              <Camera size={16} />
              Progress Photo
            </FieldLabel>
            <PhotoDropzone $hasPhoto={!!photoBase64} onClick={handleSelectPhoto}>
              {photoBase64 ? (
                <>
                  <PhotoPreview src={photoBase64} alt="Preview" />
                  <PhotoOverlay>
                    <PhotoOverlayText>Change Photo</PhotoOverlayText>
                  </PhotoOverlay>
                </>
              ) : (
                <>
                  <DropzoneIcon>
                    <Upload size={28} />
                  </DropzoneIcon>
                  <DropzoneText>Add a progress photo</DropzoneText>
                  <DropzoneHint>Click to browse files</DropzoneHint>
                </>
              )}
            </PhotoDropzone>
          </FieldGroup>

          {/* Notes */}
          <FieldGroup>
            <FieldLabel>
              <FileText size={16} />
              Notes
            </FieldLabel>
            <NotesTextarea
              placeholder="How are you feeling? Any observations..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
            />
          </FieldGroup>

          {/* Actions */}
          <ModalFooter>
            <CancelButton onClick={onClose}>Cancel</CancelButton>
            <SaveButton
              $disabled={!hasData || saving}
              onClick={handleSave}
            >
              {saving ? 'Saving...' : 'Save Entry'}
            </SaveButton>
          </ModalFooter>
        </ModalBody>
      </ModalCard>
    </Overlay>
  )
}
