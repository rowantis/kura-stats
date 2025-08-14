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
  data.clSwaps?.forEach((swap: CLSwap) => {
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
  data.legacySwaps?.forEach((swap: LegacySwap) => {
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
  data.clMints?.forEach((mint: CLMint) => {
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
  data.clBurns?.forEach((burn: CLBurn) => {
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
  data.legacyMints?.forEach((mint: LegacyMint) => {
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
  data.legacyBurns?.forEach((burn: LegacyBurn) => {
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
