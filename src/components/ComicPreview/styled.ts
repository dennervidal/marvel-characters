import styled from 'styled-components'
import { Grid, Typography as MuiTypography } from '@material-ui/core'
import Image from 'next/image'

export const ComicImg = styled(Image)`
  max-width: 100px;
  margin: ${({ theme }) => theme.spacing(1 / 2)}px;
`

export const ComicGrid = styled(Grid)`
  && {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 4px;
  }
`

export const Typography = styled(MuiTypography)`
  && {
    text-align: center;
    font-size: 14px;
  }
`
