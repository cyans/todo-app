import React, { memo, useCallback } from 'react'
import PropTypes from 'prop-types'
import { TodoItem } from './TodoItem'

export const TodoList = memo(({
  todos = [],
  onToggle,
  onDelete,
  onEdit,
  loading = false,
  viewMode = 'comfortable',
  className = '',
  ...props
}) => {
  // Handle todo item actions
  const handleTodoToggle = useCallback((todoId) => {
    onToggle?.(todoId)
  }, [onToggle])

  const handleTodoDelete = useCallback((todoId) => {
    onDelete?.(todoId)
  }, [onDelete])

  const handleTodoEdit = useCallback((todoId, updatedData) => {
    onEdit?.(todoId, updatedData)
  }, [onEdit])

  // Get priority badge styles
  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
      case 'low':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
    }
  }

  const getPriorityLabel = (priority) => {
    switch (priority) {
      case 'high': return '🔴 높음'
      case 'medium': return '🟡 보통'
      case 'low': return '🟢 낮음'
      default: return '보통'
    }
  }

  return (
    <div
      data-testid="todo-list"
      className={`space-y-3 ${className}`}
      {...props}
    >
      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-lg font-medium">할 일을 불러오는 중...</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && todos.length === 0 && (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">📝</div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            아직 할 일이 없어요
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            위에 새로운 할 일을 추가해보세요!
          </p>
        </div>
      )}

      {/* Todo Items */}
      {!loading && todos.length > 0 && (
        <div className={viewMode === 'compact' ? 'space-y-1' : 'space-y-3'}>
          {todos.map((todo, index) => (
            <TodoItem
              key={todo.id || `todo-${index}`}
              todo={todo}
              onToggle={handleTodoToggle}
              onDelete={handleTodoDelete}
              onEdit={handleTodoEdit}
              getPriorityBadge={getPriorityBadge}
              getPriorityLabel={getPriorityLabel}
              viewMode={viewMode}
            />
          ))}
        </div>
      )}
    </div>
  )
})

TodoList.displayName = 'TodoList'

TodoList.propTypes = {
  todos: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      text: PropTypes.string,
      completed: PropTypes.bool,
      createdAt: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
      priority: PropTypes.oneOf(['low', 'medium', 'high'])
    })
  ),
  onToggle: PropTypes.func,
  onDelete: PropTypes.func,
  onEdit: PropTypes.func,
  loading: PropTypes.bool,
  error: PropTypes.string,
  filter: PropTypes.oneOf(['all', 'active', 'completed']),
  sortBy: PropTypes.oneOf(['created', 'priority', 'text']),
  virtualScrolling: PropTypes.bool,
  itemsPerPage: PropTypes.number,
  currentPage: PropTypes.number,
  onPageChange: PropTypes.func,
  className: PropTypes.string
}

TodoList.defaultProps = {
  todos: [],
  loading: false,
  error: null,
  filter: 'all',
  sortBy: 'created',
  virtualScrolling: false,
  itemsPerPage: 10,
  currentPage: 1,
  className: ''
}