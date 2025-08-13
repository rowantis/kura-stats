import { SwapTransaction } from '@/types/graphql'
import { formatAddress, formatAmount, formatUSD, formatDate } from '@/lib/utils'
import CopyButton from '../../CopyButton'
import TypeChip from '../../TypeChip'
import PoolTypeChip from '../../PoolTypeChip'
import BaseTable, { TableHeader, TableHeaderCell, TableBody, TableRow, TableCell } from '../../BaseTable'

interface SwapTransactionTableProps {
  transactions: SwapTransaction[]
  currentPage: number
  pageSize: number
}

const tokenIn = (tx: SwapTransaction) => {
  if (Number(tx.token0Amount) > 0) {
    return {
      token: tx.token0,
      amount: tx.token0Amount
    }
  }
  return {
    token: tx.token1,
    amount: tx.token1Amount
  }
}

const tokenOut = (tx: SwapTransaction) => {
  if (Number(tx.token0Amount) > 0) {
    return {
      token: tx.token1,
      amount: tx.token1Amount
    }
  }
  return {
    token: tx.token0,
    amount: tx.token0Amount
  }
}

export default function SwapTransactionTable({
  transactions,
  currentPage,
  pageSize
}: SwapTransactionTableProps) {
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
        <TableHeaderCell>Token In</TableHeaderCell>
        <TableHeaderCell>Token Out</TableHeaderCell>
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
                copyText={tokenIn(tx).token.id}
                showText={tokenIn(tx).token.symbol}
                label="토큰0"
              />
            </TableCell>
            <TableCell>
              <CopyButton
                copyText={tokenOut(tx).token.id}
                showText={tokenOut(tx).token.symbol}
                label="토큰1"
              />
            </TableCell>
            <TableCell>{formatAmount(tokenIn(tx).amount)}</TableCell>
            <TableCell>{formatAmount((-Number(tokenOut(tx).amount)).toString())}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </BaseTable>
  )
} 