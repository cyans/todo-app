import React, { useState, useEffect } from 'react'
import useTodoStore from '../store/todoStore'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'

// @CODE:FILTER-SEARCH-004:SAVED

const SavedSearch = ({ className = '' }) => {
  const {
    savedSearches,
    searchQuery,
    searchFilters,
    saveSearch,
    loadSavedSearches,
    deleteSavedSearch,
    searchTodos,
    setSearchQuery,
    setSearchFilters,
    clearSearch
  } = useTodoStore()

  const [searchName, setSearchName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  // Load saved searches on component mount
  useEffect(() => {
    if (loadSavedSearches && typeof loadSavedSearches === 'function') {
      try {
        const result = loadSavedSearches()
        if (result && typeof result.catch === 'function') {
          result.catch(err => {
            console.error('Failed to load saved searches:', err)
          })
        }
      } catch (err) {
        console.error('Failed to load saved searches:', err)
      }
    }
  }, [loadSavedSearches])

  // Check if current search can be saved
  const canSaveSearch = searchQuery.trim() || Object.keys(searchFilters).length > 0

  // Handle save search
  const handleSaveSearch = async () => {
    if (!searchName.trim()) {
      setError('검색 이름을 입력하세요')
      return
    }

    if (!canSaveSearch) {
      setError('저장할 검색이 없습니다')
      return
    }

    if (!saveSearch) {
      setError('저장 기능을 사용할 수 없습니다')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      await saveSearch({
        name: searchName.trim(),
        query: searchQuery,
        filters: searchFilters
      })
      setSearchName('')
    } catch (err) {
      setError('검색 저장에 실패했습니다')
    } finally {
      setIsLoading(false)
    }
  }

  // Handle apply saved search
  const handleApplySearch = (savedSearch) => {
    setSearchQuery(savedSearch.query)
    setSearchFilters(savedSearch.filters)
    searchTodos(savedSearch.query, savedSearch.filters)
  }

  // Handle delete saved search
  const handleDeleteSearch = async (id) => {
    if (!deleteSavedSearch) return

    try {
      await deleteSavedSearch(id)
    } catch (err) {
      setError('검색 삭제에 실패했습니다')
    }
  }

  // Format date
  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'yyyy년 M월 d일', { locale: ko })
    } catch {
      return '알 수 없는 날짜'
    }
  }

  return (
    <div className={`bg-white border border-gray-200 rounded-lg shadow-sm ${className}`} role="region" aria-label="저장된 검색">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">저장된 검색</h3>
      </div>

      <div className="p-4 space-y-4">
        {/* Save Current Search */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            현재 검색 저장
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              placeholder="검색 이름 입력"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={handleSaveSearch}
              disabled={!canSaveSearch || isLoading || !searchName.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? '저장 중...' : '저장'}
            </button>
          </div>
          {error && (
            <p className="mt-1 text-sm text-red-600" role="alert">
              {error}
            </p>
          )}
        </div>

        {/* Saved Searches List */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">저장된 검색 목록</h4>
          {savedSearches.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <svg
                className="w-12 h-12 mx-auto mb-2 text-gray-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                />
              </svg>
              <p className="text-sm">저장된 검색이 없습니다</p>
              <p className="text-xs mt-1">자주 사용하는 검색을 저장해보세요</p>
            </div>
          ) : (
            <div className="space-y-2">
              {savedSearches.map((savedSearch) => (
                <div
                  key={savedSearch.id}
                  className="flex items-center justify-between p-3 border border-gray-200 rounded-md hover:bg-gray-50"
                >
                  <div className="flex-1 min-w-0">
                    <button
                      type="button"
                      onClick={() => handleApplySearch(savedSearch)}
                      className="text-left w-full hover:text-blue-600 focus:outline-none focus:text-blue-600"
                    >
                      <div className="font-medium text-gray-900 truncate">
                        {savedSearch.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatDate(savedSearch.createdAt)}
                        {savedSearch.usageCount > 0 && (
                          <span className="ml-2">
                            {savedSearch.usageCount}회 사용
                          </span>
                        )}
                      </div>
                      {(savedSearch.query || Object.keys(savedSearch.filters || {}).length > 0) && (
                        <div className="text-xs text-gray-400 mt-1">
                          {savedSearch.query && (
                            <span className="inline-flex items-center">
                              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                              </svg>
                              {savedSearch.query}
                            </span>
                          )}
                          {savedSearch.filters && Object.keys(savedSearch.filters).length > 0 && (
                            <span className="ml-2 inline-flex items-center">
                              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                              </svg>
                              필터 {Object.keys(savedSearch.filters).length}개
                            </span>
                          )}
                        </div>
                      )}
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteSearch(savedSearch.id)}
                    className="ml-2 p-1 text-gray-400 hover:text-red-600 focus:outline-none focus:text-red-600"
                    aria-label={`${savedSearch.name} 삭제`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default SavedSearch