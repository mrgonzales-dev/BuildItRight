const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');

// Create the database/ folder if it doesn't exist — keeps .sqlite out of version control.
const dbDir = path.join(__dirname, '..', 'database');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// better-sqlite3 opens (or creates) the file synchronously on first use.
const dbPath = path.join(dbDir, 'moviereviews.sqlite');
const db = new Database(dbPath);

// WAL mode lets reads and writes happen concurrently — better than the default journal.
// Foreign keys enforce referential integrity (e.g. a review's movie_id must exist).
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------
// CREATE TABLE IF NOT EXISTS is idempotent — safe to run on every server start.
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    name       TEXT    NOT NULL,
    email      TEXT    NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role       TEXT    NOT NULL DEFAULT 'customer' CHECK(role IN ('customer', 'owner')),
    created_at TEXT    NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS movies (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    title       TEXT    NOT NULL,
    description TEXT    NOT NULL DEFAULT '',
    year        INTEGER NOT NULL,
    genre       TEXT    NOT NULL DEFAULT '',
    created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
  );

  -- UNIQUE(movie_id, user_id) prevents one user from reviewing the same movie twice.
  CREATE TABLE IF NOT EXISTS reviews (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    movie_id   INTEGER NOT NULL REFERENCES movies(id) ON DELETE CASCADE,
    user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rating     INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
    comment    TEXT    NOT NULL DEFAULT '',
    created_at TEXT    NOT NULL DEFAULT (datetime('now')),
    UNIQUE(movie_id, user_id)
  );
`);

// ---------------------------------------------------------------------------
// Seed data (only if movies table is empty)
// ---------------------------------------------------------------------------
const movieCount = db.prepare('SELECT COUNT(*) AS cnt FROM movies').get().cnt;

if (movieCount === 0) {
  // bcrypt cost 10 = ~100ms on modern hardware. Good balance of speed vs security.
  const hash = bcrypt.hashSync('owner123', 10);
  db.prepare(
    `INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)`
  ).run('Owner', 'owner@moviesite.com', hash, 'owner');

  const movies = [
    ['The Shawshank Redemption', 'Two imprisoned men bond over a number of years.', 1994, 'Drama'],
    ['The Godfather', 'The aging patriarch of an organized crime dynasty.', 1972, 'Crime'],
    ['The Dark Knight', 'When the menace known as the Joker wreaks havoc.', 2008, 'Action'],
    ['Pulp Fiction', 'The lives of two mob hitmen, a boxer, and more intertwine.', 1994, 'Crime'],
    ['Forrest Gump', 'The presidencies of Kennedy and Johnson through the eyes of an Alabama man.', 1994, 'Drama'],
    ['Fight Club', 'An insomniac office worker and a devil-may-care soap maker form an underground fight club.', 1999, 'Drama'],
    ['Inception', 'A thief who steals corporate secrets through the use of dream-sharing technology.', 2010, 'Sci-Fi'],
    ['The Matrix', 'A computer hacker learns about the true nature of his reality.', 1999, 'Sci-Fi'],
    ['Goodfellas', 'The story of Henry Hill and his life in the mob.', 1990, 'Crime'],
    ['Interstellar', "A team of explorers travel through a wormhole in space.", 2014, 'Sci-Fi'],
    ['The Silence of the Lambs', 'A young FBI cadet must receive the help of an incarcerated and manipulative cannibal killer.', 1991, 'Thriller'],
    ['Saving Private Ryan', 'Following the Normandy Landings, a group of U.S. soldiers go behind enemy lines.', 1998, 'War'],
    ['The Green Mile', 'The lives of guards on Death Row are affected by one of their charges.', 1999, 'Drama'],
    ['Gladiator', 'A former Roman General sets out to exact vengeance against the corrupt emperor.', 2000, 'Action'],
    ['The Departed', 'An undercover cop and a mole in the police attempt to identify each other.', 2006, 'Crime']
  ];

  // Prepared statements + transactions = fast bulk inserts. The statement is compiled once, reused per row.
  const insertMovie = db.prepare(
    `INSERT INTO movies (title, description, year, genre) VALUES (?, ?, ?, ?)`
  );

  const seedMovies = db.transaction((movieList) => {
    for (const m of movieList) {
      insertMovie.run(...m);
    }
  });
  seedMovies(movies);
}

module.exports = db;
