const path = require('path');
require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const cron = require('node-cron');
const logger = require('./services/logger');
const { initDb } = require('./db/database');
const { runSnapshot } = require('./jobs/snapshot.example');
const snapshotState = require('./services/snapshotState');

// Routes
const adminRoutes = require('./routes/admin');
// __PROJECT_ROUTES__ -- register additional project routes here, e.g.:
//   const overviewRoutes = require('./routes/overview');

const app = express();
const PORT = process.env.PORT || 3001;

app.set('trust proxy', 1);

app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL || '*' }));
app.use(express.json());

const limiter = rateLimit({ windowMs: 60 * 1000, max: 200 });
app.use('/api', limiter);

// In production, serve the built Vite frontend from backend/public
// (the build step copies frontend/dist -> backend/public)
if (process.env.NODE_ENV === 'production') {
  const staticPath = path.join(__dirname, 'public');
  app.use(express.static(staticPath));
}

app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// API Routes
app.use('/api/admin', adminRoutes);
// __PROJECT_ROUTES__ -- mount additional routes here, e.g.:
//   app.use('/api/overview', overviewRoutes);

if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  });
}

app.use((req, res) => res.status(404).json({ error: 'Not found' }));

app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

async function start() {
  if (process.env.NODE_ENV === 'production') {
    // Production: download latest snapshot from Azure Blob Storage BEFORE
    // opening the SQLite connection. This way the live file is already in
    // place when initDb() runs, avoiding the file-lock dance.
    const blobSync = require('./services/blobSync');
    try {
      await blobSync.downloadIfNewer();
    } catch (err) {
      logger.error('Initial Blob download failed:', err.message);
    }
    await initDb();
    logger.info('Database initialized');
    blobSync.startPeriodicSync(30);
  } else {
    // Local dev: init the local db and schedule the snapshot cron.
    await initDb();
    logger.info('Database initialized');

    const cronSchedule = process.env.SNAPSHOT_CRON || '0 * * * *';
    cron.schedule(cronSchedule, async () => {
      if (snapshotState.isRunning()) {
        logger.info('Scheduled snapshot skipped -- snapshot already in progress');
        return;
      }
      logger.info('Starting scheduled snapshot...');
      snapshotState.setRunning(true);
      try {
        await runSnapshot();
        logger.info('Scheduled snapshot complete');
      } catch (err) {
        logger.error('Scheduled snapshot failed:', err);
      } finally {
        snapshotState.setRunning(false);
      }
    });
    logger.info(`Snapshot scheduled (local dev): ${cronSchedule}`);
  }

  app.listen(PORT, () => {
    logger.info(`__PROJECT_NAME__ backend running on port ${PORT}`);
  });
}

start();
