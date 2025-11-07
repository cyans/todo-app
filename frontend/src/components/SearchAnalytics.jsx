import React, { useState, useEffect } from 'react'
import useTodoStore from '../store/todoStore'

// @CODE:FILTER-SEARCH-004:ANALYTICS

const SearchAnalytics = ({ className = '' }) => {
  const { searchAnalytics, loadSearchAnalytics } = useTodoStore()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  // Load analytics data on component mount
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      setError('')

      try {
        if (loadSearchAnalytics && typeof loadSearchAnalytics === 'function') {
          const result = loadSearchAnalytics()
          if (result && typeof result.catch === 'function') {
            await result
          }
        }
      } catch (err) {
        setError('분석 데이터를 불러오는 데 실패했습니다')
        console.error('Failed to load search analytics:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [loadSearchAnalytics])

  // Handle refresh
  const handleRefresh = async () => {
    setIsLoading(true)
    setError('')

    try {
      if (loadSearchAnalytics && typeof loadSearchAnalytics === 'function') {
        const result = loadSearchAnalytics()
        if (result && typeof result.catch === 'function') {
          await result
        }
      }
    } catch (err) {
      setError('분석 데이터를 불러오는 데 실패했습니다')
      console.error('Failed to refresh search analytics:', err)
    } finally {
      setIsLoading(false)
    }
  }

  // Format number with commas
  const formatNumber = (num) => {
    return new Intl.NumberFormat('ko-KR').format(num)
  }

  // Calculate percentage
  const calculatePercentage = (value, total) => {
    if (total === 0) return '0'
    return ((value / total) * 100).toFixed(1)
  }

  if (isLoading) {
    return (
      <div className={`bg-white border border-gray-200 rounded-lg shadow-sm p-8 ${className}`} role="region" aria-label="검색 분석">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">로딩 중...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`bg-white border border-gray-200 rounded-lg shadow-sm p-8 ${className}`} role="region" aria-label="검색 분석">
        <div className="text-center">
          <svg
            className="w-12 h-12 mx-auto mb-4 text-red-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">오류 발생</h3>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    )
  }

  if (!searchAnalytics || searchAnalytics.totalSearches === 0) {
    return (
      <div className={`bg-white border border-gray-200 rounded-lg shadow-sm ${className}`} role="region" aria-label="검색 분석">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">검색 분석</h3>
            <button
              type="button"
              onClick={handleRefresh}
              className="p-2 text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600"
              aria-label="데이터 새로고침"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </button>
          </div>
        </div>
        <div className="p-8 text-center">
          <svg
            className="w-16 h-16 mx-auto mb-4 text-gray-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">아직 검색 데이터가 없습니다</h3>
          <p className="text-gray-600">검색을 시작하면 여기에 통계가 표시됩니다</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-white border border-gray-200 rounded-lg shadow-sm ${className}`} role="region" aria-label="검색 분석">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">검색 분석</h3>
          <button
            type="button"
            onClick={handleRefresh}
            className="p-2 text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600"
            aria-label="데이터 새로고침"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">
              {formatNumber(searchAnalytics.totalSearches)}
            </div>
            <div className="text-sm text-gray-600">총 검색 수</div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">
              {formatNumber(searchAnalytics.uniqueQueries)}
            </div>
            <div className="text-sm text-gray-600">고유 검색어</div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">
              {searchAnalytics.averageResults?.toFixed(1) || '0'}
            </div>
            <div className="text-sm text-gray-600">평균 결과 수</div>
          </div>
        </div>

        {/* Top Queries */}
        {searchAnalytics.topQueries && searchAnalytics.topQueries.length > 0 && (
          <div>
            <h4 className="text-lg font-medium text-gray-900 mb-4">인기 검색어</h4>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      검색어
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      검색 횟수
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      평균 결과
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {searchAnalytics.topQueries.map((query, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {query.query}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {query.count}회
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {query.avgResults?.toFixed(1) || '0'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Filter Usage */}
        {searchAnalytics.filterUsage && Object.keys(searchAnalytics.filterUsage).length > 0 && (
          <div>
            <h4 className="text-lg font-medium text-gray-900 mb-4">필터 사용 통계</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(searchAnalytics.filterUsage).map(([filter, count]) => (
                <div key={filter} className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-lg font-bold text-gray-900">
                    {calculatePercentage(count, searchAnalytics.totalSearches)}%
                  </div>
                  <div className="text-xs text-gray-600 capitalize">
                    {filter === 'status' && '상태'}
                    {filter === 'priority' && '우선순위'}
                    {filter === 'tags' && '태그'}
                    {filter === 'dateRange' && '날짜 범위'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No Result Queries */}
        {searchAnalytics.noResultQueries && searchAnalytics.noResultQueries.length > 0 && (
          <div>
            <h4 className="text-lg font-medium text-gray-900 mb-4">결과 없는 검색어</h4>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="space-y-2">
                {searchAnalytics.noResultQueries.map((query, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-yellow-800">
                      {query.query}
                    </span>
                    <span className="text-xs text-yellow-600">
                      {query.count}회
                    </span>
                  </div>
                ))}
              </div>
              <p className="mt-2 text-xs text-yellow-700">
                이 검색어들은 결과를 반환하지 않았습니다. 검색 인덱스나 데이터를 확인해보세요.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default SearchAnalytics