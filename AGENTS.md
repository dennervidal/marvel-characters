# AGENTS.md

## Stack (non-obvious bits)

- Next.js **12 pages router** (`src/pages/`) — no `app/` dir, no `next/navigation`. React 18 + TypeScript (strict).
- Package manager is **pnpm** (do not add package-lock/yarn.lock). Node >= 14, pnpm >= 7.
- Material UI **v4** (`@material-ui/*`, not MUI v5 `@mui/*`) + styled-components for overrides; both themes are layered
  in `src/pages/_app.tsx`.
- Default git branch is `master`.

## Commands

- `pnpm run dev` — dev server on :3000
- `pnpm run test` — `jest --watch` (interactive; **never use in CI/automation**)
- `pnpm run test:ci` — one-shot jest run (this is what CI uses); add a path to run one suite, e.g.
  `pnpm run test:ci src/components/CharactersTable`
- `pnpm run lint` — `next lint`
- `pnpm run build` — **requires a `.env` file** (see below); `getStaticProps` in `src/pages/index.tsx` hits the Marvel
  API at build time and fails without valid keys
- `pnpm run prettify` — prettier write (repo style: no semicolons, single quotes, trailing comma none)

## Environment

Copy `.env.example` to `.env` with both keys from https://developer.marvel.com:

- `NEXT_PUBLIC_API_PUBLIC_KEY`
- `MARVEL_PRIVATE_KEY`

Marvel API auth: `getInitialPropsUrl()` in `src/service/functions.ts` signs requests with an MD5 hash of
`ts + MARVEL_PRIVATE_KEY + public key` (used server-side at build time only). Client-side calls (`getCharactersList`)
send only the public key. If you add a new signed request, follow the same ts/hash pattern.

## Architecture conventions

- Feature components live in `src/components/<Feature>/` with this layout: `Feature.tsx`, `hooks.ts` (logic/data
  fetching), `styled.ts` or `styled.tsx`, `index.ts`, and a colocated `*.test.tsx`. Mirror this for new components.
- Data access goes through the static methods in `src/service/MarvelCharacterApiService.ts`; pages use per-page hooks (
  `src/hooks/useIndex.ts`, `useDetails.ts`, ...) that call the service.
- Absolute imports rooted at `src` (`baseUrl` in tsconfig, mirrored in jest `modulePaths`) — e.g.
  `import { useIndex } from 'hooks'`. Do not use relative imports across top-level dirs.
- Pagination state is shared via `src/context/PaginationContextProvider`.

## Testing

- Tests are colocated `*.test.tsx`; eslint applies testing-library rules only to test files.
- Component tests render inside MUI `ThemeProvider` (`theme` from `utils`); expect tests to need the same wrapper (
  jest.setup.js only registers jest-dom).
- No mock/API test helpers exist; service tests would need to mock `fetch`.

## Git hooks

Husky pre-commit runs lint-staged, which lints + runs `prettify` + re-adds `src/` on staged `src/**/*.{tsx,ts}` files.
Expect staged files to be reformatted by the commit; don't hand-format against prettier.
