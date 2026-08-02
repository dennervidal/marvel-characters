import { FILTERS } from '@/components/CharactersExplorer/hooks'
import type { CharacterCounts, CharacterFilter } from '@/types'

export const FilterBar = ({
  filter,
  counts,
  onChange
}: {
  filter: CharacterFilter
  counts?: CharacterCounts
  onChange: (filter: CharacterFilter) => void
}) => (
  <div className='flex flex-wrap items-center gap-2'>
    {FILTERS.map(({ key, label }) => {
      const active = filter === key
      const count =
        key === 'all' ? undefined : counts?.[key as keyof CharacterCounts]
      return (
        <button
          key={key}
          type='button'
          onClick={() => onChange(key)}
          aria-pressed={active}
          className={`border-[3px] border-border px-3.5 py-1.5 font-mono text-[0.6rem] uppercase tracking-[0.04em] shadow-hard-3 ${
            active
              ? 'bg-foreground text-secondary shadow-hard-red'
              : 'bg-white text-foreground hover:bg-secondary'
          }`}
        >
          {label}
          {count !== undefined && <span className='ml-1'>({count})</span>}
        </button>
      )
    })}
  </div>
)
