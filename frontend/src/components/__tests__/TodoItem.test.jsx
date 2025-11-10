/* @TEST:TAG-UI-RESPONSIVE-003 - Responsive TodoItem component tests */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { TodoItem } from '../TodoItem'

// Mock todo data
const mockTodo = {
  id: 1,
  text: 'Test todo item',
  completed: false,
  createdAt: new Date('2024-01-01T00:00:00Z'),
  priority: 'medium'
}

describe('TodoItem Component', () => {
  let mockProps

  beforeEach(() => {
    mockProps = {
      todo: mockTodo,
      onToggle: vi.fn(),
      onDelete: vi.fn(),
      onEdit: vi.fn()
    }
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('Responsive Design Tests', () => {
    it('renders with responsive container classes', () => {
      render(<TodoItem {...mockProps} />)

      const todoItem = screen.getByTestId('todo-item')
      expect(todoItem).toHaveClass('todo-item', 'mobile-first-base')

      // Check if responsive structure is present
      const content = screen.getByTestId('todo-content')
      const actions = screen.getByTestId('todo-actions')

      expect(content).toBeInTheDocument()
      expect(actions).toBeInTheDocument()
    })

    it('displays todo text with responsive typography', () => {
      render(<TodoItem {...mockProps} />)

      const todoText = screen.getByTestId('todo-text')
      expect(todoText).toHaveTextContent('Test todo item')
      expect(todoText).toHaveClass('responsive-text')
    })

    it('shows completed state with responsive styling', () => {
      const completedTodo = { ...mockTodo, completed: true }
      render(<TodoItem {...mockProps} todo={completedTodo} />)

      const todoItem = screen.getByTestId('todo-item')
      expect(todoItem).toHaveClass('todo-item--completed')

      const todoText = screen.getByTestId('todo-text')
      expect(todoText).toHaveClass('todo-item__text--completed')
    })

    it('renders priority indicator with responsive design', () => {
      render(<TodoItem {...mockProps} />)

      const priority = screen.getByTestId('todo-priority')
      expect(priority).toBeInTheDocument()
      expect(priority).toHaveClass('todo-item__priority', 'priority-medium')
    })

    it('displays creation date in responsive format', () => {
      render(<TodoItem {...mockProps} />)

      const date = screen.getByTestId('todo-date')
      expect(date).toBeInTheDocument()
      expect(date).toHaveClass('todo-item__date', 'responsive-text')
    })
  })

  describe('Touch Interaction Tests', () => {
    it('has touch-friendly target sizes', () => {
      render(<TodoItem {...mockProps} />)

      const checkbox = screen.getByRole('checkbox')
      const deleteButton = screen.getByRole('button', { name: /delete/i })
      const editButton = screen.getByRole('button', { name: /edit/i })

      // Check that interactive elements have touch target classes
      expect(checkbox.closest('.touch-target')).toBeInTheDocument()
      expect(deleteButton).toHaveClass('touch-target')
      expect(editButton).toHaveClass('touch-target')
    })

    it('handles touch interactions properly', async () => {
      render(<TodoItem {...mockProps} />)

      const checkbox = screen.getByRole('checkbox')

      // Simulate touch interaction
      fireEvent.touchStart(checkbox)
      fireEvent.touchEnd(checkbox)

      await waitFor(() => {
        expect(mockProps.onToggle).toHaveBeenCalledWith(mockTodo.id)
      })
    })

    it('provides visual feedback on touch interactions', async () => {
      render(<TodoItem {...mockProps} />)

      const deleteButton = screen.getByRole('button', { name: /delete/i })

      // Test hover/focus states for touch feedback
      fireEvent.mouseEnter(deleteButton)
      expect(deleteButton).toHaveClass('hover')

      fireEvent.mouseLeave(deleteButton)
      fireEvent.focus(deleteButton)
      expect(deleteButton).toHaveClass('focus')
    })
  })

  describe('Responsive Layout Tests', () => {
    it('adapts layout for different screen sizes', () => {
      render(<TodoItem {...mockProps} />)

      const todoItem = screen.getByTestId('todo-item')
      const layout = screen.getByTestId('todo-layout')

      // Check mobile-first layout
      expect(layout).toHaveClass('flex', 'flex--col', 'mobile-first-base')

      // Check responsive breakpoints
      expect(todoItem).toHaveClass('todo-item')
    })

    it('handles long text content responsively', () => {
      const longTextTodo = {
        ...mockTodo,
        text: 'This is a very long todo item text that should wrap properly on mobile devices and display correctly on larger screens with proper line breaks and spacing'
      }

      render(<TodoItem {...mockProps} todo={longTextTodo} />)

      const todoText = screen.getByTestId('todo-text')
      expect(todoText).toHaveClass('responsive-text')

      // Should handle text overflow gracefully
      expect(todoText).toBeInTheDocument()
    })

    it('maintains accessibility on different screen sizes', () => {
      render(<TodoItem {...mockProps} />)

      const checkbox = screen.getByRole('checkbox')
      const deleteButton = screen.getByRole('button', { name: /delete/i })
      const editButton = screen.getByRole('button', { name: /edit/i })

      // Check ARIA attributes are maintained
      expect(checkbox).toHaveAttribute('aria-label')
      expect(deleteButton).toHaveAttribute('aria-label')
      expect(editButton).toHaveAttribute('aria-label')

      // Check keyboard navigation
      expect(checkbox).toHaveAttribute('tabIndex', '0')
      expect(deleteButton).toHaveAttribute('tabIndex', '0')
      expect(editButton).toHaveAttribute('tabIndex', '0')
    })
  })

  describe('Performance Tests', () => {
    it('renders efficiently with proper memoization', () => {
      const { rerender } = render(<TodoItem {...mockProps} />)

      // Initial render
      const initialTodoItem = screen.getByTestId('todo-item')
      expect(initialTodoItem).toBeInTheDocument()

      // Rerender with same props should not cause unnecessary updates
      rerender(<TodoItem {...mockProps} />)

      const rerenderedTodoItem = screen.getByTestId('todo-item')
      expect(rerenderedTodoItem).toBe(initialTodoItem)
    })

    it('handles rapid interactions without performance issues', async () => {
      render(<TodoItem {...mockProps} />)

      const checkbox = screen.getByRole('checkbox')

      // Simulate rapid interactions
      for (let i = 0; i < 10; i++) {
        fireEvent.click(checkbox)
      }

      await waitFor(() => {
        expect(mockProps.onToggle).toHaveBeenCalledTimes(10)
      })
    })
  })

  describe('Edge Cases', () => {
    it('handles empty todo text gracefully', () => {
      const emptyTodo = { ...mockTodo, text: '' }
      render(<TodoItem {...mockProps} todo={emptyTodo} />)

      const todoText = screen.getByTestId('todo-text')
      expect(todoText).toBeInTheDocument()
      expect(todoText).toHaveTextContent('')
    })

    it('handles special characters in todo text', () => {
      const specialTodo = { ...mockTodo, text: 'Special chars: & < > " \' / \\' }
      render(<TodoItem {...mockProps} todo={specialTodo} />)

      const todoText = screen.getByTestId('todo-text')
      expect(todoText).toHaveTextContent('Special chars: & < > " \' / \\')
    })

    it('handles missing priority gracefully', () => {
      const noPriorityTodo = { ...mockTodo, priority: null }
      render(<TodoItem {...mockProps} todo={noPriorityTodo} />)

      const priority = screen.queryByTestId('todo-priority')
      expect(priority).not.toBeInTheDocument()
    })

    it('handles missing creation date gracefully', () => {
      const noDateTodo = { ...mockTodo, createdAt: null }
      render(<TodoItem {...mockProps} todo={noDateTodo} />)

      const date = screen.queryByTestId('todo-date')
      expect(date).not.toBeInTheDocument()
    })
  })
})