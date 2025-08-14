'use client'

import { useMemo, useEffect } from 'react'
import { useSwapTransactions } from '@/hooks/useSwapTransactions'
import { useLiquidityTransactions } from '@/hooks/useLiquidityTransactions'
import { useKuraPositions } from '@/hooks/useKuraPositions'
import BaseSortableTable, {
  SortableTableHeader,
  SortableTableHeaderCell,
  TableBody,
  TableRow,
  TableCell,
  useSortableTable
} from '@/components/BaseSortableTable'
import CopyButton from '@/components/CopyButton'
import { formatAddress } from '@/lib/utils'
import { formatEther } from 'viem'
import { KuraPosition, LiquidityTransaction, SwapTransaction } from '@/types/graphql'
import { isTeamAccount, isTeamFarmingAccount } from '@/lib/constants'

interface AccountTypeChipProps {
  type: 'TEAM' | 'FARM';
}

export function AccountTypeChip({ type }: AccountTypeChipProps) {
  const getChipColor = (t: string) => {
    switch (t) {
      case 'TEAM':
        return 'bg-blue-100 text-blue-700';
      case 'FARM':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <span
      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getChipColor(type)}`}
    >
      {type}
    </span>
  );
}

interface AllUsersTableProps {
  loading: boolean
  swapTransactions: SwapTransaction[]
  liquidityTransactions: LiquidityTransaction[]
  kuraPositions: KuraPosition[]
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

export default function AllUsersTable({ loading, swapTransactions, liquidityTransactions, kuraPositions }: AllUsersTableProps) {
  // 훅들에서 데이터 가져오기

  // CSV 다운로드 함수
  const downloadCSV = () => {
    if (!sortedData.length) {
      alert('다운로드할 데이터가 없습니다. 먼저 조회를 실행해주세요.')
      return
    }

    const headers = [
      'User',
      'Tx Count',
      'Trade Volume ($)',
      'Liquidity Net ($)',
      'Kura',
      'xKura',
      'st xKura',
      'K33',
      'Vestings'
    ]

    const csvContent = [
      headers.join(','),
      ...sortedData.map(row => [
        row.user,
        row.txCount,
        row.tradeVolume.toFixed(2),
        row.liquidityNet.toFixed(2),
        formatEther(BigInt(row.kura)).toString(),
        formatEther(BigInt(row.xkura)).toString(),
        formatEther(BigInt(row.stXkura)).toString(),
        formatEther(BigInt(row.k33)).toString(),
        formatEther(BigInt(row.vesting)).toString()
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `all-users-${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // CSV 다운로드 이벤트 리스너
  useEffect(() => {
    const handleDownloadCSV = () => {
      downloadCSV()
    }

    window.addEventListener('downloadCSV', handleDownloadCSV)
    return () => {
      window.removeEventListener('downloadCSV', handleDownloadCSV)
    }
  }, [])

  // 사용자별 데이터 집계
  const aggregatedUserData = useMemo(() => {
    const userMap = new Map<string, UserData>()

    // Swap 거래 데이터 집계
    swapTransactions.forEach(tx => {
      const user = tx.origin
      if (!userMap.has(user)) {
        userMap.set(user, {
          user,
          txCount: 0,
          tradeVolume: 0,
          liquidityNet: 0,
          kura: '0',
          xkura: '0',
          stXkura: '0',
          k33: '0',
          vesting: '0'
        })
      }

      const userData = userMap.get(user)!
      userData.txCount += 1
      userData.tradeVolume += parseFloat(tx.amountUSD) || 0
    })

    // Liquidity 거래 데이터 집계
    liquidityTransactions.forEach(tx => {
      const user = tx.origin
      if (!userMap.has(user)) {
        userMap.set(user, {
          user,
          txCount: 0,
          tradeVolume: 0,
          liquidityNet: 0,
          kura: '0',
          xkura: '0',
          stXkura: '0',
          k33: '0',
          vesting: '0'
        })
      }

      const userData = userMap.get(user)!
      userData.txCount += 1

      if (tx.type === 'Mint') {
        userData.liquidityNet += parseFloat(tx.amountUSD) || 0
      } else if (tx.type === 'Burn') {
        userData.liquidityNet -= parseFloat(tx.amountUSD) || 0
      }
    })

    // Kura 포지션 데이터 추가
    kuraPositions.forEach(pos => {
      if (userMap.has(pos.user)) {
        const userData = userMap.get(pos.user)!
        userData.kura = pos.kura
        userData.xkura = pos.xkura
        userData.stXkura = pos.stXkura
        userData.k33 = pos.k33
        userData.vesting = pos.vesting
      } else {
        userMap.set(pos.user, {
          user: pos.user,
          txCount: 0,
          tradeVolume: 0,
          liquidityNet: 0,
          kura: pos.kura,
          xkura: pos.xkura,
          stXkura: pos.stXkura,
          k33: pos.k33,
          vesting: pos.vesting
        })
      }
    })

    return Array.from(userMap.values())
  }, [swapTransactions, liquidityTransactions, kuraPositions])

  // 정렬 기능 사용
  const { sortedData, handleSort, getSortDirection } = useSortableTable(
    aggregatedUserData,
    'tradeVolume',
    'desc'
  )

  const columns: Array<{
    header: string
    accessor: keyof UserData
    sortable: boolean
    cell: (value: any) => React.ReactNode
  }> = [
      {
        header: 'User',
        accessor: 'user' as keyof UserData,
        sortable: true,
        cell: (value: any) => (
          <div className="flex items-center space-x-2">
            <CopyButton
              copyText={value}
              showText={formatAddress(value)}
              label="유저"
            />
            {isTeamAccount(value) && <AccountTypeChip type="TEAM" />}
            {isTeamFarmingAccount(value) && <AccountTypeChip type="FARM" />}
          </div>
        )
      },
      {
        header: 'Tx Count',
        accessor: 'txCount' as keyof UserData,
        sortable: true,
        cell: (value: any) => (
          <span className="text-sm font-medium">{value.toLocaleString()}</span>
        )
      },
      {
        header: 'Trade Volume',
        accessor: 'tradeVolume' as keyof UserData,
        sortable: true,
        cell: (value: any) => (
          <span className="text-sm font-medium">${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        )
      },
      {
        header: 'Liquidity Net',
        accessor: 'liquidityNet' as keyof UserData,
        sortable: true,
        cell: (value: any) => (
          <span className={`text-sm font-medium ${value >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            ${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        )
      },
      // {
      //   header: 'Kura',
      //   accessor: 'kura' as keyof UserData,
      //   sortable: true,
      //   cell: (value: any) => (
      //     <span className="text-sm font-medium">{Number(formatEther(value).toString()).toFixed(3)}</span>
      //   )
      // },
      {
        header: 'xKura',
        accessor: 'xkura' as keyof UserData,
        sortable: true,
        cell: (value: any) => (
          <span className="text-sm font-medium">{Number(Number(formatEther(value).toString()).toFixed(3))}</span>
        )
      },
      {
        header: 'st xKura',
        accessor: 'stXkura' as keyof UserData,
        sortable: true,
        cell: (value: any) => (
          <span className="text-sm font-medium">{Number(Number(formatEther(value).toString()).toFixed(3))}</span>
        )
      },
      {
        header: 'K33',
        accessor: 'k33' as keyof UserData,
        sortable: true,
        cell: (value: any) => (
          <span className="text-sm font-medium">{Number(Number(formatEther(value).toString()).toFixed(3))}</span>
        )
      },
      {
        header: 'Vestings',
        accessor: 'vesting' as keyof UserData,
        sortable: true,
        cell: (value: any) => (
          <span className="text-sm font-medium">{Number(Number(formatEther(value).toString()).toFixed(3))}</span>
        )
      }
    ]

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div>
      <BaseSortableTable showPagination={false}>
        <SortableTableHeader>
          {columns.map((column, index) => (
            <SortableTableHeaderCell
              key={index}
              sortable={column.sortable}
              sortDirection={getSortDirection(column.accessor)}
              onSort={() => handleSort(column.accessor)}
            >
              {column.header}
            </SortableTableHeaderCell>
          ))}
        </SortableTableHeader>
        <TableBody>
          {sortedData.map((row, rowIndex) => (
            <TableRow key={rowIndex}>
              {columns.map((column, colIndex) => (
                <TableCell key={colIndex}>
                  {column.cell(row[column.accessor as keyof UserData])}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </BaseSortableTable>
    </div>
  )
} 