/*
 * Hey! You found the front door. Welcome.
 *
 * This is server.js -- the file that starts everything. If this
 * project were a restaurant, this file would be the person who
 * unlocks the door, turns on the lights, and shouts "we're open!"
 *
 * Its whole job: wake up, plug everything together, and listen
 * for people knocking (browsers, curl, anything making an HTTP request).
 *
 * When someone visits http://localhost:3000 in a browser, THIS
 * file is what answers. Every single request comes through here
 * first, then gets handed off to the right place.
 *
 * Take your time reading this. It's short. Every line matters.
 * And by the end, you'll understand how every Express server
 * on the planet starts -- because they all start like this.
 */

/*
 * STEP 1: Grab the tools we'll need.
 *
 * require() is how Node.js says "go get that thing for me."
 * It can be an npm package (like express) or another file
 * we wrote (like ./routes/routes).
 *
 * No magic here. Just borrowing code that someone else already
 * wrote so we don't have to write it ourselves. You'll use
 * require() in almost every Node.js file you ever touch.
 */
const express = require('express');   // The framework that makes HTTP servers easy
const cors = require('cors');         // Lets browsers from other ports talk to us

require('./config/db');               // Initialize the database (create tables, set pragmas)

const routes = require('./routes/routes');   // All our URL-to-function mappings

/*
 * STEP 2: Create the app.
 *
 * express() gives us a fresh new server object. It's like
 * getting an empty apartment before you move your furniture in.
 * Right now it's blank. We're about to furnish it with
 * middleware, routes, and a welcome message.
 */
const app = express();

/*
 * STEP 3: Pick a door number.
 *
 * A port is just a numbered door on your computer. It's how
 * the operating system knows which program should handle an
 * incoming network connection.
 *
 * We read PORT from the .env file if it exists. If not, we
 * fall back to 3000. Three thousand. Classic port. Good vibes.
 *
 * If port 3000 is already busy, just change this number.
 * Anything between 1024 and 65535 works. 3001, 4321, 8080 --
 * pick whatever feels right.
 */
const PORT = process.env.PORT || 3000;

/*
 * STEP 4: Middleware -- the welcome committee.
 *
 * Middleware runs on EVERY request, before your routes get to
 * see it. They "sit in the middle" between "request arrived"
 * and "response sent." That's the whole name.
 *
 * Every app.use() line adds one piece of middleware. They
 * run in order, top to bottom, for every single request.
 */
app.use(cors());              // "Yes, browsers, you're allowed to talk to this server."
app.use(express.json());      // "If someone sent JSON, turn it from text into a real object."

/*
 * STEP 5: Mount the routes.
 *
 * app.use('/api', routes) says: "If the URL starts with /api,
 * pass it over to our routes file and let it figure out what to do."
 *
 * This is a beautiful pattern. server.js stays clean and short.
 * All the messy "what URL does what" stuff lives in routes/routes.js
 * where it belongs.
 */
app.use('/api', routes);

/*
 * STEP 6: The welcome mat.
 *
 * Plain old http://localhost:3000/ with no /api prefix.
 * Just a friendly handshake so you know the server is alive.
 * If this returns JSON, everything is wired up correctly.
 *
 * Try it in your browser right now. Go on. I'll wait.
 */
app.get('/', (req, res) => {
  res.json({ message: 'ServerBoilerPlate API is running' });
});

/*
 * STEP 7: Open the door.
 *
 * app.listen() is the moment the server actually starts
 * accepting connections. Before this line, it's just a
 * definition sitting in memory. After this line, it's alive.
 *
 * Once you see that "Server running" message in the terminal,
 * you've done it. You're running a real web server, on your
 * own machine, that you wrote yourself. That's not a small
 * thing. That's the real deal.
 */
app.listen(PORT, () => {
  console.log('============================================');
  console.log(`  Server running on http://localhost:${PORT}`);
  console.log('  Press Ctrl+C to stop');
  console.log('============================================');
});
