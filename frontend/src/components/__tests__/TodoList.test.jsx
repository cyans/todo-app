/* @TEST:TAG-UI-RESPONSIVE-003 - Responsive TodoList component tests */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { TodoList } from '../TodoList'

// Mock todo data
const mockTodos = [
  {
    id: 1,
    text: 'Test todo 1',
    completed: false,
    createdAt: new Date('2024-01-01T00:00:00Z'),
    priority: 'high'
  },
  {
    id: 2,
    text: 'Test todo 2',
    completed: true,
    createdAt: new Date('2024-01-02T00:00:00Z'),
    priority: 'medium'
  },
  {
    id: 3,
    text: 'Test todo 3',
    completed: false,
    createdAt: new Date('2024-01-03T00:00:00Z'),
    priority: 'low'
  }
]

describe('TodoList Component', () => {
  let mockProps

  beforeEach(() => {
    mockProps = {
      todos: mockTodos,
      onToggle: vi.fn(),
      onDelete: vi.fn(),
      onEdit: vi.fn(),
      loading: false,
      error: null
    }
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('Responsive Design Tests', () => {
    it('renders with responsive container classes', () => {
      render(<TodoList {...mockProps} />)

      const todoList = screen.getByTestId('todo-list')
      expect(todoList).toHaveClass('todo-list', 'mobile-first-base')

      // Check grid layout
      const grid = screen.getByTestId('todo-grid')
      expect(grid).toHaveClass('grid', 'grid--cols-1')
    })

    it('adapts grid columns based on screen size', () => {
      render(<TodoList {...mockProps} />)

      const grid = screen.getByTestId('todo-grid')

      // Should have responsive grid classes
      expect(grid).toHaveClass('grid')

      // Should have breakpoint-specific classes
      expect(grid).toHaveClass('grid--auto-fit')
    })

    it('displays all todos with responsive layout', () => {
      render(<TodoList {...mockProps} />)

      const todoItems = screen.getAllByTestId('todo-item')
      expect(todoItems).toHaveLength(3)

      todoItems.forEach((item, index) => {
        expect(item).toHaveClass('todo-item', 'mobile-first-base')
      })
    })

    it('shows empty state with responsive styling', () => {
      render(<TodoList {...mockProps} todos={[]} />)

      const emptyState = screen.getByTestId('todo-empty-state')
      expect(emptyState).toBeInTheDocument()
      expect(emptyState).toHaveClass('todo-list__empty-state', 'text-center')

      const emptyMessage = screen.getByTestId('todo-empty-message')
      expect(emptyMessage).toHaveClass('responsive-text')
    })
  })

  describe('Loading and Error States', () => {
    it('shows loading state with responsive design', () => {
      render(<TodoList {...mockProps} loading={true} />)

      const loadingState = screen.getByTestId('todo-loading-state')
      expect(loadingState).toBeInTheDocument()
      expect(loadingState).toHaveClass('todo-list__loading-state')

      const spinner = screen.getByTestId('loading-spinner')
      expect(spinner).toBeInTheDocument()
    })

    it('shows error state with responsive design', () => {
      const errorMessage = 'Failed to load todos'
      render(<TodoList {...mockProps} error={errorMessage} />)

      const errorState = screen.getByTestId('todo-error-state')
      expect(errorState).toBeInTheDocument()
      expect(errorState).toHaveClass('todo-list__error-state')

      const errorText = screen.getByTestId('error-message')
      expect(errorText).toHaveTextContent(errorMessage)
      expect(errorText).toHaveClass('responsive-text')
    })
  })

  describe('Filtering and Sorting', () => {
    it('applies filter with responsive UI', () => {
      render(<TodoList {...mockProps} filter="active" />)

      const activeTodos = screen.getAllByTestId('todo-item').filter(
        item => !item.classList.contains('todo-item--completed')
      )
      expect(activeTodos).toHaveLength(2) // Only incomplete todos
    })

    it('applies sort with responsive UI', () => {
      render(<TodoList {...mockProps} sortBy="priority" />)

      const todoItems = screen.getAllByTestId('todo-item')
      expect(todoItems).toHaveLength(3)
      // Should be sorted by priority (high, medium, low)
    })

    it('shows filter controls with responsive design', () => {
      render(<TodoList {...mockProps} />)

      const filterControls = screen.getByTestId('todo-filter-controls')
      expect(filterControls).toBeInTheDocument()
      expect(filterControls).toHaveClass('todo-list__filter-controls', 'flex', 'flex--wrap')
    })
  })

  describe('Touch and Mobile Interactions', () => {
    it('provides touch-friendly navigation on mobile', () => {
      render(<TodoList {...mockProps} />)

      const pagination = screen.getByTestId('todo-pagination')
      if (pagination) {
        expect(pagination).toHaveClass('todo-list__pagination')

        const paginationButtons = screen.getAllByRole('button', { name: /page/i })
        paginationButtons.forEach(button => {
          expect(button).toHaveClass('touch-target')
        })
      }
    })

    it('handles swipe gestures for mobile navigation', async () => {
      render(<TodoList {...mockProps} />)

      const todoList = screen.getByTestId('todo-list')

      // Simulate swipe gestures
      fireEvent.touchStart(todoList, { touches: [{ clientX: 100, clientY: 100 }] })
      fireEvent.touchMove(todoList, { touches: [{ clientX: 50, clientY: 100 }] })
      fireEvent.touchEnd(todoList)

      // Should handle swipe navigation gracefully
      expect(todoList).toBeInTheDocument()
    })

    it('shows mobile-optimized action buttons', () => {
      render(<TodoList {...mockProps} />)

      const todoItems = screen.getAllByTestId('todo-item')

      todoItems.forEach(item => {
        const actionButtons = item.querySelectorAll('[data-testid*="action-btn"]')
        actionButtons.forEach(button => {
          expect(button).toHaveClass('touch-target')
        })
      })
    })
  })

  describe('Responsive Performance', () => {
    it('handles large number of todos efficiently', () => {
      const largeTodoList = Array.from({ length: 100 }, (_, i) => ({
        id: i + 1,
        text: `Todo ${i + 1}`,
        completed: i % 2 === 0,
        createdAt: new Date(),
        priority: ['low', 'medium', 'high'][i % 3]
      }))

      const startTime = performance.now()
      render(<TodoList {...mockProps} todos={largeTodoList} />)
      const endTime = performance.now()

      // Should render within reasonable time
      expect(endTime - startTime).toBeLessThan(1000)

      const todoItems = screen.getAllByTestId('todo-item')
      expect(todoItems).toHaveLength(100)
    })

    it('implements virtual scrolling for large lists', () => {
      const largeTodoList = Array.from({ length: 1000 }, (_, i) => ({
        id: i + 1,
        text: `Todo ${i + 1}`,
        completed: false,
        createdAt: new Date(),
        priority: 'medium'
      }))

      render(<TodoList {...mockProps} todos={largeTodoList} virtualScrolling={true} />)

      const virtualContainer = screen.getByTestId('todo-virtual-container')
      expect(virtualContainer).toBeInTheDocument()
      expect(virtualContainer).toHaveClass('todo-list__virtual-container')
    })
  })

  describe('Accessibility', () => {
    it('maintains accessibility in responsive layouts', () => {
      render(<TodoList {...mockProps} />)

      const todoList = screen.getByTestId('todo-list')
      expect(todoList).toHaveAttribute('role', 'list')

      const todoItems = screen.getAllByTestId('todo-item')
      todoItems.forEach(item => {
        expect(item).toHaveAttribute('role', 'listitem')
      })

      // Check ARIA labels
      const filterControls = screen.getByTestId('todo-filter-controls')
      expect(filterControls).toHaveAttribute('aria-label', 'Filter todos')
    })

    it('supports keyboard navigation in responsive design', () => {
      render(<TodoList {...mockProps} />)

      const firstTodo = screen.getAllByTestId('todo-item')[0]
      firstTodo.focus()

      fireEvent.keyDown(firstTodo, { key: 'ArrowDown' })

      // Should handle keyboard navigation properly
      expect(firstTodo).toBeInTheDocument()
    })

    it('provides screen reader support for dynamic content', async () => {
      const { rerender } = render(<TodoList {...mockProps} todos={[]} />)

      // Initially empty
      expect(screen.getByTestId('todo-empty-state')).toBeInTheDocument()

      // Add todos dynamically
      rerender(<TodoList {...mockProps} todos={[mockTodos[0]]} />)

      await waitFor(() => {
        expect(screen.getByTestId('todo-item')).toBeInTheDocument()
        expect(screen.queryByTestId('todo-empty-state')).not.toBeInTheDocument()
      })
    })
  })

  describe('Edge Cases', () => {
    it('handles null todos gracefully', () => {
      render(<TodoList {...mockProps} todos={null} />)

      const emptyState = screen.getByTestId('todo-empty-state')
      expect(emptyState).toBeInTheDocument()
    })

    it('handles todos with missing properties', () => {
      const incompleteTodos = [
        { id: 1, text: 'Incomplete todo' },
        { id: 2, completed: true },
        { id: 3, text: 'Another todo', priority: 'high' }
      ]

      render(<TodoList {...mockProps} todos={incompleteTodos} />)

      const todoItems = screen.getAllByTestId('todo-item')
      expect(todoItems).toHaveLength(3)
    })

    it('handles duplicate todo IDs gracefully', () => {
      const duplicateTodos = [
        { id: 1, text: 'First todo', completed: false },
        { id: 1, text: 'Duplicate todo', completed: true }
      ]

      render(<TodoList {...mockProps} todos={duplicateTodos} />)

      const todoItems = screen.getAllByTestId('todo-item')
      expect(todoItems).toHaveLength(2) // Should render both
    })
  })
})