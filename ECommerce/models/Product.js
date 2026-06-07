const db = require('../config/db');
const fs = require('fs');
const path = require('path');

const Product = {
  getAll() {
    return db.prepare(`
      SELECT p.*, c.name AS category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      ORDER BY p.name
    `).all();
  },

  getById(id) {
    return db.prepare(`
      SELECT p.*, c.name AS category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.id = ?
    `).get(id);
  },

  getByCategory(categoryId) {
    return db.prepare(`
      SELECT p.*, c.name AS category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.category_id = ?
      ORDER BY p.name
    `).all(categoryId);
  },

  search(query) {
    const q = `%${query}%`;
    return db.prepare(`
      SELECT p.*, c.name AS category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.name LIKE ? OR p.description LIKE ?
      ORDER BY p.name
    `).all(q, q);
  },

  create(data) {
    const info = db.prepare(`
      INSERT INTO products (name, description, price, stock, image_url, category_id)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      data.name,
      data.description || null,
      data.price,
      data.stock || 0,
      data.image_url || null,
      data.category_id || null
    );
    return Product.getById(info.lastInsertRowid);
  },

  update(id, data) {
    db.prepare(`
      UPDATE products
      SET name = ?, description = ?, price = ?, stock = ?, image_url = ?, category_id = ?, updated_at = datetime('now')
      WHERE id = ?
    `).run(
      data.name,
      data.description || null,
      data.price,
      data.stock,
      data.image_url || null,
      data.category_id || null,
      id
    );
    return Product.getById(id);
  },

  delete(id) {
    Product.deleteImage(id);
    const info = db.prepare('DELETE FROM products WHERE id = ?').run(id);
    return info.changes > 0;
  },

  reduceStock(id, quantity) {
    const info = db.prepare(
      'UPDATE products SET stock = stock - ? WHERE id = ? AND stock >= ?'
    ).run(quantity, id, quantity);
    return info.changes > 0;
  },

  deleteImage(id) {
    const product = db.prepare('SELECT image_url FROM products WHERE id = ?').get(id);
    if (product && product.image_url) {
      const filePath = path.join(__dirname, '..', product.image_url);
      try { fs.unlinkSync(filePath); } catch { }
    }
  },
};

module.exports = Product;
