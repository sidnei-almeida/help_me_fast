export const theme = {
  colors: {
    background: '#F2F2F7',
    surface: '#FFFFFF',
    surfaceElevated: '#FFFFFF',
    text: {
      primary: '#2D3436',
      secondary: '#636E72',
      muted: '#B2BEC3'
    },
    accent: '#FF7675',
    success: '#00B894',
    warning: '#FDCB6E',
    danger: '#D63031',
    phases: {
      anabolic: '#38B2AC',
      catabolic: '#ECC94B',
      fatBurn: '#ED8936',
      ketosis: '#D53F8C'
    },
    gradient: {
      start: '#FF9966',
      end: '#FF5E62'
    }
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    xxl: '3rem'
  },
  borderRadius: {
    sm: '8px',
    md: '12px',  // Buttons, inputs, small cards
    lg: '16px',  // Large cards
    xl: '24px',  // Extra large cards (onboarding)
    full: '12px' // Changed from pill shape to rounded rectangle
  },
  shadows: {
    sm: '0 2px 8px rgba(0,0,0,0.04)',
    md: '0 4px 20px rgba(0,0,0,0.05)',
    lg: '0 8px 32px rgba(0,0,0,0.08)'
  },
  typography: {
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
      '5xl': '3rem',
      '6xl': '4rem'
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700
    }
  }
}

export type Theme = typeof theme
