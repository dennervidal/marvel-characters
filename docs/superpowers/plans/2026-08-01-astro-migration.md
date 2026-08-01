# Marvel Characters — Astro Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate the Next.js 12 / MUI v4 / styled-components app to Astro 6 + React 19 islands + Tailwind v4 custom design system, on the Cloudflare adapter with Vitest, ESLint 10 flat config, Prettier 3, TypeScript latest, Node 24 LTS.

**Architecture:** Astro `static` output (Astro 5+ merged `hybrid` into `static`: pages/endpoints default to prerendered; per-route `export const prerender = false` opts into on-demand rendering with the Cloudflare adapter) with a single React island (`CharactersExplorer`, TanStack Query v5) on the home page; all data access through the `src/lib/marvel/` client seam (server-only); details pages prerendered via `getStaticPaths` with on-demand fallback. Design tokens in `src/styles/global.css` (`@theme`), UI primitives in `src/components/ui/`.

> **REVISION (2026-08-01): the Marvel API is dead.** Verified: `gateway.marvel.com` returns `500 {"message":"Internal server error"}` for every endpoint, even unauthenticated. Tasks 2–3 were executed against Marvel before this was discovered. **Task 3R replaces the client with a deterministic mock provider** (same exported interface, no network) so Tasks 5–8 build and deploy fully. A follow-up plan (new session, new plan doc) will integrate the **SuperHero API** (`https://superheroapi.com/api/<TOKEN>/...`, token in path — `TOKEN` is already in `.env`; endpoints: `/search/name` (no pagination, no limit params), `/id` (+ `/powerstats`, `/biography`, `/appearance`, `/work`, `/connections`, `/image`); data includes powerstats/group-affiliation/full-name but **no comics data** — the COMIC APPEARANCES UI section must be redesigned; images are superherodb portraits; responses are `{response: "success", ...}`; note the API answers 302 on the bare URL and follows to the real one).

**Tech Stack:** astro latest (resolves 7.x — `hybrid` merged into `static`), @astrojs/cloudflare (14.x), @astrojs/react, react ^19, @tanstack/react-query ^5, tailwindcss ^4 + @tailwindcss/vite, vitest (getViteConfig two-arg form with `configFile: false` — see Task 1 Step 5), eslint ^10 flat config, prettier ^3 + prettier-plugin-astro, typescript ^6.0.3 pinned (7.x breaks `astro check` peer and typescript-eslint), husky 9 + lint-staged 16, pnpm, Node 24.

## Global Constraints

- Node 24 LTS (`.nvmrc` = `24`); engines `>=22.12.0`. Package manager is **pnpm** only — never add package-lock/yarn.lock.
- Repo style (prettier): no semicolons, single quotes, no trailing commas, `jsxSingleQuote: true`, `arrowParens: 'avoid'`.
- Import alias `@/*` → `src/*`. No relative imports across top-level dirs.
- Server-only code (`src/lib/marvel/**`) must NOT import `node:*` modules (workerd compat): use `globalThis.fetch`, `crypto.randomUUID()`. Never import server-only modules from client islands. (The MD5 signing code was removed in Task 3R — the mock needs no crypto.)
- Keep script names `dev`, `build`, `test` (watch), `test:ci` (one-shot), `lint`, `prettify`, `typecheck`.
- Env: **no required variables** after Task 3R — the mock provider needs nothing. `TOKEN` in `.env` is reserved for the future SuperHero API integration (never reference it from client code). `.env` is gitignored; never commit keys.
- Verify after each task: `pnpm run lint`, `pnpm run typecheck`, `pnpm run test:ci`, and `pnpm run build` where stated. Build works without any `.env` (mock provider).
- Commit per task with a concise conventional message (repo style: `feat:`, `chore:`, `test:`). Pre-commit hooks (husky + lint-staged) will reformat staged files; expect and accept that.
- Do not add code comments beyond what the ported code needs.

---

### Task 0: Prerequisites (user, not agent)

- [ ] User creates `.env` from `.env.example` with both Marvel keys (needed from Task 2 onwards for builds; builds fail without them). ✅ done — `.env` exists. NOTE: superseded by the Marvel-API-is-dead revision — the mock provider (Task 3R) needs NO env vars; the Marvel keys in `.env` are now unused and can stay or be removed. `TOKEN=` (SuperHero API, 32 chars) was user-added and is reserved for the follow-up plan.
- [ ] User drops design materials (screenshots, CSS tokens, component examples) into `design/` (needed for Task 4). ✅ done — 7 screenshots in `design/`; tokens extracted to `design/design-tokens.md` (Gemini 3.6 Flash vision).
- [ ] ~~User updates GitHub repo secrets: rename `NEXT_PUBLIC_API_PUBLIC_KEY` → `PUBLIC_MARVEL_API_KEY`~~ — CANCELLED: no Marvel secrets are needed anymore (mock provider, Task 3R also drops the secrets block from the CI workflow).

---

### Task 1: Toolchain scaffold (deps, configs, layouts, CI)

**Files:**

- Modify: `package.json` (rewrite deps/scripts/engines/type), `pnpm-lock.yaml` (via install), `.gitignore`, `.prettierignore`
- Create: `astro.config.mjs`, `tsconfig.json`, `src/env.d.ts`, `.nvmrc`, `.env.example`, `src/styles/global.css`, `src/layouts/MainLayout.astro`, `src/pages/index.astro`, `src/pages/404.astro`, `vitest.config.ts`, `src/test/setup.ts`, `eslint.config.mjs`, `.prettierrc.mjs`, `lint-staged.config.mjs`, `.husky/pre-commit`, `.github/workflows/ci.yml`
- Delete: `next.config.js`, `next-env.d.ts`, `jest.config.js`, `jest.setup.js`, `.eslintrc`, `.eslintignore`, `.husky/_` legacy files, `public/index.html`, and all of `src/pages/`, `src/context/`, `src/service/`, `src/styles/`, `src/components/` (old MUI/styled code — the git history keeps it), `src/hooks/`, `src/utils/theme.ts`

**Interfaces:**

- Produces: `src/styles/global.css` (with `@theme` placeholder tokens), `src/layouts/MainLayout.astro` (named export `MainLayout`, props `{ title?: string }`), `vitest.config.ts` (getViteConfig two-arg form — `{ output: 'static', configFile: false }` — see Step 5 for the final shape), `eslint.config.mjs`, `.prettierrc.mjs`, empty-ish `src/pages/index.astro` + `src/pages/404.astro`, CI workflow.

- [ ] **Step 1: Rewrite `package.json`**

```json
{
  "name": "marvel-characters",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "engines": { "node": ">=22.12.0" },
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "test": "vitest",
    "test:ci": "vitest run",
    "lint": "eslint .",
    "typecheck": "astro check",
    "prettify": "prettier --write .",
    "format:check": "prettier --check .",
    "prepare": "husky"
  },
  "dependencies": {
    "@astrojs/cloudflare": "latest",
    "@astrojs/react": "latest",
    "@tanstack/react-query": "^5",
    "astro": "latest",
    "react": "^19",
    "react-dom": "^19",
    "tailwindcss": "^4",
    "@tailwindcss/vite": "^4"
  },
  "devDependencies": {
    "@astrojs/check": "latest",
    "@testing-library/jest-dom": "latest",
    "@testing-library/react": "latest",
    "@testing-library/user-event": "latest",
    "@types/node": "^24",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "eslint": "^10",
    "eslint-config-prettier": "latest",
    "eslint-plugin-astro": "^3",
    "eslint-plugin-jsx-a11y": "latest",
    "eslint-plugin-react-hooks": "latest",
    "eslint-plugin-testing-library": "latest",
    "husky": "^9",
    "jsdom": "latest",
    "lint-staged": "latest",
    "prettier": "^3",
    "prettier-plugin-astro": "latest",
    "typescript": "^6.0.3",
    "typescript-eslint": "latest",
    "vitest": "latest"
  }
}
```

- [ ] **Step 2: Install and create base configs**

```bash
pnpm install
```

`astro.config.mjs`:

```js
// @ts-check
import { defineConfig } from 'astro/config'
import react from '@astrojs/react'
import cloudflare from '@astrojs/cloudflare'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  output: 'static',
  adapter: cloudflare(),
  integrations: [react()],
  vite: {
    plugins: [tailwindcss()]
  }
})
```

`tsconfig.json`:

```json
{
  "extends": "astro/tsconfigs/strict",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": { "@/*": ["src/*"] }
  }
}
```

`src/env.d.ts`:

```ts
/// <reference types="astro/client" />
```

`.nvmrc` → `24`

`.env.example`:

```
PUBLIC_MARVEL_API_KEY=
MARVEL_PRIVATE_KEY=
```

`.gitignore` — keep existing entries, add:

```
dist/
.astro/
.wrangler/
```

`.prettierignore` — replace contents with:

```
node_modules
dist
.astro
pnpm-lock.yaml
public
design
```

- [ ] **Step 3: Tailwind + design tokens**

`src/styles/global.css` (token values extracted from `design/design-tokens.md`; Task 4 verifies them):

```css
@import 'tailwindcss';

@theme {
  --color-background: #ffffff;
  --color-surface: #ffffff;
  --color-ink: #000000;
  --color-line: #000000;
  --color-red: #ff2d2d;
  --color-yellow: #ffe600;
  --color-teal: #14b8a6;
  --color-gray-light: #e5e7eb;
  --color-gray-dark: #1e293b;
  --color-muted: #6b7280;
  --font-sans: 'Space Grotesk', ui-sans-serif, system-ui, sans-serif;
}

@layer components {
  .brutal-btn {
    box-shadow: 4px 4px 0 0 #000;
    transition:
      transform 0.08s ease,
      box-shadow 0.08s ease;
  }
  .brutal-btn:hover:not(:disabled) {
    transform: translate(-2px, -2px);
    box-shadow: 6px 6px 0 0 #000;
  }
  .brutal-btn:active:not(:disabled) {
    transform: translate(2px, 2px);
    box-shadow: 0 0 0 0 #000;
  }
}

body {
  margin: 0;
  font-family: var(--font-sans);
  -webkit-font-smoothing: antialiased;
}
```

- [ ] **Step 4: Layout + placeholder pages**

`src/layouts/MainLayout.astro` (skeleton — Appbar lands in Task 7):

```astro
---
import '@/styles/global.css'

interface Props {
  title?: string
}
const { title = 'marvel characters' } = Astro.props
---

<!doctype html>
<html lang='en'>
  <head>
    <meta charset='utf-8' />
    <meta name='viewport' content='width=device-width, initial-scale=1' />
    <title>{title}</title>
    <meta name='description' content='marvel characters database' />
    <link rel='icon' type='image/png' sizes='32x32' href='/favicon.png' />
    <link rel='manifest' href='/manifest.json' />
    <link rel='preconnect' href='https://fonts.googleapis.com' />
    <link rel='preconnect' href='https://fonts.gstatic.com' crossorigin />
    <link
      href='https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&display=swap'
      rel='stylesheet'
    />
    <link rel='preconnect' href='https://fonts.googleapis.com' />
    <link rel='preconnect' href='https://fonts.gstatic.com' crossorigin />
    <link
      href='https://fonts.googleapis.com/css2?family=PT+Sans&family=PT+Sans+Caption&display=swap'
      rel='stylesheet'
    />
  </head>
  <body class='min-h-screen bg-background font-sans text-ink'>
    <slot />
  </body>
</html>
```

`src/pages/index.astro`:

```astro
---
import MainLayout from '@/layouts/MainLayout.astro'
---

<MainLayout title='marvel characters'>
  <main class='mx-auto max-w-5xl px-4 py-8'>Home</main>
</MainLayout>
```

`src/pages/404.astro`:

```astro
---
import MainLayout from '@/layouts/MainLayout.astro'
---

<MainLayout title='Not found'>
  <main class='mx-auto max-w-5xl px-4 py-8 text-center'>
    <h1 class='text-6xl font-bold'>404</h1>
    <p class='mt-4'>Ainda nada aqui, :(</p>
    <a href='/' class='mt-6 inline-block underline'>Volte aqui</a>
  </main>
</MainLayout>
```

- [ ] **Step 5: Vitest**

`vitest.config.ts` (FINAL working shape — resolved during Task 6; must transform `.astro` files AND avoid the cloudflare adapter plugins in the worker):

```ts
/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react'
import { getViteConfig } from 'astro/config'
import { fileURLToPath } from 'node:url'

export default getViteConfig(
  {
    plugins: [react()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      }
    },
    test: {
      environment: 'jsdom',
      setupFiles: ['./src/test/setup.ts'],
      include: ['src/**/*.test.{ts,tsx}']
    }
  },
  {
    output: 'static',
    configFile: false
  }
)
```

History: Task 1 first tried standalone `defineConfig` (plain `getViteConfig` crashed with `ReferenceError: module is not defined` because it inherited the cloudflare adapter's plugins; standalone `defineConfig` worked for plain TS/TSX). Task 6 needed `.astro` file transforms for the ComicPreview container test, which requires `getViteConfig` — the two-arg form with `{ output: 'static', configFile: false }` is the shape that does both. Do not revert to either of the earlier forms.

`src/test/setup.ts`:

```ts
import '@testing-library/jest-dom/vitest'
```

- [ ] **Step 6: First test (verifies the vitest pipeline)**

Create `src/utils/index.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { isEmpty } from './index'

describe('isEmpty', () => {
  it('returns true for undefined, null and empty string', () => {
    expect(isEmpty(undefined)).toBe(true)
    expect(isEmpty(null)).toBe(true)
    expect(isEmpty('')).toBe(true)
  })

  it('returns false for a non-empty string', () => {
    expect(isEmpty('thor')).toBe(false)
  })
})
```

Update `src/utils/index.ts` to drop the theme import:

```ts
export const isEmpty = (value: string | undefined | null): boolean =>
  value === undefined || value === null || value === ''
```

- [ ] **Step 7: ESLint flat config**

`eslint.config.mjs`:

```js
// @ts-check
import eslintPluginAstro from 'eslint-plugin-astro'
import tseslint from 'typescript-eslint'
import reactHooks from 'eslint-plugin-react-hooks'
import jsxA11y from 'eslint-plugin-jsx-a11y'
import testingLibrary from 'eslint-plugin-testing-library'
import prettierConfig from 'eslint-config-prettier'

export default tseslint.config(
  {
    ignores: [
      'dist/**',
      '.astro/**',
      'node_modules/**',
      'public/**',
      'design/**'
    ]
  },
  {
    files: ['**/*.{ts,tsx}'],
    extends: tseslint.configs.recommended,
    plugins: { 'react-hooks': reactHooks },
    rules: {
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn'
    }
  },
  {
    files: ['**/*.test.{ts,tsx}', '**/__tests__/**/*.{ts,tsx}'],
    extends: [testingLibrary.configs['flat/react']]
  },
  ...eslintPluginAstro.configs.recommended,
  jsxA11y.flatConfigs.recommended,
  prettierConfig
)
```

Note: if `testingLibrary.configs['flat/react']` is unavailable in the installed major, use `eslint-plugin-testing-library`'s documented flat entry for that version (check its README at install time).

- [ ] **Step 8: Prettier + lint-staged + husky**

`.prettierrc.mjs`:

```js
// @ts-check
/** @type {import('prettier').Config} */
export default {
  semi: false,
  singleQuote: true,
  trailingComma: 'none',
  tabWidth: 2,
  jsxSingleQuote: true,
  bracketSpacing: true,
  arrowParens: 'avoid',
  plugins: ['prettier-plugin-astro'],
  overrides: [
    {
      files: '*.astro',
      options: { parser: 'astro' }
    }
  ]
}
```

`lint-staged.config.mjs`:

```js
export default {
  'src/**/*.{ts,tsx,astro}': ['eslint --fix', 'prettier --write'],
  '*.{json,css,md,mjs}': ['prettier --write']
}
```

`.husky/pre-commit` (replace old hook file):

```sh
pnpm exec lint-staged
```

- [ ] **Step 9: CI**

`.github/workflows/ci.yml` (replaces the 3-job setup; single job is simpler for this app):

```yaml
name: ci

on: push

jobs:
  ci:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with:
          version: latest
      - uses: actions/setup-node@v4
        with:
          node-version: '24'
          cache: pnpm
      - run: pnpm install
      - run: pnpm run lint
      - run: pnpm run typecheck
      - run: pnpm run test:ci
      - name: build
        env:
          PUBLIC_MARVEL_API_KEY: ${{ secrets.PUBLIC_MARVEL_API_KEY }}
          MARVEL_PRIVATE_KEY: ${{ secrets.MARVEL_PRIVATE_KEY }}
        run: pnpm run build
```

- [ ] **Step 10: Verify**

Run: `pnpm run lint` → expected: clean (no errors).
Run: `pnpm run typecheck` → expected: no errors.
Run: `pnpm run test:ci` → expected: 2 passing tests (isEmpty).
Run: `pnpm run build` → expected: build succeeds, `dist/` produced. If `.env` is missing, ask the user for the keys before continuing.

- [ ] **Step 11: Commit**

```bash
git add -A
git commit -m "chore: scaffold astro 6 + tailwind v4 + vitest toolchain"
```

---

### Task 2: Server-only service layer (Web Crypto signing + Marvel client)

**Files:**

- Create: `src/lib/marvel/constants.ts`, `src/lib/marvel/signing.ts`, `src/lib/marvel/marvel-client.ts`, `src/lib/marvel/signing.test.ts`, `src/lib/marvel/marvel-client.test.ts`

**Interfaces:**

- Consumes: `src/utils/index.ts` (unchanged), env vars via `import.meta.env`.
- Produces:
  - `ROOT_MARVEL_API_URL: string`, `PAGE_LIMIT = 10`
  - `buildSignedUrl({ path, params }: { path: string; params?: Record<string, string | number> }): Promise<string>`
  - `fetchCharacters({ nameStartsWith?, page?, limit? }): Promise<{ results: Character[]; total: number }>` (page is 0-based; `total` is the raw Marvel count)
  - `fetchCharacterById(id: string | number): Promise<Character | undefined>`
  - `fetchCharacterComics(id: string | number): Promise<Comic[]>`

- [ ] **Step 1: Write the failing tests**

`src/lib/marvel/signing.test.ts`:

```ts
import { createHash } from 'node:crypto'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { buildSignedUrl } from './signing'

const PUBLIC_KEY = 'public-key-123'
const PRIVATE_KEY = 'private-key-456'

describe('buildSignedUrl', () => {
  beforeEach(() => {
    vi.stubEnv('PUBLIC_MARVEL_API_KEY', PUBLIC_KEY)
    vi.stubEnv('MARVEL_PRIVATE_KEY', PRIVATE_KEY)
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    vi.restoreAllMocks()
  })

  it('builds a URL with apikey, ts and a correct md5 hash', async () => {
    const url = new URL(
      await buildSignedUrl({
        path: '/characters',
        params: { limit: 10, offset: 0 }
      })
    )
    expect(url.origin + url.pathname).toBe(
      'https://gateway.marvel.com/v1/public/characters'
    )
    expect(url.searchParams.get('apikey')).toBe(PUBLIC_KEY)
    expect(url.searchParams.get('limit')).toBe('10')
    expect(url.searchParams.get('offset')).toBe('0')
    const ts = url.searchParams.get('ts')
    expect(ts).toBeTruthy()
    const expectedHash = createHash('md5')
      .update(`${ts}${PRIVATE_KEY}${PUBLIC_KEY}`)
      .digest('hex')
    expect(url.searchParams.get('hash')).toBe(expectedHash)
  })

  it('omits params when none are passed', async () => {
    const url = new URL(await buildSignedUrl({ path: '/characters' }))
    expect(url.searchParams.get('apikey')).toBe(PUBLIC_KEY)
    expect(url.searchParams.has('limit')).toBe(false)
  })
})
```

`src/lib/marvel/marvel-client.test.ts`:

```ts
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  fetchCharacterById,
  fetchCharacterComics,
  fetchCharacters
} from './marvel-client'

describe('marvel-client', () => {
  const mockFetch = vi.fn()

  beforeEach(() => {
    vi.stubEnv('PUBLIC_MARVEL_API_KEY', 'public-key-123')
    vi.stubEnv('MARVEL_PRIVATE_KEY', 'private-key-456')
    vi.stubGlobal('fetch', mockFetch)
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    vi.unstubAllGlobals()
  })

  it('returns results and total', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        data: { results: [{ id: 1, name: 'Thor' }], total: 100 }
      })
    })
    const { results, total } = await fetchCharacters({ page: 0, limit: 10 })
    expect(results[0].name).toBe('Thor')
    expect(total).toBe(100)
    expect(mockFetch.mock.calls[0][0]).toContain('/characters?')
    expect(mockFetch.mock.calls[0][0]).toContain('offset=0')
  })

  it('adds nameStartsWith when provided', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ data: { results: [], total: 0 } })
    })
    await fetchCharacters({ nameStartsWith: 'Th', page: 2, limit: 10 })
    expect(mockFetch.mock.calls[0][0]).toContain('nameStartsWith=Th')
    expect(mockFetch.mock.calls[0][0]).toContain('offset=20')
  })

  it('throws on non-ok responses', async () => {
    mockFetch.mockResolvedValue({ ok: false, status: 429 })
    await expect(fetchCharacters({})).rejects.toThrow('Marvel API error: 429')
  })

  it('returns the first character for fetchCharacterById', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ data: { results: [{ id: 1, name: 'Thor' }] } })
    })
    const character = await fetchCharacterById(1)
    expect(character?.name).toBe('Thor')
  })

  it('returns comics list for fetchCharacterComics', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ data: { results: [{ id: 9, title: 'Thor #1' }] } })
    })
    const comics = await fetchCharacterComics(1)
    expect(comics[0].title).toBe('Thor #1')
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm run test:ci src/lib/marvel`
Expected: FAIL — `Cannot find module './signing'`.

- [ ] **Step 3: Implement the service layer**

`src/lib/marvel/constants.ts`:

```ts
export const ROOT_MARVEL_API_URL = 'https://gateway.marvel.com/v1/public'
export const PAGE_LIMIT = 10
```

`src/lib/marvel/signing.ts` (server-only — never import from client islands):

```ts
import { ROOT_MARVEL_API_URL } from './constants'

const md5 = async (input: string): Promise<string> => {
  const data = new TextEncoder().encode(input)
  const digest = await crypto.subtle.digest('MD5', data)
  return Array.from(new Uint8Array(digest))
    .map(byte => byte.toString(16).padStart(2, '0'))
    .join('')
}

export const buildSignedUrl = async ({
  path,
  params = {}
}: {
  path: string
  params?: Record<string, string | number>
}): Promise<string> => {
  const ts = crypto.randomUUID()
  const publicKey = import.meta.env.PUBLIC_MARVEL_API_KEY as string
  const privateKey = import.meta.env.MARVEL_PRIVATE_KEY as string
  const hash = await md5(`${ts}${privateKey}${publicKey}`)
  const search = new URLSearchParams({
    ts,
    apikey: publicKey,
    hash,
    ...Object.fromEntries(
      Object.entries(params).map(([key, value]) => [key, String(value)])
    )
  })
  return `${ROOT_MARVEL_API_URL}${path}?${search.toString()}`
}
```

`src/lib/marvel/marvel-client.ts`:

```ts
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
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm run test:ci src/lib/marvel`
Expected: PASS (8 tests). Note: `vi.stubEnv` requires vitest; Web Crypto is global in Node 24.

- [ ] **Step 5: Commit**

```bash
git add src/lib/marvel src/types
git commit -m "feat: add server-side marvel service layer with web crypto signing"
```

---

### Task 3: API route `GET /api/characters`

**Files:**

- Create: `src/pages/api/characters.ts`, `src/pages/api/_characters.test.ts` — test MUST be `_characters.test.ts` (underscore prefix is Astro's ignore convention): a file named `characters.test.ts` under `src/pages` is treated as a route `/api/characters.test` and breaks the build. Vitest's `src/**/*.test.{ts,tsx}` include still picks it up.

**Interfaces:**

- Consumes: `fetchCharacters` from `@/lib/marvel/marvel-client`, `PAGE_LIMIT` from `@/lib/marvel/constants`.
- Produces: `GET(context: APIContext): Promise<Response>` — query params `q` (optional string), `page` (1-based, clamped ≥ 1), `limit` (clamped 1..100, default `PAGE_LIMIT`). Returns `{ results: Character[], total: number }` where `total` is the **page count** (`Math.ceil(rawTotal / limit)`). 502 JSON body on upstream failure.

- [ ] **Step 1: Write the failing test**

`src/pages/api/_characters.test.ts`:

```ts
import type { APIContext } from 'astro'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { GET } from './characters'
import { fetchCharacters } from '@/lib/marvel/marvel-client'

vi.mock('@/lib/marvel/marvel-client', () => ({
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
      results: [{ id: 1, name: 'Thor' }],
      total: 57
    })
    const response = await GET(context('?q=th&page=2'))
    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.results[0].name).toBe('Thor')
    expect(body.total).toBe(6)
    expect(mockedFetchCharacters).toHaveBeenCalledWith({
      nameStartsWith: 'th',
      page: 1,
      limit: 10
    })
  })

  it('treats missing q as null and clamps page and limit', async () => {
    mockedFetchCharacters.mockResolvedValue({ results: [], total: 0 })
    await GET(context('?page=0&limit=999'))
    expect(mockedFetchCharacters).toHaveBeenCalledWith({
      nameStartsWith: null,
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

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm run test:ci src/pages/api`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement the route**

`src/pages/api/characters.ts`:

```ts
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
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm run test:ci src/pages/api`
Expected: PASS (3 tests).

- [ ] **Step 5: Verify build still green**

Run: `pnpm run build` — expected: API route is on-demand, build succeeds.

- [ ] **Step 6: Commit**

```bash
git add src/pages/api
git commit -m "feat: add /api/characters server proxy with pagination"
```

---

### Task 3R: Mock data provider (Marvel API is dead — replaces the client implementation)

**Why:** Tasks 2–3 shipped a real Marvel client + signing, but `gateway.marvel.com` now returns 500 for everything. This task keeps the plan's architecture (same exported interface, same API route, same `_characters.test.ts` which already mocks the client) but makes the data source a deterministic in-memory mock. A follow-up plan (new doc) will integrate the SuperHero API (`TOKEN` env var is already in `.env`).

**Files:**

- Delete: `src/lib/marvel/signing.ts`, `src/lib/marvel/signing.test.ts`
- Modify: `src/lib/marvel/constants.ts` (drop `ROOT_MARVEL_API_URL`; keep `PAGE_LIMIT = 10`), `src/lib/marvel/marvel-client.ts` (mock-backed), `src/lib/marvel/marvel-client.test.ts` (rewritten contract tests), `.env.example` (only `TOKEN=`), `.github/workflows/ci.yml` (remove the build step's secrets env block — no env needed)
- Create: `src/lib/marvel/mock-data.ts`
- Unchanged: `src/pages/api/characters.ts`, `src/pages/api/_characters.test.ts`

**Interfaces:**

- `mock-data.ts` exports:
  - `MOCK_CHARACTERS: Character[]` — exactly **300** entries, Marvel-shaped (`id: number`, `name`, `description`, `thumbnail: { path, extension }`). First ~40 are curated real Marvel names (Iron Man, Thor, Thanos, Spider-Man, …) with one-line descriptions; the rest are generated deterministically (fixed name-parts arrays + arithmetic on the index — **no `Math.random()`**, stable across runs). Ids: 1..300. Thumbnail for every entry: `{ path: 'https://picsum.photos/seed/marvel-{id}/640/480', extension: 'jpg' }` (the app builds URLs as `path + '.' + extension`; picsum serves `.jpg` suffixes).
  - `getMockComics(characterId: number): Comic[]` — deterministic per-character comics: 3–6 entries, `{ id, title: '<NAME> #<n>', thumbnail: { path: 'https://picsum.photos/seed/comic-{charId}-{n}/480/640', extension: 'jpg' } }`; returns `[]` for unknown ids.
- `marvel-client.ts` keeps the exact exported signatures (page 0-based, `total` = raw count):
  - `fetchCharacters({ nameStartsWith?, page = 0, limit = PAGE_LIMIT })` — filters `MOCK_CHARACTERS` with **case-insensitive `startsWith`** on name, then slices `[page*limit, page*limit+limit)`; returns `{ results, total: filteredCount }`. No network, never rejects.
  - `fetchCharacterById(id: string | number)` — finds by numeric id, returns `Character | undefined`.
  - `fetchCharacterComics(id: string | number)` — `getMockComics(Number(id))`.

- [ ] **Step 1: Write the failing tests**

Rewrite `src/lib/marvel/marvel-client.test.ts` (contract tests, no fetch mocking — there is no network):

```ts
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
    const { results, total } = await fetchCharacters({ nameStartsWith: 'IRON' })
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
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm run test:ci src/lib/marvel`
Expected: FAIL — `mock-data` module not found (and the current client hits the dead network).

- [ ] **Step 3: Implement the mock provider**

`src/lib/marvel/mock-data.ts` (curated + generated, deterministic — implementer writes the generator; the test above is the contract):

```ts
import type { Character, Comic } from '@/types'

export const MOCK_CHARACTERS: Character[] = []
// 1) push ~40 curated real Marvel characters (id 1..40) with one-line descriptions
// 2) generate ids 41..300 from fixed name-part arrays (no Math.random)
// thumbnail: { path: `https://picsum.photos/seed/marvel-${id}/640/480`, extension: 'jpg' }

export const getMockComics = (characterId: number): Comic[] => {
  const character = MOCK_CHARACTERS.find(c => c.id === characterId)
  if (!character) return []
  const count = 3 + (characterId % 4) // 3..6
  return Array.from({ length: count }, (_, i) => ({
    id: characterId * 100 + i,
    title: `${character.name} #${i + 1}`,
    thumbnail: {
      path: `https://picsum.photos/seed/comic-${characterId}-${i}/480/640`,
      extension: 'jpg'
    }
  }))
}
```

`src/lib/marvel/marvel-client.ts` (keep signatures; delete `buildSignedUrl` import and `fetch`/`MarvelData`):

```ts
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
```

`src/lib/marvel/constants.ts` — remove `ROOT_MARVEL_API_URL`, keep `PAGE_LIMIT = 10`.

`.env.example`:

```
TOKEN=
```

`.github/workflows/ci.yml` — replace the build step with:

```yaml
- run: pnpm run build
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm run test:ci src/lib/marvel src/pages/api`
Expected: PASS (5 client + 3 route + 2 utils).

- [ ] **Step 5: Verify lint/typecheck/build**

Run: `pnpm run lint && pnpm run typecheck && pnpm run build` — build stays server output (API route is on-demand).

- [ ] **Step 6: Dev smoke test**

Start `pnpm run dev` (timeout), then:

- `curl 'http://localhost:4321/api/characters?limit=3'` → HTTP 200, JSON with 3 mock characters
- `curl 'http://localhost:4321/api/characters?q=iron&page=1&limit=2'` → 200, filtered results
  Kill the server.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: replace marvel api client with mock data provider"
```

---

### Task 4: Design system (tokens + UI primitives)

**Prereq:** `design/design-tokens.md` exists — extracted from the 7 screenshots in `design/` by a vision model (Gemini 3.6 Flash). It defines a **neo-brutalist** system. If the file is missing, re-run the extraction before starting this task.

**Files:**

- Modify: `src/styles/global.css` (verify tokens from `design/design-tokens.md`)
- Create: `src/components/ui/Typography.tsx`, `src/components/ui/Avatar.tsx`, `src/components/ui/Spinner.tsx`, `src/components/ui/LoadingPlaceholder.tsx`, `src/components/ui/Pagination.tsx`, `src/components/ui/SearchInput.tsx`, `src/components/ui/index.ts`, `src/components/ui/Pagination.test.tsx`, `src/components/ui/SearchInput.test.tsx`, `src/components/ui/LoadingPlaceholder.test.tsx`

**Design rules (from `design/design-tokens.md`):**

- Borders: `3px` solid ink on cards/inputs/buttons; `4px` on outer frames (header, detail hero block); `2px` on progress bars/badges. Radius `0` everywhere (toggle track `9999px`, radio/alert circle `50%`).
- Shadows: hard `4px 4px 0` ink by default; yellow variant `4px 4px 0 #ffe600` on primary CTAs ('VIEW DETAILS', 'ADD TO COMPARE'); red variant `4px 4px 0 #ff2d2d` on 'CLEAR SEARCH'. Hover: translate `-2,-2` + shadow to `6px`; press: translate `+2,+2` + shadow `0` (encoded in `.brutal-btn` layer in global.css).
- Type: headings uppercase extra-bold; labels 11–12px extrabold uppercase with `0.05–0.12em` letter-spacing; body 14–15px regular, line-height 1.6. Font: Space Grotesk (weights 300–700; map `font-black`→700).

**Interfaces:**

- Produces (all React components, named exports, no default exports):
  - `Typography({ variant, className, ...props })` — `variant: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'body' | 'caption' | 'subtitle'`; renders matching `<h1>`–`<h6>` / `<p>` / `<span>`; class maps: h1 `text-3xl font-bold uppercase tracking-tight`, h2 `text-2xl font-bold uppercase`, h3 `text-xl font-extrabold uppercase`, h4 `text-lg font-extrabold uppercase`, h5 `text-base font-bold uppercase`, h6 `text-base font-bold uppercase`, subtitle `text-sm font-bold uppercase tracking-wide`, body `text-[15px] leading-relaxed`, caption `text-xs font-bold uppercase tracking-wider`.
  - `Avatar({ src, alt, width, height })` → `<img>` `object-cover`, square corners (radius 0).
  - `Spinner()` → `<span aria-label='loading'>` with a CSS border spinner (`animate-spin`, `border-2 border-line border-t-ink h-8 w-8`).
  - `LoadingPlaceholder({ loading, children })` → `Spinner` when loading, else children (no cloneElement magic).
  - `Pagination({ count, page, onChange, siblingCount = 0, showFirstButton = true, showLastButton = true, hideNextButton = false, hidePrevButton = false })` — numbered 40px square buttons with `aria-current='page'` on the active page; calls `onChange(nextPage)`. Button base: `brutal-btn h-10 min-w-10 border-[3px] border-ink bg-surface px-2 text-sm font-bold text-ink disabled:pointer-events-none disabled:opacity-40`; active page: inverted fill `bg-ink text-surface` (matches the filter-tag active pattern in the spec).
  - `SearchInput({ defaultValue, onSearch, placeholder, 'aria-label' })` — 48px-tall field: yellow 48x48 square icon button on the left (magnifier), input on the right; both `border-[3px] border-ink`; Enter key or button click → `onSearch(value)`.
  - `src/components/ui/index.ts` re-exports all.

- [ ] **Step 1: Verify design tokens against `design/design-tokens.md`**

`src/styles/global.css` from Task 1 already carries the token values. Read `design/design-tokens.md` and confirm every token is present and correct: colors (ink `#000`, surface `#fff`, red `#ff2d2d`, yellow `#ffe600`, teal `#14b8a6`, gray-light `#e5e7eb`, gray-dark `#1e293b`, muted `#6b7280`), font (Space Grotesk), shadows (hard/yellow/red variants via `.brutal-btn`), border widths, radius 0 rule, and the hover/press interaction rules. Fix or extend `@theme`/`@layer components` in `global.css` if anything is missing. If the file is empty or missing tokens, extract them with a vision-capable model and retry.

- [ ] **Step 2: Write the failing tests**

`src/components/ui/Pagination.test.tsx`:

```tsx
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { Pagination } from './Pagination'

describe('Pagination', () => {
  it('renders page buttons with the active page marked', () => {
    render(<Pagination count={5} page={2} onChange={vi.fn()} />)
    expect(screen.getByText('2').closest('button')).toHaveAttribute(
      'aria-current',
      'page'
    )
    expect(
      screen.getByRole('button', { name: /go to page 3/i })
    ).toBeInTheDocument()
  })

  it('calls onChange with the next page', () => {
    const onChange = vi.fn()
    render(<Pagination count={5} page={2} onChange={onChange} />)
    fireEvent.click(screen.getByRole('button', { name: /go to page 3/i }))
    expect(onChange).toHaveBeenCalledWith(3)
  })

  it('hides prev/first on page 1', () => {
    render(<Pagination count={5} page={1} onChange={vi.fn()} />)
    expect(
      screen.queryByRole('button', { name: /go to previous page/i })
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: /go to first page/i })
    ).not.toBeInTheDocument()
  })
})
```

`src/components/ui/SearchInput.test.tsx`:

```tsx
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { SearchInput } from './SearchInput'

describe('SearchInput', () => {
  it('calls onSearch on Enter with the current value', () => {
    const onSearch = vi.fn()
    render(<SearchInput onSearch={onSearch} placeholder='Search' />)
    fireEvent.change(screen.getByPlaceholderText('Search'), {
      target: { value: 'thor' }
    })
    fireEvent.keyDown(screen.getByPlaceholderText('Search'), { key: 'Enter' })
    expect(onSearch).toHaveBeenCalledWith('thor')
  })

  it('calls onSearch when the search button is clicked', () => {
    const onSearch = vi.fn()
    render(<SearchInput onSearch={onSearch} placeholder='Search' />)
    fireEvent.change(screen.getByPlaceholderText('Search'), {
      target: { value: 'hulk' }
    })
    fireEvent.click(screen.getByRole('button', { name: /search/i }))
    expect(onSearch).toHaveBeenCalledWith('hulk')
  })
})
```

`src/components/ui/LoadingPlaceholder.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { LoadingPlaceholder } from './LoadingPlaceholder'

describe('LoadingPlaceholder', () => {
  it('renders children when not loading', () => {
    render(
      <LoadingPlaceholder loading={false}>
        <p>teste</p>
      </LoadingPlaceholder>
    )
    expect(screen.getByText(/teste/i)).toBeInTheDocument()
  })

  it('renders the spinner while loading', () => {
    render(
      <LoadingPlaceholder loading={true}>
        <p>teste</p>
      </LoadingPlaceholder>
    )
    expect(screen.getByLabelText('loading')).toBeInTheDocument()
  })
})
```

- [ ] **Step 3: Run tests to verify they fail**

Run: `pnpm run test:ci src/components/ui`
Expected: FAIL — modules not found.

- [ ] **Step 4: Implement the primitives**

`src/components/ui/Typography.tsx`:

```tsx
import type { ElementType, ReactNode } from 'react'

const variantClasses: Record<string, string> = {
  h1: 'text-5xl font-bold',
  h2: 'text-4xl font-bold',
  h3: 'text-3xl font-bold',
  h4: 'text-2xl font-bold',
  h5: 'text-xl font-bold',
  h6: 'text-lg font-semibold',
  subtitle: 'text-sm',
  body: 'text-base',
  caption: 'text-xs'
}

export const Typography = ({
  variant = 'body',
  component,
  className = '',
  children
}: {
  variant?: keyof typeof variantClasses
  component?: ElementType
  className?: string
  children: ReactNode
}) => {
  const Tag = component ?? variant
  return (
    <Tag className={`${variantClasses[variant]} ${className}`}>{children}</Tag>
  )
}
```

`src/components/ui/Avatar.tsx`:

```tsx
export const Avatar = ({
  src,
  alt,
  width,
  height,
  className = ''
}: {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
}) => (
  <img
    src={src}
    alt={alt}
    width={width}
    height={height}
    className={`object-cover ${className}`}
  />
)
```

`src/components/ui/Spinner.tsx`:

```tsx
export const Spinner = () => (
  <span
    aria-label='loading'
    role='status'
    className='inline-block h-8 w-8 animate-spin border-2 border-line border-t-ink'
  />
)
```

`src/components/ui/LoadingPlaceholder.tsx`:

```tsx
import type { ReactNode } from 'react'
import { Spinner } from './Spinner'

export const LoadingPlaceholder = ({
  loading,
  children
}: {
  loading: boolean
  children: ReactNode
}) => <>{loading ? <Spinner /> : children}</>
```

`src/components/ui/Pagination.tsx`:

```tsx
const pageNumbers = (
  count: number,
  page: number,
  siblingCount: number
): (number | 'ellipsis')[] => {
  const start = Math.max(2, page - siblingCount)
  const end = Math.min(count - 1, page + siblingCount)
  const pages: (number | 'ellipsis')[] = [1]
  if (start > 2) pages.push('ellipsis')
  for (let i = start; i <= end; i += 1) pages.push(i)
  if (end < count - 1) pages.push('ellipsis')
  if (count > 1) pages.push(count)
  return pages
}

const buttonClass =
  'brutal-btn h-10 min-w-10 border-[3px] border-ink bg-surface px-2 text-sm font-bold text-ink disabled:pointer-events-none disabled:opacity-40'

export const Pagination = ({
  count,
  page,
  onChange,
  siblingCount = 0,
  showFirstButton = true,
  showLastButton = true,
  hideNextButton = false,
  hidePrevButton = false
}: {
  count: number
  page: number
  onChange: (page: number) => void
  siblingCount?: number
  showFirstButton?: boolean
  showLastButton?: boolean
  hideNextButton?: boolean
  hidePrevButton?: boolean
}) => {
  if (count <= 1) return null

  const isFirst = page === 1
  const isLast = page === count

  return (
    <nav
      aria-label='pagination'
      className='flex flex-wrap items-center justify-center gap-1'
    >
      {showFirstButton && !isFirst && (
        <button
          type='button'
          aria-label='go to first page'
          className={buttonClass}
          onClick={() => onChange(1)}
        >
          «
        </button>
      )}
      {!hidePrevButton && !isFirst && (
        <button
          type='button'
          aria-label='go to previous page'
          className={buttonClass}
          onClick={() => onChange(page - 1)}
        >
          ‹
        </button>
      )}
      {pageNumbers(count, page, siblingCount).map((number, index) =>
        number === 'ellipsis' ? (
          <span key={`ellipsis-${index}`} className='px-1 text-ink'>
            …
          </span>
        ) : (
          <button
            key={number}
            type='button'
            aria-label={`go to page ${number}`}
            aria-current={number === page ? 'page' : undefined}
            className={`${buttonClass} ${number === page ? 'bg-ink text-surface' : ''}`}
            onClick={() => onChange(number)}
          >
            {number}
          </button>
        )
      )}
      {!hideNextButton && !isLast && (
        <button
          type='button'
          aria-label='go to next page'
          className={buttonClass}
          onClick={() => onChange(page + 1)}
        >
          ›
        </button>
      )}
      {showLastButton && !isLast && (
        <button
          type='button'
          aria-label='go to last page'
          className={buttonClass}
          onClick={() => onChange(count)}
        >
          »
        </button>
      )}
    </nav>
  )
}
```

`src/components/ui/SearchInput.tsx`:

```tsx
import { useRef } from 'react'

export const SearchInput = ({
  defaultValue,
  onSearch,
  placeholder,
  className = ''
}: {
  defaultValue?: string
  onSearch: (value: string) => void
  placeholder?: string
  className?: string
}) => {
  const inputRef = useRef<HTMLInputElement>(null)

  const submit = () => onSearch(inputRef.current?.value ?? '')

  return (
    <div className={`flex ${className}`}>
      <button
        type='button'
        aria-label='search'
        onClick={submit}
        className='brutal-btn flex h-12 w-12 shrink-0 items-center justify-center border-[3px] border-ink bg-yellow text-ink'
      >
        <svg
          width='20'
          height='20'
          viewBox='0 0 24 24'
          fill='none'
          stroke='currentColor'
          strokeWidth='2'
        >
          <circle cx='11' cy='11' r='7' />
          <line x1='21' y1='21' x2='16.5' y2='16.5' />
        </svg>
      </button>
      <input
        ref={inputRef}
        type='search'
        defaultValue={defaultValue}
        placeholder={placeholder}
        aria-label={placeholder}
        onKeyDown={event => {
          if (event.key === 'Enter') submit()
        }}
        className='h-12 w-full border-[3px] border-l-0 border-ink bg-surface px-4 text-sm font-bold uppercase text-ink outline-none placeholder:font-bold placeholder:normal-case placeholder:text-muted focus:bg-gray-light'
      />
    </div>
  )
}
```

`src/components/ui/index.ts`:

```ts
export { Typography } from './Typography'
export { Avatar } from './Avatar'
export { Spinner } from './Spinner'
export { LoadingPlaceholder } from './LoadingPlaceholder'
export { Pagination } from './Pagination'
export { SearchInput } from './SearchInput'
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `pnpm run test:ci src/components/ui`
Expected: PASS (7 tests).

- [ ] **Step 6: Verify lint/typecheck**

Run: `pnpm run lint && pnpm run typecheck` — expected: clean.

- [ ] **Step 7: Commit**

```bash
git add design/design-tokens.md src/components/ui src/styles/global.css
git commit -m "feat: add tailwind design system primitives"
```

---

### Task 5: Home page (island + TanStack Query + table/search/navigation)

**Files:**

- Modify: `src/pages/index.astro` (server fetch + island)
- Create: `src/components/CharactersExplorer/CharactersExplorer.tsx`, `src/components/CharactersExplorer/hooks.ts`, `src/components/CharactersExplorer/CharactersExplorer.test.tsx`, `src/components/SearchHeader/SearchHeader.tsx`, `src/components/SearchHeader/SearchHeader.test.tsx`, `src/components/CharactersTable/CharactersTable.tsx`, `src/components/CharactersTable/CharactersTable.test.tsx`, `src/components/Navigation/Navigation.tsx`, `src/components/Navigation/Navigation.test.tsx`, `src/components/index.ts`
- Delete: nothing yet (old versions already deleted in Task 1)

**Interfaces:**

- Consumes: `fetchCharacters` (`@/lib/marvel/marvel-client`), `PAGE_LIMIT` (`@/lib/marvel/constants`), ui primitives (`@/components/ui`), `isEmpty` (`@/utils`).
- Produces:
  - `CharactersExplorer({ initialData: Character[]; total: number })` — `total` is the page count from the server. Owns `QueryClientProvider`.
  - `useCharactersExplorer(initialData, total)` returns `{ query, page, total, characters, loading, gotoPage, updateQuery }`.
  - `SearchHeader({ query })` — uses `SearchInput` + `Typography`; calls `updateQuery`.
  - `CharactersTable({ characters })` — semantic table; row click → `window.location.assign('/details/' + id)`; series/events columns hidden on mobile (`hidden md:table-cell`).
  - `Navigation({ page, total, onChange })` — renders `Pagination`.
  - `src/components/index.ts` re-exports the above.

- [ ] **Step 1: Write the failing tests**

`src/components/CharactersTable/CharactersTable.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { CharactersTable } from './CharactersTable'

describe('CharactersTable', () => {
  it('renders character names', () => {
    render(
      <CharactersTable
        characters={[
          { name: 'Thor', thumbnail: {}, events: {}, series: {}, id: 1 }
        ]}
      />
    )
    expect(screen.getByText('Thor')).toBeInTheDocument()
    expect(screen.getByText('Character')).toBeInTheDocument()
  })
})
```

`src/components/SearchHeader/SearchHeader.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { SearchHeader } from './SearchHeader'

describe('SearchHeader', () => {
  it('renders the search header with the query as input value', () => {
    render(<SearchHeader query='thor' />)
    expect(screen.getByText(/find a character/i)).toBeInTheDocument()
    expect(screen.getByDisplayValue('thor')).toBeInTheDocument()
  })
})
```

`src/components/Navigation/Navigation.test.tsx`:

```tsx
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { Navigation } from './Navigation'

describe('Navigation', () => {
  it('renders nothing when total is 1 or less', () => {
    render(<Navigation page={1} total={1} onChange={vi.fn()} />)
    expect(
      screen.queryByRole('navigation', { name: 'pagination' })
    ).not.toBeInTheDocument()
  })

  it('calls onChange with the selected page', () => {
    const onChange = vi.fn()
    render(<Navigation page={1} total={5} onChange={onChange} />)
    fireEvent.click(screen.getByRole('button', { name: /go to page 3/i }))
    expect(onChange).toHaveBeenCalledWith(3)
  })
})
```

`src/components/CharactersExplorer/CharactersExplorer.test.tsx`:

```tsx
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { CharactersExplorer } from './CharactersExplorer'

const mockFetch = vi.fn()

const charactersResponse = {
  ok: true,
  json: async () => ({ results: [{ id: 2, name: 'Hulk' }], total: 1 })
}

describe('CharactersExplorer', () => {
  beforeEach(() => {
    mockFetch.mockResolvedValue(charactersResponse)
    vi.stubGlobal('fetch', mockFetch)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('renders the server-provided initial data', () => {
    render(
      <CharactersExplorer initialData={[{ id: 1, name: 'Thor' }]} total={1} />
    )
    expect(screen.getByText('Thor')).toBeInTheDocument()
  })

  it('fetches new results through the api route when searching', async () => {
    render(
      <CharactersExplorer initialData={[{ id: 1, name: 'Thor' }]} total={1} />
    )
    fireEvent.change(screen.getByPlaceholderText('Search'), {
      target: { value: 'hulk' }
    })
    fireEvent.keyDown(screen.getByPlaceholderText('Search'), { key: 'Enter' })
    await waitFor(() => expect(screen.getByText('Hulk')).toBeInTheDocument())
    expect(mockFetch.mock.calls[0][0]).toContain('/api/characters')
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm run test:ci src/components/CharactersExplorer src/components/SearchHeader src/components/CharactersTable src/components/Navigation`
Expected: FAIL — modules not found.

- [ ] **Step 3: Implement the island

`src/components/CharactersExplorer/hooks.ts`:

```ts
import { useQuery } from '@tanstack/react-query'
import { useCallback, useMemo, useState } from 'react'
import type { Character } from '@/types'
import { isEmpty } from '@/utils'

const fetchCharactersPage = async ({
  q,
  page
}: {
  q: string
  page: number
}): Promise<{ results: Character[]; total: number }> => {
  const url = new URL('/api/characters', window.location.origin)
  if (!isEmpty(q)) url.searchParams.set('q', q)
  url.searchParams.set('page', String(page))
  const response = await fetch(url.toString())
  if (!response.ok)
    throw new Error(`Failed to fetch characters: ${response.status}`)
  return response.json()
}

export const useCharactersExplorer = (
  initialData: Character[],
  total: number
) => {
  const [query, setQuery] = useState<string>(
    () => new URLSearchParams(window.location.search).get('query') ?? ''
  )
  const [page, setPage] = useState<number>(1)

  const placeholder = useMemo(
    () =>
      isEmpty(query) && page === 1
        ? { results: initialData, total }
        : undefined,
    [query, page, initialData, total]
  )

  const { data, isFetching } = useQuery({
    queryKey: ['characters', query, page],
    queryFn: () => fetchCharactersPage({ q: query, page }),
    placeholderData: placeholder
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
    total: data?.total ?? total,
    characters: data?.results ?? [],
    loading: isFetching,
    gotoPage,
    updateQuery
  }
}
```

`src/components/CharactersExplorer/CharactersExplorer.tsx`:

```tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { Character } from '@/types'
import { useCharactersExplorer } from './hooks'
import { SearchHeader } from '@/components/SearchHeader'
import { CharactersTable } from '@/components/CharactersTable'
import { Navigation } from '@/components/Navigation'
import { LoadingPlaceholder } from '@/components/ui'

const queryClient = new QueryClient()

export const CharactersExplorer = ({
  initialData,
  total
}: {
  initialData: Character[]
  total: number
}) => (
  <QueryClientProvider client={queryClient}>
    <Explorer initialData={initialData} total={total} />
  </QueryClientProvider>
)

const Explorer = ({
  initialData,
  total
}: {
  initialData: Character[]
  total: number
}) => {
  const {
    query,
    page,
    total: totalPages,
    characters,
    loading,
    gotoPage,
    updateQuery
  } = useCharactersExplorer(initialData, total)

  return (
    <div className='flex flex-col gap-6'>
      <SearchHeader query={query} updateQuery={updateQuery} />
      <LoadingPlaceholder loading={loading}>
        <CharactersTable characters={characters} />
      </LoadingPlaceholder>
      {totalPages > 1 && (
        <Navigation page={page} total={totalPages} onChange={gotoPage} />
      )}
    </div>
  )
}
```

- [ ] **Step 4: Implement the feature components**

`src/components/SearchHeader/SearchHeader.tsx`:

```tsx
import { SearchInput, Typography } from '@/components/ui'

export const SearchHeader = ({
  query,
  updateQuery
}: {
  query: string
  updateQuery: (value: string) => void
}) => (
  <div className='flex flex-col gap-2'>
    <Typography variant='h5'>Find a character</Typography>
    <Typography variant='subtitle'>Character name</Typography>
    <SearchInput
      defaultValue={query}
      placeholder='Search'
      onSearch={updateQuery}
      className='max-w-md'
    />
  </div>
)
```

`src/components/CharactersTable/CharactersTable.tsx`:

```tsx
import { Avatar, Typography } from '@/components/ui'
import { useMobile } from '@/hooks'
import type { Character } from '@/types'

export const CharactersTable = ({
  characters
}: {
  characters: Character[] | undefined
}) => {
  const redirectToDetails = (id?: number) => {
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
            Series
          </th>
          <th scope='col' className='hidden px-4 py-3 md:table-cell'>
            Events
          </th>
        </tr>
      </thead>
      <tbody>
        {(characters ?? []).map(({ name, thumbnail, events, series, id }) => (
          <tr
            key={`${name}-${id}`}
            onClick={() => redirectToDetails(id)}
            className='cursor-pointer border-b border-line last:border-b-0 hover:bg-background'
          >
            <td className='px-4 py-3'>
              <div className='flex items-center gap-6'>
                {thumbnail?.path && (
                  <Avatar
                    width={48}
                    height={48}
                    src={`${thumbnail.path.replace(/^http:/, 'https:')}.${thumbnail.extension}`}
                    alt={name ?? 'character thumbnail'}
                  />
                )}
                <Typography variant='body' className='font-semibold'>
                  {name}
                </Typography>
              </div>
            </td>
            <td className='hidden px-4 py-3 md:table-cell'>
              {(series?.items?.slice(0, 3) ?? []).map(
                ({ name: seriesName }) => (
                  <Typography
                    key={seriesName}
                    variant='caption'
                    className='block'
                  >
                    {seriesName}
                  </Typography>
                )
              )}
            </td>
            <td className='hidden px-4 py-3 md:table-cell'>
              {(events?.items?.slice(0, 3) ?? []).map(({ name: eventName }) => (
                <Typography key={eventName} variant='caption' className='block'>
                  {eventName}
                </Typography>
              ))}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
```

`src/components/Navigation/Navigation.tsx`:

```tsx
import { Pagination } from '@/components/ui'

export const Navigation = ({
  page,
  total,
  onChange
}: {
  page: number
  total: number
  onChange: (page: number) => void
}) => (
  <Pagination count={total} page={page} onChange={onChange} siblingCount={0} />
)
```

`src/components/index.ts`:

```ts
export { CharactersExplorer } from './CharactersExplorer'
export { CharactersTable } from './CharactersTable'
export { SearchHeader } from './SearchHeader'
export { Navigation } from './Navigation'
```

- [ ] **Step 5: Rewire the home page**

`src/pages/index.astro`:

```astro
---
import MainLayout from '@/layouts/MainLayout.astro'
import { CharactersExplorer } from '@/components/CharactersExplorer'
import { fetchCharacters } from '@/lib/marvel/marvel-client'
import { PAGE_LIMIT } from '@/lib/marvel/constants'

const { results, total } = await fetchCharacters({ page: 0, limit: PAGE_LIMIT })
---

<MainLayout title='marvel characters'>
  <main class='mx-auto max-w-5xl px-4 py-8'>
    <CharactersExplorer
      client:load
      initialData={results}
      total={Math.ceil(total / PAGE_LIMIT)}
    />
  </main>
</MainLayout>
```

Note: importing a component that internally uses `window` is fine — the island hydrates client-side; the server fetch happens in frontmatter.

- [ ] **Step 6: Run tests to verify they pass**

Run: `pnpm run test:ci src/components/CharactersExplorer src/components/SearchHeader src/components/CharactersTable src/components/Navigation`
Expected: PASS.

- [ ] **Step 7: Verify lint/typecheck/build**

Run: `pnpm run lint && pnpm run typecheck && pnpm run build`
Expected: clean; build prerenders the home page (requires `.env` keys).

- [ ] **Step 8: Manual smoke test**

Run: `pnpm run dev` — open `http://localhost:4321`, confirm the table renders, search for "thor" updates the URL and results, pagination works. Then stop the server.

- [ ] **Step 9: Commit**

```bash
git add src/pages/index.astro src/components src/hooks
git commit -m "feat: migrate home page to astro island with tanstack query"
```

---

### Task 6: Details page (prerendered + fallback) and ComicPreview

**Files:**

- Create: `src/pages/details/[id].astro`, `src/components/ComicPreview/ComicPreview.astro`, `src/components/ComicPreview/ComicPreview.test.ts`

**Interfaces:**

- Consumes: `fetchCharacterById`, `fetchCharacterComics`, `fetchCharacters`, `PAGE_LIMIT` from `@/lib/marvel/*`.
- Produces: `details/[id].astro` — `export const prerender = true`, `getStaticPaths` returns params for the first `STATIC_CHARACTERS = 300` characters, rewrites to `/404` when the character is missing; `ComicPreview({ comics: Comic[] })` — .astro grid of `<a target='_blank' rel='noreferrer'>` images + titles.

- [ ] **Step 1: Write the failing test**

`src/components/ComicPreview/ComicPreview.test.ts`:

```ts
// @vitest-environment node
import { experimental_AstroContainer as AstroContainer } from 'astro/container'
import { expect, test } from 'vitest'
import ComicPreview from './ComicPreview.astro'

test('ComicPreview renders comic titles', async () => {
  const container = await AstroContainer.create()
  const result = await container.renderToString(ComicPreview, {
    props: {
      comics: [
        {
          id: 1,
          title: 'Thor #1',
          thumbnail: { path: 'https://i.annihil.us/thor', extension: 'jpg' }
        }
      ]
    }
  })
  expect(result).toContain('Thor #1')
  expect(result).toContain('https://i.annihil.us/thor.jpg')
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm run test:ci src/components/ComicPreview`
Expected: FAIL — module not found. (If AstroContainer errors in this environment, add `import { loadRenderers } from 'astro:container'` + `getContainerRenderer` from `@astrojs/react` per the Astro testing docs.)

- [ ] **Step 3: Implement the details page and ComicPreview**

`src/components/ComicPreview/ComicPreview.astro`:

```astro
---
import type { Comic } from '@/types'

const { comics = [] } = Astro.props as { comics?: Comic[] }
---

<ul class='grid grid-cols-2 gap-4 md:grid-cols-3'>
  {
    comics.map(comic => {
      const src = comic.thumbnail?.path
        ? `${comic.thumbnail.path.replace(/^http:/, 'https:')}.${comic.thumbnail.extension}`
        : undefined
      return (
        <li key={`${comic.title}-${comic.id}`}>
          {src && (
            <a href={src} target='_blank' rel='noreferrer'>
              <img
                src={src}
                alt={comic.title ?? 'comic thumbnail'}
                width={100}
                height={150}
                class='h-auto w-full object-cover'
                loading='lazy'
              />
            </a>
          )}
          <p class='mt-1 text-sm'>{comic.title}</p>
        </li>
      )
    })
  }
</ul>
```

`src/pages/details/[id].astro`:

```astro
---
import MainLayout from '@/layouts/MainLayout.astro'
import ComicPreview from '@/components/ComicPreview/ComicPreview.astro'
import {
  fetchCharacterById,
  fetchCharacterComics,
  fetchCharacters
} from '@/lib/marvel/marvel-client'
import { PAGE_LIMIT } from '@/lib/marvel/constants'

export const prerender = true

const STATIC_CHARACTERS = 300

export async function getStaticPaths() {
  const paths: { params: { id: string } }[] = []
  for (let offset = 0; offset < STATIC_CHARACTERS; offset += PAGE_LIMIT) {
    const { results } = await fetchCharacters({
      page: offset / PAGE_LIMIT,
      limit: PAGE_LIMIT
    })
    for (const character of results) {
      if (character.id) paths.push({ params: { id: String(character.id) } })
    }
  }
  return { paths }
}

const { id } = Astro.params
const character = await fetchCharacterById(id)
if (!character) return Astro.rewrite('/404')

const comics = await fetchCharacterComics(id)

const thumbnailSrc = character.thumbnail?.path
  ? `${character.thumbnail.path.replace(/^http:/, 'https:')}.${character.thumbnail.extension}`
  : undefined
---

<MainLayout title={character.name ?? 'Character'}>
  <main class='mx-auto max-w-5xl px-4 py-8'>
    <div class='grid gap-8 md:grid-cols-12'>
      <section class='md:col-span-4'>
        {
          thumbnailSrc && (
            <img
              src={thumbnailSrc}
              alt={character.name ?? 'character thumbnail'}
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
          {character.name}
        </h1>
        {
          character.description && (
            <p class='mt-4 text-[15px] leading-relaxed'>
              {character.description}
            </p>
          )
        }
        <h2 class='mt-8 text-xl font-semibold'>Comics appearance</h2>
        <div class='mt-4'>
          <ComicPreview comics={comics} />
        </div>
      </section>
    </div>
  </main>
</MainLayout>
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm run test:ci src/components/ComicPreview`
Expected: PASS.

- [ ] **Step 5: Verify build (prerender + fallback)**

Run: `pnpm run build`
Expected: build succeeds; `dist/` contains `details/<id>/index.html` for the static ids. Spot-check one generated file with `find dist/details -name index.html | head -3`.

- [ ] **Step 6: Manual smoke test**

Run: `pnpm run dev` — open a details URL for a popular character (e.g. `/details/1009664`), confirm image/name/description/comics; open an unknown id (e.g. `/details/1`), confirm 404. Then stop the server.

- [ ] **Step 7: Commit**

```bash
git add src/pages/details src/components/ComicPreview
git commit -m "feat: migrate details page to prerendered astro route with fallback"
```

---

### Task 7: Shell components (layout, appbar, error boundary) + cleanup

**Files:**

- Modify: `src/layouts/MainLayout.astro` (add Appbar + main padding), `src/pages/index.astro` (wrap island in ErrorBoundary)
- Create: `src/components/Appbar/Appbar.astro`, `src/components/ErrorBoundary/ErrorBoundary.tsx`
- Delete: any remaining references to `@/utils/theme`, `@/context`, `@/service`, `@/styles` — grep to confirm none remain.

**Interfaces:**

- Produces: `Appbar.astro` (fixed header with logo linking home), `ErrorBoundary({ children })` (class component, Tailwind-styled fallback with a home link).
- Consumes: `public/assets/marvel.svg`, ui tokens.

- [ ] **Step 1: Implement Appbar**

`src/components/Appbar/Appbar.astro`:

```astro
---

---

<header class='fixed inset-x-0 top-0 z-10 border-b border-line bg-surface'>
  <a href='/' class='inline-block px-6 py-4' aria-label='Home'>
    <img src='/assets/marvel.svg' alt='Logo' width={100} height={34} />
  </a>
</header>
```

- [ ] **Step 2: Wire it into the layout**

Modify `src/layouts/MainLayout.astro` frontmatter: add `import Appbar from '@/components/Appbar/Appbar.astro'`, and in the body:

```astro
<body class='min-h-screen bg-background font-sans text-ink'>
  <Appbar />
  <main class='pt-20'>
    <slot />
  </main>
</body>
```

(Remove the per-page `<main>` wrappers from `index.astro`/`details/[id].astro`/`404.astro` if they conflict — keep the inner `mx-auto max-w-5xl px-4 py-8` div as the page container.)

- [ ] **Step 3: Implement ErrorBoundary**

`src/components/ErrorBoundary/ErrorBoundary.tsx`:

```tsx
import { Component, type ErrorInfo, type ReactNode } from 'react'

interface Props {
  children?: ReactNode
}

interface State {
  hasError: boolean
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ErrorBoundary caught', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className='py-16 text-center'>
          <h1 className='text-3xl font-bold'>:'(</h1>
          <p className='mt-4'>Algum Erro Aconteceu, estamos tristes</p>
          <a href='/' className='mt-6 inline-block underline'>
            Volte aqui
          </a>
        </div>
      )
    }
    return this.props.children
  }
}
```

Wire it in `src/pages/index.astro`:

```astro
---
import MainLayout from '@/layouts/MainLayout.astro'
import { CharactersExplorer } from '@/components/CharactersExplorer'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { fetchCharacters } from '@/lib/marvel/marvel-client'
import { PAGE_LIMIT } from '@/lib/marvel/constants'

const { results, total } = await fetchCharacters({ page: 0, limit: PAGE_LIMIT })
---

<MainLayout title='marvel characters'>
  <div class='mx-auto max-w-5xl px-4 py-8'>
    <ErrorBoundary>
      <CharactersExplorer
        client:load
        initialData={results}
        total={Math.ceil(total / PAGE_LIMIT)}
      />
    </ErrorBoundary>
  </div>
</MainLayout>
```

- [ ] **Step 4: Grep for leftovers**

Run: `rg -n "material-ui|styled-components|next/|@/service|@/context|@/styles|utils/theme" src || echo CLEAN`
Expected: `CLEAN` (or only expected matches in git history — none in working tree).

- [ ] **Step 5: Verify**

Run: `pnpm run lint && pnpm run typecheck && pnpm run test:ci && pnpm run build`
Expected: all green.

- [ ] **Step 6: Manual smoke test**

Run: `pnpm run dev` — home renders with fixed appbar; details page shows appbar; broken JS in the island shows the error boundary (temporarily throw in the island to verify if desired, then revert). Stop server.

- [ ] **Step 7: Commit**

```bash
git add src/layouts src/components/Appbar src/components/ErrorBoundary src/pages/index.astro
git commit -m "feat: add appbar and error boundary shell"
```

---

### Task 8: Docs + final verification

**Files:**

- Modify: `README.md`, `AGENTS.md`
- Verify: `pnpm run lint`, `pnpm run typecheck`, `pnpm run test:ci`, `pnpm run build`, `pnpm run prettify` (then re-run lint/test)

- [ ] **Step 1: Rewrite README.md**

Cover: stack (Astro 7, React 19 islands, Tailwind v4 design system, TanStack Query v5, Vitest, ESLint 10, Prettier 3, TypeScript, Node 24, pnpm), setup (no env vars required — data comes from the built-in mock provider until the SuperHero API integration lands; `TOKEN` in `.env` is reserved for that), commands (`pnpm run dev|build|preview|test|test:ci|lint|typecheck`), folder structure (layouts, pages, lib/marvel, components/ui, hooks, styles), testing notes, and **Cloudflare Pages deploy**: build command `pnpm run build`, output directory `dist/`, **no env vars needed** (mock provider; add `TOKEN` only when the follow-up plan lands), Node 24.

- [ ] **Step 2: Rewrite AGENTS.md**

Update: stack section (Astro 7 pages in `src/pages/` — `.astro` files plus `[id].astro` dynamic routes, `src/pages/api/` for server endpoints; React 19 islands with `client:*` directives; Tailwind v4 CSS-first via `@theme` in `src/styles/global.css`, no config file), commands (`pnpm run test` = vitest watch, `test:ci` = one-shot vitest; `pnpm run lint` = eslint flat config; `pnpm run typecheck` = astro check; build needs no `.env`), environment (`TOKEN` = SuperHero API key reserved for the upcoming integration; data currently served by the mock provider in `src/lib/marvel/`), architecture conventions (feature components in `src/components/<Feature>/`; data access via `src/lib/marvel/marvel-client.ts` from Astro frontmatter/API routes only — server-only, never from islands; islands fetch through `src/pages/api/*`; alias `@/*`), testing (colocated `*.test.{ts,tsx}`, vitest + testing-library, Astro container API for `.astro` components), git hooks (husky pre-commit → lint-staged: eslint --fix + prettier --write on staged files).

- [ ] **Step 3: Full verification pass**

```bash
pnpm run lint
pnpm run typecheck
pnpm run test:ci
pnpm run build
```

Expected: all green. Then `pnpm run prettify` and re-run `pnpm run lint` + `pnpm run test:ci` to confirm formatting didn't break anything.

- [ ] **Step 4: Preview smoke test**

Run: `pnpm run preview` — verify home, a details page, and the 404 render; then stop the server.

- [ ] **Step 5: Commit**

```bash
git add README.md AGENTS.md
git commit -m "docs: update readme and agents for astro stack"
```

---

## Self-Review

- **Spec coverage:** all spec sections map to tasks — static output (hybrid merged) + cloudflare adapter (T1), server-only service layer (T2, superseded by T3R mock provider), API route (T3), design tokens + primitives (T4), home island + TanStack Query (T5), details prerender/fallback + 404 (T1/T6), shell + cleanup (T7), docs/deploy/CI (T8). Node 24, script names, test names all present. Marvel API death + SuperHero API follow-up documented in the revision note (line 9).
- **Placeholders:** only intentional ones — `design/` materials (Task 4 gate, placeholder tokens documented) and `.env` keys (Task 0, user action). Version `latest` pins are resolved at install time.
- **Type consistency:** `fetchCharacters` returns `{ results: Character[]; total: number }` (raw count) everywhere; `total` page counts are computed at the boundary (`index.astro` frontmatter and the API route). `CharactersExplorer` props `{ initialData: Character[]; total: number }` (page count) — used identically in `index.astro` and its test.
