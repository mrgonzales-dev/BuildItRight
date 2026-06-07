/*
 * Five routes. Five fundamental programming concepts. One server.
 *
 * This file is a router. Its entire job: decide which function
 * to run when someone visits a specific URL. That's it.
 *
 * Every line follows the exact same recipe:
 *
 *   router.get('/url-path/:param', controller.handlerFunction);
 *
 * The colon (:) means "this part of the URL is a variable."
 * Express captures it and hands it to you as req.params.param.
 *
 * When Express gets a request, it scans from top to bottom and
 * uses the FIRST matching route. This matters if two routes
 * could match the same URL. Our routes are unambiguous, so
 * ordering is relaxed here -- but keep the rule in your head
 * for when you add your own.
 */

const express = require('express');
const router = express.Router();

const programController = require('../controllers/programController');

/*
 * Arithmetic: add, subtract, multiply, divide -- in a URL.
 * /api/calc/add/5/3      /api/calc/multiply/7/8
 * /api/calc/subtract/10/4  /api/calc/divide/20/5
 */
router.get('/calc/:operation/:a/:b', programController.calc);

/*
 * Odd or even? The modulo operator, delivered over HTTP.
 * /api/check/even-odd/7    /api/check/even-odd/42
 */
router.get('/check/even-odd/:num', programController.evenOdd);

/*
 * Temperature classifier: a classic if/else chain.
 * /api/check/temperature/25   /api/check/temperature/-5
 */
router.get('/check/temperature/:celsius', programController.temperature);

/*
 * FizzBuzz: the most famous programming interview question.
 * /api/fizzbuzz/3    /api/fizzbuzz/15    /api/fizzbuzz/7
 */
router.get('/fizzbuzz/:num', programController.fizzbuzz);

/*
 * Palindrome check: does your word read the same backwards?
 * /api/check/palindrome/racecar   /api/check/palindrome/hello
 */
router.get('/check/palindrome/:word', programController.palindrome);

module.exports = router;
