# Database: SQLite

The right choice when the project needs fast local reads, a single-writer model, and zero infrastructure.  Two common patterns:

1. **App cache** for hybrid architecture (the warehouse-analytics pattern).  Primary data lives in a warehouse; a snapshot job writes to SQLite locally; the app reads from SQLite for fast queries.
2. **Standalone local store** for desktop tools, small apps, or anything that doesn't need a server-side database.

## Connection

No connection string.  The database is a file.

Required env vars:

- `DATA_DIR` -- absolute path to the directory containing the database file.  Default to `./data` for local dev and `/home/data` for Azure App Service.  Always include the leading slash on Linux.
- `DB_FILENAME` -- default `app.db` or `snapshot.db` for the cache pattern.

## SDKs

- Node: `better-sqlite3` (synchronous, fast) for most cases; `sqlite3` (async) only when async is actually needed.
- Python: stdlib `sqlite3`.

The template's app scaffold uses `sqlite3` (async) because it integrates more naturally with the Express async request pipeline.  For pure scripts and jobs, `better-sqlite3` is simpler.

## Atomic swap pattern (for the snapshot cache)

When refreshing the cache, never write directly to the file the app reads.  Concurrent reads during a write produce corruption or partial results.

Pattern:

1. Write to `snapshot_staging.db` (separate filename).
2. When the write completes successfully, close all open handles.
3. Atomically rename `snapshot_staging.db` to `snapshot.db`.
4. The app's connection pool detects the change (or is signaled by a `reloadDb()` call) and refreshes.

This pattern is well-tested.  Reference implementation in this template at `app/backend/jobs/snapshot.example.js` and `app/backend/db/database.js`.  Copy the pattern, don't reinvent it.

## Blob sync pattern (when the cache lives in cloud storage)

For Azure App Service or any environment where the app and the snapshot job don't share a filesystem:

1. Snapshot job (GitHub Actions, scheduled) writes to SQLite locally, then uploads to blob storage.
2. App, on startup and periodically (every 30 minutes is reasonable), checks blob `lastModified` against the local file's `mtime`.  If the blob is newer, download to staging, atomic swap, reload.
3. Blob storage container is private.  Connection string lives in the deployment target's env vars and in GitHub Actions secrets, never in the repo.

Reference implementation at `app/backend/services/blobSync.js` in this template.

## Schema and migrations

SQLite tolerates loose typing.  Don't rely on that.  Declare column types explicitly and use `STRICT` mode on tables where data discipline matters:

```sql
CREATE TABLE IF NOT EXISTS account (
    account_id TEXT PRIMARY KEY,
    account_name TEXT NOT NULL,
    is_active INTEGER NOT NULL DEFAULT 0,  -- boolean as 0/1
    last_updated TEXT NOT NULL              -- ISO8601 string
) STRICT;
```

For the snapshot-cache pattern, schema is regenerated from scratch on every snapshot.  Migrations don't apply -- the snapshot job is the schema.

For the standalone local store pattern, use sequential migration files in `db/migrations/` just like other database modules.

## Query patterns

Use prepared statements always.  In `better-sqlite3`:

```javascript
const stmt = db.prepare('SELECT * FROM account WHERE is_active = ?');
const rows = stmt.all(1);
```

Use transactions for any operation that touches more than one row.

Enable WAL mode for any database with concurrent reads while a writer might be active:

```javascript
db.run('PRAGMA journal_mode = WAL');
db.run('PRAGMA synchronous = NORMAL');
```

## Things to never do

Don't store binary blobs in SQLite when the file is going to grow into the hundreds of megabytes.  Store paths to files in a real filesystem or object store.

Don't use SQLite as the primary database for a multi-user web app with significant write traffic.  It's single-writer.  Use Postgres or SQL Server for that workload.

Don't commit `.db` files to the repo.  They go in `.gitignore` (already done in this template).

Don't open the database in two processes simultaneously without WAL mode.  You will get `SQLITE_BUSY` errors and possible corruption.
