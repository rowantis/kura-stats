import { gql } from '@apollo/client'

// Swap 거래 쿼리
export const SWAP_TRANSACTIONS_QUERY = gql`
  query GetSwapTransactions($first: Int!, $skip: Int!) {
    clSwaps(first: $first, skip: $skip) {
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
    legacySwaps(first: $first, skip: $skip) {
      amount0In
      amount0Out
      amount1In
      amount1Out
      amountUSD
      origin: from
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

// Liquidity 거래 쿼리
export const LIQUIDITY_TRANSACTIONS_QUERY = gql`
  query GetLiquidityTransactions($first: Int!, $skip: Int!) {
    clMints(first: $first, skip: $skip) {
      amount1
      amount0
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
    clBurns(first: $first, skip: $skip) {
      amount1
      amount0
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
    legacyMints(first: $first, skip: $skip) {
      amount0
      amount1
      amountUSD
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
        id
      }
      transaction {
        id
        timestamp
      }
      origin: sender
    }
    legacyBurns(first: $first, skip: $skip) {
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
        id
      }
      transaction {
        id
        timestamp
      }
    }
  }
`

// Liquidity Position 쿼리
export const LIQUIDITY_POSITIONS_QUERY = gql`
  query GetLiquidityPositions($first: Int!, $skip: Int!) {
    liquidityPositions(first: $first, skip: $skip) {
      createdTime
      user
      poolType
      usdValue
      token0 {
        symbol
        id
      }
      token1 {
        symbol
        id
      }
      token0Amount
      token1Amount
    }
  }
`

// Kura Position 쿼리
export const KURA_POSITIONS_QUERY = gql`
  query GetKuraPositions($first: Int!, $skip: Int!) {
    kuraPositions(first: $first, skip: $skip) {
      user
      usdValue
      kura
      xkura
      stXkura
      k33
      vesting
    }
  }
` 