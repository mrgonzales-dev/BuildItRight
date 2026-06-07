const Member = require('../models/Member');

const memberController = {
  getAll(req, res) {
    try {
      res.json(Member.getAll());
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  getById(req, res) {
    try {
      const id = Number(req.params.id);
      if (!Number.isInteger(id) || id < 1) {
        return res.status(400).json({ error: 'Invalid member ID' });
      }
      const member = Member.getById(id);
      if (!member) return res.status(404).json({ error: 'Member not found' });
      res.json(member);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  search(req, res) {
    try {
      const q = req.query.q;
      if (!q || !q.trim()) {
        return res.status(400).json({ error: 'Search query is required' });
      }
      res.json(Member.search(q.trim()));
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  create(req, res) {
    try {
      const { name, email } = req.body;
      if (!name || typeof name !== 'string' || !name.trim()) {
        return res.status(400).json({ error: 'Member name is required' });
      }
      if (!email || typeof email !== 'string' || !email.trim()) {
        return res.status(400).json({ error: 'Member email is required' });
      }
      const member = Member.create({
        name: name.trim(),
        email: email.trim(),
        phone: req.body.phone,
        address: req.body.address,
      });
      res.status(201).json(member);
    } catch (err) {
      if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        return res.status(409).json({ error: 'A member with that email already exists' });
      }
      res.status(500).json({ error: err.message });
    }
  },

  update(req, res) {
    try {
      const id = Number(req.params.id);
      if (!Number.isInteger(id) || id < 1) {
        return res.status(400).json({ error: 'Invalid member ID' });
      }
      const { name, email } = req.body;
      if (!name || typeof name !== 'string' || !name.trim()) {
        return res.status(400).json({ error: 'Member name is required' });
      }
      if (!email || typeof email !== 'string' || !email.trim()) {
        return res.status(400).json({ error: 'Member email is required' });
      }
      const member = Member.update(id, {
        name: name.trim(),
        email: email.trim(),
        phone: req.body.phone,
        address: req.body.address,
      });
      if (!member) return res.status(404).json({ error: 'Member not found' });
      res.json(member);
    } catch (err) {
      if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        return res.status(409).json({ error: 'A member with that email already exists' });
      }
      res.status(500).json({ error: err.message });
    }
  },

  delete(req, res) {
    try {
      const id = Number(req.params.id);
      if (!Number.isInteger(id) || id < 1) {
        return res.status(400).json({ error: 'Invalid member ID' });
      }
      const deleted = Member.delete(id);
      if (!deleted) return res.status(404).json({ error: 'Member not found' });
      res.json({ message: 'Member deleted' });
    } catch (err) {
      if (err.code === 'SQLITE_CONSTRAINT_FOREIGNKEY') {
        return res.status(409).json({ error: 'Cannot delete member with active borrowing records' });
      }
      res.status(500).json({ error: err.message });
    }
  }
};

module.exports = memberController;
