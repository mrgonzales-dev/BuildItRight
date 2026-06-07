const db = require('../config/db');

const Member = {
  getAll() {
    return db.prepare('SELECT * FROM members ORDER BY name').all();
  },

  getById(id) {
    return db.prepare('SELECT * FROM members WHERE id = ?').get(id);
  },

  search(term) {
    return db.prepare(
      'SELECT * FROM members WHERE name LIKE ? OR email LIKE ? ORDER BY name'
    ).all(`%${term}%`, `%${term}%`);
  },

  create(data) {
    const info = db.prepare(
      'INSERT INTO members (name, email, phone, address) VALUES (?, ?, ?, ?)'
    ).run(data.name, data.email, data.phone || null, data.address || null);
    return Member.getById(info.lastInsertRowid);
  },

  update(id, data) {
    db.prepare(
      `UPDATE members SET name = ?, email = ?, phone = ?, address = ?, updated_at = datetime('now')
       WHERE id = ?`
    ).run(data.name, data.email, data.phone || null, data.address || null, id);
    return Member.getById(id);
  },

  delete(id) {
    const info = db.prepare('DELETE FROM members WHERE id = ?').run(id);
    return info.changes > 0;
  }
};

module.exports = Member;
