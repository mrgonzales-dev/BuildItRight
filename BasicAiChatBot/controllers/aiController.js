const { getChatCompletion } = require('../config/ai');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');

const aiController = {
  async chat(req, res) {
    try {
      const { conversation_id, message } = req.body;

      if (!message || typeof message !== 'string' || !message.trim()) {
        return res.status(400).json({ error: 'message is required' });
      }

      let conversation;
      if (conversation_id) {
        const id = Number(conversation_id);
        if (!Number.isInteger(id) || id < 1) {
          return res.status(400).json({ error: 'Invalid conversation ID' });
        }
        conversation = Conversation.getById(id);
        if (!conversation) {
          return res.status(404).json({ error: 'Conversation not found' });
        }
      } else {
        const title = message.trim().substring(0, 50) + (message.length > 50 ? '...' : '');
        conversation = Conversation.create(title);
      }

      Message.create({
        conversation_id: conversation.id,
        role: 'user',
        content: message.trim()
      });

      const history = Message.getByConversation(conversation.id);
      const chatMessages = history.map(m => ({
        role: m.role,
        content: m.content
      }));

      const aiResponse = await getChatCompletion(chatMessages);

      const aiMessage = Message.create({
        conversation_id: conversation.id,
        role: 'assistant',
        content: aiResponse
      });

      res.json({
        conversation,
        message: {
          role: 'assistant',
          content: aiResponse
        }
      });
    } catch (err) {
      console.error('AI chat error:', err);
      res.status(500).json({ error: err.message });
    }
  }
};

module.exports = aiController;
