# Database: Snowflake

The default warehouse for ISW work.  Connection via native OAuth SSO (preferred at ISW) or service account with key-pair auth (preferred for personal projects).

## Required env vars

Capture in `.env.local` (gitignored) and a `.env.example` template in the repo.

- `SNOWFLAKE_ACCOUNT` (e.g. `xp97223-edw`)
- `SNOWFLAKE_USERNAME`
- `SNOWFLAKE_PASSWORD` or `SNOWFLAKE_PRIVATE_KEY_PATH`
- `SNOWFLAKE_WAREHOUSE`
- `SNOWFLAKE_DATABASE`
- `SNOWFLAKE_SCHEMA` (default schema for unqualified table references)
- `SNOWFLAKE_ROLE`

## SDKs

- Node: `snowflake-sdk`
- Python: `snowflake-connector-python`
- .NET: official Snowflake ADO.NET provider (or Dapper on top)

## MCP setup

For Claude.ai and Claude Code, configure a Snowflake MCP server with read-only credentials scoped to the authorized schemas.  Verify the connection with:

```sql
SELECT current_database(), current_schema(), current_user(), current_role();
```

If that returns expected values, the channel is open.  If it errors, see the "Common failure modes" section below.

Common MCP failure modes:

- "Cannot connect": wrong account identifier format.  Snowflake account IDs have several valid formats (legacy `xp97223-edw` vs newer `xp97223.us-east-1`); the MCP server usually expects a specific one.
- "Role does not have USAGE on warehouse": grant explicitly with `GRANT USAGE ON WAREHOUSE <wh> TO ROLE <role>`.
- "Connection succeeds but tables not found": schema/database context issue.  Qualify queries with full `database.schema.table` paths to confirm.
- "Queries timeout after 30s": some MCP servers have aggressive default timeouts.  Increase to 5 minutes for exploration.
- "Claude is making things up": MCP isn't actually connected, Claude is generating fabricated results.  Run the verification query immediately.

## Query patterns

Fully qualify table names as `DATABASE.SCHEMA.TABLE` in code that will be committed.  Unqualified names work in interactive exploration but break when someone runs the script under a different default context.

When the project includes the hybrid SQLite cache pattern, Snowflake is the **primary source**.  The snapshot job reads from Snowflake, writes to SQLite, uploads to blob storage.  The app never queries Snowflake directly in production.

Stream large result sets.  Loading >100k rows into memory will hit Node heap limits.  Use the SDK's streaming interface and write to SQLite in batches.

## Three-layer architecture (ISW convention)

ISW Snowflake follows `RAW` / `REFINED` / `CONSUMER`:

- `INBOUND_RAW.*` -- Fivetran or similar mirrors.  Treat as source of truth, never modified.
- `REFINED.*` -- cleaned, typed, history-tracked.  Joinable layer.
- `CONSUMER.*` -- business-ready data marts.  This is the layer the app reads.

For data work, prefer `CONSUMER.*` as the source.  Only descend to `REFINED` or `INBOUND_RAW` when validating or when the consumer layer doesn't yet expose what you need.

## SCD Type 2 history

When tracking change-over-time on a dimension, use the reusable `LOAD_SCD2_HISTORY` stored procedure pattern (already in production for ISW work).  Don't reinvent the SCD2 logic per table.

## Cortex and other Snowflake-native features

Cortex functions (`SNOWFLAKE.CORTEX.COMPLETE`, `SUMMARIZE`, `TRANSLATE`, etc.) are authorized for use when they fit.  Prefer Cortex over external LLM calls when the data already lives in Snowflake, to avoid moving data out of the warehouse boundary.

## SQL style

Standard header on every committed SQL file:

```sql
-- File: warehouse/marts/customer_status.sql
-- Purpose: Active customer status per account, as of latest snapshot date.
-- Grain: One row per ACCOUNT_ID.
-- Validates against: PBI Customer Health dashboard, finance monthly review.
-- Last updated: 2026-05-23 (Claude Code)
```

Indent with 4 spaces.  Capitalize keywords.  Lead joins with the join type (`LEFT JOIN`, not just `JOIN`).  Trailing commas in SELECT lists are fine and reduce diff noise.

## Things to never do

Don't write to `INBOUND_RAW.*` ever, even in scratch sessions.  It's mirrored from source systems and changes get overwritten.

Don't reuse table aliases across CTEs in the same query.  It compiles but makes debugging painful.

Don't hardcode account IDs, contract IDs, or other identifiers in committed SQL.  Parameterize or use a config table.

Don't grant write permissions to an MCP role.  Read-only must mean read-only.  Test by attempting a `CREATE TABLE` -- it should error.
