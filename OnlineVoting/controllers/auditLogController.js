const AuditLog = require('../models/AuditLog');

const auditLogController = {
  getAll(req, res) {
    try {
      const { election_id, action_type, limit, offset } = req.query;
      const logs = AuditLog.getAll({
        electionId: election_id ? Number(election_id) : undefined,
        actionType: action_type || undefined,
        limit: limit ? Number(limit) : 100,
        offset: offset ? Number(offset) : 0
      });
      for (const log of logs) {
        if (log.metadata) {
          try {
            log.metadata = JSON.parse(log.metadata);
          } catch (e) {
            // keep as string
          }
        }
      }
      res.json(logs);
    } catch (err) {
      if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        return res.status(409).json({ error: 'A record with that value already exists' });
      }
      if (err.code === 'SQLITE_CONSTRAINT_FOREIGNKEY') {
        return res.status(409).json({ error: 'Referenced record not found' });
      }
      res.status(500).json({ error: err.message });
    }
  },

  getActionTypes(req, res) {
    try {
      res.json(AuditLog.getDistinctActionTypes());
    } catch (err) {
      if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        return res.status(409).json({ error: 'A record with that value already exists' });
      }
      if (err.code === 'SQLITE_CONSTRAINT_FOREIGNKEY') {
        return res.status(409).json({ error: 'Referenced record not found' });
      }
      res.status(500).json({ error: err.message });
    }
  }
};

module.exports = auditLogController;
