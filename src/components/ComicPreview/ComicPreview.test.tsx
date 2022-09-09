import { render, screen } from '@testing-library/react'
import React from 'react'
import { ComicPreview } from './ComicPreview'
import { ThemeProvider } from '@material-ui/styles'
import theme from '../../utils'
import { StyledThemeProvider } from 'components/styled'

test('renders comic preview', () => {
  render(
    <ThemeProvider theme={theme}>
      <StyledThemeProvider>
        <ComicPreview comics={[{ title: 'Thor', thumbnail: {}, id: 1 }]} />
      </StyledThemeProvider>
    </ThemeProvider>
  )
  const titleElement = screen.getByText(/thor/i)
  expect(titleElement).toBeInTheDocument()
})
