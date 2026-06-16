const db = require('../config/db');

// Column list used in SELECT queries — keeps password_hash out of normal lookups.
const USER_COLUMNS = 'id, name, email, role, created_at';

function getById(id) {
  return db.prepare(`SELECT ${USER_COLUMNS} FROM users WHERE id = ?`).get(id);
}

function getByEmail(email) {
  // Used by registration to check if an email is already taken.
  // Excludes password_hash — caller only needs to know if the user exists.
  return db.prepare(`SELECT ${USER_COLUMNS} FROM users WHERE email = ?`).get(email);
}

function getByEmailWithPassword(email) {
  // Only used during login for bcrypt.compareSync. Never returned in API responses.
  return db.prepare('SELECT * FROM users WHERE email = ?').get(email);
}

function create({ name, email, password_hash, role }) {
  // Guard against invalid roles — only 'customer' or 'owner' are allowed by the CHECK constraint.
  const safeRole = role === 'owner' ? 'owner' : 'customer';
  const info = db.prepare(
    `INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)`
  ).run(name, email, password_hash, safeRole);
  // Return the new user without password_hash by selecting safe columns.
  return getById(info.lastInsertRowid);
}

module.exports = { getById, getByEmail, getByEmailWithPassword, create };
