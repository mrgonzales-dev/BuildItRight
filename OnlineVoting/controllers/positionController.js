const Position = require('../models/Position');
const AuditLog = require('../models/AuditLog');

const positionController = {
  getByElectionId(req, res) {
    try {
      const electionId = Number(req.params.electionId);
      if (!Number.isInteger(electionId) || electionId < 1) {
        return res.status(400).json({ error: 'Invalid election ID' });
      }
      res.json(Position.getByElectionId(electionId));
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

  create(req, res) {
    try {
      const electionId = Number(req.params.electionId);
      if (!Number.isInteger(electionId) || electionId < 1) {
        return res.status(400).json({ error: 'Invalid election ID' });
      }
      const { title } = req.body;
      if (!title || typeof title !== 'string' || !title.trim()) {
        return res.status(400).json({ error: 'Position title is required' });
      }
      const position = Position.create({ election_id: electionId, title: title.trim() });
      AuditLog.log({
        action_type: 'position_added',
        description: `Position "${title.trim()}" added to election #${electionId}`,
        election_id: electionId
      });
      res.status(201).json(position);
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

  update(req, res) {
    try {
      const id = Number(req.params.id);
      if (!Number.isInteger(id) || id < 1) {
        return res.status(400).json({ error: 'Invalid position ID' });
      }
      const position = Position.update(id, req.body);
      if (!position) return res.status(404).json({ error: 'Position not found' });
      AuditLog.log({
        action_type: 'position_updated',
        description: `Position "${position.title}" was updated`,
        election_id: position.election_id
      });
      res.json(position);
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

  delete(req, res) {
    try {
      const id = Number(req.params.id);
      if (!Number.isInteger(id) || id < 1) {
        return res.status(400).json({ error: 'Invalid position ID' });
      }
      const existing = Position.getById(id);
      if (!existing) return res.status(404).json({ error: 'Position not found' });
      const title = existing.title;
      const deleted = Position.delete(id);
      if (deleted) {
        AuditLog.log({
          action_type: 'position_deleted',
          description: `Position "${title}" was deleted`,
          election_id: existing.election_id
        });
      }
      res.status(deleted ? 204 : 404).send();
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

module.exports = positionController;
