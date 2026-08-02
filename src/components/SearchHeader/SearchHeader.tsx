import { SearchInput } from '@/components/ui'
import { FilterBar } from './FilterBar'
import type { CharacterCounts, CharacterFilter } from '@/types'

export const SearchHeader = ({
  query,
  updateQuery,
  filter = 'all',
  counts,
  onFilterChange = () => {}
}: {
  query: string
  updateQuery: (value: string) => void
  filter?: CharacterFilter
  counts?: CharacterCounts
  onFilterChange?: (filter: CharacterFilter) => void
}) => (
  <div className='sticky top-0 z-40 border-b-4 border-border bg-secondary px-4 py-4'>
    <div className='mx-auto flex max-w-7xl flex-col gap-3'>
      <SearchInput
        defaultValue={query}
        onSearch={updateQuery}
        placeholder='SEARCH CHARACTERS...'
      />
      <FilterBar filter={filter} counts={counts} onChange={onFilterChange} />
    </div>
  </div>
)
