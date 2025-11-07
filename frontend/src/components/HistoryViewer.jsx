import React, { useState, useEffect } from 'react'
import { formatRelativeTime, formatDateTimeDisplay, formatTimeUTC, formatDateTime } from '../utils/date'
import { getStatusConfig } from '../constants/status'

const HistoryViewer = ({ todo, history = [], onClose }) => {
  const [filteredHistory, setFilteredHistory] = useState(history)
  const [statusFilter, setStatusFilter] = useState('all')
  const [userFilter, setUserFilter] = useState('all')

  // Get unique users from history
  const uniqueUsers = [...new Set(history.map(entry => entry.changed_by).filter(Boolean))]

  // Filter history based on selected filters
  useEffect(() => {
    let filtered = [...history]

    // Sort by timestamp (newest first)
    filtered.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(entry =>
        entry.from_status === statusFilter || entry.to_status === statusFilter
      )
    }

    // Apply user filter
    if (userFilter !== 'all') {
      filtered = filtered.filter(entry => entry.changed_by === userFilter)
    }

    setFilteredHistory(filtered)
  }, [history, statusFilter, userFilter])

  const handleExport = () => {
    const csvContent = [
      ['Timestamp', 'From Status', 'To Status', 'Changed By', 'Reason'],
      ...filteredHistory.map(entry => [
        formatDateTime(entry.timestamp),
        entry.from_status,
        entry.to_status,
        entry.changed_by || 'Unknown user',
        entry.reason || ''
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `todo-${todo.id}-history.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose()
    }
  }

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  if (!history || history.length === 0) {
    return (
      <div
        data-testid="history-viewer-backdrop"
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        onClick={onClose}
      >
        <div
          className="bg-white rounded-lg p-6 max-w-md w-full mx-4"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="text-center py-8">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              History for "{todo?.title || 'Todo'}"
            </h3>
            <p className="text-gray-500">No status changes recorded for this todo</p>
            <button
              onClick={onClose}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      data-testid="history-viewer-backdrop"
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              History for "{todo?.title || 'Todo'}"
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
              aria-label="Close"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="border-b border-gray-200 px-6 py-4">
          <div className="flex gap-4 items-center">
            <div className="flex-1">
              <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-1">
                Filter by status
              </label>
              <select
                id="status-filter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Statuses</option>
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="review">Review</option>
                <option value="done">Done</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            <div className="flex-1">
              <label htmlFor="user-filter" className="block text-sm font-medium text-gray-700 mb-1">
                Filter by user
              </label>
              <select
                id="user-filter"
                value={userFilter}
                onChange={(e) => setUserFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Users</option>
                {uniqueUsers.map(user => (
                  <option key={user} value={user}>{user}</option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={handleExport}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Export History
              </button>
            </div>
          </div>
        </div>

        {/* History List */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="space-y-4">
            {filteredHistory.map((entry, index) => (
              <div
                key={entry.id}
                data-testid={`history-detail-${entry.id}`}
                className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* Status Transition */}
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`status-todo px-2 py-1 rounded text-xs font-medium ${getStatusConfig(entry.from_status).color}`}>
                        {entry.from_status}
                      </span>
                      <span className="text-gray-400">→</span>
                      <span className={`status-${entry.to_status} px-2 py-1 rounded text-xs font-medium ${getStatusConfig(entry.to_status).color}`}>
                        {entry.to_status}
                      </span>
                    </div>
                    <div className="text-xs text-gray-400" aria-hidden="true">
                      {entry.from_status} → {entry.to_status}
                    </div>

                    {/* User and Reason */}
                    <div className="text-sm text-gray-600 mb-2">
                      <div>
                        Changed by <span className="font-medium">{entry.changed_by || 'Unknown user'}</span>
                      </div>
                      {entry.reason && (
                        <div className="text-gray-500">{entry.reason}</div>
                      )}
                    </div>

                    {/* Timestamp */}
                    <div className="text-xs text-gray-500">
                      <div>{formatDateTimeDisplay(entry.timestamp)}</div>
                      <div>{formatTimeUTC(entry.timestamp)}</div>
                      <div>{formatRelativeTime(entry.timestamp)}</div>
                    </div>
                  </div>

                  {/* User Avatar (simple version) */}
                  <div className="ml-4">
                    <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                      {(entry.changed_by || 'U').charAt(0).toUpperCase()}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default HistoryViewer

// @CODE:TODO-HISTORY-VIEWER-001