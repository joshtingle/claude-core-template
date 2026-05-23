# Data Inventory

The map of the project's source data.  Built during early exploration.  Updated whenever new sources come into scope.  Skip this file if the project has no external data sources.

## Connection details

Database backend: ____ (matches `docs/databases/<backend>.md`)
Account / host: ____
Authorized schemas or databases: ____
Connection method: ____ (e.g. SSO, key-pair, connection string in env var)
Access mode: read-only (this should be the default; flag any exceptions)

Reference the `docs/databases/<backend>.md` file for the exact env var names and patterns for this backend.

## Source systems

Where does the data in scope originate?  Internal applications, third-party APIs, Salesforce, NetSuite, file drops, etc.  Capture enough context that someone unfamiliar with the project can orient themselves.

## In-scope tables, files, or endpoints

For each data source the project will reference, capture:

| Source | Appears to represent | Grain (one row per...) | Approx row count | Last updated | Notes |
|--------|---------------------|------------------------|------------------|--------------|-------|
| (name) | (one-line hypothesis) | (account, account-month, etc.) | (rough) | (timestamp pattern) | (anything odd) |

For warehouse-analytics projects, detailed notes on each table live in `exploration/inventory/<table_name>.md`.  This summary table is the index.

## Sources explicitly out of scope

If certain schemas, tables, files, or APIs are explicitly NOT to be queried during exploration, document them here with the reason.

## Refresh patterns

Document how often each source updates and what the typical lag is.  This matters for understanding when "stale" data is actually a problem versus expected.

## Known data quirks

Catch-all for things that don't fit elsewhere but future you should know: deprecated columns still populated, columns with misleading names, sources that look related but aren't, etc.
