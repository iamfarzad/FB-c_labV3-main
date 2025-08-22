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
    onFinish: (msg) => console.log('Message finished:', msg)
  })

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

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
      'flex flex-col h-full bg-background',
      'bg-gradient-to-br from-background via-background to-background/95',
      className
    )}>
      {/* Modern Header */}
      <div className="sticky top-0 z-10 backdrop-blur-xl bg-background/80 border-b border-border/20">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-accent to-accent/80 flex items-center justify-center shadow-lg">
              <div className="w-3 h-3 rounded-full bg-accent-foreground" />
            </div>
            <div>
              <h1 className="font-semibold text-foreground">F.B/c AI Assistant</h1>
              <p className="text-xs text-muted-foreground">Modern chat experience</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {showModeToggle && (
              <div className="flex items-center gap-1 p-1 bg-muted/50 rounded-xl">
                <Button
                  variant={currentMode === 'public' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setCurrentMode('public')}
                  className="text-xs h-7 px-3"
                >
                  Public
                </Button>
                <Button
                  variant={currentMode === 'admin' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setCurrentMode('admin')}
                  className="text-xs h-7 px-3"
                >
                  Admin
                </Button>
              </div>
            )}
            
            <Button variant="ghost" size="icon" onClick={clear}>
              <RotateCcw className="w-4 h-4" />
            </Button>
            
            <Button variant="ghost" size="icon">
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto px-4 py-6">
          <div className="max-w-3xl mx-auto space-y-6">
            {messages.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-12"
              >
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent/20 to-accent/10 flex items-center justify-center mx-auto mb-4">
                  <div className="w-6 h-6 rounded-full bg-accent" />
                </div>
                <h2 className="text-xl font-semibold text-foreground mb-2">
                  Ready to assist you
                </h2>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Ask me anything about your business, get insights, or explore our AI capabilities.
                </p>
              </motion.div>
            ) : (
              <AnimatePresence mode="popLayout">
                {messages.map((message, index) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.95 }}
                    transition={{ 
                      duration: 0.3, 
                      delay: Math.min(index * 0.05, 0.15),
                      ease: [0.16, 1, 0.3, 1]
                    }}
                    className={cn(
                      'flex gap-4',
                      message.role === 'user' ? 'justify-end' : 'justify-start'
                    )}
                  >
                    <ChatBubble
                      role={message.role}
                      content={message.content}
                      timestamp={new Date()}
                      className="max-w-[85%]"
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            )}

            {/* Typing Indicator */}
            {isLoading && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-start"
              >
                <TypingIndicator />
              </motion.div>
            )}

            {/* Error Display */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-center"
              >
                <div className="bg-destructive/10 border border-destructive/20 rounded-xl px-4 py-3 text-sm text-destructive max-w-md text-center">
                  <strong>Error:</strong> {error.message}
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>

      {/* Modern Composer */}
      <div className="sticky bottom-0 bg-gradient-to-t from-background via-background/95 to-transparent">
        <div className="max-w-3xl mx-auto p-4">
          <div className="relative">
            <div className="flex gap-3 p-3 bg-card/60 backdrop-blur-xl border border-border/20 rounded-2xl shadow-lg">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={`Message F.B/c AI ${currentMode === 'admin' ? '(Admin Mode)' : ''}...`}
                className="flex-1 min-h-[44px] max-h-32 resize-none border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
                disabled={isLoading}
              />
              
              <Button
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
                size="icon"
                className="rounded-xl bg-gradient-to-r from-accent to-accent/90 hover:from-accent/90 hover:to-accent/80 shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
            
            {/* Status Indicator */}
            <div className="flex items-center justify-between mt-2 px-1">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span>Connected</span>
                {currentMode === 'admin' && (
                  <Badge variant="secondary" className="text-xs">Admin Mode</Badge>
                )}
              </div>
              
              <div className="text-xs text-muted-foreground">
                {messages.length} messages • Press Enter to send
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}