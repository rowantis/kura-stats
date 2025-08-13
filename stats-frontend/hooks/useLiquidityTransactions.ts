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
  poolTypeFilter?: string
  startDate?: string
  endDate?: string
}

export function useLiquidityTransactions({
  pageSize,
  currentPage,
  addressFilter,
  typeFilter,
  poolTypeFilter,
  startDate,
  endDate,
}: UseLiquidityTransactionsProps) {
  const skip = (currentPage - 1) * pageSize

  const { loading, error, data } = useQuery(LIQUIDITY_TRANSACTIONS_QUERY, {
    variables: { first: pageSize, skip },
    fetchPolicy: 'cache-and-network',
  })

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
  }, [data, addressFilter, typeFilter, poolTypeFilter, startDate, endDate])

  return transactions
} 