import { useQuery } from '@tanstack/react-query'
import { useCallback, useState } from 'react'
import type { Hero } from '@/types'
import { isEmpty } from '@/utils'

const fetchCharactersPage = async ({
  q,
  page
}: {
  q: string
  page: number
}): Promise<{ results: Hero[]; total: number }> => {
  const url = new URL('/api/characters', window.location.origin)
  url.searchParams.set('q', q)
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
  const [page, setPage] = useState<number>(1)

  const { data, isFetching, isError, refetch } = useQuery({
    queryKey: ['characters', query, page],
    queryFn: () => fetchCharactersPage({ q: query, page }),
    enabled: !isEmpty(query)
  })

  const gotoPage = useCallback((nextPage: number) => setPage(nextPage), [])

  const updateQuery = useCallback((value: string) => {
    setQuery(value)
    setPage(1)
    const url = new URL(window.location.href)
    if (isEmpty(value)) url.searchParams.delete('query')
    else url.searchParams.set('query', value)
    window.history.pushState({}, '', url.toString())
  }, [])

  return {
    query,
    page,
    total: data?.total ?? 0,
    characters: data?.results ?? [],
    loading: isFetching,
    isError,
    refetch,
    gotoPage,
    updateQuery
  }
}
