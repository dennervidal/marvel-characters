import type { APIContext } from 'astro'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { GET } from './characters'
import { fetchCharacters } from '@/lib/heroes/heroes-client'

vi.mock('@/lib/heroes/heroes-client', () => ({
  fetchCharacters: vi.fn()
}))

const mockedFetchCharacters = vi.mocked(fetchCharacters)

const context = (search = '') =>
  ({
    request: new Request(`https://example.com/api/characters${search}`)
  }) as APIContext

describe('GET /api/characters', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  it('returns results with total as page count', async () => {
    mockedFetchCharacters.mockResolvedValue({
      results: [{ id: '659', name: 'Thor' }],
      total: 57
    })
    const response = await GET(context('?q=th&page=2'))
    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.results[0].name).toBe('Thor')
    expect(body.total).toBe(6)
    expect(mockedFetchCharacters).toHaveBeenCalledWith({
      query: 'th',
      page: 1,
      limit: 10
    })
  })

  it('treats missing q as an empty query and clamps page and limit', async () => {
    mockedFetchCharacters.mockResolvedValue({ results: [], total: 0 })
    await GET(context('?page=0&limit=999'))
    expect(mockedFetchCharacters).toHaveBeenCalledWith({
      query: undefined,
      page: 0,
      limit: 100
    })
  })

  it('returns 502 on upstream failure', async () => {
    mockedFetchCharacters.mockRejectedValue(new Error('boom'))
    const response = await GET(context())
    expect(response.status).toBe(502)
  })
})
