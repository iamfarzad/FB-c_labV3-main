'use client'

import React, { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Copy, Check, Edit, Languages, ExternalLink } from 'lucide-react'
import { cn } from '@/src/core/utils'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { FbcIcon } from '@/components/ui/fbc-icon'
import { User } from 'lucide-react'
import { Response } from '@/components/ai-elements/response'
import { Reasoning, ReasoningTrigger, ReasoningContent } from '@/components/ai-elements/reasoning'
import { Sources, SourcesTrigger, SourcesContent, Source } from '@/components/ai-elements/source'
import { Actions, Action, Suggestions, Suggestion } from '@/components/ai-elements/actions'
import { ActivityChip } from '@/components/chat/activity/ActivityChip'
import CitationDisplay from '@/components/chat/CitationDisplay'
import { ToolCardWrapper } from '@/components/chat/ToolCardWrapper'

interface ChatMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp?: Date
  type?: 'default' | 'code' | 'image' | 'analysis' | 'tool' | 'insight'
  metadata?: {
    sources?: Array<{ url: string; title?: string; description?: string }>
    citations?: Array<{ uri: string; title?: string }>
    tools?: Array<{ type: string; data: any }>
    suggestions?: string[]
    imageUrl?: string
    activities?: Array<{ type: 'in' | 'out'; label: string }>
  }
}

interface ChatMessagesProps {
  messages: ChatMessage[]
  isLoading?: boolean
  className?: string
  stickyHeader?: React.ReactNode
  emptyState?: React.ReactNode
}

export function ChatMessages({
  messages,
  isLoading = false,
  className,
  stickyHeader,
  emptyState
}: ChatMessagesProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 120
    
    if (isNearBottom) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
      }, 100)
    }
  }, [messages.length])

  const defaultEmptyState = (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex-1 flex items-center justify-center min-h-[40vh]"
    >
      <div className="text-center max-w-md">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent/20 to-accent/10 flex items-center justify-center mx-auto mb-6">
          <FbcIcon className="h-6 w-6 text-accent" />
        </div>
        <h3 className="text-xl font-semibold text-foreground mb-3">
          Ready to assist you
        </h3>
        <p className="text-muted-foreground leading-relaxed">
          Ask me about AI automation, business strategy, ROI analysis, or anything else you'd like to explore.
        </p>
      </div>
    </motion.div>
  )

  return (
    <div 
      ref={containerRef}
      className={cn(
        'flex-1 overflow-y-auto scroll-smooth',
        className
      )}
    >
      {/* Sticky Header */}
      {stickyHeader && (
        <div className="sticky top-0 z-30 bg-background/90 backdrop-blur-sm border-b border-border/20">
          <div className="max-w-3xl mx-auto px-4 py-3">
            {stickyHeader}
          </div>
        </div>
      )}

      {/* Messages Container */}
      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        {messages.length === 0 ? (
          emptyState || defaultEmptyState
        ) : (
          <AnimatePresence mode="popLayout">
            {messages.map((message, index) => (
              <MessageBubble
                key={message.id}
                message={message}
                index={index}
                isLast={index === messages.length - 1}
              />
            ))}
          </AnimatePresence>
        )}

        {/* Typing Indicator */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex gap-3 items-end"
          >
            <Avatar className="w-8 h-8 shrink-0">
              <AvatarFallback className="bg-muted text-muted-foreground">
                <FbcIcon className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
            
            <div className="bg-card/60 backdrop-blur-xl border border-border/20 rounded-2xl rounded-bl-md px-4 py-3 shadow-lg">
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="w-2 h-2 rounded-full bg-muted-foreground/50"
                      animate={{
                        scale: [1, 1.3, 1],
                        opacity: [0.5, 1, 0.5]
                      }}
                      transition={{
                        duration: 1.2,
                        repeat: Infinity,
                        delay: i * 0.2
                      }}
                    />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">AI is thinking...</span>
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} className="h-4" />
      </div>
    </div>
  )
}

// Enhanced Message Bubble Component with all features
interface MessageBubbleProps {
  message: ChatMessage
  index: number
  isLast: boolean
}

function MessageBubble({ message, index, isLast }: MessageBubbleProps) {
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null)
  const [isTranslating, setIsTranslating] = useState(false)
  const [translation, setTranslation] = useState<string | null>(null)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content)
      setCopiedMessageId(message.id)
      setTimeout(() => setCopiedMessageId(null), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  const handleTranslate = async () => {
    setIsTranslating(true)
    try {
      const res = await fetch('/api/tools/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: message.content, targetLang: 'es' })
      })
      if (res.ok) {
        const data = await res.json()
        setTranslation(data.translated)
      }
    } catch (error) {
      console.error('Translation failed:', error)
    } finally {
      setIsTranslating(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ 
        duration: 0.3, 
        delay: Math.min(index * 0.05, 0.15),
        ease: [0.16, 1, 0.3, 1]
      }}
      className={cn(
        'flex gap-3 items-end group',
        message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
      )}
    >
      {/* Avatar */}
      <Avatar className="w-8 h-8 shrink-0">
        <AvatarFallback className={cn(
          'font-medium shadow-sm',
          message.role === 'user' 
            ? 'bg-accent text-accent-foreground' 
            : 'bg-muted text-muted-foreground'
        )}>
          {message.role === 'user' ? (
            <User className="h-4 w-4" />
          ) : (
            <FbcIcon className="h-4 w-4" />
          )}
        </AvatarFallback>
      </Avatar>
      
      {/* Message Content */}
      <div className={cn(
        'max-w-[85%] rounded-2xl px-4 py-3 shadow-lg backdrop-blur-xl transition-all duration-200 relative group',
        'break-words hyphens-auto leading-relaxed',
        message.role === 'user' 
          ? 'bg-gradient-to-r from-accent to-accent/90 text-accent-foreground rounded-br-md hover:shadow-xl' 
          : 'bg-card/60 border border-border/20 text-foreground rounded-bl-md hover:shadow-lg'
      )}>
        {/* Reasoning (for assistant messages) */}
        {message.role === 'assistant' && message.type === 'analysis' && (
          <Reasoning defaultOpen={false} isStreaming={isLast && isLoading}>
            <ReasoningTrigger>
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <p>Thinking…</p>
              </div>
            </ReasoningTrigger>
            <ReasoningContent>Processing your request...</ReasoningContent>
          </Reasoning>
        )}

        {/* Main Content with Activity Chips */}
        <div className="prose prose-sm max-w-none leading-relaxed break-words dark:prose-invert">
          {/* Parse content for activity chips */}
          {message.content.split(/(\[ACTIVITY_(IN|OUT):[^\]]+\])/).map((part, idx) => {
            const activityMatch = part.match(/\[ACTIVITY_(IN|OUT):([^\]]+)\]/)
            if (activityMatch) {
              const direction = activityMatch[1].toLowerCase() as 'in' | 'out'
              const label = activityMatch[2].trim()
              return (
                <ActivityChip 
                  key={`${message.id}-activity-${idx}`}
                  direction={direction}
                  label={label}
                  className="mx-1 align-middle"
                />
              )
            }
            return part ? <Response key={`${message.id}-content-${idx}`}>{part}</Response> : null
          })}
        </div>

        {/* Tool Results */}
        {message.type === 'tool' && message.metadata?.tools?.length && (
          <div className="mt-3 space-y-2">
            {message.metadata.tools.map((tool, i) => {
              if (tool.type === 'roiResult') {
                const r = tool.data || {}
                return (
                  <ToolCardWrapper key={`tool-${message.id}-${i}`} title="ROI Analysis" icon={<FbcIcon className="h-4 w-4" />}>
                    <div className="grid grid-cols-3 gap-3 text-sm">
                      <div className="text-center p-3 rounded-lg bg-accent/10">
                        <div className="font-semibold text-accent">{r.estimatedROI ?? r.roi}%</div>
                        <div className="text-xs text-muted-foreground">ROI</div>
                      </div>
                      <div className="text-center p-3 rounded-lg bg-accent/5">
                        <div className="font-semibold">{r.paybackPeriod ?? '—'}</div>
                        <div className="text-xs text-muted-foreground">Payback (mo)</div>
                      </div>
                      <div className="text-center p-3 rounded-lg bg-accent/5">
                        <div className="font-semibold">${(r.costSavings ?? r.netProfit)?.toLocaleString?.() ?? r.costSavings}</div>
                        <div className="text-xs text-muted-foreground">Net Profit</div>
                      </div>
                    </div>
                  </ToolCardWrapper>
                )
              }
              return null
            })}
          </div>
        )}

        {/* Image */}
        {message.metadata?.imageUrl && (
          <div className="mt-3 rounded-lg overflow-hidden border border-border/20">
            <img 
              src={message.metadata.imageUrl} 
              alt="Message attachment" 
              className="max-w-full h-auto"
            />
          </div>
        )}

        {/* Citations using ai-elements */}
        {message.metadata?.citations && message.metadata.citations.length > 0 && (
          <div className="mt-3">
            <CitationDisplay citations={message.metadata.citations} />
          </div>
        )}

        {/* Sources using ai-elements */}
        {message.metadata?.sources && message.metadata.sources.length > 0 && (
          <div className="mt-3">
            <Sources>
              <SourcesTrigger count={message.metadata.sources.length} />
              <SourcesContent>
                {message.metadata.sources.map((source, i) => (
                  <Source 
                    key={`${message.id}-src-${i}`} 
                    href={source.url} 
                    title={source.title || source.url} 
                  />
                ))}
              </SourcesContent>
            </Sources>
          </div>
        )}

        {/* Translation */}
        {translation && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 text-sm border-l-2 border-accent/40 pl-3 text-foreground/90"
          >
            <div className="mb-1 text-xs uppercase tracking-wide opacity-70">
              Translated (ES)
            </div>
            <div className="prose prose-sm max-w-none dark:prose-invert">
              {translation}
            </div>
          </motion.div>
        )}

        {/* Suggestions using ai-elements */}
        {message.role === 'assistant' && message.metadata?.suggestions && (
          <div className="mt-3">
            <Suggestions>
              {message.metadata.suggestions.map((suggestion, i) => (
                <Suggestion 
                  key={`${message.id}-sug-${i}`} 
                  suggestion={suggestion} 
                  onClick={() => console.log('Suggestion clicked:', suggestion)} 
                />
              ))}
            </Suggestions>
          </div>
        )}
        
        {/* Timestamp */}
        {message.timestamp && (
          <div className={cn(
            'text-xs mt-3 opacity-70',
            message.role === 'user' ? 'text-accent-foreground/70' : 'text-muted-foreground'
          )}>
            {message.timestamp.toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </div>
        )}

        {/* Message Actions using ai-elements */}
        <Actions className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Action
            tooltip={copiedMessageId === message.id ? 'Copied' : 'Copy'}
            aria-label="Copy"
            variant="ghost"
            size="sm"
            onClick={handleCopy}
          >
            {copiedMessageId === message.id ?
              <Check className="w-3 h-3 text-green-500" /> :
              <Copy className="w-3 h-3" />
            }
          </Action>

          {message.role === 'user' && (
            <Action
              tooltip="Edit"
              aria-label="Edit message"
              variant="ghost"
              size="sm"
              onClick={() => console.log('Edit message:', message.id)}
            >
              <Edit className="w-3 h-3" />
            </Action>
          )}

          {message.role === 'assistant' && (
            <Action
              tooltip={isTranslating ? 'Translating…' : 'Translate'}
              aria-label="Translate"
              variant="ghost"
              size="sm"
              onClick={handleTranslate}
              disabled={isTranslating}
            >
              <Languages className="w-3 h-3" />
            </Action>
          )}
        </Actions>
      </div>
    </motion.div>
  )
}