const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'database', 'onlinevoting.sqlite');
const db = new Database(dbPath);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS elections (
    id          INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    title       TEXT    NOT NULL,
    description TEXT    NULL,
    start_date  TEXT    NOT NULL,
    end_date    TEXT    NOT NULL,
    status      TEXT    NOT NULL DEFAULT 'upcoming' CHECK(status IN ('upcoming','active','closed')),
    created_at  TEXT    NOT NULL DEFAULT (datetime('now')),
    updated_at  TEXT    NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS positions (
    id            INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    election_id   INTEGER NOT NULL,
    title         TEXT    NOT NULL,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at    TEXT    NOT NULL DEFAULT (datetime('now')),
    updated_at    TEXT    NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (election_id) REFERENCES elections(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS candidates (
    id            INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    position_id   INTEGER NOT NULL,
    name          TEXT    NOT NULL,
    tagline       TEXT    NULL,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at    TEXT    NOT NULL DEFAULT (datetime('now')),
    updated_at    TEXT    NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (position_id) REFERENCES positions(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS voters (
    id            INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    student_id    TEXT    NOT NULL,
    name          TEXT    NOT NULL,
    grade_section TEXT    NOT NULL,
    access_code   TEXT    NOT NULL UNIQUE,
    created_at    TEXT    NOT NULL DEFAULT (datetime('now')),
    updated_at    TEXT    NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS ballots (
    id           INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    election_id  INTEGER NOT NULL,
    voter_id     INTEGER NOT NULL,
    receipt_code TEXT    NOT NULL UNIQUE,
    cast_at      TEXT    NOT NULL DEFAULT (datetime('now')),
    created_at   TEXT    NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (election_id) REFERENCES elections(id) ON DELETE CASCADE,
    FOREIGN KEY (voter_id) REFERENCES voters(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS vote_selections (
    id            INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    ballot_id     INTEGER NOT NULL,
    position_id   INTEGER NOT NULL,
    candidate_id  INTEGER NULL,
    created_at    TEXT    NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (ballot_id) REFERENCES ballots(id) ON DELETE CASCADE,
    FOREIGN KEY (position_id) REFERENCES positions(id) ON DELETE CASCADE,
    FOREIGN KEY (candidate_id) REFERENCES candidates(id) ON DELETE SET NULL
  );

  CREATE TABLE IF NOT EXISTS audit_log (
    id          INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    action_type TEXT    NOT NULL,
    description TEXT    NOT NULL,
    election_id INTEGER NULL REFERENCES elections(id) ON DELETE SET NULL,
    voter_id    INTEGER NULL REFERENCES voters(id) ON DELETE SET NULL,
    metadata    TEXT    NULL,
    ip_address  TEXT    NULL,
    created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
  );

  CREATE INDEX IF NOT EXISTS idx_elections_status ON elections(status);
  CREATE INDEX IF NOT EXISTS idx_positions_election ON positions(election_id);
  CREATE INDEX IF NOT EXISTS idx_candidates_position ON candidates(position_id);
  CREATE INDEX IF NOT EXISTS idx_voters_access_code ON voters(access_code);
  CREATE INDEX IF NOT EXISTS idx_ballots_election ON ballots(election_id);
  CREATE INDEX IF NOT EXISTS idx_ballots_voter ON ballots(voter_id);
  CREATE INDEX IF NOT EXISTS idx_ballots_receipt ON ballots(receipt_code);
  CREATE UNIQUE INDEX IF NOT EXISTS idx_ballots_unique_vote ON ballots(election_id, voter_id);
  CREATE INDEX IF NOT EXISTS idx_vote_selections_ballot ON vote_selections(ballot_id);
  CREATE INDEX IF NOT EXISTS idx_audit_log_election ON audit_log(election_id);
  CREATE INDEX IF NOT EXISTS idx_audit_log_action ON audit_log(action_type);
  CREATE INDEX IF NOT EXISTS idx_audit_log_created ON audit_log(created_at);
  CREATE UNIQUE INDEX IF NOT EXISTS idx_vote_selections_unique_position ON vote_selections(ballot_id, position_id);
`);

const electionCount = db.prepare('SELECT COUNT(*) AS count FROM elections').get().count;
if (electionCount === 0) {
  const insertElection = db.prepare(
    "INSERT INTO elections (title, description, start_date, end_date, status) VALUES (?, ?, ?, ?, ?)"
  );
  const election = insertElection.run(
    'Favorite Programming Language',
    'Vote for your favorite programming language',
    '2024-01-01',
    '2099-12-31',
    'active'
  );
  const electionId = election.lastInsertRowid;

  const insertPosition = db.prepare(
    "INSERT INTO positions (election_id, title, display_order) VALUES (?, ?, ?)"
  );
  const position = insertPosition.run(electionId, 'Best Language Overall', 1);
  const positionId = position.lastInsertRowid;

  const insertCandidate = db.prepare(
    "INSERT INTO candidates (position_id, name, tagline, display_order) VALUES (?, ?, ?, ?)"
  );
  insertCandidate.run(positionId, 'JavaScript', 'The language of the web', 1);
  insertCandidate.run(positionId, 'Python', 'Simple and powerful', 2);
  insertCandidate.run(positionId, 'Rust', 'Fast and safe systems programming', 3);
  insertCandidate.run(positionId, 'Go', 'Simple, fast, and concurrent', 4);
}

module.exports = db;
