const db = require('../config/db');

// GET /api/database/status — debug endpoint showing table row counts.
// Table names are hardcoded (no user input), so this is safe from SQL injection.
exports.getStatus = (req, res) => {
  try {
    const tables = ['users', 'movies', 'reviews'];
    const counts = {};
    for (const table of tables) {
      const row = db.prepare(`SELECT COUNT(*) AS cnt FROM ${table}`).get();
      counts[table] = row.cnt;
    }
    return res.json({ tables: counts });
  } catch (err) {
    console.error('database status error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
