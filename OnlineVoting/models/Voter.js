const db = require('../config/db');
const crypto = require('crypto');

const Voter = {
  getAll() {
    const voters = db.prepare('SELECT * FROM voters ORDER BY name').all();
    const voterIds = voters.map(v => v.id);
    const allVotedIn = voterIds.length > 0
      ? db.prepare(
          `SELECT b.voter_id, e.id as election_id, e.title FROM ballots b 
           JOIN elections e ON e.id = b.election_id 
           WHERE b.voter_id IN (${voterIds.map(() => '?').join(',')})`
        ).all(...voterIds)
      : [];
    const votedInMap = {};
    for (const row of allVotedIn) {
      if (!votedInMap[row.voter_id]) votedInMap[row.voter_id] = [];
      votedInMap[row.voter_id].push({ id: row.election_id, title: row.title });
    }
    for (const v of voters) {
      v.votedIn = votedInMap[v.id] || [];
    }
    return voters;
  },

  getById(id) {
    const voter = db.prepare('SELECT * FROM voters WHERE id = ?').get(id);
    if (!voter) return null;
    voter.votedIn = db.prepare(
      'SELECT e.id, e.title FROM ballots b JOIN elections e ON e.id = b.election_id WHERE b.voter_id = ?'
    ).all(id);
    return voter;
  },

  getByAccessCode(code) {
    const voter = db.prepare('SELECT * FROM voters WHERE access_code = ?').get(code);
    if (!voter) return null;
    voter.votedIn = db.prepare(
      'SELECT e.id, e.title FROM ballots b JOIN elections e ON e.id = b.election_id WHERE b.voter_id = ?'
    ).all(voter.id);
    return voter;
  },

  generateAccessCode() {
    return crypto.randomBytes(6).toString('hex').toUpperCase();
  },

  create(data) {
    const accessCode = data.access_code || Voter.generateAccessCode();
    const info = db.prepare(
      'INSERT INTO voters (student_id, name, grade_section, access_code) VALUES (?, ?, ?, ?)'
    ).run(data.student_id, data.name, data.grade_section, accessCode);
    return Voter.getById(info.lastInsertRowid);
  },

  createBulk(rows) {
    const insert = db.prepare(
      'INSERT INTO voters (student_id, name, grade_section, access_code) VALUES (?, ?, ?, ?)'
    );
    const created = [];
    const transaction = db.transaction((rows) => {
      for (const row of rows) {
        const accessCode = Voter.generateAccessCode();
        const info = insert.run(row.student_id, row.name, row.grade_section, accessCode);
        created.push({
          id: info.lastInsertRowid,
          student_id: row.student_id,
          name: row.name,
          grade_section: row.grade_section,
          access_code: accessCode,
          created_at: new Date().toISOString(),
          votedIn: []
        });
      }
    });
    transaction(rows);
    return created;
  },

  update(id, data) {
    const existing = db.prepare('SELECT * FROM voters WHERE id = ?').get(id);
    if (!existing) return null;
    db.prepare(
      "UPDATE voters SET student_id = ?, name = ?, grade_section = ?, updated_at = datetime('now') WHERE id = ?"
    ).run(
      data.student_id ?? existing.student_id,
      data.name ?? existing.name,
      data.grade_section ?? existing.grade_section,
      id
    );
    return Voter.getById(id);
  },

  delete(id) {
    const info = db.prepare('DELETE FROM voters WHERE id = ?').run(id);
    return info.changes > 0;
  },

  hasVoted(voterId, electionId) {
    const row = db.prepare(
      'SELECT id FROM ballots WHERE voter_id = ? AND election_id = ?'
    ).get(voterId, electionId);
    return !!row;
  }
};

module.exports = Voter;
