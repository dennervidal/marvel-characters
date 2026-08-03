# Neobrutalist Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Re-skin the marvel-characters app (listing grid, search/filter bar, empty state, detail page, header) with the Neobrutalista design system from `/home/denner/Projetos/figma-code/Neobrutalista design system/` — cream `#F5F0E8` bg, black borders + hard shadows, red `#E8272A`/yellow `#FFE600`, fonts Anton/Barlow Condensed/Space Mono — while preserving all existing logic (URL-state search, redirect to details, server-rendered detail page) and adding Astro View Transitions + `motion` animations.

**Architecture:** Port only the token layer (`theme.css` → Tailwind v4 `@theme` in `global.css`), the fonts, and the 4 real components (card grid, empty state, filter bar, detail styles) — the design system's 42 shadcn/ui components and MUI are unused dead weight, skipped. Filters/counts run server-side: `/api/characters` fetches the full query result set (upstream caps ~65 results), filters by alignment/publisher, paginates, and returns query-level counts per category. Navigation stays full-page redirects but via `<a>` links so the Astro ClientRouter applies View Transitions.

**Tech Stack:** Astro 7 (static + Cloudflare adapter), React 19 islands, TanStack Query v5, Tailwind CSS v4 CSS-first, `motion` (12.x) for entrance/hover animations, `lucide-react` for icons. `@astrojs/view-transitions` is built-in (no dep).

## Global Constraints

- No `class-variance-authority` dep. All variant styling = Tailwind v4 utilities/conditional classes (same pattern as current `ui/Typography.tsx`).
- New deps only: `motion`, `lucide-react` (pnpm). Do not touch other deps.
- UI copy in **English** (design system PT-BR is translated: "NO HEROES FOUND", "CLEAR FILTERS", "HERO BASE").
- Hero cards keep real images (`heroImageUrl` from `@/lib/heroes/hero-image`), fallback to initial letter on error — never hide the card header.
- Keep: URL `?query=` state, `window.history.pushState` pattern; `?filter=` mirrors it; page NOT in URL; TanStack Query `enabled: !isEmpty(query)`; `retry: false`; `prerender = false` + `Astro.rewrite('/404')` + Cache-Control on details; `fetchCharacters`/`fetchCharacterById` server-only (never called from islands); `@/*` imports (no relative imports across top-level dirs); prettier no-semicolon/single-quote style (`.prettierrc.mjs`); husky lint-staged will reformat staged files.
- Component layout convention: `src/components/<Feature>/` with `Feature.tsx`, `hooks.ts`, `index.ts`, colocated `*.test.tsx`.
- Repo colors renamed from old tokens (`ink/yellow/red/surface/line/teal/gray-*`) → new tokens (`background/foreground/primary/secondary/muted/border/card/ring`); every old-class reference in `src/` must be updated (Task 9 sweep).
- Verification commands: `pnpm run test:ci <path>` (one-shot vitest; never `pnpm run test` which is watch mode), `pnpm run lint`, `pnpm run typecheck`, `pnpm run build` (needs no env).

## File map

| File                                                            | Action                                |
| --------------------------------------------------------------- | ------------------------------------- |
| `package.json`                                                  | + `motion`, `lucide-react`            |
| `astro.config.mjs`                                              | add `viewTransitions: true`           |
| `src/styles/global.css`                                         | rewrite tokens/base/utilities         |
| `src/layouts/MainLayout.astro`                                  | fonts swap + `<ViewTransitions />`    |
| `src/components/Appbar/Appbar.astro`                            | black header + dotted pattern         |
| `src/pages/api/characters.ts`                                   | `filter` param + `counts` in response |
| `src/pages/api/_characters.test.ts`                             | update                                |
| `src/components/CharactersExplorer/hooks.ts`                    | `filter` state + URL + `counts`       |
| `src/components/CharactersExplorer/CharactersExplorer.tsx`      | grid + states rework                  |
| `src/components/CharactersExplorer/CharactersExplorer.test.tsx` | update                                |
| `src/components/HeroCard/` (new)                                | card + test + index                   |
| `src/components/EmptyState/` (new)                              | empty state + test + index            |
| `src/components/SearchHeader/SearchHeader.tsx`                  | sticky yellow bar w/ input + clear X  |
| `src/components/SearchHeader/FilterBar.tsx` (new)               | category chips w/ counts              |
| `src/components/ui/SearchInput.tsx`                             | restyle (Space Mono, icons)           |
| `src/components/ui/Pagination.tsx`                              | restyle square buttons                |
| `src/components/ui/Skeleton.tsx`, `ui/Typography.tsx`           | restyle                               |
| `src/components/CharactersTable/`                               | **delete** (component + test)         |
| `src/components/PowerStats/PowerStats.astro`                    | red bars restyle + test               |
| `src/pages/details/[id].astro`                                  | detail restyle w/ letter fallback     |
| `src/pages/404.astro`                                           | token restyle                         |

---

### Task 1: Tokens, fonts, config, shell

**Files:**

- Modify: `package.json`, `astro.config.mjs`, `src/styles/global.css`, `src/layouts/MainLayout.astro`, `src/components/Appbar/Appbar.astro`
- Test: none new (verify via build/lint/typecheck)

- [ ] **Step 1: Install deps and enable View Transitions**

Run: `pnpm add motion lucide-react`

View Transitions in Astro 7: the `viewTransitions: true` config option was **removed** (transitions are opt-in via the router component) and the old `<ViewTransitions />` component was **renamed to `<ClientRouter />`**. Do NOT add `viewTransitions` to `astro.config.mjs` — leave the config untouched and import `{ ClientRouter } from 'astro:transitions'` in the layout head instead (see Step 3).

- [ ] **Step 2: Rewrite `src/styles/global.css`**

Replace the entire file with:

```css
@import 'tailwindcss';

@theme {
  --color-background: #f5f0e8;
  --color-foreground: #0a0a0a;
  --color-card: #ffffff;
  --color-card-foreground: #0a0a0a;
  --color-primary: #e8272a;
  --color-primary-foreground: #ffffff;
  --color-secondary: #ffe600;
  --color-secondary-foreground: #0a0a0a;
  --color-muted: #ede8df;
  --color-muted-foreground: #555555;
  --color-border: #0a0a0a;
  --color-ring: #e8272a;
  --font-display: 'Anton', ui-sans-serif, system-ui, sans-serif;
  --font-body: 'Barlow Condensed', ui-sans-serif, system-ui, sans-serif;
  --font-mono: 'Space Mono', ui-monospace, monospace;
}

@utility shadow-hard {
  box-shadow: 4px 4px 0 0 var(--color-border);
}
@utility shadow-hard-3 {
  box-shadow: 3px 3px 0 0 var(--color-border);
}
@utility shadow-hard-6 {
  box-shadow: 6px 6px 0 0 var(--color-border);
}
@utility shadow-hard-8 {
  box-shadow: 8px 8px 0 0 var(--color-border);
}
@utility shadow-hard-yellow {
  box-shadow: 4px 4px 0 0 var(--color-secondary);
}
@utility shadow-hard-red {
  box-shadow: 4px 4px 0 0 var(--color-primary);
}

@layer base {
  * {
    border-radius: 0;
    border-color: var(--color-border);
  }
  body {
    margin: 0;
    background: var(--color-background);
    color: var(--color-foreground);
    font-family: var(--font-body);
    -webkit-font-smoothing: antialiased;
  }
}

@layer components {
  .brutal-btn {
    transition:
      transform 0.08s ease,
      box-shadow 0.08s ease;
  }
  .brutal-btn:hover:not(:disabled) {
    transform: translate(-2px, -2px);
    box-shadow: 6px 6px 0 0 var(--color-border);
  }
  .brutal-btn:active:not(:disabled) {
    transform: translate(2px, 2px);
    box-shadow: 0 0 0 0 transparent;
  }
  .halftone {
    background-image: radial-gradient(
      circle,
      rgba(0, 0, 0, 0.14) 1px,
      transparent 1px
    );
    background-size: 8px 8px;
  }
  .halftone-light {
    background-image: radial-gradient(
      circle,
      rgba(255, 255, 255, 0.04) 1px,
      transparent 1px
    );
    background-size: 14px 14px;
  }
  .stripes-yellow {
    background-image: repeating-linear-gradient(
      45deg,
      #0a0a0a 0,
      #0a0a0a 2px,
      transparent 0,
      transparent 50%
    );
    background-size: 8px 8px;
  }
  .stripes-red {
    background-image: repeating-linear-gradient(
      -45deg,
      #0a0a0a 0,
      #0a0a0a 2px,
      transparent 0,
      transparent 50%
    );
    background-size: 8px 8px;
  }
}
```

Note: `@utility` is Tailwind v4 CSS-first syntax — utilities are usable as `shadow-hard`, `shadow-hard-yellow`, etc. The `.halftone`/`.stripes-*` classes are plain component classes used in Astro/React markup.

- [ ] **Step 3: Update `src/layouts/MainLayout.astro`**

- Import `<ClientRouter />` from `astro:transitions` and render it in `<head>` (Astro 7 API — replaces the removed `<ViewTransitions />`).
- Replace the two Google Fonts `<link>` blocks (Space Grotesk + PT Sans) with one:

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link
  href="https://fonts.googleapis.com/css2?family=Anton&family=Barlow+Condensed:ital,wght@0,400;0,600;0,700;0,900;1,400&family=Space+Mono:ital,wght@0,400;0,700;1,400&display=swap"
  rel="stylesheet"
/>
```

- Update `<body>` classes to `class='min-h-screen bg-background font-body text-foreground'`.
- `main` padding: `class='pt-24'` (header is taller now).

- [ ] **Step 4: Restyle `src/components/Appbar/Appbar.astro`**

Replace with a neobrutalist black header:

```astro
---
const { title = 'HERO BASE' } = Astro.props
---

<header
  class='halftone-light fixed inset-x-0 top-0 z-10 border-b-4 border-secondary bg-foreground text-white'
>
  <div class='mx-auto flex max-w-7xl items-center justify-between px-6 py-4'>
    <a href='/' class='flex items-center gap-3'>
      <span
        class='grid h-10 w-10 place-items-center border-[3px] border-border bg-primary text-xl text-white'
      >
        ⚡
      </span>
      <span class='leading-none'>
        <span class='block font-display text-2xl uppercase tracking-wide'>
          HERO <span class='text-secondary'>BASE</span>
        </span>
        <span
          class='mt-1 block font-mono text-[0.55rem] uppercase tracking-[0.14em] text-muted-foreground'
        >
          superhero database
        </span>
      </span>
    </a>
    <nav class='hidden gap-1 md:flex'>
      <a
        href='/'
        class='border-2 border-border bg-foreground px-4 py-2 font-mono text-[0.6rem] uppercase tracking-[0.05em] text-secondary'
      >
        characters
      </a>
    </nav>
  </div>
  <div class='h-1 bg-primary'></div>
</header>
```

Keep the existing `Astro.props` interface if the component already accepts props; the current `Appbar.astro` is a fixed header — preserve `fixed` positioning and the `z-index` behavior. Old class references (`bg-surface`, `border-line`, `text-ink`) must not remain anywhere in this file.

- [ ] **Step 5: Verify**

Run: `pnpm run build` — expected: PASS (no env needed)
Run: `pnpm run lint` — expected: PASS
Run: `pnpm run typecheck` — expected: PASS
Manual: `pnpm run dev` — home page shows black/yellow header, cream background, Anton/Barlow/Space Mono fonts loaded, brutal press physics on buttons still work.

- [ ] **Step 6: Commit**

```bash
git add package.json pnpm-lock.yaml astro.config.mjs src/styles/global.css src/layouts/MainLayout.astro src/components/Appbar/Appbar.astro
git commit -m "feat: neobrutalist tokens, fonts and view transitions"
```

---

### Task 2: API route — server-side filters + counts

**Files:**

- Modify: `src/pages/api/characters.ts`
- Test: `src/pages/api/_characters.test.ts`

**Interfaces:**

```ts
export type CharacterFilter =
  'all' | 'heroes' | 'villains' | 'marvel' | 'dc' | 'others'
export type CharacterCounts = {
  heroes: number
  villains: number
  marvel: number
  dc: number
  others: number
}
// GET /api/characters?q=man&page=1&limit=10&filter=heroes →
// { results: Hero[]; total: number; counts: CharacterCounts }
// counts = query-level (computed over the full unfiltered result set, unaffected by `filter`);
// total = Math.ceil(filteredCount / limit) (page count, same contract as before)
```

Mapping (case-sensitive, exact match on the upstream string values):

- `heroes` → `hero.biography?.alignment === 'good'`
- `villains` → `hero.biography?.alignment === 'bad'`
- `marvel` → `hero.biography?.publisher === 'Marvel Comics'`
- `dc` → `hero.biography?.publisher === 'DC Comics'`
- `others` → publisher is not 'Marvel Comics' and not 'DC Comics' (includes `'-'`/`undefined`/missing)
- unknown/absent `filter` value → treated as `all`

- [ ] **Step 1: Write the failing tests**

Replace `src/pages/api/_characters.test.ts` content. The existing file mocks `@/lib/heroes/heroes-client` with `vi.mock` — keep that pattern. Build a fixture of 12 heroes with mixed alignment/publisher, where `fetchCharacters` (mocked) returns `{ results: fixture, total: fixture.length }` (raw total, since the route passes `page: 0, limit: 100`).

```ts
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { GET } from './characters'
import { fetchCharacters } from '@/lib/heroes/heroes-client'
import type { Hero } from '@/types'

vi.mock('@/lib/heroes/heroes-client', () => ({
  fetchCharacters: vi.fn()
}))

const hero = (overrides: Partial<Hero>): Hero => ({
  id: String(Math.random()),
  name: 'Hero',
  biography: { alignment: 'good', publisher: 'Marvel Comics' },
  ...overrides
})

const fixture: Hero[] = [
  hero({
    id: '1',
    name: 'A',
    biography: { alignment: 'good', publisher: 'Marvel Comics' }
  }),
  hero({
    id: '2',
    name: 'B',
    biography: { alignment: 'good', publisher: 'Marvel Comics' }
  }),
  hero({
    id: '3',
    name: 'C',
    biography: { alignment: 'good', publisher: 'DC Comics' }
  }),
  hero({
    id: '4',
    name: 'D',
    biography: { alignment: 'good', publisher: 'Dark Horse Comics' }
  }),
  hero({
    id: '5',
    name: 'E',
    biography: { alignment: 'bad', publisher: 'Marvel Comics' }
  }),
  hero({
    id: '6',
    name: 'F',
    biography: { alignment: 'bad', publisher: 'DC Comics' }
  }),
  hero({
    id: '7',
    name: 'G',
    biography: { alignment: 'bad', publisher: 'DC Comics' }
  }),
  hero({
    id: '8',
    name: 'H',
    biography: { alignment: 'neutral', publisher: '-' }
  }),
  hero({
    id: '9',
    name: 'I',
    biography: { alignment: 'neutral', publisher: undefined }
  })
]

const request = (params: Record<string, string>) =>
  new Request(`http://localhost/api/characters?${new URLSearchParams(params)}`)

describe('GET /api/characters', () => {
  beforeEach(() => {
    vi.mocked(fetchCharacters).mockResolvedValue({
      results: fixture,
      total: fixture.length
    })
  })

  it('returns results, page-count total and query-level counts', async () => {
    const response = await GET({
      request: request({ q: 'a', page: '1', limit: '10' })
    } as never)
    const body = await response.json()
    expect(body.total).toBe(1)
    expect(body.counts).toEqual({
      heroes: 4,
      villains: 3,
      marvel: 3,
      dc: 3,
      others: 3
    })
    expect(body.results).toHaveLength(9)
  })

  it('filters by heroes alignment and paginates', async () => {
    const response = await GET({
      request: request({ q: 'a', page: '1', limit: '2', filter: 'heroes' })
    } as never)
    const body = await response.json()
    expect(body.results).toHaveLength(2)
    expect(
      body.results.every((h: Hero) => h.biography?.alignment === 'good')
    ).toBe(true)
    expect(body.total).toBe(2)
  })

  it('filters by publisher (marvel / dc / others)', async () => {
    const marvel = await GET({
      request: request({ q: 'a', filter: 'marvel' })
    } as never)
    expect(
      (await marvel.json()).results.every(
        (h: Hero) => h.biography?.publisher === 'Marvel Comics'
      )
    ).toBe(true)

    const dc = await GET({
      request: request({ q: 'a', filter: 'dc' })
    } as never)
    expect(
      (await dc.json()).results.every(
        (h: Hero) => h.biography?.publisher === 'DC Comics'
      )
    ).toBe(true)

    const others = await GET({
      request: request({ q: 'a', filter: 'others' })
    } as never)
    const results = (await others.json()).results as Hero[]
    expect(results).toHaveLength(3)
    expect(
      results.every(
        h =>
          h.biography?.publisher !== 'Marvel Comics' &&
          h.biography?.publisher !== 'DC Comics'
      )
    ).toBe(true)
  })

  it('treats unknown filter as all and keeps counts unaffected by the active filter', async () => {
    const unknown = await GET({
      request: request({ q: 'a', filter: 'bogus' })
    } as never)
    expect((await unknown.json()).results).toHaveLength(9)

    const filtered = await GET({
      request: request({ q: 'a', filter: 'villains' })
    } as never)
    expect((await filtered.json()).counts.heroes).toBe(4)
  })
})
```

Note: keep the existing 502 test (upstream failure → `{ error: 'Upstream request failed' }`, status 502) — `vi.mocked(fetchCharacters).mockRejectedValue(...)`.

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm run test:ci src/pages/api/_characters.test.ts`
Expected: FAIL (response shape changed / no counts)

- [ ] **Step 3: Write the minimal implementation**

Rewrite `src/pages/api/characters.ts`:

```ts
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
    const { results, total } = await fetchCharacters({
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
```

Also add the two types to `src/types/index.ts`:

```ts
export type CharacterFilter =
  'all' | 'heroes' | 'villains' | 'marvel' | 'dc' | 'others'
export type CharacterCounts = {
  heroes: number
  villains: number
  marvel: number
  dc: number
  others: number
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm run test:ci src/pages/api/_characters.test.ts`
Expected: PASS (all cases)
Run: `pnpm run lint` — expected: PASS
Run: `pnpm run typecheck` — expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/pages/api/characters.ts src/pages/api/_characters.test.ts src/types/index.ts
git commit -m "feat: server-side filters and counts in /api/characters"
```

---

### Task 3: Explorer hook — filter state + URL

**Files:**

- Modify: `src/components/CharactersExplorer/hooks.ts`
- Test: covered by `CharactersExplorer.test.tsx` in Task 7 (run typecheck now)

**Interfaces produced (consumed by Tasks 6 and 7):**

```ts
type ExplorerState = {
  query: string
  filter: CharacterFilter
  page: number
  total: number
  characters: Hero[]
  counts: CharacterCounts
  loading: boolean
  isError: boolean
  refetch: () => void
  gotoPage: (nextPage: number) => void
  updateQuery: (value: string) => void
  setFilter: (filter: CharacterFilter) => void
}
```

- [ ] **Step 1: Add filter state + URL sync**

In `src/components/CharactersExplorer/hooks.ts`:

- Add `FILTERS` constant (shared with FilterBar in Task 6 — export from this file):

```ts
export const FILTERS: Array<{ key: CharacterFilter; label: string }> = [
  { key: 'all', label: 'ALL' },
  { key: 'heroes', label: 'HEROES' },
  { key: 'villains', label: 'VILLAINS' },
  { key: 'marvel', label: 'MARVEL' },
  { key: 'dc', label: 'DC' },
  { key: 'others', label: 'OTHERS' }
]

const isCharacterFilter = (value: string | null): value is CharacterFilter =>
  FILTERS.some(f => f.key === value)
```

- Lazy-init `filter` from URL: `new URLSearchParams(window.location.search).get('filter')`, validated with `isCharacterFilter`, default `'all'`.
- `setFilter`:

```ts
const setFilter = useCallback((value: CharacterFilter) => {
  setFilterState(value)
  setPage(1)
  const url = new URL(window.location.href)
  if (value === 'all') url.searchParams.delete('filter')
  else url.searchParams.set('filter', value)
  window.history.pushState({}, '', url.toString())
}, [])
```

- `fetchCharactersPage` gains `filter` param: `url.searchParams.set('filter', filter)`.
- Query key becomes `['characters', query, filter, page]`.
- Return `filter`, `counts: data?.counts ?? EMPTY_COUNTS` where `EMPTY_COUNTS = { heroes: 0, villains: 0, marvel: 0, dc: 0, others: 0 }` (define and export in hooks.ts).
- Keep everything else (`updateQuery`, `gotoPage`, `enabled: !isEmpty(query)`) unchanged.

- [ ] **Step 2: Verify**

Run: `pnpm run typecheck` — expected: PASS
Run: `pnpm run lint` — expected: PASS

- [ ] **Step 3: Commit**

```bash
git add src/components/CharactersExplorer/hooks.ts
git commit -m "feat: filter state in explorer hook"
```

---

### Task 4: UI primitives restyle

**Files:**

- Modify: `src/components/ui/SearchInput.tsx`, `src/components/ui/SearchInput.test.tsx`, `src/components/ui/Pagination.tsx`, `src/components/ui/Skeleton.tsx`, `src/components/ui/Typography.tsx`, `src/components/ui/Typography.test.tsx`

- [ ] **Step 1: SearchInput**

Keep the API: `{ defaultValue, onSearch, placeholder, className }`. New markup (design system search input):

```tsx
export const SearchInput = ({
  defaultValue = '',
  onSearch,
  placeholder = 'SEARCH CHARACTERS...',
  className = ''
}: {
  defaultValue?: string
  onSearch: (value: string) => void
  placeholder?: string
  className?: string
}) => {
  const [value, setValue] = useState(defaultValue)
  const submit = () => onSearch(value.trim())
  return (
    <div className={`relative ${className}`}>
      <Search
        size={16}
        className='absolute left-4 top-1/2 -translate-y-1/2 text-foreground'
        aria-hidden
      />
      <input
        value={value}
        onChange={event => setValue(event.target.value)}
        onKeyDown={event => {
          if (event.key === 'Enter') submit()
        }}
        onFocus={event =>
          (event.currentTarget.style.borderColor = 'var(--color-primary)')
        }
        onBlur={event =>
          (event.currentTarget.style.borderColor = 'var(--color-border)')
        }
        placeholder={placeholder}
        className='h-12 w-full border-4 border-border bg-white py-2.5 pl-10 pr-10 font-mono text-xs uppercase tracking-[0.03em] text-foreground shadow-hard outline-none placeholder:text-muted-foreground'
        aria-label={placeholder}
      />
      {value && (
        <button
          type='button'
          onClick={() => {
            setValue('')
            onSearch('')
          }}
          aria-label='Clear search'
          className='absolute right-3 top-1/2 -translate-y-1/2 text-foreground hover:text-primary'
        >
          <X size={16} />
        </button>
      )}
    </div>
  )
}
```

Imports: `useState` from react, `Search`/`X` from `lucide-react`.

Update `SearchInput.test.tsx`: keep the Enter-submit test (still passes — the input is unchanged in behavior). The old second test ("calls onSearch when the search button is clicked", `getByRole('button', { name: /search/i })`) must be replaced — the submit button no longer exists. Replace it with:

```tsx
it('shows a clear button after typing and clears on click', () => {
  const onSearch = vi.fn()
  render(<SearchInput onSearch={onSearch} placeholder='Search' />)
  const input = screen.getByPlaceholderText('Search')
  fireEvent.change(input, { target: { value: 'hulk' } })
  fireEvent.click(screen.getByRole('button', { name: 'Clear search' }))
  expect(onSearch).toHaveBeenCalledWith('')
})
```

- [ ] **Step 2: Pagination**

Restyle buttons to square 40×40: `border-[3px] border-border bg-white font-mono text-sm font-bold shadow-hard-3`, active page `bg-foreground text-secondary shadow-hard-red`. Keep `« ‹ 1 … n › »` behavior, `siblingCount`, `showFirstButton`, `showLastButton`, `hideNextButton`, `hidePrevButton`, `aria-current='page'`, `onChange(page)`. Tests are behavioral — should still pass unchanged.

- [ ] **Step 3: Skeleton + Typography**

`Skeleton`: `animate-pulse bg-muted` instead of `bg-gray-light`.
`Typography` variants: `h1`–`h3` → `font-display font-normal uppercase` (Anton, no bold weight), `subtitle`/`body` → `font-body`, add `mono` variant → `font-mono text-xs uppercase tracking-wider`. Keep the variants map pattern (NO cva). Update `Typography.test.tsx` if it asserts font classes.

- [ ] **Step 4: Verify**

Run: `pnpm run test:ci src/components/ui` — expected: PASS
Run: `pnpm run lint` — expected: PASS
Run: `pnpm run typecheck` — expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/ui
git commit -m "style: restyle ui primitives to neobrutalist"
```

---

### Task 5: HeroCard component

**Files:**

- Create: `src/components/HeroCard/HeroCard.tsx`, `src/components/HeroCard/HeroCard.test.tsx`, `src/components/HeroCard/index.ts`

**Interfaces:**

```tsx
HeroCard({ hero }: { hero: Hero }) // renders <a href={`/details/${hero.id}`}> for View Transitions
```

- [ ] **Step 1: Write the failing test**

```tsx
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { HeroCard } from './HeroCard'
import type { Hero } from '@/types'

const hero: Hero = {
  id: '70',
  name: 'Hulk',
  powerstats: { power: '98' },
  biography: {
    alignment: 'good',
    publisher: 'Marvel Comics',
    'full-name': 'Bruce Banner'
  }
}

describe('HeroCard', () => {
  it('links to the details page', () => {
    render(<HeroCard hero={hero} />)
    expect(screen.getByRole('link')).toHaveAttribute('href', '/details/70')
  })

  it('shows the hero image with the akabab url', () => {
    render(<HeroCard hero={hero} />)
    const image = screen.getByRole('img', { name: 'Hulk portrait' })
    expect(image).toHaveAttribute('src', expect.stringContaining('70-hulk.jpg'))
  })

  it('falls back to the initial letter when the image errors', async () => {
    render(<HeroCard hero={hero} />)
    fireEvent.error(screen.getByRole('img', { name: 'Hulk portrait' }))
    await waitFor(() => expect(screen.getByText('H')).toBeInTheDocument())
    expect(
      screen.queryByRole('img', { name: 'Hulk portrait' })
    ).not.toBeInTheDocument()
  })

  it('renders alignment badge and power level bar', () => {
    render(<HeroCard hero={hero} />)
    expect(screen.getByText('◆ HERO')).toBeInTheDocument()
    expect(screen.getByText('POWER LEVEL')).toBeInTheDocument()
    expect(screen.getByText('98/100')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm run test:ci src/components/HeroCard`
Expected: FAIL (module not found)

- [ ] **Step 3: Write the minimal implementation**

`src/components/HeroCard/HeroCard.tsx`:

```tsx
import { useState } from 'react'
import { motion } from 'motion/react'
import { Zap } from 'lucide-react'
import type { Hero } from '@/types'
import { heroImageUrl } from '@/lib/heroes/hero-image'

const FALLBACK_COLORS = [
  '#e8272a',
  '#ffe600',
  '#14b8a6',
  '#0a0a0a',
  '#4a6fa5',
  '#27ae60'
]

const fallbackColor = (name?: string) => {
  const hash = (name ?? '')
    .split('')
    .reduce((acc, char) => acc + char.charCodeAt(0), 0)
  return FALLBACK_COLORS[hash % FALLBACK_COLORS.length]
}

const initialLetter = (name?: string) =>
  name ? name.charAt(0).toUpperCase() : '?'

export const HeroCard = ({ hero }: { hero: Hero }) => {
  const [imageFailed, setImageFailed] = useState(false)
  const name = hero.name ?? 'Unknown'
  const alignment = hero.biography?.alignment
  const power = hero.powerstats?.power
  const powerValue = Number(power)
  const showPower =
    power !== undefined && power !== '-' && !Number.isNaN(powerValue)

  return (
    <motion.a
      href={`/details/${hero.id}`}
      whileHover={{ x: -4, y: -4, boxShadow: '8px 8px 0 #0a0a0a' }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      className='block cursor-pointer border-4 border-border bg-white shadow-hard overflow-hidden'
    >
      <div className='relative flex aspect-[4/3] items-center justify-center overflow-hidden border-b-4 border-border'>
        {imageFailed ? (
          <div
            className='halftone flex h-full w-full items-center justify-center'
            style={{ backgroundColor: fallbackColor(name) }}
          >
            <span
              className='font-display text-[5.5rem] uppercase leading-none text-white'
              style={{ opacity: 0.85 }}
            >
              {initialLetter(name)}
            </span>
          </div>
        ) : (
          <img
            src={heroImageUrl(hero.id, hero.name)}
            alt={`${name} portrait`}
            onError={() => setImageFailed(true)}
            className='h-full w-full object-cover'
            loading='lazy'
          />
        )}
        <span className='absolute left-2 top-2 bg-foreground px-2 py-0.5 font-mono text-[0.55rem] uppercase tracking-[0.05em] text-secondary'>
          {alignment === 'bad' ? (
            <span className='text-primary'>★ VILLAIN</span>
          ) : (
            '◆ HERO'
          )}
        </span>
        {showPower && (
          <span className='absolute bottom-2 right-2 flex items-center gap-1 bg-black/70 px-1.5 py-0.5 font-mono text-[0.6rem] text-white'>
            <Zap size={9} aria-hidden /> {powerValue}
          </span>
        )}
      </div>
      <div className='border-t-0 p-4'>
        <h3 className='truncate font-display text-xl uppercase leading-tight'>
          {name}
        </h3>
        {hero.biography?.['full-name'] && (
          <p className='mt-0.5 truncate text-sm font-semibold text-muted-foreground'>
            {hero.biography['full-name']}
          </p>
        )}
        <div className='mt-3 flex flex-wrap gap-1.5'>
          {hero.biography?.publisher && hero.biography.publisher !== '-' && (
            <span className='border-2 border-border bg-background px-2 py-0.5 font-mono text-[0.55rem] uppercase tracking-wide'>
              {hero.biography.publisher}
            </span>
          )}
        </div>
        {showPower && (
          <div className='mt-4'>
            <div className='flex items-center justify-between font-mono text-[0.55rem] uppercase tracking-wide text-muted-foreground'>
              <span>POWER LEVEL</span>
              <span>{Math.min(100, Math.max(0, powerValue))}/100</span>
            </div>
            <div className='mt-1 h-3 border-2 border-border bg-white'>
              <div
                className='h-full bg-primary'
                style={{ width: `${Math.min(100, Math.max(0, powerValue))}%` }}
              />
            </div>
          </div>
        )}
        <div className='mt-4 border-t-0'>
          <span className='block bg-foreground px-4 py-2 text-center font-mono text-[0.65rem] uppercase tracking-[0.05em] text-white shadow-hard-yellow'>
            VIEW DETAILS →
          </span>
        </div>
      </div>
    </motion.a>
  )
}
```

`index.ts`: `export { HeroCard } from './HeroCard'`

Note: `heroImageUrl(id, name)` returns `string | undefined` — the test asserts `src` contains `70-hulk.jpg`; if `undefined`, guard with `src={heroImageUrl(hero.id, hero.name) ?? ''}`. `motion.a` supports `href` natively.

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm run test:ci src/components/HeroCard`
Expected: PASS
Run: `pnpm run lint` — expected: PASS (react-hooks rules apply)
Run: `pnpm run typecheck` — expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/HeroCard
git commit -m "feat: hero card with image + initial-letter fallback"
```

---

### Task 6: EmptyState + SearchHeader/FilterBar

**Files:**

- Create: `src/components/EmptyState/EmptyState.tsx`, `src/components/EmptyState/EmptyState.test.tsx`, `src/components/EmptyState/index.ts`
- Create: `src/components/SearchHeader/FilterBar.tsx`
- Modify: `src/components/SearchHeader/SearchHeader.tsx`, `src/components/SearchHeader/SearchHeader.test.tsx`

**Interfaces:**

```tsx
EmptyState({ query, onClear, onSuggestion }: { query: string; onClear: () => void; onSuggestion: (query: string) => void })
FilterBar({ filter, counts, onChange }: { filter: CharacterFilter; counts: CharacterCounts; onChange: (filter: CharacterFilter) => void })
// counts may be undefined → chips render without counts
```

- [ ] **Step 1: Write the failing tests**

`src/components/EmptyState/EmptyState.test.tsx`:

```tsx
import { describe, expect, it, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { EmptyState } from './EmptyState'

describe('EmptyState', () => {
  it('shows the no-heroes title with the query term chip', () => {
    render(
      <EmptyState query='thanos' onClear={vi.fn()} onSuggestion={vi.fn()} />
    )
    expect(screen.getByText('NO HEROES FOUND')).toBeInTheDocument()
    expect(screen.getByText('"thanos"')).toBeInTheDocument()
  })

  it('calls onClear when CLEAR FILTERS is clicked', () => {
    const onClear = vi.fn()
    render(
      <EmptyState query='thanos' onClear={onClear} onSuggestion={vi.fn()} />
    )
    fireEvent.click(screen.getByRole('button', { name: /clear filters/i }))
    expect(onClear).toHaveBeenCalled()
  })

  it('calls onSuggestion with the suggestion query', () => {
    const onSuggestion = vi.fn()
    render(
      <EmptyState query='' onClear={vi.fn()} onSuggestion={onSuggestion} />
    )
    fireEvent.click(screen.getByRole('button', { name: /hulk/i }))
    expect(onSuggestion).toHaveBeenCalledWith('HULK')
  })
})
```

Update `src/components/SearchHeader/SearchHeader.test.tsx` to also render `FilterBar` assertions (counts on chips, active state) — or test FilterBar through SearchHeader props. Give `SearchHeader` props:

```tsx
SearchHeader({ query, updateQuery, filter, counts, onFilterChange }: {
  query: string
  updateQuery: (value: string) => void
  filter: CharacterFilter
  counts?: CharacterCounts
  onFilterChange: (filter: CharacterFilter) => void
})
```

Test: renders the search input with the query value; renders chips HEROES with `(4)` when counts `{ heroes: 4, ... }`; clicking the VILLAINS chip calls `onFilterChange('villains')`.

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm run test:ci src/components/EmptyState src/components/SearchHeader`
Expected: FAIL (components missing / signatures changed)

- [ ] **Step 3: Write the implementation**

`src/components/EmptyState/EmptyState.tsx` (port of the target design system empty state, English copy):

```tsx
import { AlertTriangle, Zap } from 'lucide-react'

const SUGGESTIONS = ['HULK', 'IRON MAN', 'THOR', 'WONDER WOMAN']

export const EmptyState = ({
  query,
  onClear,
  onSuggestion
}: {
  query: string
  onClear: () => void
  onSuggestion: (query: string) => void
}) => (
  <div className='mx-auto w-full max-w-xl border-4 border-border bg-white shadow-hard-8'>
    <div className='stripes-yellow h-3 border-b-4 border-border' />
    <div className='flex flex-col items-center gap-3 px-6 py-10 text-center'>
      <AlertTriangle size={28} className='text-primary' aria-hidden />
      <span className='font-display text-[5rem] leading-none'>0</span>
      <h2 className='font-display text-2xl uppercase'>NO HEROES FOUND</h2>
      <div className='border-2 border-border bg-background px-4 py-3 font-mono text-[0.65rem] uppercase tracking-wide text-muted-foreground'>
        {query ? (
          <>
            YOUR SEARCH FOR{' '}
            <span className='mx-1 border border-border bg-secondary px-1 py-0.5 text-foreground'>
              {query}
            </span>{' '}
            RETURNED 0 RESULTS
          </>
        ) : (
          <>SEARCH THE HERO BASE TO DISCOVER SUPERHUMANS</>
        )}
      </div>
      <button
        type='button'
        onClick={onClear}
        className='mt-2 flex items-center gap-2 border-4 border-border bg-primary px-6 py-2.5 font-mono text-[0.65rem] uppercase tracking-wide text-white shadow-hard transition-colors hover:bg-[#c0392b]'
      >
        <Zap size={12} aria-hidden /> CLEAR FILTERS
      </button>
      {!query && (
        <div className='mt-4'>
          <p className='font-mono text-[0.55rem] uppercase tracking-[0.1em] text-muted-foreground'>
            TRY ONE OF THESE
          </p>
          <div className='mt-2 flex flex-wrap justify-center gap-2'>
            {SUGGESTIONS.map(suggestion => (
              <button
                key={suggestion}
                type='button'
                onClick={() => onSuggestion(suggestion)}
                className='border-2 border-border bg-background px-2.5 py-1 text-sm font-semibold uppercase shadow-hard-3 hover:bg-secondary'
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
    <div className='stripes-red h-3 border-t-4 border-border' />
  </div>
)
```

`src/components/SearchHeader/FilterBar.tsx`:

```tsx
import { FILTERS } from '@/components/CharactersExplorer/hooks'
import type { CharacterCounts, CharacterFilter } from '@/types'

export const FilterBar = ({
  filter,
  counts,
  onChange
}: {
  filter: CharacterFilter
  counts?: CharacterCounts
  onChange: (filter: CharacterFilter) => void
}) => (
  <div className='flex flex-wrap items-center gap-2'>
    {FILTERS.map(({ key, label }) => {
      const active = filter === key
      const count =
        key === 'all' ? undefined : counts?.[key as keyof CharacterCounts]
      return (
        <button
          key={key}
          type='button'
          onClick={() => onChange(key)}
          aria-pressed={active}
          className={`border-[3px] border-border px-3.5 py-1.5 font-mono text-[0.6rem] uppercase tracking-[0.04em] shadow-hard-3 ${
            active
              ? 'bg-foreground text-secondary shadow-hard-red'
              : 'bg-white text-foreground hover:bg-secondary'
          }`}
        >
          {label}
          {count !== undefined && <span className='ml-1'>({count})</span>}
        </button>
      )
    })}
  </div>
)
```

`src/components/SearchHeader/SearchHeader.tsx` — sticky yellow bar:

```tsx
import { SearchInput } from '@/components/ui'
import { FilterBar } from './FilterBar'
import type { CharacterCounts, CharacterFilter } from '@/types'

export const SearchHeader = ({
  query,
  updateQuery,
  filter,
  counts,
  onFilterChange
}: {
  query: string
  updateQuery: (value: string) => void
  filter: CharacterFilter
  counts?: CharacterCounts
  onFilterChange: (filter: CharacterFilter) => void
}) => (
  <div className='sticky top-0 z-40 border-b-4 border-border bg-secondary px-4 py-4'>
    <div className='mx-auto flex max-w-7xl flex-col gap-3'>
      <SearchInput
        defaultValue={query}
        onSearch={updateQuery}
        placeholder='SEARCH CHARACTERS...'
      />
      <FilterBar filter={filter} counts={counts} onChange={onFilterChange} />
    </div>
  </div>
)
```

Note: remove the old `Typography` header from SearchHeader — the yellow bar replaces the old header layout. Update the old SearchHeader test accordingly (it asserted the old markup).

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm run test:ci src/components/EmptyState src/components/SearchHeader`
Expected: PASS
Run: `pnpm run lint`, `pnpm run typecheck` — expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/EmptyState src/components/SearchHeader
git commit -m "feat: neobrutalist empty state and filter bar"
```

---

### Task 7: Explorer integration + grid; remove CharactersTable

**Files:**

- Modify: `src/components/CharactersExplorer/CharactersExplorer.tsx`, `src/components/CharactersExplorer/CharactersExplorer.test.tsx`, `src/components/index.ts`, `src/pages/index.astro`
- Delete: `src/components/CharactersTable/` (CharactersTable.tsx, CharactersTable.test.tsx, index.ts)

- [ ] **Step 1: Update the tests**

In `CharactersExplorer.test.tsx` (which stubs `fetch` globally and returns `{ results, total }` JSON — update mock responses to include `counts`):

- The `search()` helper uses `screen.getByPlaceholderText('Search')` — change to `'SEARCH CHARACTERS...'`.
- Empty state (no query): asserts "SEARCH THE HERO BASE" prompt is visible and no fetch happened (replace `/search for a character/i`).
- Search flow: typing + Enter → fetch URL contains `/api/characters` with `q=hulk` and `page=1`; results render as cards (assert `screen.findByText('Hulk')` still works; card is an `<a>` — `getAllByRole('link')` non-empty).
- No-results: query with zero results → "NO HEROES FOUND".
- Filter click: mock returns counts `{ heroes: 4, villains: 3, marvel: 3, dc: 3, others: 3 }`; click the "VILLAINS" chip (`getByRole('button', { name: /villains/i })`) → fetch called with `filter=villains`; `window.location.search` contains `filter=villains`.
- Error + Retry: unchanged behavior (copy still matches `/something went wrong/i`).
- Loading: skeleton `getByLabelText('loading')` present.

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm run test:ci src/components/CharactersExplorer`
Expected: FAIL

- [ ] **Step 3: Rewrite the Explorer component**

`src/components/CharactersExplorer/CharactersExplorer.tsx`:

```tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AnimatePresence, motion } from 'motion/react'
import { Skeleton } from '@/components/ui'
import { EmptyState } from '@/components/EmptyState'
import { HeroCard } from '@/components/HeroCard'
import { Navigation } from '@/components/Navigation'
import { SearchHeader } from '@/components/SearchHeader'
import { useCharactersExplorer } from './hooks'
import { isEmpty } from '@/utils'

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } }
})

export const CharactersExplorer = () => (
  <QueryClientProvider client={queryClient}>
    <Explorer />
  </QueryClientProvider>
)

const SkeletonGrid = () => (
  <div
    role='status'
    aria-label='loading'
    className='grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
  >
    {Array.from({ length: 8 }, (_, index) => (
      <Skeleton key={index} className='h-72' />
    ))}
  </div>
)

const Explorer = () => {
  const {
    query,
    filter,
    page,
    total,
    characters,
    counts,
    loading,
    isError,
    refetch,
    gotoPage,
    updateQuery,
    setFilter
  } = useCharactersExplorer()

  const clearAll = () => {
    updateQuery('')
    setFilter('all')
  }

  let content
  if (isEmpty(query)) {
    content = (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <EmptyState query='' onClear={clearAll} onSuggestion={updateQuery} />
      </motion.div>
    )
  } else if (loading) {
    content = <SkeletonGrid />
  } else if (isError) {
    content = (
      <div className='flex flex-col items-center gap-4 py-16 text-center'>
        <p className='font-display text-2xl uppercase'>SOMETHING WENT WRONG</p>
        <button
          type='button'
          onClick={() => refetch()}
          className='border-4 border-border bg-primary px-6 py-2.5 font-mono text-[0.65rem] uppercase tracking-wide text-white shadow-hard hover:bg-[#c0392b]'
        >
          RETRY
        </button>
      </div>
    )
  } else if (isEmpty(characters)) {
    content = (
      <EmptyState query={query} onClear={clearAll} onSuggestion={updateQuery} />
    )
  } else {
    content = (
      <>
        <motion.div
          layout
          className='grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
        >
          <AnimatePresence mode='popLayout'>
            {characters.map((hero, index) => (
              <motion.div
                key={hero.id}
                layout
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.94 }}
                transition={{ delay: Math.min(index * 0.035, 0.28) }}
              >
                <HeroCard hero={hero} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
        {total > 1 && (
          <Navigation page={page} total={total} onChange={gotoPage} />
        )}
      </>
    )
  }

  return (
    <div className='flex flex-col gap-6'>
      <SearchHeader
        query={query}
        updateQuery={updateQuery}
        filter={filter}
        counts={counts}
        onFilterChange={setFilter}
      />
      {content}
    </div>
  )
}
```

Notes:

- `Navigation` (src/components/Navigation/Navigation.tsx) already wraps `ui/Pagination` — keep it; it renders the Pagination only when `total > 1` is handled in Explorer as before.
- Update `src/pages/index.astro`: `max-w-5xl` → `max-w-7xl px-4 py-8`.
- Update `src/components/index.ts` barrel: remove `CharactersTable` export, add `HeroCard` and `EmptyState`.
- Delete `src/components/CharactersTable/` directory entirely.
- The SearchInput no longer has a submit button, so the old `search()` helper in tests (change + Enter) stays valid — it used Enter keyDown.

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm run test:ci src/components/CharactersExplorer`
Expected: PASS
Run: `pnpm run lint`, `pnpm run typecheck` — expected: PASS
Run: `pnpm run build` — expected: PASS

- [ ] **Step 5: Commit**

```bash
git add -A src/components/CharactersExplorer src/components/CharactersTable src/components/index.ts src/pages/index.astro
git commit -m "feat: card grid explorer with filters; remove table"
```

---

### Task 8: PowerStats + details page

**Files:**

- Modify: `src/components/PowerStats/PowerStats.astro`, `src/components/PowerStats/PowerStats.test.ts`, `src/pages/details/[id].astro`

- [ ] **Step 1: Verify the existing test still applies**

The current `PowerStats.test.ts` asserts only labels (`'Intelligence'`) and bar widths (`width:100%` / `width:50%` / `width:0%`) — the restyle keeps all of these (labels unchanged, widths computed by the same clamp logic). **No test changes needed**; just make sure it still passes after the restyle.

- [ ] **Step 2: Restyle `PowerStats.astro`**

Replace the bar markup (track + fill) and the label row; keep the `STATS` array, labels, values, and `width` clamp logic unchanged:

```astro
<div
  class='mb-1 flex justify-between font-mono text-[0.55rem] uppercase tracking-wide text-muted-foreground'
>
  <span>{label}</span>
  <span>{raw && raw !== '-' ? raw : '-'}</span>
</div>
<div class='h-3 border-2 border-border bg-white'>
  <div class='h-full bg-primary' style={{ width: `${width}%` }}></div>
</div>
```

- [ ] **Step 3: Restyle `src/pages/details/[id].astro`**

Keep: frontmatter fetch logic, `prerender = false`, `Astro.rewrite('/404')`, Cache-Control headers, `heroImageUrl`, `biographyRows`/`appearanceRows`/`workRows` filtering, section `<dl>` structure. Restyle markup:

- Back link: `<a href='/' class='mb-6 inline-block border-4 border-border bg-white px-4 py-2 font-mono text-[0.65rem] uppercase tracking-wide shadow-hard-3 hover:bg-secondary'>← BACK</a>`
- Portrait block: `border-4 border-border bg-primary p-3 shadow-hard-6` wrapping the image (`aspect-[4/5] w-full object-cover border-[3px] border-border`) with `id='hero-image'`. Add a fallback block `id='hero-fallback'` (hidden by default): giant Anton initial over `bg-primary` with the `.halftone` class. Replace the inline hide-script with one that hides the image and shows the fallback:

```html
<script>
  const image = document.getElementById('hero-image')
  const fallback = document.getElementById('hero-fallback')
  image?.addEventListener('error', () => {
    image.style.display = 'none'
    if (fallback) fallback.style.display = 'flex'
  })
</script>
```

- Name banner: `<h1 class='border-[3px] border-border bg-secondary px-4 py-2 font-display text-3xl uppercase text-foreground'>` + full-name sub-banner (`border-[3px] border-border bg-white px-4 py-2 font-body text-sm font-bold`).
- Publisher/alignment chips: `border-2 border-border bg-background px-2 py-1 font-mono text-[0.55rem] uppercase tracking-wide`.
- Section headings (`h2`): `mt-8 font-display text-xl uppercase` with black swatch: `<span class='mr-2 inline-block h-4 w-1.5 bg-foreground align-middle' />`.
- Section cards (`<dl>`): wrap each in `border-4 border-border bg-white p-4 shadow-hard-6`; rows keep `border-b border-border py-2` → `border-b-2 border-[#e5e5e5] py-2` with mono labels `font-mono text-[0.55rem] uppercase tracking-wide text-muted-foreground` and values `text-sm font-semibold`.
- Give the page main container `transition:name='details'` on the wrapper div (View Transitions page-level named transition, pairs with home).
- Keep `<PowerStats powerstats={hero.powerstats ?? {}} />`.

- [ ] **Step 4: Verify**

Run: `pnpm run test:ci src/components/PowerStats` — expected: PASS
Run: `pnpm run lint`, `pnpm run typecheck` — expected: PASS
Manual `pnpm run dev`: `/details/70` shows red-framed portrait + letter fallback on broken image; missing id rewrites to 404.

- [ ] **Step 5: Commit**

```bash
git add src/components/PowerStats src/pages/details
git commit -m "style: neobrutalist detail page and power stats"
```

---

### Task 9: 404, polish, docs, full verification

**Files:**

- Modify: `src/pages/404.astro`
- Optional: `design/design-tokens.md`

- [ ] **Step 1: Restyle 404**

Token restyle (keep existing PT copy): stripes + Anton display, `border-4 border-border bg-white shadow-hard-8` card, `CLEAR FILTERS`-style link back home.

- [ ] **Step 2: Stale-token sweep**

Run: `rg -n "border-ink|bg-ink|text-ink|bg-yellow|bg-red|bg-teal|bg-surface|border-line|bg-gray-light|bg-gray-dark|text-muted" src/`
Fix any remaining old-token class references to the new tokens. (Intended remaining usages: none.)

- [ ] **Step 3: Full gate**

Run: `pnpm run lint && pnpm run typecheck && pnpm run test:ci && pnpm run build`
Expected: all PASS

- [ ] **Step 4: Manual dev pass**

`pnpm run dev` — verify: search → card grid with entrance stagger; card hover lift; filter chips with counts; "12/65"-style result count; empty states (initial + no-results); pagination; clicking a card → View Transition to details; browser back → home rehydrates with query restored from URL; hard refresh on `/?query=hulk&filter=heroes` works.

- [ ] **Step 5: Commit**

```bash
git add src/pages/404.astro
git commit -m "chore: restyle 404 and final polish"
```

---

## Self-Review

1. **Spec coverage:** reuse styles ✓ (Task 1); only needed deps ✓ (Task 1: motion + lucide-react only); redirection listing→details preserved ✓ (Task 5/7 `<a>` links, Task 8 back link); URL-state search preserved ✓ (Task 3, hooks unchanged `updateQuery`); `?filter=` mirrors it ✓; transitions ✓ (viewTransitions Task 1, motion Tasks 5/7, detail `transition:name` Task 8); header filters + counts ✓ (Tasks 2/6/7); initial state still empty but component copied from target style ✓ (Task 6 EmptyState); cards keep hero image with initial-letter fallback ✓ (Task 5, user requirement); cva → Tailwind variants ✓ (Task 4 note, no cva dep).
2. **Placeholder scan:** no TBD/TODO; every step has concrete code or commands.
3. **Type consistency:** `CharacterFilter`/`CharacterCounts` defined in Task 2 (`src/types/index.ts`), consumed identically in Tasks 3/6/7; `useCharactersExplorer` return shape defined Task 3, used Task 7; `SearchHeader` props defined Task 6, used Task 7.
