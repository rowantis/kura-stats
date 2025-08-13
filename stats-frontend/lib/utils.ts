export function formatAddress(address: string): string {
  if (!address) return ''
  return `${address.slice(0, 5)}..${address.slice(-2)}`
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
    console.warn('Invalid timestamp:', timestamp)
    return 'Invalid Date'
  }

  // UTC 시간을 가져와서 기존 형식으로 포맷
  const month = String(date.getUTCMonth() + 1).padStart(2, '0')
  const day = String(date.getUTCDate()).padStart(2, '0')
  const hours = String(date.getUTCHours()).padStart(2, '0')
  const minutes = String(date.getUTCMinutes()).padStart(2, '0')
  const seconds = String(date.getUTCSeconds()).padStart(2, '0')

  return `${month}. ${day}. ${hours}:${minutes}:${seconds}`
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

export function getTickSpacing(feeTier: number): number {
  return FEE_TIER_TO_TICK_SPACING[feeTier] || 0
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