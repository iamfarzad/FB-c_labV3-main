// Unified color system - single source of truth for all colors
// Based on F.B/c brand identity and accessibility standards

export const brandColors = {
  // Core Brand
  primary: '#ff5b04',      // F.B/c Orange
  primaryHover: '#e65200', // Darker orange for hover
  secondary: '#1a1a1a',    // Gunmetal
  tertiary: '#f5f5f5',     // Light Silver
  
  // Brand Gradients
  primaryGradient: 'linear-gradient(135deg, #ff5b04 0%, #e65200 100%)',
  glassGradient: 'linear-gradient(135deg, rgba(255, 91, 4, 0.1) 0%, rgba(230, 82, 0, 0.05) 100%)'
} as const

export const semanticColors = {
  // Status Colors
  success: '#22c55e',      // Green
  warning: '#f59e0b',      // Amber  
  error: '#ef4444',        // Red
  info: '#3b82f6',         // Blue
  
  // Status Variants
  successLight: '#dcfce7',
  warningLight: '#fef3c7',
  errorLight: '#fee2e2',
  infoLight: '#dbeafe'
} as const

export const neutralColors = {
  // Grayscale Palette (HSL values for Tailwind)
  white: '0 0% 100%',
  gray50: '0 0% 98%',
  gray100: '0 0% 96%',   // --background (light)
  gray200: '0 0% 88%',   // --muted, --border
  gray300: '0 0% 80%',
  gray400: '0 0% 60%',   // --muted-foreground
  gray500: '0 0% 40%',
  gray600: '0 0% 30%',
  gray700: '0 0% 20%',
  gray800: '0 0% 16%',   // --card (dark)
  gray900: '0 0% 10%',   // --foreground (dark), --background (dark)
  black: '0 0% 0%'
} as const

export const surfaceColors = {
  // Surface Hierarchy
  background: {
    light: neutralColors.gray100,  // #f5f5f5
    dark: neutralColors.gray900    // #1a1a1a
  },
  card: {
    light: neutralColors.gray100,  // Same as background for minimal design
    dark: neutralColors.gray800    // #2a2a2a
  },
  muted: {
    light: neutralColors.gray200,  // #e0e0e0
    dark: neutralColors.gray800    // #2a2a2a
  }
} as const

// HSL Color Tokens (for CSS custom properties)
export const hslTokens = {
  // Brand (converted to HSL)
  primary: '20 100% 51%',        // #ff5b04
  primaryForeground: '0 0% 100%', // White text on orange
  
  // Surfaces
  background: {
    light: neutralColors.gray100,
    dark: neutralColors.gray900
  },
  foreground: {
    light: neutralColors.gray900,
    dark: neutralColors.gray100
  },
  card: {
    light: neutralColors.gray100,
    dark: neutralColors.gray800
  },
  cardForeground: {
    light: neutralColors.gray900,
    dark: neutralColors.gray100
  },
  
  // Interactive
  border: {
    light: neutralColors.gray200,
    dark: neutralColors.gray800
  },
  muted: {
    light: neutralColors.gray200,
    dark: neutralColors.gray800
  },
  mutedForeground: {
    light: neutralColors.gray400,
    dark: neutralColors.gray400
  },
  
  // Semantic (HSL)
  success: '142 76% 36%',        // #22c55e
  warning: '38 92% 50%',         // #f59e0b
  error: '0 84% 60%',            // #ef4444
  info: '221 83% 53%'            // #3b82f6
} as const

// Color Utilities
export function getColorValue(colorPath: string, mode: 'light' | 'dark' = 'light'): string {
  // Helper to get color values programmatically
  const [category, variant] = colorPath.split('.')
  
  if (category === 'brand') {
    return brandColors[variant as keyof typeof brandColors]
  }
  
  if (category === 'semantic') {
    return semanticColors[variant as keyof typeof semanticColors]
  }
  
  if (category === 'surface') {
    const surface = surfaceColors[variant as keyof typeof surfaceColors]
    return typeof surface === 'object' ? surface[mode] : surface
  }
  
  return neutralColors[variant as keyof typeof neutralColors] || '#000000'
}

// CSS Custom Property Generator
export function generateCSSCustomProperties(mode: 'light' | 'dark' = 'light') {
  const tokens = hslTokens
  const properties: Record<string, string> = {}
  
  // Generate --color-* properties
  Object.entries(tokens).forEach(([key, value]) => {
    if (typeof value === 'object') {
      properties[`--${key}`] = value[mode]
    } else {
      properties[`--${key}`] = value
    }
  })
  
  return properties
}