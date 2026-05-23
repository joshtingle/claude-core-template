const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const logger = require('../services/logger');

const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, '..', 'data');
const DB_PATH = path.join(DATA_DIR, 'snapshot.db');

let db;

function getDb() {
  if (!db) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    db = new sqlite3.Database(DB_PATH, (err) => {
      if (err) { logger.error('Failed to open SQLite:', err); throw err; }
    });
    db.run('PRAGMA journal_mode = WAL');
    db.run('PRAGMA foreign_keys = ON');
    db.run('PRAGMA synchronous = NORMAL');
  }
  return db;
}

function query(sql, params = []) {
  return new Promise((resolve, reject) => {
    getDb().all(sql, params, (err, rows) => {
      if (err) { logger.error('Query error:', err.message, '\nSQL:', sql); return reject(err); }
      resolve(rows || []);
    });
  });
}

function queryOne(sql, params = []) {
  return new Promise((resolve, reject) => {
    getDb().get(sql, params, (err, row) => {
      if (err) { logger.error('QueryOne error:', err.message, '\nSQL:', sql); return reject(err); }
      resolve(row || null);
    });
  });
}

function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    getDb().run(sql, params, function (err) {
      if (err) { logger.error('Run error:', err.message, '\nSQL:', sql); return reject(err); }
      resolve({ lastInsertRowid: this.lastID, changes: this.changes });
    });
  });
}

function exec(sql) {
  return new Promise((resolve, reject) => {
    getDb().exec(sql, (err) => {
      if (err) { logger.error('Exec error:', err.message); return reject(err); }
      resolve();
    });
  });
}

async function transaction(stmts) {
  const d = getDb();
  await new Promise((res, rej) => d.run('BEGIN', (e) => e ? rej(e) : res()));
  try {
    for (const { sql, params = [] } of stmts) {
      await new Promise((res, rej) => d.run(sql, params, (e) => e ? rej(e) : res()));
    }
    await new Promise((res, rej) => d.run('COMMIT', (e) => e ? rej(e) : res()));
  } catch (err) {
    await new Promise((res) => d.run('ROLLBACK', () => res()));
    throw err;
  }
}

async function initDb() {
  // Schema is owned by the snapshot job -- this just ensures the db file exists
  fs.mkdirSync(DATA_DIR, { recursive: true });
  getDb();
  logger.info(`SQLite ready at ${DB_PATH}`);
}

// Close current db handle and reopen against DB_PATH. Used after the snapshot
// job atomically swaps a new file into place, so subsequent queries hit the
// fresh data immediately instead of the old file the OS kept open.
function reloadDb() {
  return new Promise((resolve, reject) => {
    if (!db) return resolve();
    const old = db;
    db = null;
    old.close((err) => {
      if (err) { logger.error('Failed to close db during reload:', err); return reject(err); }
      logger.info('Database connection reloaded');
      resolve();
    });
  });
}

module.exports = { initDb, getDb, query, queryOne, run, exec, transaction, reloadDb };
