const Election = require('../models/Election');
const AuditLog = require('../models/AuditLog');

const electionController = {
  getAll(req, res) {
    try {
      res.json(Election.getAll());
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

  getById(req, res) {
    try {
      const id = Number(req.params.id);
      if (!Number.isInteger(id) || id < 1) {
        return res.status(400).json({ error: 'Invalid election ID' });
      }
      const election = Election.getById(id);
      if (!election) return res.status(404).json({ error: 'Election not found' });
      res.json(election);
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
      const { title, description, start_date, end_date } = req.body;
      if (!title || typeof title !== 'string' || !title.trim()) {
        return res.status(400).json({ error: 'Election title is required' });
      }
      if (!start_date || !end_date) {
        return res.status(400).json({ error: 'Start date and end date are required' });
      }
      const election = Election.create({
        title: title.trim(),
        description: description || null,
        start_date,
        end_date,
        status: 'upcoming'
      });
      AuditLog.log({
        action_type: 'election_created',
        description: `Election "${title.trim()}" was created`,
        election_id: election.id
      });
      res.status(201).json(election);
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
        return res.status(400).json({ error: 'Invalid election ID' });
      }
      const existing = Election.getById(id);
      if (!existing) return res.status(404).json({ error: 'Election not found' });

      if (req.body.status && existing.status === 'closed') {
        return res.status(400).json({ error: 'Cannot modify a closed election' });
      }
      if (req.body.status === 'active' && existing.status !== 'upcoming') {
        return res.status(400).json({ error: 'Only upcoming elections can be activated' });
      }

      const election = Election.update(id, req.body);
      AuditLog.log({
        action_type: 'election_updated',
        description: `Election "${election.title}" was updated (status: ${election.status})`,
        election_id: id
      });
      res.json(election);
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
        return res.status(400).json({ error: 'Invalid election ID' });
      }
      const existing = Election.getById(id);
      if (!existing) return res.status(404).json({ error: 'Election not found' });
      const title = existing.title;
      const deleted = Election.delete(id);
      if (deleted) {
        AuditLog.log({
          action_type: 'election_deleted',
          description: `Election "${title}" was deleted`,
          election_id: id
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
  },

  activate(req, res) {
    try {
      const id = Number(req.params.id);
      if (!Number.isInteger(id) || id < 1) return res.status(400).json({ error: 'Invalid election ID' });
      const existing = Election.getById(id);
      if (!existing) return res.status(404).json({ error: 'Election not found' });
      if (existing.status === 'active') return res.status(409).json({ error: 'Election is already active' });
      if (existing.status !== 'upcoming') return res.status(400).json({ error: 'Only upcoming elections can be activated' });
      const positions = existing.positions || [];
      if (positions.length === 0) return res.status(400).json({ error: 'Cannot activate election with no positions' });
      const activeElections = Election.getActive();
      for (const ae of activeElections) {
        Election.update(ae.id, { status: 'closed' });
        AuditLog.log({
          action_type: 'election_closed',
          description: `Election "${ae.title}" was auto-closed before activating "${existing.title}"`,
          election_id: ae.id
        });
      }
      const election = Election.update(id, { status: 'active' });
      AuditLog.log({
        action_type: 'election_activated',
        description: `Election "${election.title}" was activated for voting`,
        election_id: id
      });
      res.json(election);
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

  reopen(req, res) {
    try {
      const id = Number(req.params.id);
      if (!Number.isInteger(id) || id < 1) return res.status(400).json({ error: 'Invalid election ID' });
      const existing = Election.getById(id);
      if (!existing) return res.status(404).json({ error: 'Election not found' });
      if (existing.status !== 'closed') return res.status(400).json({ error: 'Only closed elections can be reopened' });
      const activeElections = Election.getActive();
      for (const ae of activeElections) {
        Election.update(ae.id, { status: 'closed' });
        AuditLog.log({
          action_type: 'election_closed',
          description: `Election "${ae.title}" was auto-closed before reopening "${existing.title}"`,
          election_id: ae.id
        });
      }
      const election = Election.update(id, { status: 'active' });
      AuditLog.log({
        action_type: 'election_reopened',
        description: `Election "${election.title}" was reopened for voting`,
        election_id: id
      });
      res.json(election);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  getStats(req, res) {
    try {
      res.json(Election.getStats());
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

module.exports = electionController;
