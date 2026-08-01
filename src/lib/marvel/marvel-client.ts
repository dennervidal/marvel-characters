import type { Character, Comic } from '@/types'
import { PAGE_LIMIT } from './constants'
import { getMockComics, MOCK_CHARACTERS } from './mock-data'

export const fetchCharacters = async ({
  nameStartsWith,
  page = 0,
  limit = PAGE_LIMIT
}: {
  nameStartsWith?: string | null
  page?: number
  limit?: number
}): Promise<{ results: Character[]; total: number }> => {
  const filtered = nameStartsWith
    ? MOCK_CHARACTERS.filter(c =>
        c.name?.toLowerCase().startsWith(nameStartsWith.toLowerCase())
      )
    : MOCK_CHARACTERS
  return {
    results: filtered.slice(page * limit, page * limit + limit),
    total: filtered.length
  }
}

export const fetchCharacterById = async (
  id: string | number
): Promise<Character | undefined> =>
  MOCK_CHARACTERS.find(c => c.id === Number(id))

export const fetchCharacterComics = async (
  id: string | number
): Promise<Comic[]> => getMockComics(Number(id))
