'use client'

import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { Loader2 } from 'lucide-react'
import { buttonVariants, type ButtonVariants } from '@/src/design/components/button'
import { cn } from '@/src/core/utils'

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    ButtonVariants {
  asChild?: boolean
  loading?: boolean
  loadingText?: string
  icon?: React.ReactNode
  iconPosition?: 'left' | 'right'
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant, 
    size, 
    loading = false, 
    loadingText,
    fullWidth,
    asChild = false, 
    children,
    icon,
    iconPosition = 'left',
    disabled,
    ...props 
  }, ref) => {
    const Comp = asChild ? Slot : 'button'
    
    const isDisabled = disabled || loading
    
    return (
      <Comp
        className={cn(
          buttonVariants({ variant, size, loading, fullWidth }),
          className
        )}
        ref={ref}
        disabled={isDisabled}
        {...props}
      >
        {loading && (
          <Loader2 className="h-4 w-4 animate-spin" />
        )}
        
        {!loading && icon && iconPosition === 'left' && icon}
        
        <span className={cn(loading && 'opacity-70')}>
          {loading && loadingText ? loadingText : children}
        </span>
        
        {!loading && icon && iconPosition === 'right' && icon}
      </Comp>
    )
  }
)

Button.displayName = 'Button'

export { Button, buttonVariants }