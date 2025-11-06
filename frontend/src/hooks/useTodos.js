// @CODE:TODO-CRUD-001:HOOKS:USE-TODOS
/**
 * Custom React Hook for Todo Operations
 *
 * Provides comprehensive todo management functionality including
 * CRUD operations, search, filtering, and statistics.
 *
 * @hook useTodos
 * @version 1.0.0
 */

import { useState, useEffect, useCallback } from 'react';
import { todoAPI } from '../services/api';

export const useTodos = () => {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);

  // Fetch all todos
  const fetchTodos = useCallback(async (filters = {}) => {
    try {
      setLoading(true);
      setError(null);
      const response = await todoAPI.getAll(filters);
      setTodos(response.data.data.todos);
    } catch (err) {
      setError(err.message || 'Failed to fetch todos');
      console.error('Error fetching todos:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch statistics
  const fetchStats = useCallback(async () => {
    try {
      const response = await todoAPI.getStats();
      setStats(response.data.data);
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  }, []);

  // Create new todo
  const createTodo = useCallback(async (todoData) => {
    try {
      setError(null);
      const response = await todoAPI.create(todoData);
      const newTodo = response.data.data;

      // Update local state
      setTodos(prev => [newTodo, ...prev]);

      // Refresh stats
      await fetchStats();

      return newTodo;
    } catch (err) {
      const errorMessage = err.message || 'Failed to create todo';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [fetchStats]);

  // Update todo
  const updateTodo = useCallback(async (id, todoData) => {
    try {
      setError(null);
      const response = await todoAPI.update(id, todoData);
      const updatedTodo = response.data.data;

      // Update local state
      setTodos(prev =>
        prev.map(todo => todo.id === id ? updatedTodo : todo)
      );

      // Refresh stats
      await fetchStats();

      return updatedTodo;
    } catch (err) {
      const errorMessage = err.message || 'Failed to update todo';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [fetchStats]);

  // Delete todo
  const deleteTodo = useCallback(async (id) => {
    try {
      setError(null);
      await todoAPI.delete(id);

      // Update local state
      setTodos(prev => prev.filter(todo => todo.id !== id));

      // Refresh stats
      await fetchStats();

      return true;
    } catch (err) {
      const errorMessage = err.message || 'Failed to delete todo';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [fetchStats]);

  // Toggle todo completion
  const toggleTodo = useCallback(async (id) => {
    try {
      setError(null);
      const response = await todoAPI.toggle(id);
      const updatedTodo = response.data.data;

      // Update local state
      setTodos(prev =>
        prev.map(todo => todo.id === id ? updatedTodo : todo)
      );

      // Refresh stats
      await fetchStats();

      return updatedTodo;
    } catch (err) {
      const errorMessage = err.message || 'Failed to toggle todo';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [fetchStats]);

  // Search todos
  const searchTodos = useCallback(async (query) => {
    try {
      setLoading(true);
      setError(null);
      const response = await todoAPI.search(query);
      setTodos(response.data.data);
    } catch (err) {
      setError(err.message || 'Failed to search todos');
      console.error('Error searching todos:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Filter todos by status
  const filterByStatus = useCallback(async (completed) => {
    await fetchTodos({ completed: completed ? 'true' : 'false' });
  }, [fetchTodos]);

  // Filter todos by priority
  const filterByPriority = useCallback(async (priority) => {
    await fetchTodos({ priority });
  }, [fetchTodos]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Initialize data on mount
  useEffect(() => {
    fetchTodos();
    fetchStats();
  }, [fetchTodos, fetchStats]);

  return {
    todos,
    loading,
    error,
    stats,
    fetchTodos,
    createTodo,
    updateTodo,
    deleteTodo,
    toggleTodo,
    searchTodos,
    filterByStatus,
    filterByPriority,
    clearError,
  };
};