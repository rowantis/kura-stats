import { DexTransaction } from '@/types/graphql'
import { formatAddress, formatAmount, formatUSD, formatDate } from '@/lib/utils'
import CopyButton from '../CopyButton'
import BaseTable, { TableHeader, TableHeaderCell, TableBody, TableRow, TableCell } from '../BaseTable'

interface TransactionTableProps {
  transactions: DexTransaction[]
  currentPage: number
  pageSize: number
}

export default function TransactionTable({
  transactions,
  currentPage,
  pageSize
}: TransactionTableProps) {
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Swap':
        return 'text-blue-600 bg-blue-100'
      case 'Mint':
        return 'text-green-600 bg-green-100'
      case 'Burn':
        return 'text-red-600 bg-red-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getPoolTypeColor = (poolType: string) => {
    if (poolType.startsWith('V3:')) {
      return 'text-purple-600 bg-purple-100'
    } else if (poolType.startsWith('V2:')) {
      return 'text-orange-600 bg-orange-100'
    }
    return 'text-gray-600 bg-gray-100'
  }

  return (
    <BaseTable
      currentPage={currentPage}
      pageSize={pageSize}
      totalItems={transactions.length}
    >
      <TableHeader>
        <TableHeaderCell>Time(UTC)</TableHeaderCell>
        <TableHeaderCell>User</TableHeaderCell>
        <TableHeaderCell>Type</TableHeaderCell>
        <TableHeaderCell>Pool Type</TableHeaderCell>
        <TableHeaderCell>USD Value</TableHeaderCell>
        <TableHeaderCell>TX</TableHeaderCell>
        <TableHeaderCell>Token0</TableHeaderCell>
        <TableHeaderCell>Token1</TableHeaderCell>
        <TableHeaderCell>Token0 Amount</TableHeaderCell>
        <TableHeaderCell>Token1 Amount</TableHeaderCell>
      </TableHeader>
      <TableBody>
        {transactions.slice((currentPage - 1) * pageSize, currentPage * pageSize).map((tx) => (
          <TableRow key={tx.id}>
            <TableCell>{formatDate(tx.timestamp)}</TableCell>
            <TableCell>
              <CopyButton
                copyText={tx.origin}
                showText={formatAddress(tx.origin)}
                label="유저"
              />
            </TableCell>
            <TableCell>
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(tx.type)}`}>
                {tx.type}
              </span>
            </TableCell>
            <TableCell>
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPoolTypeColor(tx.poolType)}`}>
                {tx.poolType}
              </span>
            </TableCell>
            <TableCell>{formatUSD(tx.amountUSD)}</TableCell>
            <TableCell>
              <a
                href={`https://seitrace.com/tx/${tx.transactionId}?chain=pacific-1`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 underline"
              >
                링크
              </a>
            </TableCell>
            <TableCell>
              <CopyButton
                copyText={tx.token0.id}
                showText={tx.token0.symbol}
                label="토큰0"
              />
            </TableCell>
            <TableCell>
              <CopyButton
                copyText={tx.token1.id}
                showText={tx.token1.symbol}
                label="토큰1"
              />
            </TableCell>
            <TableCell>{formatAmount(tx.token0Amount)}</TableCell>
            <TableCell>{formatAmount(tx.token1Amount)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </BaseTable>
  )
} 