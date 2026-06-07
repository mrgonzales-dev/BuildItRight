# BasicCrudTODOApp

> A minimal task list you can run on your own machine — add tasks, mark them done, edit them, delete them. The perfect first full-stack app.

If you've never touched a full-stack app before, that's fine. This one is small on purpose. Backend is Express + SQLite (a database stored in a single file — no server to install). Frontend is React + Vite in a centered floating-card UI. Everything stays local. One folder at a time.

---

## What You'll Learn

- What **MVC (Model-View-Controller)** means in practice — how code is split into data, logic, and presentation
- How to do **CRUD operations** — Create, Read, Update, Delete — through a REST API
- How the **Vite proxy** connects the frontend to the backend without CORS headaches
- How to handle **partial updates** — changing just one field without sending everything
- How a **React hook** manages state, loading, and errors in one clean pattern

---

## Before You Start

- [ ] Node.js v20 or newer? Run `node --version`
- [ ] Have a terminal and a browser?
- [ ] 5 minutes of patience? First install takes a minute.

---

## How Do I Run It?

From the project root (`BasicCrudTODOApp/`):

```bash
npm install
npm run dev
```

What happens:

1. `npm install` — installs backend packages AND client packages (via the `postinstall` script).
2. `npm run dev` — starts **both** at once:
   - **API** → http://localhost:3000
   - **Frontend** → http://localhost:5173 ← open this in your browser

The frontend talks to the backend through `/api`. In dev mode, Vite proxies those requests to port 3000 so you don't have to configure anything extra.

> **Note about two-step install:** The root `package.json` has a `postinstall` script that runs `npm install --prefix client` automatically. So you should only need `npm install` from the root. If it doesn't work (sometimes postinstall scripts misbehave), run `npm install --prefix client` manually.

### Other useful commands

| Command | What it does |
|---------|----------------|
| `npm start` | Run the API only (production-style, no auto-reload) |
| `npm run dev:api` | API only, with nodemon (restarts when you save server files) |
| `npm run dev:web` | Frontend only (Vite dev server) |
| `cd client && npm run build` | Build the React app for production |
| `cd client && npm run lint` | Check frontend code for common mistakes |

---

## What's in Here?

```
BasicCrudTODOApp/
├── server.js              # Starts Express, wires routes, handles shutdown
├── package.json           # Backend scripts and dependencies
├── nodemon.json           # Tells nodemon to ignore client/ when watching
│
├── config/
│   └── db.js              # Opens SQLite, creates the todos table, exports close()
│
├── models/
│   └── Todo.js            # Talks to the database — CRUD for the todos table
│
├── controllers/
│   ├── todoController.js  # Validates requests, calls the model, sends JSON back
│   └── databaseController.js  # Dev-only: dumps all tables (see routes)
│
├── routes/
│   └── routes.js          # Maps URL paths to controller functions
│
├── database/
│   └── todo.sqlite        # Your database file (created on first run)
│
└── client/                # The React frontend (separate Node project)
    ├── index.html
    ├── vite.config.js     # Dev server + proxy /api → localhost:3000
    └── src/
        ├── main.jsx       # Entry point — mounts React into the page
        ├── api.js         # fetch() helper for /api/todos
        ├── App.css        # All styles (floating card, modals, animations)
        ├── hooks/
        │   └── useTodos.js    # State + API calls (load, create, edit, delete, toggle)
        ├── pages/
        │   └── Todos.jsx      # Main page — composes header, list, modals
        └── components/
            ├── Modal.jsx          # Reusable dialog (focus trap, Escape to close)
            ├── Icons.jsx          # Small SVG icons
            ├── TodoHeader.jsx     # Title, stats, filter tabs, Add button
            ├── TodoList.jsx       # Task rows with checkbox + actions
            └── TodoFormModal.jsx  # Create/edit + delete confirmation modals
```

### Quick glossary

- **Route** — a URL path the server responds to (e.g. `GET /api/todos`).
- **Controller** — reads the request, checks input, calls the model, sends the response.
- **Model** — runs SQL against the database. No HTTP here, just data.
- **MVC** — Model + View + Controller. This project splits backend that way; the React app is the "view."
- **Hook** — a React function (like `useTodos`) that bundles state and logic together.

> **About the styling:** This app uses **custom CSS** (in `App.css`), not Bootstrap. You'll see CSS variables, flex layouts, and animations defined by hand. If you see `data-bs-toggle` in someone else's code, that's Bootstrap's JavaScript — we don't use that here. Our modals are controlled by React state toggling CSS classes, which is simpler and doesn't need an extra library.

---

## How Does It Work?

Here's the flow when you click "Add" and save a task:

```
Browser (React)          Vite proxy          Express              SQLite
     │                       │                  │                    │
     │  POST /api/todos      │                  │                    │
     │ ─────────────────────>│ ────────────────>│                    │
     │                       │                  │  todoController    │
     │                       │                  │  .create()         │
     │                       │                  │ ──────────────────>│
     │                       │                  │  INSERT ...        │
     │                       │                  │<────────────────── │
     │                       │                  │  JSON todo         │
     │<──────────────────────│<─────────────────│                    │
     │  201 + new todo       │                  │                    │
     │  list refreshes       │                  │                    │
```

1. **Frontend** (`useTodos.js`) calls `api.todos.create(...)`.
2. **Vite** forwards `/api/*` to Express on port 3000.
3. **routes.js** sends the request to `todoController.create`.
4. **Controller** validates the title, then calls `Todo.create`.
5. **Model** runs a parameterized `INSERT` (safe from SQL injection).
6. JSON comes back; React updates the list without a full page reload.

Updates use **partial PATCH-style** logic: you only send the fields you want to change. Toggling complete sends just `{ "completed": true }` — it won't wipe the title or description.

---

## The Database

Table: `todos`

| Column | Type | Notes |
|--------|------|-------|
| id | INTEGER | Auto-increment |
| title | TEXT | Required — can't be empty |
| description | TEXT | Optional extra details |
| completed | INTEGER | 0 = not done, 1 = done (SQLite doesn't have real booleans, so we use 0/1) |
| created_at | TEXT | Auto-filled when the task is created |
| updated_at | TEXT | Updated when the task is modified |

> **Important:** `completed` is stored as 0 or 1 in the database, but the API sends it as `true` / `false` in JSON. The model handles the conversion automatically. When you use curl or the frontend, always send `true` or `false` — never `"true"` (a string).

---

## API Endpoints

Base URL: **http://localhost:3000/api**

| Method | Path | What it does |
|--------|------|----------------|
| `GET` | `/todos` | List all todos (newest first) |
| `GET` | `/todos/:id` | Get one todo by id |
| `POST` | `/todos` | Create a todo |
| `PUT` | `/todos/:id` | Update a todo (only fields you send) |
| `DELETE` | `/todos/:id` | Delete a todo |
| `GET` | `/database` | **Dev only** — dump all tables as JSON |

### Request / response notes

- **`completed`** is a boolean in JSON (`true` / `false`). SQLite stores it as 0/1 internally.
- **Create** requires `title` (non-empty string). `description` is optional.
- **Update** accepts any subset of `title`, `description`, `completed`. Omitted fields are left alone.
- Invalid input → `400` with `{ "error": "..." }`. Missing todo → `404`. Server blow-up → `500`.

---

## Try It With curl

Make sure the server is running (`npm run dev` or `npm run dev:api`).

**List all todos:**
```bash
curl http://localhost:3000/api/todos
```

**Create a todo:**
```bash
curl -X POST http://localhost:3000/api/todos \
  -H "Content-Type: application/json" \
  -d '{"title":"Buy milk","description":"2%"}'
```

**Mark one complete** (replace `1` with a real id):
```bash
curl -X PUT http://localhost:3000/api/todos/1 \
  -H "Content-Type: application/json" \
  -d '{"completed":true}'
```

**Delete a todo:**
```bash
curl -X DELETE http://localhost:3000/api/todos/1
```

**Peek at the whole database** (development only):
```bash
curl http://localhost:3000/api/database
```

### Error cases

```bash
# Missing title (400 Bad Request)
curl -X POST http://localhost:3000/api/todos \
  -H "Content-Type: application/json" \
  -d '{}'

# Todo not found (404)
curl http://localhost:3000/api/todos/9999

# String instead of boolean for completed (400)
curl -X PUT http://localhost:3000/api/todos/1 \
  -H "Content-Type: application/json" \
  -d '{"completed":"true"}'
```

If curl says "Connection refused," the API isn't running yet. Start it first — we've all forgotten that step.

---

## Tech Stack

| Package | What It Does | Why We Use It |
|---------|-------------|---------------|
| express | HTTP server | Simple, widely used, great for learning |
| better-sqlite3 | Talks to SQLite | Synchronous — no async/await needed |
| cors | Allows cross-origin requests | So the browser can talk to the backend |
| react | UI library | Builds the todo list and modals |
| vite | Frontend dev server + build tool | Fast, proxies API calls to the backend |
| nodemon | Auto-restarts server on save | Dev convenience |
| concurrently | Runs backend + frontend together | One terminal, two servers |

---

## Customization Guide

### Add a "due date" field to todos

1. **Update the database schema** — in `config/db.js`, add to the CREATE TABLE:
   ```sql
   due_date TEXT NULL
   ```
2. **Delete the old database** — `rm database/todo.sqlite` (it'll be recreated on next start)
3. **Update the Todo model** — in `models/Todo.js`, add `due_date` to the INSERT and UPDATE statements
4. **Update the controller** — in `controllers/todoController.js`, accept `due_date` in the request body
5. **Update the frontend** — in `components/TodoFormModal.jsx`, add a date input field

### Change the color theme

1. **Open `client/src/App.css`** and find the CSS variables at the top
2. Change the colors to whatever you like:
   ```css
   --primary: #your-color;
   --bg: #your-background;
   ```
3. The page refreshes automatically.

---

## Challenge Yourself

- 🟢 **Easy:** Add a `description` field to new todos and display it in the list.
- 🟢 **Easy:** Change the card background color in `App.css` — find the `.todo-card` class and play with the CSS.
- 🟡 **Medium:** Add a **search/filter** feature — a search bar at the top that filters todos by title. Should this be frontend-only or a backend endpoint?
- 🟡 **Medium:** Add a **due date** field (see customization guide above). Sort todos by due date with the most urgent tasks first.
- 🔴 **Hard:** Add **categories/tags** — create a second table in the database, link it to todos with a foreign key, and add a filter dropdown in the UI.

---

## Troubleshooting

| Error | What It Means | What To Try |
|-------|--------------|-------------|
| `EADDRINUSE` on port 3000 | Something else is already using that port | Stop the other process, or run `PORT=3001 npm run dev:api` — also change the proxy in `client/vite.config.js` |
| `EADDRINUSE` on port 5173 | Another Vite app is running | Stop it, or Vite will offer the next free port (usually 5174) |
| `Connection refused` in browser or curl | Server not started | Run `npm run dev` from the project root |
| Blank page at `:5173` | Frontend crashed or build error | Check the terminal running Vite; run `cd client && npm run build` to see errors |
| `Completed must be a boolean` | Sent `"true"` as a string instead of `true` | Use real JSON booleans, not quoted strings. In curl: `'{"completed":true}'` NOT `'{"completed":"true"}'` |
| `Cannot find module 'react'` | Frontend deps not installed | Run `npm install --prefix client` manually |
| `Cannot find module 'express'` | Backend deps not installed | Run `npm install` in the project root |
| `no such column: "now"` | Old SQLite datetime bug (fixed in latest code) | Pull the latest code; timestamps use `datetime('now')` with single quotes |
| `ERR_CONNECTION_REFUSED` on frontend | Vite proxy can't reach backend | Make sure the API server is running on port 3000 (or the port in your vite.config.js) |
| `.env` changes not taking effect | Using `npm start` instead of `npm run dev` | Always use `npm run dev` for development |

---

## What Should I Do Next?

Start with **`routes/routes.js`** → **`controllers/todoController.js`** → **`models/Todo.js`**. That's the backend path for one request.

On the frontend, start with **`pages/Todos.jsx`** → **`hooks/useTodos.js`** → **`api.js`**.

The rest will click once you've traced one create and one delete all the way through. You've got this.

**Ready for more?** If you liked the MVC pattern here, try **LibrarySystem** next — it has four database tables, search endpoints, and a borrowing/return system that tracks quantities.

---

## Production-ish Notes (optional)

- Set `NODE_ENV=production` to hide the `/api/database` debug route.
- Run `cd client && npm run build`, then serve `client/dist` from Express or a static host — you'll need your own `/api` proxy or same-origin setup (the Vite proxy only works in dev).
- `database/todo.sqlite` lives in the `database/` folder. Back it up if you care about the data.

---

*"Your first time running this and it crashes? That's normal. Read the error. Google the first line. Ask someone. You're not supposed to know everything yet. Every programmer you look up to started exactly where you are now — staring at a terminal, confused, one Google search away from figuring it out."*
