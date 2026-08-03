import { describe, expect, it } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { HeroCard } from './HeroCard'
import type { Hero } from '@/types'

const hero: Hero = {
  id: '70',
  name: 'Hulk',
  powerstats: { power: '98' },
  biography: {
    alignment: 'good',
    publisher: 'Marvel Comics',
    'full-name': 'Bruce Banner'
  }
}

describe('HeroCard', () => {
  it('links to the details page', () => {
    render(<HeroCard hero={hero} />)
    expect(screen.getByRole('link')).toHaveAttribute('href', '/details/70')
  })

  it('carries the search state in the details link', () => {
    render(<HeroCard hero={hero} query='thor' filter='heroes' />)
    expect(screen.getByRole('link')).toHaveAttribute(
      'href',
      '/details/70?query=thor&filter=heroes'
    )
  })

  it('omits the filter param when it is all', () => {
    render(<HeroCard hero={hero} query='thor' filter='all' />)
    expect(screen.getByRole('link')).toHaveAttribute(
      'href',
      '/details/70?query=thor'
    )
  })

  it('shows the hero image with the akabab url', () => {
    render(<HeroCard hero={hero} />)
    const image = screen.getByRole('img', { name: 'Hulk portrait' })
    expect(image).toHaveAttribute('src', expect.stringContaining('70-hulk.jpg'))
  })

  it('falls back to the initial letter when the image errors', async () => {
    render(<HeroCard hero={hero} />)
    fireEvent.error(screen.getByRole('img', { name: 'Hulk portrait' }))
    expect(await screen.findByText('H')).toBeInTheDocument()
    expect(
      screen.queryByRole('img', { name: 'Hulk portrait' })
    ).not.toBeInTheDocument()
  })

  it('renders alignment badge and power level bar', () => {
    render(<HeroCard hero={hero} />)
    expect(screen.getByText('◆ HERO')).toBeInTheDocument()
    expect(screen.getByText('POWER LEVEL')).toBeInTheDocument()
    expect(screen.getByText('98/100')).toBeInTheDocument()
  })
})
