import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import TodoItem from '../TodoItem'
import { todoApi } from '../../services/todoApi'

// @TEST:TAG-005

// Mock the todoApi
vi.mock('../../services/todoApi')

describe('TodoItem History Integration', () => {
  const mockTodo = {
    id: '123',
    title: 'Test Todo',
    description: 'Test description',
    status: 'done',
    priority: 'medium',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-03T00:00:00Z'
  }

  const mockHistory = [
    {
      id: '1',
      timestamp: '2024-01-01T10:00:00Z',
      from_status: 'todo',
      to_status: 'in_progress',
      changed_by: 'user1',
      reason: 'Started working on task'
    },
    {
      id: '2',
      timestamp: '2024-01-02T15:30:00Z',
      from_status: 'in_progress',
      to_status: 'review',
      changed_by: 'user1',
      reason: 'Implementation completed'
    },
    {
      id: '3',
      timestamp: '2024-01-03T09:15:00Z',
      from_status: 'review',
      to_status: 'done',
      changed_by: 'user2',
      reason: 'Reviewed and approved'
    }
  ]

  const mockOnStatusChange = vi.fn()
  const mockOnEdit = vi.fn()
  const mockOnDelete = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    todoApi.getStatusHistory.mockResolvedValue(mockHistory)
  })

  it('shows history button when todo has status changes', () => {
    render(
      <TodoItem
        todo={mockTodo}
        onStatusChange={mockOnStatusChange}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    )

    expect(screen.getByRole('button', { name: 'View History' })).toBeInTheDocument()
  })

  it('does not show history button when todo has no history', async () => {
    todoApi.getStatusHistory.mockResolvedValue([])

    render(
      <TodoItem
        todo={mockTodo}
        onStatusChange={mockOnStatusChange}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    )

    await waitFor(() => {
      expect(screen.queryByRole('button', { name: 'View History' })).not.toBeInTheDocument()
    })
  })

  it('opens history viewer when history button is clicked', async () => {
    const user = userEvent.setup()

    render(
      <TodoItem
        todo={mockTodo}
        onStatusChange={mockOnStatusChange}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    )

    const historyButton = screen.getByRole('button', { name: 'View History' })
    await user.click(historyButton)

    expect(screen.getByText('History for "Test Todo"')).toBeInTheDocument()
  })

  it('fetches history data when history button is clicked', async () => {
    const user = userEvent.setup()

    render(
      <TodoItem
        todo={mockTodo}
        onStatusChange={mockOnStatusChange}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    )

    const historyButton = screen.getByRole('button', { name: 'View History' })
    await user.click(historyButton)

    expect(todoApi.getStatusHistory).toHaveBeenCalledWith('123')
  })

  it('shows loading state while fetching history', async () => {
    todoApi.getStatusHistory.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))

    const user = userEvent.setup()

    render(
      <TodoItem
        todo={mockTodo}
        onStatusChange={mockOnStatusChange}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    )

    const historyButton = screen.getByRole('button', { name: 'View History' })
    await user.click(historyButton)

    expect(screen.getByText('Loading history...')).toBeInTheDocument()
  })

  it('handles error when fetching history fails', async () => {
    todoApi.getStatusHistory.mockRejectedValue(new Error('Failed to fetch history'))

    const user = userEvent.setup()

    render(
      <TodoItem
        todo={mockTodo}
        onStatusChange={mockOnStatusChange}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    )

    const historyButton = screen.getByRole('button', { name: 'View History' })
    await user.click(historyButton)

    await waitFor(() => {
      expect(screen.getByText('Failed to load history')).toBeInTheDocument()
    })
  })

  it('shows history summary in timeline view', async () => {
    const user = userEvent.setup()

    render(
      <TodoItem
        todo={mockTodo}
        onStatusChange={mockOnStatusChange}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    )

    const historyButton = screen.getByRole('button', { name: 'View History' })
    await user.click(historyButton)

    // Should show recent status changes in timeline
    await waitFor(() => {
      expect(screen.getByText('Status History')).toBeInTheDocument()
      expect(screen.getByText('todo → in_progress')).toBeInTheDocument()
      expect(screen.getByText('in_progress → review')).toBeInTheDocument()
      expect(screen.getByText('review → done')).toBeInTheDocument()
    })
  })

  it('shows history count indicator on history button', async () => {
    const user = userEvent.setup()

    render(
      <TodoItem
        todo={mockTodo}
        onStatusChange={mockOnStatusChange}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    )

    // Should show count of status changes
    await waitFor(() => {
      expect(screen.getByText('3')).toBeInTheDocument() // 3 status changes
    })
  })

  it('closes history viewer when close button is clicked', async () => {
    const user = userEvent.setup()

    render(
      <TodoItem
        todo={mockTodo}
        onStatusChange={mockOnStatusChange}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    )

    const historyButton = screen.getByRole('button', { name: 'View History' })
    await user.click(historyButton)

    const closeButton = screen.getByRole('button', { name: 'Close History' })
    await user.click(closeButton)

    expect(screen.queryByText('History for "Test Todo"')).not.toBeInTheDocument()
  })

  it('shows different history button styles based on status change frequency', async () => {
    // Test with many status changes
    const longHistory = Array.from({ length: 10 }, (_, i) => ({
      id: `${i + 1}`,
      timestamp: '2024-01-01T10:00:00Z',
      from_status: 'todo',
      to_status: 'in_progress',
      changed_by: 'user1',
      reason: `Change ${i + 1}`
    }))

    todoApi.getStatusHistory.mockResolvedValue(longHistory)

    render(
      <TodoItem
        todo={mockTodo}
        onStatusChange={mockOnStatusChange}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    )

    await waitFor(() => {
      const historyButton = screen.getByRole('button', { name: 'View History' })
      expect(historyButton).toHaveClass('history-button-active') // Should indicate active history
    })
  })

  it('refreshes history when status is changed', async () => {
    const user = userEvent.setup()

    render(
      <TodoItem
        todo={mockTodo}
        onStatusChange={mockOnStatusChange}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    )

    // Change status
    const statusBadge = screen.getByRole('status')
    await user.click(statusBadge)

    const statusSelect = screen.getByLabelText('Status')
    await user.selectOptions(statusSelect, 'todo')

    // Should refresh history after status change
    expect(todoApi.getStatusHistory).toHaveBeenCalledTimes(2) // Once for initial load, once for refresh
  })

  it('shows history accessibility attributes', async () => {
    const user = userEvent.setup()

    render(
      <TodoItem
        todo={mockTodo}
        onStatusChange={mockOnStatusChange}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    )

    const historyButton = screen.getByRole('button', { name: 'View History' })
    expect(historyButton).toHaveAttribute('aria-label', 'View status change history for Test Todo')
  })
})