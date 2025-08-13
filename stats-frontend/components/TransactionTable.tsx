import { DexTransaction } from '@/types/graphql'
import { formatAddress, formatAmount, formatUSD, formatDate } from '@/lib/utils'
import { Copy } from 'lucide-react'

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
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = startIndex + pageSize
  const currentTransactions = transactions.slice(startIndex, endIndex)

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

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch (err) {
      console.error('Failed to copy: ', err)
    }
  }

  const CopyButton = ({ copyText, showText, label }: { copyText: string; showText: string; label: string }) => {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-900 font-mono">{showText}</span>
        <button
          onClick={() => copyToClipboard(copyText)}
          className="p-1 hover:bg-gray-100 rounded transition-colors"
          title={`${label} 주소 복사`}
        >
          <Copy className="w-4 h-4 text-gray-500 hover:text-gray-700" />
        </button>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-200 rounded-lg">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              KSTime
            </th>
            <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              User
            </th>
            <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Type
            </th>
            <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Pool Type
            </th>
            <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              USD Value
            </th>
            <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              TX
            </th>
            <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Token0
            </th>
            <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Token1
            </th>
            <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Token0 Amount
            </th>
            <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Token1 Amount
            </th>
          </tr>
        </thead>
        <tbody className="bg-gray-50 divide-y divide-gray-200">
          {currentTransactions.map((tx, index) => (
            <tr key={tx.id} className="hover:bg-gray-50">
              <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-900">
                {formatDate(tx.timestamp)}
              </td>
              <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-900">
                <CopyButton
                  copyText={tx.origin}
                  showText={formatAddress(tx.origin)}
                  label="유저"
                />
              </td>
              <td className="px-5 py-4 whitespace-nowrap">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(tx.type)}`}>
                  {tx.type}
                </span>
              </td>
              <td className="px-5 py-4 whitespace-nowrap">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPoolTypeColor(tx.poolType)}`}>
                  {tx.poolType}
                </span>
              </td>
              <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-900">
                {formatUSD(tx.amountUSD)}
              </td>
              <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-900">
                <a
                  href={`https://seitrace.com/tx/${tx.transactionId}?chain=pacific-1`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 underline"
                >
                  링크
                </a>
              </td>
              <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-900">
                <CopyButton
                  copyText={tx.token0.id}
                  showText={tx.token0.symbol}
                  label="토큰0"
                />
              </td>
              <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-900">
                <CopyButton
                  copyText={tx.token1.id}
                  showText={tx.token1.symbol}
                  label="토큰1"
                />
              </td>
              <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-900">
                {formatAmount(tx.token0Amount)}
              </td>
              <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-900">
                {formatAmount(tx.token1Amount)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
} 