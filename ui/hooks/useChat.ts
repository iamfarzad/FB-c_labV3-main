import { useRef, useState, useCallback } from 'react'
import type { ChatMessage } from '@/src/core/types/chat'

interface UseChatOptions {
  mode?: 'public' | 'admin'
  initialMessages?: ChatMessage[]
  onError?: (error: Error) => void
  onFinish?: (message: ChatMessage) => void
}

export function useChat({ 
  mode = 'public', 
  initialMessages = [],
  onError,
  onFinish 
}: UseChatOptions = {}) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  const addMessage = useCallback((message: Omit<ChatMessage, 'id'>) => {
    const newMessage: ChatMessage = {
      ...message,
      id: crypto.randomUUID()
    }
    setMessages(prev => [...prev, newMessage])
    return newMessage
  }, [])

  const updateMessage = useCallback((id: string, updates: Partial<ChatMessage>) => {
    setMessages(prev => 
      prev.map(msg => msg.id === id ? { ...msg, ...updates } : msg)
    )
  }, [])

  const send = useCallback(async (userText: string) => {
    if (!userText.trim() || isLoading) return

    const endpoint = mode === 'admin' ? '/api/admin/chat' : '/api/chat'
    
    // Add user message
    const userMessage = addMessage({ role: 'user', content: userText.trim() })
    
    // Add placeholder assistant message
    const assistantMessage = addMessage({ role: 'assistant', content: '' })

    // Cancel any ongoing request
    abortRef.current?.abort()
    abortRef.current = new AbortController()

    setIsLoading(true)
    setError(null)

    try {
      const body = { 
        version: 1 as const, 
        messages: [...messages, userMessage] 
      }

      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      }

      // Add auth header for admin mode
      if (mode === 'admin') {
        // In production, get this from your auth context/storage
        headers['Authorization'] = 'Bearer admin-token'
      }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers,
        signal: abortRef.current.signal,
        body: JSON.stringify(body)
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(errorData.error || `HTTP ${res.status}`)
      }

      if (!res.body) {
        throw new Error('No response body')
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let accumulatedContent = ''

      while (true) {
        const { value, done } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        
        // Parse SSE frames
        for (const frame of chunk.split('\n\n')) {
          if (!frame.trim()) continue
          
          if (frame.startsWith('data: ')) {
            try {
              const data = JSON.parse(frame.slice(6))
              if (typeof data === 'string') {
                accumulatedContent += data
                updateMessage(assistantMessage.id!, { content: accumulatedContent })
              }
            } catch (e) {
              // Skip malformed JSON
              console.warn('Failed to parse SSE data:', frame)
            }
          } else if (frame.startsWith('event: end')) {
            // Stream completed successfully
            break
          } else if (frame.startsWith('event: error')) {
            const errorData = JSON.parse(frame.split('data: ')[1] || '{}')
            throw new Error(errorData.error || 'Stream error')
          }
        }
      }

      const finalMessage = { 
        ...assistantMessage, 
        content: accumulatedContent 
      }
      
      onFinish?.(finalMessage)

    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error('Failed to send message')
      setError(errorObj)
      onError?.(errorObj)
      
      // Remove the failed assistant message
      setMessages(prev => prev.filter(msg => msg.id !== assistantMessage.id))
      
      console.error('Chat error:', errorObj)
    } finally {
      setIsLoading(false)
      abortRef.current = null
    }
  }, [messages, mode, isLoading, addMessage, updateMessage, onError, onFinish])

  const cancel = useCallback(() => {
    abortRef.current?.abort()
    setIsLoading(false)
  }, [])

  const clear = useCallback(() => {
    setMessages([])
    setError(null)
  }, [])

  return { 
    messages, 
    isLoading, 
    error, 
    send, 
    cancel, 
    clear,
    addMessage,
    updateMessage
  }
}