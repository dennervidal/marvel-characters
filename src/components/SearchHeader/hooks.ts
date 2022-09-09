import { useRouter } from 'next/router'
import { useEffect, useRef } from 'react'
import { usePaginationContext, useMobile } from 'hooks'
import { isEmpty } from 'utils'

export const useSearchHeader = (query: string | undefined | null) => {
  const router = useRouter()
  const mobile = useMobile()
  const { gotoPage } = usePaginationContext()
  const inputRef = useRef<HTMLInputElement>()

  const redirectToSearch = () => {
    const value = inputRef.current?.value
    gotoPage(1)
    router.push(`/?query=${value}`).then()
  }

  const onKeyDown = (e: { key: string; preventDefault: () => void }) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      redirectToSearch()
    }
  }

  useEffect(() => {
    if (isEmpty(query)) {
      // @ts-ignore
      inputRef.current.value = ''
    }
  }, [query])

  return {
    mobile,
    onKeyDown,
    redirectToSearch,
    inputRef
  }
}
