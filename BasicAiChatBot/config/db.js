const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

const dbDir = path.join(__dirname, '..', 'database');
const dbPath = path.join(dbDir, 'basic-ai-chatbot.sqlite');

// Make sure the database directory exists (will be created on first run)
fs.mkdirSync(dbDir, { recursive: true });

const db = new Database(dbPath);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS conversations (
    id          INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    title       TEXT    NOT NULL DEFAULT 'New Chat',
    created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS messages (
    id              INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    conversation_id INTEGER NOT NULL,
    role            TEXT    NOT NULL,
    content         TEXT    NOT NULL,
    created_at      TEXT    NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);
`);

const convCount = db.prepare('SELECT COUNT(*) AS count FROM conversations').get().count;
if (convCount === 0) {
  const insertConv = db.prepare("INSERT INTO conversations (title) VALUES (?)");
  const conv = insertConv.run('Sample Conversation');
  const convId = conv.lastInsertRowid;

  const insertMsg = db.prepare("INSERT INTO messages (conversation_id, role, content) VALUES (?, ?, ?)");
  insertMsg.run(convId, 'user', 'Hello! What can you help me with today?');
  insertMsg.run(convId, 'assistant', "Hi there! I'm here to help with anything you need — questions, ideas, or just a chat. What's on your mind?");
  insertMsg.run(convId, 'user', 'Tell me a fun fact about space.');
  insertMsg.run(convId, 'assistant', 'Did you know that a day on Venus is longer than a year on Venus? It takes about 243 Earth days to rotate once, but only 225 Earth days to orbit the Sun!');
}

module.exports = db;
