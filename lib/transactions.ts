import {
  GraphQLData,
  UnifiedTransaction,
  CLSwap,
  CLMint,
  CLBurn,
  LegacySwap,
  LegacyMint,
  LegacyBurn
} from '@/types/graphql'
import { getPoolType } from '@/lib/utils'

export function transformTransactions(data: GraphQLData): UnifiedTransaction[] {
  const transactions: UnifiedTransaction[] = []

  // CL Swaps
  data.clSwaps.forEach((swap: CLSwap) => {
    transactions.push({
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

  // CL Mints
  data.clMints.forEach((mint: CLMint) => {
    transactions.push({
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
    transactions.push({
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

  // Legacy Swaps
  data.legacySwaps.forEach((swap: LegacySwap) => {
    transactions.push({
      id: `${swap.transaction.id}-legacy-swap`,
      type: 'Swap',
      origin: swap.origin,
      token0: swap.pool.token0,
      token1: swap.pool.token1,
      token0Amount: swap.amount0In || swap.amount0Out,
      token1Amount: swap.amount1In || swap.amount1Out,
      amountUSD: swap.amountUSD,
      timestamp: swap.transaction.timestamp,
      transactionId: swap.transaction.id,
      poolType: getPoolType(undefined, swap.pool.isStable),
    })
  })

  // Legacy Mints
  data.legacyMints.forEach((mint: LegacyMint) => {
    transactions.push({
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
    transactions.push({
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
  return transactions.sort((a, b) =>
    new Date(Number(b.timestamp) * 1000).getTime() - new Date(Number(a.timestamp) * 1000).getTime()
  ).filter(tx => tx.origin)
}

export function filterTransactionsByAddress(
  transactions: UnifiedTransaction[],
  address: string
): UnifiedTransaction[] {
  if (!address) return transactions
  return transactions.filter(tx =>
    tx.origin && tx.origin.toLowerCase() === address.toLowerCase()
  )
}

export function filterTransactionsByType(
  transactions: UnifiedTransaction[],
  type: string
): UnifiedTransaction[] {
  if (!type || type === 'All') return transactions
  return transactions.filter(tx => tx.type === type)
}

export function filterTransactionsByToken(
  transactions: UnifiedTransaction[],
  tokenAddress: string
): UnifiedTransaction[] {
  if (!tokenAddress) return transactions
  return transactions.filter(tx =>
    tx.token0.id.toLowerCase() === tokenAddress.toLowerCase() ||
    tx.token1.id.toLowerCase() === tokenAddress.toLowerCase()
  )
}

export function filterTransactionsByPoolType(
  transactions: UnifiedTransaction[],
  poolType: string
): UnifiedTransaction[] {
  if (!poolType || poolType === 'All') return transactions

  if (poolType === 'V2') {
    return transactions.filter(tx => tx.poolType.startsWith('V2:'))
  }

  if (poolType === 'V3') {
    return transactions.filter(tx => tx.poolType.startsWith('V3:'))
  }

  return transactions.filter(tx => tx.poolType === poolType)
} 