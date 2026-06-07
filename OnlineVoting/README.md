# OnlineVoting

> A voting system for SSG and school elections. Admins create elections, add positions and candidates, register voters, and open the polls. Voters log in with a code, cast their ballot, and get a receipt. Every action is tracked in an audit log. Backend is Express + SQLite. Frontend is React + Bootstrap.

This is the most complex project in the BuildItRight collection — 7 database tables, 30+ API endpoints, CSV import, audit logging, and a full election lifecycle. Take it slow. One folder at a time.

---

## What You'll Learn

- How to model a **real-world workflow** (elections have states: upcoming → active → closed)
- How to design a **many-to-many relationship** (ballots link voters, elections, and candidates)
- How to implement an **audit log** — every important action is written to a table that can't be erased
- How to handle **CSV file import** — parsing uploaded files, validating data, creating records in bulk
- How to enforce **business rules** — only one active election at a time, one vote per voter per election, results hidden until closed

---

## Before You Start

- [ ] Node.js v20 or newer? Run `node --version`
- [ ] Have a terminal and a browser?
- [ ] 5 minutes of patience? Two install steps (backend + frontend).
- [ ] Note: there are no demo accounts. You'll create elections and voters yourself (or use the curl commands below).

---

## How Do I Run It?

```bash
# 1. Go into the folder
cd OnlineVoting

# 2. Install the backend dependencies
npm install

# 3. Install the frontend dependencies
npm install --prefix client

# 4. Start both server and frontend together
npm run dev
```

This starts the API backend on **http://localhost:3000** and the React frontend on **http://localhost:5173**. Open the frontend URL in your browser.

If you'd rather start them separately:

```bash
npm run dev:api      # just the backend
npm run dev:web      # just the frontend
```

### Default admin PIN

The admin panel is protected by a PIN. The default is `1234`. You can change it in the `.env` file:

```
ADMIN_PIN=your-secret-pin
```

> **Security note:** The admin PIN is stored as plain text in `.env`. This is fine for a school project demo but NOT for real elections. In production, you'd hash the PIN with bcrypt and use proper authentication (see the **BasicAuth** project for that pattern).

---

## What's in Here?

```
OnlineVoting/
├── server.js                  # The Express app — starts the server, loads routes
├── .env                       # PORT and ADMIN_PIN settings
├── nodemon.json               # Tells nodemon how to read .env
├── package.json               # Backend dependencies and scripts
│
├── config/
│   └── db.js                  # Opens SQLite, creates all 7 tables and indexes
│
├── models/                    # Each file = one table in the database
│   ├── Election.js            #   CRUD, stats, activate/reopen helpers
│   ├── Position.js            #   CRUD, ordered by display_order
│   ├── Candidate.js           #   CRUD, linked to a position
│   ├── Voter.js               #   CRUD, bulk create, access code generation
│   ├── Ballot.js              #   Cast a vote, generate receipt codes
│   └── AuditLog.js            #   Log and query actions
│
├── controllers/               # The logic between routes and models
│   ├── electionController.js  #   Handles election activate/reopen rules
│   ├── positionController.js
│   ├── candidateController.js
│   ├── voterController.js     #   CSV parsing and bulk import
│   ├── voteController.js      #   Validate voter, cast ballot, get receipt
│   ├── resultsController.js   #   Tally votes per position (only for closed elections)
│   ├── auditLogController.js
│   ├── authController.js      #   Verify admin PIN
│   └── databaseController.js  #   Dump all tables (admin debug)
│
├── middleware/
│   └── adminAuth.js           # Checks the x-admin-pin header before admin routes
│
├── routes/
│   └── routes.js              # All 30+ API endpoints in one file
│
├── database/                  # SQLite database auto-created here
│
└── client/                    # React frontend (Vite + Bootstrap)
    ├── index.html             # Entry HTML — title is "ElectionVote"
    ├── vite.config.js         # Proxies /api/* to localhost:3000
    ├── package.json           # Frontend dependencies
    └── src/
        ├── main.jsx           # React root, loads Bootstrap CSS
        ├── App.jsx            # Routes, sidebar + mobile hamburger menu
        ├── App.css            # Blue-white theme, dark sidebar, responsive
        ├── api.js             # All fetch calls to the backend
        ├── components/
        │   └── AdminGuard.jsx # Checks admin PIN before showing admin pages
        └── pages/
            ├── Dashboard.jsx  # Stats overview
            ├── AdminLogin.jsx # PIN entry for admins
            ├── Elections.jsx  # Create and manage elections
            ├── BallotSetup.jsx# Add positions and candidates to an election
            ├── Voters.jsx     # Register voters, CSV upload, download template
            ├── AuditLog.jsx   # View the audit trail
            ├── Results.jsx    # View tally for a closed election
            ├── VoteKiosk.jsx  # Public landing — checks if voting is open
            ├── VoteAccess.jsx # Enter access code
            ├── VoteBallot.jsx # Cast a vote
            └── VoteReceipt.jsx# View receipt after voting
```

Don't worry if you don't understand every file. Focus on one folder at a time. The rest will click.

---

## How Does It Work?

Think of three roles: **admin**, **voter**, and **the system itself**.

### Admin flow

1. Log in with a PIN on the admin panel.
2. Create an **election** — give it a title, description, start date, and end date.
3. Add **positions** to the election (like "President", "Vice President").
4. Add **candidates** to each position (like "Juan Dela Cruz" under "President").
5. Register **voters** — one by one, in bulk via JSON, or upload a CSV file. Each voter gets a random **access code** that acts like their password.
6. Click "Activate" to open the election for voting. Only one election can be active at a time.
7. When ready, close the election. Results become visible.

### Voter flow

```
VoteKiosk.jsx    VoteAccess.jsx    VoteBallot.jsx    api.js         voteController
     │                │                  │               │                 │
     │ "Vote Now"     │                  │               │                 │
     │───────────────>│                  │               │                 │
     │                │ Enter access     │               │                 │
     │                │ code "A1B2C3"   │               │                 │
     │                │─────────────────>│               │                 │
     │                │                  │ POST /api/    │                 │
     │                │                  │ vote/validate │                 │
     │                │                  │ ─────────────>│ ───────────────>│
     │                │                  │               │ Check code      │
     │                │                  │               │ exists, hasn't  │
     │                │                  │               │ voted yet       │
     │                │                  │               │ <───────────────│
     │                │                  │ <─────────────│ ballot info     │
     │                │                  │ Show ballot   │                 │
     │                │                  │               │                 │
     │                │                  │ Voter selects │                 │
     │                │                  │ candidates,   │                 │
     │                │                  │ clicks Submit │                 │
     │                │                  │ ─────────────>│ POST /api/      │
     │                │                  │               │   vote/cast     │
     │                │                  │               │ ───────────────>│
     │                │                  │               │ Insert ballot,  │
     │                │                  │               │ vote_selections,│
     │                │                  │               │ audit log       │
     │                │                  │               │ <───────────────│
     │                │                  │ <─────────────│ receipt code    │
     │                │                  │               │                 │
     │                │                  │ ───────────────────────────────>│
     │                │                  │    VoteReceipt.jsx              │
     │                │                  │    shows receipt code           │
```

1. Go to the "Vote Now" page (or `/student_vote`).
2. Enter your access code.
3. If the election is active and you haven't voted yet, you'll see the ballot.
4. Pick one candidate per position and submit.
5. You get a **receipt code** — a random 12-character string you can use to verify your vote later.
6. You can verify your vote by entering the receipt code on the receipt page.

### What the system does (business rules)

- **One voter, one vote per election.** Enforced by a UNIQUE index on `(election_id, voter_id)` in the ballots table — you literally can't insert a second vote.
- **Only one active election at a time.** Activating a new election auto-closes the current active one.
- **Results are locked** until the election is closed. This prevents live tracking.
- **Audit trail on everything.** Election create/activate/close, voter registration, votes cast — all written to the `audit_log` table with timestamps.
- **Access codes are 12-character hex strings** (like `A1B2C3D4E5F6`). Randomly generated, stored as-is in the database.

---

## The Database

Seven tables. Let's walk through them.

### Table: `elections`

| Column | Type | Notes |
|--------|------|-------|
| id | INTEGER | Auto-increment |
| title | TEXT | Election name |
| description | TEXT | Optional |
| start_date | TEXT | When voting begins |
| end_date | TEXT | When voting ends |
| status | TEXT | One of: `upcoming`, `active`, `closed` |
| created_at | TEXT | Auto-filled |
| updated_at | TEXT | Auto-filled |

### Table: `positions`

| Column | Type | Notes |
|--------|------|-------|
| id | INTEGER | Auto-increment |
| election_id | INTEGER | Links to `elections.id` (CASCADE delete) |
| title | TEXT | e.g., "President", "Vice President" |
| display_order | INTEGER | Controls ordering on the ballot |
| created_at | TEXT | Auto-filled |
| updated_at | TEXT | Auto-filled |

### Table: `candidates`

| Column | Type | Notes |
|--------|------|-------|
| id | INTEGER | Auto-increment |
| position_id | INTEGER | Links to `positions.id` (CASCADE delete) |
| name | TEXT | Candidate's name |
| tagline | TEXT | Optional slogan |
| display_order | INTEGER | Controls ordering on the ballot |
| created_at | TEXT | Auto-filled |
| updated_at | TEXT | Auto-filled |

### Table: `voters`

| Column | Type | Notes |
|--------|------|-------|
| id | INTEGER | Auto-increment |
| student_id | TEXT | School ID number |
| name | TEXT | Voter's full name |
| grade_section | TEXT | e.g., "12-A" |
| access_code | TEXT | Unique 12-char hex — their "password" |
| created_at | TEXT | Auto-filled |
| updated_at | TEXT | Auto-filled |

### Table: `ballots`

| Column | Type | Notes |
|--------|------|-------|
| id | INTEGER | Auto-increment |
| election_id | INTEGER | Links to `elections.id` |
| voter_id | INTEGER | Links to `voters.id` |
| receipt_code | TEXT | Unique 12-char code for voter verification |
| cast_at | TEXT | When the vote was submitted |
| created_at | TEXT | Auto-filled |

> **UNIQUE constraint** on `(election_id, voter_id)` — one voter, one vote per election. This is enforced by the database itself.

### Table: `vote_selections`

| Column | Type | Notes |
|--------|------|-------|
| id | INTEGER | Auto-increment |
| ballot_id | INTEGER | Links to `ballots.id` (CASCADE delete) |
| position_id | INTEGER | Links to `positions.id` (CASCADE delete) |
| candidate_id | INTEGER | Links to `candidates.id` (SET NULL if candidate deleted) |
| created_at | TEXT | Auto-filled |

> **UNIQUE constraint** on `(ballot_id, position_id)` — one selection per position per ballot.

### Table: `audit_log`

| Column | Type | Notes |
|--------|------|-------|
| id | INTEGER | Auto-increment |
| action_type | TEXT | e.g., "election_created", "vote_cast" |
| description | TEXT | Human-readable description |
| election_id | INTEGER | Optional link to election |
| voter_id | INTEGER | Optional link to voter |
| metadata | TEXT | Optional JSON with extra details |
| ip_address | TEXT | Optional |
| created_at | TEXT | Auto-filled |

### Relationships

```
elections  1 ──── many positions
elections  1 ──── many ballots
elections  1 ──── many audit_log entries
positions  1 ──── many candidates
positions  1 ──── many vote_selections
voters     1 ──── many ballots
ballots    1 ──── many vote_selections
```

---

## API Endpoints

All routes start with `/api`. Routes marked with 🔒 need the `x-admin-pin` header (the default is `1234`).

### Auth

| Method | Path | Auth | What it does |
|--------|------|------|-------------|
| POST | `/auth/verify` | — | Check if a PIN is the admin PIN |

### Elections

| Method | Path | Auth | What it does |
|--------|------|------|-------------|
| GET | `/elections/stats` | — | Count of elections, voters, ballots |
| GET | `/elections` | — | List all elections |
| GET | `/elections/:id` | — | Get one election with positions |
| POST | `/elections` | 🔒 | Create a new election |
| PUT | `/elections/:id` | 🔒 | Update an election |
| DELETE | `/elections/:id` | 🔒 | Delete an election |
| POST | `/elections/:id/activate` | 🔒 | Open election for voting |
| POST | `/elections/:id/reopen` | 🔒 | Reopen a closed election |

### Positions

| Method | Path | Auth | What it does |
|--------|------|------|-------------|
| GET | `/elections/:electionId/positions` | — | List positions for an election |
| POST | `/elections/:electionId/positions` | 🔒 | Add a position to an election |
| PUT | `/positions/:id` | 🔒 | Update a position |
| DELETE | `/positions/:id` | 🔒 | Delete a position |

### Candidates

| Method | Path | Auth | What it does |
|--------|------|------|-------------|
| GET | `/positions/:positionId/candidates` | — | List candidates for a position |
| POST | `/positions/:positionId/candidates` | 🔒 | Add a candidate to a position |
| PUT | `/candidates/:id` | 🔒 | Update a candidate |
| DELETE | `/candidates/:id` | 🔒 | Delete a candidate |

### Voters

| Method | Path | Auth | What it does |
|--------|------|------|-------------|
| GET | `/voters/template` | 🔒 | Download a CSV template |
| POST | `/voters/upload` | 🔒 | Import voters from CSV file |
| POST | `/voters/bulk` | 🔒 | Import voters from JSON array |
| GET | `/voters` | 🔒 | List all voters |
| GET | `/voters/:id` | 🔒 | Get one voter |
| POST | `/voters` | 🔒 | Add one voter |
| PUT | `/voters/:id` | 🔒 | Update a voter |
| DELETE | `/voters/:id` | 🔒 | Delete a voter |

### Voting

| Method | Path | Auth | What it does |
|--------|------|------|-------------|
| GET | `/vote/kiosk` | — | Check if an election is active |
| POST | `/vote/validate` | — | Validate an access code |
| POST | `/vote/cast` | — | Submit a ballot |
| GET | `/vote/receipt/:receiptCode` | — | Look up a vote by receipt code |

### Results & Audit Log

| Method | Path | Auth | What it does |
|--------|------|------|-------------|
| GET | `/elections/:id/results` | — | Get tally for a closed election |
| GET | `/audit-log` | 🔒 | View the audit trail |
| GET | `/audit-log/action-types` | 🔒 | List distinct action types logged |
| GET | `/database` | 🔒 | Dump all tables (debug) |

---

## Try It With curl

Make sure the server is running first. We've all forgotten.

### Log in as admin

```bash
curl -s -X POST http://localhost:3000/api/auth/verify \
  -H "Content-Type: application/json" \
  -d '{"pin":"1234"}'
```

If it returns `{"valid":true}`, you're in. Now set the pin as a variable so you don't have to type it every time:

```bash
PIN_HEADER="x-admin-pin:1234"
```

### Create an election

```bash
curl -s -X POST http://localhost:3000/api/elections \
  -H "Content-Type: application/json" \
  -H "$PIN_HEADER" \
  -d '{"title":"SSG Election 2025","description":"Elect your student leaders","start_date":"2025-06-01","end_date":"2025-06-07"}'
```

### Add a position

```bash
curl -s -X POST http://localhost:3000/api/elections/1/positions \
  -H "Content-Type: application/json" \
  -H "$PIN_HEADER" \
  -d '{"title":"President"}'
```

### Add a candidate

```bash
curl -s -X POST http://localhost:3000/api/positions/1/candidates \
  -H "Content-Type: application/json" \
  -H "$PIN_HEADER" \
  -d '{"name":"Juan Dela Cruz","tagline":"Your voice, your future"}'
```

### Register a voter

```bash
curl -s -X POST http://localhost:3000/api/voters \
  -H "Content-Type: application/json" \
  -H "$PIN_HEADER" \
  -d '{"student_id":"2024-0001","name":"Juan Dela Cruz","grade_section":"12-A"}'
```

The response includes the voter's `access_code`. Save it — you'll need it to vote.

### Bulk register voters (JSON array)

```bash
curl -s -X POST http://localhost:3000/api/voters/bulk \
  -H "Content-Type: application/json" \
  -H "$PIN_HEADER" \
  -d '[{"student_id":"2024-0002","name":"Maria Santos","grade_section":"12-B"},{"student_id":"2024-0003","name":"Jose Rizal","grade_section":"12-A"}]'
```

> **CSV upload vs JSON bulk:** The CSV upload endpoint (`POST /api/voters/upload`) expects a file upload (multipart form data). The bulk endpoint (`POST /api/voters/bulk`) expects a JSON array. They work differently — the CSV parser may handle edge cases differently than the JSON parser. If you're testing, the JSON bulk route is easier to use with curl.

### Activate the election

```bash
curl -s -X POST http://localhost:3000/api/elections/1/activate \
  -H "$PIN_HEADER"
```

### Vote

```bash
curl -s -X POST http://localhost:3000/api/vote/cast \
  -H "Content-Type: application/json" \
  -d '{"access_code":"THE_VOTER_ACCESS_CODE","selections":[{"position_id":1,"candidate_id":1}]}'
```

Replace `THE_VOTER_ACCESS_CODE` with the actual code from voter registration. The response contains a `receipt_code` — hang onto it.

> **Blank ballot note:** If you don't send any selections (empty array), the vote is still accepted. The system creates a ballot with no selections. This means a voter can submit a blank ballot — something to consider if you're customizing validation rules.

### Check a receipt

```bash
curl -s http://localhost:3000/api/vote/receipt/THE_RECEIPT_CODE
```

### View results (after the election is closed)

```bash
curl -s http://localhost:3000/api/elections/1/results
```

---

## Tech Stack

| Package | What It Does | Why We Use It |
|---------|-------------|---------------|
| express | HTTP server | Simple, widely used, great for learning |
| better-sqlite3 | Talks to SQLite | Synchronous — no async/await needed |
| cors | Cross-origin requests | So the browser can talk to the API |
| multer | File upload handling | For CSV voter import |
| csv-parse | CSV parsing library | Reads uploaded voter CSV files |
| react | UI library | Builds the admin panel and voting kiosk |
| react-router-dom | Client-side routing | Multi-page app experience |
| bootstrap | CSS framework | Clean UI (CSS only, no JS) |
| vite | Frontend dev server + build | Fast, proxies `/api` to backend |
| nodemon | Auto-restarts server on save | Dev convenience |
| concurrently | Runs backend + frontend together | One terminal, two servers |

---

## Customization Guide

### Change the access code format

1. **Open `models/Voter.js`** and find the access code generation logic
2. Currently it generates a 12-character hex string (like `A1B2C3D4E5F6`). Change the length or format:
   ```js
   // Generate 6-digit numeric code instead
   const code = Math.floor(100000 + Math.random() * 900000).toString();
   ```
3. **Update the validation** in `controllers/voteController.js` to accept the new format

### Add a "maximum candidates per position" limit

1. **Open `controllers/voteController.js`** and find the `cast` handler
2. Add a check: if a position has more than N selections, reject with a 400 error
3. **Update the frontend** in `VoteBallot.jsx` to show a warning

### Distribute access codes automatically

The default system requires the admin to manually distribute access codes to voters (they're shown on the Voters page). To improve this:

1. **Add an email column** to the voters table
2. **Use a library like nodemailer** to send codes via email
3. **Or: generate a printable PDF** with all access codes for classroom distribution

---

## Challenge Yourself

- 🟢 **Easy:** Change the admin PIN from `1234` to something stronger in `.env`. Test that the old PIN no longer works.
- 🟢 **Easy:** Add a "total voters" stat to the admin dashboard — count how many voters are registered.
- 🟡 **Medium:** Add **voter validation** — prevent a ballot from being submitted if any position has no selection (reject blank ballots).
- 🟡 **Medium:** Add a **"max winners" field** to positions — for positions that have multiple winners (e.g., "Senators — top 3 win").
- 🔴 **Hard:** Implement **election results export** — generate a PDF or CSV of the final tally, including voter turnout percentage.
- 🔴 **Hard:** Replace the plaintext PIN with **bcrypt-hashed admin password** — use the auth patterns from the **BasicAuth** project.

---

## Troubleshooting

| Error | What It Means | What To Try |
|-------|--------------|-------------|
| `EADDRINUSE` on port 3000 | Another app is using that port | Kill the other process or change `PORT` in `.env` — also update `client/vite.config.js` |
| `EADDRINUSE` on port 5173 | Another Vite app is running | Stop it, or Vite will auto-offer the next port |
| Admin PIN not working | PIN in `.env` doesn't match what you're sending | Check `.env` — default is `1234`. Make sure you're using `x-admin-pin` header (not `Authorization`) |
| Access code validation fails | Code doesn't exist, or voter already voted | The access code is case-sensitive. Check the Voters page for the exact code. Each code works only once per election. |
| CSV upload fails | File format doesn't match what's expected | Download the CSV template first: `GET /api/voters/template`. Make sure your CSV has the same columns. CSV paste in a browser vs file upload may parse differently — try uploading an actual file. |
| Blank ballot accepted | Empty selections array doesn't trigger an error | This is expected behavior — the system allows blank ballots. To block them, add validation in `controllers/voteController.js`. |
| Results show nothing | Election isn't closed yet, or no votes cast | Results are hidden until the election status is `closed`. Activate → let voters vote → close → view results. |
| Two elections active at once | Tried to activate a second election | The `activate` endpoint auto-closes the current active election. Only one can be active at a time. |
| `Cannot find module 'react'` | Frontend deps not installed | Run `npm install --prefix client` |
| `Cannot find module 'better-sqlite3'` | Backend deps not installed | Run `npm install` in the project root |
| Delete election fails silently | Candidates or positions still exist | CASCADE delete should handle this. If it fails, check the foreign key constraints in `config/db.js`. |

---

## What Should I Do Next?

1. **Read `config/db.js`** — see all 7 tables and their indexes in one file. Notice the UNIQUE constraints that enforce business rules.
2. **Walk through the election lifecycle with curl:** create → add positions → add candidates → register voters → activate → vote → close → view results.
3. **Read `models/Ballot.js`** — see how the vote-casting transaction works with the audit log.
4. **Read `controllers/voterController.js`** — understand CSV parsing and bulk import.
5. **Ready for more?** You've reached the most complex project in this collection. Try combining patterns: add auth from **BasicAuth** to this voting system, or add image uploads from **ECommerce** for candidate photos.

---

## Production-ish Notes (optional)

- **Do not use this for real elections without major security upgrades.** The admin PIN is plaintext, there's no JWT authentication, and the access codes are stored in plaintext. For a real voting system, you'd need: bcrypt-hashed admin passwords, JWT authentication, encrypted access codes, HTTPS, and independent security auditing.
- The audit log is append-only in concept but not enforced at the database level. In production, you'd use a separate write-only database for audit logs.
- CSV import is fragile — it depends on exact column matching. In production, you'd add better validation and error reporting.

---

*"Your first time running this and it crashes? That's normal. Read the error. Google the first line. Ask someone. You're not supposed to know everything yet. Every programmer you look up to started exactly where you are now — staring at a terminal, confused, one Google search away from figuring it out."*

Happy coding!
