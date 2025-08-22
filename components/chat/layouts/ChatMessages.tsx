'use client'

import React, { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Copy, Check, Edit, Languages, ExternalLink } from 'lucide-react'
import { cn } from '@/src/core/utils'
import { FbcIcon } from '@/components/ui/fbc-icon'
import { 
  Conversation, 
  ConversationContent, 
  ConversationScrollButton 
} from '@/components/ai-elements/conversation'
import { 
  Message, 
  MessageContent, 
  MessageAvatar 
} from '@/components/ai-elements/message'
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
    <div className={cn('flex-1 min-h-0 overflow-hidden', className)}>
      <Conversation className="h-full" aria-live="polite" aria-busy={isLoading}>
        <ConversationContent className="mx-auto w-full max-w-3xl space-y-4 px-4 py-6" aria-label="Chat messages">
          {/* Sticky Header */}
          {stickyHeader && (
            <div className="sticky top-0 z-30 bg-background/90 backdrop-blur-sm border-b border-border/20 mb-4">
              <div className="py-3">
                {stickyHeader}
              </div>
            </div>
          )}

          {/* Empty State */}
          {messages.length === 0 && !isLoading ? (
            emptyState || defaultEmptyState
          ) : (
            // Messages using proper ai-elements
            <AnimatePresence mode="popLayout">
              {messages.map((message, index) => (
                <MessageComponent 
                  key={message.id}
                  message={message}
                  isLast={index === messages.length - 1}
                />
              ))}
            </AnimatePresence>
          )}

          {/* Typing indicator using ai-elements pattern */}
          {isLoading && (
            <Message from="assistant">
              <MessageAvatar 
                src="/api/placeholder-avatar" 
                name="F.B/c AI"
              />
              <MessageContent>
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
              </MessageContent>
            </Message>
          )}
        </ConversationContent>
        
        <ConversationScrollButton className="bg-accent hover:bg-accent/90 text-accent-foreground backdrop-blur" />
      </Conversation>
    </div>
  )
}

// Message Component using proper ai-elements (replacing custom MessageBubble)
interface MessageComponentProps {
  message: ChatMessage
  isLast: boolean
}

function MessageComponent({ message, isLast }: MessageComponentProps) {
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

  // Extract activities from content
  const contentParts = React.useMemo(() => {
    const content = message.content
    const regex = /\[(ACTIVITY_IN|ACTIVITY_OUT):([^\]]+)\]/g
    const parts: Array<{ type: 'text' | 'activity'; value: string; dir?: 'in' | 'out' }> = []
    let lastIndex = 0
    let match: RegExpExecArray | null
    while ((match = regex.exec(content)) !== null) {
      if (match.index > lastIndex) {
        parts.push({ type: 'text', value: content.slice(lastIndex, match.index) })
      }
      const dir = match[1] === 'ACTIVITY_IN' ? 'in' : 'out'
      parts.push({ type: 'activity', value: match[2].trim(), dir })
      lastIndex = regex.lastIndex
    }
    if (lastIndex < content.length) {
      parts.push({ type: 'text', value: content.slice(lastIndex) })
    }
    return parts
  }, [message.content])

  return (
    <Message from={message.role}>
      {/* Avatar using ai-elements */}
      <MessageAvatar 
        src={message.role === 'assistant' ? "/api/placeholder-avatar" : "/api/user-avatar"} 
        name={message.role === 'assistant' ? "F.B/c AI" : "You"}
      />
      
      {/* Message Content using ai-elements */}
      <MessageContent>
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

        {/* Main content with activity chips */}
        <div className="prose prose-sm max-w-none leading-relaxed break-words dark:prose-invert">
          {contentParts.map((part, idx) => {
            if (part.type === 'activity' && part.dir) {
              return (
                <ActivityChip 
                  key={`${message.id}-act-${idx}`} 
                  direction={part.dir} 
                  label={part.value} 
                  className="mx-1 align-middle" 
                />
              )
            }
            return (
              <Response key={`${message.id}-txt-${idx}`}>
                {part.value}
              </Response>
            )
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
          <CitationDisplay citations={message.metadata.citations} />
        )}

        {/* Sources using ai-elements */}
        {message.metadata?.sources && message.metadata.sources.length > 0 && (
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
          <Suggestions>
            {message.metadata.suggestions.map((suggestion, i) => (
              <Suggestion 
                key={`${message.id}-sug-${i}`} 
                suggestion={suggestion} 
                onClick={() => console.log('Suggestion clicked:', suggestion)} 
              />
            ))}
          </Suggestions>
        )}

        {/* Message Actions using ai-elements */}
        <Actions className="mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
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
      </MessageContent>
    </Message>
  )
}