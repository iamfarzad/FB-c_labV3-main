'use client'

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { motion } from 'framer-motion'
import { cn } from '@/src/core/utils'
import { Avatar, AvatarFallback } from '../avatar'
import { Badge } from '../badge'

// Chat bubble variants using design system
const chatBubbleVariants = cva(
  [
    'relative max-w-[85%] rounded-2xl px-4 py-3',
    'transition-all duration-200 ease-out',
    'break-words hyphens-auto'
  ],
  {
    variants: {
      role: {
        user: [
          'bg-gradient-to-r from-accent to-accent/90 text-accent-foreground',
          'ml-auto shadow-lg hover:shadow-xl',
          'rounded-br-md' // Distinctive corner for user messages
        ],
        assistant: [
          'bg-card/60 backdrop-blur-xl border border-border/20',
          'text-card-foreground shadow-md hover:shadow-lg',
          'rounded-bl-md' // Distinctive corner for assistant messages
        ],
        system: [
          'bg-muted/50 text-muted-foreground border border-border/30',
          'mx-auto text-center text-sm italic'
        ]
      },
      size: {
        sm: 'px-3 py-2 text-sm',
        md: 'px-4 py-3 text-base',
        lg: 'px-5 py-4 text-base'
      },
      animation: {
        none: '',
        slide: 'animate-in slide-in-from-bottom-2 duration-300',
        fade: 'animate-in fade-in duration-300'
      }
    },
    defaultVariants: {
      role: 'assistant',
      size: 'md',
      animation: 'slide'
    }
  }
)

// Message container variants
const messageContainerVariants = cva(
  'flex gap-3 group',
  {
    variants: {
      role: {
        user: 'flex-row-reverse',
        assistant: 'flex-row',
        system: 'justify-center'
      }
    }
  }
)

export interface ChatBubbleProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof chatBubbleVariants> {
  message: {
    id: string
    role: 'user' | 'assistant' | 'system'
    content: string
    timestamp?: Date
    avatar?: string
    name?: string
    status?: 'sending' | 'sent' | 'error'
  }
  showAvatar?: boolean
  showTimestamp?: boolean
  onRetry?: () => void
}

export function ChatBubble({
  message,
  role,
  size,
  animation,
  showAvatar = true,
  showTimestamp = false,
  onRetry,
  className,
  ...props
}: ChatBubbleProps) {
  const messageRole = role || message.role
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={cn(messageContainerVariants({ role: messageRole }))}
      {...props}
    >
      {/* Avatar */}
      {showAvatar && messageRole !== 'system' && (
        <Avatar className="h-8 w-8 shrink-0">
          <AvatarFallback className={cn(
            'text-xs font-medium',
            messageRole === 'user' 
              ? 'bg-muted text-muted-foreground' 
              : 'bg-accent text-accent-foreground'
          )}>
            {messageRole === 'user' ? 'U' : 'F'}
          </AvatarFallback>
        </Avatar>
      )}
      
      {/* Message Content */}
      <div className="flex flex-col gap-1 min-w-0 flex-1">
        {/* Message Bubble */}
        <div
          className={cn(
            chatBubbleVariants({ role: messageRole, size, animation }),
            className
          )}
        >
          {message.content}
        </div>
        
        {/* Message Meta */}
        <div className={cn(
          'flex items-center gap-2 text-xs text-muted-foreground',
          messageRole === 'user' ? 'justify-end' : 'justify-start'
        )}>
          {/* Timestamp */}
          {showTimestamp && message.timestamp && (
            <span>
              {message.timestamp.toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </span>
          )}
          
          {/* Status Badge */}
          {message.status && message.status !== 'sent' && (
            <Badge 
              variant={message.status === 'error' ? 'destructive' : 'secondary'}
              className="h-5 px-2 text-xs"
            >
              {message.status === 'sending' && 'Sending...'}
              {message.status === 'error' && 'Failed'}
            </Badge>
          )}
          
          {/* Retry Button */}
          {message.status === 'error' && onRetry && (
            <button
              onClick={onRetry}
              className="text-accent hover:text-accent/80 underline"
            >
              Retry
            </button>
          )}
        </div>
      </div>
    </motion.div>
  )
}

// Typing indicator component
export function TypingIndicator({ className }: { className?: string }) {
  return (
    <div className={cn(messageContainerVariants({ role: 'assistant' }), className)}>
      <Avatar className="h-8 w-8 shrink-0">
        <AvatarFallback className="bg-accent text-accent-foreground text-xs font-medium">
          F
        </AvatarFallback>
      </Avatar>
      
      <div className={cn(
        chatBubbleVariants({ role: 'assistant', size: 'md' }),
        'flex items-center gap-1'
      )}>
        <span className="text-sm text-muted-foreground">Thinking</span>
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-1 h-1 bg-current rounded-full animate-pulse"
              style={{ animationDelay: `${i * 0.2}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export { chatBubbleVariants }