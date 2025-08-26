/**
 * Card Component Tests
 * Tests for the Card component variants, sub-components, and accessibility
 */

import { render, screen } from '@testing-library/react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { describe, expect, it } from '@jest/globals'

describe('Card', () => {
  it('renders with default props', () => {
    render(<Card>Card content</Card>)

    const card = screen.getByText('Card content')
    expect(card).toBeInTheDocument()
    expect(card).toHaveClass('rounded-lg', 'border', 'bg-card', 'text-card-foreground')
  })

  it('renders with different variants', () => {
    const { rerender } = render(<Card variant="minimal">Minimal Card</Card>)
    expect(screen.getByText('Minimal Card')).toHaveClass('bg-card/80')

    rerender(<Card variant="glass">Glass Card</Card>)
    expect(screen.getByText('Glass Card')).toHaveClass('bg-card/60', 'backdrop-blur-2xl')

    rerender(<Card variant="elevated">Elevated Card</Card>)
    expect(screen.getByText('Elevated Card')).toHaveClass('shadow-2xl', 'hover:shadow-3xl')
  })

  it('renders with different padding sizes', () => {
    const { rerender } = render(<Card padding="sm">Small padding</Card>)
    expect(screen.getByText('Small padding')).toHaveClass('p-4')

    rerender(<Card padding="default">Default padding</Card>)
    expect(screen.getByText('Default padding')).toHaveClass('p-6')

    rerender(<Card padding="lg">Large padding</Card>)
    expect(screen.getByText('Large padding')).toHaveClass('p-8')
  })

  it('renders with no padding when specified', () => {
    render(<Card padding="none">No padding</Card>)

    const card = screen.getByText('No padding')
    expect(card).not.toHaveClass('p-4', 'p-6', 'p-8')
  })

  it('applies custom className', () => {
    render(<Card className="custom-class">Custom Card</Card>)

    const card = screen.getByText('Custom Card')
    expect(card).toHaveClass('custom-class')
  })

  it('forwards other props to div element', () => {
    render(<Card data-testid="custom-card">Test Card</Card>)

    const card = screen.getByTestId('custom-card')
    expect(card).toBeInTheDocument()
  })
})

describe('CardHeader', () => {
  it('renders with default props', () => {
    render(
      <Card>
        <CardHeader>Header content</CardHeader>
      </Card>
    )

    const header = screen.getByText('Header content')
    expect(header).toBeInTheDocument()
    expect(header).toHaveClass('flex', 'flex-col', 'space-y-1.5', 'p-6')
  })

  it('applies custom className', () => {
    render(
      <Card>
        <CardHeader className="custom-header">Header</CardHeader>
      </Card>
    )

    const header = screen.getByText('Header')
    expect(header).toHaveClass('custom-header')
  })
})

describe('CardTitle', () => {
  it('renders with default props', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Card Title</CardTitle>
        </CardHeader>
      </Card>
    )

    const title = screen.getByRole('heading', { level: 3 })
    expect(title).toBeInTheDocument()
    expect(title).toHaveClass('text-2xl', 'font-semibold', 'leading-none', 'tracking-tight')
  })

  it('applies custom className', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle className="custom-title">Title</CardTitle>
        </CardHeader>
      </Card>
    )

    const title = screen.getByRole('heading', { level: 3 })
    expect(title).toHaveClass('custom-title')
  })
})

describe('CardDescription', () => {
  it('renders with default props', () => {
    render(
      <Card>
        <CardHeader>
          <CardDescription>Description text</CardDescription>
        </CardHeader>
      </Card>
    )

    const description = screen.getByText('Description text')
    expect(description).toBeInTheDocument()
    expect(description).toHaveClass('text-sm', 'text-muted-foreground')
  })

  it('applies custom className', () => {
    render(
      <Card>
        <CardHeader>
          <CardDescription className="custom-desc">Description</CardDescription>
        </CardHeader>
      </Card>
    )

    const description = screen.getByText('Description')
    expect(description).toHaveClass('custom-desc')
  })
})

describe('CardContent', () => {
  it('renders with default props', () => {
    render(
      <Card>
        <CardContent>Content text</CardContent>
      </Card>
    )

    const content = screen.getByText('Content text')
    expect(content).toBeInTheDocument()
    expect(content).toHaveClass('p-6', 'pt-0')
  })

  it('applies custom className', () => {
    render(
      <Card>
        <CardContent className="custom-content">Content</CardContent>
      </Card>
    )

    const content = screen.getByText('Content')
    expect(content).toHaveClass('custom-content')
  })
})

describe('CardFooter', () => {
  it('renders with default props', () => {
    render(
      <Card>
        <CardFooter>Footer content</CardFooter>
      </Card>
    )

    const footer = screen.getByText('Footer content')
    expect(footer).toBeInTheDocument()
    expect(footer).toHaveClass('flex', 'items-center', 'p-6', 'pt-0')
  })

  it('applies custom className', () => {
    render(
      <Card>
        <CardFooter className="custom-footer">Footer</CardFooter>
      </Card>
    )

    const footer = screen.getByText('Footer')
    expect(footer).toHaveClass('custom-footer')
  })
})

describe('Card composition', () => {
  it('renders complete card structure correctly', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Test Title</CardTitle>
          <CardDescription>Test Description</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Main content</p>
        </CardContent>
        <CardFooter>
          <button>Action</button>
        </CardFooter>
      </Card>
    )

    expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent('Test Title')
    expect(screen.getByText('Test Description')).toBeInTheDocument()
    expect(screen.getByText('Main content')).toBeInTheDocument()
    expect(screen.getByRole('button')).toHaveTextContent('Action')
  })
})
