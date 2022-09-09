import { render, screen } from '@testing-library/react'
import React from 'react'
import { CharactersTable } from './CharactersTable'
import theme from '../../utils'
import { ThemeProvider } from '@material-ui/styles'

test('renders character table', () => {
  render(
    <ThemeProvider theme={theme}>
      <CharactersTable
        characters={[
          { name: 'Thor', thumbnail: {}, events: {}, series: {}, id: 1 }
        ]}
      />
    </ThemeProvider>
  )
  const nameElement = screen.getByText(/thor/i)
  expect(nameElement).toBeInTheDocument()
})
