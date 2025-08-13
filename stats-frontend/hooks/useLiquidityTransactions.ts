import { useQuery } from '@apollo/client'
import { useMemo } from 'react'
import { LIQUIDITY_TRANSACTIONS_QUERY } from '@/lib/queries'
import { transformTransactions } from '@/lib/transactions'
import { LiquidityTransaction } from '@/types/graphql'

interface UseLiquidityTransactionsProps {
  pageSize: number
  currentPage: number
  addressFilter?: string
  typeFilter?: string
  tokenFilter?: string
  poolTypeFilter?: string
  startDate?: string
  endDate?: string
  isActive: boolean // 탭이 활성화되었는지 여부
}

export function useLiquidityTransactions({
  pageSize,
  currentPage,
  addressFilter,
  typeFilter,
  tokenFilter,
  poolTypeFilter,
  startDate,
  endDate,
  isActive
}: UseLiquidityTransactionsProps) {
  const skip = (currentPage - 1) * pageSize

  const { loading, error, data } = useQuery(LIQUIDITY_TRANSACTIONS_QUERY, {
    variables: { first: pageSize, skip },
    fetchPolicy: 'cache-and-network',
    skip: !isActive // 탭이 비활성화되어 있으면 쿼리 실행하지 않음
  })

  // 쿼리 실행 시점 로그 (개발용)
  console.log('useLiquidityTransactions - isActive:', isActive, 'loading:', loading, 'hasData:', !!data)

  const transactions = useMemo(() => {
    if (!data) return []

    const { liquidity } = transformTransactions(data)
    let filteredLiquidity = [...liquidity]

    // 주소 필터링
    if (addressFilter) {
      filteredLiquidity = filteredLiquidity.filter(tx =>
        tx.origin.toLowerCase().includes(addressFilter.toLowerCase())
      )
    }

    // 타입 필터링
    if (typeFilter && typeFilter !== 'All') {
      filteredLiquidity = filteredLiquidity.filter(tx =>
        tx.type === typeFilter
      )
    }

    // 토큰 필터링
    if (tokenFilter) {
      filteredLiquidity = filteredLiquidity.filter(tx =>
        tx.token0.id.toLowerCase().includes(tokenFilter.toLowerCase()) ||
        tx.token1.id.toLowerCase().includes(tokenFilter.toLowerCase())
      )
    }

    // 풀타입 필터링
    if (poolTypeFilter && poolTypeFilter !== 'All') {
      filteredLiquidity = filteredLiquidity.filter(tx =>
        tx.poolType === poolTypeFilter ||
        (poolTypeFilter === 'V2' && tx.poolType.startsWith('V2:')) ||
        (poolTypeFilter === 'V3' && tx.poolType.startsWith('V3:'))
      )
    }

    // 기간 필터링
    if (startDate || endDate) {
      filteredLiquidity = filteredLiquidity.filter(tx => {
        const txTime = new Date(Number(tx.timestamp) * 1000)
        const start = startDate ? new Date(startDate.replace(/\./g, ' ').replace(/(\d{2})\. (\d{2})\. (\d{2}):(\d{2}):(\d{2})/, '2024-$1-$2T$3:$4:$5Z')) : null
        const end = endDate ? new Date(endDate.replace(/\./g, ' ').replace(/(\d{2})\. (\d{2})\. (\d{2}):(\d{2}):(\d{2})/, '2024-$1-$2T$3:$4:$5Z')) : null

        if (start && txTime < start) return false
        if (end && txTime > end) return false
        return true
      })
    }

    return filteredLiquidity
  }, [data, addressFilter, typeFilter, tokenFilter, poolTypeFilter, startDate, endDate])

  return {
    loading: isActive ? loading : false, // 비활성 탭일 때는 로딩 상태를 false로
    error: isActive ? error : undefined, // 비활성 탭일 때는 에러를 undefined로
    transactions,
    totalCount: data ? data.clMints?.length + data.clBurns?.length + data.legacyMints?.length + data.legacyBurns?.length : 0
  }
} 