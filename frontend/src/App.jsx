import { useState, useEffect } from 'react'
import { todoApi } from './services/api'
import TodoForm from './components/TodoForm'
import TodoList from './components/TodoList'
import TodoFilter from './components/TodoFilter'

// @CODE:TODO-MAIN-001
function App() {
  const [todos, setTodos] = useState([])
  const [filter, setFilter] = useState('all')
  const [sortBy, setSortBy] = useState('created')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Load todos on component mount
  useEffect(() => {
    loadTodos()
  }, [filter, sortBy])

  const loadTodos = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await todoApi.getAll(filter, sortBy)
      setTodos(response.todos || [])
    } catch (err) {
      setError('Failed to load todos. Please try again.')
      console.error('Error loading todos:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleAddTodo = async (todoData) => {
    try {
      const newTodo = await todoApi.create(todoData)
      setTodos(prev => [newTodo, ...prev])
    } catch (err) {
      setError('Failed to add todo. Please try again.')
      console.error('Error adding todo:', err)
    }
  }

  const handleUpdateTodo = async (id, updateData) => {
    try {
      const updatedTodo = await todoApi.update(id, updateData)
      setTodos(prev => prev.map(todo =>
        todo._id === id ? updatedTodo : todo
      ))
    } catch (err) {
      setError('Failed to update todo. Please try again.')
      console.error('Error updating todo:', err)
    }
  }

  const handleDeleteTodo = async (id) => {
    try {
      await todoApi.delete(id)
      setTodos(prev => prev.filter(todo => todo._id !== id))
    } catch (err) {
      setError('Failed to delete todo. Please try again.')
      console.error('Error deleting todo:', err)
    }
  }

  const handleToggleComplete = async (id, completed) => {
    try {
      const updatedTodo = await todoApi.toggle(id, completed)
      setTodos(prev => prev.map(todo =>
        todo._id === id ? updatedTodo : todo
      ))
    } catch (err) {
      setError('Failed to update todo status. Please try again.')
      console.error('Error toggling todo:', err)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            📝 To-Do List
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your tasks efficiently
          </p>
        </header>

        <main className="max-w-4xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
            <TodoForm onAddTodo={handleAddTodo} />
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
            <TodoFilter
              filter={filter}
              sortBy={sortBy}
              onFilterChange={setFilter}
              onSortChange={setSortBy}
            />
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            {loading ? (
              <div className="text-center py-8">
                <p className="text-gray-600 dark:text-gray-300">Loading todos...</p>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 rounded border border-red-200 dark:border-red-800">
                  <p className="text-red-800 dark:text-red-300">{error}</p>
                </div>
                <button
                  onClick={loadTodos}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                >
                  Retry
                </button>
              </div>
            ) : (
              <TodoList
                todos={todos}
                onToggleComplete={handleToggleComplete}
                onUpdateTodo={handleUpdateTodo}
                onDeleteTodo={handleDeleteTodo}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  )
}

export default App
