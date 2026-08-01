import { describe, expect, it } from 'vitest'
import { MOCK_CHARACTERS } from './mock-data'
import {
  fetchCharacterById,
  fetchCharacterComics,
  fetchCharacters
} from './marvel-client'

describe('marvel-client (mock provider)', () => {
  it('returns the first page and the raw total', async () => {
    const { results, total } = await fetchCharacters({ page: 0, limit: 10 })
    expect(total).toBe(MOCK_CHARACTERS.length)
    expect(results).toHaveLength(10)
    expect(results[0].id).toBe(MOCK_CHARACTERS[0].id)
  })

  it('filters by name prefix, case-insensitive', async () => {
    const { results, total } = await fetchCharacters({
      nameStartsWith: 'IRON'
    })
    expect(total).toBeGreaterThan(0)
    expect(results.every(c => c.name?.toLowerCase().startsWith('iron'))).toBe(
      true
    )
  })

  it('paginates with a 0-based offset', async () => {
    const { results } = await fetchCharacters({ page: 1, limit: 10 })
    expect(results[0].id).toBe(MOCK_CHARACTERS[10].id)
  })

  it('returns the character by id', async () => {
    expect((await fetchCharacterById(7))?.name).toBe(MOCK_CHARACTERS[6].name)
    expect(await fetchCharacterById('999999')).toBeUndefined()
  })

  it('returns deterministic comics per character', async () => {
    const comics = await fetchCharacterComics(1)
    expect(comics.length).toBeGreaterThanOrEqual(3)
    expect(comics[0].title).toMatch(/#\d+$/)
    expect(await fetchCharacterComics(999999)).toEqual([])
  })
})
