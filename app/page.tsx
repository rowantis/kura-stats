'use client'

import { useState, useEffect } from 'react'
import { useQuery, gql } from '@apollo/client'
import { ApolloProvider } from '@apollo/client'
import { client } from '@/lib/apollo-client'
import { transformTransactions, filterTransactionsByAddress, filterTransactionsByType, filterTransactionsByToken, filterTransactionsByPoolType } from '@/lib/transactions'
import { SwapTransaction, LiquidityTransaction } from '@/types/graphql'
import TransactionTable from '@/components/TransactionTable'
import Pagination from '@/components/Pagination'

const DEX_QUERY = gql`
  query MyQuery {
    clSwaps {
      amount0
      amount1
      amountUSD
      origin
      pool {
        feeTier
      }
      token0 {
        symbol
        id
      }
      token1 {
        symbol
        id
      }
      transaction {
        id
        timestamp
      }
    }
    clMints {
      amount1
      amount0
      amountUSD
      origin
      pool {
        feeTier
      }
      token0 {
        symbol
        id
      }
      token1 {
        symbol
        id
      }
      transaction {
        id
        timestamp
      }
    }
    clBurns {
      amount1
      amount0
      amountUSD
      origin
      pool {
        feeTier
      }
      token0 {
        symbol
        id
      }
      token1 {
        symbol
        id
      }
      transaction {
        id
        timestamp
      }
    }
    legacySwaps {
      amount0In
      amount0Out
      amount1In
      amount1Out
      amountUSD
      origin: from
      pool {
        isStable
        token0 {
          symbol
          id
        }
        token1 {
          symbol
          id
        }
      }
      transaction {
        id
        timestamp
      }
    }
    legacyMints {
      amount0
      amount1
      amountUSD
      pool {
        isStable
        token0 {
          symbol
          id
        }
        token1 {
          symbol
          id
        }
        id
      }
      transaction {
        id
        timestamp
      }
      origin:sender
    }
    
    legacyBurns {
      amount0
      amount1
      amountUSD
      origin:sender
      pool {
        isStable
        token0 {
          symbol
          id
        }
        token1 {
          symbol
          id
        }
        id
      }
      transaction {
        id
        timestamp
      }
    }
  }
`

function DashboardContent() {
  const [activeTab, setActiveTab] = useState<'swap' | 'liquidity'>('swap')
  const [addressFilter, setAddressFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('All')
  const [tokenFilter, setTokenFilter] = useState('')
  const [poolTypeFilter, setPoolTypeFilter] = useState('All')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [filteredTransactions, setFilteredTransactions] = useState<{
    swaps: SwapTransaction[]
    liquidity: LiquidityTransaction[]
  }>({ swaps: [], liquidity: [] })

  const { loading, error, data } = useQuery(DEX_QUERY)

  useEffect(() => {
    if (data) {
      const { swaps, liquidity } = transformTransactions(data)
      let filteredSwaps = [...swaps]
      let filteredLiquidity = [...liquidity]

      // 주소 필터링
      if (addressFilter) {
        filteredSwaps = filterTransactionsByAddress(filteredSwaps, addressFilter)
        filteredLiquidity = filterTransactionsByAddress(filteredLiquidity, addressFilter)
      }

      // 타입 필터링 (Liquidity 탭에서만 적용)
      if (activeTab === 'liquidity' && typeFilter !== 'All') {
        filteredLiquidity = filterTransactionsByType(filteredLiquidity, typeFilter)
      }

      // 토큰 필터링
      if (tokenFilter) {
        filteredSwaps = filterTransactionsByToken(filteredSwaps, tokenFilter)
        filteredLiquidity = filterTransactionsByToken(filteredLiquidity, tokenFilter)
      }

      // 풀타입 필터링
      if (poolTypeFilter !== 'All') {
        filteredSwaps = filterTransactionsByPoolType(filteredSwaps, poolTypeFilter)
        filteredLiquidity = filterTransactionsByPoolType(filteredLiquidity, poolTypeFilter)
      }

      setFilteredTransactions({ swaps: filteredSwaps, liquidity: filteredLiquidity })
      setCurrentPage(1) // 필터 변경시 첫 페이지로
    }
  }, [data, addressFilter, typeFilter, tokenFilter, poolTypeFilter, activeTab])

  const currentTransactions = activeTab === 'swap' ? filteredTransactions.swaps : filteredTransactions.liquidity
  const totalPages = Math.ceil(currentTransactions.length / pageSize)

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize)
    setCurrentPage(1)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">데이터를 불러오는 중...</div>
      </div>
    )
  }

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
                onClick={() => setActiveTab('swap')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'swap'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                Swap
              </button>
              <button
                onClick={() => setActiveTab('liquidity')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'liquidity'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                Liquidity
              </button>
            </nav>
          </div>
        </div>

        {/* 필터 섹션 */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                주소 필터
              </label>
              <input
                type="text"
                id="address"
                placeholder="0x..."
                value={addressFilter}
                onChange={(e) => setAddressFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
              />
            </div>

            {activeTab === 'liquidity' && (
              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
                  거래 타입
                </label>
                <select
                  id="type"
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                >
                  <option value="All">전체</option>
                  <option value="Mint">Mint</option>
                  <option value="Burn">Burn</option>
                </select>
              </div>
            )}

            <div>
              <label htmlFor="token" className="block text-sm font-medium text-gray-700 mb-2">
                토큰 필터
              </label>
              <input
                type="text"
                id="token"
                placeholder="0x..."
                value={tokenFilter}
                onChange={(e) => setTokenFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
              />
            </div>

            <div>
              <label htmlFor="poolType" className="block text-sm font-medium text-gray-700 mb-2">
                풀 타입
              </label>
              <select
                id="poolType"
                value={poolTypeFilter}
                onChange={(e) => setPoolTypeFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
              >
                <option value="All">전체</option>
                <option value="V2">V2</option>
                <option value="V3">V3</option>
                <option value="V2:volatile">V2:volatile</option>
                <option value="V2:stable">V2:stable</option>
                <option value="V3:1ticks">V3:1ticks</option>
                <option value="V3:5ticks">V3:5ticks</option>
                <option value="V3:10ticks">V3:10ticks</option>
                <option value="V3:50ticks">V3:50ticks</option>
                <option value="V3:100ticks">V3:100ticks</option>
                <option value="V3:200ticks">V3:200ticks</option>
              </select>
            </div>

            <div>
              <label htmlFor="pageSize" className="block text-sm font-medium text-gray-700 mb-2">
                페이지당 항목 수
              </label>
              <select
                id="pageSize"
                value={pageSize}
                onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
          </div>

          <div className="mt-4 text-sm text-gray-600">
            총 {currentTransactions.length}개의 거래가 있습니다.
          </div>
        </div>

        {/* 거래 테이블 */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <TransactionTable
            transactions={currentTransactions}
            currentPage={currentPage}
            pageSize={pageSize}
          />

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