const db = require('../config/db');

const CartItem = {
  getByUser(userId) {
    return db.prepare(`
      SELECT ci.*, p.name AS product_name, p.price AS product_price, p.image_url AS product_image
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      WHERE ci.user_id = ?
      ORDER BY ci.created_at
    `).all(userId);
  },

  addOrUpdate(userId, productId, quantity) {
    const existing = db.prepare(
      'SELECT id, quantity FROM cart_items WHERE user_id = ? AND product_id = ?'
    ).get(userId, productId);

    if (existing) {
      db.prepare(
        'UPDATE cart_items SET quantity = quantity + ? WHERE id = ?'
      ).run(quantity, existing.id);
    } else {
      db.prepare(
        'INSERT INTO cart_items (user_id, product_id, quantity) VALUES (?, ?, ?)'
      ).run(userId, productId, quantity);
    }

    const item = db.prepare(
      'SELECT ci.*, p.name AS product_name, p.price AS product_price, p.image_url AS product_image FROM cart_items ci JOIN products p ON ci.product_id = p.id WHERE ci.user_id = ? AND ci.product_id = ?'
    ).get(userId, productId);
    return item;
  },

  updateQuantity(id, quantity) {
    if (quantity <= 0) {
      const info = db.prepare('DELETE FROM cart_items WHERE id = ?').run(id);
      return { removed: true, changes: info.changes };
    }
    db.prepare('UPDATE cart_items SET quantity = ? WHERE id = ?').run(quantity, id);
    return { removed: false };
  },

  remove(id) {
    const info = db.prepare('DELETE FROM cart_items WHERE id = ?').run(id);
    return info.changes > 0;
  },

  clearByUser(userId) {
    db.prepare('DELETE FROM cart_items WHERE user_id = ?').run(userId);
  },

  getCount(userId) {
    const row = db.prepare(
      'SELECT COALESCE(SUM(quantity), 0) AS count FROM cart_items WHERE user_id = ?'
    ).get(userId);
    return row.count;
  },

  getTotal(userId) {
    const row = db.prepare(`
      SELECT COALESCE(SUM(ci.quantity * p.price), 0) AS total
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      WHERE ci.user_id = ?
    `).get(userId);
    return row.total;
  },
};

module.exports = CartItem;
