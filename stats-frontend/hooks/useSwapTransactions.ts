import { useQuery, useApolloClient } from '@apollo/client'
import { useMemo, useState, useEffect } from 'react'
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
  startTimestamp?: string
  endTimestamp?: string
}

interface UseSwapTransactionsReturn {
  transactions: SwapTransaction[]
  allTransactions: SwapTransaction[]
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
  startTimestamp,
  endTimestamp,
}: UseSwapTransactionsProps): UseSwapTransactionsReturn {
  const client = useApolloClient()

  // 상태 관리
  const [allTransactions, setAllTransactions] = useState<SwapTransaction[]>([])
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [hasMoreData, setHasMoreData] = useState(true)

  // 필터링된 쿼리 생성 함수
  const createFilteredQuery = () => {
    // 08. 07. 15:07:58 KST
    let clConditions = [
      `timestamp_gte: "${1754460478 + 86400}"`
    ]
    let legacyConditions = [
      `timestamp_gte: "${1754460478 + 86400}"`
    ]
    if (addressFilter) {
      legacyConditions.push(`from_contains: "${addressFilter}"`)
      clConditions.push(`origin_contains: "${addressFilter}"`)
    }

    if (startTimestamp || endTimestamp) {
      const start = startTimestamp ? startTimestamp : MIN_TIMESTAMP
      const end = endTimestamp ? endTimestamp : MAX_TIMESTAMP
      clConditions.push(`transaction_: {timestamp_gte: "${start}", timestamp_lte: "${end}"}`)
      legacyConditions.push(`transaction_: {timestamp_gte: "${start}", timestamp_lte: "${end}"}`)
    }

    if (poolTypeFilter === 'V2') {
      clConditions.push(`id: "${IMPOSSIBLE_ID}"`)
    }
    if (poolTypeFilter === 'V3') {
      legacyConditions.push(`id: "${IMPOSSIBLE_ID}"`)
    }
    const clWhereClause = clConditions.length > 0 ? `where: {${clConditions.join(', ')}}` : ""
    const legacyWhereClause = legacyConditions.length > 0 ? `where: {${legacyConditions.join(', ')}}` : ""

    const query = gql`
      query GetFilteredSwapTransactions($first: Int!, $skip: Int!) {
        clSwaps(
          first: $first, 
          skip: $skip,
          orderBy: transaction__timestamp,
          orderDirection: desc,
          ${clWhereClause}
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
          orderDirection: desc,
          ${legacyWhereClause}
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

    return query
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
  }, [addressFilter, poolTypeFilter, startTimestamp, endTimestamp])

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
      let allSwaps: SwapTransaction[] = []
      let skip = 0
      let hasMore = true

      // 모든 데이터를 불러올 때까지 반복 쿼리
      while (hasMore) {
        const { data: newData } = await client.query({
          query: dynamicQuery,
          variables: {
            first: SHOW_ALL_SIZE,
            skip: skip
          },
          fetchPolicy: 'network-only'
        })

        if (newData) {
          const { swaps } = transformTransactions(newData)

          if (swaps.length === 0) {
            hasMore = false
          } else {
            allSwaps = [...allSwaps, ...swaps]
            skip += swaps.length

            // SHOW_ALL_SIZE보다 적은 데이터가 반환되면 더 이상 데이터가 없음
            if (swaps.length < SHOW_ALL_SIZE) {
              hasMore = false
            }
          }
        } else {
          hasMore = false
        }
      }

      setAllTransactions(allSwaps)
      setHasMoreData(false)
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
    allTransactions,
    loading: loading || isLoadingMore,
    error,
    hasMoreData,
    loadedPages,
    loadMore,
    showAll
  }
} 