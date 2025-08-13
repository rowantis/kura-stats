'use client'

import { ReactNode } from 'react'
import Pagination from '@/components/Pagination'
import FilterSection from '@/components/FilterSection'

interface BaseSummaryProps {
  children: ReactNode
  currentPage: number
  pageSize: number
  totalItems: number
  onPageChange: (page: number) => void
  // FilterSection props
  activeTab: 'swap' | 'liquidity' | 'liquidityPosition' | 'kuraPosition'
  addressFilter: string
  setAddressFilter: (value: string) => void
  typeFilter: string
  setTypeFilter: (value: string) => void
  poolTypeFilter: "V2" | "V3" | "All"
  setPoolTypeFilter: (value: "V2" | "V3" | "All") => void
  startDate: string
  setStartDate: (value: string) => void
  endDate: string
  setEndDate: (value: string) => void
  setPageSize: (value: number) => void
  onDownloadCSV: () => void
}

export default function BaseSummary({
  children,
  currentPage,
  pageSize,
  totalItems,
  onPageChange,
  activeTab,
  addressFilter,
  setAddressFilter,
  typeFilter,
  setTypeFilter,
  poolTypeFilter,
  setPoolTypeFilter,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  setPageSize,
  onDownloadCSV
}: BaseSummaryProps) {
  const totalPages = Math.ceil(totalItems / pageSize)

  return (
    <div>
      {/* 필터 섹션 */}
      <FilterSection
        activeTab={activeTab}
        addressFilter={addressFilter}
        setAddressFilter={setAddressFilter}
        typeFilter={typeFilter}
        setTypeFilter={setTypeFilter}
        poolTypeFilter={poolTypeFilter}
        setPoolTypeFilter={setPoolTypeFilter}
        startDate={startDate}
        setStartDate={setStartDate}
        endDate={endDate}
        setEndDate={setEndDate}
        pageSize={pageSize}
        setPageSize={setPageSize}
        currentDataLength={totalItems}
        filteredLiquidityPositionsLength={0}
        filteredKuraPositionsLength={0}
        onDownloadCSV={onDownloadCSV}
      />

      {children}

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={onPageChange}
          />
        </div>
      )}
    </div>
  )
} 