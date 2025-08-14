import { useQuery, useApolloClient } from '@apollo/client'
import { useMemo, useState, useEffect } from 'react'
import { SWAP_TRANSACTIONS_QUERY } from '@/lib/queries'
import { transformTransactions } from '@/lib/transactions'
import { SwapTransaction } from '@/types/graphql'
import { parseFormattedDate } from '@/lib/utils'
import { gql } from '@apollo/client'
import {
  IMPOSSIBLE_ID,
  MIN_TIMESTAMP,
  MAX_TIMESTAMP,
  INITIAL_LOAD_SIZE,
  SHOW_ALL_SIZE
} from '@/lib/constants'

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

  // 필터링된 쿼리 생성 함수
  const createFilteredQuery = () => {
    const whereConditions = []

    // 주소 필터
    if (addressFilter) {
      whereConditions.push(`origin_contains: "${addressFilter}"`)
    }

    // 날짜 필터
    if (startDate || endDate) {
      const start = startDate ? parseFormattedDate(startDate) : MIN_TIMESTAMP
      const end = endDate ? parseFormattedDate(endDate) : MAX_TIMESTAMP
      whereConditions.push(`transaction_: {timestamp_gte: "${start}", timestamp_lte: "${end}"}`)
    }

    // 풀타입 필터
    let poolTypeWhere = ""
    if (poolTypeFilter && poolTypeFilter !== 'All') {
      if (poolTypeFilter === 'V2') {
        // V2만 보기 위해 V3에 불가능한 ID 필터 적용
        poolTypeWhere = `, clSwaps: {id: "${IMPOSSIBLE_ID}"}`
      } else if (poolTypeFilter === 'V3') {
        // V3만 보기 위해 V2에 불가능한 ID 필터 적용
        poolTypeWhere = `, legacySwaps: {id: "${IMPOSSIBLE_ID}"}`
      } else if (poolTypeFilter.startsWith('V2:')) {
        // 특정 V2 타입만 보기
        poolTypeWhere = `, clSwaps: {id: "${IMPOSSIBLE_ID}"}`
      } else if (poolTypeFilter.startsWith('V3:')) {
        // 특정 V3 타입만 보기
        poolTypeWhere = `, legacySwaps: {id: "${IMPOSSIBLE_ID}"}`
      }
    }

    const whereClause = whereConditions.length > 0 ? `where: {${whereConditions.join(', ')}}` : ""

    return gql`
      query GetFilteredSwapTransactions($first: Int!, $skip: Int!) {
        clSwaps(
          first: $first, 
          skip: $skip,
          orderBy: transaction__timestamp,
          ${whereClause}
        ) {
          amount0
          amount1
          amountUSD
          origin
          pool {
            feeTier
          }
          token0 {
            symbol
            id
          }
          token1 {
            symbol
            id
          }
          transaction {
            id
            timestamp
          }
        }
        legacySwaps(
          first: $first, 
          skip: $skip,
          orderBy: transaction__timestamp,
          ${whereClause}
        ) {
          amount0In
          amount0Out
          amount1In
          amount1Out
          amountUSD
          origin: from
          pool {
            isStable
            token0 {
              symbol
              id
            }
            token1 {
              symbol
              id
            }
          }
          transaction {
            id
            timestamp
          }
        }
      }
    `
  }

  // 동적으로 생성된 쿼리
  const dynamicQuery = createFilteredQuery()

  // 초기 쿼리
  const { loading, error, data } = useQuery(dynamicQuery, {
    variables: { first: INITIAL_LOAD_SIZE, skip: 0 }, // 초기에는 100개 로드
    fetchPolicy: 'cache-and-network',
  })

  // 필터가 변경될 때마다 데이터 초기화
  useEffect(() => {
    setAllTransactions([])
    setHasMoreData(true)
  }, [addressFilter, poolTypeFilter, startDate, endDate])

  // 초기 데이터 로딩
  useEffect(() => {
    if (data && allTransactions.length === 0) {
      const { swaps } = transformTransactions(data)
      setAllTransactions(swaps)
      // 100개를 요청했는데 100개가 반환되면 더 있을 가능성이 높음
      setHasMoreData(swaps.length >= INITIAL_LOAD_SIZE)
    }
  }, [data])

  // Load More 함수
  const loadMore = async () => {
    if (isLoadingMore || !hasMoreData) return

    setIsLoadingMore(true)
    try {
      const { data: newData } = await client.query({
        query: dynamicQuery,
        variables: {
          first: INITIAL_LOAD_SIZE,
          skip: allTransactions.length
        },
        fetchPolicy: 'network-only'
      })

      if (newData) {
        const { swaps } = transformTransactions(newData)

        if (swaps.length === 0) {
          setHasMoreData(false)
        } else {
          setAllTransactions(prev => [...prev, ...swaps])
          // 100개를 요청했는데 100개가 반환되면 더 있을 가능성이 높음
          setHasMoreData(swaps.length >= INITIAL_LOAD_SIZE)
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
        query: dynamicQuery,
        variables: {
          first: SHOW_ALL_SIZE, // 충분히 큰 값
          skip: 0
        },
        fetchPolicy: 'network-only'
      })

      if (allData) {
        const { swaps } = transformTransactions(allData)
        setAllTransactions(swaps)
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