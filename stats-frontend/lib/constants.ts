// GraphQL 쿼리에서 사용하는 상수들

// 불가능한 ID (필터링용)
export const IMPOSSIBLE_ID = "0xdeafbeef00000000000000000000000000000000000000000000000000000000"

// 타임스탬프 범위
export const MIN_TIMESTAMP = "0"
export const MAX_TIMESTAMP = "100000000000000"

// 페이지네이션 기본값
export const DEFAULT_PAGE_SIZE = 20
export const INITIAL_LOAD_SIZE = 500
export const SHOW_ALL_SIZE = 1000

// 풀 타입 관련
export const POOL_TYPE = {
  ALL: "All",
  V2: "V2",
  V3: "V3"
} as const

export type PoolType = typeof POOL_TYPE[keyof typeof POOL_TYPE]


export const isTeamAccount = (address: string) => {
  return TEAM_ACCOUNTS.includes((address ?? "").toLowerCase())
}

export const isTeamFarmingAccount = (address: string) => {
  return TEAM_FARMING_ACCOUNTS.includes((address?? "").toLowerCase())
}

const TEAM_ACCOUNTS = [
  '0xd2ACBcC7Bc317432FA0f2CE31f5727dA4B9187B4'.toLowerCase(),
  '0xb041c23F702eBd65F359E62e8179fC6150ed6E34'.toLowerCase(),
  '0xCE259247B477A990b0dC93559f4499fedbbC6381'.toLowerCase(),
  '0xc71D7385ed18AD5dA6917090661AcbBfa6f8F00d'.toLowerCase(),
  '0xd0bCb448699BF98019D91018E5e730995D790391'.toLowerCase(),
  '0x1CA3a9bA21993eaF194AAaA22A566E118ECa6373'.toLowerCase(),
  '0x2098065E92a75538420F5086DAF0D044c43b9b69'.toLowerCase(),
  '0xaeb3d94C5786d7B1A2E88F3F6B7653151D20A5b5'.toLowerCase(),
  '0x11b800Cd8B2b5bd913ee45Ba806A6A9b3FdEfFFF'.toLowerCase(),
  '0xd2ACBcC7Bc317432FA0f2CE31f5727dA4B9187B4'.toLowerCase(),
  '0xb041c23F702eBd65F359E62e8179fC6150ed6E34'.toLowerCase(),
  '0xA458bF88b7e5db1f447eD768488bCBE7d42b44E7'.toLowerCase(),
  '0xcd7a48e9b5a14cddc564f93dc5c4bdac3e4e9931'.toLowerCase(),
  '0xdDd3B48CB0bD6ACc15571eCEB1915CE7514f4247'.toLowerCase(),
  '0xc637751336f7c6946bf717b17e78bb3965170bb4'.toLowerCase(),
  '0xcadfe278d7b5e65e5211cd5da181e3973e40ebe0'.toLowerCase(),

  '0x3D73ed744c92f900C7A723B50aFc83c8FF53E7c0'.toLowerCase(),
  '0xBF72430eF5018f769C0Fd514d80738dE484b806D'.toLowerCase(),
  '0x0ccdc56124a5a1e488040758db3ee4f6de86391d'.toLowerCase(),
  '0xdDd3B48CB0bD6ACc15571eCEB1915CE7514f4247'.toLowerCase(),
  '0x19998b045c70d362c33cad04264538cf5bbcaa4d'.toLowerCase(),
  '0xe90013df84e5ce9234bb3a9fe14b2b4ae48df8ac'.toLowerCase(),
]

const TEAM_FARMING_ACCOUNTS = [
  '0xc267f8082C435945caD8CbA230bdDeB949C0a487'.toLowerCase(),
  '0xDE1dDAd329A8713C3518c5DEa93EFf410F4bbE3c'.toLowerCase(),
  '0xBAF863dE292cF72F6fD8a07Fdbb78c24157C6922'.toLowerCase(),
  '0xf024F55cA6E0a30a5339508F3343d3e90f682a72'.toLowerCase(),
  '0xaC4f0fe2bf800aA3005245F095A317541D745567'.toLowerCase(),
  '0x691C7034331460cd275f81B0251238712d2c7819'.toLowerCase(),
  '0x73811a9405cF6CC81F41c4715F36CDba957B5F0b'.toLowerCase(),
  '0x8a208235FB7F2e16D12C9A4A96f6983934589727'.toLowerCase(),
  '0xA89E9C7cb8B0d6b751321A08aAC214Ba24cb794c'.toLowerCase(),
  '0xCa7D3124e5Cd9f393A66DFfbE6e8fBA784eAbc73'.toLowerCase(),
  '0x557B09a8E79727d77164E292C393dD354926242c'.toLowerCase(),
]