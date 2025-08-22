// Unified typography system - consistent text styles across all components

export const fontFamilies = {
  sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
  display: ['Inter', 'sans-serif'], // Same as sans for consistency
  mono: ['SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', 'monospace']
} as const

export const fontSizes = {
  // Type scale (1.125 ratio - perfect fourth)
  xs: '0.75rem',      // 12px
  sm: '0.875rem',     // 14px
  base: '1rem',       // 16px (base)
  lg: '1.125rem',     // 18px
  xl: '1.25rem',      // 20px
  '2xl': '1.5rem',    // 24px
  '3xl': '1.875rem',  // 30px
  '4xl': '2.25rem',   // 36px
  '5xl': '3rem',      // 48px
  '6xl': '3.75rem',   // 60px
} as const

export const fontWeights = {
  light: '300',
  normal: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  extrabold: '800'
} as const

export const lineHeights = {
  tight: '1.25',      // 1.25
  snug: '1.375',      // 1.375
  normal: '1.5',      // 1.5
  relaxed: '1.625',   // 1.625
  loose: '2',         // 2
} as const

export const letterSpacing = {
  tighter: '-0.05em',
  tight: '-0.025em',
  normal: '0em',
  wide: '0.025em',
  wider: '0.05em',
  widest: '0.1em'
} as const

// Semantic text styles
export const textStyles = {
  // Headings
  h1: {
    fontSize: fontSizes['4xl'],
    fontWeight: fontWeights.bold,
    lineHeight: lineHeights.tight,
    letterSpacing: letterSpacing.tight
  },
  h2: {
    fontSize: fontSizes['3xl'],
    fontWeight: fontWeights.semibold,
    lineHeight: lineHeights.tight,
    letterSpacing: letterSpacing.tight
  },
  h3: {
    fontSize: fontSizes['2xl'],
    fontWeight: fontWeights.semibold,
    lineHeight: lineHeights.snug,
    letterSpacing: letterSpacing.normal
  },
  h4: {
    fontSize: fontSizes.xl,
    fontWeight: fontWeights.semibold,
    lineHeight: lineHeights.snug,
    letterSpacing: letterSpacing.normal
  },
  h5: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.medium,
    lineHeight: lineHeights.normal,
    letterSpacing: letterSpacing.normal
  },
  h6: {
    fontSize: fontSizes.base,
    fontWeight: fontWeights.medium,
    lineHeight: lineHeights.normal,
    letterSpacing: letterSpacing.normal
  },
  
  // Body text
  body: {
    fontSize: fontSizes.base,
    fontWeight: fontWeights.normal,
    lineHeight: lineHeights.normal,
    letterSpacing: letterSpacing.normal
  },
  bodyLarge: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.normal,
    lineHeight: lineHeights.relaxed,
    letterSpacing: letterSpacing.normal
  },
  bodySmall: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.normal,
    lineHeight: lineHeights.normal,
    letterSpacing: letterSpacing.normal
  },
  
  // UI text
  caption: {
    fontSize: fontSizes.xs,
    fontWeight: fontWeights.normal,
    lineHeight: lineHeights.normal,
    letterSpacing: letterSpacing.wide
  },
  label: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.medium,
    lineHeight: lineHeights.normal,
    letterSpacing: letterSpacing.normal
  },
  button: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.medium,
    lineHeight: lineHeights.normal,
    letterSpacing: letterSpacing.normal
  },
  
  // Code text
  code: {
    fontFamily: fontFamilies.mono,
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.normal,
    lineHeight: lineHeights.normal
  },
  codeBlock: {
    fontFamily: fontFamilies.mono,
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.normal,
    lineHeight: lineHeights.relaxed
  }
} as const

// Typography utility functions
export function getTextStyle(style: keyof typeof textStyles): typeof textStyles[keyof typeof textStyles] {
  return textStyles[style]
}

export function getFontSize(size: keyof typeof fontSizes): string {
  return fontSizes[size]
}

export function getFontWeight(weight: keyof typeof fontWeights): string {
  return fontWeights[weight]
}

// CSS Class generators
export function generateTypographyClasses(): Record<string, string> {
  const classes: Record<string, string> = {}
  
  // Generate text size classes
  Object.entries(fontSizes).forEach(([key, value]) => {
    classes[`.text-${key}`] = `font-size: ${value};`
  })
  
  // Generate font weight classes
  Object.entries(fontWeights).forEach(([key, value]) => {
    classes[`.font-${key}`] = `font-weight: ${value};`
  })
  
  return classes
}

// CSS Custom Property Generator
export function generateTypographyProperties(): Record<string, string> {
  const properties: Record<string, string> = {}
  
  // Font families
  properties['--font-sans'] = fontFamilies.sans.join(', ')
  properties['--font-display'] = fontFamilies.display.join(', ')
  properties['--font-mono'] = fontFamilies.mono.join(', ')
  
  // Font sizes
  Object.entries(fontSizes).forEach(([key, value]) => {
    properties[`--font-size-${key}`] = value
  })
  
  return properties
}