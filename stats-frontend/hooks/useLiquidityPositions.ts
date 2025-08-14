import { useQuery, useApolloClient } from '@apollo/client'
import { useMemo, useState, useEffect } from 'react'
import { LiquidityPosition } from '@/types/graphql'
import { gql } from '@apollo/client'
import {
  IMPOSSIBLE_ID,
  SHOW_ALL_SIZE
} from '@/lib/constants'
import { getPoolType } from '@/lib/utils'

interface UseLiquidityPositionsProps {
  pageSize: number
  currentPage: number
  addressFilter?: string
  poolTypeFilter?: string
}

interface UseLiquidityPositionsReturn {
  positions: LiquidityPosition[]
  loading: boolean
  error: any
  hasMoreData: boolean
  loadedPages: number
  showAll: () => Promise<void>
}

export function useLiquidityPositions({
  pageSize,
  currentPage,
  addressFilter,
  poolTypeFilter,
}: UseLiquidityPositionsProps): UseLiquidityPositionsReturn {
  const client = useApolloClient()

  // 상태 관리
  const [allPositions, setAllPositions] = useState<LiquidityPosition[]>([])
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [hasMoreData, setHasMoreData] = useState(false) // 초기에는 false, showAll 후 true

  // 필터링된 쿼리 생성 함수
  const createFilteredQuery = () => {
    // 기본 조건을 먼저 추가
    let legacyConditions = [
      'liquidityTokenBalance_gt: "0"',
      'stakedAmount_gt: "0"'
    ]
    let clConditions = [
      'liquidity_gt: "0"'
    ]

    // 주소 필터링
    if (addressFilter) {
      legacyConditions.push(`user_contains: "${addressFilter}"`)
      clConditions.push(`owner_contains: "${addressFilter}"`)
    }

    // 풀타입 필터링
    if (poolTypeFilter && poolTypeFilter !== 'All') {
      if (poolTypeFilter === 'V2') {
        clConditions.push(`id: "${IMPOSSIBLE_ID}"`)
      } else if (poolTypeFilter === 'V3') {
        legacyConditions.push(`id: "${IMPOSSIBLE_ID}"`)
      }
    }

    const query = gql`
      query GetFilteredLiquidityPositions {
        legacyPositions(where: {${legacyConditions.join(', ')}}) {
          liquidityTokenBalance
          stakedAmount
          pool {
            id
            token0 {
              id
              name
              symbol
              decimals
            }
            token1 {
              id
              name
              symbol
              decimals
            }
            isStable
          }
          user {
            id
          }
        }
        clPositions(where: {${clConditions.join(', ')}}) {
          id
          owner {
            id
          }
          token0 {
            id
            name
            symbol
            decimals
          }
          token1 {
            id
            name
            symbol
            decimals
          }
          pool {
            id
            token0 {
              id
              name
              symbol
              decimals
              }
            token1 {
              id
              name
              symbol
              decimals
            }
            feeTier
          }
          liquidity
          tickLower {
            tickIdx
          }
          tickUpper {
            tickIdx
          }
          lastUpdatedAtBlock
          transaction {
            timestamp
          }
        }
      }
    `

    return query
  }

  // 동적으로 생성된 쿼리
  const dynamicQuery = createFilteredQuery()

  // 초기 쿼리 - showAll로 모든 데이터 로드
  const { loading, error, data } = useQuery(dynamicQuery, {
    fetchPolicy: 'cache-and-network',
  })

  // 필터가 변경될 때마다 데이터 초기화
  useEffect(() => {
    setAllPositions([])
    setHasMoreData(false)
  }, [addressFilter, poolTypeFilter])

  // 초기 데이터 로딩 - showAll 자동 실행
  useEffect(() => {
    if (data && allPositions.length === 0) {
      showAll()
    }
  }, [data])

  // Show All 함수 - 모든 데이터를 불러올 때까지 반복 쿼리
  const showAll = async () => {
    if (isLoadingMore) return

    setIsLoadingMore(true)
    try {
      let allLegacyPositions: any[] = []
      let allClPositions: any[] = []
      let skip = 0
      let hasMore = true

      // 모든 데이터를 불러올 때까지 반복 쿼리
      while (hasMore) {
        const { data: newData } = await client.query({
          query: dynamicQuery,
          variables: {},
          fetchPolicy: 'network-only'
        })

        if (newData) {
          const { legacyPositions, clPositions } = newData

          if ((!legacyPositions || legacyPositions.length === 0) &&
            (!clPositions || clPositions.length === 0)) {
            hasMore = false
          } else {
            if (legacyPositions) {
              allLegacyPositions = [...allLegacyPositions, ...legacyPositions]
            }
            if (clPositions) {
              allClPositions = [...allClPositions, ...clPositions]
            }

            // 한 번의 쿼리로 모든 데이터를 가져오므로 반복 불필요
            hasMore = false
          }
        } else {
          hasMore = false
        }
      }

      // 데이터 변환 및 통합
      const transformedPositions: LiquidityPosition[] = [
        ...allLegacyPositions.map((pos: any) => ({
          user: pos.user.id,
          poolType: getPoolType(undefined, pos.pool.isStable),
          usdValue: '0', // 추후 로직 추가 예정
          token0: pos.pool.token0,
          token1: pos.pool.token1,
          token0Amount: '0', // 추후 계산 로직 추가 예정
          token1Amount: '0' // 추후 계산 로직 추가 예정
        })),
        ...allClPositions.map((pos: any) => ({
          user: pos.owner.id,
          poolType: getPoolType(pos.pool.feeTier, undefined),
          usdValue: '0', // 추후 로직 추가 예정
          token0: pos.token0,
          token1: pos.token1,
          token0Amount: '0', // 추후 계산 로직 추가 예정
          token1Amount: '0' // 추후 계산 로직 추가 예정
        }))
      ]



      setAllPositions(transformedPositions)
      setHasMoreData(false)
    } catch (error) {
      console.error('Error loading all data:', error)
    } finally {
      setIsLoadingMore(false)
    }
  }

  // 현재 페이지에 해당하는 데이터만 반환
  const positions = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize
    const endIndex = startIndex + pageSize
    return allPositions.slice(startIndex, endIndex)
  }, [allPositions, currentPage, pageSize])

  // 실제 데이터가 있는 페이지 수만 계산
  const loadedPages = Math.max(1, Math.ceil(allPositions.length / pageSize))

  return {
    positions,
    loading: loading || isLoadingMore,
    error,
    hasMoreData,
    loadedPages,
    showAll
  }
} 