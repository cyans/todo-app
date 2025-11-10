// @CODE:TODO-SERVICE-001 - Todo API Service Client
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api/todos';

// Create axios instance with default configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for logging and error handling
api.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('API Response Error:', error);
    return Promise.reject(error);
  }
);

// Todo API methods
export const todoApi = {
  // Get all todos
  getAll: async (filter = 'all', sortBy = 'created', page = 1, limit = 10) => {
    const response = await api.get('', {
      params: { filter, sortBy, page, limit }
    });
    return response.data;
  },

  // Get a single todo by ID
  getById: async (id) => {
    const response = await api.get(`/${id}`);
    return response.data;
  },

  // Create a new todo
  create: async (todoData) => {
    const response = await api.post('/', todoData);
    return response.data;
  },

  // Update a todo
  update: async (id, todoData) => {
    const response = await api.put(`/${id}`, todoData);
    return response.data;
  },

  // Delete a todo
  delete: async (id) => {
    const response = await api.delete(`/${id}`);
    return response.data;
  },

  // Toggle todo completion status
  toggle: async (id, completed) => {
    const response = await api.patch(`/${id}`, { completed });
    return response.data;
  },

  // Update todo status
  updateStatus: async (id, status) => {
    const response = await api.patch(`/${id}/status`, { status });
    return response.data;
  },

  // Search todos
  search: async (query, filter = 'all', sortBy = 'created', limit = 20) => {
    const response = await api.get(`/search/${encodeURIComponent(query)}`, {
      params: { filter, sortBy, limit }
    });
    return response.data;
  },

  // Get todos by priority
  getByPriority: async (priority, filter = 'all') => {
    const response = await api.get(`/priority/${priority}`, {
      params: { filter }
    });
    return response.data;
  },

  // Get todo statistics
  getStats: async () => {
    const response = await api.get('/stats/overview');
    return response.data;
  },

  // Get todo status history
  getHistory: async (id) => {
    const response = await api.get(`/${id}/history`);
    return response.data;
  },
};

export default todoApi;