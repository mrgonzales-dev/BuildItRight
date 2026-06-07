const db = require('../config/db');
const Election = require('../models/Election');

const resultsController = {
  getByElectionId(req, res) {
    try {
      const id = Number(req.params.id);
      if (!Number.isInteger(id) || id < 1) {
        return res.status(400).json({ error: 'Invalid election ID' });
      }
      const election = Election.getById(id);
      if (!election) return res.status(404).json({ error: 'Election not found' });
      if (election.status !== 'closed') {
        return res.status(403).json({ error: 'Results are only available after the election is closed.' });
      }
      const totalVoters = db.prepare(
        'SELECT COUNT(*) as count FROM ballots WHERE election_id = ?'
      ).get(id).count;

      const results = [];
      for (const position of election.positions) {
        const tally = db.prepare(
          `SELECT c.id, c.name, c.tagline, COUNT(vs.id) as votes
           FROM candidates c
           LEFT JOIN vote_selections vs ON vs.candidate_id = c.id
             AND vs.position_id = ?
             AND vs.ballot_id IN (SELECT id FROM ballots WHERE election_id = ?)
           WHERE c.position_id = ?
           GROUP BY c.id
           ORDER BY votes DESC`
        ).all(position.id, id, position.id);
        results.push({
          position_id: position.id,
          position_title: position.title,
          candidates: tally
        });
      }
      res.json({ election_title: election.title, total_voters: totalVoters, positions: results });
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

module.exports = resultsController;
