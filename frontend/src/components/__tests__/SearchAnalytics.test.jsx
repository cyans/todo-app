import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import SearchAnalytics from '../SearchAnalytics'
import useTodoStore from '../../store/todoStore'

// Mock the todo store
vi.mock('../../store/todoStore')

// @TEST:FILTER-SEARCH-004:ANALYTICS

describe('SearchAnalytics', () => {
  const mockLoadSearchAnalytics = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()

    // Mock store state
    useTodoStore.mockReturnValue({
      searchAnalytics: null,
      loadSearchAnalytics: mockLoadSearchAnalytics,
    })
  })

  it('renders analytics dashboard', async () => {
    render(<SearchAnalytics />)

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByText('로딩 중...')).not.toBeInTheDocument()
    })

    expect(screen.getByText('검색 분석')).toBeInTheDocument()
  })

  it('displays loading state initially', () => {
    render(<SearchAnalytics />)

    // Should show loading initially
    expect(screen.getByText('로딩 중...')).toBeInTheDocument()
  })

  it('displays analytics data when available', () => {
    const analyticsData = {
      totalSearches: 150,
      uniqueQueries: 45,
      averageResults: 12.5,
      topQueries: [
        { query: 'urgent', count: 25, avgResults: 8 },
        { query: 'meeting', count: 18, avgResults: 15 },
        { query: 'project', count: 12, avgResults: 6 }
      ],
      searchTrends: [
        { date: '2024-01-01', count: 12 },
        { date: '2024-01-02', count: 18 },
        { date: '2024-01-03', count: 15 }
      ],
      filterUsage: {
        status: 85,
        priority: 62,
        tags: 43,
        dateRange: 28
      },
      noResultQueries: [
        { query: 'xyz', count: 3 },
        { query: 'test123', count: 2 }
      ]
    }

    useTodoStore.mockReturnValue({
      searchAnalytics: analyticsData,
      loadSearchAnalytics: mockLoadSearchAnalytics,
    })

    render(<SearchAnalytics />)

    expect(screen.getByText('150')).toBeInTheDocument() // total searches
    expect(screen.getByText('45')).toBeInTheDocument() // unique queries
    expect(screen.getByText('12.5')).toBeInTheDocument() // average results
    expect(screen.getByText('urgent')).toBeInTheDocument()
    expect(screen.getByText('25회')).toBeInTheDocument()
  })

  it('displays empty state when no analytics data', () => {
    useTodoStore.mockReturnValue({
      searchAnalytics: { totalSearches: 0 },
      loadSearchAnalytics: mockLoadSearchAnalytics,
    })

    render(<SearchAnalytics />)

    expect(screen.getByText('아직 검색 데이터가 없습니다')).toBeInTheDocument()
    expect(screen.getByText('검색을 시작하면 여기에 통계가 표시됩니다')).toBeInTheDocument()
  })

  it('loads analytics data on component mount', () => {
    render(<SearchAnalytics />)

    expect(mockLoadSearchAnalytics).toHaveBeenCalled()
  })

  it('refreshes data when refresh button is clicked', async () => {
    const analyticsData = {
      totalSearches: 10,
      uniqueQueries: 3,
      averageResults: 5,
      topQueries: [],
      searchTrends: [],
      filterUsage: {},
      noResultQueries: []
    }

    useTodoStore.mockReturnValue({
      searchAnalytics: analyticsData,
      loadSearchAnalytics: mockLoadSearchAnalytics,
    })

    render(<SearchAnalytics />)

    const refreshButton = screen.getByLabelText('데이터 새로고침')
    fireEvent.click(refreshButton)

    expect(mockLoadSearchAnalytics).toHaveBeenCalledTimes(2)
  })

  it('displays top queries table correctly', () => {
    const analyticsData = {
      totalSearches: 10,
      uniqueQueries: 3,
      averageResults: 5,
      topQueries: [
        { query: 'urgent', count: 5, avgResults: 8 },
        { query: 'meeting', count: 3, avgResults: 15 }
      ],
      searchTrends: [],
      filterUsage: {},
      noResultQueries: []
    }

    useTodoStore.mockReturnValue({
      searchAnalytics: analyticsData,
      loadSearchAnalytics: mockLoadSearchAnalytics,
    })

    render(<SearchAnalytics />)

    expect(screen.getByText('인기 검색어')).toBeInTheDocument()
    expect(screen.getByText('검색어')).toBeInTheDocument()
    expect(screen.getByText('검색 횟수')).toBeInTheDocument()
    expect(screen.getByText('평균 결과')).toBeInTheDocument()
  })

  it('displays filter usage statistics', () => {
    const analyticsData = {
      totalSearches: 10,
      uniqueQueries: 3,
      averageResults: 5,
      topQueries: [],
      searchTrends: [],
      filterUsage: {
        status: 85,
        priority: 62,
        tags: 43,
        dateRange: 28
      },
      noResultQueries: []
    }

    useTodoStore.mockReturnValue({
      searchAnalytics: analyticsData,
      loadSearchAnalytics: mockLoadSearchAnalytics,
    })

    render(<SearchAnalytics />)

    expect(screen.getByText('필터 사용 통계')).toBeInTheDocument()
    expect(screen.getByText('상태')).toBeInTheDocument()
    expect(screen.getByText('85%')).toBeInTheDocument()
    expect(screen.getByText('우선순위')).toBeInTheDocument()
    expect(screen.getByText('62%')).toBeInTheDocument()
  })

  it('displays no result queries when available', () => {
    const analyticsData = {
      totalSearches: 10,
      uniqueQueries: 3,
      averageResults: 5,
      topQueries: [],
      searchTrends: [],
      filterUsage: {},
      noResultQueries: [
        { query: 'xyz', count: 3 },
        { query: 'test123', count: 2 }
      ]
    }

    useTodoStore.mockReturnValue({
      searchAnalytics: analyticsData,
      loadSearchAnalytics: mockLoadSearchAnalytics,
    })

    render(<SearchAnalytics />)

    expect(screen.getByText('결과 없는 검색어')).toBeInTheDocument()
    expect(screen.getByText('xyz')).toBeInTheDocument()
    expect(screen.getByText('3회')).toBeInTheDocument()
    expect(screen.getByText('test123')).toBeInTheDocument()
    expect(screen.getByText('2회')).toBeInTheDocument()
  })

  it('shows loading state when refreshing', async () => {
    const analyticsData = {
      totalSearches: 10,
      uniqueQueries: 3,
      averageResults: 5,
      topQueries: [],
      searchTrends: [],
      filterUsage: {},
      noResultQueries: []
    }

    let resolvePromise
    const mockPromise = new Promise(resolve => {
      resolvePromise = resolve
    })
    mockLoadSearchAnalytics.mockReturnValue(mockPromise)

    useTodoStore.mockReturnValue({
      searchAnalytics: analyticsData,
      loadSearchAnalytics: mockLoadSearchAnalytics,
    })

    render(<SearchAnalytics />)

    const refreshButton = screen.getByLabelText('데이터 새로고침')
    fireEvent.click(refreshButton)

    expect(screen.getByText('로딩 중...')).toBeInTheDocument()

    resolvePromise()
    await waitFor(() => {
      expect(screen.queryByText('로딩 중...')).not.toBeInTheDocument()
    })
  })

  it('applies custom className when provided', () => {
    render(<SearchAnalytics className="custom-analytics" />)

    const container = screen.getByRole('region')
    expect(container).toHaveClass('custom-analytics')
  })

  it('handles analytics loading error gracefully', async () => {
    mockLoadSearchAnalytics.mockRejectedValue(new Error('Failed to load'))

    render(<SearchAnalytics />)

    await waitFor(() => {
      expect(screen.getByText('분석 데이터를 불러오는 데 실패했습니다')).toBeInTheDocument()
    })
  })

  it('formats large numbers correctly', async () => {
    const analyticsData = {
      totalSearches: 1234567,
      uniqueQueries: 123456,
      averageResults: 12.34,
      topQueries: [],
      searchTrends: [],
      filterUsage: {},
      noResultQueries: []
    }

    useTodoStore.mockReturnValue({
      searchAnalytics: analyticsData,
      loadSearchAnalytics: mockLoadSearchAnalytics,
    })

    render(<SearchAnalytics />)

    // Wait for component to render
    await waitFor(() => {
      expect(screen.queryByText('로딩 중...')).not.toBeInTheDocument()
    })

    expect(screen.getByText('1,234,567')).toBeInTheDocument() // formatted total searches
    expect(screen.getByText('123,456')).toBeInTheDocument() // formatted unique queries
  })
})