# Marvel Characters — Astro Migration Design

Date: 2026-08-01
Status: Approved

## Context

`marvel-characters` is a small Marvel API browser currently built on Next.js 12
(pages router), React 18, Material UI v4 and styled-components. The stack is
end-of-life: Next 12, MUI v4 and styled-components v5 are legacy, ESLint 8 /
Prettier 2 / TS 4.8 / Jest 29 are outdated, and CI pins Node 16.

The app has two pages:

- Home (`/`): server-side static first page + client-side search/pagination
  with the public API key only.
- Details (`/details/[id]`): fully client-side fetch of character + comics.

Data access goes through `src/service/MarvelCharacterApiService.ts` and
`src/service/functions.ts` (MD5 request signing with `crypto-js` + `uuid`, only
used at build time).

## Goals

- Migrate to **Astro 6** with **React 19** islands, deployed to **Cloudflare**
  (`@astrojs/cloudflare` adapter, hybrid output).
- Replace MUI v4 + styled-components with **Tailwind CSS v4** and a custom
  design system (tokens + UI primitives) based on user-provided design
  materials (dropped in `design/`).
- Upgrade all runtime + dev dependencies: **ESLint 10 flat config**,
  **Prettier 3** (+ `prettier-plugin-astro`), **TypeScript latest**,
  **Vitest** (replacing Jest), Husky 9, lint-staged 16.
- Prefer **server-side data fetching** (Astro frontmatter + API routes); only
  fall back to client-side where interaction requires it, using
  **TanStack Query v5**.
- Modern TypeScript everywhere (`.mjs` for configs).
- Latest LTS **Node 24** (Astro 6 requires >= 22.12; repo pins 24).

## Non-Goals

- No backend/database migration, no auth, no i18n.
- No end-to-end test suite (out of scope; unit tests only).
- No visual redesign: the new design system must reproduce the current look
  until the user's design materials land in `design/`, which override tokens.

## Decisions (from Q&A)

1. **Hosting**: Cloudflare Workers (via `@astrojs/cloudflare`).
2. **Output mode**: `output: 'hybrid'` — pages prerendered by default, API
   routes on-demand, details page prerendered with fallback for unknown ids.
3. **Client data fetching**: single React island on home using TanStack Query
   v5, fetching through `GET /api/characters` (signed server-side).
4. **Details page**: `prerender = true` + `getStaticPaths` (first 300
   characters), on-demand render for the rest; pure server-rendered HTML, no
   island.
5. **Design materials**: user drops screenshots/tokens/component examples into
   `design/` during execution; placeholder tokens matching the current palette
   are used until then.
6. **Native crypto**: replace `crypto-js` + `uuid` with Web Crypto
   (`crypto.randomUUID()` + `crypto.subtle.digest('MD5')`), available in both
   Node 24 and the Cloudflare workerd runtime.
7. **Scope**: one comprehensive plan, executed with one subagent per task.

## Architecture

### Target file structure

```
astro.config.mjs              # hybrid output, cloudflare adapter, tailwind vite plugin
tsconfig.json                 # extends astro/tsconfigs/strict, @/* -> src/*
eslint.config.mjs             # flat config (astro, tseslint, react-hooks, jsx-a11y, testing-library, prettier)
.prettierrc.mjs               # repo style + prettier-plugin-astro
vitest.config.ts              # getViteConfig from astro/config
lint-staged.config.mjs
.nvmrc                        # 24
.env.example                  # PUBLIC_MARVEL_API_KEY, MARVEL_PRIVATE_KEY
design/                       # user design materials (tokens, screenshots, component examples)
src/
  layouts/MainLayout.astro    # html shell: head, fonts, manifest, Appbar, slot
  pages/
    index.astro               # prerendered home; fetches page 1 server-side
    details/[id].astro        # prerender + getStaticPaths + on-demand fallback
    api/characters.ts         # GET proxy: q, page, limit -> signed Marvel call
    404.astro
  lib/marvel/
    constants.ts              # ROOT_MARVEL_API_URL, PAGE_LIMIT
    signing.ts                # buildSignedUrl: ts + md5 hash (Web Crypto) — server-only
    marvel-client.ts          # fetchCharacters / fetchCharacterById / fetchCharacterComics
  components/
    ui/                       # design-system primitives (React + Tailwind classes)
      Typography.tsx
      Avatar.tsx
      Spinner.tsx
      LoadingPlaceholder.tsx
      Pagination.tsx
      SearchInput.tsx
    Appbar/Appbar.astro       # static header (no JS)
    CharactersExplorer/       # home island: query client + search/table/pagination state
      CharactersExplorer.tsx
      hooks.ts                # useCharactersExplorer (TanStack Query, URL sync)
      CharactersExplorer.test.tsx
    CharactersTable/          # real <table>, Tailwind classes
    SearchHeader/             # input + search icon button
    Navigation/               # wrapper around ui/Pagination
    ComicPreview/             # .astro static grid (details page)
    Loading/, ErrorBoundary/  # ported React components
  hooks/
    useMobile.ts              # matchMedia-based (replaces MUI useMediaQuery)
  styles/global.css           # @import "tailwindcss" + @theme tokens
  test/setup.ts               # @testing-library/jest-dom/vitest
  types/index.ts              # unchanged
  utils/index.ts              # isEmpty (theme import removed)
```

Removed: `src/pages/*` (Next), `src/context/`, `src/styles/`, `src/service/`,
`src/utils/theme.ts`, `src/hooks/{useIndex,useDetails,useCharactersPaginate,
useCharacterById,useCharacterComicsById,usePaginationContext,useWindowSize}.ts`,
`next.config.js`, `next-env.d.ts`, `jest.*`, `.eslintrc*`, `.eslintignore`,
`public/index.html` (CRA leftover).

### Data flow

**Home page**

1. Build time: `index.astro` frontmatter calls `fetchCharacters({page: 0,
limit: PAGE_LIMIT})` (signed, server-side) → `initialData` + `total` props.
2. Browser: `<CharactersExplorer client:load>` hydrates. A `useCharactersExplorer`
   hook holds `query` + `page` state, reads the initial `?query=` from
   `location.search`, and issues a TanStack Query `['characters', query, page]`
   against `GET /api/characters`. Server data is used as `placeholderData` for
   page 1 without query (no flash of loading).
3. `GET /api/characters` parses `q`/`page`/`limit`, signs a Marvel request
   server-side (private key never leaves the server), returns
   `{ results, total }` (total = page count).
4. Search submit → `updateQuery()` → `history.pushState` with `?query=`; row
   click → full navigation to `/details/{id}`; pagination → `gotoPage()`.
5. `Navigation` renders only when `total > 1`; hidden on details page by
   not rendering it there (no more `isDetails` route sniffing).

**Details page**

1. Build: `getStaticPaths()` fetches the first 300 characters (paginated,
   signed) → 300 prerendered pages.
2. Unknown ids: on-demand SSR at request time (hybrid fallback).
3. Frontmatter fetches character + comics signed server-side; if the character
   is missing → `Astro.rewrite('/404')`. Renders plain HTML: image, name,
   description, `ComicPreview` grid (comics open full-size in a new tab via
   real `<a target="_blank">`).

**Env vars** (Astro `import.meta.env`)

- `PUBLIC_MARVEL_API_KEY` — public, inlined (was `NEXT_PUBLIC_API_PUBLIC_KEY`).
- `MARVEL_PRIVATE_KEY` — server-only, never inlined; set as a Cloudflare Workers
  secret. Both required at build time (details prerendering + CI build).

### Design system (Tailwind v4, CSS-first)

`src/styles/global.css`:

```css
@import 'tailwindcss';

@theme {
  --color-background: #e5e5e5; /* placeholder tokens — replace from design/ */
  --color-surface: #ffffff;
  --color-ink: #555555;
  --color-line: #e5e5e5;
  --font-sans: 'PT Sans', 'PT Sans Caption', sans-serif;
}
```

- Tailwind v4 generates utilities from `@theme` (`bg-background`, `text-ink`,
  `border-line`, `font-sans`); no `tailwind.config.js`, no PostCSS config.
- UI primitives are plain React components that consume tokens via utility
  classes, one component per file, colocated tests:
  - `Typography` (variants → class maps), `Avatar`, `Spinner`, `LoadingPlaceholder`,
    `Pagination` (replaces MUI Pagination: first/last/prev/next + numbered
    buttons, `aria-current`), `SearchInput` (input + search icon button,
    replaces MUI Input/IconButton/InputAdornment).
- MUI Grid → Tailwind grid/flex; MUI Table → semantic `<table>` with
  `hidden md:table-cell` for mobile column hiding; MUI Typography → Tailwind
  text utilities or `Typography` primitive.

## Testing (Vitest)

- `vitest.config.ts` built with `getViteConfig` from `astro/config`
  (inherits Astro + Tailwind Vite plugins), `environment: 'jsdom'`,
  `setupFiles: ['src/test/setup.ts']`, colocated `*.test.{ts,tsx}`.
- Scripts: `test` (watch), `test:ci` (`vitest run` — CI entry, name kept).
- Suites: signing/URL builder (node env), API route handler (mock
  `fetchCharacters`), island components (testing-library, no MUI wrappers),
  ComicPreview via Astro container API (`@vitest-environment node`).
- Jest-specific configs (`jest.config.js`, `jest.setup.js`, `next/jest`)
  deleted.

## Tooling

- **ESLint 10** flat config `eslint.config.mjs`: `eslint-plugin-astro`
  recommended, `typescript-eslint` (ts/tsx only), `react-hooks` rules,
  `eslint-plugin-jsx-a11y` flat config, `eslint-plugin-testing-library`
  flat/react for test files, `eslint-config-prettier` last. Script `lint` →
  `eslint .`.
- **Prettier 3** + `prettier-plugin-astro`, `.prettierrc.mjs` preserving repo
  style (no semicolons, single quotes, no trailing commas), parser override
  for `*.astro`. Scripts `prettify` / `format:check`.
- **TypeScript** latest, `extends: astro/tsconfigs/strict`, `@/*` path alias
  (tsconfig + vitest). `typecheck` → `astro check` (`@astrojs/check`).
- **Husky 9** (`prepare: husky`) + **lint-staged 16**: staged
  `src/**/*.{ts,tsx,astro}` → `eslint --fix` + `prettier --write`.
- **package.json**: `"type": "module"`, `engines: { node: ">=22.12.0" }`,
  `pnpm` as package manager.
- **CI** (`.github/workflows/ci.yml`): single job — checkout, pnpm, Node 24,
  install, lint, typecheck, test:ci, build (env: both keys as secrets;
  rename `NEXT_PUBLIC_API_PUBLIC_KEY` → `PUBLIC_MARVEL_API_KEY`).

### Dependencies

- dependencies: `astro@^6`, `@astrojs/react`, `@astrojs/cloudflare`,
  `react@^19`, `react-dom@^19`, `@tanstack/react-query@^5`, `tailwindcss@^4`,
  `@tailwindcss/vite`.
- devDependencies: `typescript` (latest), `@astrojs/check`, `eslint@^10`,
  `typescript-eslint`, `eslint-plugin-astro@^3`, `eslint-plugin-jsx-a11y`,
  `eslint-plugin-react-hooks`, `eslint-plugin-testing-library`,
  `eslint-config-prettier`, `prettier@^3`, `prettier-plugin-astro`,
  `vitest`, `jsdom`, `@testing-library/react`, `@testing-library/jest-dom`,
  `@testing-library/user-event`, `@types/react`, `@types/react-dom`,
  `@types/node`, `husky@^9`, `lint-staged`.
- Removed: `next`, `@material-ui/*`, `styled-components`, `@types/styled-components`,
  `crypto-js`, `@types/crypto-js`, `uuid`, `@types/uuid`, `jest*`,
  `eslint-config-next`, `eslint-plugin-prettier` (replaced by
  `eslint-config-prettier`).

## Migration Order (tasks)

1. **Scaffold**: deps, astro config, tsconfig, tailwind, layouts skeleton,
   placeholder pages, vitest/eslint/prettier/husky/lint-staged/CI, delete
   Next/Jest/MUI/styled configs. Green: lint, test:ci, build (with `.env`).
2. **Service layer** (server-only): `lib/marvel` + Web Crypto signing +
   env wiring + unit tests.
3. **API route**: `GET /api/characters` + handler tests.
4. **Design system**: tokens from `design/` + UI primitives + tests.
5. **Home page**: `index.astro` + `CharactersExplorer` island (TanStack
   Query) + SearchHeader/CharactersTable/Navigation ports + tests.
6. **Details page**: `details/[id].astro` (getStaticPaths + fallback),
   ComicPreview (.astro), 404 page.
7. **Shell + cleanup**: MainLayout, Appbar, ErrorBoundary, `useMobile`,
   delete obsolete hooks/context/styles, port remaining tests.
8. **Docs + final verification**: README, AGENTS.md, .gitignore, env docs,
   full lint/typecheck/test/build, deploy notes for Cloudflare Workers.

## Risks & Mitigations

- **Marvel API rate limits** (3k/day): getStaticPaths = ~31 requests per build;
  CI + local builds stay well under. Keep `STATIC_CHARACTERS = 300`.
- **Cloudflare workerd vs Node**: only Web Crypto + standard fetch used in
  server code (no `node:` imports), so behavior is identical in dev and
  production.
- **`astro check`/typecheck strictness**: new code is typed from the start;
  CI blocks regressions.
- **Design materials arrive mid-execution**: Task 4 gates on `design/`;
  placeholder tokens keep the app looking like today until then.
- **Husky pre-commit reformats staged files**: expected; commit messages and
  formatting follow repo conventions.
