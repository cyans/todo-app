import { useState, useEffect } from 'react'
import TodoItem from './TodoItem'

// @CODE:TODO-LIST-001
function TodoList({ todos, onToggleComplete, onUpdateTodo, onDeleteTodo, loading = false, error = null }) {
  const [animatedProgress, setAnimatedProgress] = useState(0)
  const [isHoveringStats, setIsHoveringStats] = useState(false)

  // Group todos by completion status
  const activeTodos = todos.filter(todo => !todo.completed)
  const completedTodos = todos.filter(todo => todo.completed)
  const progressPercentage = todos.length > 0 ? Math.round((completedTodos.length / todos.length) * 100) : 0

  // Animate progress on mount and when todos change
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedProgress(progressPercentage)
    }, 300)
    return () => clearTimeout(timer)
  }, [progressPercentage])

  // Loading state
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="loading-spinner mb-6" role="status" aria-label="Loading todos">
          <span className="sr-only">Loading your todos...</span>
        </div>
        <p className="text-gray-600 dark:text-gray-400 font-medium">
          Loading your tasks...
        </p>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="card-modern p-8 border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/10">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-red-900 dark:text-red-100 mb-2">
              Something went wrong
            </h3>
            <p className="text-red-700 dark:text-red-300 mb-4">
              {error.message || 'Unable to load your todos. Please try again.'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200 text-sm font-medium"
              aria-label="Retry loading todos"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Enhanced empty state
  if (todos.length === 0) {
    return (
      <div className="empty-state card-modern empty-state-mobile border-2 border-dashed border-gray-200 dark:border-gray-700 bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900" role="main" aria-label="Empty todo list">
        <div className="empty-state-icon mb-6 relative empty-state-icon-bounce">
          {/* Animated background circle */}
          <div className="absolute inset-0 w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 empty-state-pulse-bg" />

          {/* Main icon */}
          <svg
            className="relative mx-auto h-16 w-16 text-blue-500 dark:text-blue-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
            />
          </svg>

          {/* Floating checkmark animation */}
          <svg
            className="absolute top-0 right-8 w-8 h-8 text-green-500 animate-bounce"
            fill="currentColor"
            viewBox="0 0 20 20"
            aria-hidden="true"
          >
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </div>

        <h2 className="empty-state-title text-2xl font-bold text-gray-800 dark:text-gray-200 mb-3">
          Ready to get organized?
        </h2>

        <p className="empty-state-description text-lg text-gray-600 dark:text-gray-400 mb-6 leading-relaxed max-w-md mx-auto">
          Your todo list is empty. Start adding tasks to boost your productivity and track your progress!
        </p>

        <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
          <button
            onClick={() => document.querySelector('[data-testid="todo-input"], [placeholder*="Add"], input[placeholder*="task"]')?.focus()}
            className="btn-primary px-8 py-4 text-base font-medium shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 w-full sm:w-auto"
            aria-label="Add your first todo"
          >
            <span className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Your First Task
            </span>
          </button>

          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 order-first sm:order-last">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Press Enter to add quickly
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Progress Overview Section */}
      <div
        className="card-modern p-6 progress-overview-mobile bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800 transition-all duration-300 hover:shadow-lg"
        onMouseEnter={() => setIsHoveringStats(true)}
        onMouseLeave={() => setIsHoveringStats(false)}
        role="region"
        aria-labelledby="progress-overview-title"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 id="progress-overview-title" className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Progress Overview
          </h3>

          <div className={`flex items-center gap-2 transition-transform duration-300 ${isHoveringStats ? 'scale-105' : ''}`}>
            <span className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              {animatedProgress}%
            </span>
            <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">
              Complete
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4" role="progressbar" aria-valuenow={animatedProgress} aria-valuemin="0" aria-valuemax="100" aria-label={`Progress: ${animatedProgress}% complete`}>
          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
            <span>{completedTodos.length} completed</span>
            <span>{activeTodos.length} remaining</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden progress-shimmer">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-700 ease-out relative overflow-hidden"
              style={{ width: `${animatedProgress}%` }}
              aria-hidden="true"
            >
              {/* Animated shimmer effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4 text-center progress-stats-mobile" role="group" aria-label="Task statistics">
          <div className="bg-white dark:bg-gray-800/50 rounded-lg p-3 border border-gray-200 dark:border-gray-700 stats-card-hover">
            <div className="text-2xl font-bold text-gray-900 dark:text-white" aria-label={`Total tasks: ${todos.length}`}>{todos.length}</div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Total Tasks</div>
          </div>
          <div className="bg-white dark:bg-gray-800/50 rounded-lg p-3 border border-gray-200 dark:border-gray-700 stats-card-hover">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400" aria-label={`In progress: ${activeTodos.length}`}>{activeTodos.length}</div>
            <div className="text-xs text-gray-600 dark:text-gray-400">In Progress</div>
          </div>
          <div className="bg-white dark:bg-gray-800/50 rounded-lg p-3 border border-gray-200 dark:border-gray-700 stats-card-hover">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400" aria-label={`Completed: ${completedTodos.length}`}>{completedTodos.length}</div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Completed</div>
          </div>
        </div>
      </div>

      {/* Active Todos Section */}
      {activeTodos.length > 0 && (
        <div className="transition-all duration-500 ease-in-out" role="region" aria-labelledby="active-todos-title">
          <div className="flex items-center justify-between mb-6 section-header-mobile">
            <h2 id="active-todos-title" className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center" aria-hidden="true">
                <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              Active Tasks
              <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full text-sm font-semibold" aria-label={`${activeTodos.length} active tasks`}>
                {activeTodos.length}
              </span>
            </h2>

            {/* Priority distribution for active tasks */}
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400" role="group" aria-label="Priority distribution">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-red-500" aria-hidden="true"></div>
                <span aria-label={`High priority: ${activeTodos.filter(t => t.priority === 'high').length}`}>{activeTodos.filter(t => t.priority === 'high').length}</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-amber-500" aria-hidden="true"></div>
                <span aria-label={`Medium priority: ${activeTodos.filter(t => t.priority === 'medium').length}`}>{activeTodos.filter(t => t.priority === 'medium').length}</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-emerald-500" aria-hidden="true"></div>
                <span aria-label={`Low priority: ${activeTodos.filter(t => t.priority === 'low').length}`}>{activeTodos.filter(t => t.priority === 'low').length}</span>
              </div>
            </div>
          </div>

          <ul className="space-y-3 transition-all duration-300" role="list" aria-label="Active tasks">
            {activeTodos.map((todo, index) => (
              <li
                key={todo._id}
                className="transform transition-all duration-500 ease-out todo-item-mobile"
                style={{
                  animationDelay: `${index * 100}ms`,
                  animation: 'slideInUp 0.5s ease-out forwards'
                }}
              >
                <TodoItem
                  todo={todo}
                  onToggleComplete={onToggleComplete}
                  onUpdateTodo={onUpdateTodo}
                  onDeleteTodo={onDeleteTodo}
                />
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Completed Todos Section */}
      {completedTodos.length > 0 && (
        <div className="transition-all duration-500 ease-in-out" role="region" aria-labelledby="completed-todos-title">
          <div className="flex items-center justify-between mb-6 section-header-mobile">
            <h2 id="completed-todos-title" className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center" aria-hidden="true">
                <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              Completed Tasks
              <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-3 py-1 rounded-full text-sm font-semibold" aria-label={`${completedTodos.length} completed tasks`}>
                {completedTodos.length}
              </span>
            </h2>

            <button
              onClick={() => {
                if (window.confirm(`Clear all ${completedTodos.length} completed tasks?`)) {
                  completedTodos.forEach(todo => onDeleteTodo(todo._id))
                }
              }}
              className="text-sm text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors duration-200 font-medium"
              aria-label="Clear all completed tasks"
            >
              Clear All
            </button>
          </div>

          <ul className="space-y-3 opacity-75 transition-all duration-300" role="list" aria-label="Completed tasks">
            {completedTodos.map((todo, index) => (
              <li
                key={todo._id}
                className="transform transition-all duration-500 ease-out todo-item-mobile"
                style={{
                  animationDelay: `${index * 50}ms`,
                  animation: 'slideInUp 0.5s ease-out forwards'
                }}
              >
                <TodoItem
                  todo={todo}
                  onToggleComplete={onToggleComplete}
                  onUpdateTodo={onUpdateTodo}
                  onDeleteTodo={onDeleteTodo}
                />
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

export default TodoList