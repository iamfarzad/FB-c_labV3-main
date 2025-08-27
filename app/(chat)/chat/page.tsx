'use client'

import React, { useState, useEffect } from 'react'
import { ChatLayout } from '@/components/chat/layouts/ChatLayout'
import { ChatHeader } from '@/components/chat/layouts/ChatHeader'
import { ChatMessages } from '@/components/chat/layouts/ChatMessages'
import { ChatComposer } from '@/components/chat/layouts/ChatComposer'
import { VoiceOverlay } from '@/components/chat/VoiceOverlay'
import { SuggestedActions } from '@/components/intelligence/SuggestedActions'
import { ConsentOverlay } from '@/components/ui/consent-overlay'
import { TooltipProvider } from '@/components/ui/tooltip'
import { useChat } from '@/hooks/useChat-ui'
import { useConversationalIntelligence } from '@/hooks/useConversationalIntelligence'
import { useStage } from '@/contexts/stage-context'
import { Message } from '@/core/types/chat'

// Import VerticalProcessChain from the correct location
import { VerticalProcessChain } from '@/components/chat/activity/VerticalProcessChain'

export default function ChatPage() {
  const [input, setInput] = useState('')
  const [openVoice, setOpenVoice] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [activityLog, setActivityLog] = useState<Array<{id: string; type: string; title: string; description: string; status: string; timestamp: Date}>>([])
  const [showConsent, setShowConsent] = useState(false)
  const [consentLoading, setConsentLoading] = useState(false)
  const [hasValidConsent, setHasValidConsent] = useState(false)

  // Use dynamic stage tracking
  const {
    stages,
    currentStage,
    nextStage
  } = useStage()

  // Use the clean chat hook
  const { messages, isLoading, send, clear } = useChat({
    mode: 'public',
    onError: (_err) => {
      // Error: Chat error occurred
    },
    onFinish: (_msg) => {
      // Auto-progress stages based on conversation flow
      if (messages.length >= 2 && currentStage?.id === 'GREETING') {
        nextStage() // Move from greeting to name collection
      } else if (messages.length >= 6 && currentStage?.id === 'NAME_COLLECTION') {
        nextStage() // Move to email capture
      } else if (messages.length >= 10 && currentStage?.id === 'EMAIL_CAPTURE') {
        nextStage() // Move to background research
      }
    }
  })

  // Intelligence system
  const {
    isLoading: _contextLoading
  } = useConversationalIntelligence()

  // Initialize session and add demo messages
  useEffect(() => {
    const initSession = async () => {
      // Check for existing consent cookie
      const consentCookie = document.cookie.split(';').find(c => c.trim().startsWith('fbc-consent='))
      if (!consentCookie) {
        setShowConsent(true)
        setHasValidConsent(false)
        return
      }

      let validConsent = false
      try {
        const consentData = JSON.parse(decodeURIComponent(consentCookie.split('=')[1])) as { allow?: boolean; allowedDomains?: string[] }
        if (consentData.allow && consentData.allowedDomains?.length > 0) {
          validConsent = true
          setHasValidConsent(true)
        } else {
          setShowConsent(true)
          setHasValidConsent(false)
          return
        }
      } catch {
        // Invalid consent cookie, show consent overlay
        setShowConsent(true)
        setHasValidConsent(false)
        return
      }

      // Only proceed with session initialization if we have valid consent
      if (!validConsent) {
        return
      }

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
          const data = await response.json() as { sessionId: string }
          setSessionId(data.sessionId)
          localStorage.setItem('intelligence-session-id', data.sessionId)
        }
      } catch {
        // Failed to initialize session
      }
    }

    void initSession()
  }, [])

  const handleSendMessage = async (message: string) => {
    // Block messages until valid consent is given
    if (!hasValidConsent) {
      setShowConsent(true)
      return
    }

    setInput('')

    // Add activity tracking
    const activityId = `activity-${Date.now()}`
    setActivityLog(prev => [...prev, {
      id: activityId,
      type: 'user_message',
      title: 'User Message',
      description: message.slice(0, 50) + (message.length > 50 ? '...' : ''),
      status: 'in_progress',
      timestamp: new Date()
    }])
    
    try {
      await send(message)
      
      // Mark activity as completed
      setActivityLog(prev => prev.map(activity => 
        activity.id === activityId 
          ? { ...activity, status: 'completed' }
          : activity
      ))
    } catch (error) {
      // Mark activity as failed
      setActivityLog(prev => prev.map(activity => 
        activity.id === activityId 
          ? { ...activity, status: 'failed' }
          : activity
      ))
      throw error
    }
  }

  const handleToolAction = (_tool: string, _data?: unknown) => {
    // Tool action executed
    // Handle tool actions here
  }

  const handleSuggestionRun = (_suggestion: unknown) => {
    // Suggestion executed
    // Handle suggestion actions here
  }

  const handleVoiceInput = (transcript: string) => {
    setOpenVoice(false)
    if (transcript.trim()) {
      setInput(transcript)
      void handleSendMessage(transcript)
    }
  }

  const handleConsentSubmit = async (data: { email: string; companyUrl: string }) => {
    setConsentLoading(true)

    try {
      const response = await fetch('/api/consent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: data.email,
          companyUrl: data.companyUrl,
          policyVersion: '1.0'
        })
      })

      if (!response.ok) {
        throw new Error(`Consent submission failed: ${response.status}`)
      }

      const consentResult = await response.json() as { ok: boolean }

      if (consentResult.ok) {
        setHasValidConsent(true)
        setShowConsent(false)

        // Initialize session after successful consent
        const sessionResponse = await fetch('/api/intelligence/session-init', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: data.email,
            name: data.email.split('@')[0],
            companyUrl: data.companyUrl
          })
        })

        if (sessionResponse.ok) {
          const sessionData = await sessionResponse.json() as { sessionId: string }
          setSessionId(sessionData.sessionId)
          localStorage.setItem('intelligence-session-id', sessionData.sessionId)
        }
      } else {
        throw new Error('Consent was not properly recorded')
      }
    } catch {
      // Consent submission failed - re-show consent overlay
      setShowConsent(true)
      setHasValidConsent(false)
    } finally {
      setConsentLoading(false)
    }
  }

  // Convert useChat messages to Message format + add demo messages
  const chatMessages: Message[] = [
    // Demo message showing all ai-elements
    {
      id: 'demo-analysis',
      role: 'assistant',
      content: 'I\'ve completed a comprehensive business analysis for your AI automation initiative. Here are the key findings and recommendations:',
      createdAt: new Date(Date.now() - 60000),
      businessContent: {
        type: 'business_analysis',
        htmlContent: '<div>Business Analysis Complete</div>',
        context: {
          industry: 'Technology',
          companySize: 'Mid-market',
          stage: 'Implementation'
        }
      },
      sources: [
        { url: 'https://example.com/ai-trends', title: 'AI Industry Trends 2024' },
        { url: 'https://example.com/automation-roi', title: 'Automation ROI Study' }
      ]
    },
    {
      id: 'demo-roi',
      role: 'assistant', 
      content: 'Based on your requirements, I\'ve calculated the ROI for your proposed AI automation project:',
      createdAt: new Date(Date.now() - 30000),
      businessContent: {
        type: 'roi_calculator',
        htmlContent: '<div>ROI Calculation</div>'
      }
    },
    {
      id: 'demo-tasks',
      role: 'assistant',
      content: 'I\'ve generated a comprehensive implementation plan with actionable tasks:',
      createdAt: new Date(Date.now() - 15000),
      businessContent: {
        type: 'consultation_planner', 
        htmlContent: '<div>Implementation Plan</div>'
      }
    },
    {
      id: 'demo-proposal',
      role: 'assistant',
      content: 'Here\'s your customized business proposal with interactive suggestions:',
      createdAt: new Date(Date.now() - 5000),
      businessContent: {
        type: 'proposal_generator',
        htmlContent: '<div>Business Proposal</div>'
      }
    },
    ...messages
      .filter((msg): msg is typeof msg & { role: 'user' | 'assistant' } =>
        msg.role === 'user' || msg.role === 'assistant')
      .map(msg => {
        const message: Message = {
          id: msg.id || `msg-${Date.now()}`,
          role: msg.role,
          content: msg.content,
          createdAt: new Date(),
        }

        if (Array.isArray(msg.metadata?.sources)) {
          message.sources = msg.metadata.sources.map((source: { title?: string; url: string }) => ({
            title: source.title || source.url,
            url: source.url
          }))
        }

        return message
      })
  ]

  return (
    <TooltipProvider>
      <ChatLayout
      disabled={false}
      data-testid="chat-interface"
      header={
        <ChatHeader
          sessionId={sessionId}
          onClearMessages={clear}
          showVoiceButton={false}
        />
      }
            composer={
        <ChatComposer
          value={input}
          onChange={setInput}
          onSubmit={(message) => void handleSendMessage(message)}
          onToolAction={handleToolAction}
          isLoading={isLoading}
          sessionId={sessionId}
          onOpenVoice={() => setOpenVoice(true)}
          showVoiceButton={true}
          topSlot={
            <SuggestedActions
              sessionId={sessionId}
              stage={currentStage}
              onRun={(suggestion) => void handleSuggestionRun(suggestion)}
              mode="static"
            />
          }
        />
      }
      overlay={
        <>
          <ConsentOverlay
            isVisible={showConsent}
            onSubmit={(data) => void handleConsentSubmit(data)}
            isLoading={consentLoading}
          />
          <VoiceOverlay
            open={openVoice}
            onCancel={() => setOpenVoice(false)}
            onAccept={handleVoiceInput}
          />
          {/* Floating Vertical Process Chain - Integrated Design */}
          {(stages && stages.length > 0) || (activityLog && activityLog.length > 0) ? (
            <div className="fixed top-1/2 right-6 -translate-y-1/2 w-16 z-50 pointer-events-none max-lg:right-4 max-md:right-3">
              <VerticalProcessChain
                activities={
                  activityLog && activityLog.length > 0
                    ? activityLog.slice(-8).map((activity) => ({
                        id: activity.id,
                        type: activity.type,
                        title: activity.title,
                        description: activity.description,
                        status: activity.status
                      }))
                    : stages?.slice(-8).map((stage) => ({
                        id: stage.id,
                        type: stage.current ? 'in_progress' :
                              stage.done ? 'completed' : 'pending',
                        title: stage.label,
                        description: `Processing ${stage.label}`,
                        status: stage.done ? 'completed' :
                                stage.current ? 'in_progress' : 'pending'
                      })) ?? []
                }
              />
            </div>
          ) : null}
        </>
      }
    >
      <ChatMessages
        messages={chatMessages}
        isLoading={isLoading}
        sessionId={sessionId}
      />
    </ChatLayout>
    </TooltipProvider>
  )
}
