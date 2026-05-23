# Database: SQL Server (Azure SQL)

For Azure SQL Database (PaaS) and Azure SQL Managed Instance.

## Connection

Azure Active Directory authentication when possible, SQL authentication when AAD isn't available.  Connection details in `.env.local` (gitignored).

Required env vars:

- `AZSQL_SERVER` (e.g. `myserver.database.windows.net`)
- `AZSQL_DATABASE`
- `AZSQL_USERNAME` (omit for AAD)
- `AZSQL_PASSWORD` (omit for AAD)
- `AZSQL_AUTH_METHOD` (`sql` or `aad-default` or `aad-msi`)

## SDKs

- Node: `mssql` (the tedious-based driver)
- .NET: `Microsoft.Data.SqlClient` (not the older `System.Data.SqlClient`)
- Python: `pyodbc` with the Microsoft ODBC driver for SQL Server

## Firewall

Azure SQL requires the client IP to be allowlisted on the server firewall, or for the server to allow Azure services.  When deploying to Azure App Service, enable "Allow Azure services and resources to access this server" or use a private endpoint.  When connecting from a dev machine, add the dev IP explicitly.

When introducing a new deployment target, remind the user to update the firewall rules.

## Query patterns

Fully qualify with `DATABASE.SCHEMA.TABLE` for clarity, even though Azure SQL accepts schema-qualified names without the database prefix.  When working across multiple databases, always qualify.

Use `OFFSET ... FETCH NEXT` for pagination, not `TOP` with subqueries.

Avoid `SELECT *` in committed code.

Use `MERGE` cautiously.  It has well-documented edge cases around concurrent inserts.  For high-concurrency upsert patterns, prefer explicit `INSERT` + `UPDATE` with `WHERE NOT EXISTS` in a transaction.

## Indexing and performance

When a query takes more than a second in dev, look at the execution plan before adding indexes.  An index that fixes one slow query often hurts three others.

Use covering indexes for hot-path queries on tables over 1M rows.  Include only the columns the query actually selects.

Heap tables (no clustered index) are almost always a mistake.  Every persisted table should have a clustered index, usually on the primary key.

## Schema migrations

All schema changes go through migration scripts in `db/migrations/` with sequential numeric prefixes (`001_create_account.sql`, `002_add_account_status_index.sql`).  Never alter schema interactively in committed flow.

Migrations are idempotent.  Each one starts with `IF NOT EXISTS` checks or equivalent guards so re-running is safe.

## SQL style

```sql
-- File: db/migrations/003_add_active_view.sql
-- Purpose: View exposing active accounts (latest contract end >= today).
-- Last updated: 2026-05-23 (Claude Code)

IF EXISTS (SELECT 1 FROM sys.views WHERE name = 'vw_active_accounts')
    DROP VIEW dbo.vw_active_accounts;
GO

CREATE VIEW dbo.vw_active_accounts AS
SELECT
    a.account_id,
    a.account_name,
    MAX(c.end_date) AS latest_contract_end
FROM dbo.account a
LEFT JOIN dbo.contract c
    ON c.account_id = a.account_id
    AND c.status = 'Activated'
GROUP BY a.account_id, a.account_name
HAVING MAX(c.end_date) >= CAST(GETDATE() AS DATE);
GO
```

`GO` separators between batches.  Use `dbo.` schema prefix unless the project has explicit schema separation.

## Things to never do

Don't run `ALTER TABLE` interactively on a production database without a migration script, even a "tiny" change.

Don't disable constraints or triggers in production to push through a data fix.  Fix the data, then verify constraints pass.

Don't store dates as `DATETIME`.  Use `DATETIME2` for timestamps, `DATE` for dates without times.

Don't use the `text`, `ntext`, or `image` types.  They're deprecated.  Use `varchar(max)`, `nvarchar(max)`, or `varbinary(max)`.
