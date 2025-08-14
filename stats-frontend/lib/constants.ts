// GraphQL 쿼리에서 사용하는 상수들

// 불가능한 ID (필터링용)
export const IMPOSSIBLE_ID = "0xdeafbeef00000000000000000000000000000000000000000000000000000000"

// 타임스탬프 범위
export const MIN_TIMESTAMP = "0"
export const MAX_TIMESTAMP = "100000000000000"

// 페이지네이션 기본값
export const DEFAULT_PAGE_SIZE = 20
export const INITIAL_LOAD_SIZE = 100
export const SHOW_ALL_SIZE = 10000

// 풀 타입 관련
export const POOL_TYPE = {
  ALL: "All",
  V2: "V2",
  V3: "V3"
} as const

export type PoolType = typeof POOL_TYPE[keyof typeof POOL_TYPE] 