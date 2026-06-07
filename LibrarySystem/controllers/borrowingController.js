const Borrowing = require('../models/Borrowing');

const borrowingController = {
  getAll(req, res) {
    try {
      res.json(Borrowing.getAll());
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  getById(req, res) {
    try {
      const id = Number(req.params.id);
      if (!Number.isInteger(id) || id < 1) {
        return res.status(400).json({ error: 'Invalid borrowing ID' });
      }
      const borrowing = Borrowing.getById(id);
      if (!borrowing) return res.status(404).json({ error: 'Borrowing not found' });
      res.json(borrowing);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  getByMember(req, res) {
    try {
      const memberId = Number(req.params.memberId);
      if (!Number.isInteger(memberId) || memberId < 1) {
        return res.status(400).json({ error: 'Invalid member ID' });
      }
      res.json(Borrowing.getByMember(memberId));
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  getByBook(req, res) {
    try {
      const bookId = Number(req.params.bookId);
      if (!Number.isInteger(bookId) || bookId < 1) {
        return res.status(400).json({ error: 'Invalid book ID' });
      }
      res.json(Borrowing.getByBook(bookId));
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  getOverdue(req, res) {
    try {
      res.json(Borrowing.getOverdue());
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  create(req, res) {
    try {
      const { book_id, member_id, due_date } = req.body;
      const bId = Number(book_id);
      if (isNaN(bId) || !Number.isInteger(bId) || bId < 1) {
        return res.status(400).json({ error: 'Valid book_id is required' });
      }
      const mId = Number(member_id);
      if (isNaN(mId) || !Number.isInteger(mId) || mId < 1) {
        return res.status(400).json({ error: 'Valid member_id is required' });
      }
      if (!due_date || typeof due_date !== 'string' || !due_date.trim()) {
        return res.status(400).json({ error: 'Due date is required' });
      }
      const borrowing = Borrowing.create({
        book_id: bId,
        member_id: mId,
        due_date: due_date.trim(),
      });
      res.status(201).json(borrowing);
    } catch (err) {
      if (err.code === 'SQLITE_CONSTRAINT_FOREIGNKEY') {
        return res.status(409).json({ error: 'Invalid book_id or member_id' });
      }
      if (err.statusCode) {
        return res.status(err.statusCode).json({ error: err.message });
      }
      res.status(500).json({ error: err.message });
    }
  },

  returnBook(req, res) {
    try {
      const id = Number(req.params.id);
      if (!Number.isInteger(id) || id < 1) {
        return res.status(400).json({ error: 'Invalid borrowing ID' });
      }
      const existing = Borrowing.getById(id);
      if (!existing) return res.status(404).json({ error: 'Borrowing not found' });
      const borrowing = Borrowing.returnBook(id);
      res.json(borrowing);
    } catch (err) {
      if (err.statusCode) {
        return res.status(err.statusCode).json({ error: err.message });
      }
      res.status(500).json({ error: err.message });
    }
  }
};

module.exports = borrowingController;
