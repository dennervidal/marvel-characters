import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  fetchCharacterById,
  fetchCharacterComics,
  fetchCharacters
} from './marvel-client'

describe('marvel-client', () => {
  const mockFetch = vi.fn()

  beforeEach(() => {
    vi.stubEnv('PUBLIC_MARVEL_API_KEY', 'public-key-123')
    vi.stubEnv('MARVEL_PRIVATE_KEY', 'private-key-456')
    vi.stubGlobal('fetch', mockFetch)
    mockFetch.mockClear()
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    vi.unstubAllGlobals()
  })

  it('returns results and total', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        data: { results: [{ id: 1, name: 'Thor' }], total: 100 }
      })
    })
    const { results, total } = await fetchCharacters({ page: 0, limit: 10 })
    expect(results[0].name).toBe('Thor')
    expect(total).toBe(100)
    expect(mockFetch.mock.calls[0][0]).toContain('/characters?')
    expect(mockFetch.mock.calls[0][0]).toContain('offset=0')
  })

  it('adds nameStartsWith when provided', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ data: { results: [], total: 0 } })
    })
    await fetchCharacters({ nameStartsWith: 'Th', page: 2, limit: 10 })
    expect(mockFetch.mock.calls[0][0]).toContain('nameStartsWith=Th')
    expect(mockFetch.mock.calls[0][0]).toContain('offset=20')
  })

  it('throws on non-ok responses', async () => {
    mockFetch.mockResolvedValue({ ok: false, status: 429 })
    await expect(fetchCharacters({})).rejects.toThrow('Marvel API error: 429')
  })

  it('returns the first character for fetchCharacterById', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ data: { results: [{ id: 1, name: 'Thor' }] } })
    })
    const character = await fetchCharacterById(1)
    expect(character?.name).toBe('Thor')
  })

  it('returns comics list for fetchCharacterComics', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ data: { results: [{ id: 9, title: 'Thor #1' }] } })
    })
    const comics = await fetchCharacterComics(1)
    expect(comics[0].title).toBe('Thor #1')
  })
})
