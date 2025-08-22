import { cva, type VariantProps } from 'class-variance-authority'

// Unified card system - single source of truth for all card styles
export const cardVariants = cva(
  // Base styles - consistent across all cards
  [
    'rounded-2xl border text-card-foreground',
    'transition-all duration-300 ease-out',
    'focus-within:ring-2 focus-within:ring-accent/20 focus-within:ring-offset-2'
  ],
  {
    variants: {
      variant: {
        // Default - clean minimal card
        default: [
          'bg-card border-border/20 shadow-sm',
          'hover:shadow-md'
        ],
        
        // Elevated - pronounced depth
        elevated: [
          'bg-card border-border/20 shadow-lg',
          'hover:shadow-xl hover:-translate-y-1',
          'active:translate-y-0 active:shadow-lg'
        ],
        
        // Glass - modern glass morphism
        glass: [
          'bg-card/60 border-border/20 backdrop-blur-2xl shadow-xl',
          'hover:bg-card/80 hover:shadow-2xl',
          'hover:-translate-y-0.5'
        ],
        
        // Minimal - subtle appearance
        minimal: [
          'bg-card/80 border-border/30 backdrop-blur-sm',
          'hover:bg-card/90 hover:border-border/50'
        ],
        
        // Outline - border emphasis
        outline: [
          'bg-transparent border-2 border-border',
          'hover:bg-card/50 hover:border-accent/30'
        ],
        
        // Gradient - subtle gradient background
        gradient: [
          'bg-gradient-to-br from-card to-card/80 border-border/20',
          'shadow-md hover:shadow-lg'
        ],
        
        // Interactive - for clickable cards
        interactive: [
          'bg-card border-border/20 shadow-sm cursor-pointer',
          'hover:shadow-lg hover:border-accent/30 hover:-translate-y-1',
          'active:translate-y-0 active:shadow-md',
          'focus:ring-2 focus:ring-accent/20'
        ]
      },
      
      padding: {
        none: 'p-0',
        sm: 'p-4',           // 16px
        md: 'p-6',           // 24px (default)
        lg: 'p-8',           // 32px
        xl: 'p-10'           // 40px
      },
      
      spacing: {
        tight: 'space-y-2',   // 8px between children
        normal: 'space-y-4', // 16px between children
        relaxed: 'space-y-6' // 24px between children
      }
    },
    
    defaultVariants: {
      variant: 'default',
      padding: 'md',
      spacing: 'normal'
    }
  }
)

// Card header variants
export const cardHeaderVariants = cva(
  'flex flex-col space-y-1.5',
  {
    variants: {
      padding: {
        none: 'p-0',
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8'
      }
    },
    defaultVariants: {
      padding: 'md'
    }
  }
)

// Card content variants
export const cardContentVariants = cva(
  '',
  {
    variants: {
      padding: {
        none: 'p-0',
        sm: 'p-4 pt-0',
        md: 'p-6 pt-0',
        lg: 'p-8 pt-0'
      }
    },
    defaultVariants: {
      padding: 'md'
    }
  }
)

// Card footer variants
export const cardFooterVariants = cva(
  'flex items-center',
  {
    variants: {
      padding: {
        none: 'p-0',
        sm: 'p-4 pt-0',
        md: 'p-6 pt-0',
        lg: 'p-8 pt-0'
      },
      justify: {
        start: 'justify-start',
        center: 'justify-center',
        end: 'justify-end',
        between: 'justify-between'
      }
    },
    defaultVariants: {
      padding: 'md',
      justify: 'start'
    }
  }
)

// Export types
export type CardVariants = VariantProps<typeof cardVariants>
export type CardHeaderVariants = VariantProps<typeof cardHeaderVariants>
export type CardContentVariants = VariantProps<typeof cardContentVariants>
export type CardFooterVariants = VariantProps<typeof cardFooterVariants>

// Utility functions
export function getCardClasses(props: CardVariants): string {
  return cardVariants(props)
}

export function getCardHeaderClasses(props: CardHeaderVariants): string {
  return cardHeaderVariants(props)
}

export function getCardContentClasses(props: CardContentVariants): string {
  return cardContentVariants(props)
}

export function getCardFooterClasses(props: CardFooterVariants): string {
  return cardFooterVariants(props)
}