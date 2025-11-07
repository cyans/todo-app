import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import SearchInput from '../SearchInput'
import useTodoStore from '../../store/todoStore'

// Mock the todo store
vi.mock('../../store/todoStore')

// @TEST:FILTER-SEARCH-004:UI:SEARCH

describe('SearchInput', () => {
  const mockSearchTodos = vi.fn()
  const mockClearSearch = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()

    // Mock store state
    useTodoStore.mockReturnValue({
      searchQuery: '',
      searchResults: [],
      searchLoading: false,
      searchError: null,
      searchTodos: mockSearchTodos,
      clearSearch: mockClearSearch,
      searchSuggestions: [],
      setSearchQuery: vi.fn(),
      getSearchSuggestions: vi.fn().mockResolvedValue([]),
    })
  })

  it('renders search input with placeholder', () => {
    render(<SearchInput />)

    const input = screen.getByPlaceholderText('검색어를 입력하세요...')
    expect(input).toBeInTheDocument()
    expect(input).toHaveAttribute('type', 'text')
  })

  it('shows loading spinner when search is in progress', () => {
    useTodoStore.mockReturnValue({
      searchQuery: 'test',
      searchResults: [],
      searchLoading: true,
      searchError: null,
      searchTodos: mockSearchTodos,
      clearSearch: mockClearSearch,
      searchSuggestions: [],
      setSearchQuery: vi.fn(),
      getSearchSuggestions: vi.fn().mockResolvedValue([]),
    })

    render(<SearchInput />)

    expect(screen.getByRole('status')).toBeInTheDocument() // Loading spinner
  })

  it('displays search error when search fails', () => {
    useTodoStore.mockReturnValue({
      searchQuery: 'test',
      searchResults: [],
      searchLoading: false,
      searchError: 'Search failed',
      searchTodos: mockSearchTodos,
      clearSearch: mockClearSearch,
      searchSuggestions: [],
      setSearchQuery: vi.fn(),
      getSearchSuggestions: vi.fn().mockResolvedValue([]),
    })

    render(<SearchInput />)

    expect(screen.getByText('Search failed')).toBeInTheDocument()
  })

  it('calls search function with debounced input', async () => {
    render(<SearchInput />)

    const input = screen.getByPlaceholderText('검색어를 입력하세요...')

    // Type search query
    fireEvent.change(input, { target: { value: 'test query' } })

    // Wait for debounce (300ms)
    await waitFor(
      () => {
        expect(mockSearchTodos).toHaveBeenCalledWith('test query')
      },
      { timeout: 500 }
    )
  })

  it('does not call search immediately on each keystroke', async () => {
    render(<SearchInput />)

    const input = screen.getByPlaceholderText('검색어를 입력하세요...')

    // Type multiple characters quickly
    fireEvent.change(input, { target: { value: 't' } })
    fireEvent.change(input, { target: { value: 'te' } })
    fireEvent.change(input, { target: { value: 'tes' } })
    fireEvent.change(input, { target: { value: 'test' } })

    // Should not be called immediately
    expect(mockSearchTodos).not.toHaveBeenCalled()

    // Should be called only once after debounce
    await waitFor(
      () => {
        expect(mockSearchTodos).toHaveBeenCalledTimes(1)
        expect(mockSearchTodos).toHaveBeenCalledWith('test')
      },
      { timeout: 500 }
    )
  })

  it('clears search when clear button is clicked', () => {
    useTodoStore.mockReturnValue({
      searchQuery: 'test',
      searchResults: [],
      searchLoading: false,
      searchError: null,
      searchTodos: mockSearchTodos,
      clearSearch: mockClearSearch,
      searchSuggestions: [],
      setSearchQuery: vi.fn(),
      getSearchSuggestions: vi.fn().mockResolvedValue([]),
    })

    render(<SearchInput />)

    const clearButton = screen.getByLabelText('검색어 지우기')
    fireEvent.click(clearButton)

    expect(mockClearSearch).toHaveBeenCalled()
  })

  it('displays search suggestions when available', () => {
    useTodoStore.mockReturnValue({
      searchQuery: 'test',
      searchResults: [],
      searchLoading: false,
      searchError: null,
      searchTodos: mockSearchTodos,
      clearSearch: mockClearSearch,
      searchSuggestions: ['test todo', 'test task', 'another test'],
      setSearchQuery: vi.fn(),
      getSearchSuggestions: vi.fn().mockResolvedValue(['test todo', 'test task', 'another test']),
    })

    render(<SearchInput />)

    expect(screen.getByText('test todo')).toBeInTheDocument()
    expect(screen.getByText('test task')).toBeInTheDocument()
    expect(screen.getByText('another test')).toBeInTheDocument()
  })

  it('applies custom className when provided', () => {
    render(<SearchInput className="custom-search-input" />)

    const container = screen.getByRole('search') // Using role on the container
    expect(container).toHaveClass('custom-search-input')
  })

  it('handles keyboard navigation in suggestions', () => {
    useTodoStore.mockReturnValue({
      searchQuery: 'test',
      searchResults: [],
      searchLoading: false,
      searchError: null,
      searchTodos: mockSearchTodos,
      clearSearch: mockClearSearch,
      searchSuggestions: ['test todo', 'test task'],
      setSearchQuery: vi.fn(),
      getSearchSuggestions: vi.fn().mockResolvedValue(['test todo', 'test task']),
    })

    render(<SearchInput />)

    const input = screen.getByPlaceholderText('검색어를 입력하세요...')

    // Arrow down to first suggestion
    fireEvent.keyDown(input, { key: 'ArrowDown' })

    // Should highlight first suggestion (check for selection class instead of focus)
    const firstSuggestion = screen.getByText('test todo').closest('button')
    expect(firstSuggestion).toHaveClass('bg-gray-100')
  })

  it('submits search on Enter key press', async () => {
    useTodoStore.mockReturnValue({
      searchQuery: 'test query', // Pre-populate with search query
      searchResults: [],
      searchLoading: false,
      searchError: null,
      searchTodos: mockSearchTodos,
      clearSearch: mockClearSearch,
      searchSuggestions: [],
      setSearchQuery: vi.fn(),
      getSearchSuggestions: vi.fn().mockResolvedValue([]),
    })

    render(<SearchInput />)

    const input = screen.getByPlaceholderText('검색어를 입력하세요...')

    // Press Enter to submit search
    fireEvent.keyDown(input, { key: 'Enter' })

    // Should trigger search immediately
    expect(mockSearchTodos).toHaveBeenCalledWith('test query')
  })
})