const PAGE_SIZE_OPTIONS = [10, 25, 50]

interface PaginationProps {
  page: number
  pageSize: number
  totalSize: number
  totalPages: number
  loading: boolean
  onPageChange: (page: number) => void
  onPageSizeChange: (pageSize: number) => void
}

export function Pagination({
  page,
  pageSize,
  totalSize,
  totalPages,
  loading,
  onPageChange,
  onPageSizeChange,
}: PaginationProps) {
  const rangeStart = totalSize === 0 ? 0 : (page - 1) * pageSize + 1
  const rangeEnd = Math.min(page * pageSize, totalSize)

  return (
    <div className="pagination">
      <div className="pagination-info">
        {totalSize === 0 ? 'No results' : `Showing ${rangeStart}–${rangeEnd} of ${totalSize}`}
      </div>

      <div className="pagination-controls">
        <label className="page-size">
          Rows per page
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
          >
            {PAGE_SIZE_OPTIONS.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </label>

        <button
          type="button"
          disabled={page <= 1 || loading}
          onClick={() => onPageChange(Math.max(1, page - 1))}
        >
          Previous
        </button>
        <span className="page-indicator">
          Page {page} of {totalPages}
        </span>
        <button
          type="button"
          disabled={page >= totalPages || loading}
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
        >
          Next
        </button>
      </div>
    </div>
  )
}
