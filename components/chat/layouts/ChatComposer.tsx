'use client'

import React, { useState } from 'react'
import { Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ToolMenu } from '@/components/chat/ToolMenu'
import { cn } from '@/src/core/utils'

interface ChatComposerProps {
  value: string
  onChange: (value: string) => void
  onSubmit: (message: string) => void
  onToolAction?: (tool: string, data?: any) => void
  isLoading?: boolean
  placeholder?: string
  topSlot?: React.ReactNode
  className?: string
  sessionId?: string | null
}

export function ChatComposer({
  value,
  onChange,
  onSubmit,
  onToolAction,
  isLoading = false,
  placeholder = 'Message F.B/c AI...',
  topSlot,
  className,
  sessionId
}: ChatComposerProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (value.trim() && !isLoading) {
      onSubmit(value.trim())
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (value.trim() && !isLoading) {
        onSubmit(value.trim())
      }
    }
  }

  return (
    <div className={cn('space-y-3', className)}>
      {/* Top Slot (for suggestions, etc.) */}
      {topSlot && (
        <div className="flex items-center justify-end">
          {topSlot}
        </div>
      )}

      {/* Main Composer */}
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <div className="flex gap-3 p-3 bg-card/60 backdrop-blur-xl border border-border/20 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200">
            {/* Tool Menu */}
            <div className="flex items-center gap-2">
              <ToolMenu 
                onUploadDocument={() => onToolAction?.('document')}
                onUploadImage={() => onToolAction?.('image')}
                onWebcam={() => onToolAction?.('webcam')}
                onScreenShare={() => onToolAction?.('screen')}
                onROI={() => onToolAction?.('roi')}
                onVideoToApp={() => onToolAction?.('video')}
                comingSoon={['webcam', 'screen', 'video']}
                className="rounded-xl border-border/30 hover:border-accent/30 hover:bg-accent/10"
              />
            </div>
            
            {/* Text Input */}
            <Textarea
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              className="flex-1 min-h-[44px] max-h-32 resize-none border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-base placeholder:text-muted-foreground/60"
              disabled={isLoading}
              rows={1}
            />
            
            {/* Send Button */}
            <Button
              type="submit"
              disabled={isLoading || !value.trim()}
              size="icon"
              className="rounded-xl bg-gradient-to-r from-accent to-accent/90 hover:from-accent/90 hover:to-accent/80 shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          
          {/* Status Bar */}
          <div className="flex items-center justify-between mt-2 px-1">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span>Connected</span>
              {sessionId && (
                <span>• Session: {sessionId.slice(0, 8)}...</span>
              )}
            </div>
            
            <div className="text-xs text-muted-foreground">
              Press Enter to send • Shift+Enter for new line
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}