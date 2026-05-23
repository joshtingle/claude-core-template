const express = require('express');
const router = express.Router();
const { query, queryOne } = require('../db/database');
const { runSnapshot } = require('../jobs/snapshot.example');
const logger = require('../services/logger');
const snapshotState = require('../services/snapshotState');

// Reports the freshness of the data the app is currently serving. Reads from
// the snapshot_meta table (one row per snapshot run) which the snapshot job
// is expected to maintain. Returns null fields gracefully if the table is not
// yet populated.
router.get('/data-currency', async (req, res) => {
  try {
    const meta = await queryOne(`
      SELECT load_date, completed_at, rows_written
      FROM snapshot_meta
      WHERE status = 'complete'
      ORDER BY id DESC LIMIT 1
    `).catch(() => null);
    const loadDate = meta?.load_date || meta?.completed_at?.slice(0, 10) || null;
    res.json({
      load_date: loadDate,
      snapshot_completed_at: meta?.completed_at || null,
      rows_written: meta?.rows_written || null,
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/snapshot-status', async (req, res) => {
  try {
    const latest = await queryOne(`SELECT * FROM snapshot_meta ORDER BY id DESC LIMIT 1`).catch(() => null);
    res.json({ latest: latest || null, running: snapshotState.isRunning() });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/snapshot-history', async (req, res) => {
  try {
    const history = await query(`SELECT * FROM snapshot_meta ORDER BY id DESC LIMIT 20`).catch(() => []);
    res.json(history);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// In production, the snapshot job runs via CI on a schedule and uploads to
// Blob Storage. The app can pull the latest blob immediately on this endpoint.
// In local dev, the snapshot job runs in-process against the warehouse.
router.post('/refresh', async (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    try {
      const blobSync = require('../services/blobSync');
      const result = await blobSync.downloadIfNewer();
      return res.json({ message: 'Blob sync triggered', result });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  if (snapshotState.isRunning()) return res.status(409).json({ error: 'Snapshot already in progress' });
  snapshotState.setRunning(true);
  res.json({ message: 'Snapshot started', startedAt: new Date().toISOString() });
  try {
    await runSnapshot();
    logger.info('Manual snapshot complete');
  } catch (err) {
    logger.error('Manual snapshot failed:', err);
  } finally {
    snapshotState.setRunning(false);
  }
});

module.exports = router;
