import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AnimatePresence, motion } from 'motion/react'
import { Skeleton } from '@/components/ui'
import { EmptyState } from '@/components/EmptyState'
import { HeroCard } from '@/components/HeroCard'
import { Navigation } from '@/components/Navigation'
import { SearchHeader } from '@/components/SearchHeader'
import { useCharactersExplorer } from './hooks'
import { isEmpty } from '@/utils'

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } }
})

export const CharactersExplorer = () => (
  <QueryClientProvider client={queryClient}>
    <Explorer />
  </QueryClientProvider>
)

const SkeletonGrid = () => (
  <div
    role='status'
    aria-label='loading'
    className='grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
  >
    {Array.from({ length: 8 }, (_, index) => (
      <Skeleton key={index} className='h-72' />
    ))}
  </div>
)

const Explorer = () => {
  const {
    query,
    filter,
    page,
    total,
    characters,
    counts,
    loading,
    isError,
    refetch,
    gotoPage,
    updateQuery,
    setFilter
  } = useCharactersExplorer()

  const clearAll = () => {
    updateQuery('')
    setFilter('all')
  }

  let content
  if (isEmpty(query)) {
    content = (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <EmptyState query='' onClear={clearAll} onSuggestion={updateQuery} />
      </motion.div>
    )
  } else if (loading) {
    content = <SkeletonGrid />
  } else if (isError) {
    content = (
      <div className='flex flex-col items-center gap-4 py-16 text-center'>
        <p className='font-display text-2xl uppercase'>SOMETHING WENT WRONG</p>
        <button
          type='button'
          onClick={() => refetch()}
          className='border-4 border-border bg-primary px-6 py-2.5 font-mono text-[0.65rem] uppercase tracking-wide text-white shadow-hard hover:bg-[#c0392b]'
        >
          RETRY
        </button>
      </div>
    )
  } else if (characters.length === 0) {
    content = (
      <EmptyState query={query} onClear={clearAll} onSuggestion={updateQuery} />
    )
  } else {
    content = (
      <>
        <motion.div
          layout
          className='grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
        >
          <AnimatePresence mode='popLayout'>
            {characters.map((hero, index) => (
              <motion.div
                key={hero.id}
                layout
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.94 }}
                transition={{ delay: Math.min(index * 0.035, 0.28) }}
              >
                <HeroCard hero={hero} query={query} filter={filter} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
        {total > 1 && (
          <Navigation page={page} total={total} onChange={gotoPage} />
        )}
      </>
    )
  }

  return (
    <div className='flex flex-col gap-6'>
      <SearchHeader
        query={query}
        updateQuery={updateQuery}
        filter={filter}
        counts={counts}
        onFilterChange={setFilter}
      />
      {content}
    </div>
  )
}
