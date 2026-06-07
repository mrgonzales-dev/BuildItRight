const db = require('../config/db');

const User = {
  getAll() {
    return db.prepare('SELECT id, name, email, role, created_at FROM users ORDER BY name').all();
  },

  getById(id) {
    return db.prepare('SELECT id, name, email, role, created_at FROM users WHERE id = ?').get(id);
  },

  findByEmail(email) {
    return db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  },

  create(data) {
    const info = db.prepare(
      'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)'
    ).run(data.name, data.email, data.password_hash, data.role || 'customer');
    return User.getById(info.lastInsertRowid);
  },

  update(id, data) {
    db.prepare(
      'UPDATE users SET name = ?, email = ?, updated_at = datetime(\'now\') WHERE id = ?'
    ).run(data.name, data.email, id);
    return User.getById(id);
  },

  updatePassword(id, hash) {
    db.prepare("UPDATE users SET password_hash = ?, updated_at = datetime('now') WHERE id = ?")
      .run(hash, id);
  },

  delete(id) {
    const info = db.prepare('DELETE FROM users WHERE id = ?').run(id);
    return info.changes > 0;
  },
};

module.exports = User;
