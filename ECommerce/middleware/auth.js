const User = require('../models/User');

function requireOwner(req, res, next) {
  const userId = Number(req.headers['user-id']);
  if (!Number.isInteger(userId) || userId < 1) {
    return res.status(403).json({ error: 'Owner access required' });
  }
  const user = User.getById(userId);
  if (!user || user.role !== 'owner') {
    return res.status(403).json({ error: 'Owner access required' });
  }
  next();
}

function getUser(req, res, next) {
  const userId = Number(req.headers['user-id']);
  if (!Number.isInteger(userId) || userId < 1) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  const user = User.getById(userId);
  if (!user) {
    return res.status(401).json({ error: 'User not found' });
  }
  req.user = user;
  next();
}

module.exports = { requireOwner, getUser };
