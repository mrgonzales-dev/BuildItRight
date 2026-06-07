const express = require('express');
const router = express.Router();

const conversationController = require('../controllers/conversationController');
const messageController = require('../controllers/messageController');
const aiController = require('../controllers/aiController');
const databaseController = require('../controllers/databaseController');

router.get('/database', databaseController.getAll);

router.get('/conversations', conversationController.getAll);
router.get('/conversations/:id', conversationController.getById);
router.delete('/conversations/:id', conversationController.delete);

router.get('/messages/conversation/:conversationId', messageController.getByConversation);

router.post('/ai/chat', aiController.chat);

module.exports = router;
