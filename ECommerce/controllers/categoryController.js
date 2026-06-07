const Category = require('../models/Category');

const categoryController = {
  getAll(req, res) {
    try {
      res.json(Category.getAll());
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  getById(req, res) {
    try {
      const id = Number(req.params.id);
      if (!Number.isInteger(id) || id < 1) {
        return res.status(400).json({ error: 'Invalid category ID' });
      }
      const category = Category.getById(id);
      if (!category) return res.status(404).json({ error: 'Category not found' });
      res.json(category);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  create(req, res) {
    try {
      const { name } = req.body;
      if (!name || typeof name !== 'string' || !name.trim()) {
        return res.status(400).json({ error: 'Category name is required' });
      }

      const category = Category.create({ name: name.trim(), description: req.body.description });
      res.status(201).json(category);
    } catch (err) {
      if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        return res.status(409).json({ error: 'A category with that name already exists' });
      }
      res.status(500).json({ error: err.message });
    }
  },

  update(req, res) {
    try {
      const id = Number(req.params.id);
      if (!Number.isInteger(id) || id < 1) {
        return res.status(400).json({ error: 'Invalid category ID' });
      }

      const existing = Category.getById(id);
      if (!existing) return res.status(404).json({ error: 'Category not found' });

      const { name } = req.body;
      if (!name || typeof name !== 'string' || !name.trim()) {
        return res.status(400).json({ error: 'Category name is required' });
      }

      const category = Category.update(id, { name: name.trim(), description: req.body.description });
      res.json(category);
    } catch (err) {
      if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        return res.status(409).json({ error: 'A category with that name already exists' });
      }
      res.status(500).json({ error: err.message });
    }
  },

  delete(req, res) {
    try {
      const id = Number(req.params.id);
      if (!Number.isInteger(id) || id < 1) {
        return res.status(400).json({ error: 'Invalid category ID' });
      }

      const existing = Category.getById(id);
      if (!existing) return res.status(404).json({ error: 'Category not found' });

      const deleted = Category.delete(id);
      if (!deleted) return res.status(404).json({ error: 'Category not found' });
      res.status(204).send();
    } catch (err) {
      if (err.code === 'SQLITE_CONSTRAINT_FOREIGNKEY') {
        return res.status(409).json({ error: 'Cannot delete: products are assigned to this category' });
      }
      res.status(500).json({ error: err.message });
    }
  },
};

module.exports = categoryController;
