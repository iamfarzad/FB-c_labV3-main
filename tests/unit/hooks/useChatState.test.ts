/**
 * useChatState Hook Tests
 * Tests for the chat state management hook
 */

import { renderHook, act } from '@testing-library/react'
import { useChatState } from '@/hooks/use-chat-state'
import { describe, expect, it, jest } from '@jest/globals'
import { createMockMessage } from '../../utils/test-utils'

describe('useChatState', () => {
  it('returns initial state', () => {
    const { result } = renderHook(() => useChatState())

    expect(result.current.messages).toEqual([])
    expect(result.current.isLoading).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('adds a message', () => {
    const { result } = renderHook(() => useChatState())
    const mockMessage = createMockMessage({ content: 'Test message' })

    act(() => {
      result.current.addMessage(mockMessage)
    })

    expect(result.current.messages).toHaveLength(1)
    expect(result.current.messages[0]).toEqual(mockMessage)
  })

  it('removes a message by id', () => {
    const { result } = renderHook(() => useChatState())
    const mockMessage = createMockMessage({ id: 'test-id' })

    act(() => {
      result.current.addMessage(mockMessage)
    })

    expect(result.current.messages).toHaveLength(1)

    act(() => {
      result.current.removeMessage('test-id')
    })

    expect(result.current.messages).toHaveLength(0)
  })

  it('clears all messages', () => {
    const { result } = renderHook(() => useChatState())
    const messages = [
      createMockMessage({ id: '1' }),
      createMockMessage({ id: '2' }),
      createMockMessage({ id: '3' }),
    ]

    act(() => {
      messages.forEach(msg => result.current.addMessage(msg))
    })

    expect(result.current.messages).toHaveLength(3)

    act(() => {
      result.current.clearMessages()
    })

    expect(result.current.messages).toHaveLength(0)
  })

  it('sets loading state', () => {
    const { result } = renderHook(() => useChatState())

    act(() => {
      result.current.setLoading(true)
    })

    expect(result.current.isLoading).toBe(true)

    act(() => {
      result.current.setLoading(false)
    })

    expect(result.current.isLoading).toBe(false)
  })

  it('sets error state', () => {
    const { result } = renderHook(() => useChatState())
    const errorMessage = 'Something went wrong'

    act(() => {
      result.current.setError(errorMessage)
    })

    expect(result.current.error).toBe(errorMessage)

    act(() => {
      result.current.setError(null)
    })

    expect(result.current.error).toBeNull()
  })

  it('updates a message', () => {
    const { result } = renderHook(() => useChatState())
    const originalMessage = createMockMessage({
      id: 'test-id',
      content: 'Original content'
    })

    act(() => {
      result.current.addMessage(originalMessage)
    })

    const updatedMessage = {
      ...originalMessage,
      content: 'Updated content'
    }

    act(() => {
      result.current.updateMessage('test-id', updatedMessage)
    })

    expect(result.current.messages[0].content).toBe('Updated content')
  })

  it('does not update message if id does not exist', () => {
    const { result } = renderHook(() => useChatState())
    const mockMessage = createMockMessage({ id: 'test-id' })

    act(() => {
      result.current.addMessage(mockMessage)
    })

    act(() => {
      result.current.updateMessage('non-existent-id', { content: 'Updated' } as any)
    })

    expect(result.current.messages[0]).toEqual(mockMessage)
  })

  it('maintains message order when adding', () => {
    const { result } = renderHook(() => useChatState())
    const messages = [
      createMockMessage({ id: '1', content: 'First' }),
      createMockMessage({ id: '2', content: 'Second' }),
      createMockMessage({ id: '3', content: 'Third' }),
    ]

    act(() => {
      messages.forEach(msg => result.current.addMessage(msg))
    })

    expect(result.current.messages).toHaveLength(3)
    expect(result.current.messages.map(m => m.content)).toEqual(['First', 'Second', 'Third'])
  })

  it('handles multiple state updates correctly', () => {
    const { result } = renderHook(() => useChatState())

    act(() => {
      result.current.setLoading(true)
      result.current.setError('Test error')
      result.current.addMessage(createMockMessage())
    })

    expect(result.current.isLoading).toBe(true)
    expect(result.current.error).toBe('Test error')
    expect(result.current.messages).toHaveLength(1)
  })
})
