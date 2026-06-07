const db = require('../config/db');

const AuditLog = {
  getAll({ electionId, actionType, limit, offset } = {}) {
    let sql = 'SELECT * FROM audit_log';
    const conditions = [];
    const params = [];
    if (electionId) {
      conditions.push('election_id = ?');
      params.push(electionId);
    }
    if (actionType) {
      conditions.push('action_type = ?');
      params.push(actionType);
    }
    if (conditions.length) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }
    sql += ' ORDER BY created_at DESC';
    sql += ' LIMIT ? OFFSET ?';
    params.push(limit ?? 100, offset ?? 0);
    return db.prepare(sql).all(...params);
  },

  log(data) {
    const info = db.prepare(
      'INSERT INTO audit_log (action_type, description, election_id, voter_id, metadata, ip_address) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(
      data.action_type,
      data.description,
      data.election_id || null,
      data.voter_id || null,
      data.metadata != null
        ? (typeof data.metadata === 'string' ? data.metadata : JSON.stringify(data.metadata))
        : null,
      data.ip_address || null
    );
    return AuditLog.getById(info.lastInsertRowid);
  },

  getById(id) {
    return db.prepare('SELECT * FROM audit_log WHERE id = ?').get(id);
  },

  getDistinctActionTypes() {
    return db.prepare('SELECT DISTINCT action_type FROM audit_log ORDER BY action_type').all();
  }
};

module.exports = AuditLog;
