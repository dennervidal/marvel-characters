# marvel characters

[![CI](https://github.com/dennervidal/marvel-characters/actions/workflows/ci.yml/badge.svg)](https://github.com/dennervidal/marvel-characters/actions/workflows/ci.yml)

Character database built with Astro 7 and React 19 islands, styled with a Tailwind v4 neo-brutalist
design system. The homepage lists and searches characters; details pages show each character's full profile
and powerstats. Data comes from the SuperHero API (`superheroapi.com`) — all universes (Marvel, DC, and more),
no comics data; images are superherodb portraits.

## stack

- Astro 7 — static output on the Cloudflare Workers adapter, pages in `src/pages/`
- React 19 islands with `client:*` directives, TanStack Query v5 for client-side data fetching
- Tailwind CSS v4 — CSS-first design tokens via `@theme` in `src/styles/global.css` (no config file)
- Vitest + Testing Library, ESLint 10 (flat config), Prettier 3, TypeScript 6 (strict)
- Node >= 22.12 (24 in CI), pnpm 11 (pinned via the `packageManager` field; CI's `pnpm/action-setup` uses the same version)

## getting started

Copy `.env.example` to `.env` and set `API_TOKEN` — a 32-character SuperHero API key from
<https://superheroapi.com/>. It is required at runtime — local `.env` for `pnpm run dev`, the Cloudflare
Workers `API_TOKEN` secret binding in production — **not** at build: `pnpm run build` works without it.

```bash
pnpm install
cp .env.example .env  # set API_TOKEN
pnpm run dev
```

## commands

| command              | description                          |
| -------------------- | ------------------------------------ |
| `pnpm run dev`       | start the dev server                 |
| `pnpm run build`     | build to `dist/`                     |
| `pnpm run preview`   | preview the production build locally |
| `pnpm run test`      | run tests in watch mode              |
| `pnpm run test:ci`   | run tests once (CI)                  |
| `pnpm run lint`      | eslint                               |
| `pnpm run typecheck` | `astro check`                        |
| `pnpm run prettify`  | prettier write                       |

## folder structure

- `src/components` — feature components (`CharactersExplorer`, `CharactersTable`, `PowerStats`, shell pieces)
  and `ui` primitives (`Avatar`, `Pagination`, `SearchInput`, `Skeleton`, `Typography`, ...)
- `src/layouts` — `MainLayout.astro` app shell (fonts, favicon, manifest, appbar)
- `src/lib/heroes` — server-only client (`heroes-client.ts`) for the SuperHero API
- `src/pages` — `index.astro`, `404.astro`, on-demand `details/[id].astro`, and `api/characters.ts` server endpoint
- `src/styles` — `global.css` with Tailwind v4 theme tokens and brutalist component classes
- `src/types`, `src/utils`, `src/test` (vitest setup)
- `public` — `favicon.png`, `manifest.json`, `robots.txt`, `assets`

## testing

Tests are colocated as `*.test.tsx` next to the code. Component tests render inside Testing Library + jest-dom
(`src/test/setup.ts`); `.astro` components are tested with the Astro container API.

## deploy (Cloudflare Workers)

The app runs as a Cloudflare Worker (`@astrojs/cloudflare`); `pnpm run build` emits
`dist/server/wrangler.json`, and deploys are manual `wrangler` commands against that config:

- Build: `pnpm run build`
- Set the API key once per Worker: `wrangler secret put API_TOKEN` — a Workers secret binding shared
  by every deployed version and preview, read at runtime via `astro:env` (never inlined into the build)
- Branch previews: `wrangler versions upload --config dist/server/wrangler.json --preview-alias <branch>`
  → `<branch>-marvel-characters.denner-vidal.workers.dev`
- Production rollout: `wrangler versions deploy <version-id> --config dist/server/wrangler.json`

Details pages render on-demand and are edge-cached by Cloudflare; `/api/characters` also uses
`API_TOKEN` at runtime.
