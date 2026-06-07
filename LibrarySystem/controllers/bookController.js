const Book = require('../models/Book');

const bookController = {
  getAll(req, res) {
    try {
      res.json(Book.getAll());
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  getById(req, res) {
    try {
      const id = Number(req.params.id);
      if (!Number.isInteger(id) || id < 1) {
        return res.status(400).json({ error: 'Invalid book ID' });
      }
      const book = Book.getById(id);
      if (!book) return res.status(404).json({ error: 'Book not found' });
      res.json(book);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  search(req, res) {
    try {
      const q = req.query.q;
      if (!q || !q.trim()) {
        return res.status(400).json({ error: 'Search query is required' });
      }
      res.json(Book.search(q.trim()));
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  create(req, res) {
    try {
      const { title, author, isbn, category_id } = req.body;
      if (!title || typeof title !== 'string' || !title.trim()) {
        return res.status(400).json({ error: 'Book title is required' });
      }
      if (!author || typeof author !== 'string' || !author.trim()) {
        return res.status(400).json({ error: 'Book author is required' });
      }
      if (!isbn || typeof isbn !== 'string' || !isbn.trim()) {
        return res.status(400).json({ error: 'Book ISBN is required' });
      }
      const catId = Number(category_id);
      if (isNaN(catId) || !Number.isInteger(catId) || catId < 1) {
        return res.status(400).json({ error: 'Valid category_id is required' });
      }
      const book = Book.create({
        title: title.trim(),
        author: author.trim(),
        isbn: isbn.trim(),
        publisher: req.body.publisher,
        publication_year: req.body.publication_year,
        category_id: catId,
        total_quantity: req.body.total_quantity,
        available_quantity: req.body.available_quantity,
      });
      res.status(201).json(book);
    } catch (err) {
      if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        return res.status(409).json({ error: 'A book with that ISBN already exists' });
      }
      if (err.code === 'SQLITE_CONSTRAINT_FOREIGNKEY') {
        return res.status(409).json({ error: 'Invalid category_id' });
      }
      res.status(500).json({ error: err.message });
    }
  },

  update(req, res) {
    try {
      const id = Number(req.params.id);
      if (!Number.isInteger(id) || id < 1) {
        return res.status(400).json({ error: 'Invalid book ID' });
      }
      const { title, author, isbn, category_id } = req.body;
      if (!title || typeof title !== 'string' || !title.trim()) {
        return res.status(400).json({ error: 'Book title is required' });
      }
      if (!author || typeof author !== 'string' || !author.trim()) {
        return res.status(400).json({ error: 'Book author is required' });
      }
      if (!isbn || typeof isbn !== 'string' || !isbn.trim()) {
        return res.status(400).json({ error: 'Book ISBN is required' });
      }
      const catId = Number(category_id);
      if (isNaN(catId) || !Number.isInteger(catId) || catId < 1) {
        return res.status(400).json({ error: 'Valid category_id is required' });
      }
      const book = Book.update(id, {
        title: title.trim(),
        author: author.trim(),
        isbn: isbn.trim(),
        publisher: req.body.publisher,
        publication_year: req.body.publication_year,
        category_id: catId,
        total_quantity: req.body.total_quantity,
        available_quantity: req.body.available_quantity,
      });
      if (!book) return res.status(404).json({ error: 'Book not found' });
      res.json(book);
    } catch (err) {
      if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        return res.status(409).json({ error: 'A book with that ISBN already exists' });
      }
      if (err.code === 'SQLITE_CONSTRAINT_FOREIGNKEY') {
        return res.status(409).json({ error: 'Invalid category_id' });
      }
      res.status(500).json({ error: err.message });
    }
  },

  delete(req, res) {
    try {
      const id = Number(req.params.id);
      if (!Number.isInteger(id) || id < 1) {
        return res.status(400).json({ error: 'Invalid book ID' });
      }
      const deleted = Book.delete(id);
      if (!deleted) return res.status(404).json({ error: 'Book not found' });
      res.json({ message: 'Book deleted' });
    } catch (err) {
      if (err.code === 'SQLITE_CONSTRAINT_FOREIGNKEY') {
        return res.status(409).json({ error: 'Cannot delete book with active borrowing records' });
      }
      res.status(500).json({ error: err.message });
    }
  }
};

module.exports = bookController;
