const db = require('../config/db');

const Order = {
  getAll() {
    return db.prepare(`
      SELECT o.*, u.name AS customer_name, u.email AS customer_email
      FROM orders o
      JOIN users u ON o.user_id = u.id
      ORDER BY o.created_at DESC
    `).all();
  },

  getByUser(userId) {
    return db.prepare(
      'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC'
    ).all(userId);
  },

  getById(id) {
    return db.prepare(`
      SELECT o.*, u.name AS customer_name, u.email AS customer_email
      FROM orders o
      JOIN users u ON o.user_id = u.id
      WHERE o.id = ?
    `).get(id);
  },

  create(data) {
    const createTransaction = db.transaction(({ userId, total, shippingAddress, contactNumber, items }) => {
      const orderInfo = db.prepare(`
        INSERT INTO orders (user_id, total, shipping_address, contact_number)
        VALUES (?, ?, ?, ?)
      `).run(userId, total, shippingAddress, contactNumber);

      const orderId = orderInfo.lastInsertRowid;

      const insertItem = db.prepare(`
        INSERT INTO order_items (order_id, product_id, quantity, price)
        VALUES (?, ?, ?, ?)
      `);

      const reduceStock = db.prepare(`
        UPDATE products SET stock = stock - ? WHERE id = ? AND stock >= ?
      `);

      for (const item of items) {
        const product = db.prepare('SELECT id, name, price, stock FROM products WHERE id = ?').get(item.product_id);
        if (!product) {
          throw new Error(`Product "${item.product_name}" no longer exists`);
        }
        if (product.stock < item.quantity) {
          throw new Error(`"${product.name}" only has ${product.stock} left`);
        }

        insertItem.run(orderId, item.product_id, item.quantity, item.product_price);
        reduceStock.run(item.quantity, item.product_id, item.quantity);
      }

      db.prepare('DELETE FROM cart_items WHERE user_id = ?').run(userId);

      return orderId;
    });

    const orderId = createTransaction(data);

    return Order.getById(orderId);
  },

  updateStatus(id, status) {
    db.prepare(
      "UPDATE orders SET status = ?, updated_at = datetime('now') WHERE id = ?"
    ).run(status, id);
    return Order.getById(id);
  },
};

module.exports = Order;
