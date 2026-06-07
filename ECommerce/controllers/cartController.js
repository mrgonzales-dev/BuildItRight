const CartItem = require('../models/CartItem');
const Order = require('../models/Order');
const Product = require('../models/Product');

const cartController = {
  get(req, res) {
    try {
      const items = CartItem.getByUser(req.user.id);
      const total = CartItem.getTotal(req.user.id);
      const count = CartItem.getCount(req.user.id);
      res.json({ items, total, count });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  add(req, res) {
    try {
      const productId = Number(req.body.product_id);
      if (!Number.isInteger(productId) || productId < 1) {
        return res.status(400).json({ error: 'Valid product_id is required' });
      }

      const quantity = Number(req.body.quantity) || 1;
      if (!Number.isInteger(quantity) || quantity < 1) {
        return res.status(400).json({ error: 'Quantity must be at least 1' });
      }

      const product = Product.getById(productId);
      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }

      if (product.stock < quantity) {
        return res.status(400).json({ error: `Only ${product.stock} available` });
      }

      const item = CartItem.addOrUpdate(req.user.id, productId, quantity);

      const total = CartItem.getTotal(req.user.id);
      const count = CartItem.getCount(req.user.id);
      res.status(201).json({ item, total, count });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  update(req, res) {
    try {
      const id = Number(req.params.id);
      if (!Number.isInteger(id) || id < 1) {
        return res.status(400).json({ error: 'Invalid cart item ID' });
      }

      const quantity = Number(req.body.quantity);
      if (!Number.isInteger(quantity)) {
        return res.status(400).json({ error: 'Quantity must be a number' });
      }

      const result = CartItem.updateQuantity(id, quantity);
      const items = CartItem.getByUser(req.user.id);
      const total = CartItem.getTotal(req.user.id);
      const count = CartItem.getCount(req.user.id);
      res.json({ items, total, count, removed: result.removed });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  remove(req, res) {
    try {
      const id = Number(req.params.id);
      if (!Number.isInteger(id) || id < 1) {
        return res.status(400).json({ error: 'Invalid cart item ID' });
      }

      CartItem.remove(id);
      const items = CartItem.getByUser(req.user.id);
      const total = CartItem.getTotal(req.user.id);
      const count = CartItem.getCount(req.user.id);
      res.json({ items, total, count });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  checkout(req, res) {
    try {
      const { shipping_address, contact_number } = req.body;
      if (!shipping_address || typeof shipping_address !== 'string' || !shipping_address.trim()) {
        return res.status(400).json({ error: 'Shipping address is required' });
      }
      if (!contact_number || typeof contact_number !== 'string' || !contact_number.trim()) {
        return res.status(400).json({ error: 'Contact number is required' });
      }

      const cartItems = CartItem.getByUser(req.user.id);
      if (cartItems.length === 0) {
        return res.status(400).json({ error: 'Cart is empty' });
      }

      const total = CartItem.getTotal(req.user.id);
      const items = cartItems.map((item) => ({
        product_id: item.product_id,
        quantity: item.quantity,
        product_name: item.product_name,
        product_price: item.product_price,
      }));

      const order = Order.create({
        userId: req.user.id,
        total,
        shippingAddress: shipping_address.trim(),
        contactNumber: contact_number.trim(),
        items,
      });

      res.status(201).json(order);
    } catch (err) {
      if (err.message && (err.message.includes('only has') || err.message.includes('no longer exists'))) {
        return res.status(400).json({ error: err.message });
      }
      res.status(500).json({ error: err.message });
    }
  },
};

module.exports = cartController;
