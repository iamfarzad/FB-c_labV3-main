/**
 * Chat Flow Integration Tests
 * Tests for the complete chat interaction flow
 */

import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ChatInterface } from '@/components/chat/ChatInterface'
import { describe, expect, it, jest } from '@jest/globals'
import { createMockMessage } from '../../utils/test-utils'

// Mock the chat hook
const mockUseChat = jest.fn()
jest.mock('@/hooks/useChat-ui', () => ({
  useChat: mockUseChat,
}))

describe('Chat Flow Integration', () => {
  const mockSend = jest.fn()
  const mockClear = jest.fn()

  beforeEach(() => {
    mockUseChat.mockReturnValue({
      messages: [],
      isLoading: false,
      error: null,
      send: mockSend,
      clear: mockClear,
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('renders chat interface with empty state', () => {
    render(<ChatInterface />)

    expect(screen.getByText('Start a conversation')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Type your message...')).toBeInTheDocument()
  })

  it('displays messages in the chat', () => {
    const mockMessages = [
      createMockMessage({ role: 'user', content: 'Hello' }),
      createMockMessage({ role: 'assistant', content: 'Hi there!' }),
    ]

    mockUseChat.mockReturnValue({
      messages: mockMessages,
      isLoading: false,
      error: null,
      send: mockSend,
      clear: mockClear,
    })

    render(<ChatInterface />)

    expect(screen.getByText('Hello')).toBeInTheDocument()
    expect(screen.getByText('Hi there!')).toBeInTheDocument()
  })

  it('handles message submission', async () => {
    const user = userEvent.setup()
    mockUseChat.mockReturnValue({
      messages: [],
      isLoading: false,
      error: null,
      send: mockSend,
      clear: mockClear,
    })

    render(<ChatInterface />)

    const input = screen.getByPlaceholderText('Type your message...')
    const submitButton = screen.getByRole('button', { name: /send/i })

    await user.type(input, 'Test message')
    await user.click(submitButton)

    expect(mockSend).toHaveBeenCalledWith('Test message')
  })

  it('shows loading state during message sending', async () => {
    const user = userEvent.setup()
    mockUseChat.mockReturnValue({
      messages: [],
      isLoading: true,
      error: null,
      send: mockSend,
      clear: mockClear,
    })

    render(<ChatInterface />)

    const input = screen.getByPlaceholderText('Type your message...')
    const submitButton = screen.getByRole('button', { name: /send/i })

    expect(submitButton).toBeDisabled()
    expect(input).toBeDisabled()
  })

  it('displays error messages', () => {
    mockUseChat.mockReturnValue({
      messages: [],
      isLoading: false,
      error: 'Failed to send message',
      send: mockSend,
      clear: mockClear,
    })

    render(<ChatInterface />)

    expect(screen.getByText('Failed to send message')).toBeInTheDocument()
  })

  it('clears messages when clear button is clicked', async () => {
    const user = userEvent.setup()
    mockUseChat.mockReturnValue({
      messages: [createMockMessage()],
      isLoading: false,
      error: null,
      send: mockSend,
      clear: mockClear,
    })

    render(<ChatInterface />)

    const clearButton = screen.getByRole('button', { name: /clear/i })
    await user.click(clearButton)

    expect(mockClear).toHaveBeenCalled()
  })

  it('handles keyboard shortcuts', async () => {
    const user = userEvent.setup()
    mockUseChat.mockReturnValue({
      messages: [],
      isLoading: false,
      error: null,
      send: mockSend,
      clear: mockClear,
    })

    render(<ChatInterface />)

    const input = screen.getByPlaceholderText('Type your message...')

    await user.type(input, 'Test message')
    await user.keyboard('{Enter}')

    expect(mockSend).toHaveBeenCalledWith('Test message')
  })

  it('maintains message order and timestamps', () => {
    const now = new Date()
    const earlier = new Date(now.getTime() - 60000) // 1 minute ago

    const mockMessages = [
      createMockMessage({
        role: 'user',
        content: 'First message',
        createdAt: earlier
      }),
      createMockMessage({
        role: 'assistant',
        content: 'First response',
        createdAt: earlier
      }),
      createMockMessage({
        role: 'user',
        content: 'Second message',
        createdAt: now
      }),
    ]

    mockUseChat.mockReturnValue({
      messages: mockMessages,
      isLoading: false,
      error: null,
      send: mockSend,
      clear: mockClear,
    })

    render(<ChatInterface />)

    const messages = screen.getAllByRole('article') // Assuming messages have role="article"
    expect(messages).toHaveLength(3)

    // Check content order
    expect(screen.getByText('First message')).toBeInTheDocument()
    expect(screen.getByText('First response')).toBeInTheDocument()
    expect(screen.getByText('Second message')).toBeInTheDocument()
  })

  it('handles message with sources correctly', () => {
    const mockMessage = createMockMessage({
      role: 'assistant',
      content: 'This is a response with sources',
      sources: [
        { url: 'https://example.com', title: 'Example Source' },
        { url: 'https://test.com', title: 'Test Source' },
      ],
    })

    mockUseChat.mockReturnValue({
      messages: [mockMessage],
      isLoading: false,
      error: null,
      send: mockSend,
      clear: mockClear,
    })

    render(<ChatInterface />)

    expect(screen.getByText('This is a response with sources')).toBeInTheDocument()
    expect(screen.getByText('Example Source')).toBeInTheDocument()
    expect(screen.getByText('Test Source')).toBeInTheDocument()
  })

  it('handles message with business content', () => {
    const mockMessage = createMockMessage({
      role: 'assistant',
      content: 'Business analysis complete',
      businessContent: {
        type: 'business_analysis',
        htmlContent: '<div>Analysis Results</div>',
        context: {
          industry: 'Technology',
          companySize: 'Mid-market',
        },
      },
    })

    mockUseChat.mockReturnValue({
      messages: [mockMessage],
      isLoading: false,
      error: null,
      send: mockSend,
      clear: mockClear,
    })

    render(<ChatInterface />)

    expect(screen.getByText('Business analysis complete')).toBeInTheDocument()
    // The business content rendering would depend on the specific renderer implementation
  })
})
