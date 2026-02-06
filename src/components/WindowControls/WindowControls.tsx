import { useState, useEffect } from 'react'
import styled from 'styled-components'
import { Minus, Square, X, Copy } from 'lucide-react'

// ─── Styled Components ──────────────────────────────────────────────

const ControlsContainer = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  z-index: 200;
  display: flex;
  align-items: center;
  height: 36px;
  -webkit-app-region: no-drag;
`

const ControlButton = styled.button<{ $variant?: 'close' }>`
  width: 46px;
  height: 36px;
  border: none;
  background: transparent;
  color: #636E72;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;
  -webkit-app-region: no-drag;

  svg {
    width: 16px;
    height: 16px;
    stroke-width: 1.5;
  }

  &:hover {
    background: ${p => p.$variant === 'close' ? '#E81123' : 'rgba(0, 0, 0, 0.06)'};
    color: ${p => p.$variant === 'close' ? '#FFFFFF' : '#2D3436'};
  }

  &:active {
    background: ${p => p.$variant === 'close' ? '#C50F1F' : 'rgba(0, 0, 0, 0.1)'};
  }
`

// ─── Component ──────────────────────────────────────────────────────

export function WindowControls() {
  const [isMaximized, setIsMaximized] = useState(false)

  useEffect(() => {
    if (!window.electronAPI?.window) return

    // Get initial state
    window.electronAPI.window.isMaximized().then(setIsMaximized)

    // Listen for changes
    const cleanup = window.electronAPI.window.onMaximizedChanged(setIsMaximized)
    return cleanup
  }, [])

  const handleMinimize = () => {
    window.electronAPI?.window?.minimize()
  }

  const handleMaximize = () => {
    window.electronAPI?.window?.maximize()
  }

  const handleClose = () => {
    window.electronAPI?.window?.close()
  }

  return (
    <ControlsContainer>
      <ControlButton onClick={handleMinimize} title="Minimize">
        <Minus />
      </ControlButton>
      <ControlButton onClick={handleMaximize} title={isMaximized ? 'Restore' : 'Maximize'}>
        {isMaximized ? <Copy /> : <Square />}
      </ControlButton>
      <ControlButton $variant="close" onClick={handleClose} title="Close">
        <X />
      </ControlButton>
    </ControlsContainer>
  )
}
