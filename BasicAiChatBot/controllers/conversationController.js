const Conversation = require('../models/Conversation');

const conversationController = {
  getAll(req, res) {
    try {
      res.json(Conversation.getAll());
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  getById(req, res) {
    try {
      const id = Number(req.params.id);
      if (!Number.isInteger(id) || id < 1) {
        return res.status(400).json({ error: 'Invalid conversation ID' });
      }
      const conversation = Conversation.getById(id);
      if (!conversation) return res.status(404).json({ error: 'Conversation not found' });
      res.json(conversation);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  delete(req, res) {
    try {
      const id = Number(req.params.id);
      if (!Number.isInteger(id) || id < 1) {
        return res.status(400).json({ error: 'Invalid conversation ID' });
      }
      const deleted = Conversation.delete(id);
      if (!deleted) return res.status(404).json({ error: 'Conversation not found' });
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
};

module.exports = conversationController;
