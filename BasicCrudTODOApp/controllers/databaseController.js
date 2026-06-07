// ============================================================
// controllers/databaseController.js — Dev Database Viewer
// ============================================================
// A handy debugging tool! When we're working in development mode,
// this controller dumps ALL the contents of our database as JSON.
// It lists every table and every row inside it — perfect for
// checking that our data looks right while building the app.
// ============================================================
//
// NOTE: This route is only available in development (not production)
// because we don't want random people peeking at our database!
// Check routes/routes.js to see the guard condition.

const db = require('../config/db');

// Prepare (compile) a SQL query that gets all user-created table names
// from SQLite's internal catalog (sqlite_master). We skip the built-in
// tables that start with "sqlite_" — those are SQLite's internal books.
const stmtListTables = db.prepare(
  "SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%'"
);

const databaseController = {
  // ---------- GET /api/database — Dump everything ----------
  // Runs a query to list all tables, then for each table, runs a
  // SELECT * to grab every row. Returns it all as one big JSON object.
  getAll(_req, res) {
    try {
      const tableNames = stmtListTables.all().map((r) => r.name);
      const data = {};
      for (const table of tableNames) {
        data[table] = db.prepare(`SELECT * FROM ${table}`).all();
      }
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
};

module.exports = databaseController;
