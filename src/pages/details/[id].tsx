import React from 'react'
import Typography from '@material-ui/core/Typography'
import Grid from '@material-ui/core/Grid'
import { LoadingPlaceholder } from 'components/LoadingPlaceholder'
import { ComicPreview } from 'components/ComicPreview'
import { NextPage } from 'next'
import { DetailImg, GridPadding } from 'styles/details'
import { useDetails } from '../_hooks/useDetails'

const CharacterDetail: NextPage = () => {
  const { loading, character, comics } = useDetails()
  return (
    <Grid spacing={0} container>
      <LoadingPlaceholder loading={loading}>
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
