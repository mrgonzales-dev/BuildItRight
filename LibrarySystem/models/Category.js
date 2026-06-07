const db = require('../config/db');

const Category = {
  getAll() {
    return db.prepare('SELECT * FROM categories ORDER BY name').all();
  },

  getById(id) {
    return db.prepare('SELECT * FROM categories WHERE id = ?').get(id);
  },

  create(data) {
    const info = db.prepare(
      'INSERT INTO categories (name, description) VALUES (?, ?)'
    ).run(data.name, data.description || null);
    return Category.getById(info.lastInsertRowid);
  },

  update(id, data) {
    db.prepare(
      "UPDATE categories SET name = ?, description = ?, updated_at = datetime('now') WHERE id = ?"
    ).run(data.name, data.description || null, id);
    return Category.getById(id);
  },

  delete(id) {
    const info = db.prepare('DELETE FROM categories WHERE id = ?').run(id);
    return info.changes > 0;
  }
};

module.exports = Category;
