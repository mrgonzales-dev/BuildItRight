const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'database', 'library.sqlite');
const db = new Database(dbPath);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Migration: rename old "borrowing" table to "borrowings" (plural convention)
const oldBorrowing = db.prepare(
  "SELECT name FROM sqlite_master WHERE type='table' AND name='borrowing'"
).get();
if (oldBorrowing) {
  db.prepare('ALTER TABLE borrowing RENAME TO borrowings').run();
}

db.exec(`
  CREATE TABLE IF NOT EXISTS categories (
    id          INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    name        TEXT    NOT NULL UNIQUE,
    description TEXT    NULL,
    created_at  TEXT    NOT NULL DEFAULT (datetime('now')),
    updated_at  TEXT    NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS books (
    id                  INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    title               TEXT    NOT NULL,
    author              TEXT    NOT NULL,
    isbn                TEXT    NOT NULL UNIQUE,
    publisher           TEXT    NULL,
    publication_year    INTEGER NULL,
    category_id         INTEGER NOT NULL,
    total_quantity      INTEGER NOT NULL DEFAULT 1,
    available_quantity  INTEGER NOT NULL DEFAULT 1,
    created_at          TEXT    NOT NULL DEFAULT (datetime('now')),
    updated_at          TEXT    NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (category_id) REFERENCES categories(id)
  );

  CREATE TABLE IF NOT EXISTS members (
    id                INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    name              TEXT    NOT NULL,
    email             TEXT    NOT NULL UNIQUE,
    phone             TEXT    NULL,
    address           TEXT    NULL,
    membership_date   TEXT    NOT NULL DEFAULT (date('now')),
    created_at        TEXT    NOT NULL DEFAULT (datetime('now')),
    updated_at        TEXT    NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS borrowings (
    id            INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    book_id       INTEGER NOT NULL,
    member_id     INTEGER NOT NULL,
    borrow_date   TEXT    NOT NULL DEFAULT (date('now')),
    due_date      TEXT    NOT NULL,
    return_date   TEXT    NULL,
    status        TEXT    NOT NULL DEFAULT 'borrowed' CHECK (status IN ('borrowed', 'returned', 'overdue')),
    created_at    TEXT    NOT NULL DEFAULT (datetime('now')),
    updated_at    TEXT    NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (book_id) REFERENCES books(id),
    FOREIGN KEY (member_id) REFERENCES members(id)
  );

  CREATE INDEX IF NOT EXISTS idx_books_title ON books(title);
  CREATE INDEX IF NOT EXISTS idx_books_author ON books(author);
  CREATE INDEX IF NOT EXISTS idx_books_category ON books(category_id);
  CREATE INDEX IF NOT EXISTS idx_members_name ON members(name);
  CREATE INDEX IF NOT EXISTS idx_borrowings_book ON borrowings(book_id);
  CREATE INDEX IF NOT EXISTS idx_borrowings_member ON borrowings(member_id);
  CREATE INDEX IF NOT EXISTS idx_borrowings_status ON borrowings(status);
`);

const memberCount = db.prepare('SELECT COUNT(*) AS count FROM members').get().count;
if (memberCount === 0) {
  db.prepare("INSERT INTO categories (name, description) VALUES (?, ?)").run('Fiction', 'Novels and literary works');
  db.prepare("INSERT INTO categories (name, description) VALUES (?, ?)").run('Science', 'Scientific and academic books');
  db.prepare("INSERT INTO categories (name, description) VALUES (?, ?)").run('Technology', 'Computing and programming books');
  db.prepare("INSERT INTO categories (name, description) VALUES (?, ?)").run('History', 'Historical books and biographies');

  db.prepare("INSERT INTO books (title, author, isbn, publisher, publication_year, category_id, total_quantity, available_quantity) VALUES (?, ?, ?, ?, ?, ?, ?, ?)")
    .run('The Great Gatsby', 'F. Scott Fitzgerald', '978-0743273565', 'Scribner', 1925, 1, 3, 3);
  db.prepare("INSERT INTO books (title, author, isbn, publisher, publication_year, category_id, total_quantity, available_quantity) VALUES (?, ?, ?, ?, ?, ?, ?, ?)")
    .run('A Brief History of Time', 'Stephen Hawking', '978-0553380163', 'Bantam', 1988, 2, 2, 2);
  db.prepare("INSERT INTO books (title, author, isbn, publisher, publication_year, category_id, total_quantity, available_quantity) VALUES (?, ?, ?, ?, ?, ?, ?, ?)")
    .run('Clean Code', 'Robert C. Martin', '978-0132350884', 'Prentice Hall', 2008, 3, 4, 4);
  db.prepare("INSERT INTO books (title, author, isbn, publisher, publication_year, category_id, total_quantity, available_quantity) VALUES (?, ?, ?, ?, ?, ?, ?, ?)")
    .run('Sapiens', 'Yuval Noah Harari', '978-0062316097', 'Harper', 2011, 4, 2, 2);

  db.prepare("INSERT INTO members (name, email, phone, address) VALUES (?, ?, ?, ?)")
    .run('Alex Rivera', 'alex@example.com', '555-0100', '123 Library Lane');
}

module.exports = db;
