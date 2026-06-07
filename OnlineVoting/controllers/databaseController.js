const db = require('../config/db');

const tableNames = db
  .prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%'")
  .all()
  .map((r) => r.name);

const databaseController = {
  getAll(req, res) {
    try {
      const data = {};
      for (const table of tableNames) {
        data[table] = db.prepare(`SELECT * FROM ${table}`).all();
      }
      res.json(data);
    } catch (err) {
      if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        return res.status(409).json({ error: 'A record with that value already exists' });
      }
      if (err.code === 'SQLITE_CONSTRAINT_FOREIGNKEY') {
        return res.status(409).json({ error: 'Referenced record not found' });
      }
      res.status(500).json({ error: err.message });
    }
  },
};

module.exports = databaseController;
