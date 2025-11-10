import React, { memo, useCallback, useState } from 'react'
import PropTypes from 'prop-types'

// Date formatting utilities
const formatDate = (date) => {
  if (!date) return null

  const todoDate = new Date(date)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  if (todoDate.toDateString() === today.toDateString()) {
    return '오늘'
  } else if (todoDate.toDateString() === yesterday.toDateString()) {
    return '어제'
  } else {
    return todoDate.toLocaleDateString('ko-KR', {
      month: 'short',
      day: 'numeric',
      year: todoDate.getFullYear() !== today.getFullYear() ? '년' : undefined
    })
  }
}

const formatDueDate = (date) => {
  if (!date) return null

  const dueDate = new Date(date)
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  // 시간을 00:00:00으로 설정하여 날짜만 비교
  const todayDateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const dueDateOnly = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate())

  const diffTime = dueDateOnly - todayDateOnly
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return '오늘까지'
  if (diffDays === 1) return '내일'
  if (diffDays === -1) return '어제'
  if (diffDays > 0) return `${diffDays}일 후`
  return `${Math.abs(diffDays)}일 전`
}

const getDueDateStatus = (dueDate) => {
  if (!dueDate) return null

  const today = new Date()
  today.setHours(23, 59, 59, 999)
  const due = new Date(dueDate)

  if (due < today) return 'overdue'
  if (due.toDateString() === today.toDateString()) return 'today'
  if (due <= new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)) return 'soon'
  return 'future'
}

export const TodoItem = memo(({
  todo,
  onToggle,
  onDelete,
  onEdit,
  getPriorityBadge,
  getPriorityLabel,
  viewMode = 'comfortable',
  className = '',
  ...props
}) => {
  const [isEditing, setIsEditing] = useState(false)
  const [editText, setEditText] = useState(todo.text || '')
  const [editTitle, setEditTitle] = useState(todo.text?.split('\n\n')[0] || '')
  const [editDescription, setEditDescription] = useState(todo.text?.split('\n\n').slice(1).join('\n\n') || '')

  // Handle checkbox toggle
  const handleToggle = useCallback(() => {
    onToggle?.(todo.id)
  }, [todo.id, onToggle])

  // Handle delete with confirmation
  const handleDelete = useCallback(() => {
    if (window.confirm(`"${todo.text || '할 일'}"을(를) 삭제하시겠습니까?`)) {
      onDelete?.(todo.id)
    }
  }, [todo.id, todo.text, onDelete])

  // Handle edit mode toggle
  const handleEdit = useCallback(() => {
    if (isEditing) {
      // Save edit
      if (editTitle.trim()) {
        const fullText = editDescription.trim()
          ? `${editTitle.trim()}\n\n${editDescription.trim()}`
          : editTitle.trim()

        onEdit?.(todo.id, {
          text: fullText
        })
        setEditText(fullText)
      }
      setIsEditing(false)
    } else {
      // Start editing
      setIsEditing(true)
      const title = todo.text?.split('\n\n')[0] || ''
      const description = todo.text?.split('\n\n').slice(1).join('\n\n') || ''
      setEditTitle(title)
      setEditDescription(description)
      setEditText(todo.text || '')
    }
  }, [isEditing, todo, editTitle, editDescription, onEdit])

  // Handle edit cancel
  const handleCancel = useCallback(() => {
    setIsEditing(false)
    const title = todo.text?.split('\n\n')[0] || ''
    const description = todo.text?.split('\n\n').slice(1).join('\n\n') || ''
    setEditTitle(title)
    setEditDescription(description)
    setEditText(todo.text || '')
  }, [todo])

  // Handle keyboard interactions
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleEdit()
    } else if (e.key === 'Escape') {
      handleCancel()
    }
  }, [handleEdit, handleCancel])

  const formattedDate = formatDate(todo.createdAt)
  const formattedDueDate = formatDueDate(todo.dueDate)
  const dueDateStatus = getDueDateStatus(todo.dueDate)

  // Determine due date styling
  const getDueDateClass = (status) => {
    switch (status) {
      case 'overdue': return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20'
      case 'today': return 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20'
      case 'soon': return 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20'
      default: return 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50'
    }
  }

  return (
    <div
      data-testid="todo-item"
      className={`
        group relative mb-3 last:mb-0
        ${todo.completed ? 'opacity-75' : ''}
        ${className}
      `}
      {...props}
    >
      <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-lg transition-all duration-200 border border-gray-100 dark:border-gray-700 overflow-hidden ${
        viewMode === 'compact' ? 'py-2 px-3' : 'p-4'
      }`}>
        <div className={viewMode === 'compact' ? '' : 'p-4'}>
          <div className={`flex items-center ${viewMode === 'compact' ? 'gap-2 sm:gap-3' : 'gap-3 sm:gap-4'}`}>
            {/* Checkbox */}
            <div className={`flex-shrink-0 ${viewMode === 'compact' ? 'mr-1 sm:mr-2' : 'mr-2 sm:mr-3'}`}>
              <div className="relative group">
                <input
                  type="checkbox"
                  checked={todo.completed}
                  onChange={handleToggle}
                  className="w-6 h-6 text-blue-600 border-2 border-gray-300 rounded-sm cursor-pointer
                           focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                           transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50
                           opacity-0 absolute"
                  aria-label={`Mark ${todo.text} as ${todo.completed ? 'incomplete' : 'complete'}`}
                  disabled={isEditing}
                />
                {/* Google Tasks style custom checkbox */}
                <div
                  className="cursor-pointer
                              transition-all duration-200 ease-in-out
                              flex items-center justify-center
                              hover:border-blue-500 group-hover:bg-blue-50"
                onClick={handleToggle}
                style={{
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  borderWidth: '1.5px',
                  borderStyle: 'solid',
                  borderColor: todo.completed ? '#2563eb' : '#d1d5db',
                  backgroundColor: todo.completed ? '#2563eb' : '#ffffff',
                  boxSizing: 'border-box',
                  boxShadow: `0 0 0 0.5px ${todo.completed ? '#2563eb' : '#d1d5db'}`
                }}
              >
                  {/* Checkmark - visible on completed or hover */}
                  <div className={`
                    transition-all duration-200 ease-in-out
                    ${todo.completed ? 'opacity-100 scale-100' : 'opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100'}
                  `}>
                    <svg className="text-white" viewBox="0 0 20 20" fill="currentColor" style={{ width: '10px', height: '10px' }}>
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                {/* Tooltip */}
                <div className={`
                  absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-gray-900 text-white text-xs rounded-lg
                  opacity-0 pointer-events-none transition-all duration-200 ease-in-out
                  whitespace-nowrap z-50
                  ${!isEditing ? 'group-hover:opacity-100' : ''}
                `}>
                  <div className="relative">
                    {todo.completed ? '완료됨' : '완료 표시'}
                    {/* Tooltip arrow */}
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                      <div className="border-4 border-transparent border-t-gray-900"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 pr-4">
              {isEditing ? (
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="flex-1 space-y-3">
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="할 일 제목..."
                        className="w-full px-4 py-3 text-base font-medium bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl
                                 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400
                                 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        autoFocus
                      />
                      <textarea
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="세부내역 (선택사항)..."
                        rows={editDescription ? '3' : '1'}
                        className="w-full px-4 py-3 text-base bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl
                                 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400
                                 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all duration-200"
                      />
                    </div>
                    <div className="flex flex-col gap-2 flex-shrink-0 pt-1">
                      <button
                        onClick={handleEdit}
                        className="p-2.5 text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300
                                 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-xl transition-all duration-200"
                        title="저장"
                      >
                        ✅
                      </button>
                      <button
                        onClick={handleCancel}
                        className="p-2.5 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200
                                 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl transition-all duration-200"
                        title="취소"
                      >
                        ❌
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className={viewMode === 'compact' ? 'space-y-1' : 'space-y-3'}>
                  <div>
                    <p
                      className={`
                        ${viewMode === 'compact' ? 'text-sm font-medium' : 'text-base font-semibold'} text-gray-900 dark:text-white break-words leading-tight
                        ${todo.completed ? 'line-through text-gray-500 dark:text-gray-400' : ''}
                      `}
                      data-testid="todo-title"
                    >
                      {todo.text?.split('\n\n')[0] || '제목 없음'}
                    </p>
                    {todo.text && todo.text.includes('\n\n') && (
                      <p
                        className={`
                          ${viewMode === 'compact' ? 'text-xs' : 'text-sm'} text-gray-600 dark:text-gray-400 ${viewMode === 'compact' ? 'mt-1' : 'mt-2'} break-words whitespace-pre-wrap leading-relaxed
                          ${todo.completed ? 'line-through text-gray-500 dark:text-gray-400' : ''}
                        `}
                      >
                        {todo.text.split('\n\n').slice(1).join('\n\n')}
                      </p>
                    )}
                  </div>

                  {/* Metadata */}
                  <div className={`flex flex-wrap items-center ${viewMode === 'compact' ? 'gap-1' : 'gap-2'}`}>
                    {formattedDueDate ? (
                      <span className={`inline-flex items-center gap-1 ${viewMode === 'compact' ? 'px-2 py-1' : 'px-3 py-1.5'} rounded-lg ${viewMode === 'compact' ? 'text-xs' : 'text-xs'} font-semibold whitespace-nowrap ${getDueDateClass(dueDateStatus)}`}>
                        <span>📅</span>
                        <span>{formattedDueDate}</span>
                      </span>
                    ) : (
                      <span className={`inline-flex items-center gap-1 ${viewMode === 'compact' ? 'px-2 py-1' : 'px-3 py-1.5'} rounded-lg ${viewMode === 'compact' ? 'text-xs' : 'text-xs'} font-semibold whitespace-nowrap text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700`}>
                        <span>📅</span>
                        <span>마감일 없음</span>
                      </span>
                    )}
                    {todo.priority && (
                      <span className={`inline-flex items-center gap-1 ${viewMode === 'compact' ? 'px-2 py-1' : 'px-3 py-1.5'} rounded-lg ${viewMode === 'compact' ? 'text-xs' : 'text-xs'} font-semibold whitespace-nowrap ${getPriorityBadge?.(todo.priority)}`}>
                        <span>{todo.priority === 'high' ? '🔥' : todo.priority === 'medium' ? '⚡' : '💡'}</span>
                        <span>{getPriorityLabel?.(todo.priority) || todo.priority}</span>
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Action buttons */}
            {!isEditing && (
              <div className={`flex items-center gap-1 sm:gap-2 flex-shrink-0 ${viewMode === 'compact' ? 'ml-1 sm:ml-2' : 'ml-2 sm:ml-3'}`}>
                {!todo.completed && (
                  <button
                    onClick={handleEdit}
                    className={`${viewMode === 'compact' ? 'p-1.5 w-7 h-7 sm:w-6 sm:h-6' : 'p-2 w-8 h-8 sm:w-8 sm:h-8'} text-gray-400 hover:text-blue-600 dark:hover:text-blue-400
                             hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-all duration-200 flex items-center justify-center text-sm sm:text-base`}
                    aria-label={`Edit ${todo.text}`}
                    title="내용 수정하기"
                  >
                    ✍️
                  </button>
                )}
                <button
                  onClick={handleDelete}
                  className={`${viewMode === 'compact' ? 'p-1.5 w-7 h-7 sm:w-6 sm:h-6' : 'p-2 w-8 h-8 sm:w-8 sm:h-8'} text-gray-400 hover:text-red-600 dark:hover:text-red-400
                           hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-all duration-200 flex items-center justify-center text-sm sm:text-base`}
                  aria-label={`Delete ${todo.text}`}
                  title="할 일 삭제하기"
                >
                  🗑️
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
})

TodoItem.displayName = 'TodoItem'

TodoItem.propTypes = {
  todo: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    text: PropTypes.string.isRequired,
    completed: PropTypes.bool,
    createdAt: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
    priority: PropTypes.oneOf(['low', 'medium', 'high'])
  }).isRequired,
  onToggle: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
  className: PropTypes.string
}

TodoItem.defaultProps = {
  todo: {
    completed: false,
    createdAt: null,
    priority: null
  },
  className: ''
}