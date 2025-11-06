const StatsBar = ({ stats, isLoading = false }) => {
  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border p-6 mb-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-2">
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  const getCompletionRateColor = (rate) => {
    if (rate >= 80) return 'text-green-600 dark:text-green-400';
    if (rate >= 60) return 'text-yellow-600 dark:text-yellow-400';
    if (rate >= 40) return 'text-orange-600 dark:text-orange-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getCompletionRateBg = (rate) => {
    if (rate >= 80) return 'bg-green-100 dark:bg-green-900/20';
    if (rate >= 60) return 'bg-yellow-100 dark:bg-yellow-900/20';
    if (rate >= 40) return 'bg-orange-100 dark:bg-orange-900/20';
    return 'bg-red-100 dark:bg-red-900/20';
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border p-6 mb-6">
      <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
        📊 Statistics
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="text-center">
          <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
            {stats.total}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Total Todos</div>
        </div>

        <div className="text-center">
          <div className="text-3xl font-bold text-green-600 dark:text-green-400">
            {stats.completed}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Completed</div>
        </div>

        <div className="text-center">
          <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">
            {stats.incomplete}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Pending</div>
        </div>

        <div className="text-center">
          <div className={`text-3xl font-bold ${getCompletionRateColor(stats.completionRate)}`}>
            {stats.completionRate}%
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Completion Rate</div>
        </div>
      </div>

      {/* Priority Distribution */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Priority Distribution
        </h3>
        <div className="space-y-2">
          {[
            { priority: 'high', label: '🔴 High Priority', count: stats.byPriority?.high || 0, color: 'bg-red-500' },
            { priority: 'medium', label: '🟡 Medium Priority', count: stats.byPriority?.medium || 0, color: 'bg-yellow-500' },
            { priority: 'low', label: '🟢 Low Priority', count: stats.byPriority?.low || 0, color: 'bg-green-500' }
          ].map((item) => {
            const percentage = stats.total > 0 ? (item.count / stats.total) * 100 : 0;
            return (
              <div key={item.priority} className="flex items-center space-x-3">
                <div className="w-32 text-sm text-gray-600 dark:text-gray-400">
                  {item.label}
                </div>
                <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className={`${item.color} h-2 rounded-full transition-all duration-300`}
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
                <div className="w-12 text-sm text-gray-700 dark:text-gray-300 text-right">
                  {item.count}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Overall Progress
          </span>
          <span className={`text-sm font-bold ${getCompletionRateColor(stats.completionRate)}`}>
            {stats.completionRate}% Complete
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
          <div
            className={`h-3 rounded-full transition-all duration-500 ${getCompletionRateBg(stats.completionRate)}`}
            style={{ width: `${stats.completionRate}%` }}
          ></div>
        </div>
        {stats.completionRate < 50 && (
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            💪 Keep going! You're making progress.
          </p>
        )}
        {stats.completionRate >= 50 && stats.completionRate < 80 && (
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            👏 Great job! You're more than halfway there.
          </p>
        )}
        {stats.completionRate >= 80 && (
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            🎉 Excellent! You're almost done!
          </p>
        )}
      </div>
    </div>
  );
};

export default StatsBar;