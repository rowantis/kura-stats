import { useQuery } from '@apollo/client'
import { useMemo } from 'react'
import { SWAP_TRANSACTIONS_QUERY } from '@/lib/queries'
import { transformTransactions } from '@/lib/transactions'
import { SwapTransaction } from '@/types/graphql'

interface UseSwapTransactionsProps {
  pageSize: number
  currentPage: number
  addressFilter?: string
  tokenFilter?: string
  poolTypeFilter?: string
  startDate?: string
  endDate?: string
}

export function useSwapTransactions({
  pageSize,
  currentPage,
  addressFilter,
  tokenFilter,
  poolTypeFilter,
  startDate,
  endDate
}: UseSwapTransactionsProps) {
  const skip = (currentPage - 1) * pageSize

  const { loading, error, data } = useQuery(SWAP_TRANSACTIONS_QUERY, {
    variables: { first: pageSize, skip },
    fetchPolicy: 'cache-and-network'
  })

  const transactions = useMemo(() => {
    if (!data) return []

    const { swaps } = transformTransactions(data)
    let filteredSwaps = [...swaps]

    // 주소 필터링
    if (addressFilter) {
      filteredSwaps = filteredSwaps.filter(tx =>
        tx.origin.toLowerCase().includes(addressFilter.toLowerCase())
      )
    }

    // 토큰 필터링
    if (tokenFilter) {
      filteredSwaps = filteredSwaps.filter(tx =>
        tx.token0.id.toLowerCase().includes(tokenFilter.toLowerCase()) ||
        tx.token1.id.toLowerCase().includes(tokenFilter.toLowerCase())
      )
    }

    // 풀타입 필터링
    if (poolTypeFilter && poolTypeFilter !== 'All') {
      filteredSwaps = filteredSwaps.filter(tx =>
        tx.poolType === poolTypeFilter ||
        (poolTypeFilter === 'V2' && tx.poolType.startsWith('V2:')) ||
        (poolTypeFilter === 'V3' && tx.poolType.startsWith('V3:'))
      )
    }

    // 기간 필터링
    if (startDate || endDate) {
      filteredSwaps = filteredSwaps.filter(tx => {
        const txTime = new Date(Number(tx.timestamp) * 1000)
        const start = startDate ? new Date(startDate.replace(/\./g, ' ').replace(/(\d{2})\. (\d{2})\. (\d{2}):(\d{2}):(\d{2})/, '2024-$1-$2T$3:$4:$5Z')) : null
        const end = endDate ? new Date(endDate.replace(/\./g, ' ').replace(/(\d{2})\. (\d{2})\. (\d{2}):(\d{2}):(\d{2})/, '2024-$1-$2T$3:$4:$5Z')) : null

        if (start && txTime < start) return false
        if (end && txTime > end) return false
        return true
      })
    }

    return filteredSwaps
  }, [data, addressFilter, tokenFilter, poolTypeFilter, startDate, endDate])

  return {
    loading,
    error,
    transactions,
    totalCount: data ? data.clSwaps?.length + data.legacySwaps?.length : 0
  }
} 