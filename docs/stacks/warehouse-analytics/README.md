# Stack profile: warehouse-analytics

For projects where the input is data in a SQL warehouse and the output is a dashboard or analytical app.

This is the most mature profile in the template, evolved from the ISW ARR Intelligence Dashboard pattern.

## Profile summary

**Shape**: warehouse + thin app
**Default stack**: Snowflake (or other warehouse) + Node/Express backend + Vite/React frontend + SQLite local cache + Azure App Service deployment + blob storage for snapshot handoff
**Branch model**: dev/main with auto-deploy on push to main
**Phase model**: discovery, concept exploration, mart design, app development

The defining principle is "business logic in SQL, not in application code".  The app filters, orders, and paginates pre-aggregated mart data.  When a definition changes, you change SQL, not application code.

## Docs in this profile

- `EXPLORATION_PLAYBOOK.md` -- the four-phase methodology in detail
- `APP_KICKOFF.md` -- run once when the app scaffold is being instantiated for the first time
- `DEPLOYMENT.md` -- Azure App Service + Blob Storage pattern with hybrid SQLite cache
- `SCHEMA.md` -- the mart layer contract documentation pattern
- `BUSINESS_LOGIC.md` -- the "why" behind non-obvious calculations
- `LINEAGE.md` -- source-to-mart paths for debugging upstream

## What the kickoff sets up

When you pick this profile in `docs/PROJECT_KICKOFF.md`, the kickoff:

1. Confirms which warehouse backend (Snowflake by default, but SQL Server and Postgres are also covered in `docs/databases/`).
2. Asks about authorized data scope (which schemas, which tables, which are out of scope).
3. Confirms whether the project will use the hybrid SQLite + Blob Storage pattern (almost always yes for warehouse-analytics) or query the warehouse directly from the app (rare).
4. Plans the four-phase work: discovery, concept exploration, mart design, app development.

After kickoff, the typical first sessions are Phase 1 discovery: connecting Claude to the warehouse via MCP and producing `DATA_INVENTORY.md`.

## What stays and what goes

When the kickoff confirms warehouse-analytics, the following template folders are relevant and stay:

- `app/` -- the Vite+React+Express+SQLite scaffold is built for this profile
- `exploration/` -- concept, inventory, proposal, validation templates
- `warehouse/` -- date_dim template, marts folder, staging folder

For non-warehouse-analytics profiles, these folders should be removed during kickoff.

## Reference projects

The ISW ARR Intelligence Dashboard at https://github.com/joshuatingle/poc_isw-arr-dashboard is the most polished reference implementation of this profile.

The ISW Active Customers project (private) is a second instantiation that shaped the template's "exploration concepts" pattern.
