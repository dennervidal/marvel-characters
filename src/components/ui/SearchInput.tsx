import { useRef } from 'react'

export const SearchInput = ({
  defaultValue,
  onSearch,
  placeholder,
  className = ''
}: {
  defaultValue?: string
  onSearch: (value: string) => void
  placeholder?: string
  className?: string
}) => {
  const inputRef = useRef<HTMLInputElement>(null)

  const submit = () => onSearch(inputRef.current?.value ?? '')

  return (
    <div className={`flex ${className}`}>
      <button
        type='button'
        aria-label='search'
        onClick={submit}
        className='brutal-btn flex h-12 w-12 shrink-0 items-center justify-center border-[3px] border-ink bg-yellow text-ink'
      >
        <svg
          width='20'
          height='20'
          viewBox='0 0 24 24'
          fill='none'
          stroke='currentColor'
          strokeWidth='2'
        >
          <circle cx='11' cy='11' r='7' />
          <line x1='21' y1='21' x2='16.5' y2='16.5' />
        </svg>
      </button>
      <input
        ref={inputRef}
        type='search'
        defaultValue={defaultValue}
        placeholder={placeholder}
        aria-label={placeholder}
        onKeyDown={event => {
          if (event.key === 'Enter') submit()
        }}
        className='h-12 w-full border-[3px] border-l-0 border-ink bg-surface px-4 text-sm font-bold uppercase text-ink outline-none placeholder:font-bold placeholder:normal-case placeholder:text-muted focus:bg-gray-light'
      />
    </div>
  )
}
