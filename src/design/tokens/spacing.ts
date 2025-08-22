// Unified spacing system - 8px base grid for consistency
// All spacing values should use these tokens

export const spaceScale = {
  // Base scale (8px grid)
  0: '0',
  1: '0.25rem',    // 4px
  2: '0.5rem',     // 8px
  3: '0.75rem',    // 12px
  4: '1rem',       // 16px
  5: '1.25rem',    // 20px
  6: '1.5rem',     // 24px
  8: '2rem',       // 32px
  10: '2.5rem',    // 40px
  12: '3rem',      // 48px
  16: '4rem',      // 64px
  20: '5rem',      // 80px
  24: '6rem',      // 96px
  32: '8rem',      // 128px
} as const

export const componentSpacing = {
  // Component-specific spacing
  button: {
    paddingX: spaceScale[4],     // 16px
    paddingY: spaceScale[2],     // 8px
    gap: spaceScale[2],          // 8px between icon and text
  },
  card: {
    padding: spaceScale[6],      // 24px
    gap: spaceScale[4],          // 16px between elements
    margin: spaceScale[4],       // 16px between cards
  },
  input: {
    paddingX: spaceScale[4],     // 16px
    paddingY: spaceScale[3],     // 12px
    gap: spaceScale[2],          // 8px between label and input
  },
  chat: {
    messagePadding: spaceScale[4],   // 16px inside bubbles
    messageGap: spaceScale[3],       // 12px between messages
    sidebarPadding: spaceScale[6],   // 24px in sidebars
  },
  layout: {
    headerHeight: '4rem',        // 64px
    sidebarWidth: '18rem',       // 288px
    dockHeight: '7.5rem',        // 120px
    containerPadding: spaceScale[6], // 24px
  }
} as const

export const layoutSpacing = {
  // Layout-specific spacing
  container: {
    sm: spaceScale[4],      // 16px
    md: spaceScale[6],      // 24px
    lg: spaceScale[8],      // 32px
    xl: spaceScale[12],     // 48px
  },
  section: {
    sm: spaceScale[8],      // 32px
    md: spaceScale[12],     // 48px
    lg: spaceScale[16],     // 64px
    xl: spaceScale[24],     // 96px
  },
  grid: {
    gap: spaceScale[6],     // 24px default grid gap
    columnGap: spaceScale[4], // 16px column gap
    rowGap: spaceScale[6],    // 24px row gap
  }
} as const

// Responsive spacing utilities
export const responsiveSpacing = {
  // Mobile-first responsive spacing
  padding: {
    sm: 'p-3 md:p-4 lg:p-6',      // 12px → 16px → 24px
    md: 'p-4 md:p-6 lg:p-8',      // 16px → 24px → 32px
    lg: 'p-6 md:p-8 lg:p-12',     // 24px → 32px → 48px
  },
  margin: {
    sm: 'm-3 md:m-4 lg:m-6',
    md: 'm-4 md:m-6 lg:m-8',
    lg: 'm-6 md:m-8 lg:m-12',
  },
  gap: {
    sm: 'gap-2 md:gap-3 lg:gap-4',  // 8px → 12px → 16px
    md: 'gap-3 md:gap-4 lg:gap-6',  // 12px → 16px → 24px
    lg: 'gap-4 md:gap-6 lg:gap-8',  // 16px → 24px → 32px
  }
} as const

// Touch target sizing (accessibility)
export const touchTargets = {
  // Minimum touch target sizes (WCAG 2.1 AA)
  minimum: '44px',         // 44px minimum
  comfortable: '48px',     // 48px comfortable
  large: '56px',          // 56px large target
  
  // Component-specific targets
  button: {
    sm: '36px',           // Small buttons
    md: '44px',           // Default buttons  
    lg: '48px',           // Large buttons
    xl: '56px',           // Extra large buttons
  },
  input: {
    height: '44px',       // Input field height
    padding: '12px',      // Internal padding
  }
} as const

// Spacing utility functions
export function getSpacing(size: keyof typeof spaceScale): string {
  return spaceScale[size]
}

export function getComponentSpacing(component: keyof typeof componentSpacing): typeof componentSpacing[keyof typeof componentSpacing] {
  return componentSpacing[component]
}

export function getLayoutSpacing(layout: keyof typeof layoutSpacing): typeof layoutSpacing[keyof typeof layoutSpacing] {
  return layoutSpacing[layout]
}

// CSS Custom Property Generator
export function generateSpacingProperties(): Record<string, string> {
  const properties: Record<string, string> = {}
  
  // Generate --space-* properties
  Object.entries(spaceScale).forEach(([key, value]) => {
    properties[`--space-${key}`] = value
  })
  
  // Generate component spacing properties
  properties['--button-padding-x'] = componentSpacing.button.paddingX
  properties['--button-padding-y'] = componentSpacing.button.paddingY
  properties['--card-padding'] = componentSpacing.card.padding
  properties['--input-padding-x'] = componentSpacing.input.paddingX
  properties['--input-padding-y'] = componentSpacing.input.paddingY
  
  // Generate layout properties
  properties['--header-height'] = componentSpacing.layout.headerHeight
  properties['--sidebar-width'] = componentSpacing.layout.sidebarWidth
  properties['--dock-height'] = componentSpacing.layout.dockHeight
  
  return properties
}