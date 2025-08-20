export function formatAddress(address: string): string {
  if (!address) return ''
  return `${address.slice(0, 5)}..${address.slice(-4)}`
}

export function formatAmount(amount: string): string {
  if (!amount) return '0'
  const num = parseFloat(amount)
  if (isNaN(num)) return '0'

  if (num === 0) return '0'
  if (Math.abs(num) < 0.000001) return '< 0.000001'
  if (Math.abs(num) < 0.01) return num.toFixed(6)
  if (Math.abs(num) < 1) return num.toFixed(4)
  if (Math.abs(num) < 1000) return num.toFixed(2)

  return num.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}

export function formatUSD(amount: string): string {
  if (!amount) return '$0.00'
  const num = parseFloat(amount)
  if (isNaN(num)) return '$0.00'

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num)
}

export function formatDate(timestamp: string): string {
  if (!timestamp) return ''

  let date: Date

  date = new Date(Number(timestamp) * 1000)
  // Invalid Date 체크
  if (isNaN(date.getTime())) {
    return ''
  }

  // KST 시간으로 변환 (UTC + 9시간)
  const kstDate = new Date(date.getTime() + 9 * 60 * 60 * 1000)

  const month = String(kstDate.getUTCMonth() + 1).padStart(2, '0')
  const day = String(kstDate.getUTCDate()).padStart(2, '0')
  const hours = String(kstDate.getUTCHours()).padStart(2, '0')
  const minutes = String(kstDate.getUTCMinutes()).padStart(2, '0')
  const seconds = String(kstDate.getUTCSeconds()).padStart(2, '0')

  return `${month}. ${day}. ${hours}:${minutes}:${seconds}`
}

// formatDate의 역함수: KST 형식 날짜 문자열을 timestamp로 변환
export function parseFormattedDate(formattedDate: string): number {
  if (!formattedDate) {
    return 0
  }

  try {
    // "08. 13. 08:16:02" 형식을 파싱
    const match = formattedDate.match(/(\d{2})\. (\d{2})\. (\d{2}):(\d{2}):(\d{2})/)
    if (!match) {
      return 0
    }

    const [, month, day, hours, minutes, seconds] = match

    // 현재 연도를 기준으로 KST Date 객체 생성
    const currentYear = new Date().getUTCFullYear()
    const kstDate = new Date(Date.UTC(
      currentYear,
      parseInt(month) - 1, // month는 0-based
      parseInt(day),
      parseInt(hours),
      parseInt(minutes),
      parseInt(seconds)
    ))

    // KST를 UTC로 변환 (KST - 9시간)
    const utcDate = new Date(kstDate.getTime() - 9 * 60 * 60 * 1000)

    // timestamp를 초 단위로 반환
    return Math.floor(utcDate.getTime() / 1000)
  } catch (error) {
    return 0
  }
}

export function parseFormattedDate2(formattedDate: string): number {
  // parse 2025-08-13 (KST 기준)
  if (!formattedDate) {
    return 0
  }

  // KST 기준 날짜를 UTC로 변환
  const kstDate = new Date(formattedDate + 'T00:00:00+09:00')
  const utcDate = new Date(kstDate.getTime() - 9 * 60 * 60 * 1000)

  return Math.floor(utcDate.getTime() / 1000)
}

// KST 기준 현재 날짜를 YYYY-MM-DD 형식으로 반환
export function getCurrentDateKST(): string {
  const now = new Date()
  const kstDate = new Date(now.getTime() + 9 * 60 * 60 * 1000)

  const year = kstDate.getUTCFullYear()
  const month = String(kstDate.getUTCMonth() + 1).padStart(2, '0')
  const day = String(kstDate.getUTCDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

// Fee tier를 tick spacing으로 변환
const FEE_TIER_TO_TICK_SPACING: Record<number, number> = {
  100: 1,
  250: 5,
  500: 10,
  3000: 50,
  10000: 100,
  20000: 200,
}

const TICK_SPACING_TO_FEE_TIER: Record<number, number> = {
  1: 100,
  5: 250,
  10: 500,
  50: 3000,
  100: 10000,
  200: 20000,
}

export function getTickSpacing(feeTier: number): number {
  if (!FEE_TIER_TO_TICK_SPACING[feeTier]) {
    throw new Error('Invalid fee tier')
  }
  return FEE_TIER_TO_TICK_SPACING[feeTier]
}

export function getFeeTier(tickSpacing: number): number {
  if (!TICK_SPACING_TO_FEE_TIER[tickSpacing]) {
    throw new Error('Invalid tick spacing')
  }
  return TICK_SPACING_TO_FEE_TIER[tickSpacing]
}

// Pool 타입 결정
export function getPoolType(feeTier?: number, isStable?: boolean): string {
  if (feeTier !== undefined) {
    const tickSpacing = getTickSpacing(feeTier)
    return `V3:${tickSpacing}ticks`
  } else if (isStable !== undefined) {
    return `V2:${isStable ? 'stable' : 'volatile'}`
  }
  return 'Unknown'
}

// 거래 타입별 색상 결정
export function getTypeColor(type: string): string {
  switch (type) {
    case 'Swap':
      return 'text-blue-600 bg-blue-100'
    case 'Mint':
      return 'text-green-600 bg-green-100'
    case 'Burn':
      return 'text-red-600 bg-red-100'
    default:
      return 'text-gray-600 bg-gray-100'
  }
}

// 풀 타입별 색상 결정
export function getPoolTypeColor(poolType: string): string {
  if (poolType.startsWith('V3:')) {
    return 'text-purple-600 bg-purple-100'
  } else if (poolType.startsWith('V2:')) {
    return 'text-orange-600 bg-orange-100'
  }
  return 'text-gray-600 bg-gray-100'
} 