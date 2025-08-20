'use client'

import { useState, useEffect, useMemo } from 'react'
import { useQuery } from '@apollo/client'
import { formatEther } from 'viem'
import { KuraPosition, XShadowPosition, XShadowVest } from '@/types/graphql'
import { KURA_POSITIONS_ALL_QUERY } from '@/lib/queries'
import KuraPositionTable from '@/components/summaries/KuraPositionSummary/KuraPositionTable'
import BaseSummary from '@/components/summaries/BaseSummary'
import { getCurrentDateKST } from '@/lib/utils'

// 숫자 포맷팅 함수: 유효숫자까지만 표시, 최대 6자리 소숫점
const formatNumber = (value: string): string => {
  const num = parseFloat(value)
  if (num === 0) return '0'

  // 소숫점 이하 자릿수 계산
  const decimalPlaces = value.includes('.') ? value.split('.')[1].length : 0

  // 유효숫자까지만 표시하되 최대 6자리
  const maxDecimalPlaces = Math.min(decimalPlaces, 6)

  // 뒤의 불필요한 0 제거
  return num.toFixed(maxDecimalPlaces).replace(/\.?0+$/, '')
}

interface KuraPositionSummaryProps {
  onTabChange: (tab: string) => void
}

export default function KuraPositionSummary({ onTabChange }: KuraPositionSummaryProps) {
  const [addressFilter, setAddressFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [xRatio, setXRatio] = useState(0)

  // GraphQL 쿼리 실행
  const { data, loading, error } = useQuery(KURA_POSITIONS_ALL_QUERY)

  // KuraPosition 필터링
  const [filteredKuraPositions, setFilteredKuraPositions] = useState<KuraPosition[]>([])

  useEffect(() => {
    if (!data) return

    // 데이터 변환 및 처리
    const { xshadowPositions, xshadowVests, xshadows } = data

    // 유저별 vestingAmount 계산 (status가 "0"인 것만)
    const userVestingMap = new Map<string, bigint>()
    xshadowVests.forEach((vest: XShadowVest) => {
      if (vest.status === "0") {
        const currentAmount = userVestingMap.get(vest.owner) || BigInt(0)
        const vestingAmount = BigInt(vest.vestingAmount || '0')
        const newAmount = currentAmount + vestingAmount
        userVestingMap.set(vest.owner, newAmount)
      }
    })


    // KuraPosition 데이터 생성
    const kuraPositions: KuraPosition[] = xshadowPositions.map((pos: XShadowPosition) => {
      const vestingAmount = userVestingMap.get(pos.owner) || BigInt(0)

      return {
        user: pos.owner,
        kura: formatNumber("0"),
        xkura: formatNumber(formatEther(BigInt(pos.balance || '0'))),
        stXkura: formatNumber(formatEther(BigInt(pos.stakedBalance || '0'))),
        k33: formatNumber(formatEther(BigInt(pos.x33Balance || '0'))),
        vesting: formatNumber(formatEther(vestingAmount))
      }
    })

    let filteredKuraPos = [...kuraPositions]
    filteredKuraPos = filteredKuraPos.filter(pos => pos.user.toLowerCase() !== '0x0000000000000000000000000000000000000000')

    // 주소 필터링
    if (addressFilter) {
      filteredKuraPos = filteredKuraPos.filter(pos =>
        pos.user.toLowerCase().includes(addressFilter.toLowerCase())
      )
    }
    if (xshadows.length > 0 && xshadows[0].x33Ratio && xshadows[0].x33Ratio.length > 0) {
      setXRatio(parseFloat(xshadows[0].x33Ratio))
    } else {
      setXRatio(0)
    }
    setFilteredKuraPositions(filteredKuraPos)
  }, [data, addressFilter])

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const downloadCSV = useMemo(() => {
    const _downloadCSV = () => {
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
        pos.kura,
        pos.xkura,
        pos.stXkura,
        pos.k33,
        pos.vesting
      ])

      const filename = `kura-positions-${getCurrentDateKST()}.csv`

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
  }, [filteredKuraPositions])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">데이터를 불러오는 중...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-red-600">데이터를 불러오는 중 오류가 발생했습니다.</div>
      </div>
    )
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
          xRatio={xRatio}
        />
      </div>
    </BaseSummary>
  )
} 