import React, { useContext } from 'react'
import { useTheme } from '@material-ui/styles'
import { PaginationContext } from '../context'
import { CharactersTable, LoadingPlaceholder } from '../components'
import { Theme, useMediaQuery } from '@material-ui/core'
import { useCharactersPaginate } from '../hooks'
import { MainDiv } from '../styles/styled'
import { SearchHeader } from '../components/SearchHeader'
import { NextPage } from 'next'
import { useRouter } from 'next/router'

const Index: NextPage = () => {
  const theme: Theme = useTheme()
  const router = useRouter()
  const mobile = !useMediaQuery(theme.breakpoints.up('sm'))
  const { query } = router.query

  const { setTotal, page, gotoPage } = useContext(PaginationContext)
  const { results: characters, loading } = useCharactersPaginate({
    nameStartsWith: query ? String(query) : undefined,
    setTotal,
    page
  })

  return (
    <LoadingPlaceholder loading={loading}>
      <MainDiv>
        <SearchHeader
          mobile={mobile}
          query={query ? String(query) : undefined}
          setPage={gotoPage}
        />
        <CharactersTable characters={characters} mobile={mobile} />
      </MainDiv>
    </LoadingPlaceholder>
  )
}

export default Index
