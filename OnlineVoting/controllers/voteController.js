const Election = require('../models/Election');
const Voter = require('../models/Voter');
const Ballot = require('../models/Ballot');
const AuditLog = require('../models/AuditLog');

const voteController = {
  kiosk(req, res) {
    try {
      const activeElections = Election.getActive();
      if (activeElections.length === 0) {
        return res.json({ active: false, election: null });
      }
      const election = Election.getById(activeElections[0].id);
      res.json({ active: true, election });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  validate(req, res) {
    try {
      const { access_code } = req.body;
      if (!access_code || typeof access_code !== 'string' || !access_code.trim()) {
        return res.status(400).json({ error: 'Access code is required' });
      }
      const voter = Voter.getByAccessCode(access_code.trim().toUpperCase());
      if (!voter) {
        return res.status(404).json({ error: 'Invalid access code. Please check and try again.' });
      }
      const activeElections = Election.getActive();
      if (activeElections.length === 0) {
        return res.status(400).json({ error: 'No active election at this time.' });
      }
      const election = activeElections[0];
      if (Voter.hasVoted(voter.id, election.id)) {
        return res.status(409).json({ error: 'You have already voted in this election.' });
      }
      election.positions = Election.getById(election.id).positions;
      const safeVoter = { ...voter };
      delete safeVoter.access_code;
      res.json({ voter: safeVoter, election });
    } catch (err) {
      if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') return res.status(409).json({ error: 'Duplicate entry.' });
      if (err.code === 'SQLITE_CONSTRAINT_FOREIGNKEY') return res.status(409).json({ error: 'Referenced record not found.' });
      res.status(500).json({ error: err.message });
    }
  },

  cast(req, res) {
    try {
      const { access_code, selections } = req.body;
      if (!access_code || typeof access_code !== 'string' || !access_code.trim()) {
        return res.status(400).json({ error: 'Access code is required' });
      }
      if (!Array.isArray(selections) || selections.length === 0) {
        return res.status(400).json({ error: 'Selections are required' });
      }
      const voter = Voter.getByAccessCode(access_code.trim().toUpperCase());
      if (!voter) {
        return res.status(404).json({ error: 'Invalid access code.' });
      }
      const activeElections = Election.getActive();
      if (activeElections.length === 0) {
        return res.status(400).json({ error: 'No active election at this time.' });
      }
      const election = activeElections[0];
      if (Voter.hasVoted(voter.id, election.id)) {
        return res.status(409).json({ error: 'You have already voted in this election.' });
      }
      const positions = Election.getById(election.id).positions;
      const positionIds = positions.map(p => p.id);
      for (const sel of selections) {
        if (!positionIds.includes(sel.position_id)) {
          return res.status(400).json({ error: `Invalid position ID: ${sel.position_id}` });
        }
      }
      const receiptCode = Ballot.cast(election.id, voter.id, selections);
      AuditLog.log({
        action_type: 'vote_cast',
        description: `Voter "${voter.name}" (${voter.student_id}) cast their ballot in "${election.title}"`,
        election_id: election.id,
        voter_id: voter.id,
        metadata: { receipt_code: receiptCode }
      });
      res.status(201).json({ receipt_code: receiptCode, election_title: election.title });
    } catch (err) {
      if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') return res.status(409).json({ error: 'You have already voted in this election.' });
      if (err.code === 'SQLITE_CONSTRAINT_FOREIGNKEY') return res.status(409).json({ error: 'Referenced record not found.' });
      res.status(500).json({ error: err.message });
    }
  },

  getReceipt(req, res) {
    try {
      const { receiptCode } = req.params;
      const ballot = Ballot.getByReceipt(receiptCode);
      if (!ballot) return res.status(404).json({ error: 'Receipt not found' });
      res.json(ballot);
    } catch (err) {
      if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') return res.status(409).json({ error: 'Duplicate entry.' });
      if (err.code === 'SQLITE_CONSTRAINT_FOREIGNKEY') return res.status(409).json({ error: 'Referenced record not found.' });
      res.status(500).json({ error: err.message });
    }
  }
};

module.exports = voteController;
