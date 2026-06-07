const Candidate = require('../models/Candidate');
const AuditLog = require('../models/AuditLog');

const candidateController = {
  getByPositionId(req, res) {
    try {
      const positionId = Number(req.params.positionId);
      if (!Number.isInteger(positionId) || positionId < 1) {
        return res.status(400).json({ error: 'Invalid position ID' });
      }
      res.json(Candidate.getByPositionId(positionId));
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
      const positionId = Number(req.params.positionId);
      if (!Number.isInteger(positionId) || positionId < 1) {
        return res.status(400).json({ error: 'Invalid position ID' });
      }
      const { name } = req.body;
      if (!name || typeof name !== 'string' || !name.trim()) {
        return res.status(400).json({ error: 'Candidate name is required' });
      }
      const candidate = Candidate.create({
        position_id: positionId,
        name: name.trim(),
        tagline: req.body.tagline || null
      });
      AuditLog.log({
        action_type: 'candidate_added',
        description: `Candidate "${name.trim()}" added to position #${positionId}`
      });
      res.status(201).json(candidate);
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
        return res.status(400).json({ error: 'Invalid candidate ID' });
      }
      const candidate = Candidate.update(id, req.body);
      if (!candidate) return res.status(404).json({ error: 'Candidate not found' });
      AuditLog.log({
        action_type: 'candidate_updated',
        description: `Candidate "${candidate.name}" was updated`
      });
      res.json(candidate);
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
        return res.status(400).json({ error: 'Invalid candidate ID' });
      }
      const existing = Candidate.getById(id);
      if (!existing) return res.status(404).json({ error: 'Candidate not found' });
      const name = existing.name;
      const deleted = Candidate.delete(id);
      if (deleted) {
        AuditLog.log({
          action_type: 'candidate_deleted',
          description: `Candidate "${name}" was deleted`
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

module.exports = candidateController;
