// API service for Todo application
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/todos'

export const todoApi = {
  // Get all todos with optional filters
  getAll: async (filters = {}) => {
    const params = new URLSearchParams(filters)
    const response = await fetch(`${API_BASE_URL}?${params}`)

    if (!response.ok) {
      throw new Error('Failed to fetch todos')
    }

    return response.json()
  },

  // Create a new todo
  create: async (todoData) => {
    const response = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(todoData),
    })

    if (!response.ok) {
      throw new Error('Failed to create todo')
    }

    return response.json()
  },

  // Update a todo
  update: async (id, todoData) => {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(todoData),
    })

    if (!response.ok) {
      throw new Error('Failed to update todo')
    }

    return response.json()
  },

  // Delete a todo
  delete: async (id) => {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'DELETE',
    })

    if (!response.ok) {
      throw new Error('Failed to delete todo')
    }

    return response.json()
  },

  // Toggle todo completion status
  toggleComplete: async (id, completed) => {
    const response = await fetch(`${API_BASE_URL}/${id}/toggle`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ completed }),
    })

    if (!response.ok) {
      throw new Error('Failed to toggle todo completion')
    }

    return response.json()
  },
}