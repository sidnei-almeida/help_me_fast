import { useState, useEffect } from 'react'
import { ThemeProvider } from 'styled-components'
import styled, { keyframes } from 'styled-components'
import { AppProvider, useApp } from './context/AppContext'
import { Dashboard } from './components/Dashboard/Dashboard'
import { VaultSetup } from './components/VaultSetup/VaultSetup'
import { ProfileSetup } from './components/ProfileSetup/ProfileSetup'
import { Sidebar } from './components/Sidebar/Sidebar'
import { HistoryScreen } from './components/HistoryScreen/HistoryScreen'
import { WindowControls } from './components/WindowControls/WindowControls'
import { useVault } from './hooks/useVault'
import { theme } from './styles/theme'
import logoSrc from './assets/logo.png'
import './index.css'

/* ═══════════════════════════════════════════════════════════════════
   THE APP SHELL — rigid Flexbox cage, no scroll on the window itself.
   ═══════════════════════════════════════════════════════════════════ */
const AppShell = styled.div`
  display: flex;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background: #F2F2F7;
  position: relative;
`

/* ── Main area: everything right of the sidebar ─────────────────── */
const MainArea = styled.main`
  flex: 1;
  min-width: 0;           /* allow flex child to shrink below content size */
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: #FFFFFF;
`

/* ── Drag region: sits at the very top of MainArea ──────────────── */
const DragRegion = styled.div`
  width: 100%;
  height: 36px;
  flex-shrink: 0;
  -webkit-app-region: drag;
  position: relative;       /* so WindowControls can anchor inside */
`

/* ── Scrollable content: THE overflow container ─────────────────── */
const ScrollableContent = styled.div`
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  -webkit-app-region: no-drag;
`

/* ── Width restriction for form-like pages ──────────────────────── */
const ContentConstraint = styled.div`
  width: 100%;
  max-width: 1280px;
  margin: 0 auto;
`

/* ── Animations ───────────────────────────────────────────────────── */
const breathe = keyframes`
  0%, 100% { transform: scale(1); opacity: 0.9; }
  50% { transform: scale(1.06); opacity: 1; }
`

const shimmer = keyframes`
  0% { background-position: -200% center; }
  100% { background-position: 200% center; }
`

const slideUp = keyframes`
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
`

/* ── Loading splash (shown while checking saved vault) ─────────────── */
const LoadingSplash = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 24px;
  background: #F2F2F7;
`

const SplashLogo = styled.img`
  width: 80px;
  height: 80px;
  animation: ${breathe} 2s ease-in-out infinite;
  filter: drop-shadow(0 8px 24px rgba(255, 150, 80, 0.25));
`

const SplashText = styled.div`
  font-size: 0.9rem;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  background: linear-gradient(90deg, #636E72 25%, #FF9966 50%, #636E72 75%);
  background-size: 200% auto;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: ${shimmer} 2.5s linear infinite;
`

/* ── View transition wrapper ──────────────────────────────────────── */
const ViewTransition = styled.div`
  animation: ${slideUp} 0.35s ease-out;
  width: 100%;
`

/* ═══════════════════════════════════════════════════════════════════ */

function AppContent() {
  const { state } = useApp()
  const { initializeVault } = useVault()
  const [booting, setBooting] = useState(true)

  // ── Auto-load last vault on first mount ──────────────────────────
  useEffect(() => {
    let cancelled = false

    async function tryAutoLoad() {
      try {
        if (!window.electronAPI?.settings) {
          setBooting(false)
          return
        }

        const savedPath = await window.electronAPI.settings.getLastVault()
        console.log('[App] Auto-load: savedPath =', savedPath)

        if (savedPath && !cancelled) {
          const success = await initializeVault(savedPath)
          console.log('[App] Auto-load: initializeVault =', success)
        }
      } catch (err) {
        console.warn('[App] Auto-load failed:', err)
      } finally {
        if (!cancelled) setBooting(false)
      }
    }

    tryAutoLoad()
    return () => { cancelled = true }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
  // ^ intentionally empty deps: run ONCE on mount

  // ── Show nothing while checking for saved vault ───────────────────
  if (booting) {
    return (
      <LoadingSplash>
        <SplashLogo src={logoSrc} alt="Help Me Fast" />
        <SplashText>Loading</SplashText>
      </LoadingSplash>
    )
  }

  // ── Pre-vault: show onboarding ────────────────────────────────────
  if (!state.vaultPath) {
    return <VaultSetup />
  }

  if (!state.profile || state.profile.weight === 0) {
    return (
      <>
        <Sidebar />
        <MainArea>
          <DragRegion>
            <WindowControls />
          </DragRegion>
          <ScrollableContent>
            <ContentConstraint>
              <ProfileSetup />
            </ContentConstraint>
          </ScrollableContent>
        </MainArea>
      </>
    )
  }

  // ── Normal app: sidebar + active view ─────────────────────────────
  const renderActiveView = () => {
    switch (state.activeView) {
      case 'history':
        return <HistoryScreen />
      case 'profile':
        return <ProfileSetup />
      case 'timer':
      default:
        return <Dashboard />
    }
  }

  return (
    <>
      <Sidebar />
      <MainArea>
        <DragRegion>
          <WindowControls />
        </DragRegion>
        <ScrollableContent>
          <ViewTransition key={state.activeView}>
            {renderActiveView()}
          </ViewTransition>
        </ScrollableContent>
      </MainArea>
    </>
  )
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <AppProvider>
        <AppShell>
          <AppContent />
        </AppShell>
      </AppProvider>
    </ThemeProvider>
  )
}

export default App
