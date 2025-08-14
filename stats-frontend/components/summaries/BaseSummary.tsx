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
  startTimestamp: string
  setStartTimestamp: (value: string) => void
  endTimestamp: string
  setEndTimestamp: (value: string) => void
  setPageSize: (value: number) => void
  onDownloadCSV: () => void
  // Pagination props
  hasMoreData?: boolean
  loadedPages?: number
  onLoadMore?: () => Promise<void>
  onShowAll?: () => Promise<void>
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
  startTimestamp,
  setStartTimestamp,
  endTimestamp,
  setEndTimestamp,
  setPageSize,
  onDownloadCSV,
  hasMoreData,
  loadedPages,
  onLoadMore,
  onShowAll
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
        startTimestamp={startTimestamp}
        setStartTimestamp={setStartTimestamp}
        endTimestamp={endTimestamp}
        setEndTimestamp={setEndTimestamp}
        pageSize={pageSize}
        setPageSize={setPageSize}
        currentDataLength={totalItems}
        filteredLiquidityPositionsLength={0}
        filteredKuraPositionsLength={0}
        onDownloadCSV={onDownloadCSV}
      />

      {children}

      {/* 페이지네이션 */}
      {(() => {
        const actualPages = loadedPages || totalPages
        const shouldShowPagination = actualPages > 1 || hasMoreData

        if (!shouldShowPagination) return null

        return (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <Pagination
              currentPage={currentPage}
              loadedPages={actualPages}
              hasMoreData={hasMoreData || false}
              isLoadingMore={false}
              onPageChange={onPageChange}
              onLoadMore={onLoadMore || (() => Promise.resolve())}
              onShowAll={onShowAll || (() => Promise.resolve())}
            />
          </div>
        )
      })()}
    </div>
  )
} 