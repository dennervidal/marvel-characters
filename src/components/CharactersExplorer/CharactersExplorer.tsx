import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { isEmpty } from '@/utils'
import { useCharactersExplorer } from './hooks'
import { SearchHeader } from '@/components/SearchHeader'
import { CharactersTable } from '@/components/CharactersTable'
import { Navigation } from '@/components/Navigation'
import { Skeleton, Typography } from '@/components/ui'

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } }
})

export const CharactersExplorer = () => (
  <QueryClientProvider client={queryClient}>
    <Explorer />
  </QueryClientProvider>
)

const SkeletonTable = () => (
  <div role='status' aria-label='loading' className='flex flex-col gap-3'>
    {Array.from({ length: 6 }, (_, index) => (
      <Skeleton key={index} className='h-14' />
    ))}
  </div>
)

const Explorer = () => {
  const {
    query,
    page,
    total,
    characters,
    loading,
    isError,
    refetch,
    gotoPage,
    updateQuery
  } = useCharactersExplorer()

  let content
  if (isEmpty(query)) {
    content = (
      <Typography variant='body' className='py-16 text-center text-muted'>
        Search for a character to get started
      </Typography>
    )
  } else if (loading) {
    content = <SkeletonTable />
  } else if (isError) {
    content = (
      <div className='flex flex-col items-center gap-4 py-16'>
        <Typography variant='body'>Something went wrong</Typography>
        <button
          type='button'
          onClick={() => refetch()}
          className='brutal-btn border-[3px] border-ink bg-yellow px-4 py-2 text-sm font-bold uppercase text-ink'
        >
          Retry
        </button>
      </div>
    )
  } else if (characters.length === 0) {
    content = (
      <Typography variant='body' className='py-16 text-center text-muted'>
        No characters found for &quot;{query}&quot;
      </Typography>
    )
  } else {
    content = (
      <>
        <CharactersTable characters={characters} />
        {total > 1 && (
          <Navigation page={page} total={total} onChange={gotoPage} />
        )}
      </>
    )
  }

  return (
    <div className='flex flex-col gap-6'>
      <SearchHeader query={query} updateQuery={updateQuery} />
      {content}
    </div>
  )
}
