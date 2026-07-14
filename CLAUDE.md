# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Urithi Digital Archive — a frontend for browsing, previewing, and licensing/purchasing archival
photographs, video, audio, newspapers, and documents from the Kenya National Archives. Built with
TanStack Start (SSR), Vite, React 19, and Tailwind CSS. The backend is a separate Django REST
API (referred to in code comments as "the SDD" — see §16.2/§16.19 references in `src/lib/api/`).

## Commands

```bash
nvm use              # Node 22.12.0 is required (pinned in .nvmrc) — older versions fail with confusing errors
npm run dev           # start dev server at http://localhost:8080
npm run build         # production build
npm run lint          # ESLint
npm run format        # Prettier --write
npm run test          # vitest run (single run)
npm run test:watch   # vitest watch mode
```

Run a single test file: `npx vitest run src/test/unit/client.test.ts`
Run tests matching a name: `npx vitest run -t "some test name"`

`vitest.config.ts` is deliberately separate from `vite.config.ts` (see comment in that file) —
tests run against plain jsdom and don't load the TanStack Start/Nitro SSR plugin chain.

## Architecture

### Routing

File-based routing via TanStack Start/Router — every `.tsx` directly under `src/routes/` is a
route (see `src/routes/README.md` for the full naming convention: `$id` for dynamic segments,
`{-$category}` for optional, `$` for splat, `_layout` for layout routes). `__root.tsx` is the one
app shell; it wraps every page and must preserve `<Outlet />`. `routeTree.gen.ts` is generated —
never hand-edit it. Route files like `admin.assets.tsx` correspond to nested paths (`/admin/assets`)
via the flat-file dot convention.

### API layer (`src/lib/api/`)

This is the layer to extend when adding new backend integrations — follow the existing
auth/users pattern rather than inventing a new one:

- **`client.ts`** — the single `apiClient` (`get`/`post`/`put`/`patch`/`delete`) all API modules
  go through. Handles: base URL, bearer token attachment, JSON (de)serialization, one silent
  401-refresh-and-retry, and throwing `ApiError` (with `.status`, `.code`, `.fieldErrors()`) for
  non-2xx responses.
- **`config.ts`** — `API_BASE_URL` from `VITE_API_URL` (see `.env.example`), defaults to
  `http://localhost:8000/api/v1` in dev.
- **`types.ts`** — shared response shapes. Two response conventions exist on the backend and
  callers must know which one an endpoint uses:
  - **Enveloped** (`{success, message, data}` — `ApiEnvelope<T>`): most endpoints (`auth/*`,
    `users/*`). `apiClient` unwraps this by default (`unwrap: true`).
  - **Raw DRF** (plain ModelViewSet payloads, no envelope): `/admin/users/**` and any other
    plain ModelViewSet. Callers must pass `{ unwrap: false }` — see `admin-users.ts` for the
    pattern, including normalizing paginated (`{count, next, previous, results}`) vs. bare-array
    responses.
- **One file per resource** (`auth.ts`, `users.ts`, `admin-users.ts`): each exported function is a
  thin wrapper — JSDoc naming the HTTP verb + path, an `Input` interface if the body has shape,
  a call to `apiClient`. Side effects that must happen with a response (e.g. persisting a session
  after login) live in the API function itself, not in the calling hook.
- **`query-keys.ts`** — one `queryKeys` object, centralizing every React Query key so cache reads/
  invalidations agree on shape. Add a key here for any new resource before wiring up hooks.
- **`form-errors.ts`** — maps `ApiError.fieldErrors()` onto react-hook-form field errors.

### Hooks (`src/hooks/`)

React Query wrappers over the API layer — one file per resource (`use-account.ts`,
`use-admin-users.ts`, `use-auth-mutations.ts`). Convention: `useX()` for queries (via
`queryKeys.x`), `useCreateX`/`useUpdateX`/`useDeleteX` for mutations, each mutation invalidating
the relevant `queryKeys` entry in `onSuccess`. Components should call these hooks, never
`src/lib/api/*` directly.

### Auth (`src/lib/auth/`)

- **`token-store.ts`** — module-level auth state (not React context): access token in memory
  only, refresh token + cached user in `localStorage`. Exposes `subscribe`/`getState` (consumed
  via `useSyncExternalStore`), `setSession`, `clearSession`, `refreshAccessToken` (dedupes
  concurrent refreshes into one in-flight promise), and `bootstrapSession` (silent-restore on
  client mount, profile fetch injected as a param to avoid a dependency cycle with `api/users.ts`).
- **`use-auth.ts`** — the `useAuth()` hook read by components; exposes role flags
  (`isCustomer`, `isContentEditor`, `isAdminOrAbove`, `isSuperAdmin`) mirroring the backend's
  `accounts/models.py` roles exactly. Roles are **not** a linear hierarchy — check the specific
  flag a route/feature needs, don't assume a rank.
- **`protected-route.tsx`** — `RequireAuth` / `RequireAdmin` gate components. Since tokens live in
  `localStorage` (no session cookie), gating cannot happen during SSR — these show a loader until
  the client-side bootstrap resolves, then redirect to `/auth/login?redirect=<path>` if needed.
- **`auth-provider.tsx`** — mounted once at the app root (in `__root.tsx`), kicks off
  `bootstrapSession` on mount.

### Data: mock data → real API (in progress)

`src/lib/mock-data.ts` currently defines the `Asset`, `Collection`, `Category`, `Order` shapes and
exports static arrays (`assets`, `collections`, `categories`, `orders`) with Unsplash placeholder
`image` URLs. Several routes import directly from it: `index.tsx`, `browse.tsx`,
`asset.$slug.tsx`, `admin.assets.tsx`, plus the `account.*` routes for orders. Each mock export is
marked with a `// TODO(api): replace with GET /api/v1/...` comment pointing at its intended
endpoint.

Migrating a resource off mock data means repeating the auth/users pattern end-to-end:
1. Add response types to `src/lib/api/types.ts` (or a dedicated `assets.ts` types block) mirroring
   the backend serializer — check whether the endpoint uses the enveloped or raw-DRF convention.
2. Add `src/lib/api/assets.ts` (list/get, and collections/categories if they're separate
   endpoints) with one thin function per call, following `admin-users.ts` for paginated list
   normalization.
3. Add keys to `queryKeys` in `query-keys.ts`.
4. Add `src/hooks/use-assets.ts` with `useAssets()`/`useAsset(slug)` query hooks.
5. Swap the route's mock import for the hook, handling loading/error states (React Query's
   `isPending`/`isError`) — route loaders currently call `findAsset()` synchronously
   (`asset.$slug.tsx`), which will need to become an async loader or move the fetch into the
   component with the query hook.
6. Point `image` fields at the real backend media URL instead of the Unsplash placeholder — same
   `<img>`/component usage in `components.tsx`, no markup changes expected.

### Testing

- **Unit tests** (`src/test/unit/`) — plain Vitest, e.g. `client.test.ts` for `apiClient`
  behavior, `token-store.test.ts` for session logic.
- **Integration tests** (`src/test/integration/`) — render flows against a mocked network layer.
- **MSW** (`src/test/msw/`) — `handlers.ts` defines mock responses matching the real Django API
  contract (envelope vs. raw DRF, error shapes) for `http://localhost:8000/api/v1`; `server.ts`
  wires it into `src/test/setup.ts`. When adding a new API module, add matching handlers here for
  any tests that exercise it.

### Path alias

`@/*` maps to `src/*` (defined in `tsconfig.json`; also provided by the Lovable Vite config —
don't re-add `tsConfigPaths` manually, see the comment in `vite.config.ts`).

## Notes

- This repo is connected to Lovable (see `AGENTS.md`): avoid rewriting published git history
  (force-push, rebase/amend/squash of pushed commits) since it desyncs Lovable's copy of history.
- `vite.config.ts` is pre-wired by `@lovable.dev/vite-tanstack-config` with TanStack Start, React,
  Tailwind, path aliases, and env injection already included — don't add those plugins again.
