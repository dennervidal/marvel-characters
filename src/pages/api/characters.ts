import type { APIContext } from 'astro'
import { fetchCharacters } from '@/lib/heroes/heroes-client'
import { PAGE_LIMIT } from '@/lib/heroes/constants'
import type { CharacterCounts, CharacterFilter } from '@/types'

export const prerender = false

const matches =
  (filter: CharacterFilter) =>
  (hero: { biography?: { alignment?: string; publisher?: string } }) => {
    const { alignment, publisher } = hero.biography ?? {}
    switch (filter) {
      case 'heroes':
        return alignment === 'good'
      case 'villains':
        return alignment === 'bad'
      case 'marvel':
        return publisher === 'Marvel Comics'
      case 'dc':
        return publisher === 'DC Comics'
      case 'others':
        return publisher !== 'Marvel Comics' && publisher !== 'DC Comics'
      default:
        return true
    }
  }

const computeCounts = (
  heroes: Array<{ biography?: { alignment?: string; publisher?: string } }>
): CharacterCounts => ({
  heroes: heroes.filter(matches('heroes')).length,
  villains: heroes.filter(matches('villains')).length,
  marvel: heroes.filter(matches('marvel')).length,
  dc: heroes.filter(matches('dc')).length,
  others: heroes.filter(matches('others')).length
})

export async function GET({ request }: APIContext): Promise<Response> {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q')?.trim() ?? ''
  const page = Math.max(1, Number(searchParams.get('page') ?? 1))
  const limit = Math.min(
    100,
    Math.max(1, Number(searchParams.get('limit') ?? PAGE_LIMIT))
  )
  const filter = (searchParams.get('filter') ?? 'all') as CharacterFilter
  try {
    const { results } = await fetchCharacters({
      query: query || undefined,
      page: 0,
      limit: 100
    })
    const counts = computeCounts(results)
    const filtered =
      filter === 'all' ? results : results.filter(matches(filter))
    const start = (page - 1) * limit
    return new Response(
      JSON.stringify({
        results: filtered.slice(start, start + limit),
        total: Math.ceil(filtered.length / limit),
        counts
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=60, s-maxage=3600'
        }
      }
    )
  } catch (error) {
    console.error('upstream request failed', error)
    return new Response(JSON.stringify({ error: 'Upstream request failed' }), {
      status: 502
    })
  }
}
