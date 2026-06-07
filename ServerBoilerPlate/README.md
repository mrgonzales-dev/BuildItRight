# ServerBoilerPlate

> A friendly server built for learning — every line explained, zero magic, and programming exercises turned into live API endpoints.

You just opened a project that exists for ONE reason: to help you understand how servers work. No hidden config. Just a few files, a handful of routes, and comments written like a human is talking to you. If you've never built a server before, this is your starting line.

---

## What You'll Learn

- How an **Express server** starts, listens for requests, and sends responses
- What **routes** are — how URLs map to code that runs
- How to use **route parameters** (`:id`, `:op`, `:a`, `:b`) to pass data through a URL
- Basic **error handling** — what happens when someone sends a word where a number should go
- How to test an API with **curl** (the terminal command — not a library, just a tool)

---

## Before You Start

- [ ] Node.js v20 or newer? Run `node --version`
- [ ] Have a terminal and a browser?
- [ ] 5 minutes of patience? First install takes a minute.

---

## How Do I Run It?

Open a terminal in this folder and run:

```bash
# 1. Install the dependencies (only once, or when package.json changes)
npm install

# 2. Start the server with auto-reload on every file save
npm run dev
```

You'll see:

```
============================================
  Server running on http://localhost:3000
  Press Ctrl+C to stop
============================================
```

Now open **http://localhost:3000** in your browser. You should see a welcome message.

> **Heads up:** The `.env` file says `PORT=3000`. In development, we use `nodemon` to restart the server on every save. Nodemon reads `.env` automatically — but only when you use `npm run dev`. If you use `npm start` instead, the `.env` file is NOT loaded. We'll talk about this more in the troubleshooting section.

---

## What's in Here?

```
ServerBoilerPlate/
├── .env                       # PORT=3000 (which port the server listens on)
├── .gitignore                 # Files that should NOT be committed to git
├── package.json               # Dependencies, scripts, project info
├── server.js                  # START HERE — the entry point. Read the comments!
│
├── config/
│   └── db.js                  # SQLite database setup (ready for when you add data)
│
├── controllers/
│   └── programController.js   # Five programming exercises, hosted as API endpoints
│
├── routes/
│   └── routes.js              # The URL map — connects URLs to controller functions
│
└── README.md                  # You are here
```

### Folder explainer (no jargon, promise)

| Folder | What it does | Real-world analogy |
|--------|-------------|-------------------|
| `config/` | Setup that runs once when the server starts | Plugging in the power cord |
| `controllers/` | Code that handles web requests and runs the logic | The front desk of a hotel |
| `routes/` | The map of which URL goes where | Street signs pointing you to the right building |

---

## How Does It Work?

Every API request follows the same path:

```
Browser/curl          server.js          routes.js        programController.js
     │                    │                   │                     │
     │  GET /api/calc/    │                   │                     │
     │    add/5/3         │                   │                     │
     │ ──────────────────>│                   │                     │
     │                    │ "I got a request" │                     │
     │                    │ ─────────────────>│                     │
     │                    │                   │ "URL matches         │
     │                    │                   │  /api/calc/:op/:a/:b │
     │                    │                   │  → programController │
     │                    │                   │  .calc()"            │
     │                    │                   │ ──────────────────> │
     │                    │                   │                     │ op="add", a="5", b="3"
     │                    │                   │                     │ result = 8
     │                    │                   │ <────────────────── │
     │                    │ <──────────────── │  { result: 8 }      │
     │ <──────────────────│  { result: 8 }   │                     │
     │  {"result":8}      │                   │                     │
```

1. **Browser or curl** makes a request to a URL like `/api/calc/add/5/3`.
2. **server.js** catches it at the front door. Middleware runs here (cors, json parsing).
3. **routes/routes.js** recognises the URL pattern and hands it to the right controller function.
4. **controllers/programController.js** takes over. It reads the parameters from the URL, validates them, runs the programming logic, and sends back the answer as JSON.

That's the whole pipeline. Four hops. Every server you'll ever build follows this same flow.

---

## The Database

Even this simple server has a database ready for you. It's a `messages` table — think of it as a guestbook people can sign.

Table: `messages`

| Column | Type | Notes |
|--------|------|-------|
| id | INTEGER | Auto-increment — you never set this |
| author | TEXT | Who wrote the message |
| body | TEXT | The message content |
| created_at | TEXT | Auto-filled with current time when row is created |

> **Note:** This table isn't used by any endpoint yet. That's on purpose — it's here for when you're ready to add your first data-backed route. The `config/db.js` file has detailed comments explaining every line of the database setup.

---

## API Endpoints

| Method | URL | What it does | Teaches |
|--------|-----|-------------|---------|
| `GET` | `/api/calc/:op/:a/:b` | Arithmetic (add, subtract, multiply, divide) | Route params, number conversion, switch/case, edge cases |
| `GET` | `/api/check/even-odd/:num` | Is a number even or odd? | Modulo operator (%), if/else branching |
| `GET` | `/api/check/temperature/:celsius` | Classify a temperature | if / else if / else chains, comparison operators |
| `GET` | `/api/fizzbuzz/:num` | The classic FizzBuzz test | Modulo, combined conditions, ordering of checks |
| `GET` | `/api/check/palindrome/:word` | Does it read the same backwards? | String reversal, method chaining, equality checks |

---

## Try It With curl

Copy and paste these into your terminal. They all work as soon as the server is running.

### Arithmetic

```bash
curl http://localhost:3000/api/calc/add/5/3
curl http://localhost:3000/api/calc/multiply/7/8
curl http://localhost:3000/api/calc/divide/20/5
```

### Odd or even

```bash
curl http://localhost:3000/api/check/even-odd/7
curl http://localhost:3000/api/check/even-odd/42
```

### Temperature classifier

```bash
curl http://localhost:3000/api/check/temperature/0
curl http://localhost:3000/api/check/temperature/22
curl http://localhost:3000/api/check/temperature/38
```

### FizzBuzz

```bash
curl http://localhost:3000/api/fizzbuzz/3
curl http://localhost:3000/api/fizzbuzz/5
curl http://localhost:3000/api/fizzbuzz/15
curl http://localhost:3000/api/fizzbuzz/7
```

### Palindrome check

```bash
curl http://localhost:3000/api/check/palindrome/racecar
curl http://localhost:3000/api/check/palindrome/madam
curl http://localhost:3000/api/check/palindrome/hello
```

### Error cases (these are feature, not bugs)

```bash
# Sending a word instead of a number
curl http://localhost:3000/api/calc/add/cat/3
# Dividing by zero
curl http://localhost:3000/api/calc/divide/10/0
```

---

## Tech Stack

| Package | What It Does | Why We Use It |
|---------|-------------|---------------|
| express | HTTP server | Simple, widely used, great for learning |
| better-sqlite3 | Talks to SQLite | Synchronous — no async/await needed for beginners |
| cors | Allows cross-origin requests | So your browser frontend can talk to the API |
| nodemon | Auto-restarts server on save | No more Ctrl+C, npm start, repeat |
| jest | Testing framework | Write tests to make sure your code works (opt-in) |

---

## Customization Guide

### How to add a new calculator operation (like "power" or "modulo")

1. **Open `controllers/programController.js`** and find the `calc` function
2. Inside the `switch (op)` block, add a new `case`:
   ```js
   case 'power':
     result = Math.pow(a, b);
     break;
   ```
3. **Save the file.** Nodemon restarts the server automatically.
4. **Test it:**
   ```bash
   curl http://localhost:3000/api/calc/power/2/8
   ```
5. That's it! You didn't need to touch `routes.js` because the URL pattern `:op/:a/:b` already accepts any operation name.

### How to add a brand-new endpoint (like "BMI calculator")

1. **Open `controllers/programController.js`** and add a new function:
   ```js
   bmi: (req, res) => {
     try {
       const weight = Number(req.params.weight);
       const height = Number(req.params.height);
       const bmi = weight / (height * height);
       res.json({ bmi: Math.round(bmi * 100) / 100 });
     } catch (err) {
       res.status(400).json({ error: err.message });
     }
   },
   ```
2. **Open `routes/routes.js`** and add a new route:
   ```js
   router.get('/check/bmi/:weight/:height', programController.bmi);
   ```
   Put it BEFORE any catch-all routes.
3. **Save both files. Test with curl:**
   ```bash
   curl http://localhost:3000/api/check/bmi/70/1.75
   ```

---

## Challenge Yourself

- 🟢 **Easy:** Change the temperature thresholds in the `checkTemperature` function. Make "warm" start at 20°C instead of 25°C.
- 🟢 **Easy:** Add a "modulo" or "power" operation to the calculator (see customization guide above).
- 🟡 **Medium:** Add a "grade classifier" endpoint — send a number, get back "A", "B", "C", "D", or "F".
- 🟡 **Medium:** Create a new endpoint that uses the messages table in the database — `POST /api/messages` to save a message, `GET /api/messages` to list them.
- 🔴 **Hard:** Add proper error messages for edge cases. What if someone sends a negative number for BMI? What if the name is too long? Validate everything and return helpful 400 errors.

---

## Troubleshooting

| Error | What It Means | What To Try |
|-------|--------------|-------------|
| `EADDRINUSE: address already in use :::3000` | Another app is using port 3000 | Close the other process, or change `PORT` in `.env` to `3001` |
| `Cannot find module 'express'` | You forgot to run `npm install` | Run `npm install` in the project root |
| `Connection refused` in curl | The server isn't running | Run `npm run dev` in another terminal first. We've all done this. |
| `.env` changes not taking effect | You're using `npm start` instead of `npm run dev` | `npm run dev` uses nodemon, which reads `.env`. `npm start` uses Node directly and needs `--env-file=.env` (Node v20+). For simplicity, always use `npm run dev`. |
| `curl` hangs with no response | Server is down or blocked | Check the terminal where the server runs. Did it crash? Read the error message. |
| `400` or `500` JSON error response | Invalid input or server crash | Read the error message in the JSON response — it tells you exactly what went wrong |

---

## What Should I Do Next?

1. **Read `server.js` from top to bottom.** Every line has a comment. Don't skip them.
2. **Follow one request all the way through.** Pick `/api/calc/add/5/3` and trace it: `server.js` → `routes.js` → `programController.js`. See how the pieces connect.
3. **Break things on purpose.** Send a word instead of a number to the calc endpoint. See what error you get. Fix it. That's how the learning sticks.
4. **Read `config/db.js`.** It explains databases like a patient teacher. When you're ready to add data storage, you'll know exactly how.
5. **Ready for more?** Move on to **BasicCrudTODOApp** — it adds a React frontend and a real CRUD database to this exact same server pattern.

---

## Production-ish Notes (optional)

- For deployment, run `node --env-file=.env server.js` (Node.js v20+) to load `.env` without nodemon.
- The `messages` table and `config/db.js` are ready for you to build on — just add a controller and a route.
- No build step for the API — it's plain JavaScript. Deploy anywhere that runs Node.js.

---

*"Every programmer you look up to started exactly where you are now — staring at a terminal, confused, one Google search away from figuring it out."*

Your first time running this and it crashes? That's normal. Read the error. Google the first line. Ask someone. You're not supposed to know everything yet. Happy coding.
