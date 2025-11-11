import { useState } from 'react'

// @CODE:TODO-ITEM-001
function TodoItem({ todo, onToggleComplete, onUpdateTodo, onDeleteTodo }) {
  const [isEditing, setIsEditing] = useState(false)
  const [editText, setEditText] = useState(todo.text)
  const [editDescription, setEditDescription] = useState(todo.description || '')
  const [editPriority, setEditPriority] = useState(todo.priority || 'medium')

  const handleToggleComplete = () => {
    onToggleComplete(todo._id, !todo.completed)
  }

  const handleSaveEdit = () => {
    if (editText.trim()) {
      onUpdateTodo(todo._id, {
        text: editText.trim(),
        description: editDescription.trim(),
        priority: editPriority
      })
      setIsEditing(false)
    }
  }

  const handleCancelEdit = () => {
    setEditText(todo.text)
    setEditDescription(todo.description || '')
    setEditPriority(todo.priority || 'medium')
    setIsEditing(false)
  }

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this todo?')) {
      onDeleteTodo(todo._id)
    }
  }

  
  const getPriorityStripeClass = (priority) => {
    switch (priority) {
      case 'high':
        return 'priority-high'
      case 'medium':
        return 'priority-medium'
      case 'low':
        return 'priority-low'
      default:
        return 'priority-medium'
    }
  }

  const getPriorityBadgeClass = (priority) => {
    switch (priority) {
      case 'high':
        return 'priority-badge high'
      case 'medium':
        return 'priority-badge medium'
      case 'low':
        return 'priority-badge low'
      default:
        return 'priority-badge'
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return ''
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  return (
    <li className="card-modern todo-card-hover relative group">
      {/* Priority Stripe */}
      <div
        className={`priority-stripe ${getPriorityStripeClass(todo.priority)} rounded-l-xl`}
        aria-hidden="true"
      />

      <div className="flex items-start gap-4 p-6 pl-8 relative">
        {/* Modern Checkbox */}
        <div className="pt-1 flex-shrink-0">
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={handleToggleComplete}
              className="checkbox-modern sr-only"
              aria-label={`Mark "${todo.text}" as ${todo.completed ? 'incomplete' : 'complete'}`}
            />
            <div className={`checkbox-modern checkbox-animation ${todo.completed ? 'checked' : ''}`}>
              <span
                className={`block w-full h-full rounded border-2 transition-all duration-200 ${
                  todo.completed
                    ? 'bg-gradient-to-br from-blue-500 to-blue-600 border-blue-600'
                    : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 hover:border-blue-400'
                }`}
              >
                <svg
                  className={`w-3 h-3 mx-auto transition-all duration-200 ${
                    todo.completed ? 'opacity-100 translate-y-0.5' : 'opacity-0 -translate-y-0.5'
                  }`}
                  fill="white"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </span>
            </div>
          </label>
        </div>

        {/* Todo Content */}
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <div className="space-y-4">
              <input
                type="text"
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                className="input-modern focus-ring-primary"
                placeholder="Task title..."
                aria-label="Task title"
              />
              <textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                placeholder="Description (optional)"
                rows={3}
                className="input-modern focus-ring-primary resize-none"
                aria-label="Task description"
              />
              <select
                value={editPriority}
                onChange={(e) => setEditPriority(e.target.value)}
                className="input-modern focus-ring-primary cursor-pointer"
                aria-label="Task priority"
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
              </select>
              <div className="flex gap-3">
                <button
                  onClick={handleSaveEdit}
                  className="btn-primary text-sm px-4 py-2"
                  aria-label="Save changes"
                >
                  Save
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
                  aria-label="Cancel editing"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <h3 className={`todo-complete text-lg font-medium transition-all duration-300 ${
                    todo.completed ? 'completed' : ''
                  } ${!todo.completed ? 'text-gray-900 dark:text-white' : ''}`}>
                    {todo.text}
                  </h3>
                  <span className={`priority-badge ${getPriorityBadgeClass(todo.priority)} flex-shrink-0`}>
                    {todo.priority}
                  </span>
                </div>
              </div>

              {todo.description && (
                <p className={`todo-complete transition-all duration-300 mb-4 ${
                  todo.completed ? 'completed' : 'text-gray-600 dark:text-gray-400'
                }`}>
                  {todo.description}
                </p>
              )}

              <div className={`space-y-2 text-sm ${
                todo.completed ? 'opacity-60' : 'text-gray-500 dark:text-gray-400'
              }`}>
                <div className="flex items-center gap-4 flex-wrap">
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Created: {formatDate(todo.createdAt)}
                  </span>
                  {todo.updatedAt && todo.updatedAt !== todo.createdAt && (
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Updated: {formatDate(todo.updatedAt)}
                    </span>
                  )}
                </div>
                {todo.dueDate && (
                  <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400 font-medium">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Due: {formatDate(todo.dueDate)}
                  </span>
                )}
              </div>

              <div className="flex gap-3 mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-3 py-1.5 text-sm font-medium text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200 hover:scale-105 active:scale-95"
                  aria-label="Edit task"
                >
                  <span className="flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit
                  </span>
                </button>
                <button
                  onClick={handleDelete}
                  className="px-3 py-1.5 text-sm font-medium text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/20 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/30 transition-all duration-200 hover:scale-105 active:scale-95"
                  aria-label="Delete task"
                >
                  <span className="flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Delete
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </li>
  )
}

export default TodoItem