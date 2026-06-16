const Review = require('../models/Review');
const { stripHtml } = require('../utils/sanitize');

const COMMENT_MAX = 5000;

// GET /api/movies/:movieId/reviews
exports.getByMovie = (req, res) => {
  try {
    const reviews = Review.getByMovieId(req.params.movieId);
    return res.json(reviews);
  } catch (err) {
    console.error('getByMovie reviews error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// GET /api/users/:userId/reviews
exports.getByUser = (req, res) => {
  try {
    const reviews = Review.getByUserId(req.params.userId);
    return res.json(reviews);
  } catch (err) {
    console.error('getByUser reviews error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// POST /api/movies/:movieId/reviews — authenticated user only
exports.create = (req, res) => {
  try {
    const movieId = req.params.movieId;
    let { rating, comment } = req.body;
    // req.user is set by requireAuth middleware — the user's ID comes from the database lookup.
    const userId = req.user.id;

    comment = stripHtml(comment || '').trim();

    // Validate rating is an integer between 1 and 5.
    if (!rating || !Number.isInteger(Number(rating)) || Number(rating) < 1 || Number(rating) > 5) {
      return res.status(400).json({ error: 'Rating must be an integer between 1 and 5' });
    }
    if (!comment || comment.length > COMMENT_MAX) {
      return res.status(400).json({ error: `Comment is required and must be ${COMMENT_MAX} characters or less` });
    }

    // Check for duplicate review BEFORE inserting — gives a friendly error.
    const existing = Review.getByUserAndMovie(userId, movieId);
    if (existing) {
      return res.status(409).json({ error: 'You have already reviewed this movie' });
    }

    rating = Number(rating);
    const review = Review.create({ movie_id: movieId, user_id: userId, rating, comment });
    return res.status(201).json(review);
  } catch (err) {
    // Race condition guard: if two requests slip past the duplicate check, the UNIQUE constraint catches it.
    if (err.message && err.message.includes('UNIQUE constraint failed')) {
      return res.status(409).json({ error: 'You have already reviewed this movie' });
    }
    console.error('create review error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// PUT /api/reviews/:id — only the review owner can edit
exports.update = (req, res) => {
  try {
    const review = Review.getById(req.params.id);
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }
    // Authorization check: users can only modify their own reviews.
    if (review.user_id !== req.user.id) {
      return res.status(403).json({ error: 'You can only edit your own reviews' });
    }

    let { rating, comment } = req.body;

    // Partial update: only validate and apply fields that are actually provided.
    if (rating !== undefined) {
      if (!Number.isInteger(Number(rating)) || Number(rating) < 1 || Number(rating) > 5) {
        return res.status(400).json({ error: 'Rating must be an integer between 1 and 5' });
      }
      rating = Number(rating);
    }
    if (comment !== undefined) {
      comment = stripHtml(comment || '').trim();
      if (comment.length > COMMENT_MAX) {
        return res.status(400).json({ error: `Comment must be ${COMMENT_MAX} characters or less` });
      }
    }

    const updated = Review.update(req.params.id, {
      rating: rating !== undefined ? rating : review.rating,
      comment: comment !== undefined ? comment : review.comment
    });
    return res.json(updated);
  } catch (err) {
    console.error('update review error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// DELETE /api/reviews/:id — only the review owner can delete
exports.remove = (req, res) => {
  try {
    const review = Review.getById(req.params.id);
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }
    if (review.user_id !== req.user.id) {
      return res.status(403).json({ error: 'You can only delete your own reviews' });
    }

    Review.remove(req.params.id);
    return res.sendStatus(204);
  } catch (err) {
    console.error('delete review error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
