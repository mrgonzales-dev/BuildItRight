const db = require('../config/db');

const REVIEW_COLUMNS = 'id, movie_id, user_id, rating, comment, created_at';

function getById(id) {
  return db.prepare(`SELECT ${REVIEW_COLUMNS} FROM reviews WHERE id = ?`).get(id);
}

function getByMovieId(movieId) {
  // ponytail: fetching all reviews with JOIN. OK at moderate scale.
  // JOIN with users to get the reviewer's name alongside the review.
  return db.prepare(
    `SELECT r.id, r.movie_id, r.user_id, r.rating, r.comment, r.created_at,
            u.name AS user_name
     FROM reviews r
     JOIN users u ON r.user_id = u.id
     WHERE r.movie_id = ?
     ORDER BY r.created_at DESC`
  ).all(movieId);
}

function getByUserAndMovie(userId, movieId) {
  // Checks if a user already reviewed a specific movie — enforces the UNIQUE constraint in code.
  return db.prepare(
    `SELECT ${REVIEW_COLUMNS} FROM reviews WHERE user_id = ? AND movie_id = ?`
  ).get(userId, movieId);
}

function getByUserId(userId) {
  // JOIN with movies to show which movie each review belongs to on the My Reviews page.
  return db.prepare(
    `SELECT r.id, r.movie_id, r.rating, r.comment, r.created_at,
            m.title AS movie_title
     FROM reviews r
     JOIN movies m ON r.movie_id = m.id
     WHERE r.user_id = ?
     ORDER BY r.created_at DESC`
  ).all(userId);
}

function create({ movie_id, user_id, rating, comment }) {
  const info = db.prepare(
    `INSERT INTO reviews (movie_id, user_id, rating, comment) VALUES (?, ?, ?, ?)`
  ).run(movie_id, user_id, rating, comment);
  return getById(info.lastInsertRowid);
}

function update(id, { rating, comment }) {
  db.prepare(
    `UPDATE reviews SET rating = ?, comment = ? WHERE id = ?`
  ).run(rating, comment, id);
  return getById(id);
}

function remove(id) {
  const review = getById(id);
  if (!review) return null;
  db.prepare('DELETE FROM reviews WHERE id = ?').run(id);
  return review;
}

module.exports = { getById, getByMovieId, getByUserAndMovie, getByUserId, create, update, remove };
