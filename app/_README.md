# Application Layer

Phase 4 of the project. The application is a thin reader over the mart layer in `warehouse/marts/`. Business logic lives in SQL, not here.

## Layout

```
app/
  frontend/     -- Vite + React shell with ISW theme system, layout primitives, welcome modal
  backend/     -- Express + SQLite cache, optional Snowflake snapshot, Azure Blob sync
  docker-compose.yml  -- backend on :3001, frontend (nginx) on :3000
  .env.example        -- environment variables for both services
```

This scaffolding ships pre-wired with insightsoftware brand styling and the same hybrid architecture pattern documented in `docs/DEPLOYMENT.md` (warehouse -> blob -> app cache).

## Before you do anything else

The scaffolding contains placeholder tokens (`__PROJECT_SLUG__`, `__PROJECT_NAME__`, `__APP_TITLE__`, `__DEFAULT_ROUTE__`). Run the Phase 4 intake described in `docs/APP_KICKOFF.md`. That walks Claude through asking the user for the right values and replacing them throughout the scaffolding.

You normally don't have to ask for this. CLAUDE.md instructs Claude Code to detect the un-replaced placeholders on session start and run the kickoff autonomously the first time you give an app-related instruction.

Do not skip the intake. The placeholders show up in package.json names, localStorage keys, the browser tab title, the sidebar logo, and the React Router redirect target. A missed replacement breaks something subtle.

## Principles when you build the app

The app is thin. It reads marts. It does not compute business logic.

Every query the app runs against marts should be a SELECT with filtering, ordering, and pagination. No SUM, no GROUP BY, no CASE statements that encode business rules. If you need aggregation in the app, that aggregation belongs in a mart.

Define a typed schema (TypeScript types, Zod schemas, etc.) for every mart's row shape if the project warrants it. Queries should be typed when the project is large enough that schema drift matters.

Period logic comes from `date_dim` joins, not JavaScript date arithmetic.

Reuse the deployment pattern in `docs/DEPLOYMENT.md` unless there's a specific reason not to.

## What ships in this scaffolding

Frontend (`app/frontend/`):

- Theme system with five themes (default, dark, soft, light-blue, light-green) and persistence to localStorage
- Design tokens (`src/styles/tokens.css`) and theme overrides (`src/styles/themes.css`) with full ISW brand palette and Poppins
- Layout primitives: `PageShell`, `Section`, `Grid`, `TwoCol`, `LoadingState`, `ErrorState`, `EmptyState`
- `ThemePicker` dropdown, `Tooltip`, `WelcomeModal` (parameterizable page directory), `UnderConstruction` overlay
- Generic `KpiCard` (decoupled from any specific currency formatter -- pass your own via the `formatter` prop)
- Generic formatters (`utils/format.js`): formatNumber, formatPct, formatDate, formatMonth, deltaPct, formatRelativeMonth
- Minimal API helper (`utils/api.js`) wired with admin endpoints by default; project adds the rest
- `useApi` / `usePaginatedApi` hooks
- Fixed sidebar + topbar + react-router shell in `App.jsx`

Backend (`app/backend/`):

- Express bootstrap with helmet, CORS, rate limiting, error handler
- SQLite connection helpers (`db/database.js`) with `reloadDb()` so blob-swap doesn't require restart
- Azure Blob download/upload with atomic-swap retries (`services/blobSync.js`); no-op when not configured
- Snapshot state singleton (`services/snapshotState.js`) shared between cron and admin route
- Admin routes: `/data-currency`, `/snapshot-status`, `/snapshot-history`, `/refresh`
- Snapshot job template (`jobs/snapshot.example.js`) showing the Snowflake-stream + atomic-swap pattern -- fill in `TABLES` and rename to `snapshot.js`

What's intentionally NOT included: a working snapshot job (project decides which marts), specific page components, business-logic services, or charts/visualization library (project decides on Chart.js, Recharts, Tremor, etc.).

## Quick local boot (after kickoff is complete)

```
cd app/backend  && npm install && npm run dev   # http://localhost:3001
cd app/frontend && npm install && npm run dev   # http://localhost:3000
```

The frontend dev server proxies `/api/*` to the backend on :3001.
