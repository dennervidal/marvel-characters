import React from 'react'
import { CharactersTable, LoadingPlaceholder } from '../components'
import { MainDiv } from '../styles/styled'
import { SearchHeader } from '../components/SearchHeader'
import { GetStaticProps, NextPage } from 'next'
import { Character } from '../types'
import { getInitialPropsUrl } from '../service/functions'
import { useIndex } from 'hooks'

export const getStaticProps: GetStaticProps = async _ => {
  const response = await fetch(getInitialPropsUrl())
  const json = await response.json()
  return {
    props: {
      initialData: json?.data?.results ?? null,
      total: (json?.data?.total ?? 0) / 10
    }
  }
}

export const Index: NextPage<{ initialData?: Character[]; total: number }> = ({
  initialData,
  total: _total
}) => {
  const { characters, query, loading } = useIndex(initialData, _total)

  return (
    <LoadingPlaceholder loading={loading}>
      <MainDiv>
        <SearchHeader query={query ? String(query) : undefined} />
        <CharactersTable characters={characters} />
      </MainDiv>
    </LoadingPlaceholder>
  )
}

export default Index
