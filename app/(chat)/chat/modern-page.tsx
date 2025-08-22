'use client'

import React, { useState, useEffect } from 'react'
import { ChatLayout } from '@/components/chat/layouts/ChatLayout'
import { ChatHeader } from '@/components/chat/layouts/ChatHeader'
import { ChatMessages } from '@/components/chat/layouts/ChatMessages'
import { ChatComposer } from '@/components/chat/layouts/ChatComposer'
import { VoiceOverlay } from '@/components/chat/VoiceOverlay'
import { SuggestedActions } from '@/components/intelligence/SuggestedActions'
import { useChat } from '@/ui/hooks/useChat'
import { useConversationalIntelligence } from '@/hooks/useConversationalIntelligence'

interface ChatMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp?: Date
  metadata?: {
    sources?: Array<{ url: string; title?: string }>
    citations?: Array<{ uri: string; title?: string }>
    tools?: Array<{ type: string; data: any }>
    suggestions?: string[]
  }
}

export default function ModernChatPage() {
  const [input, setInput] = useState('')
  const [openVoice, setOpenVoice] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [stage, setStage] = useState('GREETING')

  // Use the clean chat hook
  const { messages, isLoading, error, send, clear } = useChat({ 
    mode: 'public',
    onError: (err) => console.error('Chat error:', err),
    onFinish: (msg) => console.log('Message finished:', msg)
  })

  // Intelligence system
  const { 
    context, 
    isLoading: contextLoading, 
    fetchContextFromLocalSession 
  } = useConversationalIntelligence()

  // Initialize session
  useEffect(() => {
    const initSession = async () => {
      try {
        const response = await fetch('/api/intelligence/session-init', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: 'demo@example.com',
            name: 'Demo User',
            companyUrl: ''
          })
        })
        
        if (response.ok) {
          const data = await response.json()
          setSessionId(data.sessionId)
          localStorage.setItem('intelligence-session-id', data.sessionId)
        }
      } catch (error) {
        console.error('Failed to initialize session:', error)
      }
    }

    initSession()
  }, [])

  const handleSendMessage = async (message: string) => {
    setInput('')
    await send(message)
  }

  const handleToolAction = (tool: string, data?: any) => {
    console.log('Tool action:', tool, data)
    // Handle tool actions here
  }

  const handleSuggestionRun = (suggestion: any) => {
    console.log('Suggestion run:', suggestion)
    // Handle suggestion actions here
  }

  const handleVoiceInput = (transcript: string) => {
    setOpenVoice(false)
    if (transcript.trim()) {
      setInput(transcript)
      handleSendMessage(transcript)
    }
  }

  // Convert useChat messages to ChatMessage format
  const chatMessages: ChatMessage[] = messages.map(msg => ({
    id: msg.id || `msg-${Date.now()}`,
    role: msg.role,
    content: msg.content,
    timestamp: new Date(),
    metadata: msg.meta as any
  }))

  return (
    <ChatLayout
      disabled={false}
      header={
        <ChatHeader
          sessionId={sessionId}
          onClearMessages={clear}
          onOpenVoice={() => setOpenVoice(true)}
          rightSlot={
            <SuggestedActions 
              sessionId={sessionId} 
              stage={stage as any} 
              onRun={handleSuggestionRun}
              mode="static"
            />
          }
        />
      }
      composer={
        <ChatComposer
          value={input}
          onChange={setInput}
          onSubmit={handleSendMessage}
          onToolAction={handleToolAction}
          isLoading={isLoading}
          sessionId={sessionId}
        />
      }
      overlay={
        <VoiceOverlay
          open={openVoice}
          onCancel={() => setOpenVoice(false)}
          onAccept={handleVoiceInput}
        />
      }
    >
      <ChatMessages
        messages={chatMessages}
        isLoading={isLoading}
      />
    </ChatLayout>
  )
}