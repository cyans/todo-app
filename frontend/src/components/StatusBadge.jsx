import React from 'react'
import { getStatusConfig } from '../constants/status'

const StatusBadge = ({ status, showLabel = true, className = '' }) => {
  const config = getStatusConfig(status)

  return (
    <span
      role="status"
      aria-label={`Status: ${config.label}`}
      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${config.color} ${className}`}
    >
      <span>{config.icon}</span>
      {showLabel && <span>{config.label}</span>}
    </span>
  )
}

export default StatusBadge

// @CODE:FRONTEND-STATUS-BADGE-001