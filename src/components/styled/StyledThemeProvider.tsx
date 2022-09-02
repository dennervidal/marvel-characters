import React, { ReactNode } from 'react'
import PropTypes from 'prop-types'
import { useTheme } from '@material-ui/styles'
import { ThemeProvider } from 'styled-components'

const StyledThemeProvider = ({ children }: { children: ReactNode }) => {
  const muiTheme = useTheme()

  // TODO: Remove ignore
  // @ts-expect-error
  return <ThemeProvider theme={muiTheme}>{children}</ThemeProvider>
}

StyledThemeProvider.propTypes = {
  children: PropTypes.node.isRequired
}

export { StyledThemeProvider }
