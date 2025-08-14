export interface Token {
  symbol: string
  id: string
}

export interface Transaction {
  id: string
  timestamp: string
}

export interface CLPool {
  feeTier: number
}

export interface LegacyPool {
  isStable: boolean
  id: string
  token0: Token
  token1: Token
}

export interface CLSwap {
  amount0: string
  amount1: string
  amountUSD: string
  origin: string
  pool: CLPool
  token0: Token
  token1: Token
  transaction: Transaction
}

export interface CLMint {
  amount1: string
  amount0: string
  amountUSD: string
  origin: string
  pool: CLPool
  token0: Token
  token1: Token
  transaction: Transaction
}

export interface CLBurn {
  amount1: string
  amount0: string
  amountUSD: string
  origin: string
  pool: CLPool
  token0: Token
  token1: Token
  transaction: Transaction
}

export interface LegacySwap {
  amount0In: string
  amount0Out: string
  amount1In: string
  amount1Out: string
  amountUSD: string
  origin: string
  pool: LegacyPool
  transaction: Transaction
}

export interface LegacyMint {
  amount0: string
  amount1: string
  amountUSD: string
  pool: LegacyPool
  transaction: Transaction
  origin: string // TODO: fix
}

export interface LegacyBurn {
  amount0: string
  amount1: string
  amountUSD: string
  origin: string // TODO: fix
  pool: LegacyPool
  transaction: Transaction
}

export interface GraphQLData {
  clSwaps: CLSwap[]
  clMints: CLMint[]
  clBurns: CLBurn[]
  legacySwaps: LegacySwap[]
  legacyMints: LegacyMint[]
  legacyBurns: LegacyBurn[]
}

// DEX 거래 타입
export interface SwapTransaction {
  id: string
  type: 'Swap'
  origin: string
  token0: Token
  token1: Token
  token0Amount: string
  token1Amount: string
  amountUSD: string
  timestamp: string
  transactionId: string
  poolType: string
}

export interface LiquidityTransaction {
  id: string
  type: 'Mint' | 'Burn'
  origin: string
  token0: Token
  token1: Token
  token0Amount: string
  token1Amount: string
  amountUSD: string
  timestamp: string
  transactionId: string
  poolType: string
}

export type DexTransaction = SwapTransaction | LiquidityTransaction

export interface LiquidityPosition {
  user: string
  poolType: string
  usdValue: string
  token0: Token
  token1: Token
  token0Amount: string
  token1Amount: string
}

export interface KuraPosition {
  user: string
  usdValue: string
  kura: string
  xkura: string
  stXkura: string
  k33: string
  vesting: string
}

// 새로운 GraphQL 쿼리 타입들
export interface XShadowPosition {
  stakedBalance: string
  vestedBalance: string
  x33Balance: string
  balance: string
  owner: string
}

export interface XShadowVest {
  vestingAmount: string
  owner: string
  status: string
}

export interface KuraPositionData {
  xshadowPositions: XShadowPosition[]
  xshadowVests: XShadowVest[]
} 