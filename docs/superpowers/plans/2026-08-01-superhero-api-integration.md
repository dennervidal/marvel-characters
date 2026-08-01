# SuperHero API Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the mock data provider with a live, server-only SuperHero API client (`src/lib/heroes/`), make the home page search-driven with empty/skeleton/error/no-results states, render details pages on-demand with a full character profile (powerstats, biography, appearance, work, connections), and delete all mock/Marvel-only code.

**Architecture:** The SuperHero API (`https://superheroapi.com/api/<TOKEN>/...`, token in path) has no list-all endpoint, no pagination, and no comics data; search is substring-based and returns full character objects. The client keeps the existing seam (`fetchCharacters({ query, page, limit })`, `fetchCharacterById(id)`), the `/api/characters` route contract is unchanged, and details pages flip from prerendered (`getStaticPaths`) to on-demand (`prerender = false`) with `Cache-Control` edge caching on the Cloudflare adapter. `TOKEN` (already in `.env`) becomes runtime-required and is read only server-side via `import.meta.env.TOKEN`; the build stays env-free (no build-time API calls). Images use `image.url` directly (superherodb's Cloudflare JS challenge is bot-only; real browsers pass it).

**Tech Stack:** Astro 7 (static output + on-demand pages), React 19 islands, TanStack Query v5, Tailwind v4, Vitest + Testing Library, TypeScript 6 strict, pnpm 11.

## Global Constraints

- Package manager is **pnpm** only. Node >= 22.12 (`.nvmrc` = `24`).
- Repo style (prettier): no semicolons, single quotes, no trailing commas, `jsxSingleQuote: true`, `arrowParens: 'avoid'`. Husky pre-commit reformats staged files — accept that.
- Import alias `@/*` → `src/*`. No relative imports across top-level dirs.
- Server-only code (`src/lib/heroes/**`) must NOT be imported from client islands; it reads `import.meta.env.TOKEN` (never expose the token to the client). Islands fetch through `src/pages/api/*` only.
- `TOKEN` is runtime-required; `vi.stubEnv('TOKEN', 'test-token')` in tests. Build needs no env.
- Script names: `dev`, `build`, `test` (watch, interactive — never in CI), `test:ci`, `lint`, `typecheck`, `prettify`.
- Verify after each task: `pnpm run lint`, `pnpm run typecheck`, `pnpm run test:ci` (add a path to run one suite), and `pnpm run build` where stated.
- Commit per task with a concise conventional message (`feat:`, `chore:`, `docs:`, `test:`).
- Do not add code comments beyond what the ported code needs.
- `ui/Spinner`, `ui/LoadingPlaceholder` and the `Comic`/`Character`/Marvel-shape types are deleted in Task 4 only — Task 1–3 must not break them (old files stay until then).
- Known API quirks (verified 2026-08-01): search returns `{response: "success", results: [...]}` or `{response: "error", error: "character with given name not found"}` (HTTP 200 either way); by-id returns the hero object directly with a `response` field; unknown values are `"-"` (strings); powerstats are strings like `"69"`; search `"man"` → 65 results; data is messy (`biography.publisher` may be `"Rune King Thor"`). ids are strings. No filtering — all publishers shown.

---

### Task 1: Hero types + SuperHero API client (`src/lib/heroes/`)

**Files:**

- Modify: `src/types/index.ts` (add `Hero`, `Powerstats`, `Biography`, `Appearance`, `Work`, `Connections` — old types stay until Task 4)
- Create: `src/lib/heroes/constants.ts`, `src/lib/heroes/heroes-client.ts`, `src/lib/heroes/heroes-client.test.ts`

**Interfaces:**

- Consumes: nothing (old `src/lib/marvel/` stays untouched).
- Produces:
  - `PAGE_LIMIT = 10`, `ROOT_SUPERHERO_API_URL = 'https://superheroapi.com/api'` (from `@/lib/heroes/constants`)
  - `fetchCharacters({ query?: string | null, page = 0, limit = PAGE_LIMIT }): Promise<{ results: Hero[]; total: number }>` — empty/whitespace query returns `{ results: [], total: 0 }` WITHOUT fetching; error envelope → same empty result (no throw); success → `results` sliced `[page*limit, page*limit+limit)` and `total` = raw count; network failure throws `SuperHero API error: <status>`.
  - `fetchCharacterById(id: string | number): Promise<Hero | undefined>` — error envelope → `undefined`; network failure throws.
  - `Hero` type (in `@/types`): `{ id?: string; name?: string; powerstats?: Powerstats; biography?: Biography; appearance?: Appearance; work?: Work; connections?: Connections; image?: { url?: string } }` — all sub-fields optional strings (see exact shapes in Step 3).

- [ ] **Step 1: Write the failing tests**

Add to `src/types/index.ts` (append after the existing types):

```ts
export type Powerstats = {
  intelligence?: string
  strength?: string
  speed?: string
  durability?: string
  power?: string
  combat?: string
}
export type Biography = {
  'full-name'?: string
  'alter-egos'?: string
  aliases?: string[]
  'place-of-birth'?: string
  'first-appearance'?: string
  publisher?: string
  alignment?: string
}
export type Appearance = {
  gender?: string
  race?: string
  height?: string[]
  weight?: string[]
  'eye-color'?: string
  'hair-color'?: string
}
export type Work = {
  occupation?: string
  base?: string
}
export type Connections = {
  'group-affiliation'?: string
  relatives?: string
}
export type Hero = {
  id?: string
  name?: string
  powerstats?: Powerstats
  biography?: Biography
  appearance?: Appearance
  work?: Work
  connections?: Connections
  image?: { url?: string }
}
```

Create `src/lib/heroes/constants.ts`:

```ts
export const ROOT_SUPERHERO_API_URL = 'https://superheroapi.com/api'
export const PAGE_LIMIT = 10
```

Create `src/lib/heroes/heroes-client.test.ts`:

```ts
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { fetchCharacterById, fetchCharacters } from './heroes-client'

describe('heroes-client (SuperHero API)', () => {
  const mockFetch = vi.fn()

  beforeEach(() => {
    vi.stubEnv('TOKEN', 'test-token')
    vi.stubGlobal('fetch', mockFetch)
  })

  afterEach(() => {
    vi.unstubAllEnvs()
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
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm run test:ci src/lib/heroes`
Expected: FAIL — module `./heroes-client` not found.

- [ ] **Step 3: Implement the client**

Create `src/lib/heroes/heroes-client.ts`:

```ts
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
  const token = import.meta.env.TOKEN as string
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
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm run test:ci src/lib/heroes`
Expected: PASS (6 tests).

- [ ] **Step 5: Verify lint/typecheck**

Run: `pnpm run lint && pnpm run typecheck`
Expected: clean (old mock code untouched).

- [ ] **Step 6: Commit**

```bash
git add src/types/index.ts src/lib/heroes
git commit -m "feat: add superhero api client with hero types"
```

---

### Task 2: API route + search-driven home page (empty/skeleton/error/no-results states)

**Files:**

- Modify: `src/pages/api/characters.ts`, `src/pages/api/_characters.test.ts`, `src/pages/index.astro`, `src/components/CharactersExplorer/hooks.ts`, `src/components/CharactersExplorer/CharactersExplorer.tsx`, `src/components/CharactersExplorer/CharactersExplorer.test.tsx`, `src/components/CharactersTable/CharactersTable.tsx`, `src/components/CharactersTable/CharactersTable.test.tsx`, `src/components/ui/index.ts`
- Create: `src/components/ui/Skeleton.tsx`

**Interfaces:**

- Consumes: `fetchCharacters` (`@/lib/heroes/heroes-client`), `PAGE_LIMIT` (`@/lib/heroes/constants`), `Hero` (`@/types`), `Skeleton` (`@/components/ui`), `isEmpty` (`@/utils`).
- Produces:
  - `GET /api/characters?q=...&page=1&limit=10` → `{ results: Hero[]; total }` (total = page count, `Math.ceil(rawCount / limit)`), `Cache-Control: public, max-age=60, s-maxage=3600` header, 502 JSON on upstream failure. Empty `q` → `{ results: [], total: 0 }`.
  - `useCharactersExplorer(): { query, page, total, characters, loading, isError, refetch, gotoPage, updateQuery }` — no props; `query` initialized from `?query=`; query key `['characters', query, page]`; `enabled: !isEmpty(query)`; `updateQuery` pushes URL state.
  - `CharactersExplorer` (no props): renders SearchHeader + one of: empty state (query empty), skeleton table (loading), error + Retry (`refetch`), "No characters found" (empty results), or table + pagination.
  - `CharactersTable({ characters: Hero[] | undefined })` — columns Character / Publisher / Alignment (last two `hidden md:table-cell`), avatar src from `image.url` (https-normalized), row click → `/details/<id>`.
  - `Skeleton({ className = '' })` — `<div aria-hidden>` `animate-pulse bg-gray-light` block.

- [ ] **Step 1: Write the failing tests**

Rewrite `src/pages/api/_characters.test.ts`:

```ts
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
```

Rewrite `src/components/CharactersTable/CharactersTable.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { CharactersTable } from './CharactersTable'

describe('CharactersTable', () => {
  it('renders name, publisher and alignment', () => {
    render(
      <CharactersTable
        characters={[
          {
            id: '659',
            name: 'Thor',
            biography: { publisher: 'Marvel Comics', alignment: 'good' },
            image: { url: 'https://example.com/thor.jpg' }
          }
        ]}
      />
    )
    expect(screen.getByText('Thor')).toBeInTheDocument()
    expect(screen.getByText('Publisher')).toBeInTheDocument()
    expect(screen.getByText('Marvel Comics')).toBeInTheDocument()
    expect(screen.getByText('good')).toBeInTheDocument()
  })
})
```

Rewrite `src/components/CharactersExplorer/CharactersExplorer.test.tsx`:

```tsx
import { fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { CharactersExplorer } from './CharactersExplorer'

const mockFetch = vi.fn()

const charactersResponse = {
  ok: true,
  json: async () => ({ results: [{ id: '2', name: 'Hulk' }], total: 1 })
}

const search = (value: string) => {
  fireEvent.change(screen.getByPlaceholderText('Search'), {
    target: { value }
  })
  fireEvent.keyDown(screen.getByPlaceholderText('Search'), { key: 'Enter' })
}

describe('CharactersExplorer', () => {
  beforeEach(() => {
    mockFetch.mockResolvedValue(charactersResponse)
    vi.stubGlobal('fetch', mockFetch)
    window.history.replaceState({}, '', '/')
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('renders the empty state and does not fetch without a query', () => {
    render(<CharactersExplorer />)
    expect(screen.getByText(/search for a character/i)).toBeInTheDocument()
    expect(mockFetch).not.toHaveBeenCalled()
  })

  it('fetches results through the api route when searching', async () => {
    render(<CharactersExplorer />)
    search('hulk')
    await screen.findByText('Hulk')
    expect(mockFetch.mock.calls[0][0]).toContain('/api/characters')
    expect(window.location.search).toContain('query=hulk')
  })

  it('shows a skeleton while loading and replaces it with results', async () => {
    let resolveFetch: (value: unknown) => void = () => {}
    mockFetch.mockImplementation(
      () =>
        new Promise(resolve => {
          resolveFetch = resolve
        })
    )
    render(<CharactersExplorer />)
    search('hulk')
    expect(screen.getByLabelText('loading')).toBeInTheDocument()
    resolveFetch(charactersResponse)
    expect(await screen.findByText('Hulk')).toBeInTheDocument()
  })

  it('shows a no-results message when the search is empty', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ results: [], total: 0 })
    })
    render(<CharactersExplorer />)
    search('zzz')
    expect(await screen.findByText(/no characters found/i)).toBeInTheDocument()
  })

  it('shows an error state with retry when the fetch fails', async () => {
    mockFetch.mockRejectedValue(new Error('boom'))
    render(<CharactersExplorer />)
    search('hulk')
    expect(await screen.findByText(/something went wrong/i)).toBeInTheDocument()
    mockFetch.mockResolvedValue(charactersResponse)
    fireEvent.click(screen.getByRole('button', { name: /retry/i }))
    expect(await screen.findByText('Hulk')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm run test:ci src/pages/api src/components/CharactersExplorer src/components/CharactersTable`
Expected: FAIL — route test mocks an unimported module (`@/lib/heroes/heroes-client`), explorer/table tests break on the new props and columns.

- [ ] **Step 3: Implement the route**

Rewrite `src/pages/api/characters.ts`:

```ts
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
```

- [ ] **Step 4: Implement `Skeleton`**

Create `src/components/ui/Skeleton.tsx`:

```tsx
export const Skeleton = ({ className = '' }: { className?: string }) => (
  <div
    aria-hidden='true'
    className={`animate-pulse bg-gray-light ${className}`}
  />
)
```

Add the export to `src/components/ui/index.ts`:

```ts
export { Skeleton } from './Skeleton'
```

- [ ] **Step 5: Implement the hook**

Rewrite `src/components/CharactersExplorer/hooks.ts`:

```ts
import { useQuery } from '@tanstack/react-query'
import { useCallback, useState } from 'react'
import type { Hero } from '@/types'
import { isEmpty } from '@/utils'

const fetchCharactersPage = async ({
  q,
  page
}: {
  q: string
  page: number
}): Promise<{ results: Hero[]; total: number }> => {
  const url = new URL('/api/characters', window.location.origin)
  url.searchParams.set('q', q)
  url.searchParams.set('page', String(page))
  const response = await fetch(url.toString())
  if (!response.ok)
    throw new Error(`Failed to fetch characters: ${response.status}`)
  return response.json()
}

export const useCharactersExplorer = () => {
  const [query, setQuery] = useState<string>(() =>
    typeof window !== 'undefined'
      ? (new URLSearchParams(window.location.search).get('query') ?? '')
      : ''
  )
  const [page, setPage] = useState<number>(1)

  const { data, isFetching, isError, refetch } = useQuery({
    queryKey: ['characters', query, page],
    queryFn: () => fetchCharactersPage({ q: query, page }),
    enabled: !isEmpty(query)
  })

  const gotoPage = useCallback((nextPage: number) => setPage(nextPage), [])

  const updateQuery = useCallback((value: string) => {
    setQuery(value)
    setPage(1)
    const url = new URL(window.location.href)
    if (isEmpty(value)) url.searchParams.delete('query')
    else url.searchParams.set('query', value)
    window.history.pushState({}, '', url.toString())
  }, [])

  return {
    query,
    page,
    total: data?.total ?? 0,
    characters: data?.results ?? [],
    loading: isFetching,
    isError,
    refetch,
    gotoPage,
    updateQuery
  }
}
```

- [ ] **Step 6: Implement the explorer**

Rewrite `src/components/CharactersExplorer/CharactersExplorer.tsx`:

```tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { isEmpty } from '@/utils'
import { useCharactersExplorer } from './hooks'
import { SearchHeader } from '@/components/SearchHeader'
import { CharactersTable } from '@/components/CharactersTable'
import { Navigation } from '@/components/Navigation'
import { Skeleton, Typography } from '@/components/ui'

const queryClient = new QueryClient()

export const CharactersExplorer = () => (
  <QueryClientProvider client={queryClient}>
    <Explorer />
  </QueryClientProvider>
)

const SkeletonTable = () => (
  <div role='status' aria-label='loading' className='flex flex-col gap-3'>
    {Array.from({ length: 6 }, (_, index) => (
      <Skeleton key={index} className='h-14' />
    ))}
  </div>
)

const Explorer = () => {
  const {
    query,
    page,
    total,
    characters,
    loading,
    isError,
    refetch,
    gotoPage,
    updateQuery
  } = useCharactersExplorer()

  let content
  if (isEmpty(query)) {
    content = (
      <Typography variant='body' className='py-16 text-center text-muted'>
        Search for a character to get started
      </Typography>
    )
  } else if (loading) {
    content = <SkeletonTable />
  } else if (isError) {
    content = (
      <div className='flex flex-col items-center gap-4 py-16'>
        <Typography variant='body'>Something went wrong</Typography>
        <button
          type='button'
          onClick={refetch}
          className='brutal-btn border-[3px] border-ink bg-yellow px-4 py-2 text-sm font-bold uppercase text-ink'
        >
          Retry
        </button>
      </div>
    )
  } else if (characters.length === 0) {
    content = (
      <Typography variant='body' className='py-16 text-center text-muted'>
        No characters found for &quot;{query}&quot;
      </Typography>
    )
  } else {
    content = (
      <>
        <CharactersTable characters={characters} />
        {total > 1 && (
          <Navigation page={page} total={total} onChange={gotoPage} />
        )}
      </>
    )
  }

  return (
    <div className='flex flex-col gap-6'>
      <SearchHeader query={query} updateQuery={updateQuery} />
      {content}
    </div>
  )
}
```

- [ ] **Step 7: Implement the table**

Rewrite `src/components/CharactersTable/CharactersTable.tsx`:

```tsx
import { Avatar, Typography } from '@/components/ui'
import type { Hero } from '@/types'

export const CharactersTable = ({
  characters
}: {
  characters: Hero[] | undefined
}) => {
  const redirectToDetails = (id?: string) => {
    if (id) window.location.assign(`/details/${id}`)
  }

  return (
    <table className='w-full border-collapse bg-surface'>
      <thead>
        <tr className='border-b border-line text-left'>
          <th scope='col' className='px-4 py-3'>
            Character
          </th>
          <th scope='col' className='hidden px-4 py-3 md:table-cell'>
            Publisher
          </th>
          <th scope='col' className='hidden px-4 py-3 md:table-cell'>
            Alignment
          </th>
        </tr>
      </thead>
      <tbody>
        {(characters ?? []).map(({ name, biography, image, id }) => (
          <tr
            key={`${name}-${id}`}
            onClick={() => redirectToDetails(id)}
            className='cursor-pointer border-b border-line last:border-b-0 hover:bg-background'
          >
            <td className='px-4 py-3'>
              <div className='flex items-center gap-6'>
                {image?.url && (
                  <Avatar
                    width={48}
                    height={48}
                    src={image.url.replace(/^http:/, 'https:')}
                    alt={name ?? 'character thumbnail'}
                  />
                )}
                <Typography variant='body' className='font-semibold'>
                  {name}
                </Typography>
              </div>
            </td>
            <td className='hidden px-4 py-3 md:table-cell'>
              {biography?.publisher && biography.publisher !== '-' && (
                <Typography variant='caption' className='block'>
                  {biography.publisher}
                </Typography>
              )}
            </td>
            <td className='hidden px-4 py-3 md:table-cell'>
              {biography?.alignment && biography.alignment !== '-' && (
                <Typography variant='caption' className='block'>
                  {biography.alignment}
                </Typography>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
```

- [ ] **Step 8: Rewire the home page**

Rewrite `src/pages/index.astro`:

```astro
---
import MainLayout from '@/layouts/MainLayout.astro'
import { CharactersExplorer } from '@/components/CharactersExplorer'
import { ErrorBoundary } from '@/components/ErrorBoundary'
---

<MainLayout title='marvel characters'>
  <div class='mx-auto max-w-5xl px-4 py-8'>
    <ErrorBoundary>
      <CharactersExplorer client:load />
    </ErrorBoundary>
  </div>
</MainLayout>
```

- [ ] **Step 9: Run tests to verify they pass**

Run: `pnpm run test:ci src/pages/api src/components/CharactersExplorer src/components/CharactersTable`
Expected: PASS (3 route + 5 explorer + 1 table).

- [ ] **Step 10: Verify lint/typecheck/build**

Run: `pnpm run lint && pnpm run typecheck && pnpm run build`
Expected: clean; build succeeds (still env-free — no build-time API calls).

- [ ] **Step 11: Manual smoke test**

Start `pnpm run dev` (background), then:

- `curl 'http://localhost:4321/api/characters?q=thor&page=1&limit=2'` → 200, JSON with Thor among results, `total` = page count, `Cache-Control` header present.
- `curl 'http://localhost:4321/api/characters'` → 200, `{ results: [], total: 0 }`.
  Kill the dev server.

- [ ] **Step 12: Commit**

```bash
git add src/pages/api src/pages/index.astro src/components/ui src/components/CharactersExplorer src/components/CharactersTable
git commit -m "feat: search characters via superhero api with loading states"
```

---

### Task 3: On-demand details page with full hero profile

**Files:**

- Modify: `src/pages/details/[id].astro` (full rewrite)
- Create: `src/components/PowerStats/PowerStats.astro`, `src/components/PowerStats/PowerStats.test.ts`
- Delete: `src/components/ComicPreview/ComicPreview.astro`, `src/components/ComicPreview/ComicPreview.test.ts`

**Interfaces:**

- Consumes: `fetchCharacterById` (`@/lib/heroes/heroes-client`), `Hero`/`Powerstats` (`@/types`), `PowerStats.astro`.
- Produces: `details/[id].astro` — `prerender = false`, `Astro.rewrite('/404')` when `fetchCharacterById` returns `undefined`, sets `Cache-Control: public, max-age=300, s-maxage=86400, stale-while-revalidate=3600`; `PowerStats({ powerstats })` renders six labeled bars (fill `min(max(0, n), 100)%` for numeric stats, empty track otherwise; `"-"` shown as `-`).

- [ ] **Step 1: Write the failing test**

Create `src/components/PowerStats/PowerStats.test.ts`:

```ts
// @vitest-environment node
import { experimental_AstroContainer as AstroContainer } from 'astro/container'
import { expect, test } from 'vitest'
import PowerStats from './PowerStats.astro'

test('PowerStats renders stat labels, values and bar widths', async () => {
  const container = await AstroContainer.create()
  const view = await container.renderToString(PowerStats, {
    props: {
      powerstats: {
        intelligence: '69',
        strength: '100',
        speed: '-',
        durability: '50'
      }
    }
  })
  expect(view).toContain('Intelligence')
  expect(view).toContain('width:100%')
  expect(view).toContain('width:50%')
  expect(view).toContain('width:0%')
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm run test:ci src/components/PowerStats`
Expected: FAIL — module `./PowerStats.astro` not found.

- [ ] **Step 3: Implement PowerStats**

Create `src/components/PowerStats/PowerStats.astro`:

```astro
---
import type { Powerstats } from '@/types'

const { powerstats = {} } = Astro.props as { powerstats?: Powerstats }

const STATS: { key: keyof Powerstats; label: string }[] = [
  { key: 'intelligence', label: 'Intelligence' },
  { key: 'strength', label: 'Strength' },
  { key: 'speed', label: 'Speed' },
  { key: 'durability', label: 'Durability' },
  { key: 'power', label: 'Power' },
  { key: 'combat', label: 'Combat' }
]
---

<div class='flex flex-col gap-3'>
  {
    STATS.map(({ key, label }) => {
      const raw = powerstats[key]
      const numeric = Number(raw)
      const width =
        Number.isFinite(numeric) && raw !== '-'
          ? Math.max(0, Math.min(100, numeric))
          : 0
      return (
        <div>
          <div class='mb-1 flex justify-between text-xs font-bold uppercase tracking-wider'>
            <span>{label}</span>
            <span>{raw && raw !== '-' ? raw : '-'}</span>
          </div>
          <div class='h-2 border-2 border-ink bg-gray-light'>
            <div class='h-full bg-ink' style={{ width: `${width}%` }} />
          </div>
        </div>
      )
    })
  }
</div>
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm run test:ci src/components/PowerStats`
Expected: PASS.

- [ ] **Step 5: Implement the details page**

Rewrite `src/pages/details/[id].astro`:

```astro
---
import MainLayout from '@/layouts/MainLayout.astro'
import PowerStats from '@/components/PowerStats/PowerStats.astro'
import { fetchCharacterById } from '@/lib/heroes/heroes-client'

export const prerender = false

const { id } = Astro.params
const hero = await fetchCharacterById(id)
if (!hero) return Astro.rewrite('/404')

Astro.response.headers.set(
  'Cache-Control',
  'public, max-age=300, s-maxage=86400, stale-while-revalidate=3600'
)

const imageUrl = hero.image?.url?.replace(/^http:/, 'https:')
const { biography = {}, appearance = {}, work = {}, connections = {} } = hero
const fullName =
  biography['full-name'] && biography['full-name'] !== '-'
    ? biography['full-name']
    : undefined
const aliases = (biography.aliases ?? []).filter(a => a && a !== '-')
const publisher =
  biography.publisher && biography.publisher !== '-'
    ? biography.publisher
    : undefined
const alignment =
  biography.alignment && biography.alignment !== '-'
    ? biography.alignment
    : undefined
const birthPlace =
  biography['place-of-birth'] && biography['place-of-birth'] !== '-'
    ? biography['place-of-birth']
    : undefined
const firstAppearance =
  biography['first-appearance'] && biography['first-appearance'] !== '-'
    ? biography['first-appearance']
    : undefined
const alterEgos =
  biography['alter-egos'] && biography['alter-egos'] !== '-'
    ? biography['alter-egos']
    : undefined
const gender =
  appearance.gender && appearance.gender !== '-' ? appearance.gender : undefined
const race =
  appearance.race && appearance.race !== '-' ? appearance.race : undefined
const height =
  appearance.height?.[1] && appearance.height[1] !== '-'
    ? appearance.height[1]
    : undefined
const weight =
  appearance.weight?.[1] && appearance.weight[1] !== '-'
    ? appearance.weight[1]
    : undefined
const eyeColor =
  appearance['eye-color'] && appearance['eye-color'] !== '-'
    ? appearance['eye-color']
    : undefined
const hairColor =
  appearance['hair-color'] && appearance['hair-color'] !== '-'
    ? appearance['hair-color']
    : undefined
const occupation =
  work.occupation && work.occupation !== '-' ? work.occupation : undefined
const base = work.base && work.base !== '-' ? work.base : undefined
const affiliation =
  connections['group-affiliation'] && connections['group-affiliation'] !== '-'
    ? connections['group-affiliation']
    : undefined
const relatives =
  connections.relatives && connections.relatives !== '-'
    ? connections.relatives
    : undefined

const detailRow = (label: string, value: string | undefined) =>
  value
    ? `<div class='border-b border-line py-2'><dt class='text-xs font-bold uppercase tracking-wider text-muted'>${label}</dt><dd class='mt-1 text-sm'>${value}</dd></div>`
    : ''
---

<MainLayout title={hero.name ?? 'Character'}>
  <div class='mx-auto max-w-5xl px-4 py-8'>
    <div class='grid gap-8 md:grid-cols-12'>
      <section class='md:col-span-4'>
        {
          imageUrl && (
            <img
              src={imageUrl}
              alt={hero.name ?? 'character thumbnail'}
              width={490}
              height={490}
              class='h-auto w-full border-[3px] border-ink'
            />
          )
        }
      </section>
      <section class='md:col-span-8'>
        <h1
          class='border-[3px] border-ink bg-yellow px-4 py-2 text-3xl font-bold uppercase text-ink'
        >
          {hero.name}
        </h1>
        {
          fullName && (
            <p class='mt-2 text-sm font-bold uppercase tracking-wider text-muted'>
              {fullName}
            </p>
          )
        }
        {
          aliases.length > 0 && (
            <p class='mt-1 text-sm'>Also known as: {aliases.join(', ')}</p>
          )
        }
        {
          (publisher || alignment) && (
            <div class='mt-4 flex flex-wrap gap-2'>
              {publisher && (
                <span class='border-2 border-ink bg-surface px-2 py-1 text-xs font-bold uppercase'>
                  {publisher}
                </span>
              )}
              {alignment && (
                <span class='border-2 border-ink bg-surface px-2 py-1 text-xs font-bold uppercase'>
                  {alignment}
                </span>
              )}
            </div>
          )
        }
        <h2 class='mt-8 text-xl font-bold uppercase'>Powerstats</h2>
        <div class='mt-4'>
          <PowerStats powerstats={hero.powerstats ?? {}} />
        </div>
        <h2 class='mt-8 text-xl font-bold uppercase'>Biography</h2>
        <dl
          class='mt-2'
          set:html={detailRow('Full name', fullName) +
            detailRow('Alter egos', alterEgos) +
            detailRow('Place of birth', birthPlace) +
            detailRow('First appearance', firstAppearance) +
            detailRow('Publisher', publisher) +
            detailRow('Alignment', alignment)}
        />
        <h2 class='mt-8 text-xl font-bold uppercase'>Appearance</h2>
        <dl
          class='mt-2'
          set:html={detailRow('Gender', gender) +
            detailRow('Race', race) +
            detailRow('Height', height) +
            detailRow('Weight', weight) +
            detailRow('Eye color', eyeColor) +
            detailRow('Hair color', hairColor)}
        />
        <h2 class='mt-8 text-xl font-bold uppercase'>Work</h2>
        <dl
          class='mt-2'
          set:html={detailRow('Occupation', occupation) +
            detailRow('Base', base)}
        />
        <h2 class='mt-8 text-xl font-bold uppercase'>Connections</h2>
        {
          affiliation && (
            <p class='mt-2 text-[15px] leading-relaxed'>
              <span class='font-bold'>Group affiliation:</span> {affiliation}
            </p>
          )
        }
        {
          relatives && (
            <p class='mt-2 text-[15px] leading-relaxed'>
              <span class='font-bold'>Relatives:</span> {relatives}
            </p>
          )
        }
      </section>
    </div>
  </div>
</MainLayout>
```

- [ ] **Step 6: Delete ComicPreview**

```bash
git rm -r src/components/ComicPreview
```

- [ ] **Step 7: Run tests to verify they pass**

Run: `pnpm run test:ci src/components/PowerStats`
Expected: PASS (1 test). Then run the full suite: `pnpm run test:ci` — expected: all green.

- [ ] **Step 8: Verify lint/typecheck/build**

Run: `pnpm run lint && pnpm run typecheck && pnpm run build`
Expected: clean; build succeeds; no `details/` prerendered HTML in `dist/` (route is on-demand now).

- [ ] **Step 9: Manual smoke test**

Start `pnpm run dev` (background), then:

- `curl -s 'http://localhost:4321/details/659'` → HTML containing `Thor`, `Powerstats`, `Cache-Control` header with `s-maxage=86400`.
- `curl -s 'http://localhost:4321/details/999999'` → 404 page.
  Kill the dev server.

- [ ] **Step 10: Commit**

```bash
git add src/pages/details src/components/PowerStats
git commit -m "feat: render details on-demand with full hero profile"
```

---

### Task 4: Cleanup (mock/Marvel code, docs) + final verification

**Files:**

- Delete: `src/lib/marvel/` (mock-data.ts, marvel-client.ts, constants.ts, both test files), `src/components/ui/Spinner.tsx`, `src/components/ui/LoadingPlaceholder.tsx`, `src/components/ui/LoadingPlaceholder.test.tsx`
- Modify: `src/components/ui/index.ts` (drop Spinner/LoadingPlaceholder exports), `src/types/index.ts` (delete Marvel-shape types), `README.md`, `AGENTS.md`

**Interfaces:**

- Consumes: nothing — everything already imports from `@/lib/heroes` / `@/components/ui` (verified by grep).
- Produces: repo with no mock provider, no comics code, no Marvel-shape types; docs describing the SuperHero API integration.

- [ ] **Step 1: Grep for remaining references**

Run: `rg -n "mock-data|marvel-client|LoadingPlaceholder|Spinner|ComicPreview|fetchCharacterComics|@/lib/marvel|\bCharacter\b|nameStartsWith" src || echo CLEAN`
Expected: only the files listed for deletion below reference them; nothing else.

- [ ] **Step 2: Delete the mock provider and unused primitives**

```bash
git rm -r src/lib/marvel
git rm src/components/ui/Spinner.tsx src/components/ui/LoadingPlaceholder.tsx src/components/ui/LoadingPlaceholder.test.tsx
```

- [ ] **Step 3: Update the ui index**

Rewrite `src/components/ui/index.ts`:

```ts
export { Typography } from './Typography'
export { Avatar } from './Avatar'
export { Skeleton } from './Skeleton'
export { Pagination } from './Pagination'
export { SearchInput } from './SearchInput'
```

- [ ] **Step 4: Trim the types**

Rewrite `src/types/index.ts` (keep only the Hero-shape types added in Task 1):

```ts
export type Powerstats = {
  intelligence?: string
  strength?: string
  speed?: string
  durability?: string
  power?: string
  combat?: string
}
export type Biography = {
  'full-name'?: string
  'alter-egos'?: string
  aliases?: string[]
  'place-of-birth'?: string
  'first-appearance'?: string
  publisher?: string
  alignment?: string
}
export type Appearance = {
  gender?: string
  race?: string
  height?: string[]
  weight?: string[]
  'eye-color'?: string
  'hair-color'?: string
}
export type Work = {
  occupation?: string
  base?: string
}
export type Connections = {
  'group-affiliation'?: string
  relatives?: string
}
export type Hero = {
  id?: string
  name?: string
  powerstats?: Powerstats
  biography?: Biography
  appearance?: Appearance
  work?: Work
  connections?: Connections
  image?: { url?: string }
}
```

- [ ] **Step 5: Update README.md**

Cover (keep existing structure): stack stays the same; **data**: SuperHero API (`superheroapi.com`) — all universes, no comics data, images are superherodb portraits; **setup**: `TOKEN` (32-char SuperHero API key) in `.env` — required at runtime (dev + Cloudflare Pages env var), NOT at build; **commands** unchanged; folder structure: `src/lib/heroes/` (server-only client), `src/components/PowerStats/`; notes: details pages render on-demand and are edge-cached by Cloudflare.

- [ ] **Step 6: Update AGENTS.md**

Update: stack section (server-only data access via `src/lib/heroes/heroes-client.ts` — `fetchCharacters({ query, page, limit })`, `fetchCharacterById`; called from Astro frontmatter and API routes, never from islands; islands fetch through `src/pages/api/*`; `TOKEN` env var = SuperHero API key, runtime-required, server-only, never in client bundles), environment section (drop mock-provider wording, note build needs no env but runtime/on-demand pages and `/api/characters` need `TOKEN` in the Cloudflare Pages env), architecture conventions (details page is on-demand `prerender = false` with `Cache-Control` edge caching; `PowerStats.astro` lives in `src/components/PowerStats/`).

- [ ] **Step 7: Full verification pass**

```bash
pnpm run lint
pnpm run typecheck
pnpm run test:ci
pnpm run build
```

Expected: all green. Then `pnpm run prettify` and re-run `pnpm run lint` + `pnpm run test:ci` to confirm formatting didn't break anything.

- [ ] **Step 8: Preview smoke test**

Start `pnpm run dev` (background), then:

- `curl -s 'http://localhost:4321/'` → home HTML with empty-state copy, no `/api/characters` fetch at build.
- `curl -s 'http://localhost:4321/api/characters?q=spider&page=1&limit=3'` → 200 with results (live API).
- `curl -s 'http://localhost:4321/details/70'` → 200 HTML with a profile (Batman).
  Kill the dev server.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "chore: remove mock provider and marvel types; update docs"
```

---

## Self-Review

- **Spec coverage:** types + client (T1) ✓; route cache header + search-driven home with empty/skeleton/error/no-results states + Publisher/Alignment columns + URL sync (T2) ✓; on-demand details + edge cache + full profile + PowerStats + comics removal (T3) ✓; cleanup + docs + verification (T4) ✓; images use `image.url` (T2 table avatar, T3 hero) ✓; `TOKEN` runtime-required server-only (T1 env read, T2/T3 smoke tests) ✓.
- **Placeholder scan:** no TBD/TODO; every step has concrete code or commands.
- **Type consistency:** `fetchCharacters({ query, page, limit })` and `fetchCharacterById` signatures identical in T1 (client), T2 (route tests + route impl), T3 (details page). `Hero` used in T1 types, T2 hooks/table/tests, T3 details. `Skeleton` created T2 and exported through `ui/index.ts`. `PowerStats` prop name `powerstats` matches the `Hero.powerstats` field. Route `total` is always the page count (T2 route + test agree); client `total` is the raw count (T1 test agrees).
