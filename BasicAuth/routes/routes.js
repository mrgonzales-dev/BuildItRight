const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const databaseController = require('../controllers/databaseController');
const auth = require('../middleware/auth');

router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);
router.get('/auth/me', auth, authController.me);

router.get('/database', databaseController.getAll);

module.exports = router;
