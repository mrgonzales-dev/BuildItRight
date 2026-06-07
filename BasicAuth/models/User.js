const db = require('../config/db');

const User = {
  findByEmail(email) {
    return db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  },

  getById(id) {
    return db.prepare('SELECT * FROM users WHERE id = ?').get(id);
  },

  create(data) {
    const info = db.prepare(
      'INSERT INTO users (name, email, password) VALUES (?, ?, ?)'
    ).run(data.name, data.email, data.password);
    return User.getById(info.lastInsertRowid);
  }
};

module.exports = User;
