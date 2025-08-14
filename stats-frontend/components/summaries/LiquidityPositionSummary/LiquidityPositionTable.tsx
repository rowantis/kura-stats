import { LiquidityPosition } from '@/types/graphql'
import CopyButton from '../../CopyButton'
import PoolTypeChip from '../../PoolTypeChip'
import BaseTable, { TableHeader, TableHeaderCell, TableBody, TableRow, TableCell } from '../../BaseTable'

interface LiquidityPositionTableProps {
  positions: LiquidityPosition[]
  currentPage: number
  pageSize: number
}

export default function LiquidityPositionTable({ positions, currentPage, pageSize }: LiquidityPositionTableProps) {
  return (
    <BaseTable
      currentPage={currentPage}
      pageSize={pageSize}
      totalItems={positions.length}
    >
      <TableHeader>
        <TableHeaderCell>User</TableHeaderCell>
        <TableHeaderCell>Pool Type</TableHeaderCell>
        <TableHeaderCell>USD Value</TableHeaderCell>
        <TableHeaderCell>Token0</TableHeaderCell>
        <TableHeaderCell>Token1</TableHeaderCell>
        <TableHeaderCell>Token0 Amount</TableHeaderCell>
        <TableHeaderCell>Token1 Amount</TableHeaderCell>
      </TableHeader>
      <TableBody>
        {positions.slice((currentPage - 1) * pageSize, currentPage * pageSize).map((position, index) => (
          <TableRow key={index}>
            <TableCell>
              <CopyButton
                copyText={position.user}
                showText={`${position.user.slice(0, 6)}...${position.user.slice(-4)}`}
                label="유저"
              />
            </TableCell>
            <TableCell>
              <PoolTypeChip poolType={position.poolType} />
            </TableCell>
            <TableCell>${parseFloat(position.usdValue).toLocaleString()}</TableCell>
            <TableCell>
              <CopyButton
                copyText={position.token0.id}
                showText={position.token0.symbol}
                label="토큰0"
              />
            </TableCell>
            <TableCell>
              <CopyButton
                copyText={position.token1.id}
                showText={position.token1.symbol}
                label="토큰1"
              />
            </TableCell>
            <TableCell>{parseFloat(position.token0Amount).toLocaleString()}</TableCell>
            <TableCell>{parseFloat(position.token1Amount).toLocaleString()}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </BaseTable>
  )
} 