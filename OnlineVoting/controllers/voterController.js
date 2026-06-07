const Voter = require('../models/Voter');
const AuditLog = require('../models/AuditLog');

function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}

const voterController = {
  getAll(req, res) {
    try {
      res.json(Voter.getAll());
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
        return res.status(400).json({ error: 'Invalid voter ID' });
      }
      const voter = Voter.getById(id);
      if (!voter) return res.status(404).json({ error: 'Voter not found' });
      res.json(voter);
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
      const { student_id, name, grade_section } = req.body;
      if (!student_id || !name || !grade_section) {
        return res.status(400).json({ error: 'Student ID, name, and grade/section are required' });
      }
      const voter = Voter.create({
        student_id: String(student_id).trim(),
        name: String(name).trim(),
        grade_section: String(grade_section).trim()
      });
      AuditLog.log({
        action_type: 'voter_registered',
        description: `Voter "${name.trim()}" (${student_id.trim()}) registered`,
        voter_id: voter.id
      });
      res.status(201).json(voter);
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

  createBulk(req, res) {
    try {
      const { rows } = req.body;
      if (!Array.isArray(rows) || rows.length === 0) {
        return res.status(400).json({ error: 'Rows array is required' });
      }
      for (const row of rows) {
        if (!row.student_id || !row.name || !row.grade_section) {
          return res.status(400).json({ error: 'Each row must have student_id, name, and grade_section' });
        }
      }
      const created = Voter.createBulk(rows);
      AuditLog.log({
        action_type: 'voters_bulk_registered',
        description: `${created.length} voters were bulk registered`
      });
      res.status(201).json(created);
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

  uploadCsv(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'CSV file is required' });
      }
      const content = req.file.buffer.toString('utf-8');
      const lines = content.split(/\r?\n/).filter(line => line.trim());
      if (lines.length < 2) {
        return res.status(400).json({ error: 'CSV must have a header row and at least one data row' });
      }
      const header = parseCSVLine(lines[0]).map(h => h.trim().toLowerCase());
      const sidIdx = header.indexOf('student_id');
      const nameIdx = header.indexOf('name');
      const gradeIdx = header.indexOf('grade_section');
      if (sidIdx === -1 || nameIdx === -1 || gradeIdx === -1) {
        return res.status(400).json({ error: 'CSV must have columns: student_id, name, grade_section' });
      }
      const rows = [];
      for (let i = 1; i < lines.length; i++) {
        const cols = parseCSVLine(lines[i]).map(c => c.trim());
        if (cols.length >= 3) {
          rows.push({
            student_id: cols[sidIdx],
            name: cols[nameIdx],
            grade_section: cols[gradeIdx]
          });
        }
      }
      if (rows.length === 0) {
        return res.status(400).json({ error: 'No valid data rows found in CSV' });
      }
      const created = Voter.createBulk(rows);
      AuditLog.log({
        action_type: 'voters_csv_uploaded',
        description: `${created.length} voters imported via CSV`
      });
      res.status(201).json(created);
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

  getTemplate(req, res) {
    try {
      const csv = 'student_id,name,grade_section\n2024-0001,Juan Dela Cruz,12-A\n2024-0002,Maria Santos,12-B';
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="voters_template.csv"');
      res.send(csv);
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
        return res.status(400).json({ error: 'Invalid voter ID' });
      }
      const voter = Voter.update(id, req.body);
      if (!voter) return res.status(404).json({ error: 'Voter not found' });
      AuditLog.log({
        action_type: 'voter_updated',
        description: `Voter "${voter.name}" updated`,
        voter_id: id
      });
      res.json(voter);
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
        return res.status(400).json({ error: 'Invalid voter ID' });
      }
      const existing = Voter.getById(id);
      if (!existing) return res.status(404).json({ error: 'Voter not found' });
      const name = existing.name;
      const deleted = Voter.delete(id);
      if (deleted) {
        AuditLog.log({
          action_type: 'voter_deleted',
          description: `Voter "${name}" was deleted`,
          voter_id: id
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

module.exports = voterController;
