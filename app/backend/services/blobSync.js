const path = require('path');
const fs = require('fs');
const logger = require('./logger');

const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, '..', 'data');
const DB_PATH = path.join(DATA_DIR, 'snapshot.db');
const STAGING_DB_PATH = path.join(DATA_DIR, 'snapshot_staging.db');
const CONTAINER_NAME = 'snapshots';
const BLOB_NAME = 'snapshot.db';

// Lazy-load the Azure SDK so local dev without the package installed still works.
// Returns null if env var is not set (local dev path).
function getBlobClient() {
  const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
  if (!connectionString) return null;
  try {
    const { BlobServiceClient } = require('@azure/storage-blob');
    const service = BlobServiceClient.fromConnectionString(connectionString);
    const container = service.getContainerClient(CONTAINER_NAME);
    return container.getBlockBlobClient(BLOB_NAME);
  } catch (err) {
    logger.error('Failed to initialize Azure Blob Storage client:', err.message);
    return null;
  }
}

// Download snapshot.db from Blob Storage if the blob is newer than the local
// file (or if no local file exists). Performs an atomic swap so the app keeps
// serving the old file until the new one is fully downloaded.
//
// In local dev (AZURE_STORAGE_CONNECTION_STRING not set), this is a no-op.
async function downloadIfNewer() {
  const client = getBlobClient();
  if (!client) {
    logger.info('Blob Storage not configured -- using local snapshot.db only');
    return { downloaded: false, reason: 'no-config' };
  }

  let blobProps;
  try {
    blobProps = await client.getProperties();
  } catch (err) {
    if (err.statusCode === 404) {
      logger.info('No snapshot.db exists in Blob Storage yet -- nothing to download');
      return { downloaded: false, reason: 'no-blob' };
    }
    logger.error('Failed to get blob properties:', err.message);
    return { downloaded: false, reason: 'error', error: err.message };
  }

  const blobModified = blobProps.lastModified;
  let localModified = null;
  if (fs.existsSync(DB_PATH)) {
    localModified = fs.statSync(DB_PATH).mtime;
  }

  if (localModified && blobModified <= localModified) {
    logger.info(`Local snapshot.db is current (${localModified.toISOString()}) -- skipping download`);
    return { downloaded: false, reason: 'current' };
  }

  logger.info(`Downloading snapshot.db from Blob Storage (blob: ${blobModified.toISOString()}, local: ${localModified ? localModified.toISOString() : 'none'})...`);
  const startedAt = Date.now();

  if (fs.existsSync(STAGING_DB_PATH)) fs.unlinkSync(STAGING_DB_PATH);
  fs.mkdirSync(DATA_DIR, { recursive: true });

  try {
    await client.downloadToFile(STAGING_DB_PATH);
  } catch (err) {
    logger.error('Blob download failed:', err.message);
    if (fs.existsSync(STAGING_DB_PATH)) fs.unlinkSync(STAGING_DB_PATH);
    return { downloaded: false, reason: 'download-failed', error: err.message };
  }

  const sizeMB = (fs.statSync(STAGING_DB_PATH).size / (1024 * 1024)).toFixed(1);
  const elapsedSec = ((Date.now() - startedAt) / 1000).toFixed(1);
  logger.info(`Downloaded ${sizeMB} MB in ${elapsedSec}s`);

  // Close the live db connection BEFORE the rename, since the app already
  // has snapshot.db open from initDb(). The next query will lazy-open the
  // new file.
  try {
    const { reloadDb } = require('../db/database');
    if (reloadDb) await reloadDb();
  } catch (e) { /* not in same process */ }

  await new Promise(r => setTimeout(r, 200));

  // Atomic swap with retries to handle lingering file handles on Linux/Azure
  let swapped = false;
  let lastErr = null;
  for (let attempt = 1; attempt <= 5; attempt++) {
    try {
      if (fs.existsSync(DB_PATH)) {
        const oldWal = DB_PATH + '-wal';
        const oldShm = DB_PATH + '-shm';
        try { if (fs.existsSync(oldWal)) fs.unlinkSync(oldWal); } catch {}
        try { if (fs.existsSync(oldShm)) fs.unlinkSync(oldShm); } catch {}
      }
      fs.renameSync(STAGING_DB_PATH, DB_PATH);
      swapped = true;
      break;
    } catch (e) {
      lastErr = e;
      if (e.code === 'EBUSY' || e.code === 'EPERM') {
        logger.warn(`Swap attempt ${attempt} blocked, retrying in 500ms...`);
        await new Promise(r => setTimeout(r, 500));
      } else {
        throw e;
      }
    }
  }

  if (!swapped) {
    logger.error(`Could not swap downloaded file after 5 attempts: ${lastErr?.message}`);
    return { downloaded: false, reason: 'swap-failed', error: lastErr?.message };
  }

  logger.info(`Atomic swap complete -- ${DB_PATH} updated`);

  return { downloaded: true, sizeMB: parseFloat(sizeMB), elapsedSec: parseFloat(elapsedSec), modified: blobModified };
}

// Upload the local snapshot.db to Blob Storage, overwriting the previous version.
// Called by the snapshot CI job after the snapshot job completes.
async function uploadSnapshot() {
  const client = getBlobClient();
  if (!client) {
    throw new Error('AZURE_STORAGE_CONNECTION_STRING is required to upload snapshot');
  }
  if (!fs.existsSync(DB_PATH)) {
    throw new Error(`snapshot.db not found at ${DB_PATH} -- run the snapshot job first`);
  }

  const sizeMB = (fs.statSync(DB_PATH).size / (1024 * 1024)).toFixed(1);
  logger.info(`Uploading ${sizeMB} MB snapshot.db to Blob Storage...`);
  const startedAt = Date.now();

  await client.uploadFile(DB_PATH);

  const elapsedSec = ((Date.now() - startedAt) / 1000).toFixed(1);
  logger.info(`Upload complete in ${elapsedSec}s`);
  return { uploaded: true, sizeMB: parseFloat(sizeMB), elapsedSec: parseFloat(elapsedSec) };
}

// Run downloadIfNewer() on a recurring interval. Used by the app to pick up
// new snapshots uploaded by CI without requiring a restart.
function startPeriodicSync(intervalMinutes = 30) {
  if (!process.env.AZURE_STORAGE_CONNECTION_STRING) {
    logger.info('Periodic Blob sync skipped -- no Azure connection string');
    return null;
  }
  const intervalMs = intervalMinutes * 60 * 1000;
  logger.info(`Periodic Blob sync scheduled every ${intervalMinutes} minutes`);
  return setInterval(() => {
    downloadIfNewer().catch(err => logger.error('Periodic Blob sync failed:', err.message));
  }, intervalMs);
}

module.exports = { downloadIfNewer, uploadSnapshot, startPeriodicSync };
