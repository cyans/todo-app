import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import StatusHistoryTimeline from '../StatusHistoryTimeline'

// @TEST:TAG-005

describe('StatusHistoryTimeline', () => {
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

  it('renders history timeline with correct number of entries', () => {
    render(
      <StatusHistoryTimeline
        history={mockHistory}
        onHistoryClick={() => {}}
      />
    )

    expect(screen.getByText('Status History')).toBeInTheDocument()
    // Each history entry should have timestamp, status change, and user info
    expect(screen.getAllByTestId(/history-entry-/)).toHaveLength(3)
  })

  it('displays empty state when no history is provided', () => {
    render(
      <StatusHistoryTimeline
        history={[]}
        onHistoryClick={() => {}}
      />
    )

    expect(screen.getByText('No status changes recorded')).toBeInTheDocument()
  })

  it('shows correct status transition information', () => {
    render(
      <StatusHistoryTimeline
        history={mockHistory}
        onHistoryClick={() => {}}
      />
    )

    // Check for status transitions (using the formatted labels)
    expect(screen.getAllByText('To Do')).toHaveLength(1)
    expect(screen.getAllByText('In Progress')).toHaveLength(2)
    expect(screen.getAllByText('Review')).toHaveLength(2) // Review appears twice (to_status in entry 2, from_status in entry 3)
    expect(screen.getAllByText('Done')).toHaveLength(1)
  })

  it('displays user attribution for changes', () => {
    render(
      <StatusHistoryTimeline
        history={mockHistory}
        onHistoryClick={() => {}}
      />
    )

    expect(screen.getAllByText('user1')).toHaveLength(2)
    expect(screen.getAllByText('user2')).toHaveLength(1)
  })

  it('shows timestamps in formatted relative time', () => {
    render(
      <StatusHistoryTimeline
        history={mockHistory}
        onHistoryClick={() => {}}
      />
    )

    // Should show formatted timestamps (multiple instances)
    expect(screen.getAllByText(/ago/)).toHaveLength(3)
  })

  it('displays change reasons when provided', () => {
    render(
      <StatusHistoryTimeline
        history={mockHistory}
        onHistoryClick={() => {}}
      />
    )

    expect(screen.getByText('Started working on task')).toBeInTheDocument()
    expect(screen.getByText('Implementation completed')).toBeInTheDocument()
    expect(screen.getByText('Reviewed and approved')).toBeInTheDocument()
  })

  it('calls onHistoryClick when history entry is clicked', () => {
    const mockOnClick = vi.fn()

    render(
      <StatusHistoryTimeline
        history={mockHistory}
        onHistoryClick={mockOnClick}
      />
    )

    const historyEntries = screen.getAllByTestId(/history-entry-/)
    historyEntries.forEach(entry => {
      fireEvent.click(entry)
    })

    expect(mockOnClick).toHaveBeenCalledTimes(3)
  })

  it('applies correct visual styling for timeline', () => {
    render(
      <StatusHistoryTimeline
        history={mockHistory}
        onHistoryClick={() => {}}
      />
    )

    const timelineContainer = screen.getByTestId('history-timeline')
    expect(timelineContainer).toHaveClass('history-timeline')
  })

  it('handles missing reason gracefully', () => {
    const historyWithoutReason = [
      {
        id: '1',
        timestamp: '2024-01-01T10:00:00Z',
        from_status: 'todo',
        to_status: 'in_progress',
        changed_by: 'user1'
        // no reason provided
      }
    ]

    render(
      <StatusHistoryTimeline
        history={historyWithoutReason}
        onHistoryClick={() => {}}
      />
    )

    // Should not show a reason section when no reason is provided
    expect(screen.queryByText(/reason/i)).not.toBeInTheDocument()
  })

  it('limits display to most recent changes when history is long', () => {
    const longHistory = Array.from({ length: 15 }, (_, i) => ({
      id: `${i + 1}`,
      timestamp: '2024-01-01T10:00:00Z',
      from_status: 'todo',
      to_status: 'in_progress',
      changed_by: 'user1',
      reason: `Change ${i + 1}`
    }))

    render(
      <StatusHistoryTimeline
        history={longHistory}
        onHistoryClick={() => {}}
      />
    )

    // Should only show 10 most recent entries by default
    expect(screen.getAllByTestId(/history-entry-/)).toHaveLength(10)
    expect(screen.getByText(/Show more/)).toBeInTheDocument()
  })
})