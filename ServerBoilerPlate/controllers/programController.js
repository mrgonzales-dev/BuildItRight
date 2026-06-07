/*
 * Grab your coffee. This is where programming comes alive on a server.
 *
 * Every endpoint in this file is a classic beginner programming
 * exercise -- the exact stuff you learn in week one of any coding
 * course. But here's the twist: instead of running in a terminal,
 * they're running on a web server and you call them through URLs.
 *
 * This is the bridge between "I can write a for loop" and
 * "I can build an API." Same logic. Different delivery.
 *
 * Every handler follows the same rhythm:
 *   1. Read the input from the URL (req.params)
 *   2. Convert strings to numbers (because URLs are always text)
 *   3. Validate (garbage in = friendly error out)
 *   4. Compute the result using basic programming: math, if/else,
 *      loops, string checks
 *   5. Send it back as JSON with a clear explanation
 *
 * By the time you've read through all five, you'll see the pattern.
 * Server programming is just regular programming with a different
 * front door. The logic inside is the same as always.
 */

const programController = {

  /*
   * GET /api/calc/:operation/:a/:b
   *
   * A calculator that lives at a URL.
   *
   * Operations: add, subtract, multiply, divide
   *
   * Examples:
   *   /api/calc/add/5/3        returns 8
   *   /api/calc/subtract/10/4  returns 6
   *   /api/calc/multiply/6/7   returns 42
   *   /api/calc/divide/20/5    returns 4
   *
   * What this teaches:
   *   - Reading multiple route parameters from a URL
   *   - Converting strings to numbers (req.params values are ALWAYS strings)
   *   - switch/case statements for branching logic
   *   - Handling edge cases (dividing by zero is a crime)
   *   - Returning computed data, not just stored data
   *
   * Notice how the operation is part of the URL itself. This is
   * called a "slug" pattern. The URL IS the user interface.
   * Clean, readable, bookmarkable.
   *
   * Try it:
   *   curl http://localhost:3000/api/calc/add/5/3
   *   curl http://localhost:3000/api/calc/multiply/7/8
   */
  calc(req, res) {
    const { operation, a, b } = req.params;

    // Convert. URLs are text. Numbers need to be numbers.
    const numA = Number(a);
    const numB = Number(b);

    // Be suspicious. Users will send "potato" and expect math.
    if (isNaN(numA) || isNaN(numB)) {
      return res.status(400).json({
        error: 'Both values must be valid numbers.',
        example: '/api/calc/add/5/3'
      });
    }

    let result;
    let symbol;

    switch (operation) {
      case 'add':
        result = numA + numB;
        symbol = '+';
        break;
      case 'subtract':
        result = numA - numB;
        symbol = '-';
        break;
      case 'multiply':
        result = numA * numB;
        symbol = 'x';
        break;
      case 'divide':
        if (numB === 0) {
          return res.status(400).json({
            error: 'Division by zero is undefined. Even on the internet.',
            tip: 'Try a different second number. Anything except zero.'
          });
        }
        result = numA / numB;
        symbol = '/';
        break;
      default:
        return res.status(400).json({
          error: `Unknown operation: "${operation}".`,
          supported: ['add', 'subtract', 'multiply', 'divide'],
          example: '/api/calc/add/5/3'
        });
    }

    res.json({
      expression: `${numA} ${symbol} ${numB} = ${result}`,
      operation,
      a: numA,
      b: numB,
      result
    });
  },

  /*
   * GET /api/check/even-odd/:num
   *
   * Is it even? Is it odd? The server decides.
   *
   * The modulo operator (%) gives you the remainder after division.
   *   - 7 % 2 = 1  (7 divided by 2 leaves remainder 1, so it's odd)
   *   - 8 % 2 = 0  (8 divided by 2 leaves remainder 0, so it's even)
   *
   * Modulo is one of the most useful operators in programming.
   * It tells you if something divides evenly, which unlocks:
   *   - alternating row colours in tables
   *   - checking if a year is a leap year
   *   - wrapping around to the start of a list
   *   - and a thousand other things you'll discover
   *
   * This endpoint wraps that tiny piece of math in a URL and
   * explains the result. It's the modulo operator, with a server.
   *
   * Try it:
   *   curl http://localhost:3000/api/check/even-odd/7
   *   curl http://localhost:3000/api/check/even-odd/42
   */
  evenOdd(req, res) {
    const num = Number(req.params.num);

    if (isNaN(num)) {
      return res.status(400).json({
        error: `"${req.params.num}" is not a valid number.`,
        example: '/api/check/even-odd/7'
      });
    }

    const remainder = num % 2;
    const result = remainder === 0 ? 'even' : 'odd';

    res.json({
      number: num,
      remainderWhenDividedBy2: remainder,
      result,
      explanation: `${num} % 2 = ${remainder}. Since the remainder is ${remainder === 0 ? '0' : 'not 0'}, the number is ${result}.`
    });
  },

  /*
   * GET /api/check/temperature/:celsius
   *
   * Give the server a temperature in Celsius and it'll tell you
   * what the weather feels like. Pure if/else logic.
   *
   * The temperature ranges:
   *   Below 0     -- freezing, wear a coat (a thick one)
   *   0 to 15     -- cold, bring a jacket
   *   16 to 25    -- warm, it's pleasant out
   *   26 to 35    -- hot, shorts weather
   *   Above 35    -- blazing, stay hydrated
   *
   * This is the classic "if / else if / else" pattern that every
   * programmer learns in their first week. Each condition checks
   * a range and the first one that matches wins. Order matters:
   * put the most specific or lowest threshold first.
   *
   * Try it:
   *   curl http://localhost:3000/api/check/temperature/25
   *   curl http://localhost:3000/api/check/temperature/-5
   *   curl http://localhost:3000/api/check/temperature/40
   */
  temperature(req, res) {
    const celsius = Number(req.params.celsius);

    if (isNaN(celsius)) {
      return res.status(400).json({
        error: `"${req.params.celsius}" is not a valid temperature.`,
        example: '/api/check/temperature/25'
      });
    }

    let category;
    let advice;

    if (celsius < 0) {
      category = 'freezing';
      advice = 'Below zero. Wear a heavy coat. Maybe two.';
    } else if (celsius <= 15) {
      category = 'cold';
      advice = 'Chilly. A jacket will do the trick.';
    } else if (celsius <= 25) {
      category = 'warm';
      advice = 'Perfect weather. Enjoy it while it lasts.';
    } else if (celsius <= 35) {
      category = 'hot';
      advice = 'Shorts and a cold drink kind of day.';
    } else {
      category = 'blazing';
      advice = 'Extreme heat. Stay inside with air conditioning. Seriously.';
    }

    res.json({
      celsius,
      category,
      advice
    });
  },

  /*
   * GET /api/fizzbuzz/:num
   *
   * The legendary FizzBuzz. If you've been around programming for
   * more than ten minutes, you've heard of this. It's the most
   * famous interview question in the world, and for good reason:
   * it tests if you understand modulo, conditionals, and ordering
   * in about five lines of code.
   *
   * The rules:
   *   - If the number is divisible by 3 AND 5 --> "FizzBuzz"
   *   - If the number is divisible by 3         --> "Fizz"
   *   - If the number is divisible by 5         --> "Buzz"
   *   - Otherwise                               --> the number itself
   *
   * Order is EVERYTHING. You must check for 3 AND 5 first. If you
   * check for 3 alone first, 15 would just say "Fizz" because it
   * matches the first condition and never reaches the combined check.
   * This trips up more people than you'd think. Now you know.
   *
   * Try it:
   *   curl http://localhost:3000/api/fizzbuzz/3
   *   curl http://localhost:3000/api/fizzbuzz/5
   *   curl http://localhost:3000/api/fizzbuzz/15
   *   curl http://localhost:3000/api/fizzbuzz/7
   */
  fizzbuzz(req, res) {
    const num = Number(req.params.num);

    if (isNaN(num)) {
      return res.status(400).json({
        error: `"${req.params.num}" is not a valid number.`,
        example: '/api/fizzbuzz/15'
      });
    }

    let result;
    let explanation;

    /*
     * Check the combined case FIRST. This is the trick.
     * If you check divisible-by-3 before divisible-by-3-and-5,
     * the number 15 would stop at "Fizz" and never reach "FizzBuzz".
     * Most specific condition goes first. Always.
     */
    if (num % 3 === 0 && num % 5 === 0) {
      result = 'FizzBuzz';
      explanation = `${num} is divisible by both 3 and 5. That's a FizzBuzz!`;
    } else if (num % 3 === 0) {
      result = 'Fizz';
      explanation = `${num} is divisible by 3. Fizz!`;
    } else if (num % 5 === 0) {
      result = 'Buzz';
      explanation = `${num} is divisible by 5. Buzz!`;
    } else {
      result = num;
      explanation = `${num} is not divisible by 3 or 5. Just the number itself.`;
    }

    res.json({
      number: num,
      result,
      explanation
    });
  },

  /*
   * GET /api/check/palindrome/:word
   *
   * A palindrome is a word that reads the same forwards and
   * backwards. "racecar" spelled backwards is still "racecar".
   * "madam" too. "hello" ... not so much.
   *
   * The algorithm: reverse the string and compare.
   *
   * How to reverse a string in JavaScript:
   *   1. split('')  -- break into an array of characters  ['h','e','l','l','o']
   *   2. reverse()  -- flip the array                     ['o','l','l','e','h']
   *   3. join('')   -- glue back into a string            "olleh"
   *
   * If the original equals the reversed, it's a palindrome.
   *
   * This teaches string manipulation, method chaining, and the
   * surprisingly useful skill of reversing things. You'll use
   * this pattern in real projects more than you'd expect.
   *
   * Try it:
   *   curl http://localhost:3000/api/check/palindrome/racecar
   *   curl http://localhost:3000/api/check/palindrome/madam
   *   curl http://localhost:3000/api/check/palindrome/hello
   *   curl http://localhost:3000/api/check/palindrome/12321
   */
  palindrome(req, res) {
    const word = req.params.word;

    // Reverse the string: split into characters, flip the array, join back.
    const reversed = word.split('').reverse().join('');
    const isPalindrome = word.toLowerCase() === reversed.toLowerCase();

    res.json({
      original: word,
      reversed,
      isPalindrome,
      explanation: isPalindrome
        ? `"${word}" reversed is "${reversed}". They match! It's a palindrome.`
        : `"${word}" reversed is "${reversed}". They don't match. Not a palindrome.`
    });
  }
};

module.exports = programController;
