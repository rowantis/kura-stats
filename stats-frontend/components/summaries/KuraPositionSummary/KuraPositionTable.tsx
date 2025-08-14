import { KuraPosition } from '@/types/graphql'
import CopyButton from '../../CopyButton'
import BaseTable, { TableHeader, TableHeaderCell, TableBody, TableRow, TableCell } from '../../BaseTable'
import { useTokenPrices } from '@/hooks/useTokePrice'
import { useMemo } from 'react'

interface KuraPositionTableProps {
  positions: KuraPosition[]
  currentPage: number
  pageSize: number
  xRatio: number
}

export default function KuraPositionTable({ positions, currentPage, pageSize, xRatio }: KuraPositionTableProps) {
  const tokenPrices = useTokenPrices()
  const kuraPrice = useMemo(() => {
    if (!tokenPrices?.data) return 0
    return tokenPrices.data["0x4b416A45e1f26a53D2ee82a50a4C7D7bE9EdA9E4"] ?? 0
  }, [tokenPrices])

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
            <TableCell>${calcValue(position, xRatio, kuraPrice)}</TableCell>
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

const calcValue = (position: KuraPosition, xRatio: number, kuraPrice: number) => {
  // console.log(position)
  // console.log(xRatio)
  // console.log(kuraPrice)

  // 안전한 숫자 변환 함수
  const safeParseFloat = (value: string | undefined | null): number => {
    if (!value || value === '') return 0
    const parsed = parseFloat(value)
    return isNaN(parsed) ? 0 : parsed
  }

  const totalAmount = safeParseFloat(position.kura) +
    safeParseFloat(position.xkura) +
    safeParseFloat(position.stXkura) +
    safeParseFloat(position.k33) * xRatio +
    safeParseFloat(position.vesting)

  return (totalAmount * kuraPrice).toLocaleString()
}