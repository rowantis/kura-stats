import { Download } from 'lucide-react'
import { parseFormattedDate, parseFormattedDate2 } from '@/lib/utils'
import { useState } from 'react'

interface FilterSectionProps {
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
  pageSize: number
  setPageSize: (value: number) => void
  currentDataLength: number
  filteredLiquidityPositionsLength: number
  filteredKuraPositionsLength: number
  onDownloadCSV: () => void
}

export default function FilterSection({
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
  pageSize,
  setPageSize,
  currentDataLength,
  filteredLiquidityPositionsLength,
  filteredKuraPositionsLength,
  onDownloadCSV
}: FilterSectionProps) {
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const handleReset = () => {
    setAddressFilter('')
    setTypeFilter('All')
    setPoolTypeFilter('All')
    setStartDate('')
    setEndDate('')
    setStartTimestamp('')
    setEndTimestamp('')
    setPageSize(20)
  }

  const getTotalCount = () => {
    if (activeTab === 'swap' || activeTab === 'liquidity') {
      return currentDataLength
    } else if (activeTab === 'liquidityPosition') {
      return filteredLiquidityPositionsLength
    } else {
      return filteredKuraPositionsLength
    }
  }

  const isDownloadDisabled = () => {
    if (activeTab === 'swap' || activeTab === 'liquidity') {
      return currentDataLength === 0
    } else if (activeTab === 'liquidityPosition') {
      return filteredLiquidityPositionsLength === 0
    } else {
      return filteredKuraPositionsLength === 0
    }
  }

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
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
          <label htmlFor="poolType" className="block text-sm font-medium text-gray-700 mb-2">
            풀 타입
          </label>
          <select
            id="poolType"
            value={poolTypeFilter}
            onChange={(e) => {
              if (!["All", "V2", "V3"].includes(e.target.value)) {
                throw new Error("Invalid pool type")
              } else {
                setPoolTypeFilter(e.target.value as "V2" | "V3" | "All")
              }
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
          >
            <option value="All">전체</option>
            <option value="V2">V2</option>
            <option value="V3">V3</option>
          </select>
        </div>

        <div>
          <label htmlFor="startTimestamp" className="block text-sm font-medium text-gray-700 mb-2">
            시작일
          </label>
          <input
            type="date"
            id="startDate"
            value={startDate}
            onChange={(e) => {
              setStartDate(e.target.value)
              setStartTimestamp(parseFormattedDate2(e.target.value).toString())
              console.log("startDate", startDate)
              console.log("startTimestamp", startTimestamp)
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
          />
        </div>

        <div>
          <label htmlFor="endTimestamp" className="block text-sm font-medium text-gray-700 mb-2">
            종료일
          </label>
          <input
            type="date"
            id="endDate"
            value={endDate}
            onChange={(e) => {
              setEndDate(e.target.value)
              setEndTimestamp(parseFormattedDate2(e.target.value).toString())
              console.log("endDate", endDate)
              console.log("endTimestamp", endTimestamp)
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
          />
        </div>

        <div>
          <label htmlFor="init" className="block text-sm font-medium text-gray-700 mb-2">
            <br />
          </label>
          <button
            onClick={handleReset}
            className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
          >
            초기화
          </button>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="pageSize" className="block text-sm font-medium text-gray-700 mb-2">
            페이지당 항목 수
          </label>
          <select
            id="pageSize"
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="text-sm text-gray-600">
          {activeTab === 'swap' && `총 ${currentDataLength}개의 거래가 있습니다.`}
          {activeTab === 'liquidity' && `총 ${currentDataLength}개의 거래가 있습니다.`}
          {activeTab === 'liquidityPosition' && `총 ${filteredLiquidityPositionsLength}개의 포지션이 있습니다.`}
          {activeTab === 'kuraPosition' && `총 ${filteredKuraPositionsLength}개의 포지션이 있습니다.`}
        </div>
        <button
          onClick={onDownloadCSV}
          disabled={isDownloadDisabled()}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Download className="w-4 h-4 mr-2" />
          CSV 다운로드
        </button>
      </div>
    </div>
  )
} 