# App Kickoff (warehouse-analytics)

When the project reaches the point of building the application layer, the `app/` folder already contains a working frontend + backend scaffolding.  Before doing anything else with it, run this intake.

If you (Claude) are reading this because the user gave an instruction touching the app, run intake before touching code.  The scaffolding contains placeholder tokens that need real values; missing one silently breaks the localStorage key, browser tab title, or default route.

## Intake questions to ask

Work through these conversationally.  Adapt order based on what the user offers first.

### Identity

What's the project slug?  Kebab-case, used in `package.json` names and localStorage keys so the app's saved theme doesn't collide with another tool the user has open in another tab.  Examples: `cust-overview`, `pipeline-health`, `arr-intel`.

What's the human-readable project name?  Shows up in the sidebar header and the welcome modal title.  Examples: `Customer Overview`, `Pipeline Health`, `ARR Intelligence`.

What's the browser tab title?  Convention is `<Name>`.  If the user wants a brand suffix (e.g. `[isw]`), capture that here.

### Navigation

What's the first/default page route?  Convention is a kebab-case route under `/`.  Examples: `/executive`, `/overview`, `/home`.  This is what `/` redirects to and what the placeholder Home nav entry points at.

What other pages will live in the sidebar nav?  Ask for label + Font Awesome icon class + intended route for each.  The user often won't know all of them yet -- that's fine, capture what they do know and leave the rest for later.

### Themes

The scaffolding ships five themes: default, dark, soft, light-blue, light-green.  Does the user want all five enabled?  Any to remove?  Any new one to add?  This affects `src/context/ThemeContext.jsx` and `src/styles/themes.css`.

### Backend wiring

Will the app cache snapshot data from the warehouse locally (the established pattern from `DEPLOYMENT.md`)?  Almost always yes.  If yes, the snapshot job needs to be filled in.  If no (rare), strip the snapshot pieces.

Which marts will the snapshot pull?  This populates the `TABLES` list in `jobs/snapshot.example.js`.  The user usually has this from the Phase 3 mart approvals.

### Brand

If the project's `CLAUDE.md` has a populated "Brand and styling" section, use those colors.  If not, run brand intake briefly here.

The default scaffold uses ISW colors (Brand Green `#31AB46`, Brand Blue `#007AC9`, Navy `#1E2556`, etc.) baked into `app/frontend/src/styles/tokens.css`.  If the project has different brand colors, the tokens file needs to be updated.

## Placeholder replacements

Once you have the answers, do a project-wide search-and-replace across `app/`:

| Token | Replace with |
|---|---|
| `__PROJECT_SLUG__` | kebab-case slug |
| `__PROJECT_NAME__` | human-readable name |
| `__APP_TITLE__` | browser tab title |
| `__DEFAULT_ROUTE__` | first nav route (include the leading slash) |

After replace, verify with `grep -rE "__PROJECT_SLUG__|__PROJECT_NAME__|__APP_TITLE__|__DEFAULT_ROUTE__" app/`.  Expected hit count: zero.  Note: `__PROJECT_ROUTES__` is intentionally left in `server.js` as a marker comment showing where to register new routes -- do NOT replace it.

Files that contain these tokens:

- `app/frontend/package.json` (name)
- `app/frontend/index.html` (title)
- `app/frontend/src/App.jsx` (logo text, NAV_ITEMS, default Route redirect, HomePage)
- `app/frontend/src/context/ThemeContext.jsx` (STORAGE_KEY)
- `app/frontend/src/components/WelcomeModal.jsx` (STORAGE_KEY, modal title)
- `app/backend/package.json` (name, description)
- `app/backend/server.js` (boot log message; route registration markers)
- `app/backend/jobs/snapshot.example.js` (rename to `snapshot.js` once filled in)

## Additional setup steps

After placeholder replacement:

1. Drop a project favicon at `app/frontend/public/favicon.png` (the scaffold doesn't ship one).

2. If using Font Awesome Pro icons, set `VITE_FA_KIT_URL` in `app/.env` and add the deployed domain to the kit settings on fontawesome.com.  The icons used in the scaffold (sidebar nav, theme picker, welcome modal) rely on the Pro Light family.

3. If the project uses the blob deployment pattern, populate `AZURE_STORAGE_CONNECTION_STRING` in `app/.env`.  In local dev this can stay empty; `blobSync.js` is a no-op without it.

4. Fill in `app/backend/jobs/snapshot.example.js` with the project's mart tables, then rename to `snapshot.js`.  Update `app/backend/server.js` and `app/backend/routes/admin.js` if you renamed the file (they currently `require('./jobs/snapshot.example')`).

5. Update `CLAUDE.md` "Project identity" section with the app stack choices (chart library if any, deployment target).  Add a `CHANGES.md` entry.

## Verification checklist

Run the scaffolding end-to-end before declaring kickoff complete:

```
cd app/backend  && npm install && npm run dev   # check :3001/health returns ok
cd app/frontend && npm install && npm run dev   # open http://localhost:3000
```

In the browser:

- Sidebar shows the project name and the first nav entry
- Theme picker (top right) cycles all enabled themes and the choice persists across reload
- Welcome modal appears on first load; About link in sidebar reopens it
- `/api/admin/snapshot-status` returns `{ latest: null, running: false }` without crashing
- `POST /api/admin/refresh` logs "snapshot.example.js: TABLES list is empty" (expected until you fill in the snapshot job)

If any of those fail, fix before moving on.  The scaffold is small enough that a clean boot is the right ground truth.

## What this kickoff does NOT do

It does not choose a chart library, state-management library, or testing framework.  The scaffold is intentionally framework-light.  Add what the project actually needs.

It does not deploy anything.  See `DEPLOYMENT.md` for that.

It does not validate that the app's data matches the warehouse's truth.  That's Phase 2 work re-running against the snapshot once the snapshot job is wired.
