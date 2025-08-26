/**
 * Test Utilities and Helpers
 * Shared utilities for testing React components and Next.js pages
 */

import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { ThemeProvider } from 'next-themes'

// Mock Next.js router
const mockRouter = {
  push: jest.fn(),
  replace: jest.fn(),
  prefetch: jest.fn(),
  back: jest.fn(),
  forward: jest.fn(),
  refresh: jest.fn(),
  pathname: '/',
  query: {},
  asPath: '/',
}

// Custom render function that includes providers
const AllTheProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      {children}
    </ThemeProvider>
  )
}

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => render(ui, { wrapper: AllTheProviders, ...options })

// Custom render for pages that need router context
const renderWithRouter = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => {
  const RouterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return <div data-router-path="/">{children}</div>
  }

  return render(ui, {
    wrapper: ({ children }) => (
      <AllTheProviders>
        <RouterProvider>{children}</RouterProvider>
      </AllTheProviders>
    ),
    ...options
  })
}

// Mock data generators
export const createMockMessage = (overrides = {}) => ({
  id: 'mock-message-id',
  role: 'user' as const,
  content: 'Test message content',
  createdAt: new Date(),
  ...overrides,
})

export const createMockUser = (overrides = {}) => ({
  id: 'mock-user-id',
  name: 'Test User',
  email: 'test@example.com',
  avatar: '/placeholder.svg',
  ...overrides,
})

export const createMockConversation = (overrides = {}) => ({
  id: 'mock-conversation-id',
  title: 'Test Conversation',
  messages: [createMockMessage()],
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
})

// Test helpers for common patterns
export const waitForNextTick = () => new Promise(resolve => setTimeout(resolve, 0))

export const createMockEvent = (type: string, data: any = {}) => ({
  type,
  data,
  preventDefault: jest.fn(),
  stopPropagation: jest.fn(),
})

export const createMockFormEvent = (formData: Record<string, string>) => {
  const form = new FormData()
  Object.entries(formData).forEach(([key, value]) => {
    form.append(key, value)
  })

  return {
    preventDefault: jest.fn(),
    target: { elements: form },
  }
}

// Accessibility testing helpers
export const checkAccessibility = (container: HTMLElement) => {
  // Check for common accessibility issues
  const images = container.querySelectorAll('img')
  images.forEach(img => {
    expect(img).toHaveAttribute('alt')
  })

  const buttons = container.querySelectorAll('button')
  buttons.forEach(button => {
    expect(button).toHaveAttribute('aria-label', 'type')
  })
}

// Performance testing helpers
export const measureRenderTime = async (component: ReactElement) => {
  const start = performance.now()
  customRender(component)
  const end = performance.now()
  return end - start
}

// Mock API response helpers
export const mockApiResponse = (data: any, status = 200) => ({
  ok: status >= 200 && status < 300,
  status,
  json: () => Promise.resolve(data),
  text: () => Promise.resolve(JSON.stringify(data)),
})

// Local storage helpers for testing
export const mockLocalStorage = () => {
  const store: Record<string, string> = {}

  Object.defineProperty(window, 'localStorage', {
    value: {
      getItem: (key: string) => store[key] || null,
      setItem: (key: string, value: string) => {
        store[key] = value.toString()
      },
      removeItem: (key: string) => {
        delete store[key]
      },
      clear: () => {
        Object.keys(store).forEach(key => delete store[key])
      },
    },
    writable: true,
  })
}

// Export everything
export * from '@testing-library/react'
export { customRender as render, renderWithRouter, mockRouter }
