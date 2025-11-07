import React, { useEffect, useState } from 'react'
import useTodoStore from '../store/todoStore'
import StatusFilter from './StatusFilter'
import TodoItem from './TodoItem'
import ErrorMessage from './ErrorMessage'
import LoadingSpinner from './LoadingSpinner'
import StatusBadge from './StatusBadge'

const TodoApp = () => {
  const {
    todos,
    loading,
    error,
    statistics,
    activeFilter,
    fetchTodos,
    fetchStatistics,
    updateTodoStatus,
    deleteTodo,
    setActiveFilter,
    clearError
  } = useTodoStore()

  const [editingTodo, setEditingTodo] = useState(null)

  useEffect(() => {
    fetchTodos()
    fetchStatistics()
  }, [fetchTodos, fetchStatistics])

  const handleFilterChange = (filter) => {
    setActiveFilter(filter)
    fetchTodos(filter)
  }

  const handleStatusChange = async (todoId, newStatus) => {
    try {
      await updateTodoStatus(todoId, newStatus, 'Status updated via UI')
      await fetchStatistics() // Refresh statistics
    } catch (error) {
      // Error is handled by the store
    }
  }

  const handleEdit = (todo) => {
    setEditingTodo(todo)
  }

  const handleDelete = async (todoId) => {
    if (window.confirm('Are you sure you want to delete this todo?')) {
      try {
        await deleteTodo(todoId)
        await fetchStatistics() // Refresh statistics
      } catch (error) {
        // Error is handled by the store
      }
    }
  }

  const getFilteredTodos = () => {
    if (!activeFilter) return todos
    return todos.filter(todo => todo.status === activeFilter)
  }

  const filteredTodos = getFilteredTodos()

  if (loading && todos.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            📝 To-Do List
          </h1>
          <p className="text-gray-600">
            Manage your tasks efficiently with status tracking
          </p>
        </header>

        {/* Error Message */}
        {error && (
          <div className="mb-6">
            <ErrorMessage
              error={error}
              onDismiss={clearError}
            />
          </div>
        )}

        {/* Statistics */}
        {statistics && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Statistics</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{statistics.total}</div>
                <div className="text-sm text-gray-600">Total</div>
              </div>
              {Object.entries(statistics.byStatus).map(([status, count]) => (
                <div key={status} className="text-center">
                  <StatusBadge status={status} />
                  <div className="text-2xl font-bold text-gray-900 mt-1">{count}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Status Filter */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Filter by Status</h2>
          <StatusFilter
            onFilterChange={handleFilterChange}
            activeFilter={activeFilter}
            counts={statistics?.byStatus || {}}
          />
        </div>

        {/* Todo List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Tasks ({filteredTodos.length})
            </h2>
            {activeFilter && (
              <button
                onClick={() => handleFilterChange(null)}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Clear Filter
              </button>
            )}
          </div>

          {loading && (
            <div className="flex justify-center py-8">
              <LoadingSpinner />
            </div>
          )}

          {!loading && filteredTodos.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">📋</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks found</h3>
              <p className="text-gray-600">
                {activeFilter
                  ? `No tasks with status "${activeFilter}" found.`
                  : 'Get started by creating your first task.'}
              </p>
            </div>
          )}

          {!loading && filteredTodos.length > 0 && (
            <div className="space-y-4">
              {filteredTodos.map(todo => (
                <TodoItem
                  key={todo.id}
                  todo={todo}
                  onStatusChange={handleStatusChange}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="mt-12 text-center text-gray-500 text-sm">
          <p>Built with React, Tailwind CSS, and ❤️</p>
        </footer>
      </div>
    </div>
  )
}

export default TodoApp

// @CODE:FRONTEND-TODO-APP-001