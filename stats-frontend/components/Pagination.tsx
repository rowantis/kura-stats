interface PaginationProps {
  currentPage: number
  loadedPages: number
  hasMoreData: boolean
  isLoadingMore: boolean
  onPageChange: (page: number) => void
  onLoadMore: () => void
  onShowAll: () => void
}

export default function Pagination({
  currentPage,
  loadedPages,
  hasMoreData,
  isLoadingMore,
  onPageChange,
  onLoadMore,
  onShowAll
}: PaginationProps) {
  const getPageNumbers = () => {
    const pages = []
    const maxVisiblePages = 5

    if (loadedPages <= maxVisiblePages) {
      for (let i = 1; i <= loadedPages; i++) {
        pages.push(i)
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i)
        }
        pages.push('...')
        pages.push(loadedPages)
      } else if (currentPage >= loadedPages - 2) {
        pages.push(1)
        pages.push('...')
        for (let i = loadedPages - 3; i <= loadedPages; i++) {
          pages.push(i)
        }
      } else {
        pages.push(1)
        pages.push('...')
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i)
        }
        pages.push('...')
        pages.push(loadedPages)
      }
    }

    return pages
  }

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 sm:px-5">
      <div className="flex justify-between items-center w-full">
        <div className="flex items-center">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-l-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            이전
          </button>

          {getPageNumbers().map((page, index) => (
            <button
              key={index}
              onClick={() => typeof page === 'number' && onPageChange(page)}
              disabled={page === '...'}
              className={`relative inline-flex items-center px-4 py-2 text-sm font-medium border ${page === currentPage
                ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                : page === '...'
                  ? 'text-gray-500 cursor-default'
                  : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                }`}
            >
              {page}
            </button>
          ))}

          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === loadedPages}
            className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-r-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            다음
          </button>

          {/* Load More 버튼 */}
          {hasMoreData && (
            <button
              onClick={onLoadMore}
              disabled={isLoadingMore}
              className="ml-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoadingMore ? '로딩 중...' : '더 보기'}
            </button>
          )}

          {/* Show All 버튼 */}
          {hasMoreData && (
            <button
              onClick={onShowAll}
              className="ml-2 px-4 py-2 text-sm font-medium text-white bg-green-600 border border-green-600 rounded-md hover:bg-green-700"
            >
              전체 보기
            </button>
          )}
        </div>

        <div className="text-sm text-gray-700">
          <span className="font-medium">페이지 {currentPage}</span>
          <span className="text-gray-500"> / {loadedPages}</span>
          {hasMoreData && <span className="text-blue-600 ml-2">(더 있음)</span>}
        </div>
      </div>
    </div>
  )
} 