/**
 * 🎨 F.B/c THEME TOKENS - IMMUTABLE BRAND COLORS
 *
 * 🚫 NEVER MODIFY BRAND COLORS WITHOUT APPROVAL 🚫
 * These tokens represent the F.B/c brand identity
 *
 * @version 1.0.0
 * @last-updated 2025-01-27
 */

export const tokens = {
  light: {
    // 🎨 IMMUTABLE BRAND COLORS - NEVER CHANGE
    brand: '#ff5b04',          // F.B/c Orange - THE BRAND
    brandHover: '#e65200',     // Orange hover state

    // 🌟 LIGHT THEME COLORS
    bg: '#f5f5f5',             // Light Silver background
    surface: '#ffffff',        // White surface
    surfaceElevated: '#e5e5e5', // Elevated surface

    text: '#111111',           // Primary text
    textMuted: '#666666',      // Muted text

    border: '#e5e5e5',        // Default border

    // 🎨 SEMANTIC COLORS (SAFE TO EXTEND)
    success: '#10b981',        // Green for success states
    warning: '#f59e0b',        // Amber for warning states
    error: '#ef4444',          // Red for error states
    info: '#3b82f6',           // Blue for info states
  },
  dark: {
    // 🎨 IMMUTABLE BRAND COLORS - NEVER CHANGE
    brand: '#ff5b04',          // F.B/c Orange - THE BRAND
    brandHover: '#e65200',     // Orange hover state

    // 🌙 DARK THEME COLORS
    bg: '#0b1620',             // Dark navy background
    surface: '#1d2a35',        // Dark surface
    surfaceElevated: '#1f2f3a', // Elevated dark surface

    text: '#e5e9ec',          // Light text
    textMuted: '#a0a5aa',      // Muted light text

    border: '#2a3a46',        // Dark border

    // 🎨 SEMANTIC COLORS (SAFE TO EXTEND)
    success: '#10b981',        // Green (same for dark)
    warning: '#f59e0b',        // Amber (same for dark)
    error: '#ef4444',          // Red (same for dark)
    info: '#60a5fa',           // Light blue for dark
  },
} as const

/**
 * Theme mode type
 */
export type ThemeMode = keyof typeof tokens

/**
 * Color token type
 */
export type ColorToken = keyof typeof tokens.light

/**
 * Get a specific color token for a theme
 */
export function getColor(mode: ThemeMode, token: ColorToken): string {
  return tokens[mode][token]
}

/**
 * Get all colors for a specific theme
 */
export function getThemeColors(mode: ThemeMode) {
  return tokens[mode]
}

/**
 * IMMUTABLE BRAND COLORS - These define the F.B/c identity
 * 🚫 NEVER CHANGE THESE VALUES 🚫
 */
export const BRAND_COLORS = {
  primary: '#ff5b04',      // F.B/c Orange - THE BRAND
  hover: '#e65200',        // Orange hover state
} as const

/**
 * Validate brand colors haven't been changed
 * This function can be used in tests or CI/CD to ensure brand integrity
 */
export function validateBrandColors(): boolean {
  const currentBrand = tokens.light.brand
  const currentHover = tokens.light.brandHover

  const expectedBrand = BRAND_COLORS.primary
  const expectedHover = BRAND_COLORS.hover

  if (currentBrand !== expectedBrand) {
    console.error(`🚨 BRAND COLOR VIOLATION: Expected ${expectedBrand}, got ${currentBrand}`)
    return false
  }

  if (currentHover !== expectedHover) {
    console.error(`🚨 BRAND HOVER COLOR VIOLATION: Expected ${expectedHover}, got ${currentHover}`)
    return false
  }

  return true
}

/**
 * Theme system metadata
 */
export const THEME_METADATA = {
  version: '1.0.0',
  lastUpdated: '2025-01-27',
  brandName: 'F.B/c',
  description: 'Professional AI consulting brand colors',
} as const

/**
 * USAGE GUIDELINES:
 *
 * ✅ CORRECT USAGE:
 * import { getColor } from '@/src/core/theme/tokens'
 * const brandColor = getColor('light', 'brand')
 *
 * ✅ IN COMPONENTS:
 * <div style={{ backgroundColor: tokens.light.brand }}>
 *
 * ✅ WITH TAILWIND:
 * <div className="bg-brand hover:bg-brand-hover">
 *
 * 🚫 FORBIDDEN:
 * const colors = { brand: '#ff0000' }  // Never redefine
 * tokens.light.brand = '#different'   // Never modify
 *
 * 🎯 BRAND PROTECTION:
 * - tokens.light.brand (#ff5b04) = F.B/c Orange - NEVER CHANGE
 * - tokens.light.brandHover (#e65200) = Orange hover - NEVER CHANGE
 * - All other colors can be extended safely
 */
