'use client'

import { useState, useEffect } from 'react'
import { KuraPosition } from '@/types/graphql'
import KuraPositionTable from '@/components/summaries/KuraPositionSummary/KuraPositionTable'
import BaseSummary from '@/components/summaries/BaseSummary'

// 목업 데이터
const mockKuraPositions: KuraPosition[] = [
  {
    user: '0x1234567890abcdef1234567890abcdef12345678',
    usdValue: '5000.00',
    kura: '10000.0',
    xkura: '9500.0',
    stXkura: '9000.0',
    k33: '500.0',
    vesting: '2024-12-31'
  },
  {
    user: '0xabcdef1234567890abcdef1234567890abcdef12',
    usdValue: '3200.75',
    kura: '6400.0',
    xkura: '6080.0',
    stXkura: '5760.0',
    k33: '320.0',
    vesting: '2024-10-15'
  },
  {
    user: '0x9876543210fedcba9876543210fedcba98765432',
    usdValue: '1800.50',
    kura: '3600.0',
    xkura: '3420.0',
    stXkura: '3240.0',
    k33: '180.0',
    vesting: '2025-03-20'
  }
]

interface KuraPositionSummaryProps {
  onTabChange: (tab: string) => void
}

export default function KuraPositionSummary({ onTabChange }: KuraPositionSummaryProps) {
  const [addressFilter, setAddressFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)

  // KuraPosition 필터링
  const [filteredKuraPositions, setFilteredKuraPositions] = useState<KuraPosition[]>([])

  useEffect(() => {
    let filteredKuraPos = [...mockKuraPositions]

    // 주소 필터링
    if (addressFilter) {
      filteredKuraPos = filteredKuraPos.filter(pos =>
        pos.user.toLowerCase().includes(addressFilter.toLowerCase())
      )
    }

    setFilteredKuraPositions(filteredKuraPos)
  }, [addressFilter])



  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const downloadCSV = () => {
    if (filteredKuraPositions.length === 0) return

    const headers = [
      'User',
      'USD Value',
      'KURA',
      'xKURA',
      'st.xKURA',
      'K33',
      'Vesting'
    ]

    const csvData = filteredKuraPositions.map(pos => [
      pos.user,
      pos.usdValue,
      pos.kura,
      pos.xkura,
      pos.stXkura,
      pos.k33,
      pos.vesting
    ])

    const filename = `kura-positions-${new Date().toISOString().split('T')[0]}.csv`

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
      totalItems={filteredKuraPositions.length}
      onPageChange={handlePageChange}
      activeTab="kuraPosition"
      addressFilter={addressFilter}
      setAddressFilter={setAddressFilter}
      typeFilter="All"
      setTypeFilter={() => { }}
      poolTypeFilter="All"
      setPoolTypeFilter={() => { }}
      startTimestamp=""
      setStartTimestamp={() => { }}
      endTimestamp=""
      setEndTimestamp={() => { }}
      setPageSize={setPageSize}
      onDownloadCSV={downloadCSV}
    >
      {/* 거래 테이블 */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <KuraPositionTable
          positions={filteredKuraPositions}
          currentPage={currentPage}
          pageSize={pageSize}
        />
      </div>
    </BaseSummary>
  )
} 