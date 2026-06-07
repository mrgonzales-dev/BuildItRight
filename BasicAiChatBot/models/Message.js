const db = require('../config/db');

const Message = {
  getAll() {
    return db.prepare('SELECT * FROM messages ORDER BY created_at ASC').all();
  },

  getById(id) {
    return db.prepare('SELECT * FROM messages WHERE id = ?').get(id);
  },

  getByConversation(conversationId) {
    return db.prepare(
      'SELECT * FROM messages WHERE conversation_id = ? ORDER BY created_at ASC'
    ).all(conversationId);
  },

  create(data) {
    const info = db.prepare(
      'INSERT INTO messages (conversation_id, role, content) VALUES (?, ?, ?)'
    ).run(data.conversation_id, data.role, data.content);
    return Message.getById(info.lastInsertRowid);
  },

  deleteByConversation(conversationId) {
    return db.prepare('DELETE FROM messages WHERE conversation_id = ?').run(conversationId);
  }
};

module.exports = Message;
