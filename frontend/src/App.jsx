// @CODE:TODO-APP-001 - Todo Main Application Component
import React, { useState, useEffect } from 'react';
import { TodoList } from './components/TodoList';
import { SearchBar } from './components/SearchBar';
import { TodoForm } from './components/TodoForm';
import todoApi from './services/api';

function App() {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('dueDate');
  const [viewMode, setViewMode] = useState('comfortable'); // 'comfortable' | 'compact'

  // Load todos on component mount
  useEffect(() => {
    loadTodos();
  }, []);

  // Reload todos when filter or sort changes
  useEffect(() => {
    if (searchQuery.trim() === '') {
      loadTodos();
    }
  }, [filter, sortBy]);

  // Load todos from API
  const loadTodos = async () => {
    try {
      setLoading(true);
      const data = await todoApi.getAll(filter, sortBy, 1, 50);

      // Transform API response to match TodoList component format
      if (data.success && data.data && data.data.todos) {
        setTodos(data.data.todos);
      }
      setError(null);
    } catch (err) {
      console.error('Failed to load todos:', err);
      setError('Failed to load todos. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle todo toggle
  const handleToggle = async (id) => {
    try {
      // Find the current todo to get its completed status
      const currentTodo = todos.find(todo => todo.id === id);
      if (currentTodo) {
        await todoApi.toggle(id, !currentTodo.completed);
      }
      // Reload todos after toggle
      await loadTodos();
    } catch (err) {
      console.error('Failed to toggle todo:', err);
      setError('Failed to update todo. Please try again.');
    }
  };

  // Handle todo deletion
  const handleDelete = async (id) => {
    try {
      await todoApi.delete(id);
      // Reload todos after deletion
      await loadTodos();
    } catch (err) {
      console.error('Failed to delete todo:', err);
      setError('Failed to delete todo. Please try again.');
    }
  };

  // Handle todo edit
  const handleEdit = async (id, updatedData) => {
    try {
      // 백엔드가 text 필드를 기대하므로 변환
      const apiData = updatedData.text ? updatedData : { text: updatedData.title };
      await todoApi.update(id, apiData);
      // Reload todos after edit
      await loadTodos();
    } catch (err) {
      console.error('Failed to edit todo:', err);
      setError('Failed to edit todo. Please try again.');
    }
  };

  // Handle search
  const handleSearch = async (query) => {
    setSearchQuery(query);

    if (query.trim() === '') {
      loadTodos();
      return;
    }

    try {
      setLoading(true);
      const data = await todoApi.search(query, filter, sortBy, 50);

      if (data.success && data.data) {
        setTodos(data.data);
      }
    } catch (err) {
      console.error('Failed to search todos:', err);
      setError('Failed to search todos. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle filter change
  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
  };

  // Apply filter
  const getFilteredTodos = () => {
    if (searchQuery.trim() === '') {
      return todos.filter(todo => {
        if (filter === 'all') return true;
        if (filter === 'active') return !todo.completed;
        if (filter === 'completed') return todo.completed;
        return true;
      });
    }
    return todos; // Search results are already filtered
  };

  // Handle new todo creation
  const handleCreateTodo = async (todoData) => {
    try {
      await todoApi.create(todoData);
      await loadTodos();
    } catch (err) {
      console.error('Failed to create todo:', err);
      setError('Failed to create todo. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 overflow-visible">
      <div className="container mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-4 sm:py-6 lg:py-8 xl:py-12 max-w-4xl xl:max-w-5xl overflow-visible">
        <header className="mb-6 sm:mb-8 lg:mb-12 text-center">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2 sm:mb-3">
            내 할 일
          </h1>
          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto px-2 sm:px-0">
            오늘의 목표를 설정하고, 하나씩 완료해나가며 성취감을 느껴보세요
          </p>
        </header>

        <main className="space-y-6 sm:space-y-8">
          {/* Todo Form */}
          <TodoForm
            onAddTodo={handleCreateTodo}
            loading={loading}
          />

          {/* Filter and Sort Controls */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-4 sm:p-6">
            <div className="flex flex-col gap-4 sm:gap-6">
              {/* View Mode Toggle - Mobile First */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-2 sm:gap-3">
                  <span className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">보기 모드:</span>
                  <div className="flex gap-1 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
                    <button
                      onClick={() => setViewMode('comfortable')}
                      className={`px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-md transition-all duration-200 ${
                        viewMode === 'comfortable'
                          ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm'
                          : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                      }`}
                      title="넓은 보기"
                    >
                      📋
                    </button>
                    <button
                      onClick={() => setViewMode('compact')}
                      className={`px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-md transition-all duration-200 ${
                        viewMode === 'compact'
                          ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm'
                          : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                      }`}
                      title="컴팩트 보기"
                    >
                      📝
                    </button>
                  </div>
                </div>
              </div>
              {/* Filter Tabs */}
              <div className="flex flex-wrap items-center gap-1 sm:gap-2">
                <button
                  onClick={() => handleFilterChange('all')}
                  className={`px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-semibold rounded-lg sm:rounded-xl transition-all duration-200 ${
                    filter === 'all'
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  <span className="flex items-center gap-1 sm:gap-2">
                    <span className="text-sm sm:text-base">📋</span>
                    <span className="hidden sm:inline">전체</span>
                    <span className="bg-white/20 dark:bg-black/20 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-xs">{todos.length}</span>
                  </span>
                </button>
                <button
                  onClick={() => handleFilterChange('active')}
                  className={`px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-semibold rounded-lg sm:rounded-xl transition-all duration-200 ${
                    filter === 'active'
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  <span className="flex items-center gap-1 sm:gap-2">
                    <span className="text-sm sm:text-base">⚡</span>
                    <span className="hidden sm:inline">진행중</span>
                    <span className="bg-white/20 dark:bg-black/20 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-xs">{todos.filter(t => !t.completed).length}</span>
                  </span>
                </button>
                <button
                  onClick={() => handleFilterChange('completed')}
                  className={`px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-semibold rounded-lg sm:rounded-xl transition-all duration-200 ${
                    filter === 'completed'
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  <span className="flex items-center gap-1 sm:gap-2">
                    <span className="text-sm sm:text-base">✅</span>
                    <span className="hidden sm:inline">완료됨</span>
                    <span className="bg-white/20 dark:bg-black/20 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-xs">{todos.filter(t => t.completed).length}</span>
                  </span>
                </button>
              </div>

              {/* Sort Options */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                <span className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">정렬:</span>
                <div className="flex flex-wrap gap-1 sm:gap-2">
                  {[
                    { value: 'dueDate', label: '마감일', icon: '📅' },
                    { value: 'priority', label: '우선순위', icon: '⚡' },
                    { value: 'created', label: '생성일', icon: '🕐' },
                    { value: 'text', label: '제목', icon: '📝' }
                  ].map(({ value, label, icon }) => (
                    <button
                      key={value}
                      onClick={() => setSortBy(value)}
                      className={`px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-md transition-all duration-200 flex items-center gap-1 sm:gap-2 ${
                        sortBy === value
                          ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-2 border-blue-300 dark:border-blue-600'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 border-2 border-transparent'
                      }`}
                    >
                      <span className="text-sm sm:text-base">{icon}</span>
                      <span className="hidden xs:inline sm:inline">{label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-2xl p-6 shadow-lg">
              <div className="flex items-start gap-4">
                <div className="text-red-600 dark:text-red-400 text-2xl flex-shrink-0 animate-pulse">
                  ⚠️
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-lg font-semibold text-red-800 dark:text-red-300 mb-1">
                    오류가 발생했습니다
                  </p>
                  <p className="text-sm text-red-700 dark:text-red-400 break-words">
                    {error}
                  </p>
                </div>
                <button
                  onClick={() => setError(null)}
                  className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300
                           transition-colors duration-200 p-2 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/30 flex-shrink-0"
                  title="닫기"
                >
                  ✕
                </button>
              </div>
            </div>
          )}

          {/* Todo List Container */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="p-4 sm:p-6">
              <TodoList
                todos={getFilteredTodos()}
                onToggle={handleToggle}
                onDelete={handleDelete}
                onEdit={handleEdit}
                loading={loading}
                viewMode={viewMode}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
