import { beforeEach, describe, expect, it, vi } from 'vitest'
import { GET } from './characters'
import { fetchCharacters } from '@/lib/heroes/heroes-client'
import type { Hero } from '@/types'

vi.mock('@/lib/heroes/heroes-client', () => ({
  fetchCharacters: vi.fn()
}))

const hero = (overrides: Partial<Hero>): Hero => ({
  id: String(Math.random()),
  name: 'Hero',
  biography: { alignment: 'good', publisher: 'Marvel Comics' },
  ...overrides
})

const fixture: Hero[] = [
  hero({
    id: '1',
    name: 'A',
    biography: { alignment: 'good', publisher: 'Marvel Comics' }
  }),
  hero({
    id: '2',
    name: 'B',
    biography: { alignment: 'good', publisher: 'Marvel Comics' }
  }),
  hero({
    id: '3',
    name: 'C',
    biography: { alignment: 'good', publisher: 'DC Comics' }
  }),
  hero({
    id: '4',
    name: 'D',
    biography: { alignment: 'good', publisher: 'Dark Horse Comics' }
  }),
  hero({
    id: '5',
    name: 'E',
    biography: { alignment: 'bad', publisher: 'Marvel Comics' }
  }),
  hero({
    id: '6',
    name: 'F',
    biography: { alignment: 'bad', publisher: 'DC Comics' }
  }),
  hero({
    id: '7',
    name: 'G',
    biography: { alignment: 'bad', publisher: 'DC Comics' }
  }),
  hero({
    id: '8',
    name: 'H',
    biography: { alignment: 'neutral', publisher: '-' }
  }),
  hero({
    id: '9',
    name: 'I',
    biography: { alignment: 'neutral', publisher: undefined }
  })
]

const request = (params: Record<string, string>) =>
  new Request(`http://localhost/api/characters?${new URLSearchParams(params)}`)

describe('GET /api/characters', () => {
  beforeEach(() => {
    vi.mocked(fetchCharacters).mockResolvedValue({
      results: fixture,
      total: fixture.length
    })
  })

  it('returns results, page-count total and query-level counts', async () => {
    const response = await GET({
      request: request({ q: 'a', page: '1', limit: '10' })
    } as never)
    const body = await response.json()
    expect(body.total).toBe(1)
    expect(body.counts).toEqual({
      heroes: 4,
      villains: 3,
      marvel: 3,
      dc: 3,
      others: 3
    })
    expect(body.results).toHaveLength(9)
    expect(vi.mocked(fetchCharacters)).toHaveBeenCalledWith({
      query: 'a',
      page: 0,
      limit: 100
    })
  })

  it('filters by heroes alignment and paginates', async () => {
    const response = await GET({
      request: request({ q: 'a', page: '1', limit: '2', filter: 'heroes' })
    } as never)
    const body = await response.json()
    expect(body.results).toHaveLength(2)
    expect(
      body.results.every((h: Hero) => h.biography?.alignment === 'good')
    ).toBe(true)
    expect(body.total).toBe(2)
  })

  it('filters by publisher (marvel / dc / others)', async () => {
    const marvel = await GET({
      request: request({ q: 'a', filter: 'marvel' })
    } as never)
    expect(
      (await marvel.json()).results.every(
        (h: Hero) => h.biography?.publisher === 'Marvel Comics'
      )
    ).toBe(true)

    const dc = await GET({
      request: request({ q: 'a', filter: 'dc' })
    } as never)
    expect(
      (await dc.json()).results.every(
        (h: Hero) => h.biography?.publisher === 'DC Comics'
      )
    ).toBe(true)

    const others = await GET({
      request: request({ q: 'a', filter: 'others' })
    } as never)
    const results = (await others.json()).results as Hero[]
    expect(results).toHaveLength(3)
    expect(
      results.every(
        h =>
          h.biography?.publisher !== 'Marvel Comics' &&
          h.biography?.publisher !== 'DC Comics'
      )
    ).toBe(true)
  })

  it('treats unknown filter as all and keeps counts unaffected by the active filter', async () => {
    const unknown = await GET({
      request: request({ q: 'a', filter: 'bogus' })
    } as never)
    expect((await unknown.json()).results).toHaveLength(9)

    const filtered = await GET({
      request: request({ q: 'a', filter: 'villains' })
    } as never)
    expect((await filtered.json()).counts.heroes).toBe(4)
  })

  it('returns 502 on upstream failure', async () => {
    vi.mocked(fetchCharacters).mockRejectedValue(new Error('boom'))
    const response = await GET({ request: request({ q: 'a' }) } as never)
    expect(response.status).toBe(502)
  })
})
