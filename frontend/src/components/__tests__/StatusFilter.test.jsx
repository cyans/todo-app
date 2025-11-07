import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import StatusFilter from '../StatusFilter'

// @TEST:TODO-CRUD-001

describe('StatusFilter', () => {
  const mockOnFilterChange = vi.fn()

  beforeEach(() => {
    mockOnFilterChange.mockClear()
  })

  it('renders filter buttons for all statuses', () => {
    render(<StatusFilter onFilterChange={mockOnFilterChange} />)

    expect(screen.getByRole('button', { name: 'All' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '📋 To Do' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '🔄 In Progress' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '👁️ Review' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '✅ Done' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '📦 Archived' })).toBeInTheDocument()
  })

  it('highlights the active filter', () => {
    render(<StatusFilter onFilterChange={mockOnFilterChange} activeFilter="in_progress" />)

    const inProgressButton = screen.getByRole('button', { name: '🔄 In Progress' })
    expect(inProgressButton).toHaveClass('bg-blue-500', 'text-white')
  })

  it('calls onFilterChange when filter is clicked', async () => {
    const user = userEvent.setup()
    render(<StatusFilter onFilterChange={mockOnFilterChange} />)

    const doneButton = screen.getByRole('button', { name: '✅ Done' })
    await user.click(doneButton)

    expect(mockOnFilterChange).toHaveBeenCalledWith('done')
  })

  it('shows count badges when counts are provided', () => {
    const counts = {
      todo: 5,
      in_progress: 2,
      review: 1,
      done: 8,
      archived: 3
    }

    render(<StatusFilter onFilterChange={mockOnFilterChange} counts={counts} />)

    expect(screen.getByText('5')).toBeInTheDocument() // To Do count
    expect(screen.getByText('2')).toBeInTheDocument() // In Progress count
    expect(screen.getByText('1')).toBeInTheDocument() // Review count
    expect(screen.getByText('8')).toBeInTheDocument() // Done count
    expect(screen.getByText('3')).toBeInTheDocument() // Archived count
    expect(screen.getByText('19')).toBeInTheDocument() // Total count (5+2+1+8+3)
  })

  it('handles "All" filter correctly', async () => {
    const user = userEvent.setup()
    render(<StatusFilter onFilterChange={mockOnFilterChange} />)

    const allButton = screen.getByRole('button', { name: 'All' })
    await user.click(allButton)

    expect(mockOnFilterChange).toHaveBeenCalledWith(null)
  })
})