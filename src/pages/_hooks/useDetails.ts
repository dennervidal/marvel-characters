import { useRouter } from 'next/router'
import { useCharacterComicsById } from '../../hooks/useCharacterComicsById'
import { useCharacterById } from '../../hooks/useCharacterById'
import { useEffect } from 'react'

export const useDetails = () => {
  const router = useRouter()
  const { id } = router.query
  const { result: comics, loading: comicLoad } = useCharacterComicsById({
    id: String(id)
  })
  const {
    result: character,
    loading: charLoad,
    error
  } = useCharacterById({
    id: String(id)
  })

  useEffect(() => {
    if (Boolean(error)) {
      router.push('/404').then()
    }
  }, [error, router])

  return { comics, loading: comicLoad && charLoad, character }
}
