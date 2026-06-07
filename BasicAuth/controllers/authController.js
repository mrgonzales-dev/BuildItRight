const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production';

function stripPassword(user) {
  if (!user) return null;
  const { password, ...rest } = user;
  return rest;
}

const authController = {
  register(req, res) {
    try {
      const { name, email, password } = req.body;

      if (!name || typeof name !== 'string' || !name.trim()) {
        return res.status(400).json({ error: 'Name is required' });
      }
      if (!email || typeof email !== 'string' || !email.trim()) {
        return res.status(400).json({ error: 'Email is required' });
      }
      if (!password || typeof password !== 'string' || password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters' });
      }

      const existing = User.findByEmail(email.trim());
      if (existing) {
        return res.status(409).json({ error: 'An account with that email already exists' });
      }

      const hashed = bcrypt.hashSync(password, 10);
      const user = User.create({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password: hashed,
      });

      const token = jwt.sign({ id: user.id }, SECRET, { expiresIn: '7d' });
      res.status(201).json({ user: stripPassword(user), token });
    } catch (err) {
      if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        return res.status(409).json({ error: 'An account with that email already exists' });
      }
      res.status(500).json({ error: err.message });
    }
  },

  login(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }

      const user = User.findByEmail(email.trim().toLowerCase());
      if (!user) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      const valid = bcrypt.compareSync(password, user.password);
      if (!valid) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      const token = jwt.sign({ id: user.id }, SECRET, { expiresIn: '7d' });
      res.json({ user: stripPassword(user), token });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  me(req, res) {
    try {
      const user = User.getById(req.userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json(stripPassword(user));
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
};

module.exports = authController;
