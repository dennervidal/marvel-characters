import type { APIContext } from 'astro'
import { fetchCharacters } from '@/lib/heroes/heroes-client'
import { PAGE_LIMIT } from '@/lib/heroes/constants'

export const prerender = false

export async function GET({ request }: APIContext): Promise<Response> {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q')?.trim() ?? ''
  const page = Math.max(1, Number(searchParams.get('page') ?? 1))
  const limit = Math.min(
    100,
    Math.max(1, Number(searchParams.get('limit') ?? PAGE_LIMIT))
  )
  try {
    const { results, total } = await fetchCharacters({
      query: query || undefined,
      page: page - 1,
      limit
    })
    return new Response(
      JSON.stringify({ results, total: Math.ceil(total / limit) }),
      {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=60, s-maxage=3600'
        }
      }
    )
  } catch {
    return new Response(JSON.stringify({ error: 'Upstream request failed' }), {
      status: 502
    })
  }
}
