const { Router } = require('express');
const router = Router();
const reviewController = require('../controllers/reviewController');
const { requireAuth } = require('../middleware/auth');

// Authenticated — edit / delete own reviews
router.put('/reviews/:id', requireAuth, reviewController.update);
router.delete('/reviews/:id', requireAuth, reviewController.remove);

// Public — get all reviews for a user (MyReviews page)
router.get('/users/:userId/reviews', reviewController.getByUser);

module.exports = router;
