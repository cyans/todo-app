import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import TodoItem from '../TodoItem'

// @TEST:TODO-CRUD-001

describe('TodoItem', () => {
  const mockTodo = {
    id: '1',
    title: 'Test Todo',
    description: 'Test description',
    status: 'todo',
    priority: 'medium',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  }

  const mockOnStatusChange = vi.fn()
  const mockOnEdit = vi.fn()
  const mockOnDelete = vi.fn()

  beforeEach(() => {
    mockOnStatusChange.mockClear()
    mockOnEdit.mockClear()
    mockOnDelete.mockClear()
  })

  it('renders todo item with title and description', () => {
    render(
      <TodoItem
        todo={mockTodo}
        onStatusChange={mockOnStatusChange}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    )

    expect(screen.getByText('Test Todo')).toBeInTheDocument()
    expect(screen.getByText('Test description')).toBeInTheDocument()
  })

  it('displays status badge with correct status', () => {
    render(
      <TodoItem
        todo={mockTodo}
        onStatusChange={mockOnStatusChange}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    )

    expect(screen.getByRole('status')).toBeInTheDocument()
    expect(screen.getByText('To Do')).toBeInTheDocument()
  })

  it('shows status selector when status change is clicked', async () => {
    const user = userEvent.setup()
    render(
      <TodoItem
        todo={mockTodo}
        onStatusChange={mockOnStatusChange}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    )

    const statusBadge = screen.getByRole('status')
    await user.click(statusBadge)

    expect(screen.getByLabelText('Status')).toBeInTheDocument()
  })

  it('calls onStatusChange when new status is selected', async () => {
    const user = userEvent.setup()
    render(
      <TodoItem
        todo={mockTodo}
        onStatusChange={mockOnStatusChange}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    )

    const statusBadge = screen.getByRole('status')
    await user.click(statusBadge)

    const statusSelect = screen.getByLabelText('Status')
    await user.selectOptions(statusSelect, 'in_progress')

    expect(mockOnStatusChange).toHaveBeenCalledWith('1', 'in_progress')
  })

  it('displays priority indicator', () => {
    const todoWithPriority = { ...mockTodo, priority: 'high' }
    render(
      <TodoItem
        todo={todoWithPriority}
        onStatusChange={mockOnStatusChange}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    )

    expect(screen.getByText('HIGH PRIORITY')).toBeInTheDocument()
  })

  it('shows edit and delete buttons', () => {
    render(
      <TodoItem
        todo={mockTodo}
        onStatusChange={mockOnStatusChange}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    )

    expect(screen.getByRole('button', { name: 'Edit' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument()
  })

  it('calls onEdit when edit button is clicked', async () => {
    const user = userEvent.setup()
    render(
      <TodoItem
        todo={mockTodo}
        onStatusChange={mockOnStatusChange}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    )

    const editButton = screen.getByRole('button', { name: 'Edit' })
    await user.click(editButton)

    expect(mockOnEdit).toHaveBeenCalledWith(mockTodo)
  })

  it('calls onDelete when delete button is clicked', async () => {
    const user = userEvent.setup()
    render(
      <TodoItem
        todo={mockTodo}
        onStatusChange={mockOnStatusChange}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    )

    const deleteButton = screen.getByRole('button', { name: 'Delete' })
    await user.click(deleteButton)

    expect(mockOnDelete).toHaveBeenCalledWith('1')
  })

  it('shows created date in formatted format', () => {
    render(
      <TodoItem
        todo={mockTodo}
        onStatusChange={mockOnStatusChange}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    )

    expect(screen.getByText(/Created:/)).toBeInTheDocument()
  })

  it('applies correct styling based on status', () => {
    const inProgressTodo = { ...mockTodo, status: 'in_progress' }
    render(
      <TodoItem
        todo={inProgressTodo}
        onStatusChange={mockOnStatusChange}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    )

    const todoCard = screen.getByTestId('todo-item')
    expect(todoCard).toHaveClass('border-l-4', 'border-l-blue-500')
  })

  it('shows due date when provided', () => {
    const todoWithDueDate = {
      ...mockTodo,
      dueDate: '2024-12-25T00:00:00Z'
    }
    render(
      <TodoItem
        todo={todoWithDueDate}
        onStatusChange={mockOnStatusChange}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    )

    expect(screen.getByText(/Due:/)).toBeInTheDocument()
  })

  it('shows tags when provided', () => {
    const todoWithTags = {
      ...mockTodo,
      tags: ['urgent', 'work']
    }
    render(
      <TodoItem
        todo={todoWithTags}
        onStatusChange={mockOnStatusChange}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    )

    expect(screen.getByText('urgent')).toBeInTheDocument()
    expect(screen.getByText('work')).toBeInTheDocument()
  })
})