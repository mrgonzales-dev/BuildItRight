require('dotenv').config();
const express = require('express');
const cors = require('cors');

// Importing db triggers schema creation and seed data — a side-effect of require()
const db = require('./config/db');

const app = express();

// ---------------------------------------------------------------------------
// Middleware
// ---------------------------------------------------------------------------
app.use(cors());
app.use(express.json({ limit: '1mb' }));

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------
// Express matches routes top-to-bottom. More specific routes first.
app.use('/api/auth', require('./routes/auth'));
app.use('/api/movies', require('./routes/movies'));
app.use('/api', require('./routes/reviews'));
app.use('/api/database', require('./routes/database'));

// ---------------------------------------------------------------------------
// 404 handler
// ---------------------------------------------------------------------------
// Any request that didn't match a route above hits this.
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found` });
});

// ---------------------------------------------------------------------------
// Global error handler
// ---------------------------------------------------------------------------
// Express recognizes 4-argument middleware as an error handler.
// Any thrown error or next(err) from a route lands here.
app.use((err, req, res, _next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// ---------------------------------------------------------------------------
// Start
// ---------------------------------------------------------------------------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`MovieReviewSite API running on http://localhost:${PORT}`);
});

// ---------------------------------------------------------------------------
// Graceful shutdown
// ---------------------------------------------------------------------------
// Close the SQLite connection cleanly so WAL files are flushed.
const shutdown = () => { console.log('\nShutting down...'); db.close(); process.exit(0); };
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

module.exports = app;
