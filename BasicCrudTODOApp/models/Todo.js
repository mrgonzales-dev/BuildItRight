// ============================================================
// models/Todo.js — Data Access Layer (Database Queries)
// ============================================================
// This is the ONLY code that talks directly to the database.
// Think of it as a translator: the controller speaks JavaScript,
// and the database speaks SQL. This file bridges the gap by
// providing clean methods like getAll(), getById(), create(), etc.
//
// We "prepare" our SQL statements once at the top (instead of
// writing them every time) — this is faster AND safer because it
// helps protect against SQL injection attacks.
// ============================================================

const db = require('../config/db');

// ---------- Prepared Statements ----------
// These are compiled SQL queries that we can reuse over and over.
// The "?" placeholders are filled in with actual values when we run them.

// Get all todos, newest first (ORDER BY created_at DESC = descending order)
const stmtGetAll = db.prepare('SELECT * FROM todos ORDER BY created_at DESC');
// Get a single todo by its unique ID (the "?" will be replaced with the ID)
const stmtGetById = db.prepare('SELECT * FROM todos WHERE id = ?');
// Insert a new todo — the three "?" get filled with title, description, completed
const stmtInsert = db.prepare(
  'INSERT INTO todos (title, description, completed) VALUES (?, ?, ?)'
);
// Delete a todo by its ID
const stmtDelete = db.prepare('DELETE FROM todos WHERE id = ?');

// ---------- mapRow — Convert raw database rows ----------
// SQLite doesn't have a "boolean" type — it stores true/false as
// the integers 1 and 0. This function converts each row so that
// the `completed` field becomes a proper JavaScript boolean (true/false).
// This way, our API returns nice clean JSON.
function mapRow(row) {
  if (!row) return row;
  return { ...row, completed: Boolean(row.completed) };
}

// ============================================================
// Todo Model — clean JavaScript methods for database operations
// ============================================================

const Todo = {
  // ---------- getAll() — Fetch ALL todos ----------
  // Returns an array of every todo in the database, sorted newest first.
  // Each row goes through mapRow to convert 0/1 to true/false.
  getAll() {
    return stmtGetAll.all().map(mapRow);
  },

  // ---------- getById(id) — Fetch ONE todo ----------
  // Returns a single todo object, or undefined if no match found.
  getById(id) {
    return mapRow(stmtGetById.get(id));
  },

  // ---------- create(data) — Add a new todo ----------
  // Inserts a new todo row with the given title, description, and status.
  // The "data.completed ? 1 : 0" converts JavaScript true/false to SQLite's 1/0.
  // After inserting, we fetch the new todo back so we can return it to the user.
  create(data) {
    const info = stmtInsert.run(
      data.title,
      data.description ?? null,  // If description isn't provided, store null
      data.completed ? 1 : 0     // Convert boolean to SQLite integer (1 or 0)
    );
    return Todo.getById(info.lastInsertRowid);  // Fetch the fresh row using its new ID
  },

  // ---------- update(id, data) — Update an existing todo ----------
  // This is a "dynamic update" — it only changes the fields that were
  // actually provided in `data`. If you only send { title: "new name" },
  // it only updates the title and leaves everything else alone.
  // We build the SQL SET clause piece by piece based on what's present.
  // Also adds an "updated_at" timestamp so we know when it was last changed.
  update(id, data) {
    const sets = [];   // Holds the "column = ?" pieces for the SQL SET clause
    const params = []; // Holds the actual values to plug into those placeholders

    if (data.title !== undefined) {
      sets.push('title = ?');
      params.push(data.title);
    }
    if (data.description !== undefined) {
      sets.push('description = ?');
      params.push(data.description);
    }
    if (data.completed !== undefined) {
      sets.push('completed = ?');
      params.push(data.completed ? 1 : 0);  // Convert boolean → 0/1 for SQLite
    }

    // If nothing was provided to update, just return the current todo unchanged
    if (sets.length === 0) {
      return Todo.getById(id);
    }

    // Add the updated_at timestamp — SQLite's datetime('now') gives us the current time
    sets.push("updated_at = datetime('now')");
    params.push(id);  // The ID goes last, for the WHERE id = ? part

    // Build and run the final query, e.g.:
    // UPDATE todos SET title = ?, updated_at = datetime('now') WHERE id = ?
    const info = db
      .prepare(`UPDATE todos SET ${sets.join(', ')} WHERE id = ?`)
      .run(...params);

    // If no rows were changed (info.changes === 0), the todo didn't exist
    if (info.changes === 0) return undefined;
    return Todo.getById(id);
  },

  // ---------- delete(id) — Remove a todo ----------
  // Deletes the todo with the given ID from the database.
  // Returns true if a row was actually deleted, or false if nothing matched.
  delete(id) {
    const info = stmtDelete.run(id);
    return info.changes > 0;  // changes tells us how many rows were affected
  },
};

module.exports = Todo;
