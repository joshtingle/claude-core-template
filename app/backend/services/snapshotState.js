// Shared snapshot state -- single source of truth for whether a snapshot
// is currently in progress, accessible from both server.js (cron) and
// routes/admin.js (HTTP trigger).
let snapshotRunning = false;

module.exports = {
  isRunning: () => snapshotRunning,
  setRunning: (val) => { snapshotRunning = val; },
};
