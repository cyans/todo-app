import React, { useState } from 'react'
import { formatRelativeTime, formatDate, isOverdue } from '../utils/date'
import StatusBadge from './StatusBadge'
import StatusSelector from './StatusSelector'

const TodoItem = ({ todo, onStatusChange, onEdit, onDelete }) => {
  const [isEditingStatus, setIsEditingStatus] = useState(false)

  const handleStatusClick = () => {
    setIsEditingStatus(!isEditingStatus)
  }

  const handleStatusChange = (newStatus) => {
    onStatusChange(todo.id, newStatus)
    setIsEditingStatus(false)
  }

  const getStatusBorderColor = (status) => {
    const colors = {
      todo: 'border-l-gray-400',
      in_progress: 'border-l-blue-500',
      review: 'border-l-yellow-500',
      done: 'border-l-green-500',
      archived: 'border-l-gray-300'
    }
    return colors[status] || colors.todo
  }

  const getPriorityColor = (priority) => {
    const colors = {
      low: 'text-gray-500',
      medium: 'text-yellow-600',
      high: 'text-red-600'
    }
    return colors[priority] || colors.medium
  }

  return (
    <div
      data-testid="todo-item"
      className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow border-l-4 ${getStatusBorderColor(todo.status)}`}
    >
      <div className="flex items-start justify-between">
        {/* Left side - Content */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-medium text-gray-900">{todo.title}</h3>

            {/* Priority indicator */}
            {todo.priority && (
              <span className={`text-xs font-medium ${getPriorityColor(todo.priority)}`}>
                {todo.priority.toUpperCase()} PRIORITY
              </span>
            )}
          </div>

          {/* Description */}
          {todo.description && (
            <p className="text-gray-600 mb-3">{todo.description}</p>
          )}

          {/* Tags */}
          {todo.tags && todo.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {todo.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Metadata */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
            {/* Status */}
            <div className="flex items-center gap-2">
              {isEditingStatus ? (
                <StatusSelector
                  currentStatus={todo.status}
                  onStatusChange={handleStatusChange}
                  className="text-sm"
                />
              ) : (
                <button
                  onClick={handleStatusClick}
                  className="hover:opacity-80 transition-opacity"
                >
                  <StatusBadge status={todo.status} />
                </button>
              )}
            </div>

            {/* Created date */}
            <span>
              Created: {formatRelativeTime(todo.createdAt)}
            </span>

            {/* Due date */}
            {todo.dueDate && (
              <span className={`${isOverdue(todo.dueDate) ? 'text-red-600 font-medium' : ''}`}>
                Due: {formatDate(todo.dueDate)}
                {isOverdue(todo.dueDate) && ' (Overdue)'}
              </span>
            )}
          </div>
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center gap-2 ml-4">
          <button
            onClick={() => onEdit(todo)}
            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
            aria-label="Edit"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>

          <button
            onClick={() => onDelete(todo.id)}
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
            aria-label="Delete"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}

export default TodoItem

// @CODE:FRONTEND-TODO-ITEM-001