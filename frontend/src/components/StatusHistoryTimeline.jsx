import React from 'react'
import { formatRelativeTime, formatDateTime } from '../utils/date'
import { getStatusConfig } from '../constants/status'

const StatusHistoryTimeline = ({ history = [], onHistoryClick, maxEntries = 10 }) => {
  if (!history || history.length === 0) {
    return (
      <div className="text-center py-4 text-gray-500">
        <div className="text-sm">No status changes recorded</div>
      </div>
    )
  }

  const displayHistory = history.slice(0, maxEntries)
  const hasMore = history.length > maxEntries

  const getStatusColor = (status) => {
    const config = getStatusConfig(status)
    return config.color.replace('bg-', 'text-').replace('text-', 'border-').replace('-800', '-600')
  }

  return (
    <div data-testid="history-timeline" className="history-timeline">
      <h4 className="text-sm font-medium text-gray-900 mb-3">Status History</h4>

      <div className="space-y-3">
        {displayHistory.map((entry, index) => (
          <div
            key={entry.id}
            data-testid={`history-entry-${entry.id}`}
            onClick={() => onHistoryClick && onHistoryClick(entry)}
            className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors border border-gray-200"
          >
            {/* Timeline connector */}
            <div className="flex flex-col items-center">
              <div className={`w-3 h-3 rounded-full border-2 ${getStatusColor(entry.to_status)} bg-white`}></div>
              {index < displayHistory.length - 1 && (
                <div className="w-0.5 h-8 bg-gray-300 mt-1"></div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 mb-1">
                {/* Status transition */}
                <div className="flex items-center gap-2 text-sm">
                  <span className={`px-2 py-1 rounded text-xs font-medium border ${getStatusConfig(entry.from_status).color}`}>
                    {getStatusConfig(entry.from_status).label}
                  </span>
                  <span className="text-gray-400">→</span>
                  <span className={`px-2 py-1 rounded text-xs font-medium border ${getStatusConfig(entry.to_status).color}`}>
                    {getStatusConfig(entry.to_status).label}
                  </span>
                </div>

                {/* Timestamp */}
                <span className="text-xs text-gray-500 whitespace-nowrap">
                  {formatRelativeTime(entry.timestamp)}
                </span>
              </div>

              {/* User and reason */}
              <div className="text-xs text-gray-600">
                <div>
                  Changed by <span className="font-medium">{entry.changed_by || 'Unknown user'}</span>
                </div>
                {entry.reason && (
                  <div className="mt-1 text-gray-500">
                    {entry.reason}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Show more button */}
      {hasMore && (
        <button
          onClick={() => onHistoryClick && onHistoryClick(null)}
          className="mt-3 w-full text-center text-sm text-blue-600 hover:text-blue-800 font-medium py-2 px-3 rounded-md hover:bg-blue-50 transition-colors"
        >
          Show more ({history.length - maxEntries} additional changes)
        </button>
      )}
    </div>
  )
}

export default StatusHistoryTimeline

// @CODE:TAG-005-STATUS-HISTORY-TIMELINE-001