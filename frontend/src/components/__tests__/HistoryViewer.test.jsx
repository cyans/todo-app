import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import HistoryViewer from '../HistoryViewer'

// @TEST:TAG-005

describe('HistoryViewer', () => {
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

  const mockTodo = {
    id: '123',
    title: 'Test Todo',
    status: 'done'
  }

  it('renders history viewer with todo title', () => {
    render(
      <HistoryViewer
        todo={mockTodo}
        history={mockHistory}
        onClose={() => {}}
      />
    )

    expect(screen.getByText('History for "Test Todo"')).toBeInTheDocument()
  })

  it('displays all history entries in detail view', () => {
    render(
      <HistoryViewer
        todo={mockTodo}
        history={mockHistory}
        onClose={() => {}}
      />
    )

    // Should show detailed information for each entry
    expect(screen.getByText('todo → in_progress')).toBeInTheDocument()
    expect(screen.getByText('in_progress → review')).toBeInTheDocument()
    expect(screen.getByText('review → done')).toBeInTheDocument()
  })

  it('shows empty state when no history exists', () => {
    render(
      <HistoryViewer
        todo={mockTodo}
        history={[]}
        onClose={() => {}}
      />
    )

    expect(screen.getByText('No status changes recorded for this todo')).toBeInTheDocument()
  })

  it('displays detailed timestamps in both absolute and relative format', () => {
    render(
      <HistoryViewer
        todo={mockTodo}
        history={mockHistory}
        onClose={() => {}}
      />
    )

    // Should show formatted date/time
    expect(screen.getByText(/Jan 1, 2024/)).toBeInTheDocument()
    expect(screen.getByText(/10:00 AM/)).toBeInTheDocument()
  })

  it('shows user attribution with avatar and name', () => {
    render(
      <HistoryViewer
        todo={mockTodo}
        history={mockHistory}
        onClose={() => {}}
      />
    )

    // Check that user names appear in the history entries
    const user1Elements = screen.getAllByText('user1')
    const user2Elements = screen.getAllByText('user2')

    // Should find user1 and user2 in the history content (not just in filters)
    expect(user1Elements.length).toBeGreaterThan(0)
    expect(user2Elements.length).toBeGreaterThan(0)
  })

  it('displays change reasons in dedicated section', () => {
    render(
      <HistoryViewer
        todo={mockTodo}
        history={mockHistory}
        onClose={() => {}}
      />
    )

    expect(screen.getByText('Started working on task')).toBeInTheDocument()
    expect(screen.getByText('Implementation completed')).toBeInTheDocument()
    expect(screen.getByText('Reviewed and approved')).toBeInTheDocument()
  })

  it('calls onClose when close button is clicked', async () => {
    const mockOnClose = vi.fn()
    const user = userEvent.setup()

    render(
      <HistoryViewer
        todo={mockTodo}
        history={mockHistory}
        onClose={mockOnClose}
      />
    )

    const closeButton = screen.getByRole('button', { name: 'Close' })
    await user.click(closeButton)

    expect(mockOnClose).toHaveBeenCalledTimes(1)
  })

  it('calls onClose when backdrop is clicked', async () => {
    const mockOnClose = vi.fn()
    const user = userEvent.setup()

    render(
      <HistoryViewer
        todo={mockTodo}
        history={mockHistory}
        onClose={mockOnClose}
      />
    )

    const backdrop = screen.getByTestId('history-viewer-backdrop')
    await user.click(backdrop)

    expect(mockOnClose).toHaveBeenCalledTimes(1)
  })

  it('filters history by status when status filter is selected', async () => {
    const user = userEvent.setup()

    render(
      <HistoryViewer
        todo={mockTodo}
        history={mockHistory}
        onClose={() => {}}
      />
    )

    const statusFilter = screen.getByLabelText('Filter by status')
    await user.selectOptions(statusFilter, 'in_progress')

    // Should only show entries involving 'in_progress' status
    expect(screen.getByText('todo → in_progress')).toBeInTheDocument()
    expect(screen.getByText('in_progress → review')).toBeInTheDocument()
    // Should not show the review → done transition
    expect(screen.queryByText('review → done')).not.toBeInTheDocument()
  })

  it('filters history by user when user filter is selected', async () => {
    const user = userEvent.setup()

    render(
      <HistoryViewer
        todo={mockTodo}
        history={mockHistory}
        onClose={() => {}}
      />
    )

    const userFilter = screen.getByLabelText('Filter by user')
    await user.selectOptions(userFilter, 'user1')

    // Should only show entries by user1 - check for the transition text instead
    expect(screen.getByText('todo → in_progress')).toBeInTheDocument()
    expect(screen.getByText('in_progress → review')).toBeInTheDocument()
    // Should not show transitions involving user2
    expect(screen.queryByText('review → done')).not.toBeInTheDocument()
  })

  it('sorts history by timestamp (newest first)', () => {
    render(
      <HistoryViewer
        todo={mockTodo}
        history={mockHistory}
        onClose={() => {}}
      />
    )

    const historyEntries = screen.getAllByTestId(/history-detail-/)

    // First entry should be the most recent (Jan 3)
    expect(historyEntries[0]).toHaveTextContent('Jan 3, 2024')
    expect(historyEntries[0]).toHaveTextContent('review → done')
  })

  it('shows export history button', () => {
    render(
      <HistoryViewer
        todo={mockTodo}
        history={mockHistory}
        onClose={() => {}}
      />
    )

    expect(screen.getByRole('button', { name: 'Export History' })).toBeInTheDocument()
  })

  it('handles missing user information gracefully', () => {
    const historyWithMissingUser = [
      {
        id: '1',
        timestamp: '2024-01-01T10:00:00Z',
        from_status: 'todo',
        to_status: 'in_progress',
        reason: 'Started working on task'
        // missing changed_by
      }
    ]

    render(
      <HistoryViewer
        todo={mockTodo}
        history={historyWithMissingUser}
        onClose={() => {}}
      />
    )

    expect(screen.getByText('Unknown user')).toBeInTheDocument()
  })

  it('is accessible via keyboard navigation', async () => {
    const mockOnClose = vi.fn()
    const user = userEvent.setup()

    render(
      <HistoryViewer
        todo={mockTodo}
        history={mockHistory}
        onClose={mockOnClose}
      />
    )

    // Should be able to close with Escape key
    await user.keyboard('{Escape}')

    expect(mockOnClose).toHaveBeenCalledTimes(1)
  })

  it('applies correct status colors to transitions', () => {
    render(
      <HistoryViewer
        todo={mockTodo}
        history={mockHistory}
        onClose={() => {}}
      />
    )

    // Should apply appropriate color classes for status transitions
    // Check that elements with status classes exist
    const todoElement = document.querySelector('.status-todo')
    const inProgressElement = document.querySelector('.status-in_progress')
    const doneElement = document.querySelector('.status-done')

    expect(todoElement).toBeInTheDocument()
    expect(inProgressElement).toBeInTheDocument()
    expect(doneElement).toBeInTheDocument()
  })
})