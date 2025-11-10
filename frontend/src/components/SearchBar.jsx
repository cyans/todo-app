/* @CODE:TAG-UI-RESPONSIVE-003 - Responsive SearchBar component */

import React, { memo, useState, useCallback, useRef, useEffect, useMemo } from 'react'
import PropTypes from 'prop-types'

// Debounce utility function
const debounce = (func, delay) => {
  let timeoutId
  return (...args) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func.apply(null, args), delay)
  }
}

// Voice search hook
const useVoiceSearch = (onTranscript, onVoiceStart, onVoiceEnd) => {
  const [isListening, setIsListening] = useState(false)
  const recognitionRef = useRef(null)

  useEffect(() => {
    // Check if browser supports Speech Recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition

    if (!SpeechRecognition) {
      return
    }

    const recognition = new SpeechRecognition()
    recognition.continuous = false
    recognition.interimResults = false
    recognition.lang = 'en-US'

    recognition.onstart = () => {
      setIsListening(true)
      onVoiceStart?.()
    }

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript
      onTranscript?.(transcript)
    }

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error)
      setIsListening(false)
      onVoiceEnd?.()
    }

    recognition.onend = () => {
      setIsListening(false)
      onVoiceEnd?.()
    }

    recognitionRef.current = recognition

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [onTranscript, onVoiceStart, onVoiceEnd])

  const startListening = useCallback(() => {
    if (recognitionRef.current && !isListening) {
      recognitionRef.current.start()
    }
  }, [isListening])

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop()
    }
  }, [isListening])

  return {
    isListening,
    startListening,
    stopListening,
    isSupported: !!(window.SpeechRecognition || window.webkitSpeechRecognition)
  }
}

export const SearchBar = memo(({
  value = '',
  onChange,
  onSearch,
  onClear,
  placeholder = 'Search...',
  loading = false,
  error = null,
  suggestions = [],
  onSuggestionSelect,
  debounceMs = 300,
  enableVoiceSearch = false,
  autoFocus = false,
  className = '',
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1)
  const inputRef = useRef(null)
  const suggestionsRef = useRef(null)

  // Voice search integration
  const {
    isListening,
    startListening,
    stopListening,
    isSupported: voiceSearchSupported
  } = useVoiceSearch(
    useCallback((transcript) => {
      onChange?.(transcript)
      onSearch?.(transcript)
    }, [onChange, onSearch]),
    useCallback(() => {
      // Voice search started
    }, []),
    useCallback(() => {
      // Voice search ended
    }, [])
  )

  // Debounced search function
  const debouncedSearch = useMemo(
    () => debounce(onSearch, debounceMs),
    [onSearch, debounceMs]
  )

  // Handle input change
  const handleInputChange = useCallback((e) => {
    const newValue = e.target.value
    onChange?.(newValue)
    setSelectedSuggestionIndex(-1)

    // Trigger debounced search
    if (newValue.trim()) {
      debouncedSearch(newValue)
    }

    // Show suggestions if available and focused
    if (isFocused && suggestions.length > 0) {
      setShowSuggestions(true)
    }
  }, [onChange, debouncedSearch, isFocused, suggestions.length])

  // Handle form submission
  const handleSubmit = useCallback((e) => {
    e.preventDefault()
    onSearch?.(value)
    setShowSuggestions(false)
  }, [onSearch, value])

  // Handle clear action
  const handleClear = useCallback(() => {
    onChange?.('')
    onClear?.()
    inputRef.current?.focus()
    setShowSuggestions(false)
  }, [onChange, onClear])

  // Handle focus events
  const handleFocus = useCallback(() => {
    setIsFocused(true)
    if (suggestions.length > 0) {
      setShowSuggestions(true)
    }
  }, [suggestions.length])

  const handleBlur = useCallback((e) => {
    // Delay hiding suggestions to allow clicking on them
    setTimeout(() => {
      if (!suggestionsRef.current?.contains(e.relatedTarget)) {
        setShowSuggestions(false)
        setIsFocused(false)
      }
    }, 150)
  }, [])

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e) => {
    if (!showSuggestions || suggestions.length === 0) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedSuggestionIndex(prev =>
          prev < suggestions.length - 1 ? prev + 1 : 0
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedSuggestionIndex(prev =>
          prev > 0 ? prev - 1 : suggestions.length - 1
        )
        break
      case 'Enter':
        e.preventDefault()
        if (selectedSuggestionIndex >= 0) {
          const selectedSuggestion = suggestions[selectedSuggestionIndex]
          onSuggestionSelect?.(selectedSuggestion)
          setShowSuggestions(false)
        } else {
          handleSubmit(e)
        }
        break
      case 'Escape':
        setShowSuggestions(false)
        setSelectedSuggestionIndex(-1)
        inputRef.current?.focus()
        break
    }
  }, [showSuggestions, suggestions, selectedSuggestionIndex, onSuggestionSelect, handleSubmit])

  // Handle suggestion selection
  const handleSuggestionClick = useCallback((suggestion) => {
    onSuggestionSelect?.(suggestion)
    onChange?.(suggestion)
    setShowSuggestions(false)
    inputRef.current?.focus()
  }, [onChange, onSuggestionSelect])

  // Handle voice search toggle
  const handleVoiceSearch = useCallback(() => {
    if (isListening) {
      stopListening()
    } else {
      startListening()
    }
  }, [isListening, startListening, stopListening])

  // Filter suggestions based on current input
  const filteredSuggestions = useMemo(() => {
    if (!value.trim()) return suggestions

    return suggestions.filter(suggestion =>
      suggestion.toLowerCase().includes(value.toLowerCase())
    )
  }, [suggestions, value])

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (inputRef.current && !inputRef.current.contains(e.target) &&
          !suggestionsRef.current?.contains(e.target)) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div
      data-testid="search-bar"
      className={`
        search-bar
        mobile-first-base
        ${isFocused ? 'search-bar--focused' : ''}
        ${loading ? 'search-bar--loading' : ''}
        ${error ? 'search-bar--error' : ''}
        ${className}
      `}
      {...props}
    >
      <form
        role="search"
        className="search-bar__form flex flex--row mobile-first-base"
        onSubmit={handleSubmit}
      >
        {/* Search Input Container */}
        <div className="search-bar__input-container flex flex--row flex--items-center mobile-first-base">
          {/* Search Icon */}
          <div className="search-bar__icon" aria-hidden="true">
            🔍
          </div>

          {/* Search Input */}
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={handleInputChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className={`
              search-bar__input
              responsive-text
              mobile-first-base
              ${isFocused ? 'search-bar__input--focused' : ''}
            `}
            aria-label={placeholder}
            autoComplete="off"
            autoFocus={autoFocus}
            disabled={loading}
          />

          {/* Clear Button */}
          {value && (
            <button
              type="button"
              onClick={handleClear}
              className="touch-target search-bar__clear-btn"
              aria-label="Clear search"
              disabled={loading}
            >
              ✕
            </button>
          )}

          {/* Voice Search Button */}
          {enableVoiceSearch && voiceSearchSupported && (
            <button
              type="button"
              onClick={handleVoiceSearch}
              className={`
                touch-target
                search-bar__voice-btn
                ${isListening ? 'voice-active' : ''}
              `}
              aria-label={isListening ? 'Stop voice search' : 'Start voice search'}
              disabled={loading}
            >
              {isListening ? '🎙️' : '🎤'}
            </button>
          )}
        </div>

        {/* Search Button */}
        <button
          type="submit"
          className="touch-target search-bar__button"
          aria-label="Submit search"
          disabled={loading || !value.trim()}
        >
          {loading ? (
            <span className="search-bar__spinner" aria-hidden="true">
              ⏳
            </span>
          ) : (
            <span aria-hidden="true">Search</span>
          )}
        </button>
      </form>

      {/* Loading State */}
      {loading && (
        <div data-testid="search-loading" className="search-bar__loading">
          <div className="search-bar__spinner-small" aria-hidden="true"></div>
          <span className="responsive-text">Searching...</span>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div data-testid="search-error" className="search-bar__error" role="alert">
          <span className="responsive-text text-red-600">{error}</span>
        </div>
      )}

      {/* Search Suggestions */}
      {showSuggestions && filteredSuggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          data-testid="search-suggestions"
          className="search-bar__suggestions"
          role="listbox"
        >
          {filteredSuggestions.map((suggestion, index) => (
            <button
              key={suggestion}
              type="button"
              role="option"
              className={`
                touch-target
                search-bar__suggestion
                ${index === selectedSuggestionIndex ? 'search-bar__suggestion--selected' : ''}
              `}
              onClick={() => handleSuggestionClick(suggestion)}
              aria-selected={index === selectedSuggestionIndex}
            >
              <span className="search-bar__suggestion-text responsive-text">
                {suggestion}
              </span>
              {index === selectedSuggestionIndex && (
                <span className="search-bar__suggestion-icon" aria-hidden="true">
                  ↵
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Screen reader announcements */}
      <div className="sr-only" role="status" aria-live="polite">
        {isListening && 'Voice search is active'}
        {loading && 'Searching'}
        {filteredSuggestions.length > 0 && `${filteredSuggestions.length} suggestions available`}
      </div>
    </div>
  )
})

SearchBar.displayName = 'SearchBar'

SearchBar.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func,
  onSearch: PropTypes.func,
  onClear: PropTypes.func,
  placeholder: PropTypes.string,
  loading: PropTypes.bool,
  error: PropTypes.string,
  suggestions: PropTypes.arrayOf(PropTypes.string),
  onSuggestionSelect: PropTypes.func,
  debounceMs: PropTypes.number,
  enableVoiceSearch: PropTypes.bool,
  autoFocus: PropTypes.bool,
  className: PropTypes.string
}

SearchBar.defaultProps = {
  value: '',
  placeholder: 'Search...',
  loading: false,
  error: null,
  suggestions: [],
  debounceMs: 300,
  enableVoiceSearch: false,
  autoFocus: false,
  className: ''
}