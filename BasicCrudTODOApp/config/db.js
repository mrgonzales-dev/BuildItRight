// ============================================================
// config/db.js — Database Setup & Configuration
// ============================================================
// This file handles everything related to our SQLite database:
// connecting to it, creating the "todos" table, and adding some
// sample data so we have something to work with right away.
// SQLite is a lightweight database that stores everything in a
// single file — no need to install a separate database server!
// ============================================================

// ---------- Import our tools ----------
// better-sqlite3: the library that lets us talk to SQLite from JavaScript
// path: helps build file paths that work on any operating system
const Database = require('better-sqlite3');
const path = require('path');

// ---------- Connect to the database file ----------
// We build the path to our database file, which lives in the "database" folder
const dbPath = path.join(__dirname, '..', 'database', 'todo.sqlite');
// Create (or open) the database connection. If the file doesn't exist yet,
// SQLite will create it automatically — neat!
const db = new Database(dbPath);

// ---------- Performance & safety settings (PRAGMAs) ----------
// PRAGMAs are like configuration switches for SQLite.

// WAL (Write-Ahead Logging) mode = faster reads and writes,
// especially when multiple things are accessing the database at once
db.pragma('journal_mode = WAL');
// Enforce foreign key rules — this makes sure we don't have
// orphaned references between tables (we'll use this later!)
db.pragma('foreign_keys = ON');

// ---------- Create the todos table (if it doesn't exist) ----------
// "IF NOT EXISTS" means this runs safely even if the table is already there.
// This is our "schema" — the blueprint for how todo data is stored.
db.exec(`
  CREATE TABLE IF NOT EXISTS todos (
    id          INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    -- ^ Each todo gets a unique number ID, automatically increased
    title       TEXT    NOT NULL,
    -- ^ The task name — required (NOT NULL)
    description TEXT    NULL,
    -- ^ Optional details about the task (NULL = allowed to be empty)
    completed   INTEGER NOT NULL DEFAULT 0,
    -- ^ 0 = not done, 1 = done (SQLite doesn't have true/false, so we use 0/1)
    created_at  TEXT    NOT NULL DEFAULT (datetime('now')),
    -- ^ Timestamp of when the todo was created, set automatically
    updated_at  TEXT    NULL
    -- ^ Timestamp of last update — filled in when we edit the todo
  );

  -- Indexes make searching faster. These help when we filter by
  -- completed status or sort by creation date on large datasets.
  CREATE INDEX IF NOT EXISTS idx_todos_completed ON todos(completed);
  CREATE INDEX IF NOT EXISTS idx_todos_created_at ON todos(created_at);
`);

// ---------- Seed the database with sample todos ----------
// "Seed" = add some initial data so the app isn't empty on first run.
// We count how many todos already exist — if the table is empty, add 3 examples.
const todoCount = db.prepare('SELECT COUNT(*) AS count FROM todos').get().count;
if (todoCount === 0) {
  const insert = db.prepare("INSERT INTO todos (title, description, completed) VALUES (?, ?, ?)");
  insert.run('Buy groceries', 'Milk, eggs, bread, and coffee', 0);
  insert.run('Finish project report', 'Complete the quarterly report for the team', 0);
  insert.run('Walk the dog', 'Morning walk around the park', 1);
}

// ---------- Close function ----------
// Call this when the server shuts down to close the database connection safely
function close() {
  db.close();
}

// ---------- Export for other files to use ----------
// We export both the db instance (so models can run queries)
// and the close function (so server.js can shut things down gracefully)
module.exports = db;
module.exports.close = close;
