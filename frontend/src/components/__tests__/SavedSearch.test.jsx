import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import SavedSearch from '../SavedSearch'
import useTodoStore from '../../store/todoStore'

// Mock the todo store
vi.mock('../../store/todoStore')

// @TEST:FILTER-SEARCH-004:SAVED

describe('SavedSearch', () => {
  const mockSaveSearch = vi.fn()
  const mockLoadSavedSearches = vi.fn()
  const mockDeleteSavedSearch = vi.fn()
  const mockSearchTodos = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()

    // Mock store state
    useTodoStore.mockReturnValue({
      savedSearches: [],
      searchQuery: '',
      searchFilters: {},
      saveSearch: mockSaveSearch,
      loadSavedSearches: mockLoadSavedSearches,
      deleteSavedSearch: mockDeleteSavedSearch,
      searchTodos: mockSearchTodos,
      setSearchQuery: vi.fn(),
      setSearchFilters: vi.fn(),
      clearSearch: vi.fn(),
    })
  })

  it('renders saved search panel', () => {
    render(<SavedSearch />)

    expect(screen.getByText('저장된 검색')).toBeInTheDocument()
    expect(screen.getByText('현재 검색 저장')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('검색 이름 입력')).toBeInTheDocument()
  })

  it('displays saved searches when available', () => {
    const savedSearches = [
      {
        id: '1',
        name: 'Urgent Tasks',
        query: 'urgent',
        filters: { priority: 'high' },
        createdAt: '2024-01-01T00:00:00Z',
        usageCount: 5
      },
      {
        id: '2',
        name: 'This Week',
        query: '',
        filters: { dateFrom: '2024-01-01', dateTo: '2024-01-07' },
        createdAt: '2024-01-02T00:00:00Z',
        usageCount: 3
      }
    ]

    useTodoStore.mockReturnValue({
      savedSearches,
      searchQuery: '',
      searchFilters: {},
      saveSearch: mockSaveSearch,
      loadSavedSearches: mockLoadSavedSearches,
      deleteSavedSearch: mockDeleteSavedSearch,
      searchTodos: mockSearchTodos,
      setSearchQuery: vi.fn(),
      setSearchFilters: vi.fn(),
      clearSearch: vi.fn(),
    })

    render(<SavedSearch />)

    expect(screen.getByText('Urgent Tasks')).toBeInTheDocument()
    expect(screen.getByText('This Week')).toBeInTheDocument()
    expect(screen.getByText('5회 사용')).toBeInTheDocument()
    expect(screen.getByText('3회 사용')).toBeInTheDocument()
  })

  it('shows empty state when no saved searches', () => {
    render(<SavedSearch />)

    expect(screen.getByText('저장된 검색이 없습니다')).toBeInTheDocument()
    expect(screen.getByText('자주 사용하는 검색을 저장해보세요')).toBeInTheDocument()
  })

  it('saves current search when save button is clicked', async () => {
    useTodoStore.mockReturnValue({
      savedSearches: [],
      searchQuery: 'urgent',
      searchFilters: { priority: 'high' },
      saveSearch: mockSaveSearch,
      loadSavedSearches: mockLoadSavedSearches,
      deleteSavedSearch: mockDeleteSavedSearch,
      searchTodos: mockSearchTodos,
      setSearchQuery: vi.fn(),
      setSearchFilters: vi.fn(),
      clearSearch: vi.fn(),
    })

    render(<SavedSearch />)

    const nameInput = screen.getByPlaceholderText('검색 이름 입력')
    const saveButton = screen.getByText('저장')

    fireEvent.change(nameInput, { target: { value: 'My Search' } })
    fireEvent.click(saveButton)

    await waitFor(() => {
      expect(mockSaveSearch).toHaveBeenCalledWith({
        name: 'My Search',
        query: 'urgent',
        filters: { priority: 'high' }
      })
    })
  })

  it('applies saved search when clicked', async () => {
    const mockSetSearchQuery = vi.fn()
    const mockSetSearchFilters = vi.fn()

    const savedSearches = [
      {
        id: '1',
        name: 'Urgent Tasks',
        query: 'urgent',
        filters: { priority: 'high' },
        createdAt: '2024-01-01T00:00:00Z',
        usageCount: 5
      }
    ]

    useTodoStore.mockReturnValue({
      savedSearches,
      searchQuery: '',
      searchFilters: {},
      saveSearch: mockSaveSearch,
      loadSavedSearches: mockLoadSavedSearches,
      deleteSavedSearch: mockDeleteSavedSearch,
      searchTodos: mockSearchTodos,
      setSearchQuery: mockSetSearchQuery,
      setSearchFilters: mockSetSearchFilters,
      clearSearch: vi.fn(),
    })

    render(<SavedSearch />)

    const searchItem = screen.getByText('Urgent Tasks')
    fireEvent.click(searchItem)

    expect(mockSetSearchQuery).toHaveBeenCalledWith('urgent')
    expect(mockSetSearchFilters).toHaveBeenCalledWith({ priority: 'high' })
    expect(mockSearchTodos).toHaveBeenCalledWith('urgent', { priority: 'high' })
  })

  it('deletes saved search when delete button is clicked', async () => {
    const savedSearches = [
      {
        id: '1',
        name: 'Urgent Tasks',
        query: 'urgent',
        filters: { priority: 'high' },
        createdAt: '2024-01-01T00:00:00Z',
        usageCount: 5
      }
    ]

    useTodoStore.mockReturnValue({
      savedSearches,
      searchQuery: '',
      searchFilters: {},
      saveSearch: mockSaveSearch,
      loadSavedSearches: mockLoadSavedSearches,
      deleteSavedSearch: mockDeleteSavedSearch,
      searchTodos: mockSearchTodos,
      setSearchQuery: vi.fn(),
      setSearchFilters: vi.fn(),
      clearSearch: vi.fn(),
    })

    render(<SavedSearch />)

    const deleteButton = screen.getByLabelText('Urgent Tasks 삭제')
    fireEvent.click(deleteButton)

    await waitFor(() => {
      expect(mockDeleteSavedSearch).toHaveBeenCalledWith('1')
    })
  })

  it('disables save button when no search to save', () => {
    useTodoStore.mockReturnValue({
      savedSearches: [],
      searchQuery: '',
      searchFilters: {},
      saveSearch: mockSaveSearch,
      loadSavedSearches: mockLoadSavedSearches,
      deleteSavedSearch: mockDeleteSavedSearch,
      searchTodos: mockSearchTodos,
      setSearchQuery: vi.fn(),
      setSearchFilters: vi.fn(),
      clearSearch: vi.fn(),
    })

    render(<SavedSearch />)

    const saveButton = screen.getByText('저장')
    expect(saveButton).toBeDisabled()
  })

  it('enables save button when there is search to save', () => {
    useTodoStore.mockReturnValue({
      savedSearches: [],
      searchQuery: 'test',
      searchFilters: { status: 'done' },
      saveSearch: mockSaveSearch,
      loadSavedSearches: mockLoadSavedSearches,
      deleteSavedSearch: mockDeleteSavedSearch,
      searchTodos: mockSearchTodos,
      setSearchQuery: vi.fn(),
      setSearchFilters: vi.fn(),
      clearSearch: vi.fn(),
    })

    render(<SavedSearch />)

    // Enter a name to enable the save button
    const nameInput = screen.getByPlaceholderText('검색 이름 입력')
    fireEvent.change(nameInput, { target: { value: 'My Search' } })

    const saveButton = screen.getByText('저장')
    expect(saveButton).not.toBeDisabled()
  })

  it('shows error message when save fails', async () => {
    mockSaveSearch.mockRejectedValue(new Error('Save failed'))

    useTodoStore.mockReturnValue({
      savedSearches: [],
      searchQuery: 'test',
      searchFilters: {},
      saveSearch: mockSaveSearch,
      loadSavedSearches: mockLoadSavedSearches,
      deleteSavedSearch: mockDeleteSavedSearch,
      searchTodos: mockSearchTodos,
      setSearchQuery: vi.fn(),
      setSearchFilters: vi.fn(),
      clearSearch: vi.fn(),
    })

    render(<SavedSearch />)

    const nameInput = screen.getByPlaceholderText('검색 이름 입력')
    const saveButton = screen.getByText('저장')

    fireEvent.change(nameInput, { target: { value: 'My Search' } })
    fireEvent.click(saveButton)

    await waitFor(() => {
      expect(screen.getByText('검색 저장에 실패했습니다')).toBeInTheDocument()
    })
  })

  it('loads saved searches on component mount', () => {
    render(<SavedSearch />)

    expect(mockLoadSavedSearches).toHaveBeenCalled()
  })

  it('applies custom className when provided', () => {
    render(<SavedSearch className="custom-saved-search" />)

    const container = screen.getByRole('region')
    expect(container).toHaveClass('custom-saved-search')
  })

  it('formats creation date correctly', () => {
    const savedSearches = [
      {
        id: '1',
        name: 'Test Search',
        query: 'test',
        filters: {},
        createdAt: '2024-01-15T10:30:00Z',
        usageCount: 1
      }
    ]

    useTodoStore.mockReturnValue({
      savedSearches,
      searchQuery: '',
      searchFilters: {},
      saveSearch: mockSaveSearch,
      loadSavedSearches: mockLoadSavedSearches,
      deleteSavedSearch: mockDeleteSavedSearch,
      searchTodos: mockSearchTodos,
      setSearchQuery: vi.fn(),
      setSearchFilters: vi.fn(),
      clearSearch: vi.fn(),
    })

    render(<SavedSearch />)

    expect(screen.getByText('2024년 1월 15일')).toBeInTheDocument()
  })
})