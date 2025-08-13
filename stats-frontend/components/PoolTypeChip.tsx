import { getPoolTypeColor } from '@/lib/utils'

interface PoolTypeChipProps {
  poolType: string
}

export default function PoolTypeChip({ poolType }: PoolTypeChipProps) {
  return (
    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPoolTypeColor(poolType)}`}>
      {poolType}
    </span>
  )
} 