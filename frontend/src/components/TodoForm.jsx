import { useState } from 'react'

// @CODE:TODO-FORM-001
function TodoForm({ onAddTodo }) {
  const [text, setText] = useState('')
  const [priority, setPriority] = useState('medium')
  const [description, setDescription] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!text.trim()) {
      return
    }

    setIsSubmitting(true)
    try {
      await onAddTodo({
        text: text.trim(),
        priority,
        description: description.trim(),
        dueDate: dueDate || null
      })

      // Reset form
      setText('')
      setDescription('')
      setDueDate('')
      setPriority('medium')
    } catch (error) {
      console.error('Error adding todo:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  
  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Main Task Input */}
      <div className="relative">
        <label htmlFor="todo-text" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Task Title
        </label>
        <input
          id="todo-text"
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="input-modern"
          placeholder="What needs to be done?"
          disabled={isSubmitting}
          autoComplete="off"
        />
      </div>

      {/* Second Row: Description and Priority */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="relative">
          <label htmlFor="todo-description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Description (optional)
          </label>
          <input
            id="todo-description"
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="input-modern"
            placeholder="Add more details about this task"
            disabled={isSubmitting}
            autoComplete="off"
          />
        </div>

        <div className="relative">
          <label htmlFor="todo-priority" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Priority Level
          </label>
          <div className="relative">
            <select
              id="todo-priority"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="input-modern appearance-none cursor-pointer pr-10"
              disabled={isSubmitting}
            >
              <option value="low">🟢 Low Priority</option>
              <option value="medium">🟡 Medium Priority</option>
              <option value="high">🔴 High Priority</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Third Row: Due Date */}
      <div className="relative">
        <label htmlFor="todo-dueDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Due Date (optional)
        </label>
        <input
          id="todo-dueDate"
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="input-modern"
          min={new Date().toISOString().split('T')[0]}
          disabled={isSubmitting}
        />
      </div>

      {/* Action Row: Priority Indicator and Submit Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2">
        <div className="text-sm text-gray-500">
          {text.trim() && (
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <span className="flex items-center">
                <span className="inline-block w-2 h-2 rounded-full mr-2 priority-badge"
                      style={{
                        background: priority === 'high' ? 'var(--color-error-500)' :
                                    priority === 'medium' ? 'var(--color-warning-500)' :
                                    'var(--color-success-500)'
                      }}></span>
                {priority.charAt(0).toUpperCase() + priority.slice(1)} priority
              </span>
              {dueDate && (
                <span className="flex items-center text-blue-600 dark:text-blue-400">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {new Date(dueDate).toLocaleDateString()}
                </span>
              )}
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={!text.trim() || isSubmitting}
          className="btn-primary px-8 py-3 min-w-[140px] flex items-center justify-center space-x-2"
        >
          {isSubmitting ? (
            <>
              <div className="loading-spinner w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Adding...</span>
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>Add Todo</span>
            </>
          )}
        </button>
      </div>
    </form>
  )
}

export default TodoForm