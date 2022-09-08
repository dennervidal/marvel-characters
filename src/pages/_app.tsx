import React from 'react'
import type { AppProps } from 'next/app'
import theme from '../utils'
import { PaginationContextProvider } from '../context'
import { StyledThemeProvider } from '../components'
import { ThemeProvider } from '@material-ui/styles'
import Layout from '../components/Layout'
import Head from 'next/head'
import 'styles/globals.css'

const App = ({ Component, pageProps }: AppProps) => {
  return (
    <ThemeProvider theme={theme}>
      <PaginationContextProvider>
        <StyledThemeProvider>
          <Head>
            <title>marvel characters</title>
          </Head>
          <Layout>
            <Component {...pageProps} />
          </Layout>
        </StyledThemeProvider>
      </PaginationContextProvider>
    </ThemeProvider>
  )
}

export default App
