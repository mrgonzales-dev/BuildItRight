const db = require('../config/db');
const crypto = require('crypto');

const Ballot = {
  getByReceipt(receiptCode) {
    const ballot = db.prepare('SELECT * FROM ballots WHERE receipt_code = ?').get(receiptCode);
    if (!ballot) return null;
    const election = db.prepare('SELECT title FROM elections WHERE id = ?').get(ballot.election_id);
    ballot.election_title = election ? election.title : null;
    ballot.selections = db.prepare(
      'SELECT vs.*, p.title as position_title, c.name as candidate_name FROM vote_selections vs JOIN positions p ON p.id = vs.position_id LEFT JOIN candidates c ON c.id = vs.candidate_id WHERE vs.ballot_id = ? ORDER BY p.display_order'
    ).all(ballot.id);
    return ballot;
  },

  generateReceiptCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let result = '';
    for (let i = 0; i < 12; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  },

  cast(electionId, voterId, selections) {
    const receiptCode = Ballot.generateReceiptCode();
    const cast = db.transaction(() => {
      const ballotInfo = db.prepare(
        'INSERT INTO ballots (election_id, voter_id, receipt_code) VALUES (?, ?, ?)'
      ).run(electionId, voterId, receiptCode);

      const insertSel = db.prepare(
        'INSERT INTO vote_selections (ballot_id, position_id, candidate_id) VALUES (?, ?, ?)'
      );
      for (const sel of selections) {
        insertSel.run(ballotInfo.lastInsertRowid, sel.position_id, sel.candidate_id || null);
      }
      return receiptCode;
    });
    return cast();
  }
};

module.exports = Ballot;
