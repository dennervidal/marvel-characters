import type { Character, Comic } from '@/types'
import { PAGE_LIMIT } from './constants'
import { buildSignedUrl } from './signing'

type MarvelData = {
  results?: Character[] | Comic[]
  total?: number
}

const fetchJson = async (url: string): Promise<MarvelData> => {
  const response = await fetch(url)
  if (!response.ok) throw new Error(`Marvel API error: ${response.status}`)
  const json = await response.json()
  return json?.data
}

export const fetchCharacters = async ({
  nameStartsWith,
  page = 0,
  limit = PAGE_LIMIT
}: {
  nameStartsWith?: string | null
  page?: number
  limit?: number
}): Promise<{ results: Character[]; total: number }> => {
  const params: Record<string, string | number> = {
    limit,
    offset: page * limit
  }
  if (nameStartsWith) params.nameStartsWith = nameStartsWith
  const data = await fetchJson(
    await buildSignedUrl({ path: '/characters', params })
  )
  return {
    results: (data.results as Character[]) ?? [],
    total: data.total ?? 0
  }
}

export const fetchCharacterById = async (
  id: string | number
): Promise<Character | undefined> => {
  const data = await fetchJson(
    await buildSignedUrl({ path: `/characters/${id}` })
  )
  return (data.results as Character[] | undefined)?.[0]
}

export const fetchCharacterComics = async (
  id: string | number
): Promise<Comic[]> => {
  const data = await fetchJson(
    await buildSignedUrl({ path: `/characters/${id}/comics` })
  )
  return (data.results as Comic[] | undefined) ?? []
}
