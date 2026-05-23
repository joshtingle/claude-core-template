// Snapshot job template -- copies data from the warehouse (Snowflake by default)
// into a local SQLite file via staging-and-atomic-swap.
//
// This file ships as an example. Rename to `snapshot.js` and wire it up by:
//   1. Updating the TABLES list below with the mart tables this project reads.
//   2. Filling in column lists and any per-table WHERE clauses.
//   3. Confirming the snapshot_meta schema captures what you want to surface
//      in /api/admin/snapshot-status and the sidebar "last refreshed" stamp.
//
// The pattern: stream rows from Snowflake -> write to snapshot_staging.db ->
// fsync -> atomic rename to snapshot.db -> reloadDb() so the running server
// picks up the new file without restart. Same pattern blobSync.js uses for
// the prod-side download.

require('dotenv').config();
const path = require('path');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();
const logger = require('../services/logger');

const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, '..', 'data');
const DB_PATH = path.join(DATA_DIR, 'snapshot.db');
const STAGING_DB_PATH = path.join(DATA_DIR, 'snapshot_staging.db');

// PROJECT TODO: list the mart tables this project pulls from the warehouse.
// Each entry: { source: 'WAREHOUSE_TABLE_OR_VIEW', target: 'sqlite_table_name',
//   columns: [...], where: 'optional SQL filter' }
const TABLES = [
  // {
  //   source: 'CONSUMER.FINANCE.SOME_MART',
  //   target: 'some_mart',
  //   columns: ['account_id', 'eom_date', 'arr_amount'],
  //   where: "eom_date >= '2024-01-01'",
  // },
];

async function runSnapshot() {
  if (TABLES.length === 0) {
    logger.warn('snapshot.example.js: TABLES list is empty. Edit jobs/snapshot.example.js (or rename to snapshot.js) and add your project mart list.');
    return { rows: 0, tables: 0, skipped: true };
  }

  fs.mkdirSync(DATA_DIR, { recursive: true });
  if (fs.existsSync(STAGING_DB_PATH)) fs.unlinkSync(STAGING_DB_PATH);

  // PROJECT TODO: open a Snowflake connection here using snowflake-sdk and the
  // SNOWFLAKE_* env vars in .env.example. The ARR dashboard reference impl is at
  // D:/dev/ISW/arr_poc/isw-arr-dashboard/backend/jobs/snapshot.js -- copy the
  // connection setup and streaming pattern from there.

  const staging = new sqlite3.Database(STAGING_DB_PATH);

  // Create the snapshot_meta table so /api/admin/* endpoints have data to read.
  await new Promise((res, rej) => staging.exec(`
    CREATE TABLE IF NOT EXISTS snapshot_meta (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      load_date TEXT,
      started_at TEXT,
      completed_at TEXT,
      status TEXT,
      rows_written INTEGER,
      error TEXT
    );
  `, err => err ? rej(err) : res()));

  const startedAt = new Date().toISOString();
  await new Promise((res, rej) => staging.run(
    `INSERT INTO snapshot_meta (load_date, started_at, status) VALUES (?, ?, ?)`,
    [startedAt.slice(0, 10), startedAt, 'running'],
    err => err ? rej(err) : res()
  ));

  let totalRows = 0;
  try {
    // PROJECT TODO: for each table in TABLES, stream from Snowflake and bulk
    // insert into staging. Pattern:
    //
    //   await new Promise((res, rej) => staging.exec(`CREATE TABLE ${target} (...)`, ...));
    //   const stmt = staging.prepare(`INSERT INTO ${target} VALUES (?, ?, ...)`);
    //   stream.on('data', row => stmt.run(row.col1, row.col2, ...));
    //   stream.on('end', () => stmt.finalize(res));

    await new Promise((res, rej) => staging.run(
      `UPDATE snapshot_meta SET status = ?, completed_at = ?, rows_written = ? WHERE id = (SELECT MAX(id) FROM snapshot_meta)`,
      ['complete', new Date().toISOString(), totalRows],
      err => err ? rej(err) : res()
    ));
  } catch (err) {
    await new Promise((res) => staging.run(
      `UPDATE snapshot_meta SET status = ?, error = ?, completed_at = ? WHERE id = (SELECT MAX(id) FROM snapshot_meta)`,
      ['failed', err.message, new Date().toISOString()],
      () => res()
    ));
    staging.close();
    throw err;
  }

  await new Promise(res => staging.close(res));

  // Atomic swap
  if (fs.existsSync(DB_PATH)) {
    try { fs.unlinkSync(DB_PATH + '-wal'); } catch {}
    try { fs.unlinkSync(DB_PATH + '-shm'); } catch {}
  }
  try {
    const { reloadDb } = require('../db/database');
    if (reloadDb) await reloadDb();
  } catch {}
  fs.renameSync(STAGING_DB_PATH, DB_PATH);
  logger.info(`Snapshot complete -- ${totalRows} rows in ${TABLES.length} tables`);
  return { rows: totalRows, tables: TABLES.length };
}

module.exports = { runSnapshot };

if (require.main === module) {
  runSnapshot().catch(err => { logger.error(err); process.exit(1); });
}
