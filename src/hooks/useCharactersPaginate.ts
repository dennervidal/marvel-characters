import { useEffect, useState } from 'react'
import { MarvelCharactersApiService } from 'service'
import { Character } from '../types'
import { PAGE_LIMIT } from '../service/functions'
import { isEmpty } from '../utils'

type UseCharactersPaginateParams = {
  nameStartsWith: string | undefined | null
  setTotal: (total: number) => void
  page: number
  initialData?: Character[]
  total: number
}
type UseCharactersPaginateReturn = {
  results: Character[] | undefined
  loading: boolean
  error: any
}

export function useCharactersPaginate({
  nameStartsWith = undefined,
  setTotal,
  page: currentPage,
  initialData,
  total: _total
}: UseCharactersPaginateParams): UseCharactersPaginateReturn {
  const [results, setResults] = useState<Character[] | undefined>(undefined)
  const [error, setErros] = useState(undefined)
  const [loading, setLoading] = useState(!!nameStartsWith)
  const page = currentPage - 1

  useEffect(() => {
    setLoading(true)
    if (Boolean(initialData) && page === 0 && isEmpty(nameStartsWith)) {
      setResults(initialData)
      setTotal(Math.ceil(_total))
      setLoading(false)
    } else {
      MarvelCharactersApiService.getPaginated(nameStartsWith, page, PAGE_LIMIT)
        .then(response => {
          setTotal(Math.ceil(response?.total / PAGE_LIMIT))
          setResults(response?.results || [])
        })
        .catch(e => setErros(e))
        .finally(() => setLoading(false))
    }
  }, [nameStartsWith, page, setTotal, initialData, _total])

  return {
    results,
    loading,
    error
  }
}
