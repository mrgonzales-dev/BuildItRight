const Movie = require('../models/Movie');
const { stripHtml } = require('../utils/sanitize');

const CURRENT_YEAR = new Date().getFullYear();

const TITLE_MAX = 200;
const DESC_MAX = 5000;

// GET /api/movies
exports.getAll = (req, res) => {
  try {
    const movies = Movie.getAllWithRatings();
    return res.json(movies);
  } catch (err) {
    console.error('getAll movies error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// GET /api/movies/:id
exports.getById = (req, res) => {
  try {
    const movie = Movie.getByIdWithRating(req.params.id);
    if (!movie) {
      return res.status(404).json({ error: 'Movie not found' });
    }
    return res.json(movie);
  } catch (err) {
    console.error('getById movie error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// POST /api/movies — owner only
exports.create = (req, res) => {
  try {
    let { title, description, year, genre } = req.body;

    // Strip HTML from user-provided text fields to prevent stored XSS.
    title = stripHtml(title || '').trim();
    description = stripHtml(description || '').trim();
    genre = (genre || '').trim();

    if (!title || title.length > TITLE_MAX) {
      return res.status(400).json({ error: `Title is required and must be ${TITLE_MAX} characters or less` });
    }
    if (!description || description.length > DESC_MAX) {
      return res.status(400).json({ error: `Description is required and must be ${DESC_MAX} characters or less` });
    }
    if (!genre) {
      return res.status(400).json({ error: 'Genre is required' });
    }

    const yearNum = Number(year);
    // 1888 = year of first film. Current year + 5 allows upcoming releases.
    if (!Number.isInteger(yearNum) || yearNum < 1888 || yearNum > CURRENT_YEAR + 5) {
      return res.status(400).json({ error: `Year must be an integer between 1888 and ${CURRENT_YEAR + 5}` });
    }

    const movie = Movie.create({ title, description, year: yearNum, genre });
    return res.status(201).json(movie);
  } catch (err) {
    console.error('create movie error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// PUT /api/movies/:id — owner only. Partial updates: only provided fields are changed.
exports.update = (req, res) => {
  try {
    const existing = Movie.getById(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: 'Movie not found' });
    }

    let { title, description, year, genre } = req.body;

    // Only strip HTML if the field is actually being updated (not undefined).
    title = title !== undefined ? stripHtml(String(title)).trim() : undefined;
    description = description !== undefined ? stripHtml(String(description)).trim() : undefined;
    genre = genre !== undefined ? String(genre).trim() : undefined;

    if (title !== undefined && (!title || title.length > TITLE_MAX)) {
      return res.status(400).json({ error: `Title must be ${TITLE_MAX} characters or less` });
    }
    if (description !== undefined && description.length > DESC_MAX) {
      return res.status(400).json({ error: `Description must be ${DESC_MAX} characters or less` });
    }
    if (year !== undefined) {
      const yearNum = Number(year);
      if (!Number.isInteger(yearNum) || yearNum < 1888 || yearNum > CURRENT_YEAR + 5) {
        return res.status(400).json({ error: `Year must be an integer between 1888 and ${CURRENT_YEAR + 5}` });
      }
      year = yearNum;
    }

    const movie = Movie.update(req.params.id, { title, description, year, genre });
    return res.json(movie);
  } catch (err) {
    console.error('update movie error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// DELETE /api/movies/:id — owner only. Cascades to delete all associated reviews.
exports.remove = (req, res) => {
  try {
    const movie = Movie.remove(req.params.id);
    if (!movie) {
      return res.status(404).json({ error: 'Movie not found' });
    }
    return res.sendStatus(204);
  } catch (err) {
    console.error('delete movie error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
