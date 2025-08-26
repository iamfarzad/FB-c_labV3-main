'use client'

import React, { useState, useEffect } from 'react'
import { ChatLayout } from '@/components/chat/layouts/ChatLayout'
import { ChatHeader } from '@/components/chat/layouts/ChatHeader'
import { ChatMessages } from '@/components/chat/layouts/ChatMessages'
import { ChatComposer } from '@/components/chat/layouts/ChatComposer'
import { VoiceOverlay } from '@/components/chat/VoiceOverlay'
import { SuggestedActions } from '@/components/intelligence/SuggestedActions'
import { ConsentOverlay } from '@/components/collab/ConsentOverlay'
import { TooltipProvider } from '@/components/ui/tooltip'
import { useChat } from '@/ui/hooks/useChat'
import { useConversationalIntelligence } from '@/hooks/useConversationalIntelligence'
import { Message } from '@/src/core/types/chat'
import { useCanvas } from '@/components/providers/canvas-provider'

// Import existing components for activity tracking
import { ProgressTracker } from '@/components/experience/progress-tracker'
import { ChatSidebar } from '@/components/chat/layouts/ChatSidebar'

export default function ChatPage() {
  const [input, setInput] = useState('')
  const [openVoice, setOpenVoice] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [stage, setStage] = useState('GREETING')
  const [activityLog, setActivityLog] = useState<any[]>([])
  const [stageProgress, setStageProgress] = useState(0)
  const [consentState, setConsentState] = useState<{
    checked: boolean
    hasConsent: boolean
    email: string
    company: string
  }>({
    checked: false,
    hasConsent: false,
    email: '',
    company: ''
  })
  const { openCanvas } = useCanvas()

  // Stage progression configuration - using new standardized stages
  const stages = [
    { id: 'GREETING', label: 'Discovery & Setup', done: false, current: true },
    { id: 'NAME_COLLECTION', label: 'Identity', done: false, current: false },
    { id: 'EMAIL_CAPTURE', label: 'Consent & Context', done: false, current: false },
    { id: 'BACKGROUND_RESEARCH', label: 'Research', done: false, current: false },
    { id: 'PROBLEM_DISCOVERY', label: 'Requirements', done: false, current: false },
    { id: 'SOLUTION_PRESENTATION', label: 'Solution', done: false, current: false },
    { id: 'CALL_TO_ACTION', label: 'Next Step', done: false, current: false }
  ]

  // Use the clean chat hook
  const { messages, isLoading, error, send, clear } = useChat({ 
    mode: 'public',
            onError: (err) => { /* Chat error occurred */ },
        onFinish: (msg) => { /* Message finished */ }
  })

  // Intelligence system
  const { 
    context, 
    isLoading: contextLoading, 
    fetchContextFromLocalSession 
  } = useConversationalIntelligence()

  // Check consent status on mount
  useEffect(() => {
    const checkConsent = async () => {
      try {
        const response = await fetch('/api/consent', {
          method: 'GET',
          credentials: 'include'
        })

        if (response.ok) {
          const data = await response.json()
          setConsentState(prev => ({
            ...prev,
            checked: true,
            hasConsent: data.allow || false
          }))

          // If consent exists, initialize session normally
          if (data.allow) {
            initSession()
          }
        } else {
          setConsentState(prev => ({ ...prev, checked: true, hasConsent: false }))
        }
      } catch (error) {
        console.warn('Consent check failed:', error)
        setConsentState(prev => ({ ...prev, checked: true, hasConsent: false }))
      }
    }

    checkConsent()
  }, [])

  // Initialize session (only after consent)
  const initSession = async () => {
    try {
      const response = await fetch('/api/intelligence/session-init', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: consentState.email || 'demo@example.com',
          name: 'Demo User',
          companyUrl: consentState.company || ''
        })
      })

      if (response.ok) {
        const data = await response.json()
        setSessionId(data.sessionId)
        localStorage.setItem('intelligence-session-id', data.sessionId)
      }
    } catch (error) {
      // Failed to initialize session
    }
  }

  const handleSendMessage = async (message: string) => {
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

  const handleToolAction = (tool: string, data?: any) => {
    console.log('Tool action:', tool, data)
    
    switch (tool) {
      case 'webcam':
        // Open webcam canvas
        openCanvas('webcam')
        break
        
      case 'screen':
        // Open screen share canvas
        openCanvas('screen')
        break
        
      case 'document':
        // Handle document upload
        console.log('Document upload requested')
        break
        
      case 'image':
        // Handle image upload
        console.log('Image upload requested')
        break
        
      case 'roi':
        // Handle ROI calculator
        console.log('ROI calculator requested')
        break
        
      case 'video':
        // Handle video to app (still coming soon)
        console.log('Video to app requested (coming soon)')
        break
        
      default:
        console.log('Unknown tool:', tool)
    }
  }

  const handleSuggestionRun = (suggestion: any) => {
            // Suggestion executed
    // Handle suggestion actions here
  }

  const handleVoiceInput = (transcript: string) => {
    setOpenVoice(false)
    if (transcript.trim()) {
      setInput(transcript)
      handleSendMessage(transcript)
    }
  }

  // Consent overlay handlers
  const handleConsentAllow = async () => {
    try {
      const response = await fetch('/api/consent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          email: consentState.email,
          companyUrl: consentState.company,
          allow: true
        })
      })

      if (response.ok) {
        setConsentState(prev => ({ ...prev, hasConsent: true }))
        // Now initialize session with user data
        initSession()
        // Progress to next stage
        setStage('NAME_COLLECTION')
      }
    } catch (error) {
      console.error('Consent submission failed:', error)
    }
  }

  const handleConsentDeny = () => {
    setConsentState(prev => ({ ...prev, hasConsent: true }))
    // Continue without personalization
    initSession()
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

        if (Array.isArray(msg.meta?.sources)) {
          message.sources = msg.meta.sources.map((source: any) => ({
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
      header={
        <ChatHeader
          sessionId={sessionId}
          onClearMessages={clear}
          showVoiceButton={false}
          rightSlot={<ProgressTracker />}
        />
      }
      sidebar={
        <ChatSidebar
          sessionId={sessionId}
          activityLog={activityLog}
          stages={stages}
          currentStage={stage}
          stageProgress={stageProgress}
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
          onOpenVoice={() => setOpenVoice(true)}
          showVoiceButton={true}
          topSlot={
            <SuggestedActions
              sessionId={sessionId}
              stage={stage as any}
              onRun={handleSuggestionRun}
              mode="static"
            />
          }
        />
      }
      overlay={
        <>
          <VoiceOverlay
            open={openVoice}
            onCancel={() => setOpenVoice(false)}
            onAccept={handleVoiceInput}
          />
          {/* Consent Overlay */}
          <ConsentOverlay
            open={consentState.checked && !consentState.hasConsent}
            email={consentState.email}
            company={consentState.company}
            onEmailChange={(email) => setConsentState(prev => ({ ...prev, email }))}
            onCompanyChange={(company) => setConsentState(prev => ({ ...prev, company }))}
            onAllow={handleConsentAllow}
            onDeny={handleConsentDeny}
          />

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
