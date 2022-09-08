import React, { ReactNode } from 'react'
import { useTheme } from '@material-ui/styles'
import { ThemeProvider } from 'styled-components'

const StyledThemeProvider = ({ children }: { children: ReactNode }) => {
  const muiTheme = useTheme()
  return <ThemeProvider theme={muiTheme}>{children}</ThemeProvider>
}

export { StyledThemeProvider }
