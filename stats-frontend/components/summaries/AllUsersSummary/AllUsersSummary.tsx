'use client'

import { useState, useMemo } from 'react'
import { useSwapTransactions } from '@/hooks/useSwapTransactions'
import { useLiquidityTransactions } from '@/hooks/useLiquidityTransactions'
import { useKuraPositions } from '@/hooks/useKuraPositions'
import AllUsersTable from './AllUsersTable'

interface AllUsersSummaryProps {
  onTabChange: (tab: string) => void
}

interface UserData {
  user: string
  txCount: number
  tradeVolume: number
  liquidityNet: number
  kura: string
  xkura: string
  stXkura: string
  k33: string
  vesting: string
}

export default function AllUsersSummary({ onTabChange }: AllUsersSummaryProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [showAllClicked, setShowAllClicked] = useState(false)

  // 훅들 초기화 (showAll을 위해 필요한 파라미터들)
  const { showAll: showAllSwaps, loading: swapsLoading } = useSwapTransactions({
    pageSize: 1000,
    currentPage: 1,
  })

  const { showAll: showAllLiquidity, loading: liquidityLoading } = useLiquidityTransactions({
    pageSize: 1000,
    currentPage: 1
  })

  const { positions: kuraPositions, loading: kuraLoading } = useKuraPositions()

  const handleFetchData = async () => {
    setIsLoading(true)
    setShowAllClicked(true)
    try {
      // 모든 데이터를 병렬로 가져오기
      await Promise.all([
        showAllSwaps(),
        showAllLiquidity()
      ])
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">All Users</h2>
          <div className="flex space-x-3">
            <button
              onClick={handleFetchData}
              disabled={isLoading || swapsLoading || liquidityLoading || kuraLoading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? '조회 중...' : '조회'}
            </button>
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('downloadCSV'))}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              CSV 다운로드
            </button>
          </div>
        </div>

        {showAllClicked && (
          <AllUsersTable
            loading={isLoading || swapsLoading || liquidityLoading || kuraLoading}
          />
        )}
      </div>
    </div>
  )
} 