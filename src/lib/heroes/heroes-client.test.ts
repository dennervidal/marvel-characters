// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { fetchCharacterById, fetchCharacters } from './heroes-client'

vi.mock('astro:env/server', () => ({
  getSecret: vi.fn(() => 'test-token')
}))

describe('heroes-client (SuperHero API)', () => {
  const mockFetch = vi.fn()

  beforeEach(() => {
    vi.stubGlobal('fetch', mockFetch)
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  const hero = (id: number) => ({ id: String(id), name: `Hero ${id}` })

  it('returns empty results without fetching when no query is given', async () => {
    const { results, total } = await fetchCharacters({})
    expect(total).toBe(0)
    expect(results).toEqual([])
    expect(mockFetch).not.toHaveBeenCalled()
  })

  it('searches, slices pages and returns the raw total', async () => {
    const heroes = Array.from({ length: 25 }, (_, i) => hero(i))
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ response: 'success', results: heroes })
    })
    const { results, total } = await fetchCharacters({
      query: 'man',
      page: 1,
      limit: 10
    })
    expect(total).toBe(25)
    expect(results).toHaveLength(10)
    expect(results[0].id).toBe('10')
    const url = String(mockFetch.mock.calls[0][0])
    expect(url).toContain('/test-token/search/man')
  })

  it('returns empty results on the error envelope', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ response: 'error', error: 'not found' })
    })
    const { results, total } = await fetchCharacters({ query: 'zzz' })
    expect(results).toEqual([])
    expect(total).toBe(0)
  })

  it('throws on non-ok responses', async () => {
    mockFetch.mockResolvedValue({ ok: false, status: 502 })
    await expect(fetchCharacters({ query: 'man' })).rejects.toThrow(
      'SuperHero API error: 502'
    )
  })

  it('returns the hero for fetchCharacterById', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ response: 'success', id: '659', name: 'Thor' })
    })
    const character = await fetchCharacterById(659)
    expect(character?.name).toBe('Thor')
    expect(String(mockFetch.mock.calls[0][0])).toContain('/test-token/659')
  })

  it('returns undefined for missing heroes', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ response: 'error', error: 'invalid id' })
    })
    expect(await fetchCharacterById('999999')).toBeUndefined()
  })
})
