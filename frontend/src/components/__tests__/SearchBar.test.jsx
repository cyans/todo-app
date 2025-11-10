/* @TEST:TAG-UI-RESPONSIVE-003 - Responsive SearchBar component tests */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SearchBar } from '../SearchBar'

describe('SearchBar Component', () => {
  let mockProps
  let user

  beforeEach(() => {
    user = userEvent.setup()
    mockProps = {
      value: '',
      onChange: vi.fn(),
      onSearch: vi.fn(),
      onClear: vi.fn(),
      placeholder: 'Search todos...',
      loading: false,
      suggestions: [],
      onSuggestionSelect: vi.fn()
    }
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('Responsive Design Tests', () => {
    it('renders with responsive container classes', () => {
      render(<SearchBar {...mockProps} />)

      const searchBar = screen.getByTestId('search-bar')
      expect(searchBar).toHaveClass('search-bar', 'mobile-first-base')

      const form = screen.getByRole('search')
      expect(form).toHaveClass('search-bar__form', 'flex', 'flex--row')
    })

    it('adapts layout for different screen sizes', () => {
      render(<SearchBar {...mockProps} />)

      const searchInput = screen.getByRole('searchbox')
      expect(searchInput).toHaveClass('search-bar__input', 'responsive-text')

      const searchButton = screen.getByRole('button', { name: /search/i })
      expect(searchButton).toHaveClass('touch-target', 'search-bar__button')
    })

    it('handles mobile vs desktop layouts', () => {
      render(<SearchBar {...mockProps} />)

      const searchBar = screen.getByTestId('search-bar')

      // Should have mobile-first responsive classes
      expect(searchBar).toHaveClass('search-bar--responsive')
    })

    it('shows appropriate button sizes for touch devices', () => {
      render(<SearchBar {...mockProps} />)

      const searchButton = screen.getByRole('button', { name: /search/i })
      const clearButton = screen.queryByRole('button', { name: /clear/i })

      // Search button should always be visible and touch-friendly
      expect(searchButton).toHaveClass('touch-target')

      // Clear button should appear when there's text
      expect(clearButton).not.toBeInTheDocument()
    })
  })

  describe('Search Functionality', () => {
    it('handles text input with responsive feedback', async () => {
      render(<SearchBar {...mockProps} />)

      const searchInput = screen.getByRole('searchbox')

      await user.type(searchInput, 'test search')

      expect(mockProps.onChange).toHaveBeenCalledWith('test search')
      expect(searchInput).toHaveValue('test search')
    })

    it('submits search on form submission', async () => {
      render(<SearchBar {...mockProps} />)

      const searchInput = screen.getByRole('searchbox')
      const form = screen.getByRole('search')

      await user.type(searchInput, 'test query')
      await user.submit(form)

      expect(mockProps.onSearch).toHaveBeenCalledWith('test query')
    })

    it('submits search on button click', async () => {
      render(<SearchBar {...mockProps} />)

      const searchInput = screen.getByRole('searchbox')
      const searchButton = screen.getByRole('button', { name: /search/i })

      await user.type(searchInput, 'test query')
      await user.click(searchButton)

      expect(mockProps.onSearch).toHaveBeenCalledWith('test query')
    })

    it('clears search when clear button is clicked', async () => {
      render(<SearchBar {...mockProps} value="test search" />)

      const clearButton = screen.getByRole('button', { name: /clear/i })

      await user.click(clearButton)

      expect(mockProps.onClear).toHaveBeenCalled()
    })
  })

  describe('Touch Interactions', () => {
    it('provides touch-friendly input field', () => {
      render(<SearchBar {...mockProps} />)

      const searchInput = screen.getByRole('searchbox')

      // Should have appropriate size for touch interaction
      expect(searchInput).toHaveClass('search-bar__input')
    })

    it('shows visual feedback on touch interactions', async () => {
      render(<SearchBar {...mockProps} />)

      const searchButton = screen.getByRole('button', { name: /search/i })

      // Test touch feedback
      fireEvent.touchStart(searchButton)
      expect(searchButton).toHaveClass('touch-active')

      fireEvent.touchEnd(searchButton)
      expect(searchButton).not.toHaveClass('touch-active')
    })

    it('handles long press for mobile features', async () => {
      render(<SearchBar {...mockProps} />)

      const searchInput = screen.getByRole('searchbox')

      // Simulate long press
      fireEvent.touchStart(searchInput)
      fireEvent.touchEnd(searchInput, { changedTouches: [{ clientX: 100, clientY: 100 }] })

      expect(searchInput).toBeInTheDocument()
    })
  })

  describe('Search Suggestions', () => {
    it('displays suggestions with responsive design', () => {
      const suggestions = ['test todo 1', 'test todo 2', 'another task']
      render(<SearchBar {...mockProps} suggestions={suggestions} />)

      const suggestionsList = screen.getByTestId('search-suggestions')
      expect(suggestionsList).toHaveClass('search-bar__suggestions')

      const suggestionItems = screen.getAllByRole('option')
      expect(suggestionItems).toHaveLength(3)
    })

    it('handles suggestion selection with touch support', async () => {
      const suggestions = ['test todo 1', 'test todo 2']
      render(<SearchBar {...mockProps} suggestions={suggestions} />)

      const firstSuggestion = screen.getByRole('option', { name: 'test todo 1' })

      await user.click(firstSuggestion)

      expect(mockProps.onSuggestionSelect).toHaveBeenCalledWith('test todo 1')
    })

    it('navigates suggestions with keyboard', async () => {
      const suggestions = ['test todo 1', 'test todo 2']
      render(<SearchBar {...mockProps} suggestions={suggestions} />)

      const searchInput = screen.getByRole('searchbox')

      await user.click(searchInput)
      await user.keyboard('{ArrowDown}')
      await user.keyboard('{Enter}')

      expect(mockProps.onSuggestionSelect).toHaveBeenCalledWith('test todo 1')
    })

    it('filters suggestions based on input', async () => {
      const allSuggestions = ['test todo 1', 'test todo 2', 'another task']
      render(<SearchBar {...mockProps} suggestions={allSuggestions} />)

      const searchInput = screen.getByRole('searchbox')

      await user.type(searchInput, 'test')

      // Should show filtered suggestions
      const visibleSuggestions = screen.getAllByRole('option')
      expect(visibleSuggestions.length).toBeLessThanOrEqual(2)
    })
  })

  describe('Loading and Error States', () => {
    it('shows loading state with responsive spinner', () => {
      render(<SearchBar {...mockProps} loading={true} />)

      const loadingSpinner = screen.getByTestId('search-loading')
      expect(loadingSpinner).toHaveClass('search-bar__loading')

      const searchButton = screen.getByRole('button', { name: /search/i })
      expect(searchButton).toBeDisabled()
    })

    it('shows error state with responsive styling', () => {
      render(<SearchBar {...mockProps} error="Search failed" />)

      const errorMessage = screen.getByTestId('search-error')
      expect(errorMessage).toHaveClass('search-bar__error', 'responsive-text')
      expect(errorMessage).toHaveTextContent('Search failed')
    })
  })

  describe('Accessibility', () => {
    it('maintains accessibility in responsive design', () => {
      render(<SearchBar {...mockProps} />)

      const searchInput = screen.getByRole('searchbox')
      const searchButton = screen.getByRole('button', { name: /search/i })

      // Check ARIA attributes
      expect(searchInput).toHaveAttribute('aria-label', 'Search todos')
      expect(searchButton).toHaveAttribute('aria-label', 'Submit search')

      // Check form semantics
      const form = screen.getByRole('search')
      expect(form).toBeInTheDocument()
    })

    it('supports keyboard navigation', async () => {
      render(<SearchBar {...mockProps} />)

      const searchInput = screen.getByRole('searchbox')

      await user.tab()
      expect(searchInput).toHaveFocus()

      await user.keyboard('{Enter}')
      expect(mockProps.onSearch).toHaveBeenCalledWith('')
    })

    it('announces search results to screen readers', async () => {
      render(<SearchBar {...mockProps} />)

      const searchInput = screen.getByRole('searchbox')

      await user.type(searchInput, 'test')
      await user.keyboard('{Enter}')

      // Should announce search completion
      const liveRegion = screen.getByRole('status')
      expect(liveRegion).toBeInTheDocument()
    })
  })

  describe('Responsive Performance', () => {
    it('debounces search input for performance', async () => {
      render(<SearchBar {...mockProps} debounceMs={300} />)

      const searchInput = screen.getByRole('searchbox')

      await user.type(searchInput, 'test')

      // Should not trigger search immediately due to debounce
      expect(mockProps.onSearch).not.toHaveBeenCalled()

      // Wait for debounce
      await waitFor(
        () => {
          expect(mockProps.onSearch).toHaveBeenCalled()
        },
        { timeout: 400 }
      )
    })

    it('handles rapid input changes efficiently', async () => {
      render(<SearchBar {...mockProps} />)

      const searchInput = screen.getByRole('searchbox')

      // Rapid typing
      await user.type(searchInput, 'a{backspace}b{backspace}c')

      // Should handle gracefully without performance issues
      expect(searchInput).toHaveValue('c')
    })
  })

  describe('Voice Search Integration', () => {
    it('shows voice search button when supported', () => {
      // Mock Web Speech API
      global.SpeechRecognition = vi.fn()
      global.webkitSpeechRecognition = global.SpeechRecognition

      render(<SearchBar {...mockProps} enableVoiceSearch={true} />)

      const voiceButton = screen.getByRole('button', { name: /voice search/i })
      expect(voiceButton).toHaveClass('touch-target', 'search-bar__voice-btn')
    })

    it('handles voice search start', async () => {
      global.SpeechRecognition = vi.fn()
      global.webkitSpeechRecognition = global.SpeechRecognition

      render(<SearchBar {...mockProps} enableVoiceSearch={true} />)

      const voiceButton = screen.getByRole('button', { name: /voice search/i })

      await user.click(voiceButton)

      expect(voiceButton).toHaveClass('voice-active')
    })
  })

  describe('Edge Cases', () => {
    it('handles empty suggestions array gracefully', () => {
      render(<SearchBar {...mockProps} suggestions={[]} />)

      const suggestionsList = screen.queryByTestId('search-suggestions')
      expect(suggestionsList).not.toBeInTheDocument()
    })

    it('handles very long search terms gracefully', async () => {
      const longText = 'a'.repeat(1000)
      render(<SearchBar {...mockProps} />)

      const searchInput = screen.getByRole('searchbox')

      await user.type(searchInput, longText)

      expect(searchInput).toHaveValue(longText)
      expect(mockProps.onChange).toHaveBeenCalledWith(longText)
    })

    it('handles special characters in search input', async () => {
      const specialText = 'test@#$%^&*()_+-=[]{}|;:,.<>?'
      render(<SearchBar {...mockProps} />)

      const searchInput = screen.getByRole('searchbox')

      await user.type(searchInput, specialText)

      expect(searchInput).toHaveValue(specialText)
    })

    it('handles rapid focus/blur events', async () => {
      render(<SearchBar {...mockProps} />)

      const searchInput = screen.getByRole('searchbox')

      await user.click(searchInput)
      await user.tab()
      await user.click(searchInput)

      expect(searchInput).toHaveFocus()
    })
  })
})