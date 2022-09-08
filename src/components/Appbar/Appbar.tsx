import { AppBar, Toolbar } from '@material-ui/core'
import { LogoImg, Title } from './styled'
import React from 'react'
import { useRouter } from 'next/router'

export const Appbar = ({ mobile }: { mobile: boolean }) => {
  const router = useRouter()
  const onClickImage = () => {
    router.push('/').then()
  }

  return (
    <AppBar variant='outlined' position='fixed'>
      <Toolbar>
        <Title mobile={mobile}>
          <LogoImg
            width={100}
            height={34}
            src={'/assets/marvel.svg'}
            alt='Logo'
            onClick={onClickImage}
          />
        </Title>
      </Toolbar>
    </AppBar>
  )
}
