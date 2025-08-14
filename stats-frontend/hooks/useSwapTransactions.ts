import { useQuery, useApolloClient } from '@apollo/client'
import { useMemo, useState, useEffect } from 'react'
import { SWAP_TRANSACTIONS_QUERY } from '@/lib/queries'
import { transformTransactions } from '@/lib/transactions'
import { SwapTransaction } from '@/types/graphql'
import { parseFormattedDate } from '@/lib/utils'

interface UseSwapTransactionsProps {
  pageSize: number
  currentPage: number
  addressFilter?: string
  poolTypeFilter?: string
  startDate?: string
  endDate?: string
}

interface UseSwapTransactionsReturn {
  transactions: SwapTransaction[]
  loading: boolean
  error: any
  hasMoreData: boolean
  loadedPages: number
  loadMore: () => Promise<void>
  showAll: () => Promise<void>
}

export function useSwapTransactions({
  pageSize,
  currentPage,
  addressFilter,
  poolTypeFilter,
  startDate,
  endDate,
}: UseSwapTransactionsProps): UseSwapTransactionsReturn {
  const client = useApolloClient()

  // 상태 관리
  const [allTransactions, setAllTransactions] = useState<SwapTransaction[]>([])
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [hasMoreData, setHasMoreData] = useState(true)

  // 초기 쿼리
  const { loading, error, data } = useQuery(SWAP_TRANSACTIONS_QUERY, {
    variables: { first: 100, skip: 0 }, // 초기에는 100개 로드
    fetchPolicy: 'cache-and-network',
  })

  // 필터링 함수
  const filterTransactions = (transactions: SwapTransaction[]) => {
    let filtered = [...transactions]

    if (addressFilter) {
      filtered = filtered.filter(tx =>
        tx.origin.toLowerCase().includes(addressFilter.toLowerCase())
      )
    }

    if (poolTypeFilter && poolTypeFilter !== 'All') {
      filtered = filtered.filter(tx =>
        tx.poolType === poolTypeFilter ||
        (poolTypeFilter === 'V2' && tx.poolType.startsWith('V2:')) ||
        (poolTypeFilter === 'V3' && tx.poolType.startsWith('V3:'))
      )
    }

    if (startDate || endDate) {
      filtered = filtered.filter(tx => {
        const start = startDate ? new Date(parseFormattedDate(startDate) * 1000) : null
        const end = endDate ? new Date(parseFormattedDate(endDate) * 1000) : null

        if (start && Number(tx.timestamp) < Number(start)) return false
        if (end && Number(tx.timestamp) > Number(end)) return false
        return true
      })
    }

    return filtered
  }

  // 초기 데이터 로딩
  useEffect(() => {
    if (data && allTransactions.length === 0) {
      const { swaps } = transformTransactions(data)
      const filtered = filterTransactions(swaps)
      setAllTransactions(filtered)
      setHasMoreData(filtered.length === 100) // 100개면 더 있을 가능성
    }
  }, [data])

  // Load More 함수
  const loadMore = async () => {
    if (isLoadingMore || !hasMoreData) return

    setIsLoadingMore(true)
    try {
      const { data: newData } = await client.query({
        query: SWAP_TRANSACTIONS_QUERY,
        variables: {
          first: 100,
          skip: allTransactions.length
        },
        fetchPolicy: 'network-only'
      })

      if (newData) {
        const { swaps } = transformTransactions(newData)
        const filtered = filterTransactions(swaps)

        if (filtered.length === 0) {
          setHasMoreData(false)
        } else {
          setAllTransactions(prev => [...prev, ...filtered])
          setHasMoreData(filtered.length === 100)
        }
      }
    } catch (error) {
      console.error('Error loading more data:', error)
    } finally {
      setIsLoadingMore(false)
    }
  }

  // Show All 함수
  const showAll = async () => {
    if (isLoadingMore) return

    setIsLoadingMore(true)
    try {
      const { data: allData } = await client.query({
        query: SWAP_TRANSACTIONS_QUERY,
        variables: {
          first: 10000, // 충분히 큰 값
          skip: 0
        },
        fetchPolicy: 'network-only'
      })

      if (allData) {
        const { swaps } = transformTransactions(allData)
        const filtered = filterTransactions(swaps)
        setAllTransactions(filtered)
        setHasMoreData(false)
      }
    } catch (error) {
      console.error('Error loading all data:', error)
    } finally {
      setIsLoadingMore(false)
    }
  }

  // 현재 페이지에 해당하는 데이터만 반환
  const transactions = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize
    const endIndex = startIndex + pageSize
    return allTransactions.slice(startIndex, endIndex)
  }, [allTransactions, currentPage, pageSize])

  // 실제 데이터가 있는 페이지 수만 계산
  const loadedPages = Math.max(1, Math.ceil(allTransactions.length / pageSize))

  return {
    transactions,
    loading: loading || isLoadingMore,
    error,
    hasMoreData,
    loadedPages,
    loadMore,
    showAll
  }
} 