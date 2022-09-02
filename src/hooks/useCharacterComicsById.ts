import { useEffect, useState } from 'react'
import { MarvelCharactersApiService } from 'service'
import { Comic } from '../types'

type UseCharacterComicsByIdParams = {
  id: string | number | undefined
}
type UseCharacterComicsByIdReturn = {
  result: Comic[] | undefined
  loading: boolean
  error: any
}
export function useCharacterComicsById({
  id
}: UseCharacterComicsByIdParams): UseCharacterComicsByIdReturn {
  const [result, setResult] = useState(undefined)
  const [error, setError] = useState(undefined)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    MarvelCharactersApiService.getByIdComics(id)
      .then(response => setResult(response?.results))
      .catch(e => setError(e))
      .finally(() => setLoading(false))
  }, [id])

  return {
    result,
    loading,
    error
  }
}
