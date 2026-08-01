# AGENTS.md

## Stack (non-obvious bits)

- Astro 7 with static output on the Cloudflare adapter (`output: 'static'` in `astro.config.mjs`). Pages live in
  `src/pages/` as `.astro` files — `index.astro`, `404.astro`, dynamic routes like `details/[id].astro`
  (prerendered via `getStaticPaths`, missing ids `Astro.rewrite` to `/404`), and server endpoints in
  `src/pages/api/` (`characters.ts`, `prerender = false`).
- React 19 islands with `client:*` directives (home explorer uses `client:load`); TanStack Query v5 for
  client-side fetching.
- Tailwind CSS v4, CSS-first: design tokens via `@theme` in `src/styles/global.css`, **no tailwind config
  file**; the plugin is wired through `@tailwindcss/vite` in `astro.config.mjs`.
- TypeScript 6 strict (`extends: astro/tsconfigs/strict`) with the `@/*` → `src/*` path alias.
- Package manager is **pnpm** (do not add package-lock/yarn.lock). Node >= 22.12, Node 24 in CI.

## Commands

- `pnpm run dev` — astro dev server
- `pnpm run test` — vitest watch (interactive; **never use in CI/automation**)
- `pnpm run test:ci` — one-shot vitest run (this is what CI uses); add a path to run one suite, e.g.
  `pnpm run test:ci src/components/CharactersExplorer`
- `pnpm run lint` — eslint (flat config, `eslint.config.mjs`)
- `pnpm run typecheck` — `astro check`
- `pnpm run build` — `astro build`; **needs no `.env`** (mock data provider, see below)
- `pnpm run prettify` — prettier write (repo style: no semicolons, single quotes, trailing comma none)

## Environment

`.env.example` (and the local `.env`) contains a single reserved key:

- `TOKEN` — SuperHero API key for the upcoming integration; **unused today**.

Data is served by the mock provider in `src/lib/marvel/` (`mock-data.ts` + `marvel-client.ts`). No environment
variable is read at build or runtime.

## Architecture conventions

- Feature components live in `src/components/<Feature>/` with this layout: `Feature.tsx`, `hooks.ts`, `index.ts`,
  and a colocated `*.test.tsx`. Mirror this for new components. Shared UI primitives live in
  `src/components/ui/`.
- Data access goes through `src/lib/marvel/marvel-client.ts` (`fetchCharacters`, `fetchCharacterById`,
  `fetchCharacterComics`) — **server-only**: called from Astro frontmatter and API routes, never from islands.
- Islands fetch through `src/pages/api/*` (e.g. `GET /api/characters?q=...&page=...`).
- Imports use the `@/*` alias rooted at `src` — e.g. `import { fetchCharacters } from '@/lib/marvel/marvel-client'`.
  Do not use relative imports across top-level dirs.
- The app shell is `src/layouts/MainLayout.astro`.

## Testing

- Tests are colocated `*.test.{ts,tsx}`; vitest + Testing Library; eslint applies testing-library rules only to
  test files.
- jest-dom matchers are registered in `src/test/setup.ts`.
- `.astro` components are tested with the Astro container API.

## Git hooks

Husky pre-commit runs lint-staged: `eslint --fix` + `prettier --write` on staged `src/**/*.{ts,tsx,astro}` files,
and prettier on `*.{json,css,md,mjs}`. Expect staged files to be reformatted by the commit; don't hand-format
against prettier.
