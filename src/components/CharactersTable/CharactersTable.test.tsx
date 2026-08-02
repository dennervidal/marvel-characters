import { fireEvent, render, screen } from '@testing-library/react'
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
            image: {
              url: 'https://www.superherodb.com/pictures2/portraits/10/100/659.jpg'
            }
          }
        ]}
      />
    )
    expect(screen.getByText('Thor')).toBeInTheDocument()
    expect(screen.getByText('Publisher')).toBeInTheDocument()
    expect(screen.getByText('Marvel Comics')).toBeInTheDocument()
    expect(screen.getByText('good')).toBeInTheDocument()
  })

  it('renders the akabab portrait from id and name', () => {
    render(
      <CharactersTable
        characters={[
          {
            id: '659',
            name: 'Thor',
            image: { url: 'https://example.com/thor.jpg' }
          }
        ]}
      />
    )
    const avatar = screen.getByAltText('Thor') as HTMLImageElement
    expect(avatar.src).toBe(
      'https://cdn.jsdelivr.net/gh/akabab/superhero-api@0.3.0/api/images/lg/659-thor.jpg'
    )
  })

  it('hides the avatar when the portrait fails to load', () => {
    render(
      <CharactersTable
        characters={[
          {
            id: '999999',
            name: 'Nobody',
            image: { url: 'https://example.com/nobody.jpg' }
          }
        ]}
      />
    )
    const avatar = screen.getByAltText('Nobody') as HTMLImageElement
    fireEvent.error(avatar)
    expect(avatar.style.display).toBe('none')
  })
})
