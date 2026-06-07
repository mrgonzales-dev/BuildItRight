const db = require('../config/db');

const Book = {
  getAll() {
    return db.prepare(
      `SELECT b.*, c.name AS category_name
       FROM books b
       LEFT JOIN categories c ON b.category_id = c.id
       ORDER BY b.title`
    ).all();
  },

  getById(id) {
    return db.prepare(
      `SELECT b.*, c.name AS category_name
       FROM books b
       LEFT JOIN categories c ON b.category_id = c.id
       WHERE b.id = ?`
    ).get(id);
  },

  search(term) {
    return db.prepare(
      `SELECT b.*, c.name AS category_name
       FROM books b
       LEFT JOIN categories c ON b.category_id = c.id
       WHERE b.title LIKE ? OR b.author LIKE ? OR b.isbn LIKE ?
       ORDER BY b.title`
    ).all(`%${term}%`, `%${term}%`, `%${term}%`);
  },

  create(data) {
    const info = db.prepare(
      `INSERT INTO books (title, author, isbn, publisher, publication_year, category_id, total_quantity, available_quantity)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      data.title,
      data.author,
      data.isbn,
      data.publisher || null,
      data.publication_year || null,
      data.category_id,
      data.total_quantity ?? 1,
      data.available_quantity ?? data.total_quantity ?? 1
    );
    return Book.getById(info.lastInsertRowid);
  },

  update(id, data) {
    db.prepare(
      `UPDATE books
       SET title = ?, author = ?, isbn = ?, publisher = ?,
            publication_year = ?, category_id = ?,
            total_quantity = ?, available_quantity = ?,
            updated_at = datetime('now')
       WHERE id = ?`
    ).run(
      data.title,
      data.author,
      data.isbn,
      data.publisher || null,
      data.publication_year || null,
      data.category_id,
      data.total_quantity,
      data.available_quantity,
      id
    );
    return Book.getById(id);
  },

  delete(id) {
    const info = db.prepare('DELETE FROM books WHERE id = ?').run(id);
    return info.changes > 0;
  },

  updateQuantity(id, delta) {
    db.prepare(
      'UPDATE books SET available_quantity = available_quantity + ?, updated_at = datetime(\'now\') WHERE id = ?'
    ).run(delta, id);
  },

  getAvailable(id) {
    const row = db.prepare('SELECT available_quantity FROM books WHERE id = ?').get(id);
    return row ? row.available_quantity : 0;
  }
};

module.exports = Book;
