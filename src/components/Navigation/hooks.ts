import { useRouter } from 'next/router'
import { ChangeEvent, useCallback } from 'react'
import { usePaginationContext } from '../../hooks/usePaginationContext'

export const useNavigation = () => {
  const router = useRouter()
  const isDetails = router.pathname.includes('/details')
  const { page, total, gotoPage } = usePaginationContext()
  const handlePageChange = useCallback(
    (_: ChangeEvent<unknown>, pageNumber: number) => gotoPage(pageNumber),
    [gotoPage]
  )
  return { page, total, isDetails, handlePageChange }
}
