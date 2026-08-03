// @vitest-environment node
import { experimental_AstroContainer as AstroContainer } from 'astro/container'
import { expect, test, vi } from 'vitest'
import { fetchCharacterById } from '@/lib/heroes/heroes-client'
import type { Hero } from '@/types'
import DetailsPage from './[id].astro'

vi.mock('@/lib/heroes/heroes-client', () => ({
  fetchCharacters: vi.fn(),
  fetchCharacterById: vi.fn()
}))

const hero: Hero = {
  id: '70',
  name: 'Hulk',
  powerstats: { power: '98' },
  biography: { alignment: 'good', publisher: 'Marvel Comics' }
}

const render = (search: string = '') =>
  AstroContainer.create().then(container =>
    container.renderToString(DetailsPage, {
      params: { id: '70' },
      request: new Request(`http://localhost/details/70${search}`)
    })
  )

test('back link restores the search state when present in the url', async () => {
  vi.mocked(fetchCharacterById).mockResolvedValue(hero)
  const view = await render('?query=thor&filter=heroes')
  expect(view).toContain('href="/?query=thor&amp;filter=heroes"')
})

test('back link falls back to the home page when landing without state', async () => {
  vi.mocked(fetchCharacterById).mockResolvedValue(hero)
  const view = await render()
  expect(view).toContain('href="/"')
})
