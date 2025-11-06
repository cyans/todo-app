// @CODE:TODO-CRUD-001:UI:MAIN
/**
 * Main React Application Component
 *
 * This is the root component of the Todo application that orchestrates
 * all child components, manages state, and handles user interactions.
 *
 * @component App
 * @version 1.0.0
 */

import { useState, useCallback } from 'react';
import { useTodos } from './hooks/useTodos';
import TodoForm from './components/TodoForm';
import TodoList from './components/TodoList';
import SearchBar from './components/SearchBar';
import FilterBar from './components/FilterBar';
import StatsBar from './components/StatsBar';

function App() {
  const {
    todos,
    loading,
    error,
    stats,
    createTodo,
    updateTodo,
    deleteTodo,
    toggleTodo,
    searchTodos,
    filterByStatus,
    filterByPriority,
    fetchTodos,
    clearError
  } = useTodos();

  const [searchTerm, setSearchTerm] = useState('');
  const [currentFilter, setCurrentFilter] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  // Handle todo creation
  const handleCreateTodo = useCallback(async (todoData) => {
    await createTodo(todoData);
  }, [createTodo]);

  // Handle todo update
  const handleUpdateTodo = useCallback(async (id, todoData) => {
    await updateTodo(id, todoData);
  }, [updateTodo]);

  // Handle todo deletion
  const handleDeleteTodo = useCallback(async (id) => {
    await deleteTodo(id);
  }, [deleteTodo]);

  // Handle todo toggle
  const handleToggleTodo = useCallback(async (id) => {
    await toggleTodo(id);
  }, [toggleTodo]);

  // Handle search
  const handleSearch = useCallback(async (term) => {
    setSearchTerm(term);
    if (term.trim()) {
      await searchTodos(term.trim());
    } else {
      await fetchTodos();
    }
  }, [searchTodos, fetchTodos]);

  // Handle filter change
  const handleFilterChange = useCallback(async (filter) => {
    setCurrentFilter(filter.value);

    switch (filter.type) {
      case 'status':
        await filterByStatus(filter.value);
        break;
      case 'priority':
        await filterByPriority(filter.value);
        break;
      default:
        await fetchTodos();
    }
  }, [filterByStatus, filterByPriority, fetchTodos]);

  // Handle sort change
  const handleSortChange = useCallback((newSortBy, newSortOrder) => {
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
  }, []);

  // Clear error on user action
  const handleClearError = useCallback(() => {
    clearError();
  }, [clearError]);

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

        {error && (
          <div className="max-w-4xl mx-auto mb-6">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-red-600 dark:text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <p className="text-red-800 dark:text-red-300">
                    {error}
                  </p>
                </div>
                <button
                  onClick={handleClearError}
                  className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}

        <main className="max-w-4xl mx-auto space-y-6">
          {/* Statistics */}
          <StatsBar stats={stats} isLoading={loading} />

          {/* Add Todo Form */}
          <TodoForm onSubmit={handleCreateTodo} isLoading={loading} />

          {/* Search Bar */}
          <SearchBar onSearch={handleSearch} isLoading={loading} />

          {/* Filter Bar */}
          <FilterBar
            onFilterChange={handleFilterChange}
            currentFilter={currentFilter}
            isLoading={loading}
          />

          {/* Todo List */}
          <TodoList
            todos={todos}
            loading={loading}
            onToggle={handleToggleTodo}
            onUpdate={handleUpdateTodo}
            onDelete={handleDeleteTodo}
            searchTerm={searchTerm}
            sortBy={sortBy}
            sortOrder={sortOrder}
          />
        </main>

        {/* Footer */}
        <footer className="mt-12 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>
            🚀 Built with React + Node.js + MongoDB |
            {stats && ` ${stats.total} todos, ${stats.completed} completed`}
          </p>
        </footer>
      </div>
    </div>
  );
}

export default App;
