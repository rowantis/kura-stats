'use client'

import { useMemo, useState } from 'react'
import LiquidityPositionTable from '@/components/summaries/LiquidityPositionSummary/LiquidityPositionTable'
import BaseSummary from '@/components/summaries/BaseSummary'
import { useLiquidityPositions } from '@/hooks/useLiquidityPositions'
import { getCurrentDateKST } from '@/lib/utils'

interface LiquidityPositionSummaryProps {
  onTabChange: (tab: string) => void
}

export default function LiquidityPositionSummary({ onTabChange }: LiquidityPositionSummaryProps) {
  const [addressFilter, setAddressFilter] = useState('')
  const [poolTypeFilter, setPoolTypeFilter] = useState<"V2" | "V3" | "All">('All')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)

  const {
    positions: liquidityPositions,
    loading,
    error,
    hasMoreData,
    loadedPages,
    showAll
  } = useLiquidityPositions({
    pageSize,
    currentPage,
    addressFilter,
    poolTypeFilter,
  })



  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const downloadCSV = useMemo(() => {
    const _downloadCSV = () => {
      if (liquidityPositions.length === 0) return

      const headers = [
        'User',
        'Pool Type',
        'USD Value',
        'Token0',
        'Token1',
        'Token0 Amount',
        'Token1 Amount'
      ]

      const csvData = liquidityPositions.map((pos: any) => [
        pos.user,
        pos.poolType,
        pos.usdValue,
        pos.token0.symbol,
        pos.token1.symbol,
        pos.token0Amount,
        pos.token1Amount
      ])

      const filename = `kura-liquidity-positions-${getCurrentDateKST()}.csv`

      // CSV 문자열 생성
      const csvContent = [
        headers.join(','),
        ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n')

      // 파일 다운로드
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', filename)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
    return _downloadCSV
  }, [liquidityPositions])

  return (
    <BaseSummary
      currentPage={currentPage}
      pageSize={pageSize}
      totalItems={liquidityPositions.length}
      onPageChange={handlePageChange}
      activeTab="liquidityPosition"
      addressFilter={addressFilter}
      setAddressFilter={setAddressFilter}
      typeFilter="All"
      setTypeFilter={() => { }}
      poolTypeFilter={poolTypeFilter}
      setPoolTypeFilter={setPoolTypeFilter}
      startTimestamp=""
      setStartTimestamp={() => { }}
      endTimestamp=""
      setEndTimestamp={() => { }}
      setPageSize={setPageSize}
      onDownloadCSV={downloadCSV}
      hasMoreData={hasMoreData}
      loadedPages={loadedPages}
      onLoadMore={() => Promise.resolve()}
      onShowAll={showAll}
    >
      {/* 거래 테이블 */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <LiquidityPositionTable
          positions={liquidityPositions}
          currentPage={currentPage}
          pageSize={pageSize}
        />
      </div>
    </BaseSummary>
  )
} 