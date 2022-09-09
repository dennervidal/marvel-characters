import theme from './theme'

export const isEmpty = (value: string | undefined | null): boolean =>
  value === undefined || value === null || value === ''

export default theme
