'use client'

import { useState, useEffect } from 'react'
import { LiquidityPosition } from '@/types/graphql'
import LiquidityPositionTable from '@/components/summaries/LiquidityPositionSummary/LiquidityPositionTable'
import BaseSummary from '@/components/summaries/BaseSummary'
import { parseFormattedDate } from '@/lib/utils'

// 목업 데이터
const mockLiquidityPositions: LiquidityPosition[] = [
  {
    createdTime: '08. 13. 10:30:00',
    user: '0x1234567890abcdef1234567890abcdef12345678',
    poolType: 'V3:10ticks',
    usdValue: '1250.50',
    token0: { symbol: 'USDC', id: '0xa0b86a33e6441b8c4c8c0' },
    token1: { symbol: 'ETH', id: '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984' },
    token0Amount: '1250.50',
    token1Amount: '0.5'
  },
  {
    createdTime: '08. 13. 09:15:00',
    user: '0xabcdef1234567890abcdef1234567890abcdef12',
    poolType: 'V2:stable',
    usdValue: '3200.75',
    token0: { symbol: 'USDT', id: '0xdac17f958d2ee523a2206206994597c13d831ec7' },
    token1: { symbol: 'USDC', id: '0xa0b86a33e6441b8c4c8c0' },
    token0Amount: '3200.75',
    token1Amount: '3200.75'
  },
  {
    createdTime: '08. 13. 08:45:00',
    user: '0x9876543210fedcba9876543210fedcba98765432',
    poolType: 'V3:1ticks',
    usdValue: '850.25',
    token0: { symbol: 'WBTC', id: '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599' },
    token1: { symbol: 'ETH', id: '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984' },
    token0Amount: '0.025',
    token1Amount: '1.2'
  }
]

interface LiquidityPositionSummaryProps {
  onTabChange: (tab: string) => void
}

export default function LiquidityPositionSummary({ onTabChange }: LiquidityPositionSummaryProps) {
  const [addressFilter, setAddressFilter] = useState('')
  const [poolTypeFilter, setPoolTypeFilter] = useState<"V2" | "V3" | "All">('All')
  const [startTimestamp, setStartTimestamp] = useState('')
  const [endTimestamp, setEndTimestamp] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)

  // LiquidityPosition 필터링
  const [filteredLiquidityPositions, setFilteredLiquidityPositions] = useState<LiquidityPosition[]>([])

  useEffect(() => {
    let filteredLiquidityPos = [...mockLiquidityPositions]

    // 주소 필터링
    if (addressFilter) {
      filteredLiquidityPos = filteredLiquidityPos.filter(pos =>
        pos.user.toLowerCase().includes(addressFilter.toLowerCase())
      )
    }

    // 풀타입 필터링
    if (poolTypeFilter !== 'All') {
      filteredLiquidityPos = filteredLiquidityPos.filter(pos =>
        pos.poolType === poolTypeFilter ||
        (poolTypeFilter === 'V2' && pos.poolType.startsWith('V2:')) ||
        (poolTypeFilter === 'V3' && pos.poolType.startsWith('V3:'))
      )
    }

    // 기간 필터링
    if (startTimestamp || endTimestamp) {
      filteredLiquidityPos = filteredLiquidityPos.filter(pos => {

        if (startTimestamp && Number(pos.createdTime) < Number(startTimestamp)) return false
        if (endTimestamp && Number(pos.createdTime) > Number(endTimestamp)) return false
        return true
      })
    }

    setFilteredLiquidityPositions(filteredLiquidityPos)
  }, [addressFilter, poolTypeFilter, startTimestamp, endTimestamp])



  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const downloadCSV = () => {
    if (filteredLiquidityPositions.length === 0) return

    const headers = [
      'Created Time',
      'User',
      'Pool Type',
      'USD Value',
      'Token0',
      'Token1',
      'Token0 Amount',
      'Token1 Amount'
    ]

    const csvData = filteredLiquidityPositions.map(pos => [
      pos.createdTime,
      pos.user,
      pos.poolType,
      pos.usdValue,
      pos.token0.symbol,
      pos.token1.symbol,
      pos.token0Amount,
      pos.token1Amount
    ])

    const filename = `kura-liquidity-positions-${new Date().toISOString().split('T')[0]}.csv`

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
      totalItems={filteredLiquidityPositions.length}
      onPageChange={handlePageChange}
      activeTab="liquidityPosition"
      addressFilter={addressFilter}
      setAddressFilter={setAddressFilter}
      typeFilter="All"
      setTypeFilter={() => { }}
      poolTypeFilter={poolTypeFilter}
      setPoolTypeFilter={setPoolTypeFilter}
      startTimestamp={startTimestamp}
      setStartTimestamp={setStartTimestamp}
      endTimestamp={endTimestamp}
      setEndTimestamp={setEndTimestamp}
      setPageSize={setPageSize}
      onDownloadCSV={downloadCSV}
    >
      {/* 거래 테이블 */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <LiquidityPositionTable
          positions={filteredLiquidityPositions}
          currentPage={currentPage}
          pageSize={pageSize}
        />
      </div>
    </BaseSummary>
  )
} 