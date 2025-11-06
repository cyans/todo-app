const FilterBar = ({ onFilterChange, currentFilter = 'all', isLoading = false }) => {
  const filters = [
    { value: 'all', label: 'All Todos', icon: '📋' },
    { value: 'pending', label: 'Pending', icon: '⏳' },
    { value: 'completed', label: 'Completed', icon: '✅' },
    { value: 'high', label: 'High Priority', icon: '🔴' },
    { value: 'medium', label: 'Medium Priority', icon: '🟡' },
    { value: 'low', label: 'Low Priority', icon: '🟢' }
  ];

  const handleFilterChange = (filter) => {
    if (isLoading) return;

    switch (filter) {
      case 'pending':
        onFilterChange({ type: 'status', value: false });
        break;
      case 'completed':
        onFilterChange({ type: 'status', value: true });
        break;
      case 'high':
      case 'medium':
      case 'low':
        onFilterChange({ type: 'priority', value: filter });
        break;
      default:
        onFilterChange({ type: 'all', value: null });
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border p-4 mb-4">
      <div className="flex flex-wrap gap-2">
        {filters.map((filter) => (
          <button
            key={filter.value}
            onClick={() => handleFilterChange(filter.value)}
            disabled={isLoading}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
              currentFilter === filter.value
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            <span className="mr-1">{filter.icon}</span>
            {filter.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default FilterBar;