import { KuraPosition } from '@/types/graphql'
import CopyButton from '../../CopyButton'
import BaseTable, { TableHeader, TableHeaderCell, TableBody, TableRow, TableCell } from '../../BaseTable'

interface KuraPositionTableProps {
  positions: KuraPosition[]
  currentPage: number
  pageSize: number
}

export default function KuraPositionTable({ positions, currentPage, pageSize }: KuraPositionTableProps) {
  return (
    <BaseTable
      currentPage={currentPage}
      pageSize={pageSize}
      totalItems={positions.length}
    >
      <TableHeader>
        <TableHeaderCell>User</TableHeaderCell>
        <TableHeaderCell>USD Value</TableHeaderCell>
        <TableHeaderCell>KURA</TableHeaderCell>
        <TableHeaderCell>xKURA</TableHeaderCell>
        <TableHeaderCell>st.xKURA</TableHeaderCell>
        <TableHeaderCell>K33</TableHeaderCell>
        <TableHeaderCell>Vesting</TableHeaderCell>
      </TableHeader>
      <TableBody>
        {positions.map((position, index) => (
          <TableRow key={index}>
            <TableCell>
              <CopyButton
                copyText={position.user}
                showText={`${position.user.slice(0, 6)}...${position.user.slice(-4)}`}
                label="유저"
              />
            </TableCell>
            <TableCell>${parseFloat(position.usdValue).toLocaleString()}</TableCell>
            <TableCell>{position.kura}</TableCell>
            <TableCell>{position.xkura}</TableCell>
            <TableCell>{position.stXkura}</TableCell>
            <TableCell>{position.k33}</TableCell>
            <TableCell>{position.vesting}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </BaseTable>
  )
} 