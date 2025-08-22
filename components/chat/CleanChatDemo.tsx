'use client'

import { useState } from 'react'
import { useChat } from '@/ui/hooks/useChat'
import { Button } from '@/components/ui/primitives/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export function CleanChatDemo() {
  const [mode, setMode] = useState<'public' | 'admin'>('public')
  const [input, setInput] = useState('')
  
  const { messages, isLoading, error, send, clear } = useChat({ 
    mode,
    onError: (err) => console.error('Chat error:', err),
    onFinish: (msg) => console.log('Message finished:', msg)
  })

  const handleSend = async () => {
    if (!input.trim()) return
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
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Clean Chat Demo
          <div className="flex gap-2">
            <Badge 
              variant={mode === 'public' ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => setMode('public')}
            >
              Public
            </Badge>
            <Badge 
              variant={mode === 'admin' ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => setMode('admin')}
            >
              Admin
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Messages */}
        <div className="h-64 overflow-y-auto border rounded-lg p-4 space-y-2">
          {messages.length === 0 ? (
            <p className="text-muted-foreground text-center">No messages yet. Start a conversation!</p>
          ) : (
            messages.map((message) => (
              <div 
                key={message.id} 
                className={`p-2 rounded-lg ${
                  message.role === 'user' 
                    ? 'bg-primary text-primary-foreground ml-8' 
                    : 'bg-muted mr-8'
                }`}
              >
                <div className="text-xs opacity-70 mb-1">{message.role}</div>
                <div>{message.content}</div>
              </div>
            ))
          )}
          {isLoading && (
            <div className="bg-muted p-2 rounded-lg mr-8">
              <div className="text-xs opacity-70 mb-1">assistant</div>
              <div className="flex items-center gap-2">
                <div className="animate-pulse">Thinking...</div>
              </div>
            </div>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="p-2 bg-destructive/10 text-destructive rounded-lg text-sm">
            Error: {error.message}
          </div>
        )}

        {/* Input */}
        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Send a ${mode} message...`}
            className="flex-1"
            rows={2}
          />
          <div className="flex flex-col gap-2">
            <Button onClick={handleSend} disabled={isLoading || !input.trim()}>
              Send
            </Button>
            <Button variant="outline" onClick={clear} size="sm">
              Clear
            </Button>
          </div>
        </div>

        {/* Info */}
        <div className="text-xs text-muted-foreground">
          Using {mode} mode • Endpoint: /api/{mode === 'admin' ? 'admin/' : ''}chat-v2
        </div>
      </CardContent>
    </Card>
  )
}