import type { Hero } from '@/types'
import { PAGE_LIMIT, ROOT_SUPERHERO_API_URL } from './constants'

type SearchResponse = {
  response?: string
  results?: Hero[]
}

type HeroResponse = Hero & {
  response?: string
}

const fetchJson = async (path: string): Promise<unknown> => {
  const token = import.meta.env.API_TOKEN as string
  const response = await fetch(`${ROOT_SUPERHERO_API_URL}/${token}${path}`)
  if (!response.ok) throw new Error(`SuperHero API error: ${response.status}`)
  return response.json()
}

export const fetchCharacters = async ({
  query,
  page = 0,
  limit = PAGE_LIMIT
}: {
  query?: string | null
  page?: number
  limit?: number
}): Promise<{ results: Hero[]; total: number }> => {
  const trimmed = query?.trim() ?? ''
  if (!trimmed) return { results: [], total: 0 }
  const json = (await fetchJson(
    `/search/${encodeURIComponent(trimmed)}`
  )) as SearchResponse
  if (json.response !== 'success') return { results: [], total: 0 }
  const all = json.results ?? []
  return {
    results: all.slice(page * limit, page * limit + limit),
    total: all.length
  }
}

export const fetchCharacterById = async (
  id: string | number
): Promise<Hero | undefined> => {
  const json = (await fetchJson(`/${id}`)) as HeroResponse
  if (json.response !== 'success') return undefined
  return json
}
