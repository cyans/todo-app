import { useState } from 'react'

// @CODE:TODO-FORM-001
function TodoForm({ onAddTodo }) {
  const [text, setText] = useState('')
  const [priority, setPriority] = useState('medium')
  const [description, setDescription] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isFocused, setIsFocused] = useState({
    text: false,
    description: false
  })

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
        description: description.trim()
      })

      // Reset form
      setText('')
      setDescription('')
      setPriority('medium')
      setIsFocused({ text: false, description: false })
    } catch (error) {
      console.error('Error adding todo:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field, value) => {
    switch (field) {
      case 'text':
        setText(value)
        break
      case 'description':
        setDescription(value)
        break
      default:
        break
    }
  }

  const handleFocus = (field) => {
    setIsFocused(prev => ({ ...prev, [field]: true }))
  }

  const handleBlur = (field) => {
    const value = field === 'text' ? text : description
    if (!value.trim()) {
      setIsFocused(prev => ({ ...prev, [field]: false }))
    }
  }

  const isTextActive = isFocused.text || text.trim()
  const isDescriptionActive = isFocused.description || description.trim()

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="relative">
        <label
          htmlFor="todo-text"
          className={`floating-label ${isTextActive ? 'active' : ''}`}
        >
          What needs to be done?
        </label>
        <input
          id="todo-text"
          type="text"
          value={text}
          onChange={(e) => handleInputChange('text', e.target.value)}
          onFocus={() => handleFocus('text')}
          onBlur={() => handleBlur('text')}
          className="input-modern pt-6"
          placeholder=""
          disabled={isSubmitting}
          autoComplete="off"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

        <div className="relative">
          <label
            htmlFor="todo-description"
            className={`floating-label ${isDescriptionActive ? 'active' : ''}`}
          >
            Description (optional)
          </label>
          <input
            id="todo-description"
            type="text"
            value={description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            onFocus={() => handleFocus('description')}
            onBlur={() => handleBlur('description')}
            className="input-modern pt-6"
            placeholder=""
            disabled={isSubmitting}
            autoComplete="off"
          />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-500">
          {text.trim() && (
            <span className="flex items-center">
              <span className="inline-block w-2 h-2 rounded-full mr-2 priority-badge"
                    style={{
                      background: priority === 'high' ? 'var(--color-error-500)' :
                                  priority === 'medium' ? 'var(--color-warning-500)' :
                                  'var(--color-success-500)'
                    }}></span>
              {priority.charAt(0).toUpperCase() + priority.slice(1)} priority
            </span>
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