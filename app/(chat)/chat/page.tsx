"use client"

import { DemoSessionProvider } from "@/components/demo-session-manager"
import { PageShell } from "@/components/page-shell"
import { UnifiedChatInterface } from "@/components/chat/unified/UnifiedChatInterface"
import { useState, useEffect, useMemo, useRef } from "react"
import type { UnifiedMessage } from "@/components/chat/unified/UnifiedChatInterface"
import { useConversationalIntelligence } from "@/hooks/useConversationalIntelligence"
import { ErrorHandler } from "@/components/chat/ErrorHandler"
import VoiceOverlay from "@/components/chat/VoiceOverlay"
// Legacy LeadProgressIndicator removed - using new intelligence system
import SuggestedActions from "@/components/intelligence/SuggestedActions"
// Legacy ConversationStage removed - using new intelligence system
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { ErrorBoundary } from "@/components/error-boundary"
// Removed unused AiActivityMonitor import
import { MobileStageProgress } from "@/components/collab/MobileStageProgress"

// Chat Error Fallback Component
function ChatErrorFallback({ error, resetError }: { error: Error; resetError: () => void }) {
  if (!error) return null

  return (
    <div className="mx-auto max-w-3xl p-4">
      <div className="rounded-lg border bg-card p-6">
        <p className="font-medium mb-2">Something went wrong in the chat.</p>
        <p className="text-sm text-muted-foreground mb-4">{error.message}</p>
        <div className="flex gap-2">
          <Button variant="outline" onClick={resetError}>Retry</Button>
        </div>
      </div>
    </div>
  )
}

// Finish & Email Button Component
function FinishAndEmailButton({ sessionId }: { sessionId: string | null }) {
  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState('contact@farzadbayat.com')
  const [isSending, setIsSending] = useState(false)
  
  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="border-accent/30 hover:border-accent hover:bg-accent/10"
        onClick={() => setOpen(true)}
      >
        Finish & Email
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Send summary via email</DialogTitle>
            <DialogDescription>We'll generate the PDF and email it to the recipient.</DialogDescription>
          </DialogHeader>
          <form
            onSubmit={async (e) => {
              e.preventDefault()
              const toEmail = email.trim()
              if (!toEmail) return
              setIsSending(true)
              try {
                const gen = await fetch('/api/export-summary', { 
                  method: 'POST', 
                  headers: { 'Content-Type': 'application/json' }, 
                  body: JSON.stringify({ sessionId }) 
                })
                if (!gen.ok) throw new Error(`export failed: ${gen.status}`)
                const res = await fetch('/api/send-pdf-summary', { 
                  method: 'POST', 
                  headers: { 'Content-Type': 'application/json' }, 
                  body: JSON.stringify({ sessionId, toEmail }) 
                })
                if (!res.ok) throw new Error(`send failed: ${res.status}`)
                setOpen(false)
              } catch (e: any) {
                console.error('Email error:', e?.message || 'unknown')
              } finally {
                setIsSending(false)
              }
            }}
            className="space-y-3"
          >
            <div className="space-y-1">
              <Label htmlFor="finish-email">Recipient email</Label>
              <Input 
                id="finish-email" 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                placeholder="name@example.com" 
                required 
              />
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <Button 
                type="button" 
                variant="outline"
                onClick={() => setOpen(false)} 
                disabled={isSending}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSending}
                className="bg-accent hover:bg-accent/90 text-accent-foreground"
              >
                {isSending ? 'Sending…' : 'Send'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default function ChatPage() {
  const [messages, setMessages] = useState<UnifiedMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [error, setError] = useState<Error | null>(null)
  const [openVoice, setOpenVoice] = useState(false)
  const [input, setInput] = useState("")
  const [stage, setStage] = useState<string>('GREETING')
  const [lead, setLead] = useState<{ name?: string; email?: string; company?: string } | undefined>()
  
  // AI Activity State
  const [aiActivity, setAiActivity] = useState<string>('default')
  const [stageProgress, setStageProgress] = useState(1)
  const [activityLog, setActivityLog] = useState<Array<{
    id: string
    type: string
    label: string
    timestamp: string
    status: 'pending' | 'completed' | 'error'
  }>>([
    {
      id: 'session-init-test',
      type: 'ai_thinking',
      label: 'Initializing intelligence session',
      timestamp: new Date().toISOString(),
      status: 'completed'
    },
    {
      id: 'research-test',
      type: 'google_search',
      label: 'Researching company information',
      timestamp: new Date().toISOString(),
      status: 'completed'
    }
  ])
  
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
  
  // Consent Management
  const [consentChecked, setConsentChecked] = useState(false)
  const [consentAllowed, setConsentAllowed] = useState(false)
  const [consentDenied, setConsentDenied] = useState(false)
  const [consentEmail, setConsentEmail] = useState('')
  const [consentCompany, setConsentCompany] = useState('')
  
  // Prevent duplicate fetches
  const fetchedOnceRef = useRef(false)

  // Add sample activity log for testing
  const addActivity = (type: string, label: string, status: 'pending' | 'completed' | 'error' | 'in_progress' = 'completed') => {
    setActivityLog(prev => [...prev, {
      id: `${type}-${Date.now()}`,
      type,
      label,
      timestamp: new Date().toISOString(),
      status: status === 'in_progress' ? 'completed' : status // Convert in_progress to completed for storage
    }])
  }

  // Conversational Intelligence
  const {
    context,
    isLoading: isContextLoading,
    error: contextError,
    fetchContextFromLocalSession,
    clearContextCache,
    generatePersonalizedGreeting
  } = useConversationalIntelligence()

  const leadContextData = useMemo(() => {
    if (!context) return undefined
    return {
      name: context?.person?.fullName || context?.lead?.name,
      email: context?.lead?.email,
      company: context?.company?.name,
      role: context?.role,
      industry: context?.company?.industry,
    }
  }, [context])

  const currentStages = useMemo(() => {
    const currentIndex = stages.findIndex(s => s.id === stage)
    return stages.map((s, i) => ({
      ...s,
      done: i < currentIndex,
      current: i === currentIndex
    }))
  }, [stage])

  // Message persistence (by sessionId)
  const STORAGE_PREFIX = 'fbc:chat:messages:'
  const STORAGE_VERSION = 'v1'
  const storageKey = (sid: string) => `${STORAGE_PREFIX}${sid}:${STORAGE_VERSION}`

  // Hydrate messages when session is available
  useEffect(() => {
    if (!sessionId) return
    try {
      const raw = localStorage.getItem(storageKey(sessionId))
      if (!raw) return
      const parsed = JSON.parse(raw) as UnifiedMessage[]
      // revive timestamps
      const revived = parsed.map(m => ({
        ...m,
        metadata: m.metadata ? { ...m.metadata, timestamp: m.metadata.timestamp ? new Date(m.metadata.timestamp as any) : undefined } : undefined
      }))
      setMessages(revived)
    } catch {}
  }, [sessionId])

  // Persist messages on change
  useEffect(() => {
    if (!sessionId) return
    try {
      const serializable = messages.map(m => ({
        ...m,
        metadata: m.metadata ? { ...m.metadata, timestamp: m.metadata.timestamp ? new Date(m.metadata.timestamp as any).toISOString() : undefined } : undefined
      }))
      localStorage.setItem(storageKey(sessionId), JSON.stringify(serializable))
    } catch {}
  }, [messages, sessionId])

  useEffect(() => {
    // Initialize session from localStorage
    const storedSessionId = localStorage.getItem('intelligence-session-id')
    if (storedSessionId) {
      setSessionId(storedSessionId)
    }
  }, [])

  // Check consent on mount
  useEffect(() => {
    ;(async () => {
      try {
        const res = await fetch('/api/consent', { cache: 'no-store' })
        if (res.ok) {
          const j = await res.json()
          if (j.allow) {
            setConsentAllowed(true)
            const existingSessionId = window.localStorage.getItem('intelligence-session-id')
            if (existingSessionId) {
              console.info('🔄 Restoring existing session:', existingSessionId)
              setSessionId(existingSessionId)
            }
          }
        }
      } catch {}
      setConsentChecked(true)
    })()
  }, [])

  // Fetch intelligence context when consent is allowed (one-shot)
  useEffect(() => {
    if (consentAllowed && !fetchedOnceRef.current) {
      fetchedOnceRef.current = true
      fetchContextFromLocalSession()
    }
  }, [consentAllowed, fetchContextFromLocalSession])

  async function handleAllowConsent() {
    try {
      const res = await fetch('/api/consent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: consentEmail, companyUrl: consentCompany, policyVersion: 'v1' }),
      })
      if (!res.ok) throw new Error('consent failed')
      
      const sessionInitRes = await fetch('/api/intelligence/session-init', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          sessionId: sessionId || undefined,
          email: consentEmail, 
          name: consentEmail.split('@')[0],
          companyUrl: consentCompany 
        }),
      })
      
      if (sessionInitRes.ok) {
        const sessionData = await sessionInitRes.json()
        if (sessionData.sessionId) {
          localStorage.setItem('intelligence-session-id', sessionData.sessionId)
          setSessionId(sessionData.sessionId)
          clearContextCache()
          await fetchContextFromLocalSession({ force: true })
        }
      }
      
      setConsentAllowed(true)
      setConsentDenied(false)
    } catch (error) {
      console.error('Consent or session init failed:', error)
      alert('Unable to record consent. Please check your email/company and try again.')
    }
  }

  function handleDenyConsent() {
    setConsentDenied(true)
    setConsentAllowed(false)
  }

  async function handleStartDemo() {
    try {
      const res = await fetch('/api/intelligence/session-init-demo', {
        method: 'POST',
      });
      if (!res.ok) throw new Error('demo session init failed');
      
      const data = await res.json();
      if (data.sessionId) {
        localStorage.setItem('intelligence-session-id', data.sessionId);
        setSessionId(data.sessionId);
        setConsentAllowed(true);
        setConsentDenied(false);
        clearContextCache();
        await fetchContextFromLocalSession({ force: true });
      }
    } catch (error) {
      console.error('Demo session init failed:', error);
      alert('Unable to start demo session. Please try again.');
    }
  }

  const handleSendMessage = async (message: string) => {
    // Add user message
    const userMessage: UnifiedMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: message,
      metadata: {
        timestamp: new Date()
      }
    }
    
    setMessages(prev => [...prev, userMessage])
    setIsLoading(true)
    setError(null)

    // Add AI thinking activity
    addActivity('ai_thinking', 'AI is processing your message', 'pending')

    try {
      // Send to API with lead context
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          sessionId,
          enableLeadGeneration: true,
          leadContext: leadContextData
        })
      })

      if (!response.ok) throw new Error('Chat request failed')

      // Handle SSE stream response
      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      
      if (!reader) {
        throw new Error('No reader available')
      }

      // Create assistant message placeholder
      const assistantMessage: UnifiedMessage = {
        id: `msg-${Date.now()}-ai`,
        role: 'assistant',
        content: '',
        metadata: {
          timestamp: new Date()
        }
      }
      
      setMessages(prev => [...prev, assistantMessage])

      let assistantContent = ''
      let assistantSources: Array<{ title?: string; url: string }> | undefined

      while (true) {
        const { done, value } = await reader.read()
        
        if (done) break
        
        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split('\n')
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6))
              
              if (data.content) {
                assistantContent += data.content
                setMessages(prev => prev.map(msg => 
                  msg.id === assistantMessage.id 
                    ? { ...msg, content: assistantContent }
                    : msg
                ))
              }
              
              // Update stage if provided
              if (data.conversationStage) {
                const newStage = data.conversationStage as string
                setStage(newStage)
                
                // Update stage progress
                const stageIndex = stages.findIndex(s => s.id === newStage)
                if (stageIndex !== -1) {
                  setStageProgress(stageIndex + 1)
                  setAiActivity('default') // Reset AI activity when stage changes
                }
              }
              
              // Update lead data if provided
              if (data.leadData) {
                setLead(data.leadData)
              }
              
              // Handle intelligence suggestions
              if (data.suggestions && Array.isArray(data.suggestions)) {
                console.log('🎯 Intelligence suggestions received:', data.suggestions)
                // Trigger suggestions refresh
                window.dispatchEvent(new CustomEvent('chat-capability-used'))
              }
              
              // Detect AI activity based on content
              if (data.content) {
                const content = data.content.toLowerCase()
                if (content.includes('researching') || content.includes('searching')) {
                  setAiActivity('searching_web')
                  addActivity('google_search', 'Searching for information', 'pending')
                } else if (content.includes('calculating') || content.includes('roi')) {
                  setAiActivity('calculating_roi')
                  addActivity('roi_calculation', 'Calculating ROI', 'pending')
                } else if (content.includes('analyzing') || content.includes('document')) {
                  setAiActivity('analyzing_document')
                  addActivity('doc_analysis', 'Analyzing document', 'pending')
                } else if (content.includes('generating') || content.includes('code')) {
                  setAiActivity('generating_code')
                  addActivity('generate', 'Generating code', 'pending')
                } else {
                  setAiActivity('default')
                }
              }
              
              // Handle sources
              if (data.sources && Array.isArray(data.sources)) {
                assistantSources = data.sources
                setMessages(prev => prev.map(msg => 
                  msg.id === assistantMessage.id 
                    ? { ...msg, metadata: { ...msg.metadata, sources: assistantSources } }
                    : msg
                ))
              }
              
              if (data.error) {
                throw new Error(data.error)
              }
            } catch (parseError) {
              console.warn('Failed to parse streaming data:', parseError)
            }
          }
        }
      }
    } catch (err) {
      console.error('Chat error:', err)
      setError(err as Error)
      // Mark AI thinking as failed
      addActivity('ai_thinking', 'AI processing failed', 'error')
    } finally {
      setIsLoading(false)
      // Mark AI thinking as completed
      addActivity('ai_thinking', 'AI response completed', 'completed')
    }
  }

  const handleClearMessages = () => {
    setMessages([])
    setError(null)
    try {
      if (sessionId) localStorage.removeItem(storageKey(sessionId))
    } catch {}
  }

  const handleToolAction = async (tool: string, data?: any) => {
    console.log('Tool action:', tool, data)
    
    if (tool === 'roi:complete') {
      const toolMessage: UnifiedMessage = {
        id: `msg-${Date.now()}-roi`,
        role: 'assistant',
        type: 'tool',
        content: 'ROI analysis complete. Here is your summary:',
        metadata: {
          timestamp: new Date(),
          tools: [{ type: 'roiResult', data }]
        }
      }
      setMessages(prev => [...prev, toolMessage])
    }
    
    // Handle task generation
    if (tool === 'generate-tasks') {
      try {
        const response = await fetch('/api/tools/task-generator', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: data?.prompt || 'Create a task list',
            context: data?.context || ''
          })
        })
        
        if (!response.ok) throw new Error('Task generation failed')
        
        const result = await response.json()
        
        const taskMessage: UnifiedMessage = {
          id: `msg-${Date.now()}-task`,
          role: 'assistant',
          type: 'tool',
          content: 'I\'ve created a task list for you:',
          metadata: {
            timestamp: new Date(),
            tools: [{ type: 'taskResult', data: result.output }]
          }
        }
        setMessages(prev => [...prev, taskMessage])
      } catch (error) {
        console.error('Task generation error:', error)
      }
    }
    
    // Handle web preview
    if (tool === 'web-preview') {
      try {
        const response = await fetch('/api/tools/web-preview', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: data?.url })
        })
        
        if (!response.ok) throw new Error('Web preview failed')
        
        const result = await response.json()
        
        const previewMessage: UnifiedMessage = {
          id: `msg-${Date.now()}-preview`,
          role: 'assistant',
          type: 'tool',
          content: `Here's a preview of ${data?.url}:`,
          metadata: {
            timestamp: new Date(),
            tools: [{ type: 'webPreview', data: result.output }]
          }
        }
        setMessages(prev => [...prev, previewMessage])
      } catch (error) {
        console.error('Web preview error:', error)
      }
    }
  }

  const handleSuggestionRun = (suggestion: { id?: string; capability?: string; label: string }) => {
    console.log('Suggestion run:', suggestion)
    // Handle suggestion actions
    if (suggestion.capability === 'voice') {
      setOpenVoice(true)
    }
  }

  // Add personalized greeting message when context is loaded
  useEffect(() => {
    if (context && messages.length === 0 && !isLoading && consentAllowed) {
      const greetingMessage: UnifiedMessage = {
        id: `msg-greeting-${Date.now()}`,
        role: 'assistant',
        content: generatePersonalizedGreeting(context),
        metadata: {
          timestamp: new Date()
        }
      }
      setMessages([greetingMessage])
    }
  }, [context, messages.length, isLoading, consentAllowed, generatePersonalizedGreeting])

  return (
    <DemoSessionProvider>
      <PageShell variant="fullscreen">
        <div className="h-[100dvh] relative">
          {/* Consent Dialog */}
          {consentChecked && !consentAllowed && !consentDenied && (
            <div className="absolute inset-0 z-50 bg-background/95 grid place-items-center p-4">
              <div className="w-full max-w-lg rounded-xl border border-border bg-background p-6 shadow-xl">
                <h2 className="text-lg font-semibold text-foreground">
                  Personalize this chat using your public company info?
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  We'll fetch from your company site and LinkedIn to ground results with citations. 
                  See our <a href="/privacy" className="underline text-accent">Privacy & Terms</a>.
                </p>
                <div className="mt-4 grid grid-cols-1 gap-3">
                  <Input
                    type="email"
                    placeholder="Work email (name@company.com)"
                    value={consentEmail}
                    onChange={(e) => setConsentEmail(e.target.value)}
                    className="bg-card border-border text-foreground"
                  />
                  <Input
                    type="text"
                    placeholder="Company website (optional)"
                    value={consentCompany}
                    onChange={(e) => setConsentCompany(e.target.value)}
                    className="bg-card border-border text-foreground"
                  />
                </div>
                <div className="mt-6 flex items-center justify-end gap-3">
                  <Button 
                    variant="outline" 
                    onClick={handleDenyConsent}
                    className="border-border"
                  >
                    No thanks
                  </Button>
                  <Button 
                    variant="ghost" 
                    onClick={handleStartDemo}
                  >
                    Start Demo
                  </Button>
                  <Button 
                    onClick={handleAllowConsent}
                    className="bg-accent hover:bg-accent/90 text-accent-foreground"
                  >
                    Allow
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Consent Denied Message */}
          {consentDenied && (
            <div className="absolute inset-0 z-50 bg-background/95 grid place-items-center p-4">
              <div className="w-full max-w-md rounded-xl border border-border bg-background p-6 text-center">
                <h2 className="text-lg font-semibold text-foreground">
                  Consent is required to continue
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  We use public company info with citations to personalize results. 
                  Review our <a href="/privacy" className="underline text-accent">policy</a> and start again anytime.
                </p>
              </div>
            </div>
          )}


          {/* Main Chat Interface */}
          <ErrorBoundary fallback={ChatErrorFallback}>
            <UnifiedChatInterface
            messages={messages}
            isLoading={isLoading}
            sessionId={sessionId}
            context={context}
            onSendMessage={handleSendMessage}
            onClearMessages={handleClearMessages}
            onToolAction={handleToolAction}
            className={!consentAllowed ? "pointer-events-none opacity-50" : ""}
            stickyHeaderSlot={<MobileStageProgress stages={currentStages} />}
            activityLog={activityLog}
            stages={currentStages}
            currentStage={stage}
            stageProgress={stageProgress}

            composerTopSlot={
              <div className="flex items-center justify-end gap-2 w-full">
                <SuggestedActions
                  sessionId={sessionId}
                  stage={stage as any}
                  onRun={handleSuggestionRun}
                  mode="static"
                />
              </div>
            }
          />
          </ErrorBoundary>

          {/* Voice Overlay */}
          <VoiceOverlay
            open={openVoice}
            sessionId={sessionId}
            onCancel={() => setOpenVoice(false)}
            onAccept={(text: string) => {
              setOpenVoice(false)
              if (text && text.trim()) {
                setInput(text)
                handleSendMessage(text)
              }
            }}
          />

          {/* Error Handler */}
          {error && (
            <div className="fixed inset-0 z-[60] grid place-items-center bg-background/70 backdrop-blur-sm p-4">
              <div className="max-w-md w-full">
                <ErrorHandler 
                  error={error} 
                  onRetry={() => setError(null)} 
                  onReset={() => {
                    setError(null)
                    handleClearMessages()
                  }} 
                  context="chat" 
                />
              </div>
            </div>
          )}

          {/* Lead Progress Indicator - Removed legacy component */}

          {/* Suggested Actions moved into sticky header of message list via stickyHeaderSlot */}

          {/* Finish & Email Button stays floating; if you want it sticky too, move it into stickyHeaderSlot */}
        </div>
      </PageShell>
    </DemoSessionProvider>
  )
}
