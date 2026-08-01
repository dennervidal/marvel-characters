import { SearchInput, Typography } from '@/components/ui'

export const SearchHeader = ({
  query,
  updateQuery
}: {
  query: string
  updateQuery: (value: string) => void
}) => (
  <div className='flex flex-col gap-2'>
    <Typography variant='h5'>Find a character</Typography>
    <Typography variant='subtitle'>Character name</Typography>
    <SearchInput
      defaultValue={query}
      placeholder='Search'
      onSearch={updateQuery}
      className='max-w-md'
    />
  </div>
)
