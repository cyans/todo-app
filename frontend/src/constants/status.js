// Status constants matching backend model
export const TODO_STATUS = {
  TODO: 'todo',
  IN_PROGRESS: 'in_progress',
  REVIEW: 'review',
  DONE: 'done',
  ARCHIVED: 'archived'
}

// Status configuration for UI
export const STATUS_CONFIG = {
  [TODO_STATUS.TODO]: {
    label: 'To Do',
    color: 'bg-gray-100 text-gray-800 border-gray-300',
    icon: '📋',
    description: 'Task needs to be started'
  },
  [TODO_STATUS.IN_PROGRESS]: {
    label: 'In Progress',
    color: 'bg-blue-100 text-blue-800 border-blue-300',
    icon: '🔄',
    description: 'Task is currently being worked on'
  },
  [TODO_STATUS.REVIEW]: {
    label: 'Review',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    icon: '👁️',
    description: 'Task is ready for review'
  },
  [TODO_STATUS.DONE]: {
    label: 'Done',
    color: 'bg-green-100 text-green-800 border-green-300',
    icon: '✅',
    description: 'Task has been completed'
  },
  [TODO_STATUS.ARCHIVED]: {
    label: 'Archived',
    color: 'bg-gray-100 text-gray-600 border-gray-300',
    icon: '📦',
    description: 'Task has been archived'
  }
}

// Status transition rules (matching backend)
export const STATUS_TRANSITIONS = {
  [TODO_STATUS.TODO]: [TODO_STATUS.IN_PROGRESS, TODO_STATUS.ARCHIVED],
  [TODO_STATUS.IN_PROGRESS]: [TODO_STATUS.TODO, TODO_STATUS.REVIEW, TODO_STATUS.ARCHIVED],
  [TODO_STATUS.REVIEW]: [TODO_STATUS.IN_PROGRESS, TODO_STATUS.DONE, TODO_STATUS.TODO],
  [TODO_STATUS.DONE]: [TODO_STATUS.REVIEW, TODO_STATUS.TODO, TODO_STATUS.ARCHIVED],
  [TODO_STATUS.ARCHIVED]: [TODO_STATUS.TODO]
}

// Helper functions
export const getStatusConfig = (status) => {
  return STATUS_CONFIG[status] || STATUS_CONFIG[TODO_STATUS.TODO]
}

export const getValidTransitions = (currentStatus) => {
  return STATUS_TRANSITIONS[currentStatus] || []
}

export const getAllStatuses = () => {
  return Object.values(TODO_STATUS)
}

// @CODE:FRONTEND-STATUS-CONSTANTS-001