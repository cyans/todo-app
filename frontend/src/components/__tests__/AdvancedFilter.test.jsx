import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import AdvancedFilter from '../AdvancedFilter'
import useTodoStore from '../../store/todoStore'

// Mock the todo store
vi.mock('../../store/todoStore')

// @TEST:FILTER-SEARCH-004:UI:FILTER

describe('AdvancedFilter', () => {
  const mockSetSearchFilters = vi.fn()
  const mockSearchTodos = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()

    // Mock store state
    useTodoStore.mockReturnValue({
      searchFilters: {},
      searchTodos: mockSearchTodos,
      setSearchFilters: mockSetSearchFilters,
      clearSearch: vi.fn(),
    })
  })

  it('renders filter panel with all filter options', () => {
    render(<AdvancedFilter />)

    expect(screen.getByText('고급 필터')).toBeInTheDocument()
    expect(screen.getByLabelText('상태')).toBeInTheDocument()
    expect(screen.getByLabelText('우선순위')).toBeInTheDocument()
    expect(screen.getByLabelText('태그')).toBeInTheDocument()
    expect(screen.getByLabelText('시작일')).toBeInTheDocument()
    expect(screen.getByLabelText('종료일')).toBeInTheDocument()
  })

  it('displays current filter values when provided', () => {
    const currentFilters = {
      status: 'done',
      priority: 'high',
      tags: ['urgent'],
      dateFrom: '2024-01-01',
      dateTo: '2024-12-31'
    }

    useTodoStore.mockReturnValue({
      searchFilters: currentFilters,
      searchTodos: mockSearchTodos,
      setSearchFilters: mockSetSearchFilters,
      clearSearch: vi.fn(),
    })

    render(<AdvancedFilter />)

    // Check that the component renders with filters
    expect(screen.getByDisplayValue('done')).toBeInTheDocument()
    expect(screen.getByDisplayValue('high')).toBeInTheDocument()
    expect(screen.getByDisplayValue('2024-01-01')).toBeInTheDocument()
    expect(screen.getByDisplayValue('2024-12-31')).toBeInTheDocument()
    expect(screen.getByText('urgent')).toBeInTheDocument()
  })

  it('calls setSearchFilters when status filter changes', () => {
    render(<AdvancedFilter />)

    const statusSelect = screen.getByLabelText('상태')
    fireEvent.change(statusSelect, { target: { value: 'done' } })

    expect(mockSetSearchFilters).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'done' })
    )
  })

  it('calls setSearchFilters when priority filter changes', () => {
    render(<AdvancedFilter />)

    const prioritySelect = screen.getByLabelText('우선순위')
    fireEvent.change(prioritySelect, { target: { value: 'urgent' } })

    expect(mockSetSearchFilters).toHaveBeenCalledWith(
      expect.objectContaining({ priority: 'urgent' })
    )
  })

  it('handles tag input correctly', async () => {
    render(<AdvancedFilter />)

    const tagInput = screen.getByLabelText('태그')
    fireEvent.change(tagInput, { target: { value: 'urgent' } })
    fireEvent.keyDown(tagInput, { key: 'Enter' })

    await waitFor(() => {
      expect(mockSetSearchFilters).toHaveBeenCalledWith(
        expect.objectContaining({ tags: ['urgent'] })
      )
    })
  })

  it('removes tags when remove button is clicked', () => {
    useTodoStore.mockReturnValue({
      searchFilters: { tags: ['urgent', 'work'] },
      searchTodos: mockSearchTodos,
      setSearchFilters: mockSetSearchFilters,
      clearSearch: vi.fn(),
    })

    render(<AdvancedFilter />)

    const removeButton = screen.getByLabelText('Remove urgent tag')
    fireEvent.click(removeButton)

    expect(mockSetSearchFilters).toHaveBeenCalledWith(
      expect.objectContaining({ tags: ['work'] })
    )
  })

  it('calls setSearchFilters when date range changes', () => {
    render(<AdvancedFilter />)

    const dateFromInput = screen.getByLabelText('시작일')
    const dateToInput = screen.getByLabelText('종료일')

    fireEvent.change(dateFromInput, { target: { value: '2024-01-01' } })
    fireEvent.change(dateToInput, { target: { value: '2024-12-31' } })

    expect(mockSetSearchFilters).toHaveBeenCalledWith(
      expect.objectContaining({
        dateFrom: '2024-01-01',
        dateTo: '2024-12-31'
      })
    )
  })

  it('applies filters when apply button is clicked', () => {
    const filters = {
      status: 'done',
      priority: 'high'
    }

    useTodoStore.mockReturnValue({
      searchFilters: filters,
      searchTodos: mockSearchTodos,
      setSearchFilters: mockSetSearchFilters,
      clearSearch: vi.fn(),
    })

    render(<AdvancedFilter />)

    const applyButton = screen.getByText('필터 적용')
    fireEvent.click(applyButton)

    expect(mockSearchTodos).toHaveBeenCalledWith('', filters)
  })

  it('clears all filters when clear button is clicked', () => {
    const filters = {
      status: 'done',
      priority: 'high',
      tags: ['urgent'],
      dateFrom: '2024-01-01',
      dateTo: '2024-12-31'
    }

    useTodoStore.mockReturnValue({
      searchFilters: filters,
      searchTodos: mockSearchTodos,
      setSearchFilters: mockSetSearchFilters,
      clearSearch: vi.fn(),
    })

    render(<AdvancedFilter />)

    const clearButton = screen.getByText('필터 초기화')
    fireEvent.click(clearButton)

    expect(mockSetSearchFilters).toHaveBeenCalledWith({
      status: '',
      priority: '',
      tags: [],
      dateFrom: '',
      dateTo: ''
    })
  })

  it('collapses and expands filter panel', () => {
    render(<AdvancedFilter />)

    // Initially expanded - find toggle button by its initial aria-label
    const toggleButton = screen.getByLabelText('필터 패널 접기')

    // Initially expanded
    expect(screen.getByText('상태')).toBeInTheDocument()

    // Collapse
    fireEvent.click(toggleButton)
    expect(screen.queryByText('상태')).not.toBeInTheDocument()

    // Expand again - find button with updated aria-label
    const expandButton = screen.getByLabelText('필터 패널 펼치기')
    fireEvent.click(expandButton)
    expect(screen.getByText('상태')).toBeInTheDocument()
  })

  it('shows filter count badge when filters are active', () => {
    const filters = {
      status: 'done',
      priority: 'high',
      tags: ['urgent', 'work']
    }

    useTodoStore.mockReturnValue({
      searchFilters: filters,
      searchTodos: mockSearchTodos,
      setSearchFilters: mockSetSearchFilters,
      clearSearch: vi.fn(),
    })

    render(<AdvancedFilter />)

    expect(screen.getByText('4')).toBeInTheDocument() // 3 filters + 1 for tags array length
  })

  it('validates date range (end date cannot be before start date)', () => {
    render(<AdvancedFilter />)

    const dateFromInput = screen.getByLabelText('시작일')
    const dateToInput = screen.getByLabelText('종료일')

    fireEvent.change(dateFromInput, { target: { value: '2024-12-31' } })
    fireEvent.change(dateToInput, { target: { value: '2024-01-01' } })

    expect(screen.getByText('종료일은 시작일보다 이전일 수 없습니다.')).toBeInTheDocument()
  })

  it('applies custom className when provided', () => {
    render(<AdvancedFilter className="custom-filter-panel" />)

    const container = screen.getByRole('region')
    expect(container).toHaveClass('custom-filter-panel')
  })
})