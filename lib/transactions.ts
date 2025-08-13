import {
  GraphQLData,
  SwapTransaction,
  LiquidityTransaction,
  CLSwap,
  CLMint,
  CLBurn,
  LegacySwap,
  LegacyMint,
  LegacyBurn
} from '@/types/graphql'
import { getPoolType } from '@/lib/utils'

export function transformTransactions(data: GraphQLData): {
  swaps: SwapTransaction[]
  liquidity: LiquidityTransaction[]
} {
  const swaps: SwapTransaction[] = []
  const liquidity: LiquidityTransaction[] = []

  // CL Swaps
  data.clSwaps.forEach((swap: CLSwap) => {
    swaps.push({
      id: `${swap.transaction.id}-cl-swap`,
      type: 'Swap',
      origin: swap.origin,
      token0: swap.token0,
      token1: swap.token1,
      token0Amount: swap.amount0,
      token1Amount: swap.amount1,
      amountUSD: swap.amountUSD,
      timestamp: swap.transaction.timestamp,
      transactionId: swap.transaction.id,
      poolType: getPoolType(swap.pool.feeTier),
    })
  })

  // Legacy Swaps
  data.legacySwaps.forEach((swap: LegacySwap) => {
    swaps.push({
      id: `${swap.transaction.id}-legacy-swap`,
      type: 'Swap',
      origin: swap.origin,
      token0: swap.pool.token0,
      token1: swap.pool.token1,
      token0Amount: (Number(swap.amount0In) - Number(swap.amount0Out)).toString(),
      token1Amount: (Number(swap.amount1In) - Number(swap.amount1Out)).toString(),
      amountUSD: swap.amountUSD,
      timestamp: swap.transaction.timestamp,
      transactionId: swap.transaction.id,
      poolType: getPoolType(undefined, swap.pool.isStable),
    })
  })

  // CL Mints
  data.clMints.forEach((mint: CLMint) => {
    liquidity.push({
      id: `${mint.transaction.id}-cl-mint`,
      type: 'Mint',
      origin: mint.origin,
      token0: mint.token0,
      token1: mint.token1,
      token0Amount: mint.amount0,
      token1Amount: mint.amount1,
      amountUSD: mint.amountUSD,
      timestamp: mint.transaction.timestamp,
      transactionId: mint.transaction.id,
      poolType: getPoolType(mint.pool.feeTier),
    })
  })

  // CL Burns
  data.clBurns.forEach((burn: CLBurn) => {
    liquidity.push({
      id: `${burn.transaction.id}-cl-burn`,
      type: 'Burn',
      origin: burn.origin,
      token0: burn.token0,
      token1: burn.token1,
      token0Amount: burn.amount0,
      token1Amount: burn.amount1,
      amountUSD: burn.amountUSD,
      timestamp: burn.transaction.timestamp,
      transactionId: burn.transaction.id,
      poolType: getPoolType(burn.pool.feeTier),
    })
  })

  // Legacy Mints
  data.legacyMints.forEach((mint: LegacyMint) => {
    liquidity.push({
      id: `${mint.transaction.id}-legacy-mint`,
      type: 'Mint',
      origin: mint.origin,
      token0: mint.pool.token0,
      token1: mint.pool.token1,
      token0Amount: mint.amount0,
      token1Amount: mint.amount1,
      amountUSD: mint.amountUSD,
      timestamp: mint.transaction.timestamp,
      transactionId: mint.transaction.id,
      poolType: getPoolType(undefined, mint.pool.isStable),
    })
  })

  // Legacy Burns
  data.legacyBurns.forEach((burn: LegacyBurn) => {
    liquidity.push({
      id: `${burn.transaction.id}-legacy-burn`,
      type: 'Burn',
      origin: burn.origin,
      token0: burn.pool.token0,
      token1: burn.pool.token1,
      token0Amount: burn.amount0,
      token1Amount: burn.amount1,
      amountUSD: burn.amountUSD,
      timestamp: burn.transaction.timestamp,
      transactionId: burn.transaction.id,
      poolType: getPoolType(undefined, burn.pool.isStable),
    })
  })

  // 최신 거래부터 정렬
  const sortByTimestamp = (a: SwapTransaction | LiquidityTransaction, b: SwapTransaction | LiquidityTransaction) =>
    new Date(Number(b.timestamp) * 1000).getTime() - new Date(Number(a.timestamp) * 1000).getTime()

  return {
    swaps: swaps.sort(sortByTimestamp),
    liquidity: liquidity.sort(sortByTimestamp)
  }
}

export function filterTransactionsByAddress<T extends SwapTransaction | LiquidityTransaction>(
  transactions: T[],
  address: string
): T[] {
  if (!address) return transactions
  return transactions.filter(tx =>
    tx.origin && tx.origin.toLowerCase() === address.toLowerCase()
  )
}

export function filterTransactionsByType<T extends SwapTransaction | LiquidityTransaction>(
  transactions: T[],
  type: string
): T[] {
  if (!type || type === 'All') return transactions
  return transactions.filter(tx => tx.type === type)
}

export function filterTransactionsByToken<T extends SwapTransaction | LiquidityTransaction>(
  transactions: T[],
  tokenAddress: string
): T[] {
  if (!tokenAddress) return transactions
  return transactions.filter(tx =>
    tx.token0.id.toLowerCase() === tokenAddress.toLowerCase() ||
    tx.token1.id.toLowerCase() === tokenAddress.toLowerCase()
  )
}

export function filterTransactionsByPoolType<T extends SwapTransaction | LiquidityTransaction>(
  transactions: T[],
  poolType: string
): T[] {
  if (!poolType || poolType === 'All') return transactions

  if (poolType === 'V2') {
    return transactions.filter(tx => tx.poolType.startsWith('V2:'))
  }

  if (poolType === 'V3') {
    return transactions.filter(tx => tx.poolType.startsWith('V3:'))
  }

  return transactions.filter(tx => tx.poolType === poolType)
}

export function filterTransactionsByDateRange<T extends SwapTransaction | LiquidityTransaction>(
  transactions: T[],
  startDate: string,
  endDate: string
): T[] {
  if (!startDate && !endDate) return transactions

  return transactions.filter(tx => {
    const txDate = new Date(Number(tx.timestamp) * 1000)

    if (startDate && endDate) {
      const start = parseCustomDateTime(startDate)
      const end = parseCustomDateTime(endDate)
      if (start && end) {
        return txDate >= start && txDate <= end
      }
    } else if (startDate) {
      const start = parseCustomDateTime(startDate)
      if (start) {
        return txDate >= start
      }
    } else if (endDate) {
      const end = parseCustomDateTime(endDate)
      if (end) {
        return txDate <= end
      }
    }

    return true
  })
}

// MM. DD. HH:MM:SS 형식을 파싱하는 함수
function parseCustomDateTime(dateTimeStr: string): Date | null {
  if (!dateTimeStr.trim()) return null

  try {
    // MM. DD. HH:MM:SS 형식 파싱
    const match = dateTimeStr.match(/^(\d{1,2})\.\s*(\d{1,2})\.\s*(\d{1,2}):(\d{1,2}):(\d{1,2})$/)
    if (!match) return null

    const [, month, day, hour, minute, second] = match
    const currentYear = new Date().getFullYear()

    // 현재 연도 기준으로 Date 객체 생성
    const date = new Date(currentYear, parseInt(month) - 1, parseInt(day), parseInt(hour), parseInt(minute), parseInt(second))

    // 유효한 날짜인지 확인
    if (isNaN(date.getTime())) return null

    return date
  } catch (error) {
    console.warn('Invalid date format:', dateTimeStr)
    return null
  }
} 