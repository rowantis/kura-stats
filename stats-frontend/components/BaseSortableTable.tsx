import React, { useState, useMemo } from 'react'
import { ChevronUp, ChevronDown } from 'lucide-react'

interface BaseSortableTableProps {
  children: React.ReactNode
  currentPage?: number
  pageSize?: number
  totalItems?: number
  showPagination?: boolean
}

export default function BaseSortableTable({
  children,
  currentPage = 1,
  pageSize = 10,
  totalItems = 0,
  showPagination = true
}: BaseSortableTableProps) {
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = startIndex + pageSize
  const totalPages = Math.ceil(totalItems / pageSize)

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        {children}
      </table>
      {showPagination && totalPages > 1 && (
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
          <div className="text-sm text-gray-700">
            {startIndex + 1}-{Math.min(endIndex, totalItems)} of {totalItems} items
          </div>
        </div>
      )}
    </div>
  )
}

// 정렬 가능한 테이블 헤더 컴포넌트
export function SortableTableHeader({
  children,
  sortable = false,
  sortDirection = 'none',
  onSort
}: {
  children: React.ReactNode
  sortable?: boolean
  sortDirection?: 'asc' | 'desc' | 'none'
  onSort?: () => void
}) {
  return (
    <thead className="bg-gray-50">
      <tr>
        {children}
      </tr>
    </thead>
  )
}

// 정렬 가능한 테이블 헤더 셀 컴포넌트
export function SortableTableHeaderCell({
  children,
  sortable = false,
  sortDirection = 'none',
  onSort
}: {
  children: React.ReactNode
  sortable?: boolean
  sortDirection?: 'asc' | 'desc' | 'none'
  onSort?: () => void
}) {
  return (
    <th
      className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${sortable ? 'cursor-pointer hover:bg-gray-100 select-none' : ''
        }`}
      onClick={sortable ? onSort : undefined}
    >
      <div className="flex items-center space-x-1">
        <span>{children}</span>
        {sortable && (
          <div className="flex flex-col">
            <ChevronUp
              className={`w-3 h-3 ${sortDirection === 'asc' ? 'text-blue-600' : 'text-gray-400'
                }`}
            />
            <ChevronDown
              className={`w-3 h-3 ${sortDirection === 'desc' ? 'text-blue-600' : 'text-gray-400'
                }`}
            />
          </div>
        )}
      </div>
    </th>
  )
}

// 테이블 바디 컴포넌트
export function TableBody({ children }: { children: React.ReactNode }) {
  return (
    <tbody className="bg-white divide-y divide-gray-200">
      {children}
    </tbody>
  )
}

// 테이블 행 컴포넌트
export function TableRow({ children, className = "hover:bg-gray-50" }: { children: React.ReactNode, className?: string }) {
  return (
    <tr className={className}>
      {children}
    </tr>
  )
}

// 테이블 셀 컴포넌트
export function TableCell({ children, className = "px-6 py-4 whitespace-nowrap text-sm text-gray-900" }: { children: React.ReactNode, className?: string }) {
  return (
    <td className={className}>
      {children}
    </td>
  )
}

// 정렬 훅
export function useSortableTable<T>(data: T[], initialSortKey?: keyof T, initialSortDirection: 'asc' | 'desc' = 'asc') {
  const [sortKey, setSortKey] = useState<keyof T | undefined>(initialSortKey)
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>(initialSortDirection)

  const sortedData = useMemo(() => {
    if (!sortKey) return data

    return [...data].sort((a, b) => {
      const aValue = a[sortKey]
      const bValue = b[sortKey]

      if (aValue === null || aValue === undefined) return 1
      if (bValue === null || bValue === undefined) return -1

      let comparison = 0
      if (sortKey === 'user') {
        comparison = (aValue as string).localeCompare(bValue as string)
      } else {
        comparison = (aValue as number) - (bValue as number)
      }

      return sortDirection === 'asc' ? comparison : -comparison
    })
  }, [data, sortKey, sortDirection])

  const handleSort = (key: keyof T) => {
    if (sortKey === key) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDirection('asc')
    }
  }

  const getSortDirection = (key: keyof T): 'asc' | 'desc' | 'none' => {
    if (sortKey !== key) return 'none'
    return sortDirection
  }

  return {
    sortedData,
    sortKey,
    sortDirection,
    handleSort,
    getSortDirection
  }
} 