const db = require('../config/db');

const MOVIE_COLUMNS = 'id, title, description, year, genre, created_at';

function getAllWithRatings() {
  const movies = db.prepare(`SELECT ${MOVIE_COLUMNS} FROM movies ORDER BY created_at DESC`).all();
  // ponytail: N+1 query for avg_rating — fine for 15 movies. At >100 movies, replace with JOIN + GROUP BY.
  const stmt = db.prepare('SELECT AVG(rating) AS avg_rating, COUNT(*) AS review_count FROM reviews WHERE movie_id = ?');
  for (const movie of movies) {
    const row = stmt.get(movie.id);
    // Round to 1 decimal place. null if no reviews.
    movie.avg_rating = row.avg_rating ? Math.round(row.avg_rating * 10) / 10 : null;
    movie.review_count = row.review_count;
  }
  return movies;
}

function getById(id) {
  return db.prepare(`SELECT ${MOVIE_COLUMNS} FROM movies WHERE id = ?`).get(id);
}

function getByIdWithRating(id) {
  const movie = db.prepare(`SELECT ${MOVIE_COLUMNS} FROM movies WHERE id = ?`).get(id);
  if (!movie) return null;
  // ponytail: N+1 query for avg_rating — fine for 15 movies. At >100 movies, replace with JOIN + GROUP BY.
  const row = db.prepare('SELECT AVG(rating) AS avg_rating, COUNT(*) AS review_count FROM reviews WHERE movie_id = ?').get(id);
  movie.avg_rating = row.avg_rating ? Math.round(row.avg_rating * 10) / 10 : null;
  movie.review_count = row.review_count;
  return movie;
}

function create({ title, description, year, genre }) {
  const info = db.prepare(
    `INSERT INTO movies (title, description, year, genre) VALUES (?, ?, ?, ?)`
  ).run(title, description, year, genre);
  return getById(info.lastInsertRowid);
}

// COALESCE keeps existing values when a field isn't provided — enables partial updates.
function update(id, { title, description, year, genre }) {
  db.prepare(
    `UPDATE movies SET title = COALESCE(?, title), description = COALESCE(?, description), year = COALESCE(?, year), genre = COALESCE(?, genre) WHERE id = ?`
  ).run(title || null, description || null, year || null, genre || null, id);
  return getById(id);
}

function remove(id) {
  const movie = getById(id);
  if (!movie) return null;
  // ON DELETE CASCADE in the reviews table removes associated reviews automatically.
  db.prepare('DELETE FROM movies WHERE id = ?').run(id);
  return movie;
}

module.exports = { getAllWithRatings, getById, getByIdWithRating, create, update, remove };
