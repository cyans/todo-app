// @CODE:TODO-CRUD-001:CLIENT:API
/**
 * API Client Service
 *
 * Provides centralized HTTP client for backend communication
 * with interceptors, error handling, and request/response processing.
 *
 * @module services/api
 * @version 1.0.0
 */

import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add request ID
api.interceptors.request.use(
  (config) => {
    config.headers['X-Request-ID'] = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle network errors
    if (!error.response) {
      error.message = 'Network error. Please check your connection.';
      return Promise.reject(error);
    }

    // Handle common HTTP errors
    const { status, data } = error.response;

    switch (status) {
      case 400:
        error.message = data?.message || 'Bad request. Please check your input.';
        break;
      case 404:
        error.message = data?.message || 'Resource not found.';
        break;
      case 500:
        error.message = data?.message || 'Server error. Please try again later.';
        break;
      default:
        error.message = data?.message || `Request failed with status ${status}.`;
    }

    return Promise.reject(error);
  }
);

// Todo API endpoints
export const todoAPI = {
  // Get all todos
  getAll: (params = {}) => api.get('/api/todos', { params }),

  // Get todo by ID
  getById: (id) => api.get(`/api/todos/${id}`),

  // Create new todo
  create: (todoData) => api.post('/api/todos', todoData),

  // Update todo
  update: (id, todoData) => api.put(`/api/todos/${id}`, todoData),

  // Delete todo
  delete: (id) => api.delete(`/api/todos/${id}`),

  // Toggle todo completion
  toggle: (id) => api.patch(`/api/todos/${id}/toggle`),

  // Search todos
  search: (query) => api.get('/api/todos/search', { params: { q: query } }),

  // Get todo statistics
  getStats: () => api.get('/api/todos/stats'),
};

// Health check
export const healthAPI = {
  check: () => api.get('/health'),
};

export default api;