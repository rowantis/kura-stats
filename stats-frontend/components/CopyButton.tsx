import { Copy } from 'lucide-react'

interface CopyButtonProps {
  copyText: string
  showText: string
  label: string
}

export default function CopyButton({ copyText, showText, label }: CopyButtonProps) {
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch (err) {
      console.error('Failed to copy: ', err)
    }
  }

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