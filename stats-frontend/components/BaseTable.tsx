import React from 'react'

interface BaseTableProps {
  children: React.ReactNode
  currentPage: number
  pageSize: number
  totalItems: number
}

export default function BaseTable({ children, currentPage, pageSize, totalItems }: BaseTableProps) {
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = startIndex + pageSize
  const totalPages = Math.ceil(totalItems / pageSize)

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        {children}
      </table>
      {totalPages > 1 && (
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
          <div className="text-sm text-gray-700">
            {startIndex + 1}-{Math.min(endIndex, totalItems)} of {totalItems} items
          </div>
        </div>
      )}
    </div>
  )
}

// 테이블 헤더 컴포넌트
export function TableHeader({ children }: { children: React.ReactNode }) {
  return (
    <thead className="bg-gray-50">
      <tr>
        {children}
      </tr>
    </thead>
  )
}

// 테이블 헤더 셀 컴포넌트
export function TableHeaderCell({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
      {children}
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