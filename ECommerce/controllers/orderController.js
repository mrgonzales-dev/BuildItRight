const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');

const orderController = {
  getAll(req, res) {
    try {
      res.json(Order.getAll());
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  getMyOrders(req, res) {
    try {
      let orders;
      if (req.user.role === 'owner') {
        orders = Order.getAll();
      } else {
        orders = Order.getByUser(req.user.id);
      }

      res.json(orders);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  getById(req, res) {
    try {
      const id = Number(req.params.id);
      if (!Number.isInteger(id) || id < 1) {
        return res.status(400).json({ error: 'Invalid order ID' });
      }

      const order = Order.getById(id);
      if (!order) return res.status(404).json({ error: 'Order not found' });

      if (req.user.role !== 'owner' && order.user_id !== req.user.id) {
        return res.status(403).json({ error: 'Access denied' });
      }

      const items = OrderItem.getByOrder(id);
      res.json({ ...order, items });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  updateStatus(req, res) {
    try {
      const id = Number(req.params.id);
      if (!Number.isInteger(id) || id < 1) {
        return res.status(400).json({ error: 'Invalid order ID' });
      }

      const { status } = req.body;
      const allowed = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
      if (!status || !allowed.includes(status)) {
        return res.status(400).json({ error: `Status must be one of: ${allowed.join(', ')}` });
      }

      const existing = Order.getById(id);
      if (!existing) return res.status(404).json({ error: 'Order not found' });

      const order = Order.updateStatus(id, status);
      res.json(order);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
};

module.exports = orderController;
