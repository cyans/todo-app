import React from 'react'
import { getAllStatuses, getStatusConfig } from '../constants/status'

const StatusSelector = ({
  currentStatus,
  onStatusChange,
  disabled = false,
  loading = false,
  className = ''
}) => {
  const statuses = getAllStatuses()

  const handleChange = (e) => {
    const newStatus = e.target.value
    onStatusChange(newStatus)
  }

  if (loading) {
    return (
      <div className={`px-3 py-2 border border-gray-300 rounded-md bg-gray-50 ${className}`}>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-500 text-sm">Updating...</span>
        </div>
      </div>
    )
  }

  return (
    <select
      value={currentStatus}
      onChange={handleChange}
      disabled={disabled || loading}
      aria-label="Status"
      className={`px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed ${className}`}
    >
      {statuses.map(status => {
        const config = getStatusConfig(status)
        return (
          <option key={status} value={status}>
            {config.icon} {config.label}
          </option>
        )
      })}
    </select>
  )
}

export default StatusSelector

// @CODE:FRONTEND-STATUS-SELECTOR-001