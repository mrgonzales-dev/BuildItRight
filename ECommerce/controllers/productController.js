const Product = require('../models/Product');
const fs = require('fs');
const path = require('path');

const productController = {
  getAll(req, res) {
    try {
      res.json(Product.getAll());
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  getById(req, res) {
    try {
      const id = Number(req.params.id);
      if (!Number.isInteger(id) || id < 1) {
        return res.status(400).json({ error: 'Invalid product ID' });
      }
      const product = Product.getById(id);
      if (!product) return res.status(404).json({ error: 'Product not found' });
      res.json(product);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  getByCategory(req, res) {
    try {
      const catId = Number(req.params.catId);
      if (!Number.isInteger(catId) || catId < 1) {
        return res.status(400).json({ error: 'Invalid category ID' });
      }
      res.json(Product.getByCategory(catId));
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  search(req, res) {
    try {
      const q = req.query.q;
      if (!q || !q.trim()) {
        return res.json(Product.getAll());
      }
      res.json(Product.search(q.trim()));
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  create(req, res) {
    try {
      const { name, price } = req.body;
      if (!name || typeof name !== 'string' || !name.trim()) {
        return res.status(400).json({ error: 'Product name is required' });
      }
      const parsedPrice = Number(price);
      if (isNaN(parsedPrice) || parsedPrice < 0) {
        return res.status(400).json({ error: 'Price must be a positive number' });
      }

      const product = Product.create({
        name: name.trim(),
        description: req.body.description || null,
        price: parsedPrice,
        stock: Number.isFinite(Number(req.body.stock)) ? Number(req.body.stock) : 0,
        image_url: req.file ? `uploads/${req.file.filename}` : null,
        category_id: req.body.category_id !== '' && req.body.category_id != null ? Number(req.body.category_id) : null,
      });

      res.status(201).json(product);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  update(req, res) {
    try {
      const id = Number(req.params.id);
      if (!Number.isInteger(id) || id < 1) {
        return res.status(400).json({ error: 'Invalid product ID' });
      }

      const existing = Product.getById(id);
      if (!existing) return res.status(404).json({ error: 'Product not found' });

      const { name, price } = req.body;
      if (!name || typeof name !== 'string' || !name.trim()) {
        return res.status(400).json({ error: 'Product name is required' });
      }
      const parsedPrice = Number(price);
      if (isNaN(parsedPrice) || parsedPrice < 0) {
        return res.status(400).json({ error: 'Price must be a positive number' });
      }

      let imageUrl = existing.image_url;
      let oldImageToDelete = null;
      if (req.file) {
        if (existing.image_url) {
          oldImageToDelete = path.join(__dirname, '..', existing.image_url);
        }
        imageUrl = `uploads/${req.file.filename}`;
      }

      const product = Product.update(id, {
        name: name.trim(),
        description: req.body.description || null,
        price: parsedPrice,
        stock: Number.isFinite(Number(req.body.stock)) ? Number(req.body.stock) : 0,
        image_url: imageUrl,
        category_id: req.body.category_id !== '' && req.body.category_id != null ? Number(req.body.category_id) : null,
      });

      if (oldImageToDelete) {
        try { fs.unlinkSync(oldImageToDelete); } catch { }
      }

      res.json(product);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  delete(req, res) {
    try {
      const id = Number(req.params.id);
      if (!Number.isInteger(id) || id < 1) {
        return res.status(400).json({ error: 'Invalid product ID' });
      }

      const existing = Product.getById(id);
      if (!existing) return res.status(404).json({ error: 'Product not found' });

      const deleted = Product.delete(id);
      if (!deleted) return res.status(404).json({ error: 'Product not found' });
      res.status(204).send();
    } catch (err) {
      if (err.code === 'SQLITE_CONSTRAINT_FOREIGNKEY') {
        return res.status(409).json({ error: 'Cannot delete: product is in existing orders' });
      }
      res.status(500).json({ error: err.message });
    }
  },
};

module.exports = productController;
