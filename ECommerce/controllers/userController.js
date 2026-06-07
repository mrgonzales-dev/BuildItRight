const bcrypt = require('bcryptjs');
const User = require('../models/User');

const userController = {
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

      const existing = User.findByEmail(email.trim().toLowerCase());
      if (existing) {
        return res.status(409).json({ error: 'Email already registered' });
      }

      const passwordHash = bcrypt.hashSync(password, 10);
      const user = User.create({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password_hash: passwordHash,
        role: 'customer',
      });

      res.status(201).json({ id: user.id, name: user.name, email: user.email, role: user.role });
    } catch (err) {
      if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        return res.status(409).json({ error: 'Email already registered' });
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

      const valid = bcrypt.compareSync(password, user.password_hash);
      if (!valid) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      const { password_hash, ...safeUser } = user;
      res.json(safeUser);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  getMe(req, res) {
    try {
      const userId = Number(req.headers['user-id']);
      if (!Number.isInteger(userId) || userId < 1) {
        return res.status(400).json({ error: 'Invalid user ID' });
      }

      const user = User.getById(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json(user);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  updateProfile(req, res) {
    try {
      const userId = req.user.id;
      const { name, email, currentPassword, newPassword } = req.body;

      if (!name || typeof name !== 'string' || !name.trim()) {
        return res.status(400).json({ error: 'Name is required' });
      }
      if (!email || typeof email !== 'string' || !email.trim()) {
        return res.status(400).json({ error: 'Email is required' });
      }

      const user = User.findByEmail(email.trim().toLowerCase());
      if (user && user.id !== userId) {
        return res.status(409).json({ error: 'Email already in use' });
      }

      if (newPassword) {
        if (!currentPassword) {
          return res.status(400).json({ error: 'Current password is required to set a new password' });
        }
        const fullUser = User.findByEmail(req.user.email);
        const valid = bcrypt.compareSync(currentPassword, fullUser.password_hash);
        if (!valid) {
          return res.status(401).json({ error: 'Current password is incorrect' });
        }
        if (newPassword.length < 6) {
          return res.status(400).json({ error: 'New password must be at least 6 characters' });
        }
        User.updatePassword(userId, bcrypt.hashSync(newPassword, 10));
      }

      const updated = User.update(userId, {
        name: name.trim(),
        email: email.trim().toLowerCase(),
      });

      res.json(updated);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
};

module.exports = userController;
