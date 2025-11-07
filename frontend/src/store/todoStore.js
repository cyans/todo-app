import { create } from 'zustand'
import { todoApi } from '../services/todoApi'

const useTodoStore = create((set, get) => ({
  // State
  todos: [],
  loading: false,
  error: null,
  statistics: null,
  activeFilter: null,

  // Search state
  searchQuery: '',
  searchResults: [],
  searchLoading: false,
  searchError: null,
  searchSuggestions: [],
  searchFilters: {},
  savedSearches: [],
  searchAnalytics: null,

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

  // Search actions
  setSearchQuery: (query) => set({ searchQuery: query }),
  setSearchResults: (results) => set({ searchResults: results }),
  setSearchLoading: (loading) => set({ searchLoading: loading }),
  setSearchError: (error) => set({ searchError: error }),
  setSearchSuggestions: (suggestions) => set({ searchSuggestions: suggestions }),
  setSearchFilters: (filters) => set({ searchFilters: filters }),

  // Search todos with debouncing
  searchTodos: async (query, filters = {}) => {
    set({ searchQuery: query, searchLoading: true, searchError: null })
    try {
      const results = await todoApi.searchTodos(query, filters)
      set({
        searchResults: results,
        searchLoading: false,
        searchFilters: filters
      })
      return results
    } catch (error) {
      set({
        searchError: error.message,
        searchLoading: false,
        searchResults: []
      })
      throw error
    }
  },

  // Get search suggestions
  getSearchSuggestions: async (query) => {
    if (!query || query.length < 2) {
      set({ searchSuggestions: [] })
      return []
    }

    try {
      const suggestions = await todoApi.getSearchSuggestions(query)
      set({ searchSuggestions: suggestions })
      return suggestions
    } catch (error) {
      console.error('Failed to get search suggestions:', error)
      set({ searchSuggestions: [] })
      return []
    }
  },

  // Clear search
  clearSearch: () => set({
    searchQuery: '',
    searchResults: [],
    searchLoading: false,
    searchError: null,
    searchSuggestions: [],
    searchFilters: {}
  }),

  // Save search
  saveSearch: async (searchData) => {
    try {
      const savedSearch = await todoApi.saveSearch(searchData)
      set((state) => ({
        savedSearches: [...state.savedSearches, savedSearch]
      }))
      return savedSearch
    } catch (error) {
      set({ error: error.message })
      throw error
    }
  },

  // Load saved searches
  loadSavedSearches: async () => {
    try {
      const savedSearches = await todoApi.getSavedSearches()
      set({ savedSearches })
      return savedSearches
    } catch (error) {
      set({ error: error.message })
      throw error
    }
  },

  // Delete saved search
  deleteSavedSearch: async (id) => {
    try {
      await todoApi.deleteSavedSearch(id)
      set((state) => ({
        savedSearches: state.savedSearches.filter(search => search.id !== id)
      }))
    } catch (error) {
      set({ error: error.message })
      throw error
    }
  },

  // Load search analytics
  loadSearchAnalytics: async () => {
    try {
      const analytics = await todoApi.getSearchAnalytics()
      set({ searchAnalytics: analytics })
      return analytics
    } catch (error) {
      set({ error: error.message })
      throw error
    }
  },
}))

export default useTodoStore