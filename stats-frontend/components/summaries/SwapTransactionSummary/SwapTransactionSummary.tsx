'use client'

import { useState } from 'react'
import SwapTransactionTable from '@/components/summaries/SwapTransactionSummary/SwapTransactionTable'
import BaseSummary from '@/components/summaries/BaseSummary'
import { formatDate } from '@/lib/utils'
import { useSwapTransactions } from '@/hooks/useSwapTransactions'

interface SwapTransactionSummaryProps {
  onTabChange: (tab: string) => void
}

export default function SwapTransactionSummary({ onTabChange }: SwapTransactionSummaryProps) {
  const [addressFilter, setAddressFilter] = useState('')
  const [poolTypeFilter, setPoolTypeFilter] = useState<"V2" | "V3" | "All">('All')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)

  const swapTransactions = useSwapTransactions({
    pageSize,
    currentPage,
    addressFilter,
    poolTypeFilter,
    startDate,
    endDate,
  })



  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const downloadCSV = () => {
    if (swapTransactions.length === 0) return

    const headers = [
      'Time(UTC)',
      'User',
      'Type',
      'Pool Type',
      'Token0',
      'Token1',
      'Token0 Amount',
      'Token1 Amount',
      'USD Value',
      'Transaction ID'
    ]

    const csvData = swapTransactions.map(tx => [
      formatDate(tx.timestamp),
      tx.origin,
      tx.type,
      tx.poolType,
      tx.token0.symbol,
      tx.token1.symbol,
      tx.token0Amount,
      tx.token1Amount,
      tx.amountUSD,
      tx.transactionId
    ])

    const filename = `kura-dex-swap-${new Date().toISOString().split('T')[0]}.csv`

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

  return (
    <BaseSummary
      currentPage={currentPage}
      pageSize={pageSize}
      totalItems={swapTransactions.length}
      onPageChange={handlePageChange}
      activeTab="swap"
      addressFilter={addressFilter}
      setAddressFilter={setAddressFilter}
      typeFilter="All"
      setTypeFilter={() => { }}
      poolTypeFilter={poolTypeFilter}
      setPoolTypeFilter={setPoolTypeFilter}
      startDate={startDate}
      setStartDate={setStartDate}
      endDate={endDate}
      setEndDate={setEndDate}
      setPageSize={setPageSize}
      onDownloadCSV={downloadCSV}
    >
      {/* 거래 테이블 */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <SwapTransactionTable
          transactions={swapTransactions}
          currentPage={currentPage}
          pageSize={pageSize}
        />
      </div>
    </BaseSummary>
  )
} 