# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

A two-part app that exposes a paginated Salesforce Accounts list/create UI:

- `salesforce-app/` — Express 5 API server that authenticates to Salesforce via JWT Bearer OAuth and proxies Account queries/creates through `jsforce`.
- `salesforce-app/client/` — React 19 + TypeScript + Vite SPA that consumes the API.

## Commands

Run these from within `salesforce-app/` (server) or `salesforce-app/client/` (frontend) — there is no root-level package.json.

### Server (`salesforce-app/`)
```
npm start          # node src/index.js — starts Express on PORT (default 3000)
```
No test suite or linter is configured for the server (`npm test` is a stub that exits 1).

### Client (`salesforce-app/client/`)
```
npm run dev         # Vite dev server (proxies /accounts -> http://localhost:3000, see vite.config.ts)
npm run build        # tsc -b && vite build
npm run lint          # eslint .
npm run test          # vitest run
npm run test:watch     # vitest (watch mode)
```
Run a single test file: `npx vitest run src/tests/hooks/useAccounts.test.ts`. Tests live under `src/tests/`, mirroring the structure of `src/` (api, components, hooks). Vitest uses `jsdom` with setup file `src/tests/setup.ts`.

Both the server and client must run simultaneously in dev: start the server (`npm start` in `salesforce-app/`) on port 3000, then the client dev server, which proxies `/accounts` requests to it.

## Architecture

### Salesforce auth (`salesforce-app/src/salesforce.js`)
Authenticates using the JWT Bearer flow, not username/password/OAuth code exchange:
- Signs a JWT assertion with the private key at `salesforce-app/certs/server.key` (RS256), claiming `iss=SF_CLIENT_ID`, `sub=SF_USERNAME`, `aud=SF_LOGIN_URL`.
- Exchanges the assertion for an access token at `${SF_LOGIN_URL}/services/oauth2/token`.
- Caches a single module-level `connection` (jsforce `Connection`) across requests — there is no per-request auth.
- `withConnection(fn)` is the entry point routes should use: it wraps `getConnection()` and, on an `INVALID_SESSION_ID` error, discards the cached connection and retries once with a fresh token. Routes should never call `getConnection()` directly — always go through `withConnection` so session expiry is handled transparently.

Required env vars (see `.env.example`, actual `.env` is gitignored): `SF_LOGIN_URL`, `SF_USERNAME`, `SF_CLIENT_ID`, `PORT`. The `certs/` directory (private key + cert) is also gitignored and must be provisioned locally / out-of-band — it's required for the JWT flow to work.

### API routes (`salesforce-app/src/routes/accounts.js`)
- `GET /accounts` — paginated list (`page`, `pageSize` query params, pageSize capped at 100), runs a `COUNT()` and a `LIMIT/OFFSET` SELECT in parallel via `withConnection`, returns `{ records, page, pageSize, totalSize, totalPages }`.
- `POST /accounts` — creates an Account from `req.body` via `conn.sobject('Account').create(...)`; Salesforce validation errors surface as `400 { errors }`, unexpected failures as `500 { error }`.

### Client structure (`salesforce-app/client/src`)
- `hooks/useAccounts.ts` — owns all list state (accounts, page, pageSize, totalSize, totalPages, loading, error) and fetch-on-mount/dependency-change logic; exposes `reload`, `setPage`, `changePageSize`, `goToFirstPage`. This is the single source of truth for pagination state — components read from it rather than managing their own.
- `hooks/useTheme.ts` — light/dark/system theme preference, persisted to `localStorage` (absence of a stored key means "system"), applied via `document.documentElement.dataset.theme` and synced live with `prefers-color-scheme`.
- `api/accounts.ts` — thin `fetch` wrappers (`fetchAccounts`, `createAccount`) against relative `/accounts` URLs; relies on the Vite dev proxy (or, in production, the same origin) to reach the Express server. Error responses are normalized via `extractErrorMessage`, which prefers Salesforce's `errors[].message` array over a plain `error` string.
- `components/` — presentational pieces (`AccountsTable`, `Pagination`, `NewAccountModal`, `ErrorBanner`, `ThemeToggle`) driven by props from `App.tsx`, which composes `useAccounts` + `useTheme` and has no other state of its own beyond whether the "new account" modal is open.
- `types.ts` — shared `Account`, `AccountsResponse`, `NewAccountInput` types used by both `api/` and `components/`.
