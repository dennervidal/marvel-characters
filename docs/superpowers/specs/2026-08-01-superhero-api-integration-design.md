# SuperHero API Integration Design

Date: 2026-08-01
Status: Approved

## Context

The app (Astro 7 + React 19 islands + Tailwind v4, Cloudflare adapter) was
migrated off the Marvel API after `gateway.marvel.com` started returning 500
for every endpoint. Data currently comes from a deterministic mock provider
(`src/lib/marvel/mock-data.ts`). A follow-up integration with the **SuperHero
API** (`https://superheroapi.com/api/<TOKEN>/...`) was explicitly planned; the
`TOKEN` env var (32 chars) already exists in `.env` and is reserved for this.

Verified API facts (2026-08-01, live calls):

- Endpoints: `/search/<name>` (substring match, no pagination, no limit
  params) and `/<id>` (full character object). Sub-endpoints
  (`/powerstats`, `/biography`, ...) exist but are unnecessary — `/<id>` and
  search results return the full object.
- Response envelope: `{ "response": "success", ... }` or
  `{ "response": "error", "error": "character with given name not found" }`
  (HTTP 200 even for errors).
- Data: `powerstats` (6 string stats), `biography` (full-name, alter-egos,
  aliases, place-of-birth, first-appearance, publisher, alignment),
  `appearance` (gender, race, height[2], weight[2], eye-color, hair-color),
  `work` (occupation, base), `connections` (group-affiliation, relatives),
  `image.url`. **No comics data.** Data quality is messy (e.g. Thor's
  `biography.publisher` is `"Rune King Thor"`; unknown values are `"-"` or
  `["-", "-"]`).
- Covers all universes (Marvel, DC, ...) — the app now shows everything.
- Search breadth: `"man"` → 65 results (~58 KB); `"spider"` → 12. No
  list-all endpoint exists.
- `superherodb.com` image URLs return HTTP 403 to bots (Cloudflare JS
  challenge, `cf-mitigated: challenge`); real browsers execute the challenge
  and load the images. The akabab/superhero-api dataset on jsDelivr serves the
  same portraits without a challenge (ids map 1:1, e.g. 659 → Thor), usable
  as a fallback if protection tightens.

## Goals

- Replace the mock provider with a live, server-only SuperHero API client
  behind the same data-access seam.
- Keep the home page search-driven UX (empty state → search → paginated
  results), synced to `?query=` in the URL.
- Render details pages on-demand (`prerender = false`) with Cloudflare edge
  caching; show a full character profile (powerstats, biography, appearance,
  work, connections) in place of the removed comics section.
- Keep the build env-free (no build-time API calls); `TOKEN` becomes
  runtime-required and server-only.
- Delete all mock/Marvel-only code (mock-data, ComicPreview, Comic and
  Marvel-shape types) once consumers migrate to the `Hero` type.

## Non-Goals

- No comics data source (the SuperHero API has none; the comics section is
  removed, not replaced with a second API).
- No universe filtering (all publishers shown).
- No caching layer beyond Cloudflare edge caching + TanStack Query defaults
  (no custom Redis/durable-objects cache).
- No image proxying (see Images decision).
- No E2E suite; unit/component tests only.

## Decisions (from Q&A)

1. **Scope**: show all universes; no publisher filter.
2. **Home page**: search-driven with a friendly empty state; no curated
   default list (the API has no list-all endpoint). URL `?query=` sync kept.
3. **Details rendering**: on-demand (`prerender = false`) + Cloudflare edge
   cache via `Cache-Control` response headers.
4. **Details content**: full profile — powerstats bars + biography +
   appearance + work + connections replaces "Comics appearance".
5. **Loading feedback**: skeleton rows (new `Skeleton` primitive) instead of
   the small spinner for the home table.
6. **Images**: use `image.url` directly. The superherodb 403 is a bot-only
   JS challenge that browsers pass. Documented escape hatch: akabab dataset
   via jsDelivr (`api/id/<id>.json` → `images.lg`), ids map 1:1.
7. **Naming**: `src/lib/marvel/` → `src/lib/heroes/` (data is no longer
   Marvel-specific); `marvel-client.ts` → `heroes-client.ts`.
8. **Env**: `TOKEN` runtime-required, read only server-side via
   `import.meta.env.TOKEN`. Build stays env-free; CI unchanged; Cloudflare
   Pages gets `TOKEN` as an env var.

## Architecture

### Data layer (`src/lib/heroes/`)

- `constants.ts`: `PAGE_LIMIT = 10`; `ROOT_SUPERHERO_API_URL =
'https://superheroapi.com/api'`.
- `heroes-client.ts` (server-only; never imported from islands):
  - `fetchCharacters({ query?, page = 0, limit = PAGE_LIMIT }): Promise<{
results: Hero[]; total: number }>`
    - Empty/whitespace query → `{ results: [], total: 0 }` (no list-all
      endpoint).
    - `GET <root>/<TOKEN>/search/<encodeURIComponent(query)>`; token read
      from `import.meta.env.TOKEN`.
    - `response: "error"` → `{ results: [], total: 0 }` (not a throw).
    - Success → slice `results[page*limit, page*limit+limit)`, return
      `{ results: sliced, total: rawCount }` (raw count, 0-based page).
    - Network failure → throw (route converts to 502).
  - `fetchCharacterById(id: string | number): Promise<Hero | undefined>`
    - `GET <root>/<TOKEN>/<id>`; `response: "error"` → `undefined`.
- `src/types/index.ts` gains the `Hero` type (`id?: string`, `name?: string`,
  `powerstats`, `biography`, `appearance`, `work`, `connections`,
  `image: { url?: string }` — all sub-object fields optional, stat values
  `string | undefined` since the API sends strings and `"-"` means unknown).
  Delete `Character`, `Comic`, `ComicList`, `SeriesList`, `StoryList`,
  `EventList`, `Url`, `Image`, and summary types after consumers migrate.

### API route (`src/pages/api/characters.ts`)

- Contract unchanged: `GET /api/characters?q=...&page=1&limit=10` →
  `{ results: Hero[], total }` where `total` is the **page count**
  (`Math.ceil(rawCount / limit)`); 502 JSON on upstream failure; `q` maps to
  `query`.
- Add `Cache-Control: public, max-age=60, s-maxage=3600` so Cloudflare caches
  search responses per-query.

### Home page

- `index.astro`: drop the frontmatter fetch and `initialData`; island owns all
  data.
- `CharactersExplorer` states (driven by TanStack Query):
  - Empty (`query === ''`): prompt copy + icon, no table, no pagination.
  - Loading (first fetch or refetch): skeleton table (5–6 placeholder rows
    matching table layout) via new `Skeleton` primitive.
  - Error (`query.error`): error message + retry button.
  - No results (`data.results.length === 0`): "No characters found for
    '<query>'".
  - Results: `CharactersTable` + `Navigation` (page count from `data.total`).
- `hooks.ts`: `useCharactersExplorer()` (no props) — same TanStack Query
  shape, `query` initialized from `?query=`, `updateQuery` pushes URL state.
- `CharactersTable`: columns **Character** (avatar `image.url` + name),
  **Publisher**, **Alignment** (last two hidden on mobile, `hidden
md:table-cell`). Row click → `/details/<id>`.
- `SearchHeader`, `Navigation`, `Pagination` unchanged.

### Details page (`src/pages/details/[id].astro`)

- `export const prerender = false`; remove `getStaticPaths`.
- Frontmatter: `fetchCharacterById(id)`; `undefined` → `Astro.rewrite('/404')`
  (unchanged pattern).
- Set `Astro.response.headers.set('Cache-Control',
'public, max-age=300, s-maxage=86400, stale-while-revalidate=3600')`.
- Layout (server-rendered, no islands):
  - Hero: portrait (`image.url`, 3px ink border), name banner (yellow, ink
    border), full-name + aliases (comma-joined, skip `"-"`/`"-"` placeholder
    values), publisher/alignment badges.
  - `PowerStats` (`src/components/PowerStats/PowerStats.astro`): six bars —
    intelligence, strength, speed, durability, power, combat. Label + 2px ink
    track; fill width `min(100, stat)%`; non-numeric or `"-"` → empty track.
  - Biography: full-name, alter-egos, place of birth, first appearance,
    publisher, alignment — key/value list.
  - Appearance: gender, race, height (metric value), weight (metric value),
    eye color, hair color.
  - Work: occupation, base.
  - Connections: group affiliation + relatives (prose paragraphs; skip
    `"-"` values).
- Delete `ComicPreview/` and its test.

### Images

- Use `image.url` directly everywhere (home table avatars + details hero).
- Escape hatch (documented, not implemented): resolve via
  `https://cdn.jsdelivr.net/gh/akabab/superhero-api@0.3.0/api/id/<id>.json`
  → `images.lg` if superherodb tightens protection.

### Error handling

- Search: upstream network failure → 502 from route → island error state with
  retry. `response: "error"` (no matches) → empty results → no-results
  message.
- Details: bad/missing id → `/404`. Upstream failure → the on-demand page
  throws → Astro 500 page (acceptable; edge cache mitigates).

### Testing

- `heroes-client.test.ts` (rewrite): mock `globalThis.fetch` + `vi.stubEnv`
  — empty query; success search (slice + raw total); error envelope → empty;
  by-id success/missing; non-ok HTTP → throws.
- `_characters.test.ts` (update): mock the new client; page-count math;
  clamping; 502.
- `PowerStats.test.ts`: Astro container test — renders stat labels + widths.
- Explorer/table tests (update): empty state, no-results message, skeleton
  while loading, error state, Publisher/Alignment columns, URL sync.
- Delete: `mock-data` contract tests, `ComicPreview.test.ts`.

### Cleanup

- Delete: `src/lib/marvel/mock-data.ts`, `src/components/ComicPreview/`,
  `Comic` + Marvel-shape types (after migration), old client tests,
  `ui/Spinner.tsx`, `ui/LoadingPlaceholder.tsx` and their tests (nothing
  references them after the skeleton switch).
- Rename `src/lib/marvel/` → `src/lib/heroes/`; update all imports.
- README/AGENTS: `TOKEN` runtime-required (server-only), heroes client,
  details on-demand + edge cache, no comics section.

## Migration sequence

1. Types + `heroes-client` (with tests) alongside the mock (no consumers yet).
2. API route + home island + table switch to the live client; empty state,
   skeleton, no-results, error state.
3. Details page on-demand + full profile + `PowerStats`; delete comics.
4. Delete mock/ComicPreview/legacy types; docs; full verification.

## Open Questions (resolved)

- Universe filter? → No (all publishers).
- Home default list? → No (empty state).
- Details prerender? → No (on-demand + edge cache).
- Comics replacement? → Full profile (powerstats + biography + appearance +
  work + connections).
- Images? → `image.url` directly; akabab documented as fallback.
