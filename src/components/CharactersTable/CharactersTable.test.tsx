import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { CharactersTable } from './CharactersTable'

describe('CharactersTable', () => {
  it('renders name, publisher and alignment', () => {
    render(
      <CharactersTable
        characters={[
          {
            id: '659',
            name: 'Thor',
            biography: { publisher: 'Marvel Comics', alignment: 'good' },
            image: { url: 'https://example.com/thor.jpg' }
          }
        ]}
      />
    )
    expect(screen.getByText('Thor')).toBeInTheDocument()
    expect(screen.getByText('Publisher')).toBeInTheDocument()
    expect(screen.getByText('Marvel Comics')).toBeInTheDocument()
    expect(screen.getByText('good')).toBeInTheDocument()
  })
})
