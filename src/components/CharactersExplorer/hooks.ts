import { useQuery } from '@tanstack/react-query'
import { useCallback, useMemo, useState } from 'react'
import type { Character } from '@/types'
import { isEmpty } from '@/utils'

const fetchCharactersPage = async ({
  q,
  page
}: {
  q: string
  page: number
}): Promise<{ results: Character[]; total: number }> => {
  const url = new URL('/api/characters', window.location.origin)
  if (!isEmpty(q)) url.searchParams.set('q', q)
  url.searchParams.set('page', String(page))
  const response = await fetch(url.toString())
  if (!response.ok)
    throw new Error(`Failed to fetch characters: ${response.status}`)
  return response.json()
}

export const useCharactersExplorer = (
  initialData: Character[],
  total: number
) => {
  const [query, setQuery] = useState<string>(
    () =>
      typeof window !== 'undefined'
        ? new URLSearchParams(window.location.search).get('query') ?? ''
        : ''
  )
  const [page, setPage] = useState<number>(1)

  const placeholder = useMemo(
    () =>
      isEmpty(query) && page === 1
        ? { results: initialData, total }
        : undefined,
    [query, page, initialData, total]
  )

  const { data, isFetching } = useQuery({
    queryKey: ['characters', query, page],
    queryFn: () => fetchCharactersPage({ q: query, page }),
    placeholderData: placeholder,
    enabled: !placeholder
  })

  const current = data ?? placeholder

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
    total: current?.total ?? total,
    characters: current?.results ?? [],
    loading: isFetching,
    gotoPage,
    updateQuery
  }
}
