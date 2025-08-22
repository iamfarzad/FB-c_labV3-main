'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, RotateCcw, Settings } from 'lucide-react'
import { useChat } from '@/ui/hooks/useChat'
import { Button } from '../ui/primitives/button'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/primitives/card'
import { ChatBubble, TypingIndicator } from '../ui/patterns/chat-bubble'
import { Textarea } from '../ui/textarea'
import { Badge } from '../ui/badge'
import { cn } from '@/src/core/utils'

interface ModernChatInterfaceProps {
  mode?: 'public' | 'admin'
  className?: string
  showModeToggle?: boolean
}

export function ModernChatInterface({ 
  mode = 'public', 
  className,
  showModeToggle = false 
}: ModernChatInterfaceProps) {
  const [currentMode, setCurrentMode] = useState<'public' | 'admin'>(mode)
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  const { messages, isLoading, error, send, clear } = useChat({ 
    mode: currentMode,
    onError: (err) => console.error('Chat error:', err),
    onFinish: (msg) => console.log('Message completed:', msg.content.substring(0, 50) + '...')
  })

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  const handleSend = async () => {
    if (!input.trim() || isLoading) return
    await send(input)
    setInput('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className={cn(
      'flex flex-col h-full max-h-[600px] w-full max-w-4xl mx-auto',
      className
    )}>
      {/* Header */}
      <Card variant="glass" padding="sm" className="mb-4">
        <CardHeader padding="sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-accent to-accent/80 flex items-center justify-center">
                <span className="text-accent-foreground font-bold text-sm">F</span>
              </div>
              <div>
                <CardTitle className="text-lg">F.B/c AI Assistant</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {currentMode === 'admin' ? 'Admin Dashboard Mode' : 'Business Consulting Mode'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Mode Toggle */}
              {showModeToggle && (
                <div className="flex gap-1 p-1 bg-muted/30 rounded-lg">
                  <Badge 
                    variant={currentMode === 'public' ? 'default' : 'outline'}
                    className="cursor-pointer px-3 py-1"
                    onClick={() => setCurrentMode('public')}
                  >
                    Public
                  </Badge>
                  <Badge 
                    variant={currentMode === 'admin' ? 'default' : 'outline'}
                    className="cursor-pointer px-3 py-1"
                    onClick={() => setCurrentMode('admin')}
                  >
                    Admin
                  </Badge>
                </div>
              )}
              
              {/* Actions */}
              <Button variant="ghost" size="icon-sm" onClick={clear}>
                <RotateCcw className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon-sm">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Messages Area */}
      <Card variant="minimal" padding="sm" className="flex-1 flex flex-col min-h-0">
        <CardContent padding="sm" className="flex-1 overflow-hidden">
          <div className="h-full overflow-y-auto space-y-4 scroll-smooth">
            {/* Empty State */}
            {messages.length === 0 && !isLoading && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center h-full text-center py-12"
              >
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-accent/10 to-accent/5 flex items-center justify-center mb-4">
                  <span className="text-2xl font-bold text-accent">F</span>
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Ready to help you succeed
                </h3>
                <p className="text-muted-foreground max-w-md">
                  Ask me about AI automation, business strategy, ROI analysis, or anything else you'd like to explore.
                </p>
              </motion.div>
            )}

            {/* Messages */}
            <AnimatePresence mode="popLayout">
              {messages.map((message) => (
                <ChatBubble
                  key={message.id}
                  message={{
                    ...message,
                    timestamp: new Date()
                  }}
                  showTimestamp={true}
                  className="mb-4"
                />
              ))}
            </AnimatePresence>

            {/* Typing Indicator */}
            {isLoading && <TypingIndicator className="mb-4" />}

            {/* Scroll anchor */}
            <div ref={messagesEndRef} />
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-2"
        >
          <Card variant="outline" padding="sm">
            <CardContent padding="sm">
              <div className="flex items-center gap-2 text-destructive text-sm">
                <div className="w-2 h-2 rounded-full bg-destructive" />
                Error: {error.message}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Input Area */}
      <Card variant="glass" padding="sm" className="mt-4">
        <CardContent padding="sm">
          <div className="flex gap-3 items-end">
            <div className="flex-1">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={`Message F.B/c${currentMode === 'admin' ? ' (Admin)' : ''}...`}
                className="min-h-[44px] max-h-32 resize-none border-0 bg-transparent focus:ring-0 text-base"
                rows={1}
              />
            </div>
            
            <Button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              loading={isLoading}
              loadingText="Sending..."
              size="icon"
              className="shrink-0"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Input Footer */}
          <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
            <span>
              {currentMode === 'admin' ? 'Admin mode active' : 'Press Enter to send, Shift+Enter for new line'}
            </span>
            <span className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
              Connected
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}