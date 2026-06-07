const db = require('../config/db');

const Election = {
  getAll() {
    return db.prepare('SELECT * FROM elections ORDER BY created_at DESC').all();
  },

  getById(id) {
    const election = db.prepare('SELECT * FROM elections WHERE id = ?').get(id);
    if (!election) return null;
    election.positions = db.prepare(
      'SELECT * FROM positions WHERE election_id = ? ORDER BY display_order'
    ).all(id);
    const positionIds = election.positions.map(p => p.id);
    const allCandidates = positionIds.length > 0
      ? db.prepare(
          `SELECT * FROM candidates WHERE position_id IN (${positionIds.map(() => '?').join(',')}) ORDER BY display_order`
        ).all(...positionIds)
      : [];
    const candidatesByPosition = {};
    for (const c of allCandidates) {
      if (!candidatesByPosition[c.position_id]) candidatesByPosition[c.position_id] = [];
      candidatesByPosition[c.position_id].push(c);
    }
    for (const pos of election.positions) {
      pos.candidates = candidatesByPosition[pos.id] || [];
    }
    return election;
  },

  create(data) {
    const info = db.prepare(
      'INSERT INTO elections (title, description, start_date, end_date, status) VALUES (?, ?, ?, ?, ?)'
    ).run(data.title, data.description || null, data.start_date, data.end_date, data.status || 'upcoming');
    return Election.getById(info.lastInsertRowid);
  },

  update(id, data) {
    const existing = db.prepare('SELECT * FROM elections WHERE id = ?').get(id);
    if (!existing) return null;
    db.prepare(
      `UPDATE elections SET
        title = ?, description = ?, start_date = ?, end_date = ?, status = ?,
        updated_at = datetime('now')
       WHERE id = ?`
    ).run(
      data.title ?? existing.title,
      data.description ?? existing.description,
      data.start_date ?? existing.start_date,
      data.end_date ?? existing.end_date,
      data.status ?? existing.status,
      id
    );
    return Election.getById(id);
  },

  delete(id) {
    const info = db.prepare('DELETE FROM elections WHERE id = ?').run(id);
    return info.changes > 0;
  },

  getActive() {
    return db.prepare(
      "SELECT * FROM elections WHERE status = 'active' ORDER BY created_at DESC"
    ).all();
  },

  getStats() {
    const totalElections = db.prepare('SELECT COUNT(*) as count FROM elections').get().count;
    const activeElections = db.prepare("SELECT COUNT(*) as count FROM elections WHERE status = 'active'").get().count;
    const totalVoters = db.prepare('SELECT COUNT(*) as count FROM voters').get().count;
    const totalBallots = db.prepare('SELECT COUNT(*) as count FROM ballots').get().count;
    return { totalElections, activeElections, totalVoters, totalBallots };
  }
};

module.exports = Election;
