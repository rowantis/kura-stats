import { LiquidityTransaction } from '@/types/graphql'
import { formatAddress, formatAmount, formatUSD, formatDate } from '@/lib/utils'
import CopyButton from '../../CopyButton'
import TypeChip from '../../TypeChip'
import PoolTypeChip from '../../PoolTypeChip'
import BaseTable, { TableHeader, TableHeaderCell, TableBody, TableRow, TableCell } from '../../BaseTable'

interface LiquidityTransactionTableProps {
  transactions: LiquidityTransaction[]
  currentPage: number
  pageSize: number
}

export default function LiquidityTransactionTable({
  transactions,
  currentPage,
  pageSize
}: LiquidityTransactionTableProps) {
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
              <TypeChip type={tx.type} />
            </TableCell>
            <TableCell>
              <PoolTypeChip poolType={tx.poolType} />
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