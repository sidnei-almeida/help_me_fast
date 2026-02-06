import { useState, useEffect } from 'react'
import styled, { keyframes } from 'styled-components'
import { Timer, CalendarDays, Settings } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { ActiveView } from '../../types'
import logoSrc from '../../assets/logo.png'

// ─── Animations ──────────────────────────────────────────────────────
const fadeSlideIn = keyframes`
  from { opacity: 0; transform: translateX(-8px); }
  to   { opacity: 1; transform: translateX(0); }
`

const popIn = keyframes`
  0%   { opacity: 0; transform: scale(0.85); }
  60%  { opacity: 1; transform: scale(1.05); }
  100% { opacity: 1; transform: scale(1); }
`

const pulseGlow = keyframes`
  0%, 100% { filter: drop-shadow(0 0 0px rgba(255, 150, 80, 0)); }
  50% { filter: drop-shadow(0 0 8px rgba(255, 150, 80, 0.35)); }
`

const SidebarContainer = styled.aside`
  width: 250px;
  flex-shrink: 0;
  height: 100vh;
  background: #FFFFFF;
  border-right: 1px solid #DFE6E9;
  display: flex;
  flex-direction: column;
  padding: ${props => props.theme.spacing.xl} ${props => props.theme.spacing.lg};
  padding-top: 44px; /* space below frameless title bar drag region */
  box-shadow: 2px 0 12px rgba(0, 0, 0, 0.03);
  overflow-y: auto;
  overflow-x: hidden;
  -webkit-app-region: no-drag;
`

const ProfileCard = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: ${props => props.theme.spacing.md};
  padding: ${props => props.theme.spacing.lg};
  margin-bottom: ${props => props.theme.spacing.xxl};
  animation: ${popIn} 0.5s ease-out;
`

const AvatarWrapper = styled.div`
  position: relative;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  padding: 2px;
  background: linear-gradient(135deg, ${props => props.theme.colors.gradient.start}, ${props => props.theme.colors.gradient.end});
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  flex-shrink: 0;
`

const AvatarInner = styled.div`
  width: 100%;
  height: 100%;
  border-radius: 50%;
  overflow: hidden;
  background: #FFFFFF;
  display: flex;
  align-items: center;
  justify-content: center;
`

const AvatarImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`

const ProfileInfo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
  flex: 1;
  min-width: 0;
`

const UserName = styled.div`
  font-size: ${props => props.theme.typography.fontSize.base};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  color: ${props => props.theme.colors.text.primary};
  line-height: 1.2;
`

const AppName = styled.div`
  font-size: ${props => props.theme.typography.fontSize.xs};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  background: linear-gradient(135deg, ${props => props.theme.colors.gradient.start}, ${props => props.theme.colors.gradient.end});
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: -0.01em;
`

const NavList = styled.nav`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.xs};
  flex: 1;
`

const NavItem = styled.div<{ $active?: boolean; $index?: number }>`
  padding: ${props => props.theme.spacing.md} ${props => props.theme.spacing.lg};
  border-radius: ${props => props.theme.borderRadius.md};
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.md};
  transition: all 0.2s ease;
  color: ${props => props.$active 
    ? props.theme.colors.accent 
    : '#636E72'};
  background: ${props => props.$active 
    ? 'rgba(255, 118, 117, 0.1)' 
    : 'transparent'};
  font-size: 0.95rem;
  font-weight: 500;
  animation: ${fadeSlideIn} 0.4s ease-out both;
  animation-delay: ${props => (props.$index || 0) * 0.08}s;
  
  &:hover {
    background: ${props => props.$active 
      ? 'rgba(255, 118, 117, 0.15)' 
      : '#F5F6FA'};
    transform: translateX(3px);
  }

  &:active {
    transform: translateX(1px) scale(0.98);
  }
`

const LogoFallback = styled.img`
  width: 100%;
  height: 100%;
  object-fit: contain;
  padding: 2px;
  animation: ${pulseGlow} 3s ease-in-out infinite;
`

const NavIconWrapper = styled.div<{ $active?: boolean }>`
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.$active 
    ? props.theme.colors.accent 
    : '#636E72'};
  
  svg {
    width: 100%;
    height: 100%;
    stroke-width: 1.5;
  }
`

const NavLabel = styled.span`
  font-size: 0.95rem;
  font-weight: 500;
`

const Footer = styled.div`
  padding-top: ${props => props.theme.spacing.lg};
  border-top: 1px solid #DFE6E9;
  margin-top: auto;
`

const VaultBadge = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  background: #F8F9FA;
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: 0.8rem;
  color: ${props => props.theme.colors.text.muted};
`

const statusPulse = keyframes`
  0%, 100% { box-shadow: 0 0 0 0 rgba(0, 184, 148, 0.4); }
  50% { box-shadow: 0 0 0 4px rgba(0, 184, 148, 0); }
`

const StatusIndicator = styled.div`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #00B894;
  flex-shrink: 0;
  animation: ${statusPulse} 2s ease-in-out infinite;
`

const VaultName = styled.span`
  font-weight: 500;
  color: ${props => props.theme.colors.text.secondary};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`

export function Sidebar() {
  const { state, dispatch } = useApp()
  const [avatarError, setAvatarError] = useState(false)
  
  const activeView = state.activeView || 'timer'
  
  const navItems = [
    { id: 'timer' as ActiveView, label: 'Timer', icon: Timer },
    { id: 'history' as ActiveView, label: 'History', icon: CalendarDays },
    { id: 'profile' as ActiveView, label: 'Profile', icon: Settings },
  ]

  const handleNavClick = (viewId: ActiveView) => {
    dispatch({ type: 'SET_ACTIVE_VIEW', payload: viewId })
  }

  const vaultName = state.vaultPath 
    ? state.vaultPath.split('/').pop() || 'Unknown'
    : null

  const userName = state.profile?.name || 'User'
  const userAvatar = state.profile?.avatar

  // Reset error when avatar changes
  useEffect(() => {
    setAvatarError(false)
  }, [userAvatar])

  return (
    <SidebarContainer>
      <ProfileCard>
        {userAvatar && !avatarError ? (
          <AvatarWrapper>
            <AvatarInner>
              <AvatarImage 
                src={userAvatar} 
                alt={userName}
                onError={() => {
                  console.error('[Sidebar] <img> onError fired! Avatar failed to load.')
                  setAvatarError(true)
                }}
              />
            </AvatarInner>
          </AvatarWrapper>
        ) : (
          <AvatarWrapper>
            <AvatarInner>
              <LogoFallback src={logoSrc} alt="Help Me Fast" />
            </AvatarInner>
          </AvatarWrapper>
        )}
        <ProfileInfo>
          <UserName>{userName}</UserName>
          <AppName>Help Me Fast!</AppName>
        </ProfileInfo>
      </ProfileCard>
      
      <NavList>
        {navItems.map((item, index) => {
          const IconComponent = item.icon
          const isActive = activeView === item.id
          return (
            <NavItem key={item.id} $active={isActive} $index={index} onClick={() => handleNavClick(item.id)}>
              <NavIconWrapper $active={isActive}>
                <IconComponent />
              </NavIconWrapper>
              <NavLabel>{item.label}</NavLabel>
            </NavItem>
          )
        })}
      </NavList>
      
      <Footer>
        <VaultBadge>
          {vaultName && <StatusIndicator />}
          <VaultName>
            {vaultName || 'No Vault'}
          </VaultName>
        </VaultBadge>
      </Footer>
    </SidebarContainer>
  )
}
