import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import StatusBadge from '../StatusBadge'

// @TEST:TODO-CRUD-001

describe('StatusBadge', () => {
  it('renders badge with todo status', () => {
    render(<StatusBadge status="todo" />)

    expect(screen.getByText('📋')).toBeInTheDocument()
    expect(screen.getByText('To Do')).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveAttribute('aria-label', 'Status: To Do')
  })

  it('renders badge with in_progress status', () => {
    render(<StatusBadge status="in_progress" />)

    expect(screen.getByText('🔄')).toBeInTheDocument()
    expect(screen.getByText('In Progress')).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveAttribute('aria-label', 'Status: In Progress')
  })

  it('renders badge with review status', () => {
    render(<StatusBadge status="review" />)

    expect(screen.getByText('👁️')).toBeInTheDocument()
    expect(screen.getByText('Review')).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveAttribute('aria-label', 'Status: Review')
  })

  it('renders badge with done status', () => {
    render(<StatusBadge status="done" />)

    expect(screen.getByText('✅')).toBeInTheDocument()
    expect(screen.getByText('Done')).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveAttribute('aria-label', 'Status: Done')
  })

  it('renders badge with archived status', () => {
    render(<StatusBadge status="archived" />)

    expect(screen.getByText('📦')).toBeInTheDocument()
    expect(screen.getByText('Archived')).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveAttribute('aria-label', 'Status: Archived')
  })

  it('applies correct styling for each status', () => {
    const { rerender } = render(<StatusBadge status="todo" />)
    let badge = screen.getByRole('status')
    expect(badge).toHaveClass('bg-gray-100', 'text-gray-800', 'border-gray-300')

    rerender(<StatusBadge status="in_progress" />)
    badge = screen.getByRole('status')
    expect(badge).toHaveClass('bg-blue-100', 'text-blue-800', 'border-blue-300')

    rerender(<StatusBadge status="review" />)
    badge = screen.getByRole('status')
    expect(badge).toHaveClass('bg-yellow-100', 'text-yellow-800', 'border-yellow-300')

    rerender(<StatusBadge status="done" />)
    badge = screen.getByRole('status')
    expect(badge).toHaveClass('bg-green-100', 'text-green-800', 'border-green-300')

    rerender(<StatusBadge status="archived" />)
    badge = screen.getByRole('status')
    expect(badge).toHaveClass('bg-gray-100', 'text-gray-600', 'border-gray-300')
  })

  it('shows only icon when showLabel is false', () => {
    render(<StatusBadge status="done" showLabel={false} />)

    expect(screen.getByText('✅')).toBeInTheDocument()
    expect(screen.queryByText('Done')).not.toBeInTheDocument()
  })

  it('applies custom className when provided', () => {
    render(<StatusBadge status="todo" className="custom-badge" />)

    const badge = screen.getByRole('status')
    expect(badge).toHaveClass('custom-badge')
  })

  it('handles unknown status gracefully', () => {
    render(<StatusBadge status="unknown" />)

    expect(screen.getByText('📋')).toBeInTheDocument()
    expect(screen.getByText('To Do')).toBeInTheDocument()
  })
})