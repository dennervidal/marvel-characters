import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { CharactersTable } from './CharactersTable'

describe('CharactersTable', () => {
  it('renders character names', () => {
    render(
      <CharactersTable
        characters={[
          { name: 'Thor', thumbnail: {}, events: {}, series: {}, id: 1 }
        ]}
      />
    )
    expect(screen.getByText('Thor')).toBeInTheDocument()
    expect(screen.getByText('Character')).toBeInTheDocument()
  })
})
