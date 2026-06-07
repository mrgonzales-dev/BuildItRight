const db = require('../config/db');

const Position = {
  getAll() {
    return db.prepare('SELECT * FROM positions ORDER BY election_id, display_order').all();
  },

  getByElectionId(electionId) {
    return db.prepare(
      'SELECT * FROM positions WHERE election_id = ? ORDER BY display_order'
    ).all(electionId);
  },

  getById(id) {
    return db.prepare('SELECT * FROM positions WHERE id = ?').get(id);
  },

  create(data) {
    const maxOrder = db.prepare(
      'SELECT COALESCE(MAX(display_order), -1) + 1 as next_order FROM positions WHERE election_id = ?'
    ).get(data.election_id).next_order;
    const info = db.prepare(
      'INSERT INTO positions (election_id, title, display_order) VALUES (?, ?, ?)'
    ).run(data.election_id, data.title, data.display_order ?? maxOrder);
    return Position.getById(info.lastInsertRowid);
  },

  update(id, data) {
    const existing = db.prepare('SELECT * FROM positions WHERE id = ?').get(id);
    if (!existing) return null;
    db.prepare(
      "UPDATE positions SET title = ?, display_order = ?, updated_at = datetime('now') WHERE id = ?"
    ).run(
      data.title ?? existing.title,
      data.display_order ?? existing.display_order,
      id
    );
    return Position.getById(id);
  },

  delete(id) {
    const info = db.prepare('DELETE FROM positions WHERE id = ?').run(id);
    return info.changes > 0;
  }
};

module.exports = Position;
