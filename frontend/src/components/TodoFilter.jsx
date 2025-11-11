// @CODE:TODO-FILTER-001
function TodoFilter({ filter, sortBy, onFilterChange, onSortChange }) {
  const filterOptions = [
    { value: 'all', label: 'All', icon: '📋', count: null },
    { value: 'active', label: 'Active', icon: '⚡', count: null },
    { value: 'completed', label: 'Done', icon: '✅', count: null }
  ]

  const sortOptions = [
    { value: 'created', label: 'Created', icon: '📅', description: 'Sort by creation date' },
    { value: 'priority', label: 'Priority', icon: '🎯', description: 'Sort by priority level' },
    { value: 'text', label: 'Alphabetical', icon: '🔤', description: 'Sort A-Z' },
    { value: 'dueDate', label: 'Due Date', icon: '⏰', description: 'Sort by due date' }
  ]

  return (
    <div className="space-y-6">
      {/* Filter Pills Section */}
      <div>
        <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-3 uppercase tracking-wide">
          Filter Tasks
        </h3>
        <div className="flex flex-wrap gap-2">
          {filterOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => onFilterChange(option.value)}
              className={`filter-pill ${filter === option.value ? 'active' : ''}`}
              title={`Show ${option.label.toLowerCase()} tasks`}
            >
              <span className="mr-2">{option.icon}</span>
              <span>{option.label}</span>
              {option.count !== null && (
                <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-white/20">
                  {option.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Sort Options Section */}
      <div>
        <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-3 uppercase tracking-wide">
          Sort Order
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {sortOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => onSortChange(option.value)}
              className={`p-3 rounded-lg text-center transition-all duration-200 border-2 ${
                sortBy === option.value
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                  : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-500'
              } hover:shadow-md`}
              title={option.description}
            >
              <div className="text-xl mb-1">{option.icon}</div>
              <div className="text-xs font-medium">{option.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Active Filters Display */}
      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
        <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
          <span>Currently showing:</span>
          <span className="font-medium text-primary-600 dark:text-primary-400">
            {filterOptions.find(f => f.value === filter)?.label}
          </span>
          <span>•</span>
          <span className="font-medium text-primary-600 dark:text-primary-400">
            {sortOptions.find(s => s.value === sortBy)?.icon} {sortOptions.find(s => s.value === sortBy)?.label}
          </span>
        </div>

        {/* Quick Actions */}
        <div className="flex space-x-1">
          <button
            onClick={() => {
              onFilterChange('all')
              onSortChange('created')
            }}
            className="px-3 py-1 text-xs rounded-md bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
            title="Reset to default view"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  )
}

export default TodoFilter