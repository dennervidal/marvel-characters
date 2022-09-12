import { render, screen } from '@testing-library/react'
import React from 'react'
import { SearchHeader } from './SearchHeader'
import theme from 'utils'
import { ThemeProvider } from '@material-ui/styles'

test('renders search header', () => {
  render(
    <ThemeProvider theme={theme}>
      <SearchHeader query='thor' />
    </ThemeProvider>
  )
  const label = screen.getByText(/find a character/i)
  const input = screen.getByDisplayValue(/thor/i)
  expect(label).toBeInTheDocument()
  expect(input).toBeInTheDocument()
})
