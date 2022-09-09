import { AppBar, Toolbar } from '@material-ui/core'
import { LogoImg, Title } from './styled'
import React from 'react'
import { useRouter } from 'next/router'
import { PaginationContext } from 'context'

export const Appbar = ({ mobile }: { mobile: boolean }) => {
  const router = useRouter()
  const { gotoPage } = useContext(PaginationContext)
  const onClickImage = () => {
    router.push('/').then()
    gotoPage(0)
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
