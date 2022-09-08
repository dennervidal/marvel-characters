import React, { useEffect } from 'react'
import Typography from '@material-ui/core/Typography'
import Grid from '@material-ui/core/Grid'
import { useCharacterComicsById } from 'hooks/useCharacterComicsById'
import { LoadingPlaceholder } from 'components/LoadingPlaceholder'
import { ComicPreview } from 'components/ComicPreview'
import { useCharacterById } from 'hooks/useCharacterById'
import { useRouter } from 'next/router'
import { NextPage } from 'next'
import { DetailImg, GridPadding } from 'styles/details'

const CharacterDetail: NextPage = () => {
  const router = useRouter()
  const { id } = router.query
  const { result: comics, loading } = useCharacterComicsById({
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

  return (
    <Grid spacing={0} container>
      <LoadingPlaceholder loading={loading && charLoad}>
        <Grid item xs={12} md={4}>
          {character?.thumbnail?.path && (
            <DetailImg
              width={490}
              height={490}
              src={`${character?.thumbnail?.path}.${character?.thumbnail?.extension}`}
              alt='thumbnail'
            />
          )}
        </Grid>
        <GridPadding item container xs={12} md={8} spacing={1}>
          {character?.name && (
            <Grid item xs={12} md={12}>
              <Typography variant='h4'>{character?.name}</Typography>
            </Grid>
          )}
          {character?.description && (
            <Grid item xs={12} md={12}>
              <div>{character?.description}</div>
            </Grid>
          )}
          <Grid item xs={12} md={12}>
            <Typography variant='h6'>Comics appearance</Typography>
            <ComicPreview comics={comics} />
          </Grid>
        </GridPadding>
      </LoadingPlaceholder>
    </Grid>
  )
}

export default CharacterDetail
