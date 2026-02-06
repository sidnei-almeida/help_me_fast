import { useState, useEffect, useRef } from 'react'
import styled, { keyframes } from 'styled-components'
import { useApp } from '../../context/AppContext'
import { useVault } from '../../hooks/useVault'
import { calculateBMR, calculateTMB } from '../../utils/calculateTMB'
import { parseWeight, formatWeight, WeightUnit } from '../../utils/weightConverter'
import { Profile } from '../../types'
import { Camera, Trash2, AlertTriangle } from 'lucide-react'

const SetupContainer = styled.div`
  width: 100%;
  color: ${props => props.theme.colors.text.primary};
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 40px 32px 80px;      /* generous bottom so Save never touches edge */
`

const SetupCard = styled.div`
  width: 100%;
  max-width: 672px;              /* ~max-w-2xl — readable on ultrawides */
`

const Title = styled.h1`
  font-size: ${props => props.theme.typography.fontSize['4xl']};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  margin-bottom: ${props => props.theme.spacing.md};
  text-align: center;
`

const Description = styled.p`
  font-size: ${props => props.theme.typography.fontSize.base};
  color: ${props => props.theme.colors.text.secondary};
  margin-bottom: ${props => props.theme.spacing.xl};
  text-align: center;
  line-height: 1.6;
`

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.lg};
`

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.xs};
`

const Label = styled.label`
  font-size: ${props => props.theme.typography.fontSize.sm};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  color: ${props => props.theme.colors.text.secondary};
`

const Input = styled.input`
  width: 100%;
  padding: ${props => props.theme.spacing.md};
  background: ${props => props.theme.colors.surface};
  border: 1px solid #DFE6E9;
  border-radius: ${props => props.theme.borderRadius.md};
  color: ${props => props.theme.colors.text.primary};
  font-size: ${props => props.theme.typography.fontSize.base};
  font-family: inherit;
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.accent};
    box-shadow: 0 0 0 3px ${props => props.theme.colors.accent}20;
  }
`

const Select = styled.select`
  width: 100%;
  padding: ${props => props.theme.spacing.md};
  background: ${props => props.theme.colors.surface};
  border: 1px solid #DFE6E9;
  border-radius: ${props => props.theme.borderRadius.md};
  color: ${props => props.theme.colors.text.primary};
  font-size: ${props => props.theme.typography.fontSize.base};
  font-family: inherit;
  cursor: pointer;
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.accent};
    box-shadow: 0 0 0 3px ${props => props.theme.colors.accent}20;
  }
`

const Button = styled.button`
  padding: ${props => props.theme.spacing.md} ${props => props.theme.spacing.xl};
  font-size: ${props => props.theme.typography.fontSize.base};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  background: linear-gradient(135deg, ${props => props.theme.colors.gradient.start}, ${props => props.theme.colors.gradient.end});
  color: #FFFFFF;
  border: none;
  border-radius: ${props => props.theme.borderRadius.md};
  cursor: pointer;
  transition: all 0.2s ease;
  margin-top: ${props => props.theme.spacing.md};
  box-shadow: ${props => props.theme.shadows.sm};
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: ${props => props.theme.shadows.md};
  }
  
  &:active {
    transform: translateY(0);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`

const ErrorMessage = styled.div`
  padding: ${props => props.theme.spacing.md};
  background: rgba(214, 48, 49, 0.1);
  color: ${props => props.theme.colors.danger};
  border-radius: ${props => props.theme.borderRadius.lg};
  font-size: ${props => props.theme.typography.fontSize.sm};
  border: 1px solid rgba(214, 48, 49, 0.2);
`

const InfoText = styled.div`
  font-size: ${props => props.theme.typography.fontSize.xs};
  color: ${props => props.theme.colors.text.muted};
  margin-top: ${props => props.theme.spacing.xs};
`

const WeightRow = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: center;
  margin-bottom: 0.5rem;
`

const WeightInput = styled(Input)`
  flex: 1;
  min-width: 0;      /* allow shrinking in flex */
`

const UnitSelect = styled(Select)`
  width: 80px;
  flex-shrink: 0;
`

// ── Avatar Section ──────────────────────────────────────────────────
const AvatarSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 24px 0;
  margin-bottom: 8px;
`

const AvatarCircle = styled.div`
  position: relative;
  width: 96px;
  height: 96px;
  border-radius: 50%;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.25s ease;
  border: 3px solid #E2E8F0;

  &:hover {
    border-color: #FF9966;
    transform: scale(1.05);
    box-shadow: 0 6px 20px rgba(255, 153, 102, 0.2);
  }
`

const AvatarImg = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`

const AvatarPlaceholder = styled.div`
  width: 100%;
  height: 100%;
  background: #F7FAFC;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  color: #A0AEC0;

  svg { width: 28px; height: 28px; stroke-width: 1.5; }
`

const AvatarPlaceholderText = styled.span`
  font-size: 0.7rem;
  font-weight: 500;
`

const AvatarHint = styled.div`
  font-size: 0.8rem;
  color: #A0AEC0;
`

// ── Danger Zone ─────────────────────────────────────────────────────
const DangerSection = styled.div`
  margin-top: 48px;
  padding-top: 32px;
  border-top: 1px solid #FED7D7;
`

const DangerTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  color: #C53030;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 12px;

  svg { width: 16px; height: 16px; }
`

const DangerDescription = styled.p`
  font-size: 0.85rem;
  color: #718096;
  line-height: 1.6;
  margin: 0 0 16px 0;
`

const DangerButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 20px;
  font-size: 0.9rem;
  font-weight: 600;
  background: #FFFFFF;
  color: #C53030;
  border: 2px solid #FEB2B2;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  width: 100%;

  svg { width: 16px; height: 16px; }

  &:hover {
    background: #FFF5F5;
    border-color: #FC8181;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(197, 48, 48, 0.15);
  }

  &:active {
    transform: translateY(0);
  }
`

const fadeIn = keyframes`
  from { opacity: 0; transform: scale(0.95); }
  to   { opacity: 1; transform: scale(1); }
`

const ConfirmOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`

const ConfirmCard = styled.div`
  background: #FFFFFF;
  border-radius: 20px;
  padding: 32px;
  max-width: 420px;
  width: 90%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
  animation: ${fadeIn} 0.25s ease-out;
  text-align: center;
`

const ConfirmIcon = styled.div`
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: #FFF5F5;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
  color: #C53030;

  svg { width: 28px; height: 28px; }
`

const ConfirmTitle = styled.h3`
  font-size: 1.2rem;
  font-weight: 700;
  color: #2D3436;
  margin: 0 0 8px;
`

const ConfirmText = styled.p`
  font-size: 0.9rem;
  color: #718096;
  line-height: 1.6;
  margin: 0 0 24px;
`

const ConfirmButtons = styled.div`
  display: flex;
  gap: 12px;
`

const ConfirmCancel = styled.button`
  flex: 1;
  padding: 10px;
  font-size: 0.9rem;
  font-weight: 600;
  background: #F7FAFC;
  color: #4A5568;
  border: 1px solid #E2E8F0;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover { background: #EDF2F7; }
`

const ConfirmDelete = styled.button`
  flex: 1;
  padding: 10px;
  font-size: 0.9rem;
  font-weight: 600;
  background: #C53030;
  color: #FFFFFF;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover { background: #9B2C2C; transform: translateY(-1px); }
  &:active { transform: translateY(0); }
`

export function ProfileSetup() {
  const { state, dispatch } = useApp()
  const { saveProfile, saveConfig, loadProfile, loadHistory, deleteVault } = useVault()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  
  // Avatar state for preview
  const [avatarPreview, setAvatarPreview] = useState<string | null>(
    state.profile?.avatar || null
  )
  const [avatarChanged, setAvatarChanged] = useState(false)
  const avatarChangedRef = useRef(false)
  avatarChangedRef.current = avatarChanged

  // Load weight unit preference from config, default to kg
  const [weightUnit, setWeightUnit] = useState<WeightUnit>(
    (state.config?.weightUnit || 'kg') as WeightUnit
  )
  const [formData, setFormData] = useState({
    name: '',
    weight: '',
    height: '',
    age: '',
    gender: 'male' as 'male' | 'female',
    activityLevel: 'moderate' as Profile['activityLevel']
  })

  // ── Sync form and avatar from persisted profile when it loads/changes ─
  useEffect(() => {
    const p = state.profile
    const unit = (state.config?.weightUnit || 'kg') as WeightUnit
    setWeightUnit(unit)
    if (p) {
      setFormData({
        name: p.name ?? '',
        weight: (p.weight != null && p.weight > 0) ? formatWeight(p.weight, unit) : '',
        height: (p.height != null && p.height > 0) ? String(p.height) : '',
        age: (p.age != null && p.age > 0) ? String(p.age) : '',
        gender: p.gender ?? 'male',
        activityLevel: p.activityLevel ?? 'moderate'
      })
      setAvatarPreview(prev => (avatarChangedRef.current ? prev : (p.avatar ?? null)))
    } else {
      setFormData({
        name: '',
        weight: '',
        height: '',
        age: '',
        gender: 'male',
        activityLevel: 'moderate'
      })
      if (!avatarChangedRef.current) setAvatarPreview(null)
    }
  }, [state.profile, state.config?.weightUnit])

  // ── Avatar selection handler ──────────────────────────────────────
  const handleAvatarClick = async () => {
    if (!window.electronAPI?.vault) return

    try {
      const base64Image = await window.electronAPI.vault.selectImage()
      if (base64Image) {
        setAvatarPreview(base64Image)
        setAvatarChanged(true)
      }
    } catch (err) {
      console.error('[ProfileSetup] Error selecting image:', err)
    }
  }

  // ── Delete vault handler ──────────────────────────────────────────
  const handleDeleteVault = async () => {
    setShowDeleteConfirm(false)
    await deleteVault()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const name = formData.name?.trim() ?? ''
    // Parse weight converting from selected unit to kg
    const weight = parseWeight(formData.weight, weightUnit)
    const height = parseFloat(formData.height)
    const age = parseInt(formData.age)

    if (!name) {
      setError('Please enter your name')
      setLoading(false)
      return
    }
    if (!weight || !height || !age || weight <= 0 || height <= 0 || age <= 0) {
      setError('Please fill in all fields with valid values (weight, height, age)')
      setLoading(false)
      return
    }

    try {
      // Merge with existing profile to preserve avatar path when not changed
      const existingProfile = state.profile || {}
      
      const profile: Profile = {
        ...existingProfile,
        name,
        weight,                    // Always stored in kg
        height,
        age,
        gender: formData.gender,
        activityLevel: formData.activityLevel,
        tmb: 0                     // Will be calculated below
      }

      // Calculate TMB with activity level
      profile.tmb = calculateTMB(profile)

      // ── If avatar was changed, save the file to vault ─────────────
      if (avatarChanged && avatarPreview && state.vaultPath && window.electronAPI?.vault) {
        try {
          const avatarResult = await window.electronAPI.vault.saveAvatar(state.vaultPath, avatarPreview)
          if (avatarResult.success && avatarResult.avatarPath) {
            profile.avatar = avatarPreview // Keep data URI for immediate display
          }
        } catch (err) {
          console.error('[ProfileSetup] Error saving avatar:', err)
        }
      }

      // Save weight unit preference to config
      const currentConfig = state.config || { 
        vaultPath: state.vaultPath!, 
        theme: 'dark', 
        notifications: true, 
        dangerZones: [{ start: 18, end: 20 }],
        weightUnit: 'kg' as const
      }
      await saveConfig({ ...currentConfig, weightUnit })

      // Save profile — avatar is a relative path like "avatar.png"
      // We need to save the path, not the base64 data URI
      const profileToSave = { ...profile }
      if (profileToSave.avatar?.startsWith('data:')) {
        // If avatar in state is a data URI, save the relative path instead
        profileToSave.avatar = 'avatar.png'
      }
      await saveProfile(profileToSave)

      // If history has no progress entries, add initial entry with registration weight & date
      const hasNoEntries = !state.history?.progressEntries?.length
      if (hasNoEntries && state.vaultPath && window.electronAPI?.history && weight) {
        try {
          await window.electronAPI.history.addEntry(state.vaultPath, {
            date: new Date().toISOString(),
            weight,
            notes: 'Starting weight (from profile)'
          })
          await loadHistory(state.vaultPath)
        } catch (err) {
          console.warn('[ProfileSetup] Could not add initial history entry:', err)
        }
      }

      // Reload profile to resolve avatar path → base64 and update state
      if (state.vaultPath) {
        await loadProfile(state.vaultPath)
      } else {
        dispatch({ type: 'SET_PROFILE', payload: profile })
      }
      setAvatarChanged(false)
    } catch (err) {
      setError('Error saving profile: ' + (err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <SetupContainer>
      <SetupCard>
        <Title>Set Up Your Profile</Title>
        <Description>
          We need some information to calculate your projected weight loss during fasting.
          This data is stored locally in your vault and never shared.
        </Description>

        {/* ── Avatar Uploader ───────────────────────────────────────── */}
        <AvatarSection>
          <AvatarCircle onClick={handleAvatarClick} title="Click to change photo">
            {avatarPreview ? (
              <AvatarImg src={avatarPreview} alt="Profile photo" />
            ) : (
              <AvatarPlaceholder>
                <Camera />
                <AvatarPlaceholderText>Add Photo</AvatarPlaceholderText>
              </AvatarPlaceholder>
            )}
          </AvatarCircle>
          <AvatarHint>
            {avatarPreview ? 'Click to change photo' : 'Click to add a profile photo'}
          </AvatarHint>
        </AvatarSection>

        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Label>Your Name</Label>
            <Input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              placeholder="e.g., Alex"
            />
          </FormGroup>

          <FormGroup>
            <Label>Weight</Label>
            <WeightRow>
              <WeightInput
                type="number"
                step="0.1"
                min="1"
                value={formData.weight}
                onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                required
                placeholder={weightUnit === 'kg' ? 'e.g., 75.5' : 'e.g., 166.4'}
              />
              <UnitSelect
                value={weightUnit}
                onChange={(e) => {
                  const newUnit = e.target.value as WeightUnit
                  if (formData.weight) {
                    const currentKg = parseWeight(formData.weight, weightUnit)
                    const converted = formatWeight(currentKg, newUnit)
                    setFormData({ ...formData, weight: converted })
                  }
                  setWeightUnit(newUnit)
                }}
              >
                <option value="kg">kg</option>
                <option value="lbs">lbs</option>
              </UnitSelect>
            </WeightRow>
            <InfoText>
              {weightUnit === 'kg' 
                ? 'Weight in kilograms (1 kg = 2.2 lbs)'
                : 'Weight in pounds (1 lb = 0.45 kg)'}
            </InfoText>
          </FormGroup>

          <FormGroup>
            <Label>Height (cm)</Label>
            <Input
              type="number"
              step="1"
              min="1"
              value={formData.height}
              onChange={(e) => setFormData({ ...formData, height: e.target.value })}
              required
              placeholder="e.g., 175"
            />
          </FormGroup>

          <FormGroup>
            <Label>Age</Label>
            <Input
              type="number"
              step="1"
              min="1"
              max="120"
              value={formData.age}
              onChange={(e) => setFormData({ ...formData, age: e.target.value })}
              required
              placeholder="e.g., 30"
            />
          </FormGroup>

          <FormGroup>
            <Label>Gender</Label>
            <Select
              value={formData.gender}
              onChange={(e) => setFormData({ ...formData, gender: e.target.value as 'male' | 'female' })}
              required
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
            </Select>
          </FormGroup>

          <FormGroup>
            <Label>Activity Level</Label>
            <Select
              value={formData.activityLevel}
              onChange={(e) => setFormData({ ...formData, activityLevel: e.target.value as Profile['activityLevel'] })}
              required
            >
              <option value="sedentary">Sedentary (little or no exercise)</option>
              <option value="light">Light (exercise 1-3 days/week)</option>
              <option value="moderate">Moderate (exercise 3-5 days/week)</option>
              <option value="active">Active (exercise 6-7 days/week)</option>
              <option value="very_active">Very Active (very hard exercise, physical job)</option>
            </Select>
            <InfoText>
              This affects your Total Daily Energy Expenditure (TDEE) calculation
            </InfoText>
          </FormGroup>

          {error && <ErrorMessage>{error}</ErrorMessage>}

          <Button type="submit" disabled={loading}>
            {loading ? 'Saving...' : 'Save Profile'}
          </Button>
        </Form>

        {/* ── Danger Zone ───────────────────────────────────────────── */}
        <DangerSection>
          <DangerTitle>
            <AlertTriangle />
            Danger Zone
          </DangerTitle>
          <DangerDescription>
            Disconnect from the current vault. This will not delete any files from your disk,
            but you will need to select a vault again next time you open the app.
          </DangerDescription>
          <DangerButton onClick={() => setShowDeleteConfirm(true)}>
            <Trash2 />
            Disconnect Vault
          </DangerButton>
        </DangerSection>
      </SetupCard>

      {/* ── Confirmation Modal ────────────────────────────────────── */}
      {showDeleteConfirm && (
        <ConfirmOverlay onClick={() => setShowDeleteConfirm(false)}>
          <ConfirmCard onClick={(e) => e.stopPropagation()}>
            <ConfirmIcon>
              <AlertTriangle />
            </ConfirmIcon>
            <ConfirmTitle>Disconnect Vault?</ConfirmTitle>
            <ConfirmText>
              You will be logged out and returned to the vault selection screen.
              Your data files on disk will remain intact.
            </ConfirmText>
            <ConfirmButtons>
              <ConfirmCancel onClick={() => setShowDeleteConfirm(false)}>
                Cancel
              </ConfirmCancel>
              <ConfirmDelete onClick={handleDeleteVault}>
                Disconnect
              </ConfirmDelete>
            </ConfirmButtons>
          </ConfirmCard>
        </ConfirmOverlay>
      )}
    </SetupContainer>
  )
}
