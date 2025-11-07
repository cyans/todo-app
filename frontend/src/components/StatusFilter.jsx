import React from 'react'
import { getAllStatuses, getStatusConfig } from '../constants/status'
import StatusBadge from './StatusBadge'

const StatusFilter = ({ onFilterChange, activeFilter = null, counts = {}, className = '' }) => {
  const statuses = getAllStatuses()

  const handleFilterClick = (status) => {
    onFilterChange(status === activeFilter ? null : status)
  }

  const handleAllClick = () => {
    onFilterChange(null)
  }

  const totalCount = Object.values(counts).reduce((sum, count) => sum + count, 0)

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {/* All filter */}
      <button
        onClick={handleAllClick}
        className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
          activeFilter === null
            ? 'bg-gray-600 text-white'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
      >
        All
        {totalCount > 0 && (
          <span className="ml-2 px-2 py-0.5 bg-gray-200 text-gray-700 rounded-full text-xs">
            {totalCount}
          </span>
        )}
      </button>

      {/* Status filters */}
      {statuses.map(status => {
        const config = getStatusConfig(status)
        const isActive = activeFilter === status
        const count = counts[status] || 0

        return (
          <button
            key={status}
            onClick={() => handleFilterClick(status)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors flex items-center gap-1 ${
              isActive
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {config.icon} {config.label}
            {count > 0 && (
              <span className="ml-1 px-2 py-0.5 bg-gray-200 text-gray-700 rounded-full text-xs">
                {count}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}

export default StatusFilter

// @CODE:FRONTEND-STATUS-FILTER-001