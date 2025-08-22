'use client'

import * as React from 'react'
import { 
  cardVariants, 
  cardHeaderVariants, 
  cardContentVariants, 
  cardFooterVariants,
  type CardVariants,
  type CardHeaderVariants,
  type CardContentVariants,
  type CardFooterVariants
} from '@/src/design/components/card'
import { cn } from '@/src/core/utils'

// Main Card Component
export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    CardVariants {}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, padding, spacing, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(cardVariants({ variant, padding, spacing }), className)}
      {...props}
    />
  )
)
Card.displayName = 'Card'

// Card Header Component
export interface CardHeaderProps
  extends React.HTMLAttributes<HTMLDivElement>,
    CardHeaderVariants {}

const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, padding, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(cardHeaderVariants({ padding }), className)}
      {...props}
    />
  )
)
CardHeader.displayName = 'CardHeader'

// Card Title Component
const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      'text-xl font-semibold leading-tight tracking-tight text-card-foreground',
      className
    )}
    {...props}
  />
))
CardTitle.displayName = 'CardTitle'

// Card Description Component
const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-sm text-muted-foreground leading-relaxed', className)}
    {...props}
  />
))
CardDescription.displayName = 'CardDescription'

// Card Content Component
export interface CardContentProps
  extends React.HTMLAttributes<HTMLDivElement>,
    CardContentVariants {}

const CardContent = React.forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, padding, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(cardContentVariants({ padding }), className)}
      {...props}
    />
  )
)
CardContent.displayName = 'CardContent'

// Card Footer Component
export interface CardFooterProps
  extends React.HTMLAttributes<HTMLDivElement>,
    CardFooterVariants {}

const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, padding, justify, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(cardFooterVariants({ padding, justify }), className)}
      {...props}
    />
  )
)
CardFooter.displayName = 'CardFooter'

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
  cardVariants
}