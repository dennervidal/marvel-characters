import { useRouter } from 'next/router'
import React, { useCallback, useState } from 'react'
import { usePaginationContext } from '../../hooks/usePaginationContext'
import { useMobile } from '../../hooks/useMobile'

export const useSearchHeader = (query: string | undefined | null) => {
  const router = useRouter()
  const mobile = useMobile()
  const { gotoPage } = usePaginationContext()
  const [search, setSearch] = useState<string>(query ?? '') // TODO: change to useRef

  const redirectToSearch = () => {
    gotoPage(1)
    router.push(`/search?query=${search}`).then()
  }

  const onKeyDown = (e: { key: string; preventDefault: () => void }) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      redirectToSearch()
    }
  }

  const handleInputSearch = useCallback(
    (e: { target: { value: React.SetStateAction<string> } }) =>
      setSearch(e?.target?.value),
    []
  )

  return { mobile, search, onKeyDown, redirectToSearch, handleInputSearch }
}
