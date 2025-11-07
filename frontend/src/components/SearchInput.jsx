import React, { useState, useEffect, useRef, useCallback } from 'react'
import useTodoStore from '../store/todoStore'
import { debounce } from '../utils/debounce'

// @CODE:FILTER-SEARCH-004:UI:SEARCH

const SearchInput = ({ className = '', placeholder = '검색어를 입력하세요...', onSearch }) => {
  const {
    searchQuery,
    searchLoading,
    searchError,
    searchSuggestions,
    searchTodos,
    clearSearch,
    getSearchSuggestions,
    setSearchQuery
  } = useTodoStore()

  const [inputValue, setInputValue] = useState(searchQuery)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1)
  const inputRef = useRef(null)
  const suggestionsRef = useRef(null)

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce((query) => {
      if (query.trim()) {
        searchTodos(query)
        getSearchSuggestions(query)
      } else {
        clearSearch()
      }
    }, 300),
    [searchTodos, getSearchSuggestions, clearSearch]
  )

  // Handle input change
  const handleInputChange = (e) => {
    const value = e.target.value
    setInputValue(value)
    setSearchQuery(value)
    setSelectedSuggestionIndex(-1)

    if (value.trim()) {
      debouncedSearch(value)
    } else {
      clearSearch()
    }
  }

  // Handle key down for navigation
  const handleKeyDown = (e) => {
    if (!showSuggestions || searchSuggestions.length === 0) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedSuggestionIndex(prev =>
          prev < searchSuggestions.length - 1 ? prev + 1 : prev
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedSuggestionIndex(prev => prev > 0 ? prev - 1 : -1)
        break
      case 'Enter':
        e.preventDefault()
        if (selectedSuggestionIndex >= 0) {
          const selectedSuggestion = searchSuggestions[selectedSuggestionIndex]
          setInputValue(selectedSuggestion)
          setSearchQuery(selectedSuggestion)
          searchTodos(selectedSuggestion)
          setShowSuggestions(false)
          setSelectedSuggestionIndex(-1)
        } else {
          // Search with current input value
          searchTodos(inputValue)
        }
        break
      case 'Escape':
        setShowSuggestions(false)
        setSelectedSuggestionIndex(-1)
        inputRef.current?.focus()
        break
    }
  }

  // Handle suggestion click
  const handleSuggestionClick = (suggestion) => {
    setInputValue(suggestion)
    setSearchQuery(suggestion)
    searchTodos(suggestion)
    setShowSuggestions(false)
    setSelectedSuggestionIndex(-1)
    inputRef.current?.focus()
  }

  // Handle clear button
  const handleClear = () => {
    setInputValue('')
    setSearchQuery('')
    clearSearch()
    setShowSuggestions(false)
    setSelectedSuggestionIndex(-1)
    inputRef.current?.focus()
  }

  // Handle input focus
  const handleInputFocus = () => {
    if (searchSuggestions.length > 0) {
      setShowSuggestions(true)
    }
  }

  // Handle input blur
  const handleInputBlur = () => {
    // Delay hiding suggestions to allow click events
    setTimeout(() => {
      setShowSuggestions(false)
      setSelectedSuggestionIndex(-1)
    }, 150)
  }

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target) &&
        !inputRef.current.contains(event.target)
      ) {
        setShowSuggestions(false)
        setSelectedSuggestionIndex(-1)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // Update input value when searchQuery changes from external source
  useEffect(() => {
    if (searchQuery !== inputValue) {
      setInputValue(searchQuery)
    }
  }, [searchQuery, inputValue])

  // Show suggestions when available
  useEffect(() => {
    if (searchSuggestions.length > 0 && inputValue.trim()) {
      setShowSuggestions(true)
    } else {
      setShowSuggestions(false)
    }
  }, [searchSuggestions, inputValue])

  return (
    <div className={`relative ${className}`} role="search">
      {/* Search Input */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          placeholder={placeholder}
          className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          aria-label="검색어 입력"
          aria-expanded={showSuggestions}
          aria-haspopup="listbox"
          aria-describedby={searchError ? 'search-error' : undefined}
        />

        {/* Clear Button */}
        {inputValue && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-8 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600"
            aria-label="검색어 지우기"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}

        {/* Loading Spinner */}
        {searchLoading && (
          <div
            className="absolute right-3 top-1/2 transform -translate-y-1/2"
            role="status"
            aria-label="검색 중"
          >
            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </div>

      {/* Search Error */}
      {searchError && (
        <div id="search-error" className="mt-1 text-sm text-red-600" role="alert">
          {searchError}
        </div>
      )}

      {/* Search Suggestions */}
      {showSuggestions && searchSuggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto"
          role="listbox"
        >
          {searchSuggestions.map((suggestion, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handleSuggestionClick(suggestion)}
              className={`w-full px-4 py-2 text-left hover:bg-gray-100 focus:outline-none focus:bg-gray-100 ${
                index === selectedSuggestionIndex ? 'bg-gray-100' : ''
              }`}
              role="option"
              aria-selected={index === selectedSuggestionIndex}
            >
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                {suggestion}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default SearchInput