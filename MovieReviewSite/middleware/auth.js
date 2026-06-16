const db = require('../config/db');

// Header-based auth: the client sends x-user-id, we look up the user in the database.
// No JWTs, no sessions — simple but only safe on trusted networks (like localhost).
function requireAuth(req, res, next) {
  const userId = req.headers['x-user-id'];
  if (!userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  // Select safe columns only — password_hash is never sent to the client.
  const user = db.prepare(
    'SELECT id, name, email, role, created_at FROM users WHERE id = ?'
  ).get(userId);

  if (!user) {
    return res.status(401).json({ error: 'User not found' });
  }

  // Attach user to request so downstream handlers (like controllers) can use it.
  req.user = user;
  next();
}

// Role-checking middleware. Must be chained AFTER requireAuth in the route definition.
function requireOwner(req, res, next) {
  if (!req.user || req.user.role !== 'owner') {
    return res.status(403).json({ error: 'Owner access required' });
  }
  next();
}

module.exports = { requireAuth, requireOwner };
