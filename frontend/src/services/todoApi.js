import axios from 'axios'

// Configure axios defaults
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor for error handling
api.interceptors.request.use(
  (config) => {
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ECONNABORTED') {
      throw new Error('Request timeout. Please check your connection.')
    }
    if (error.response) {
      const message = error.response.data?.message || 'Server error occurred'
      throw new Error(message)
    } else if (error.request) {
      throw new Error('Network error. Please check your connection.')
    } else {
      throw new Error('An unexpected error occurred.')
    }
  }
)

// Todo API service
export const todoApi = {
  // Get all todos
  async getAllTodos() {
    const response = await api.get('/todos')
    return response.data
  },

  // Get todos by status
  async getTodosByStatus(status) {
    const response = await api.get(`/todos/status/${status}`)
    return response.data
  },

  // Get single todo
  async getTodo(id) {
    const response = await api.get(`/todos/${id}`)
    return response.data
  },

  // Create todo
  async createTodo(todoData) {
    const response = await api.post('/todos', todoData)
    return response.data
  },

  // Update todo
  async updateTodo(id, todoData) {
    const response = await api.put(`/todos/${id}`, todoData)
    return response.data
  },

  // Update todo status
  async updateTodoStatus(id, status, reason = '') {
    const response = await api.patch(`/todos/${id}/status`, { status, reason })
    return response.data
  },

  // Delete todo
  async deleteTodo(id) {
    const response = await api.delete(`/todos/${id}`)
    return response.data
  },

  // Get todo statistics
  async getStatistics() {
    const response = await api.get('/todos/statistics')
    return response.data
  },

  // Get todo status history
  async getStatusHistory(id) {
    const response = await api.get(`/todos/${id}/history`)
    return response.data
  },

  // Search todos
  async searchTodos(query, filters = {}) {
    const params = new URLSearchParams()
    if (query) params.append('q', query)
    if (filters.status) params.append('status', filters.status)
    if (filters.priority) params.append('priority', filters.priority)
    if (filters.tags) params.append('tags', filters.tags.join(','))
    if (filters.dateFrom) params.append('dateFrom', filters.dateFrom)
    if (filters.dateTo) params.append('dateTo', filters.dateTo)
    if (filters.limit) params.append('limit', filters.limit)
    if (filters.offset) params.append('offset', filters.offset)

    const response = await api.get(`/todos/search?${params}`)
    return response.data
  },

  // Get search suggestions
  async getSearchSuggestions(query) {
    if (!query || query.length < 2) return []
    const response = await api.get(`/todos/search/suggestions?q=${encodeURIComponent(query)}`)
    return response.data
  },

  // Save search
  async saveSearch(searchData) {
    const response = await api.post('/searches/saved', searchData)
    return response.data
  },

  // Get saved searches
  async getSavedSearches() {
    const response = await api.get('/searches/saved')
    return response.data
  },

  // Delete saved search
  async deleteSavedSearch(id) {
    const response = await api.delete(`/searches/saved/${id}`)
    return response.data
  },

  // Get search analytics
  async getSearchAnalytics() {
    const response = await api.get('/searches/analytics')
    return response.data
  },
}

export default todoApi