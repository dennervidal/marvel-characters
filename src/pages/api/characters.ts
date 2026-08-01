import type { APIContext } from 'astro'
import { fetchCharacters } from '@/lib/marvel/marvel-client'
import { PAGE_LIMIT } from '@/lib/marvel/constants'

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
      nameStartsWith: query || null,
      page: page - 1,
      limit
    })
    return new Response(
      JSON.stringify({ results, total: Math.ceil(total / limit) }),
      {
        headers: { 'Content-Type': 'application/json' }
      }
    )
  } catch {
    return new Response(JSON.stringify({ error: 'Upstream request failed' }), {
      status: 502
    })
  }
}
