import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import StatusSelector from '../StatusSelector'

// @TEST:TODO-CRUD-001

describe('StatusSelector', () => {
  const mockOnStatusChange = vi.fn()

  beforeEach(() => {
    mockOnStatusChange.mockClear()
  })

  it('renders status selector with current status', () => {
    render(<StatusSelector currentStatus="todo" onStatusChange={mockOnStatusChange} />)

    expect(screen.getByLabelText('Status')).toBeInTheDocument()
    expect(screen.getByDisplayValue('📋 To Do')).toBeInTheDocument()
  })

  it('displays all available status options', () => {
    render(<StatusSelector currentStatus="todo" onStatusChange={mockOnStatusChange} />)

    expect(screen.getByText('📋 To Do')).toBeInTheDocument()
    expect(screen.getByText('🔄 In Progress')).toBeInTheDocument()
    expect(screen.getByText('👁️ Review')).toBeInTheDocument()
    expect(screen.getByText('✅ Done')).toBeInTheDocument()
    expect(screen.getByText('📦 Archived')).toBeInTheDocument()
  })

  it('calls onStatusChange when status is selected', async () => {
    const user = userEvent.setup()
    render(<StatusSelector currentStatus="todo" onStatusChange={mockOnStatusChange} />)

    const select = screen.getByLabelText('Status')
    await user.selectOptions(select, 'in_progress')

    expect(mockOnStatusChange).toHaveBeenCalledWith('in_progress')
  })

  it('shows status icons in options', () => {
    render(<StatusSelector currentStatus="todo" onStatusChange={mockOnStatusChange} />)

    // Check that status icons are present in the select options
    const options = screen.getAllByRole('option')
    expect(options[0]).toHaveTextContent('📋 To Do')
    expect(options[1]).toHaveTextContent('🔄 In Progress')
    expect(options[2]).toHaveTextContent('👁️ Review')
    expect(options[3]).toHaveTextContent('✅ Done')
    expect(options[4]).toHaveTextContent('📦 Archived')
  })

  it('is disabled when disabled prop is true', () => {
    render(<StatusSelector currentStatus="todo" onStatusChange={mockOnStatusChange} disabled />)

    expect(screen.getByLabelText('Status')).toBeDisabled()
  })

  it('applies custom className when provided', () => {
    render(<StatusSelector currentStatus="todo" onStatusChange={mockOnStatusChange} className="custom-class" />)

    expect(screen.getByLabelText('Status')).toHaveClass('custom-class')
  })
})