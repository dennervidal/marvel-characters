import { useRouter } from 'next/router'
import { useCallback } from 'react'
import { useMobile } from '../../hooks/useMobile'

export const useCharactersTable = () => {
  const router = useRouter()
  const mobile = useMobile()
  const redirectToDetails = useCallback(
    (id?: string | number) => {
      router.push(`/details/${id}`).then()
    },
    [router]
  )

  return { redirectToDetails, mobile }
}
