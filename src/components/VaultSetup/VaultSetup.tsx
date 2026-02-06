import { useState, useRef } from 'react'
import styled, { keyframes } from 'styled-components'
import { useVault } from '../../hooks/useVault'
import { X, Camera } from 'lucide-react'
import logoSrc from '../../assets/logo.png'

const SetupContainer = styled.div`
  width: 100%;
  flex: 1;
  color: ${props => props.theme.colors.text.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${props => props.theme.spacing.xxl};
`

const floatIn = keyframes`
  from { opacity: 0; transform: translateY(24px) scale(0.97); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
`

const bounceIn = keyframes`
  0%   { opacity: 0; transform: scale(0.6) rotate(-8deg); }
  50%  { opacity: 1; transform: scale(1.08) rotate(2deg); }
  70%  { transform: scale(0.96) rotate(-1deg); }
  100% { transform: scale(1) rotate(0deg); }
`

const OnboardingModal = styled.div`
  width: 100%;
  max-width: 600px;
  background: #FFFFFF;
  border-radius: ${props => props.theme.borderRadius.xl};
  padding: 48px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.12);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${props => props.theme.spacing.xl};
  animation: ${floatIn} 0.6s ease-out;
`

const OnboardingLogo = styled.img`
  width: 72px;
  height: 72px;
  animation: ${bounceIn} 0.8s ease-out;
  filter: drop-shadow(0 6px 20px rgba(255, 150, 80, 0.3));
`

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 800;
  color: ${props => props.theme.colors.text.primary};
  line-height: 1.2;
  letter-spacing: -0.02em;
  text-align: center;
`

const TitleHighlight = styled.span`
  background: linear-gradient(135deg, ${props => props.theme.colors.gradient.start}, ${props => props.theme.colors.gradient.end});
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`

const Description = styled.p`
  font-size: 1rem;
  color: ${props => props.theme.colors.text.secondary};
  line-height: 1.7;
  text-align: center;
  margin: 0;
`

// ── Avatar Uploader ────────────────────────────────────────────────
const AvatarSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${props => props.theme.spacing.md};
  width: 100%;
`

const AvatarContainer = styled.div`
  position: relative;
  width: 100px;
  height: 100px;
  border-radius: 50%;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 3px solid #E2E8F0;
  
  &:hover {
    border-color: ${props => props.theme.colors.gradient.start};
    transform: scale(1.05);
  }
`

const AvatarEmpty = styled.div`
  width: 100%;
  height: 100%;
  background: #F7FAFC;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #718096;
`

const AvatarIcon = styled.div`
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  svg {
    width: 100%;
    height: 100%;
    stroke-width: 1.5;
  }
`

const AvatarText = styled.div`
  font-size: 0.75rem;
  font-weight: 500;
  text-align: center;
`

const AvatarImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`

const AvatarEditButton = styled.button`
  position: absolute;
  top: 4px;
  right: 4px;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.6);
  border: none;
  color: #FFFFFF;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(0, 0, 0, 0.8);
    transform: scale(1.1);
  }
  
  svg {
    width: 14px;
    height: 14px;
    stroke-width: 2.5;
  }
`

const HiddenInput = styled.input`
  display: none;
`

// ── Name Input ───────────────────────────────────────────────────────
const NameSection = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.sm};
`

const NameLabel = styled.label`
  font-size: ${props => props.theme.typography.fontSize.sm};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  color: ${props => props.theme.colors.text.secondary};
`

const NameInput = styled.input`
  width: 100%;
  padding: 12px 16px;
  font-size: ${props => props.theme.typography.fontSize.base};
  color: ${props => props.theme.colors.text.primary};
  background: #F7FAFC;
  border: 2px solid transparent;
  border-radius: ${props => props.theme.borderRadius.md};
  transition: all 0.2s ease;
  font-family: ${props => props.theme.typography.fontFamily};
  
  &:focus {
    outline: none;
    background: #FFFFFF;
    border-color: ${props => props.theme.colors.gradient.start};
    box-shadow: 0 0 0 3px ${props => props.theme.colors.gradient.start}15;
  }
  
  &::placeholder {
    color: #A0AEC0;
  }
`

const Button = styled.button`
  width: 100%;
  padding: 1rem 2rem;
  font-size: ${props => props.theme.typography.fontSize.lg};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  background: linear-gradient(135deg, ${props => props.theme.colors.gradient.start}, ${props => props.theme.colors.gradient.end});
  color: #FFFFFF;
  border: none;
  border-radius: ${props => props.theme.borderRadius.md};
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: ${props => props.theme.shadows.md};
  margin-top: ${props => props.theme.spacing.md};
  
  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: ${props => props.theme.shadows.lg};
  }
  
  &:active:not(:disabled) {
    transform: translateY(0);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`

const ErrorMessage = styled.div`
  margin-top: ${props => props.theme.spacing.md};
  padding: ${props => props.theme.spacing.md};
  background: rgba(214, 48, 49, 0.1);
  color: ${props => props.theme.colors.danger};
  border-radius: ${props => props.theme.borderRadius.lg};
  font-size: ${props => props.theme.typography.fontSize.sm};
  border: 1px solid rgba(214, 48, 49, 0.2);
  text-align: left;
  width: 100%;
`

export function VaultSetup() {
  const { selectVaultFolder, saveProfile, loadProfile } = useVault()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [avatar, setAvatar] = useState<string | null>(null) // base64 data URI for preview
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleAvatarClick = async () => {
    if (!window.electronAPI?.vault) {
      fileInputRef.current?.click()
      return
    }

    try {
      console.log('[VaultSetup] Opening image selector...')
      const base64Image = await window.electronAPI.vault.selectImage()
      if (base64Image) {
        console.log('[VaultSetup] Image selected, base64 length:', base64Image.length)
        setAvatar(base64Image)
      }
    } catch (err) {
      console.error('[VaultSetup] Error selecting image:', err)
      fileInputRef.current?.click()
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file')
      return
    }

    const reader = new FileReader()
    reader.onloadend = () => {
      setAvatar(reader.result as string)
    }
    reader.onerror = () => {
      setError('Error reading image file')
    }
    reader.readAsDataURL(file)
  }

  const handleRemoveAvatar = (e: React.MouseEvent) => {
    e.stopPropagation()
    setAvatar(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleSelectFolder = async () => {
    if (!window.electronAPI) {
      setError('Not running inside Electron. Please launch via: npm run electron:dev')
      return
    }

    setLoading(true)
    setError(null)

    try {
      // ── STEP 1: Select folder and initialize vault ──────────────
      // selectVaultFolder now returns the PATH string (not boolean)
      const vaultPath = await selectVaultFolder()
      console.log('[VaultSetup] selectVaultFolder returned:', vaultPath)

      if (!vaultPath) {
        setError('No folder selected. Please try again.')
        setLoading(false)
        return
      }

      // ── STEP 2: Save avatar file to vault (using vaultPath directly) ──
      let avatarRelPath: string | undefined = undefined
      if (avatar && window.electronAPI?.vault) {
        console.log('[VaultSetup] Saving avatar to vault:', vaultPath)
        try {
          const avatarResult = await window.electronAPI.vault.saveAvatar(vaultPath, avatar)
          console.log('[VaultSetup] saveAvatar result:', avatarResult)
          if (avatarResult.success && avatarResult.avatarPath) {
            avatarRelPath = avatarResult.avatarPath
          }
        } catch (err) {
          console.error('[VaultSetup] Error saving avatar:', err)
        }
      }

      // ── STEP 3: Save profile with name + avatar relative path ───
      if (name.trim() || avatarRelPath) {
        const profileToSave = {
          weight: 0,
          height: 0,
          tmb: 0,
          age: 0,
          gender: 'male' as const,
          activityLevel: 'moderate' as const,
          ...(name.trim() && { name: name.trim() }),
          ...(avatarRelPath && { avatar: avatarRelPath }),
        }
        console.log('[VaultSetup] Saving profile:', profileToSave)
        await saveProfile(profileToSave, vaultPath)
      }

      // ── STEP 4: Reload profile (resolves avatar path → Base64) ──
      console.log('[VaultSetup] Reloading profile to resolve avatar...')
      await loadProfile(vaultPath)
      console.log('[VaultSetup] Done!')

    } catch (err) {
      console.error('[VaultSetup] Error:', err)
      setError('Error initializing vault: ' + (err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <SetupContainer>
      <OnboardingModal>
        <OnboardingLogo src={logoSrc} alt="Help Me Fast" />
        <Title>
          Welcome to <TitleHighlight>Help Me Fast!</TitleHighlight>
        </Title>
        
        <Description>
          Create your profile to get started. Your data will be stored locally in a folder you choose.
        </Description>

        {/* Avatar Uploader */}
        <AvatarSection>
          <AvatarContainer onClick={handleAvatarClick}>
            {avatar ? (
              <>
                <AvatarImage src={avatar} alt="Profile" />
                <AvatarEditButton onClick={handleRemoveAvatar} title="Remove photo">
                  <X />
                </AvatarEditButton>
              </>
            ) : (
              <AvatarEmpty>
                <AvatarIcon>
                  <Camera />
                </AvatarIcon>
                <AvatarText>Add Photo</AvatarText>
              </AvatarEmpty>
            )}
          </AvatarContainer>
          <HiddenInput
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
          />
        </AvatarSection>

        {/* Name Input */}
        <NameSection>
          <NameLabel htmlFor="user-name">Your Name</NameLabel>
          <NameInput
            id="user-name"
            type="text"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={50}
          />
        </NameSection>
        
        <Button onClick={handleSelectFolder} disabled={loading}>
          {loading ? 'Loading...' : 'Select Vault Folder & Continue'}
        </Button>
        
        {error && <ErrorMessage>{error}</ErrorMessage>}
      </OnboardingModal>
    </SetupContainer>
  )
}
