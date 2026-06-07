const db = require('../config/db');

const OrderItem = {
  getByOrder(orderId) {
    return db.prepare(`
      SELECT oi.*, p.name AS product_name, p.image_url AS product_image
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = ?
      ORDER BY oi.id
    `).all(orderId);
  },
};

module.exports = OrderItem;
