const express = require('express');
const router = express.Router();

const upload = require('../config/upload');
const { requireOwner, getUser } = require('../middleware/auth');
const databaseController = require('../controllers/databaseController');
const userController = require('../controllers/userController');
const categoryController = require('../controllers/categoryController');
const productController = require('../controllers/productController');
const cartController = require('../controllers/cartController');
const orderController = require('../controllers/orderController');

router.get('/database', requireOwner, databaseController.getAll);

router.post('/users/register', userController.register);
router.post('/users/login', userController.login);
router.get('/users/me', userController.getMe);
router.put('/users/profile', getUser, userController.updateProfile);

router.get('/categories', categoryController.getAll);
router.post('/categories', requireOwner, categoryController.create);
router.put('/categories/:id', requireOwner, categoryController.update);
router.delete('/categories/:id', requireOwner, categoryController.delete);
router.get('/categories/:id', categoryController.getById);

router.get('/products/search', productController.search);
router.get('/products/category/:catId', productController.getByCategory);
router.post('/products', requireOwner, upload.single('image'), productController.create);
router.put('/products/:id', requireOwner, upload.single('image'), productController.update);
router.delete('/products/:id', requireOwner, productController.delete);
router.get('/products/:id', productController.getById);
router.get('/products', productController.getAll);

router.post('/cart/checkout', getUser, cartController.checkout);
router.get('/cart', getUser, cartController.get);
router.post('/cart', getUser, cartController.add);
router.put('/cart/:id', getUser, cartController.update);
router.delete('/cart/:id', getUser, cartController.remove);

router.get('/orders/my', getUser, orderController.getMyOrders);
router.get('/orders/:id', getUser, orderController.getById);
router.put('/orders/:id/status', requireOwner, orderController.updateStatus);
router.get('/orders', requireOwner, orderController.getAll);

module.exports = router;
