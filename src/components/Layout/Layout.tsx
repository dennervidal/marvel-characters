import React, { ReactNode, Suspense } from 'react'
import { useTheme } from '@material-ui/styles'
import { Theme, useMediaQuery } from '@material-ui/core'
import { useWindowSize } from 'hooks'
import { Loading } from 'components/Loading'
import { Navigation } from 'components/Navigation'
import { MainDiv, AppContainer } from './styled'
import { Appbar } from 'components/Appbar/Appbar'

const Layout = ({ children }: { children: ReactNode }) => {
  const theme: Theme = useTheme()
  const mobile = !useMediaQuery(theme.breakpoints.up('sm'))
  const [, height] = useWindowSize()

  return (
    <MainDiv height={height}>
      <div>
        <Appbar mobile={mobile} />
      </div>
      <AppContainer mobile={mobile}>
        <Suspense fallback={<Loading />}>{children}</Suspense>
      </AppContainer>
      <Navigation />
    </MainDiv>
  )
}

export default Layout
