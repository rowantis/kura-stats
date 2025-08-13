import { useQuery } from '@apollo/client'
import { useMemo } from 'react'
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

export function useSwapTransactions({
  pageSize,
  currentPage,
  addressFilter,
  poolTypeFilter,
  startDate,
  endDate,
}: UseSwapTransactionsProps) {
  const skip = (currentPage - 1) * pageSize

  const { loading, error, data } = useQuery(SWAP_TRANSACTIONS_QUERY, {
    variables: { first: pageSize, skip },
    fetchPolicy: 'cache-and-network',
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

    // 풀타입 필터링
    if (poolTypeFilter && poolTypeFilter !== 'All') {
      filteredSwaps = filteredSwaps.filter(tx =>
        tx.poolType === poolTypeFilter ||
        (poolTypeFilter === 'V2' && tx.poolType.startsWith('V2:')) ||
        (poolTypeFilter === 'V3' && tx.poolType.startsWith('V3:'))
      )
    }

    if (startDate || endDate) {
      filteredSwaps = filteredSwaps.filter(tx => {
        const start = startDate ? new Date(parseFormattedDate(startDate) * 1000) : null
        const end = endDate ? new Date(parseFormattedDate(endDate) * 1000) : null

        if (start && Number(tx.timestamp) < Number(start)) return false
        if (end && Number(tx.timestamp) > Number(end)) return false
        return true
      })
    }

    return filteredSwaps
  }, [data, addressFilter, poolTypeFilter, startDate, endDate])

  return transactions
} 