import { Theme, useMediaQuery } from '@material-ui/core'
import { useTheme } from '@material-ui/styles'

export const useMobile = () => {
  const theme: Theme = useTheme()
  return !useMediaQuery(theme.breakpoints.up('sm'))
}
