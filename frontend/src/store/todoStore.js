import { create } from 'zustand'
import { todoApi } from '../services/todoApi'

const useTodoStore = create((set, get) => ({
  // State
  todos: [],
  loading: false,
  error: null,
  statistics: null,
  activeFilter: null,

  // Actions
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),

  // Fetch todos
  fetchTodos: async (statusFilter = null) => {
    set({ loading: true, error: null })
    try {
      const todos = statusFilter
        ? await todoApi.getTodosByStatus(statusFilter)
        : await todoApi.getAllTodos()
      set({ todos, loading: false })
    } catch (error) {
      set({ error: error.message, loading: false })
    }
  },

  // Fetch statistics
  fetchStatistics: async () => {
    try {
      const statistics = await todoApi.getStatistics()
      set({ statistics })
    } catch (error) {
      set({ error: error.message })
    }
  },

  // Create todo
  createTodo: async (todoData) => {
    set({ loading: true, error: null })
    try {
      const newTodo = await todoApi.createTodo(todoData)
      set((state) => ({
        todos: [newTodo, ...state.todos],
        loading: false
      }))
      return newTodo
    } catch (error) {
      set({ error: error.message, loading: false })
      throw error
    }
  },

  // Update todo
  updateTodo: async (id, todoData) => {
    set({ loading: true, error: null })
    try {
      const updatedTodo = await todoApi.updateTodo(id, todoData)
      set((state) => ({
        todos: state.todos.map(todo =>
          todo.id === id ? updatedTodo : todo
        ),
        loading: false
      }))
      return updatedTodo
    } catch (error) {
      set({ error: error.message, loading: false })
      throw error
    }
  },

  // Update todo status
  updateTodoStatus: async (id, status, reason = '') => {
    set({ loading: true, error: null })
    try {
      const updatedTodo = await todoApi.updateTodoStatus(id, status, reason)
      set((state) => ({
        todos: state.todos.map(todo =>
          todo.id === id ? updatedTodo : todo
        ),
        loading: false
      }))
      return updatedTodo
    } catch (error) {
      set({ error: error.message, loading: false })
      throw error
    }
  },

  // Delete todo
  deleteTodo: async (id) => {
    set({ loading: true, error: null })
    try {
      await todoApi.deleteTodo(id)
      set((state) => ({
        todos: state.todos.filter(todo => todo.id !== id),
        loading: false
      }))
    } catch (error) {
      set({ error: error.message, loading: false })
      throw error
    }
  },

  // Set filter
  setActiveFilter: (filter) => set({ activeFilter: filter }),

  // Clear error
  clearError: () => set({ error: null }),

  // Get filtered todos
  getFilteredTodos: () => {
    const { todos, activeFilter } = get()
    if (!activeFilter) return todos
    return todos.filter(todo => todo.status === activeFilter)
  },

  // Get todo by id
  getTodoById: (id) => {
    const { todos } = get()
    return todos.find(todo => todo.id === id)
  },
}))

export default useTodoStore