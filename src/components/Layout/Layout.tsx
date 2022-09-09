import React, { ReactNode, Suspense } from 'react'
import { useWindowSize } from 'hooks'
import { Loading } from 'components/Loading'
import { Navigation } from 'components/Navigation'
import { MainDiv, AppContainer } from './styled'
import { Appbar } from 'components/Appbar/Appbar'
import { useMobile } from '../../hooks/useMobile'

const Layout = ({ children }: { children: ReactNode }) => {
  const mobile = useMobile()
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
