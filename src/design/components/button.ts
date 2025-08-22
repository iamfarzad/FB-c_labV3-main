import { cva, type VariantProps } from 'class-variance-authority'

// Unified button system - single source of truth for all button styles
export const buttonVariants = cva(
  // Base styles - consistent across all buttons
  [
    'inline-flex items-center justify-center gap-2',
    'whitespace-nowrap rounded-xl font-medium',
    'transition-all duration-200 ease-out',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/20 focus-visible:ring-offset-2',
    'disabled:pointer-events-none disabled:opacity-50',
    '[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0'
  ],
  {
    variants: {
      variant: {
        // Primary - F.B/c brand button
        primary: [
          'bg-gradient-to-r from-accent to-accent/90 text-accent-foreground',
          'shadow-lg hover:shadow-xl hover:from-accent/90 hover:to-accent/80',
          'active:from-accent/80 active:to-accent/70',
          'hover:-translate-y-0.5 active:translate-y-0'
        ],
        
        // Secondary - subtle emphasis
        secondary: [
          'bg-muted/50 text-muted-foreground border border-border/30',
          'hover:bg-muted/80 hover:border-accent/30 hover:text-foreground',
          'active:bg-muted/90'
        ],
        
        // Outline - minimal emphasis
        outline: [
          'border border-border/30 bg-background/50 text-foreground',
          'hover:bg-accent/5 hover:border-accent/50',
          'active:bg-accent/10'
        ],
        
        // Ghost - no background
        ghost: [
          'text-foreground hover:bg-accent/5 hover:text-accent',
          'active:bg-accent/10'
        ],
        
        // Destructive - dangerous actions
        destructive: [
          'bg-destructive text-destructive-foreground',
          'hover:bg-destructive/90 active:bg-destructive/80',
          'shadow-sm hover:shadow-md'
        ],
        
        // Success - positive actions
        success: [
          'bg-green-600 text-white',
          'hover:bg-green-700 active:bg-green-800',
          'shadow-sm hover:shadow-md'
        ],
        
        // Glass - modern glass morphism
        glass: [
          'bg-card/60 backdrop-blur-xl border border-border/20',
          'text-foreground shadow-lg',
          'hover:bg-card/80 hover:shadow-xl',
          'hover:-translate-y-0.5 active:translate-y-0'
        ],
        
        // Link - text-only
        link: [
          'text-accent underline-offset-4',
          'hover:underline active:text-accent/80'
        ]
      },
      
      size: {
        sm: 'h-9 px-3 text-sm',           // Small
        md: 'h-10 px-4 text-sm',          // Default
        lg: 'h-11 px-6 text-base',        // Large
        xl: 'h-12 px-8 text-base',        // Extra large
        icon: 'h-10 w-10',                // Icon only
        'icon-sm': 'h-8 w-8',             // Small icon
        'icon-lg': 'h-12 w-12'            // Large icon
      },
      
      loading: {
        true: 'cursor-not-allowed',
        false: 'cursor-pointer'
      },
      
      fullWidth: {
        true: 'w-full',
        false: 'w-auto'
      }
    },
    
    defaultVariants: {
      variant: 'primary',
      size: 'md',
      loading: false,
      fullWidth: false
    }
  }
)

// Button state variants for specific use cases
export const buttonStateVariants = cva('', {
  variants: {
    state: {
      default: '',
      loading: 'animate-pulse cursor-not-allowed',
      success: 'bg-green-600 text-white',
      error: 'bg-red-600 text-white'
    }
  }
})

// Export types
export type ButtonVariants = VariantProps<typeof buttonVariants>
export type ButtonStateVariants = VariantProps<typeof buttonStateVariants>

// Utility functions
export function getButtonClasses(props: ButtonVariants): string {
  return buttonVariants(props)
}

export function getButtonStateClasses(state: 'default' | 'loading' | 'success' | 'error'): string {
  return buttonStateVariants({ state })
}