const db = require('../config/db');

const Candidate = {
  getAll() {
    return db.prepare('SELECT * FROM candidates ORDER BY position_id, display_order').all();
  },

  getByPositionId(positionId) {
    return db.prepare(
      'SELECT * FROM candidates WHERE position_id = ? ORDER BY display_order'
    ).all(positionId);
  },

  getById(id) {
    return db.prepare('SELECT * FROM candidates WHERE id = ?').get(id);
  },

  create(data) {
    const maxOrder = db.prepare(
      'SELECT COALESCE(MAX(display_order), -1) + 1 as next_order FROM candidates WHERE position_id = ?'
    ).get(data.position_id).next_order;
    const info = db.prepare(
      'INSERT INTO candidates (position_id, name, tagline, display_order) VALUES (?, ?, ?, ?)'
    ).run(data.position_id, data.name, data.tagline || null, data.display_order ?? maxOrder);
    return Candidate.getById(info.lastInsertRowid);
  },

  update(id, data) {
    const existing = db.prepare('SELECT * FROM candidates WHERE id = ?').get(id);
    if (!existing) return null;
    db.prepare(
      "UPDATE candidates SET name = ?, tagline = ?, display_order = ?, updated_at = datetime('now') WHERE id = ?"
    ).run(
      data.name ?? existing.name,
      data.tagline ?? existing.tagline,
      data.display_order ?? existing.display_order,
      id
    );
    return Candidate.getById(id);
  },

  delete(id) {
    const info = db.prepare('DELETE FROM candidates WHERE id = ?').run(id);
    return info.changes > 0;
  }
};

module.exports = Candidate;
