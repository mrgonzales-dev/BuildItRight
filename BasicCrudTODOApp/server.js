// ============================================================
// server.js — Main Server Entry Point
// ============================================================
// This is where our Express server is born! Think of it as the
// front door to our TODO application. It sets up all the
// middlewares (helpers that process requests), connects the
// API routes, handles errors, and starts listening for visitors.
// ============================================================

// ---------- Import our dependencies ----------
// express: the web framework we use to build the server
// cors: lets other websites (like our React frontend) talk to this API safely
// close: a helper to gracefully shut down the database connection
const express = require('express');
const cors = require('cors');
const { close: closeDb } = require('./config/db');

// routes: all our API endpoint definitions live in this file
const routes = require('./routes/routes');

// ---------- Create the app and choose a port ----------
// "app" is our server — we'll configure it below and then start it
const app = express();
// Use the PORT from environment variables (if set), otherwise default to 3000
const PORT = process.env.PORT || 3000;

// ---------- Middleware setup ----------
// These are functions that run on EVERY request before it reaches our routes.

// CORS middleware — allows our frontend (running on a different port) to talk to this API
app.use(cors());
// JSON body parser — automatically turns incoming JSON into a JavaScript object (req.body)
app.use(express.json());
// Mount all our API routes under the "/api" path (e.g., /api/todos)
app.use('/api', routes);

// ---------- 404 catch-all for unknown /api routes ----------
// If a request reaches this point (none of our /api routes matched), send a "not found" error
app.use('/api', (req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// ---------- Root route ----------
// A simple welcome message so you know the server is alive when you visit http://localhost:3000
app.get('/', (req, res) => {
  res.json({ message: 'TODO App API is running' });
});

// ---------- Global error handler ----------
// If any route throws an error, Express jumps to this special middleware
// The "err" parameter tells Express this is an error handler (needs 4 params)
app.use((err, req, res, next) => {
  res.status(500).json({ error: err.message || 'Internal server error' });
});

// ---------- Graceful shutdown helper ----------
// When we want to stop the server, we close the database connection first
// to avoid corrupting any data, then exit cleanly
function shutdown() {
  closeDb();
  process.exit(0);
}

// ---------- Listen for shutdown signals ----------
// These are signals the operating system sends when it wants the process to stop.
// SIGTERM: sent by deployment platforms (like Heroku, Render) when restarting
// SIGINT: sent when you press Ctrl+C in the terminal
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

// ---------- Start the server! ----------
// This is the moment the server comes to life and starts listening for requests
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
