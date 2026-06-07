// ============================================================
// routes/routes.js — API Route Definitions
// ============================================================
// Think of this file as the "table of contents" for our API.
// It maps URL paths (like /todos) to the code that handles them.
// When someone visits a URL, Express looks here to decide which
// function to call. Each route connects an HTTP method (GET,
// POST, PUT, DELETE) and a path to a controller function.
// ============================================================

const express = require('express');
const router = express.Router();

// Import the controller files — these contain the actual logic
// that runs when someone hits each route
const todoController = require('../controllers/todoController');
const databaseController = require('../controllers/databaseController');

// ---------- Dev-only route: inspect the database ----------
// This route is ONLY available in development (not in production).
// It dumps the entire database contents — great for debugging!
// Visit http://localhost:3000/api/database to see all tables and data.
if (process.env.NODE_ENV !== 'production') {
  router.get('/database', databaseController.getAll);
}

// ---------- Todo CRUD routes ----------
// CRUD = Create, Read, Update, Delete — the four basic operations
// for managing data. Each route below handles one of these operations.

// GET /api/todos      → Fetch ALL todos (Read)
router.get('/todos', todoController.getAll);
// GET /api/todos/:id  → Fetch ONE todo by its ID (Read)
// ":id" is a URL parameter — it captures whatever value is in that spot
router.get('/todos/:id', todoController.getById);
// POST /api/todos     → Create a NEW todo (Create)
router.post('/todos', todoController.create);
// PUT /api/todos/:id  → UPDATE an existing todo (Update)
router.put('/todos/:id', todoController.update);
// DELETE /api/todos/:id → DELETE a todo (Delete)
router.delete('/todos/:id', todoController.delete);

module.exports = router;
