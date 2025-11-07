import React, { useState, useEffect } from 'react'
import useTodoStore from '../store/todoStore'

// @CODE:FILTER-SEARCH-004:UI:FILTER

const AdvancedFilter = ({ className = '', onFilterChange }) => {
  const { searchFilters, searchTodos, setSearchFilters, clearSearch } = useTodoStore()

  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    tags: [],
    dateFrom: '',
    dateTo: ''
  })

  const [tagInput, setTagInput] = useState('')
  const [isExpanded, setIsExpanded] = useState(true)
  const [dateError, setDateError] = useState('')

  // Initialize filters from store
  useEffect(() => {
    setFilters(searchFilters)
  }, [searchFilters])

  // Calculate active filter count
  const getFilterCount = () => {
    let count = 0
    if (filters.status) count++
    if (filters.priority) count++
    if (filters.tags && filters.tags.length > 0) count += filters.tags.length
    if (filters.dateFrom) count++
    if (filters.dateTo) count++
    return count
  }

  // Handle filter changes
  const handleFilterChange = (field, value) => {
    const newFilters = { ...filters, [field]: value }

    // Validate date range
    if (field === 'dateFrom' || field === 'dateTo') {
      if (newFilters.dateFrom && newFilters.dateTo) {
        if (newFilters.dateTo < newFilters.dateFrom) {
          setDateError('종료일은 시작일보다 이전일 수 없습니다.')
          return
        }
      }
      setDateError('')
    }

    setFilters(newFilters)
    setSearchFilters(newFilters)
    onFilterChange?.(newFilters)
  }

  // Handle tag input
  const handleTagInputKeyDown = (e) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault()
      const currentTags = filters.tags || []
      if (!currentTags.includes(tagInput.trim())) {
        const newTags = [...currentTags, tagInput.trim()]
        handleFilterChange('tags', newTags)
      }
      setTagInput('')
    }
  }

  // Remove tag
  const removeTag = (tagToRemove) => {
    const currentTags = filters.tags || []
    const newTags = currentTags.filter(tag => tag !== tagToRemove)
    handleFilterChange('tags', newTags)
  }

  // Apply filters
  const applyFilters = () => {
    searchTodos('', filters)
  }

  // Clear all filters
  const clearAllFilters = () => {
    const emptyFilters = {
      status: '',
      priority: '',
      tags: [],
      dateFrom: '',
      dateTo: ''
    }
    setFilters(emptyFilters)
    setSearchFilters(emptyFilters)
    setDateError('')
    setTagInput('')
    clearSearch()
    onFilterChange?.(emptyFilters)
  }

  // Toggle panel expansion
  const togglePanel = () => {
    setIsExpanded(!isExpanded)
  }

  const filterCount = getFilterCount()

  return (
    <div className={`bg-white border border-gray-200 rounded-lg shadow-sm ${className}`} role="region" aria-label="고급 필터">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-medium text-gray-900">고급 필터</h3>
          {filterCount > 0 && (
            <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
              {filterCount}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={togglePanel}
          className="p-1 text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600"
          aria-label={isExpanded ? '필터 패널 접기' : '필터 패널 펼치기'}
        >
          <svg
            className={`w-5 h-5 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* Filter Content */}
      {isExpanded && (
        <div className="p-4 space-y-4">
          {/* Status Filter */}
          <div>
            <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-1">
              상태
            </label>
            <select
              id="status-filter"
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">전체</option>
              <option value="todo">할 일</option>
              <option value="in_progress">진행 중</option>
              <option value="review">검토</option>
              <option value="done">완료</option>
              <option value="archived">보관</option>
            </select>
          </div>

          {/* Priority Filter */}
          <div>
            <label htmlFor="priority-filter" className="block text-sm font-medium text-gray-700 mb-1">
              우선순위
            </label>
            <select
              id="priority-filter"
              value={filters.priority}
              onChange={(e) => handleFilterChange('priority', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">전체</option>
              <option value="low">낮음</option>
              <option value="medium">보통</option>
              <option value="high">높음</option>
              <option value="urgent">긴급</option>
            </select>
          </div>

          {/* Tags Filter */}
          <div>
            <label htmlFor="tags-filter" className="block text-sm font-medium text-gray-700 mb-1">
              태그
            </label>
            <div className="space-y-2">
              <input
                id="tags-filter"
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagInputKeyDown}
                placeholder="태그를 입력하고 Enter를 누르세요"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {filters.tags && filters.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {filters.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 px-2 py-1 text-sm bg-gray-100 text-gray-700 rounded-md"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="text-gray-400 hover:text-gray-600 focus:outline-none"
                        aria-label={`Remove ${tag} tag`}
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Date Range Filter */}
          <div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="date-from" className="block text-sm font-medium text-gray-700 mb-1">
                  시작일
                </label>
                <input
                  id="date-from"
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label htmlFor="date-to" className="block text-sm font-medium text-gray-700 mb-1">
                  종료일
                </label>
                <input
                  id="date-to"
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            {dateError && (
              <p className="mt-1 text-sm text-red-600" role="alert">
                {dateError}
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={applyFilters}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              필터 적용
            </button>
            <button
              type="button"
              onClick={clearAllFilters}
              className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              필터 초기화
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdvancedFilter