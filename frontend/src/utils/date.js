import { format, formatDistanceToNow, parseISO } from 'date-fns'

export const formatDate = (dateString) => {
  if (!dateString) return null
  try {
    const date = parseISO(dateString)
    return format(date, 'MMM dd, yyyy')
  } catch (error) {
    return null
  }
}

export const formatRelativeTime = (dateString) => {
  if (!dateString) return null
  try {
    const date = parseISO(dateString)
    return formatDistanceToNow(date, { addSuffix: true })
  } catch (error) {
    return null
  }
}

export const formatDateTime = (dateString) => {
  if (!dateString) return null
  try {
    const date = parseISO(dateString)
    return format(date, 'MMM dd, yyyy hh:mm a')
  } catch (error) {
    return null
  }
}

export const formatDateTimeDisplay = (dateString) => {
  if (!dateString) return null
  try {
    const date = parseISO(dateString)
    return format(date, 'MMM d, yyyy')
  } catch (error) {
    return null
  }
}

export const formatTimeDisplay = (dateString) => {
  if (!dateString) return null
  try {
    const date = parseISO(dateString)
    return format(date, 'hh:mm a')
  } catch (error) {
    return null
  }
}

export const formatTimeUTC = (dateString) => {
  if (!dateString) return null
  try {
    const date = parseISO(dateString)
    const utcDate = new Date(date.getTime() + date.getTimezoneOffset() * 60000)
    return format(utcDate, 'hh:mm a')
  } catch (error) {
    return null
  }
}

export const isOverdue = (dateString) => {
  if (!dateString) return false
  try {
    const date = parseISO(dateString)
    return date < new Date()
  } catch (error) {
    return false
  }
}