const { Router } = require('express');
const router = Router();
const movieController = require('../controllers/movieController');
const reviewController = require('../controllers/reviewController');
const { requireAuth, requireOwner } = require('../middleware/auth');

// Public
router.get('/', movieController.getAll);
router.get('/:id', movieController.getById);
router.get('/:movieId/reviews', reviewController.getByMovie);

// Owner-only (create / update / delete)
router.post('/', requireAuth, requireOwner, movieController.create);
router.put('/:id', requireAuth, requireOwner, movieController.update);
router.delete('/:id', requireAuth, requireOwner, movieController.remove);

// Authenticated users can post reviews
router.post('/:movieId/reviews', requireAuth, reviewController.create);

module.exports = router;
