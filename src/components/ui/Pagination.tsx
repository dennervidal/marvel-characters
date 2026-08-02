const pageNumbers = (
  count: number,
  page: number,
  siblingCount: number
): (number | 'ellipsis')[] => {
  if (count <= 2 * siblingCount + 5) {
    return Array.from({ length: count }, (_, i) => i + 1)
  }
  const start = Math.max(2, page - siblingCount)
  const end = Math.min(count - 1, page + siblingCount)
  const pages: (number | 'ellipsis')[] = [1]
  if (start > 2) pages.push('ellipsis')
  for (let i = start; i <= end; i += 1) pages.push(i)
  if (end < count - 1) pages.push('ellipsis')
  if (count > 1) pages.push(count)
  return pages
}

const buttonClass =
  'brutal-btn h-10 w-10 border-[3px] border-border font-mono text-sm font-bold shadow-hard-3 disabled:pointer-events-none disabled:opacity-40'
const activeButtonClass = `${buttonClass} bg-foreground text-secondary shadow-hard-red`
const idleButtonClass = `${buttonClass} bg-white`

export const Pagination = ({
  count,
  page,
  onChange,
  siblingCount = 0,
  showFirstButton = true,
  showLastButton = true,
  hideNextButton = false,
  hidePrevButton = false
}: {
  count: number
  page: number
  onChange: (page: number) => void
  siblingCount?: number
  showFirstButton?: boolean
  showLastButton?: boolean
  hideNextButton?: boolean
  hidePrevButton?: boolean
}) => {
  if (count <= 1) return null

  const isFirst = page === 1
  const isLast = page === count

  return (
    <nav
      aria-label='pagination'
      className='flex flex-wrap items-center justify-center gap-1'
    >
      {showFirstButton && !isFirst && (
        <button
          type='button'
          aria-label='go to first page'
          className={idleButtonClass}
          onClick={() => onChange(1)}
        >
          «
        </button>
      )}
      {!hidePrevButton && !isFirst && (
        <button
          type='button'
          aria-label='go to previous page'
          className={idleButtonClass}
          onClick={() => onChange(page - 1)}
        >
          ‹
        </button>
      )}
      {pageNumbers(count, page, siblingCount).map((number, index) =>
        number === 'ellipsis' ? (
          <span key={`ellipsis-${index}`} className='px-1 text-foreground'>
            …
          </span>
        ) : (
          <button
            key={number}
            type='button'
            aria-label={`go to page ${number}`}
            aria-current={number === page ? 'page' : undefined}
            className={number === page ? activeButtonClass : idleButtonClass}
            onClick={() => onChange(number)}
          >
            {number}
          </button>
        )
      )}
      {!hideNextButton && !isLast && (
        <button
          type='button'
          aria-label='go to next page'
          className={idleButtonClass}
          onClick={() => onChange(page + 1)}
        >
          ›
        </button>
      )}
      {showLastButton && !isLast && (
        <button
          type='button'
          aria-label='go to last page'
          className={idleButtonClass}
          onClick={() => onChange(count)}
        >
          »
        </button>
      )}
    </nav>
  )
}
