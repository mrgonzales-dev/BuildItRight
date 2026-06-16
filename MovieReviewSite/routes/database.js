const { Router } = require('express');
const router = Router();
const databaseController = require('../controllers/databaseController');

router.get('/', databaseController.getStatus);

module.exports = router;
