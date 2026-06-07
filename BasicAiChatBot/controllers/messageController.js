const Message = require('../models/Message');

const messageController = {
  getByConversation(req, res) {
    try {
      const conversationId = Number(req.params.conversationId);
      if (!Number.isInteger(conversationId) || conversationId < 1) {
        return res.status(400).json({ error: 'Invalid conversation ID' });
      }
      res.json(Message.getByConversation(conversationId));
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
};

module.exports = messageController;
