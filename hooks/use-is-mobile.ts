'use client'

import { useEffect, useState } from 'react'

/**
 * Hook to detect if the current screen size is mobile based on breakpoint
 * @param breakpointPx - Breakpoint in pixels (default: 768)
 * @returns boolean indicating if screen is mobile size
 */
export function useIsMobile(breakpointPx: number = 768): boolean {
  // Start with false for SSR consistency
  const [isMobile, setIsMobile] = useState<boolean>(false)

  useEffect(() => {
    // Handle SSR
    if (typeof window === 'undefined') return

    // Create media query
    const mql = window.matchMedia(`(max-width: ${breakpointPx}px)`)

    // Set initial value
    setIsMobile(mql.matches)

    // Define change handler
    const onChange = (event: MediaQueryListEvent) => {
      setIsMobile(event.matches)
    }

    // Add listener
    mql.addEventListener('change', onChange)

    // Cleanup
    return () => mql.removeEventListener('change', onChange)
  }, [breakpointPx])

  return isMobile
}

// Common breakpoint presets for convenience
export const MOBILE_BREAKPOINTS = {
  sm: 640,  // Tailwind sm
  md: 768,  // Tailwind md (default)
  lg: 1024, // Tailwind lg
  xl: 1280, // Tailwind xl
} as const

// Convenience hooks with preset breakpoints
export function useIsMobileSm(): boolean {
  return useIsMobile(MOBILE_BREAKPOINTS.sm)
}

export function useIsMobileMd(): boolean {
  return useIsMobile(MOBILE_BREAKPOINTS.md)
}

export function useIsMobileLg(): boolean {
  return useIsMobile(MOBILE_BREAKPOINTS.lg)
}

export function useIsMobileXl(): boolean {
  return useIsMobile(MOBILE_BREAKPOINTS.xl)
}


