'use client'

import React, { useState, useEffect } from 'react'
import { ChatLayout } from '@/components/chat/layouts/ChatLayout'
import { ChatHeader } from '@/components/chat/layouts/ChatHeader'
import { ChatMessages } from '@/components/chat/layouts/ChatMessages'
import { ChatComposer } from '@/components/chat/layouts/ChatComposer'
import { ChatSidebar } from '@/components/chat/layouts/ChatSidebar'
import { VoiceOverlay } from '@/components/chat/VoiceOverlay'
import { SuggestedActions } from '@/components/intelligence/SuggestedActions'
import { TooltipProvider } from '@/components/ui/tooltip'
import { useChat } from '@/ui/hooks/useChat'
import { useConversationalIntelligence } from '@/hooks/useConversationalIntelligence'
import { Message } from './types/chat'

export default function ChatPage() {
  const [input, setInput] = useState('')
  const [openVoice, setOpenVoice] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [stage, setStage] = useState('GREETING')
  const [activityLog, setActivityLog] = useState<any[]>([])
  const [stageProgress, setStageProgress] = useState(1)

  // Stage progression configuration
  const stages = [
    { id: 'GREETING', label: 'Initial Greeting', done: false, current: true },
    { id: 'CONTEXT', label: 'Context Gathering', done: false, current: false },
    { id: 'ANALYSIS', label: 'Problem Analysis', done: false, current: false },
    { id: 'SOLUTION', label: 'Solution Design', done: false, current: false },
    { id: 'ROI', label: 'ROI Calculation', done: false, current: false },
    { id: 'IMPLEMENTATION', label: 'Implementation Plan', done: false, current: false },
    { id: 'FOLLOWUP', label: 'Follow-up Setup', done: false, current: false }
  ]

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

  // Initialize session and add demo messages
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
    ...messages.map(msg => ({
      id: msg.id || `msg-${Date.now()}`,
      role: msg.role,
      content: msg.content,
      createdAt: new Date(),
      sources: msg.meta?.sources,
    }))
  ]

  return (
    <TooltipProvider>
      <ChatLayout
      disabled={false}
      header={
        <ChatHeader
          sessionId={sessionId}
          onClearMessages={clear}
          onOpenVoice={() => setOpenVoice(true)}
        />
      }
      sidebar={
        <ChatSidebar
          sessionId={sessionId}
          context={context}
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
        sessionId={sessionId}
      />
    </ChatLayout>
    </TooltipProvider>
  )
}
