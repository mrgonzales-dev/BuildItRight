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
        const rows = db.prepare(`SELECT * FROM ${table}`).all();
        const cleanRows = rows.map((row) => {
          const clean = { ...row };
          delete clean.password_hash;
          return clean;
        });
        data[table] = cleanRows;
      }
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
};

module.exports = databaseController;
