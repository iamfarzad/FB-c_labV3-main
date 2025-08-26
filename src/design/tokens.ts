/**
 * Design System Tokens
 * Centralized design tokens for consistent UI/UX across the application
 */

// Color Palette - Primary Brand Colors
export const colors = {
  brand: {
    primary: '#ff5b04', // F.B/c Orange
    primaryHover: '#e65200',
    secondary: '#1a1a1a', // Gunmetal
    secondaryLight: '#2a2a2a',
    accent: '#f5f5f5', // Light Silver
    accentDark: '#e0e0e0',
  },
} as const

// Semantic Color Tokens (HSL values for Tailwind hsl() function)
export const semanticColors = {
  light: {
    background: '0 0% 96%', // #f5f5f5
    foreground: '0 0% 10%', // #1a1a1a
    card: '0 0% 96%',
    'card-foreground': '0 0% 10%',
    popover: '0 0% 96%',
    'popover-foreground': '0 0% 10%',
    primary: '20 100% 51%', // #ff5b04
    'primary-foreground': '0 0% 100%',
    secondary: '0 0% 88%', // #e0e0e0
    'secondary-foreground': '0 0% 10%',
    muted: '0 0% 88%',
    'muted-foreground': '0 0% 40%', // #666666
    accent: '20 100% 51%',
    'accent-foreground': '0 0% 100%',
    destructive: '0 84% 60%',
    'destructive-foreground': '0 0% 98%',
    border: '0 0% 88%',
    input: '0 0% 96%',
    ring: '20 100% 51%',
  },
  dark: {
    background: '0 0% 10%', // #1a1a1a
    foreground: '0 0% 96%', // #f5f5f5
    card: '0 0% 16%', // #2a2a2a
    'card-foreground': '0 0% 96%',
    popover: '0 0% 16%',
    'popover-foreground': '0 0% 96%',
    primary: '20 100% 51%', // #ff5b04
    'primary-foreground': '0 0% 100%',
    secondary: '0 0% 16%',
    'secondary-foreground': '0 0% 96%',
    muted: '0 0% 16%',
    'muted-foreground': '0 0% 60%', // #999999
    accent: '20 100% 51%',
    'accent-foreground': '0 0% 100%',
    destructive: '0 84% 60%',
    'destructive-foreground': '0 0% 10%',
    border: '0 0% 16%',
    input: '0 0% 16%',
    ring: '20 100% 51%',
  },
} as const

// Typography Scale
export const typography = {
  fontFamily: {
    sans: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif',
    display: '"Inter", sans-serif',
    mono: 'system-ui, "SF Mono", Monaco, "Cascadia Code", monospace',
  },
  fontSize: {
    xs: ['0.75rem', { lineHeight: '1rem' }], // 12px
    sm: ['0.875rem', { lineHeight: '1.25rem' }], // 14px
    base: ['1rem', { lineHeight: '1.5rem' }], // 16px
    lg: ['1.125rem', { lineHeight: '1.75rem' }], // 18px
    xl: ['1.25rem', { lineHeight: '1.75rem' }], // 20px
    '2xl': ['1.5rem', { lineHeight: '2rem' }], // 24px
    '3xl': ['1.875rem', { lineHeight: '2.25rem' }], // 30px
    '4xl': ['2.25rem', { lineHeight: '2.5rem' }], // 36px
    '5xl': ['3rem', { lineHeight: '1' }], // 48px
  },
  fontWeight: {
    thin: '100',
    extralight: '200',
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
    black: '900',
  },
} as const

// Spacing Scale (8px base)
export const spacing = {
  px: '1px',
  0: '0',
  0.5: '0.125rem', // 2px
  1: '0.25rem', // 4px
  1.5: '0.375rem', // 6px
  2: '0.5rem', // 8px
  2.5: '0.625rem', // 10px
  3: '0.75rem', // 12px
  3.5: '0.875rem', // 14px
  4: '1rem', // 16px
  5: '1.25rem', // 20px
  6: '1.5rem', // 24px
  8: '2rem', // 32px
  10: '2.5rem', // 40px
  12: '3rem', // 48px
  16: '4rem', // 64px
  20: '5rem', // 80px
  24: '6rem', // 96px
  32: '8rem', // 128px
  40: '10rem', // 160px
  48: '12rem', // 192px
  56: '14rem', // 224px
  64: '16rem', // 256px
} as const

// Border Radius Scale
export const borderRadius = {
  none: '0',
  sm: '0.125rem', // 2px
  DEFAULT: '0.25rem', // 4px
  md: '0.375rem', // 6px
  lg: '0.5rem', // 8px
  xl: '0.75rem', // 12px
  '2xl': '1rem', // 16px
  '3xl': '1.5rem', // 24px
  full: '9999px',
} as const

// Shadow Scale
export const shadows = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  DEFAULT: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
  none: '0 0 #0000',
} as const

// Animation & Transition Tokens
export const animations = {
  duration: {
    fast: '150ms',
    normal: '200ms',
    slow: '300ms',
    slower: '500ms',
  },
  easing: {
    linear: 'linear',
    in: 'cubic-bezier(0.4, 0, 1, 1)',
    out: 'cubic-bezier(0, 0, 0.2, 1)',
    inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    smooth: 'cubic-bezier(0.16, 1, 0.3, 1)',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  },
} as const

// Component Size Tokens
export const componentSizes = {
  button: {
    height: {
      sm: '2.25rem', // 36px
      default: '2.5rem', // 40px
      lg: '2.75rem', // 44px
    },
    padding: {
      sm: '0.75rem 1rem', // 12px 16px
      default: '0.75rem 1.5rem', // 12px 24px
      lg: '0.875rem 2rem', // 14px 32px
    },
  },
  input: {
    height: {
      sm: '2.25rem', // 36px
      default: '2.5rem', // 40px
      lg: '3rem', // 48px
    },
  },
  card: {
    padding: {
      sm: '1rem', // 16px
      default: '1.5rem', // 24px
      lg: '2rem', // 32px
    },
  },
} as const

// Z-Index Scale
export const zIndex = {
  auto: 'auto',
  0: '0',
  10: '10',
  20: '20',
  30: '30',
  40: '40',
  50: '50',
  dropdown: '1000',
  sticky: '1020',
  banner: '1030',
  modal: '1040',
  popover: '1050',
  tooltip: '1060',
  toast: '1070',
} as const

// Breakpoints (Tailwind defaults)
export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const

// Export all tokens as a single object for programmatic access
export const designTokens = {
  colors,
  semanticColors,
  typography,
  spacing,
  borderRadius,
  shadows,
  animations,
  componentSizes,
  zIndex,
  breakpoints,
} as const

export type DesignTokens = typeof designTokens
export type ColorScheme = 'light' | 'dark'
