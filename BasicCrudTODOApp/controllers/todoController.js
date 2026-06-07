// ============================================================
// controllers/todoController.js — Todo Business Logic
// ============================================================
// This is the brain of our API! When someone makes a request to
// any /todos endpoint, the router sends the request here.
// Each function in this file receives the request (what the user
// asked for) and sends back a response (what we want to tell them).
// We check that the data makes sense (validation), then ask the
// Todo model to do the actual database work.
// ============================================================

// Import the Todo model — the only code that talks directly to the database
const Todo = require('../models/Todo');

// ============================================================
// HELPER FUNCTIONS (used internally, not exported)
// ============================================================

// ---------- parseTodoId ----------
// Takes the ":id" from the URL (which comes in as text like "3")
// and converts it to a proper number. If it's not a valid positive
// whole number, we return null to signal "this ID is no good."
function parseTodoId(param) {
  const id = Number(param);
  if (!Number.isInteger(id) || id < 1) return null;
  return id;
}

// ---------- validateTitle ----------
// Checks that the "title" field exists and is a real string of text.
// If "required" is true (like when creating a new todo), we return
// an error if title is missing. Trims whitespace so "   " isn't valid.
function validateTitle(body, { required = false } = {}) {
  const { title } = body;
  if (title === undefined || title === null) {
    if (required) return { error: 'Title is required', statusCode: 400 };
    return { title: undefined };
  }
  if (typeof title !== 'string' || !title.trim()) {
    return { error: 'Title is required', statusCode: 400 };
  }
  return { title: title.trim() };
}

// ---------- validateDescription ----------
// Checks the "description" field IF it was provided in the request.
// Descriptions are optional, so if the field isn't there at all,
// we return undefined (meaning "don't touch it"). If it IS there,
// it must be either null (clear it) or a string.
function validateDescription(body) {
  if (!Object.prototype.hasOwnProperty.call(body, 'description')) {
    return { description: undefined };
  }
  const { description } = body;
  if (description === null) return { description: null };
  if (typeof description !== 'string') {
    return { error: 'Description must be a string', statusCode: 400 };
  }
  return { description: description.trim() || null };
}

// ---------- validateCompleted ----------
// Checks the "completed" field IF it was provided.
// Completed must be a boolean (true = done, false = not done).
// If the field wasn't sent, we return undefined (leave it as-is).
function validateCompleted(body) {
  if (!Object.prototype.hasOwnProperty.call(body, 'completed')) {
    return { completed: undefined };
  }
  const { completed } = body;
  if (typeof completed !== 'boolean') {
    return { error: 'Completed must be a boolean', statusCode: 400 };
  }
  return { completed };
}

// ---------- sendValidationError ----------
// A tiny helper that sends back an error response with the right
// HTTP status code. Saves us from repeating this pattern everywhere.
function sendValidationError(res, result) {
  return res.status(result.statusCode).json({ error: result.error });
}

// ============================================================
// CONTROLLER METHODS (the actual API handlers)
// Each one corresponds to a route in routes.js
// ============================================================

const todoController = {

  // ---------- GET /api/todos — Get ALL todos ----------
  // Fetches every todo from the database and sends them as JSON.
  // Todos come back newest-first (the model handles the sorting).
  getAll(req, res) {
    try {
      res.json(Todo.getAll());
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // ---------- GET /api/todos/:id — Get ONE todo ----------
  // Fetches a single todo by its unique ID (from the URL).
  // If the ID is invalid → 400 error. If not found → 404 error.
  getById(req, res) {
    try {
      const id = parseTodoId(req.params.id);
      if (id === null) {
        return res.status(400).json({ error: 'Invalid todo ID' });
      }
      const todo = Todo.getById(id);
      if (!todo) return res.status(404).json({ error: 'Todo not found' });
      res.json(todo);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // ---------- POST /api/todos — Create a NEW todo ----------
  // Accepts JSON with title (required), description (optional),
  // and completed (optional, defaults to false).
  // Returns the newly created todo with status 201 ( meaning "Created").
  create(req, res) {
    try {
      const titleResult = validateTitle(req.body, { required: true });
      if (titleResult.error) return sendValidationError(res, titleResult);

      const descResult = validateDescription(req.body);
      if (descResult.error) return sendValidationError(res, descResult);

      const completedResult = validateCompleted(req.body);
      if (completedResult.error) return sendValidationError(res, completedResult);

      const todo = Todo.create({
        title: titleResult.title,
        description: descResult.description,
        completed: completedResult.completed ?? false,  // Default to "not done" if not provided
      });
      res.status(201).json(todo);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // ---------- PUT /api/todos/:id — UPDATE an existing todo ----------
  // Only updates the fields that were actually sent in the request.
  // This is called a "partial update" — you can send just "title"
  // to change only the title, and the other fields stay the same.
  update(req, res) {
    try {
      const id = parseTodoId(req.params.id);
      if (id === null) {
        return res.status(400).json({ error: 'Invalid todo ID' });
      }

      const titleResult = validateTitle(req.body);
      if (titleResult.error) return sendValidationError(res, titleResult);

      const descResult = validateDescription(req.body);
      if (descResult.error) return sendValidationError(res, descResult);

      const completedResult = validateCompleted(req.body);
      if (completedResult.error) return sendValidationError(res, completedResult);

      // Build a "patch" object containing ONLY the fields that were provided
      const patch = {};
      if (titleResult.title !== undefined) patch.title = titleResult.title;
      if (descResult.description !== undefined) patch.description = descResult.description;
      if (completedResult.completed !== undefined) patch.completed = completedResult.completed;

      const todo = Todo.update(id, patch);
      if (!todo) return res.status(404).json({ error: 'Todo not found' });
      res.json(todo);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // ---------- DELETE /api/todos/:id — DELETE a todo ----------
  // Removes a todo from the database by its ID.
  // Returns a success message if it worked, or 404 if the todo doesn't exist.
  delete(req, res) {
    try {
      const id = parseTodoId(req.params.id);
      if (id === null) {
        return res.status(400).json({ error: 'Invalid todo ID' });
      }
      const deleted = Todo.delete(id);
      if (!deleted) return res.status(404).json({ error: 'Todo not found' });
      res.json({ message: 'Todo deleted successfully' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
};

module.exports = todoController;
