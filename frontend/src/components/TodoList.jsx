import TodoItem from './TodoItem';

const TodoList = ({
  todos,
  loading,
  onToggle,
  onUpdate,
  onDelete,
  searchTerm = '',
  sortBy = 'createdAt',
  sortOrder = 'desc'
}) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="flex flex-col items-center space-y-4">
          <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-gray-600 dark:text-gray-400">Loading todos...</p>
        </div>
      </div>
    );
  }

  if (!todos || todos.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full mb-4">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
          {searchTerm ? 'No todos found' : 'No todos yet'}
        </h3>
        <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
          {searchTerm
            ? `No todos match your search for "${searchTerm}". Try a different search term or clear the search.`
            : 'Get started by creating your first todo using the form above.'
          }
        </p>
      </div>
    );
  }

  // Sort todos
  const sortedTodos = [...todos].sort((a, b) => {
    let aValue = a[sortBy];
    let bValue = b[sortBy];

    // Handle priority sorting with custom order
    if (sortBy === 'priority') {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      aValue = priorityOrder[a.priority];
      bValue = priorityOrder[b.priority];
    }

    // Handle string comparison
    if (typeof aValue === 'string') {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
    }

    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
    } else {
      return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
    }
  });

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
          {searchTerm ? `Search Results (${sortedTodos.length})` : `All Todos (${sortedTodos.length})`}
        </h2>

        {/* Sort controls */}
        <div className="flex items-center space-x-2">
          <label className="text-sm text-gray-600 dark:text-gray-400">Sort by:</label>
          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [newSortBy, newSortOrder] = e.target.value.split('-');
              // This would be handled by parent component
              // onSortChange(newSortBy, newSortOrder);
            }}
            className="text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          >
            <option value="createdAt-desc">Newest First</option>
            <option value="createdAt-asc">Oldest First</option>
            <option value="priority-desc">High Priority First</option>
            <option value="priority-asc">Low Priority First</option>
            <option value="title-asc">Title (A-Z)</option>
            <option value="title-desc">Title (Z-A)</option>
          </select>
        </div>
      </div>

      <div className="space-y-2">
        {sortedTodos.map((todo) => (
          <TodoItem
            key={todo.id}
            todo={todo}
            onToggle={onToggle}
            onUpdate={onUpdate}
            onDelete={onDelete}
            loading={loading}
          />
        ))}
      </div>

      {/* Todo summary */}
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {sortedTodos.length}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Total</div>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {sortedTodos.filter(todo => todo.completed).length}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Completed</div>
          </div>
          <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-3">
            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
              {sortedTodos.filter(todo => !todo.completed).length}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Pending</div>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {sortedTodos.length > 0
                ? Math.round((sortedTodos.filter(todo => todo.completed).length / sortedTodos.length) * 100)
                : 0
              }%
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Complete</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TodoList;