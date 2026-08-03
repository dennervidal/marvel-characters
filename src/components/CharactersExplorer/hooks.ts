import { useQuery } from '@tanstack/react-query'
import { useCallback, useState } from 'react'
import type { CharacterCounts, CharacterFilter, Hero } from '@/types'
import { isEmpty } from '@/utils'

export const FILTERS: Array<{ key: CharacterFilter; label: string }> = [
  { key: 'all', label: 'ALL' },
  { key: 'heroes', label: 'HEROES' },
  { key: 'villains', label: 'VILLAINS' },
  { key: 'marvel', label: 'MARVEL' },
  { key: 'dc', label: 'DC' },
  { key: 'others', label: 'OTHERS' }
]

export const EMPTY_COUNTS: CharacterCounts = {
  heroes: 0,
  villains: 0,
  marvel: 0,
  dc: 0,
  others: 0
}

const isCharacterFilter = (value: string | null): value is CharacterFilter =>
  FILTERS.some(f => f.key === value)

const fetchCharactersPage = async ({
  q,
  filter,
  page
}: {
  q: string
  filter: CharacterFilter
  page: number
}): Promise<{ results: Hero[]; total: number; counts: CharacterCounts }> => {
  const url = new URL('/api/characters', window.location.origin)
  url.searchParams.set('q', q)
  url.searchParams.set('filter', filter)
  url.searchParams.set('page', String(page))
  const response = await fetch(url.toString())
  if (!response.ok)
    throw new Error(`Failed to fetch characters: ${response.status}`)
  return response.json()
}

export const useCharactersExplorer = () => {
  const [query, setQuery] = useState<string>(() =>
    typeof window !== 'undefined'
      ? (new URLSearchParams(window.location.search).get('query') ?? '')
      : ''
  )
  const [filter, setFilterState] = useState<CharacterFilter>(() => {
    if (typeof window === 'undefined') return 'all'
    const value = new URLSearchParams(window.location.search).get('filter')
    return isCharacterFilter(value) ? value : 'all'
  })
  const [page, setPage] = useState<number>(() => {
    if (typeof window === 'undefined') return 1
    const value = Number(
      new URLSearchParams(window.location.search).get('page')
    )
    return Number.isInteger(value) && value > 0 ? value : 1
  })

  const { data, isFetching, isError, refetch } = useQuery({
    queryKey: ['characters', query, filter, page],
    queryFn: () => fetchCharactersPage({ q: query, filter, page }),
    enabled: !isEmpty(query)
  })

  const gotoPage = useCallback((nextPage: number) => {
    setPage(nextPage)
    const url = new URL(window.location.href)
    if (nextPage <= 1) url.searchParams.delete('page')
    else url.searchParams.set('page', String(nextPage))
    window.history.pushState({}, '', url.toString())
  }, [])

  const updateQuery = useCallback((value: string) => {
    setQuery(value)
    setPage(1)
    const url = new URL(window.location.href)
    if (isEmpty(value)) url.searchParams.delete('query')
    else url.searchParams.set('query', value)
    url.searchParams.delete('page')
    window.history.pushState({}, '', url.toString())
  }, [])

  const setFilter = useCallback((value: CharacterFilter) => {
    setFilterState(value)
    setPage(1)
    const url = new URL(window.location.href)
    if (value === 'all') url.searchParams.delete('filter')
    else url.searchParams.set('filter', value)
    url.searchParams.delete('page')
    window.history.pushState({}, '', url.toString())
  }, [])

  return {
    query,
    filter,
    page,
    total: data?.total ?? 0,
    characters: data?.results ?? [],
    counts: data?.counts ?? EMPTY_COUNTS,
    loading: isFetching,
    isError,
    refetch,
    gotoPage,
    updateQuery,
    setFilter
  }
}
