'use client'

import { useState, useEffect } from 'react'
import { ApolloProvider } from '@apollo/client'
import { client } from '@/lib/apollo-client'
import { SwapTransaction, LiquidityTransaction, LiquidityPosition, KuraPosition } from '@/types/graphql'
import SwapTransactionTable from '@/components/SwapTransactionTable'
import LiquidityTransactionTable from '@/components/LiquidityTransactionTable'
import LiquidityPositionTable from '@/components/LiquidityPositionTable'
import KuraPositionTable from '@/components/KuraPositionTable'
import Pagination from '@/components/Pagination'
import FilterSection from '@/components/FilterSection'
import { formatDate, parseFormattedDate } from '@/lib/utils'
import { useSwapTransactions } from '@/hooks/useSwapTransactions'
import { useLiquidityTransactions } from '@/hooks/useLiquidityTransactions'

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

function DashboardContent() {
  const [activeTab, setActiveTab] = useState<'swap' | 'liquidity' | 'liquidityPosition' | 'kuraPosition'>('swap')
  const [addressFilter, setAddressFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('All')
  const [poolTypeFilter, setPoolTypeFilter] = useState<"V2" | "V3" | "All">('All')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)

  // Swap 거래 훅 - 항상 로드
  const swapTransactions = useSwapTransactions({
    pageSize,
    currentPage,
    addressFilter,
    poolTypeFilter,
    startDate,
    endDate,
    isActive: true // 항상 활성화
  })

  // Liquidity 거래 훅 - 항상 로드
  const liquidityTransactions = useLiquidityTransactions({
    pageSize,
    currentPage,
    addressFilter,
    typeFilter,
    poolTypeFilter,
    startDate,
    endDate,
    isActive: true // 항상 활성화
  })

  // LiquidityPosition과 KuraPosition 필터링
  const [filteredLiquidityPositions, setFilteredLiquidityPositions] = useState<LiquidityPosition[]>([])
  const [filteredKuraPositions, setFilteredKuraPositions] = useState<KuraPosition[]>([])

  useEffect(() => {
    let filteredLiquidityPos = [...mockLiquidityPositions]
    let filteredKuraPos = [...mockKuraPositions]

    // 주소 필터링
    if (addressFilter) {
      filteredLiquidityPos = filteredLiquidityPos.filter(pos =>
        pos.user.toLowerCase().includes(addressFilter.toLowerCase())
      )
      filteredKuraPos = filteredKuraPos.filter(pos =>
        pos.user.toLowerCase().includes(addressFilter.toLowerCase())
      )
    }


    // 풀타입 필터링 (LiquidityPosition에서만)
    if (poolTypeFilter !== 'All' && activeTab === 'liquidityPosition') {
      filteredLiquidityPos = filteredLiquidityPos.filter(pos =>
        pos.poolType === poolTypeFilter ||
        (poolTypeFilter === 'V2' && pos.poolType.startsWith('V2:')) ||
        (poolTypeFilter === 'V3' && pos.poolType.startsWith('V3:'))
      )
    }

    // 기간 필터링 (LiquidityPosition에서만)
    if ((startDate || endDate) && activeTab === 'liquidityPosition') {
      filteredLiquidityPos = filteredLiquidityPos.filter(pos => {
        const posTime = parseFormattedDate(pos.createdTime)

        if (startDate && Number(posTime) < parseFormattedDate(startDate)) return false
        if (endDate && Number(posTime) > parseFormattedDate(endDate)) return false
        return true
      })
    }

    setFilteredLiquidityPositions(filteredLiquidityPos)
    setFilteredKuraPositions(filteredKuraPos)
  }, [addressFilter, poolTypeFilter, startDate, endDate, activeTab])

  // 현재 탭의 데이터에 대한 페이지네이션
  const getCurrentData = () => {
    if (activeTab === 'swap') {
      return swapTransactions.transactions
    } else if (activeTab === 'liquidity') {
      return liquidityTransactions.transactions
    } else if (activeTab === 'liquidityPosition') {
      return filteredLiquidityPositions
    } else {
      return filteredKuraPositions
    }
  }

  const currentData = getCurrentData()
  const totalPages = Math.ceil(currentData.length / pageSize)

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const downloadCSV = () => {
    let csvData: string[][] = []
    let headers: string[] = []
    let filename = ''

    if (activeTab === 'swap') {
      if (swapTransactions.transactions.length === 0) return

      headers = [
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

      csvData = swapTransactions.transactions.map(tx => [
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

      filename = `kura-dex-swap-${new Date().toISOString().split('T')[0]}.csv`
    } else if (activeTab === 'liquidity') {
      if (liquidityTransactions.transactions.length === 0) return

      headers = [
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

      csvData = liquidityTransactions.transactions.map(tx => [
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

      filename = `kura-dex-liquidity-${new Date().toISOString().split('T')[0]}.csv`
    } else if (activeTab === 'liquidityPosition') {
      if (filteredLiquidityPositions.length === 0) return

      headers = [
        'Created Time',
        'User',
        'Pool Type',
        'USD Value',
        'Token0',
        'Token1',
        'Token0 Amount',
        'Token1 Amount'
      ]

      csvData = filteredLiquidityPositions.map(pos => [
        pos.createdTime,
        pos.user,
        pos.poolType,
        pos.usdValue,
        pos.token0.symbol,
        pos.token1.symbol,
        pos.token0Amount,
        pos.token1Amount
      ])

      filename = `kura-liquidity-positions-${new Date().toISOString().split('T')[0]}.csv`
    } else if (activeTab === 'kuraPosition') {
      if (filteredKuraPositions.length === 0) return

      headers = [
        'User',
        'USD Value',
        'KURA',
        'xKURA',
        'st.xKURA',
        'K33',
        'Vesting'
      ]

      csvData = filteredKuraPositions.map(pos => [
        pos.user,
        pos.usdValue,
        pos.kura,
        pos.xkura,
        pos.stXkura,
        pos.k33,
        pos.vesting
      ])

      filename = `kura-positions-${new Date().toISOString().split('T')[0]}.csv`
    }

    if (csvData.length === 0) return

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

  // 현재 활성 탭의 로딩 상태
  const isLoading = () => {
    // 모든 쿼리가 완료되었을 때만 로딩 완료
    return swapTransactions.loading || liquidityTransactions.loading
  }

  // 현재 활성 탭의 에러 상태
  const getError = () => {
    // 어떤 쿼리든 에러가 있으면 반환
    return swapTransactions.error || liquidityTransactions.error
  }

  if (isLoading()) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">데이터를 불러오는 중...</div>
      </div>
    )
  }

  const error = getError()
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-red-600">에러가 발생했습니다: {error.message}</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-8xl mx-auto px-4 sm:px-5 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Kura DEX 대시보드</h1>
          <p className="text-gray-600">거래내역을 확인하세요</p>
        </div>

        {/* 탭 네비게이션 */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              <button
                onClick={() => {
                  setActiveTab('swap')
                  setCurrentPage(1)
                }}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'swap'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                Swap
              </button>
              <button
                onClick={() => {
                  setActiveTab('liquidity')
                  setCurrentPage(1)
                }}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'liquidity'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                Liquidity
              </button>
              <button
                onClick={() => {
                  setActiveTab('liquidityPosition')
                  setCurrentPage(1)
                }}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'liquidityPosition'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                Liquidity Positions
              </button>
              <button
                onClick={() => {
                  setActiveTab('kuraPosition')
                  setCurrentPage(1)
                }}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'kuraPosition'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                Kura Positions
              </button>
            </nav>
          </div>
        </div>

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
          currentDataLength={currentData.length}
          filteredLiquidityPositionsLength={filteredLiquidityPositions.length}
          filteredKuraPositionsLength={filteredKuraPositions.length}
          onDownloadCSV={downloadCSV}
        />

        {/* 거래 테이블 */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {activeTab === 'swap' && (
            <SwapTransactionTable
              transactions={swapTransactions.transactions}
              currentPage={currentPage}
              pageSize={pageSize}
            />
          )}
          {activeTab === 'liquidity' && (
            <LiquidityTransactionTable
              transactions={liquidityTransactions.transactions}
              currentPage={currentPage}
              pageSize={pageSize}
            />
          )}
          {activeTab === 'liquidityPosition' && (
            <LiquidityPositionTable
              positions={filteredLiquidityPositions}
              currentPage={currentPage}
              pageSize={pageSize}
            />
          )}
          {activeTab === 'kuraPosition' && (
            <KuraPositionTable
              positions={filteredKuraPositions}
              currentPage={currentPage}
              pageSize={pageSize}
            />
          )}

          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          )}
        </div>
      </div>
    </div>
  )
}

export default function Dashboard() {
  return (
    <ApolloProvider client={client}>
      <DashboardContent />
    </ApolloProvider>
  )
} 