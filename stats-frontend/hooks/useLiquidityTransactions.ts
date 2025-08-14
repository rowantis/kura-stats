import { useQuery, useApolloClient } from '@apollo/client'
import { useMemo, useState, useEffect } from 'react'
import { transformTransactions } from '@/lib/transactions'
import { LiquidityTransaction } from '@/types/graphql'
import { gql } from '@apollo/client'
import {
  IMPOSSIBLE_ID,
  MIN_TIMESTAMP,
  MAX_TIMESTAMP,
  INITIAL_LOAD_SIZE,
  SHOW_ALL_SIZE
} from '@/lib/constants'

interface UseLiquidityTransactionsProps {
  pageSize: number
  currentPage: number
  addressFilter?: string
  typeFilter?: string
  poolTypeFilter?: string
  startTimestamp?: string
  endTimestamp?: string
}

interface UseLiquidityTransactionsReturn {
  transactions: LiquidityTransaction[]
  loading: boolean
  error: any
  hasMoreData: boolean
  loadedPages: number
  loadMore: () => Promise<void>
  showAll: () => Promise<void>
  filteredTransactionsLength: number
}

export function useLiquidityTransactions({
  pageSize,
  currentPage,
  addressFilter,
  typeFilter,
  poolTypeFilter,
  startTimestamp,
  endTimestamp,
}: UseLiquidityTransactionsProps): UseLiquidityTransactionsReturn {
  const client = useApolloClient()

  // 상태 관리
  const [allTransactions, setAllTransactions] = useState<LiquidityTransaction[]>([])
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [hasMoreData, setHasMoreData] = useState(true)

  // 필터링된 쿼리 생성 함수
  const createFilteredQuery = () => {
    // 공통 필터 조건들
    const commonClConditions = []
    const commonLegacyConditions = []

    // 주소 필터링
    if (addressFilter) {
      commonLegacyConditions.push(`sender_contains: "${addressFilter}"`)
      commonClConditions.push(`origin_contains: "${addressFilter}"`)
    }

    // 기간 필터링
    if (startTimestamp || endTimestamp) {
      const start = startTimestamp ? startTimestamp : MIN_TIMESTAMP
      const end = endTimestamp ? endTimestamp : MAX_TIMESTAMP
      commonClConditions.push(`transaction_: {timestamp_gte: "${start}", timestamp_lte: "${end}"}`)
      commonLegacyConditions.push(`transaction_: {timestamp_gte: "${start}", timestamp_lte: "${end}"}`)
    }

    // 풀타입 필터링
    if (poolTypeFilter && poolTypeFilter !== 'All') {
      if (poolTypeFilter === 'V2') {
        commonClConditions.push(`id: "${IMPOSSIBLE_ID}"`)
      } else if (poolTypeFilter === 'V3') {
        commonLegacyConditions.push(`id: "${IMPOSSIBLE_ID}"`)
      }
    }

    // 각 타입별 where 절 생성
    const clMintsWhere = [...commonClConditions]
    const clBurnsWhere = [...commonClConditions]
    const legacyMintsWhere = [...commonLegacyConditions]
    const legacyBurnsWhere = [...commonLegacyConditions]

    // 타입 필터링 - 각 타입별로 적절한 필터 적용
    if (typeFilter && typeFilter !== 'All') {
      if (typeFilter === 'Mint') {
        // Mint만 보기 위해 Burn에 불가능한 ID 필터 적용
        clBurnsWhere.push(`id: "${IMPOSSIBLE_ID}"`)
        legacyBurnsWhere.push(`id: "${IMPOSSIBLE_ID}"`)
      } else if (typeFilter === 'Burn') {
        // Burn만 보기 위해 Mint에 불가능한 ID 필터 적용
        clMintsWhere.push(`id: "${IMPOSSIBLE_ID}"`)
        legacyMintsWhere.push(`id: "${IMPOSSIBLE_ID}"`)
      }
    }

    // where 절 문자열 생성
    const clMintsWhereClause = clMintsWhere.length > 0 ? `where: {${clMintsWhere.join(', ')}}` : ""
    const clBurnsWhereClause = clBurnsWhere.length > 0 ? `where: {${clBurnsWhere.join(', ')}}` : ""
    const legacyMintsWhereClause = legacyMintsWhere.length > 0 ? `where: {${legacyMintsWhere.join(', ')}}` : ""
    const legacyBurnsWhereClause = legacyBurnsWhere.length > 0 ? `where: {${legacyBurnsWhere.join(', ')}}` : ""

    const query = gql`
      query GetFilteredLiquidityTransactions($first: Int!, $skip: Int!) {
        clMints(
          first: $first, 
          skip: $skip,
          orderBy: transaction__timestamp,
          ${clMintsWhereClause}
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
        clBurns(
          first: $first, 
          skip: $skip,
          orderBy: transaction__timestamp,
          ${clBurnsWhereClause}
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
        legacyMints(
          first: $first, 
          skip: $skip,
          orderBy: transaction__timestamp,
          ${legacyMintsWhereClause}
        ) {
          amount0
          amount1
          amountUSD
          origin: sender
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
        legacyBurns(
          first: $first, 
          skip: $skip,
          orderBy: transaction__timestamp,
          ${legacyBurnsWhereClause}
        ) {
          amount0
          amount1
          amountUSD
          origin: sender
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
    variables: { first: INITIAL_LOAD_SIZE, skip: 0 },
    fetchPolicy: 'cache-and-network',
  })

  // 필터가 변경될 때마다 데이터 초기화
  useEffect(() => {
    setAllTransactions([])
    setHasMoreData(true)
  }, [addressFilter, typeFilter, poolTypeFilter, startTimestamp, endTimestamp])

  // 초기 데이터 로딩
  useEffect(() => {
    if (data && allTransactions.length === 0) {
      const { liquidity } = transformTransactions(data)
      setAllTransactions(liquidity)
      setHasMoreData(liquidity.length >= INITIAL_LOAD_SIZE)
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
          first: pageSize * 10, // 페이지 크기의 10배만큼 로드
          skip: allTransactions.length
        },
        fetchPolicy: 'network-only'
      })

      if (newData) {
        const { liquidity } = transformTransactions(newData)

        if (liquidity.length === 0) {
          setHasMoreData(false)
        } else {
          setAllTransactions(prev => [...prev, ...liquidity])
          // 로드된 데이터가 요청한 양보다 적으면 더 이상 데이터가 없음
          setHasMoreData(liquidity.length >= pageSize * 10)
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
      let allLiquidity: LiquidityTransaction[] = []
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
          const { liquidity } = transformTransactions(newData)

          if (liquidity.length === 0) {
            hasMore = false
          } else {
            allLiquidity = [...allLiquidity, ...liquidity]
            skip += liquidity.length

            // SHOW_ALL_SIZE보다 적은 데이터가 반환되면 더 이상 데이터가 없음
            if (liquidity.length < SHOW_ALL_SIZE) {
              hasMore = false
            }
          }
        } else {
          hasMore = false
        }
      }

      setAllTransactions(allLiquidity)
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
    return allTransactions.slice(startIndex, endIndex).filter(tx => tx.origin)
  }, [allTransactions, currentPage, pageSize])

  // 필터링된 데이터의 길이 계산
  const filteredTransactionsLength = useMemo(() => {
    return allTransactions.filter(tx => tx.origin).length
  }, [allTransactions])

  // 실제 데이터가 있는 페이지 수만 계산 (필터링된 데이터 기준)
  const loadedPages = Math.max(1, Math.ceil(filteredTransactionsLength / pageSize))

  return {
    transactions,
    loading: loading || isLoadingMore,
    error,
    hasMoreData,
    loadedPages,
    loadMore,
    showAll,
    filteredTransactionsLength
  }
} 