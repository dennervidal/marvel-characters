import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { Character } from '@/types'
import { useCharactersExplorer } from './hooks'
import { SearchHeader } from '@/components/SearchHeader'
import { CharactersTable } from '@/components/CharactersTable'
import { Navigation } from '@/components/Navigation'
import { LoadingPlaceholder } from '@/components/ui'

const queryClient = new QueryClient()

export const CharactersExplorer = ({
  initialData,
  total
}: {
  initialData: Character[]
  total: number
}) => (
  <QueryClientProvider client={queryClient}>
    <Explorer initialData={initialData} total={total} />
  </QueryClientProvider>
)

const Explorer = ({
  initialData,
  total
}: {
  initialData: Character[]
  total: number
}) => {
  const {
    query,
    page,
    total: totalPages,
    characters,
    loading,
    gotoPage,
    updateQuery
  } = useCharactersExplorer(initialData, total)

  return (
    <div className='flex flex-col gap-6'>
      <SearchHeader query={query} updateQuery={updateQuery} />
      <LoadingPlaceholder loading={loading}>
        <CharactersTable characters={characters} />
      </LoadingPlaceholder>
      {totalPages > 1 && (
        <Navigation page={page} total={totalPages} onChange={gotoPage} />
      )}
    </div>
  )
}
