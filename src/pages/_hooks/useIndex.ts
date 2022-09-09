import { useRouter } from 'next/router'
import { useCharactersPaginate } from '../../hooks'
import { Character } from '../../types'
import { usePaginationContext } from '../../hooks/usePaginationContext'

export const useIndex = (
  initialData: Character[] | undefined,
  total: number
) => {
  const router = useRouter()
  const { query } = router.query

  const { setTotal, page } = usePaginationContext()
  const { results: characters, loading } = useCharactersPaginate({
    nameStartsWith: query ? String(query) : undefined,
    setTotal,
    page,
    initialData,
    total
  })

  return { characters, query, loading }
}
