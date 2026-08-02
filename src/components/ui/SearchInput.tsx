import { useState } from 'react'
import { Search, X } from 'lucide-react'

export const SearchInput = ({
  defaultValue = '',
  onSearch,
  placeholder = 'SEARCH CHARACTERS...',
  className = ''
}: {
  defaultValue?: string
  onSearch: (value: string) => void
  placeholder?: string
  className?: string
}) => {
  const [value, setValue] = useState(defaultValue)
  const submit = () => onSearch(value.trim())
  return (
    <div className={`relative ${className}`}>
      <Search
        size={16}
        className='absolute left-4 top-1/2 -translate-y-1/2 text-foreground'
        aria-hidden
      />
      <input
        value={value}
        onChange={event => setValue(event.target.value)}
        onKeyDown={event => {
          if (event.key === 'Enter') submit()
        }}
        onFocus={event =>
          (event.currentTarget.style.borderColor = 'var(--color-primary)')
        }
        onBlur={event =>
          (event.currentTarget.style.borderColor = 'var(--color-border)')
        }
        placeholder={placeholder}
        className='h-12 w-full border-4 border-border bg-white py-2.5 pl-10 pr-10 font-mono text-xs uppercase tracking-[0.03em] text-foreground shadow-hard outline-none placeholder:text-muted-foreground'
        aria-label={placeholder}
      />
      {value && (
        <button
          type='button'
          onClick={() => {
            setValue('')
            onSearch('')
          }}
          aria-label='Clear search'
          className='absolute right-3 top-1/2 -translate-y-1/2 text-foreground hover:text-primary'
        >
          <X size={16} />
        </button>
      )}
    </div>
  )
}
