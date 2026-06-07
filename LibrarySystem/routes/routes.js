const express = require('express');
const router = express.Router();

const categoryController = require('../controllers/categoryController');
const bookController = require('../controllers/bookController');
const memberController = require('../controllers/memberController');
const borrowingController = require('../controllers/borrowingController');
const databaseController = require('../controllers/databaseController');

router.get('/categories', categoryController.getAll);
router.get('/categories/:id', categoryController.getById);
router.post('/categories', categoryController.create);
router.put('/categories/:id', categoryController.update);
router.delete('/categories/:id', categoryController.delete);

router.get('/books/search', bookController.search);
router.get('/books', bookController.getAll);
router.get('/books/:id', bookController.getById);
router.post('/books', bookController.create);
router.put('/books/:id', bookController.update);
router.delete('/books/:id', bookController.delete);

router.get('/members/search', memberController.search);
router.get('/members', memberController.getAll);
router.get('/members/:id', memberController.getById);
router.post('/members', memberController.create);
router.put('/members/:id', memberController.update);
router.delete('/members/:id', memberController.delete);

router.get('/borrowings/overdue', borrowingController.getOverdue);
router.get('/borrowings/by-member/:memberId', borrowingController.getByMember);
router.get('/borrowings/by-book/:bookId', borrowingController.getByBook);
router.get('/borrowings', borrowingController.getAll);
router.get('/borrowings/:id', borrowingController.getById);
router.post('/borrowings', borrowingController.create);
router.put('/borrowings/:id/return', borrowingController.returnBook);

router.get('/database', databaseController.getAll);

module.exports = router;
