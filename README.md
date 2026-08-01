# marvel characters

[![CI](https://github.com/dennervidal/marvel-characters/actions/workflows/ci.yml/badge.svg)](https://github.com/dennervidal/marvel-characters/actions/workflows/ci.yml)

Marvel characters database built with Astro 7 and React 19 islands, styled with a Tailwind v4 neo-brutalist
design system. The homepage lists and searches characters; details pages show each character's info and comics.

## stack

- Astro 7 — static output on the Cloudflare Pages adapter, pages in `src/pages/`
- React 19 islands with `client:*` directives, TanStack Query v5 for client-side data fetching
- Tailwind CSS v4 — CSS-first design tokens via `@theme` in `src/styles/global.css` (no config file)
- Vitest + Testing Library, ESLint 10 (flat config), Prettier 3, TypeScript 6 (strict)
- Node >= 22.12 (24 in CI), pnpm 11 (pinned via the `packageManager` field; CI's `pnpm/action-setup` uses the same version)

## getting started

No API keys or `.env` required: data comes from the built-in mock provider in `src/lib/marvel/` until the
SuperHero API integration lands. `TOKEN` in `.env` (see `.env.example`) is reserved for that integration.

```bash
pnpm install
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

- `src/components` — feature components (`CharactersExplorer`, `CharactersTable`, `ComicPreview`, shell pieces)
  and `ui` primitives (`Avatar`, `Pagination`, `SearchInput`, `Spinner`, `Typography`, ...)
- `src/layouts` — `MainLayout.astro` app shell (fonts, favicon, manifest, appbar)
- `src/lib/marvel` — server-only client (`marvel-client.ts`) backed by the mock data provider (`mock-data.ts`)
- `src/pages` — `index.astro`, `404.astro`, dynamic `details/[id].astro`, and `api/characters.ts` server endpoint
- `src/styles` — `global.css` with Tailwind v4 theme tokens and brutalist component classes
- `src/types`, `src/utils`, `src/test` (vitest setup)
- `public` — `favicon.png`, `manifest.json`, `robots.txt`, `assets`

## testing

Tests are colocated as `*.test.tsx` next to the code. Component tests render inside Testing Library + jest-dom
(`src/test/setup.ts`); `.astro` components are tested with the Astro container API.

## deploy (Cloudflare Pages)

- Build command: `pnpm run build`
- Output directory: `dist/`
- Runtime: Node 24
- No environment variables needed — the mock provider serves data until the SuperHero API integration lands;
  add `TOKEN` (the SuperHero API key) only then.
