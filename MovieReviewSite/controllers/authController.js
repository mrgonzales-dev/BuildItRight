const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { stripHtml } = require('../utils/sanitize');

const NAME_MAX = 100;

// POST /api/auth/register
exports.register = (req, res) => {
  try {
    let { name, email, password } = req.body;

    // Strip HTML tags before trimming — prevents XSS in stored data.
    name = stripHtml(name || '').trim();
    email = (email || '').trim().toLowerCase();
    password = password || '';

    // Validate each field independently so the user knows exactly what to fix.
    if (!name || name.length > NAME_MAX) {
      return res.status(400).json({ error: `Name is required and must be ${NAME_MAX} characters or less` });
    }
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }
    if (!password || password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // 409 Conflict — the resource exists but we can't create a duplicate.
    const existing = User.getByEmail(email);
    if (existing) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    // bcrypt.hashSync(password, 10) — cost factor 10, ~100ms on modern hardware.
    const password_hash = bcrypt.hashSync(password, 10);
    const user = User.create({ name, email, password_hash, role: 'customer' });

    return res.status(201).json(user);
  } catch (err) {
    console.error('register error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// POST /api/auth/login
exports.login = (req, res) => {
  try {
    let { email, password } = req.body;

    email = (email || '').trim().toLowerCase();
    password = password || '';

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Use the special query that includes password_hash — only for login comparison.
    const user = User.getByEmailWithPassword(email);
    if (!user) {
      // Same error for "user not found" and "wrong password" — prevents email enumeration.
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const match = bcrypt.compareSync(password, user.password_hash);
    if (!match) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Destructure to exclude password_hash — the safe object goes to the client.
    const { password_hash, ...safeUser } = user;
    return res.json(safeUser);
  } catch (err) {
    console.error('login error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// POST /api/auth/logout — no-op for header-based auth.
// Clients just clear localStorage. This endpoint exists for API consistency.
exports.logout = (req, res) => {
  res.sendStatus(204);
};

// GET /api/auth/me — returns the currently authenticated user.
// req.user is already populated by the requireAuth middleware.
exports.me = (req, res) => {
  return res.json(req.user);
};
