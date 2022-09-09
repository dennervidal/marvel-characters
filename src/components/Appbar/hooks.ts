import { useRouter } from 'next/router'
import { useCallback } from 'react'
import { usePaginationContext } from 'hooks'

export const useAppbar = () => {
  const router = useRouter()
  const { gotoPage } = usePaginationContext()
  const onClickImage = useCallback(() => {
    gotoPage(1)
    router.push('/').then()
  }, [gotoPage, router])

  return { onClickImage }
}
