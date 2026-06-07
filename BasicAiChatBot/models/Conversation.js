const db = require('../config/db');

const Conversation = {
  getAll() {
    return db.prepare('SELECT * FROM conversations ORDER BY created_at DESC').all();
  },

  getById(id) {
    return db.prepare('SELECT * FROM conversations WHERE id = ?').get(id);
  },

  create(title) {
    const info = db.prepare('INSERT INTO conversations (title) VALUES (?)').run(title || 'New Chat');
    return Conversation.getById(info.lastInsertRowid);
  },

  updateTitle(id, title) {
    db.prepare('UPDATE conversations SET title = ? WHERE id = ?').run(title, id);
    return Conversation.getById(id);
  },

  delete(id) {
    const info = db.prepare('DELETE FROM conversations WHERE id = ?').run(id);
    return info.changes > 0;
  }
};

module.exports = Conversation;
