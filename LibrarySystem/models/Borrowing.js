const db = require('../config/db');
const Book = require('./Book');

const Borrowing = {
  getAll() {
    return db.prepare(
      `SELECT br.*, b.title AS book_title, b.isbn, m.name AS member_name, m.email AS member_email
       FROM borrowings br
       LEFT JOIN books b ON br.book_id = b.id
       LEFT JOIN members m ON br.member_id = m.id
       ORDER BY br.borrow_date DESC`
    ).all();
  },

  getById(id) {
    return db.prepare(
      `SELECT br.*, b.title AS book_title, b.isbn, m.name AS member_name, m.email AS member_email
       FROM borrowings br
       LEFT JOIN books b ON br.book_id = b.id
       LEFT JOIN members m ON br.member_id = m.id
       WHERE br.id = ?`
    ).get(id);
  },

  getByMember(memberId) {
    return db.prepare(
      `SELECT br.*, b.title AS book_title, b.isbn, m.name AS member_name, m.email AS member_email
       FROM borrowings br
       LEFT JOIN books b ON br.book_id = b.id
       LEFT JOIN members m ON br.member_id = m.id
       WHERE br.member_id = ?
       ORDER BY br.borrow_date DESC`
    ).all(memberId);
  },

  getByBook(bookId) {
    return db.prepare(
      `SELECT br.*, b.title AS book_title, b.isbn, m.name AS member_name, m.email AS member_email
       FROM borrowings br
       LEFT JOIN books b ON br.book_id = b.id
       LEFT JOIN members m ON br.member_id = m.id
       WHERE br.book_id = ?
       ORDER BY br.borrow_date DESC`
    ).all(bookId);
  },

  getOverdue() {
    return db.prepare(
      `SELECT br.*,
              CASE WHEN br.due_date < date('now') AND br.return_date IS NULL THEN 'overdue'
                   ELSE br.status
              END AS calculated_status,
              b.title AS book_title, b.isbn, m.name AS member_name, m.email AS member_email
       FROM borrowings br
       LEFT JOIN books b ON br.book_id = b.id
       LEFT JOIN members m ON br.member_id = m.id
       WHERE br.return_date IS NULL AND br.due_date < date('now')
       ORDER BY br.due_date`
    ).all();
  },

  create(data) {
    const createBorrowing = db.transaction((book_id, member_id, due_date) => {
      const available = Book.getAvailable(book_id);

      if (available < 1) {
        throw Object.assign(new Error('Book not available'), { statusCode: 409 });
      }

      const info = db.prepare(
        'INSERT INTO borrowings (book_id, member_id, due_date) VALUES (?, ?, ?)'
      ).run(book_id, member_id, due_date);

      Book.updateQuantity(book_id, -1);

      return Borrowing.getById(info.lastInsertRowid);
    });

    return createBorrowing(data.book_id, data.member_id, data.due_date);
  },

  update(id, data) {
    db.prepare(
      `UPDATE borrowings SET book_id = ?, member_id = ?, due_date = ?,
       updated_at = datetime('now')
       WHERE id = ?`
    ).run(data.book_id, data.member_id, data.due_date, id);
    return Borrowing.getById(id);
  },

  delete(id) {
    const info = db.prepare('DELETE FROM borrowings WHERE id = ?').run(id);
    return info.changes > 0;
  },

  returnBook(id) {
    const fn = db.transaction((borrowingId) => {
      const borrowing = Borrowing.getById(borrowingId);

      if (!borrowing) return null;

      if (borrowing.status === 'returned') {
        throw Object.assign(new Error('Borrowing already returned'), { statusCode: 400 });
      }

      db.prepare(
        "UPDATE borrowings SET return_date = date('now'), status = 'returned', updated_at = datetime('now') WHERE id = ?"
      ).run(borrowingId);

      Book.updateQuantity(borrowing.book_id, 1);

      return Borrowing.getById(borrowingId);
    });

    return fn(id);
  }
};

module.exports = Borrowing;
