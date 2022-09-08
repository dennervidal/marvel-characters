import React from 'react'
import { Grid } from '@material-ui/core'
import { ComicGrid, ComicImg, Typography } from './styled'
import { Comic } from '../../types'

const ComicPreview = ({ comics }: { comics?: Comic[] }) => {
  return (
    <Grid container>
      {(comics ?? []).map(({ thumbnail, id, title }, index) => (
        <ComicGrid item xs={6} md={4} key={`${title}--${id}`}>
          {thumbnail?.path && (
            <ComicImg
              key={`${id}--image-${index}`}
              width={100}
              height={150}
              src={`${thumbnail?.path}.${thumbnail?.extension}`}
              alt='thumbnail'
              onClick={() =>
                window.open(`${thumbnail?.path}.${thumbnail?.extension}`)
              }
            />
          )}
          <Typography>{title}</Typography>
        </ComicGrid>
      ))}
    </Grid>
  )
}

export { ComicPreview }
