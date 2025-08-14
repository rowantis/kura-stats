'use client'

import { useState } from 'react'
import { ApolloProvider } from '@apollo/client'
import { client } from '@/lib/apollo-client'
import SwapTransactionSummary from '@/components/summaries/SwapTransactionSummary/SwapTransactionSummary'
import LiquidityTransactionSummary from '@/components/summaries/LiquidityTransactionSummary/LiquidityTransactionSummary'
import LiquidityPositionSummary from '@/components/summaries/LiquidityPositionSummary/LiquidityPositionSummary'
import KuraPositionSummary from '@/components/summaries/KuraPositionSummary/KuraPositionSummary'
import AllUsersSummary from '@/components/summaries/AllUsersSummary'



function DashboardContent() {
  const [activeTab, setActiveTab] = useState<'swap' | 'liquidity' | 'liquidityPosition' | 'kuraPosition' | 'allUsers'>('swap')

  const handleTabChange = (tab: string) => {
    setActiveTab(tab as any)
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
                onClick={() => handleTabChange('swap')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'swap'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                Swap
              </button>
              <button
                onClick={() => handleTabChange('liquidity')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'liquidity'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                Liquidity
              </button>
              <button
                onClick={() => handleTabChange('liquidityPosition')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'liquidityPosition'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                Liquidity Positions
              </button>
              <button
                onClick={() => handleTabChange('kuraPosition')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'kuraPosition'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                Kura Positions
              </button>
              <button
                onClick={() => handleTabChange('allUsers')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'allUsers'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                All Users
              </button>
            </nav>
          </div>
        </div>

        {/* 페이지 컴포넌트 */}
        {activeTab === 'swap' && (
          <SwapTransactionSummary onTabChange={handleTabChange} />
        )}
        {activeTab === 'liquidity' && (
          <LiquidityTransactionSummary onTabChange={handleTabChange} />
        )}
        {activeTab === 'liquidityPosition' && (
          <LiquidityPositionSummary onTabChange={handleTabChange} />
        )}
        {activeTab === 'kuraPosition' && (
          <KuraPositionSummary onTabChange={handleTabChange} />
        )}
        {activeTab === 'allUsers' && (
          <AllUsersSummary onTabChange={handleTabChange} />
        )}
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