import { getTypeColor } from '@/lib/utils'

interface TypeChipProps {
  type: string
}

export default function TypeChip({ type }: TypeChipProps) {
  return (
    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(type)}`}>
      {type}
    </span>
  )
} 