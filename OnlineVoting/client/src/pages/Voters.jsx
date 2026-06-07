import { useState, useEffect, useRef } from 'react';
import { api } from '../api';

export default function Voters() {
  const [voters, setVoters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ student_id: '', name: '', grade_section: '' });
  const fileInputRef = useRef(null);
  const [csvText, setCsvText] = useState('');
  const [showCsv, setShowCsv] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      setVoters(await api.voters.getAll());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const resetForm = () => {
    setForm({ student_id: '', name: '', grade_section: '' });
    setEditing(null);
    setShowModal(false);
  };

  const handleCreate = () => {
    setEditing(null);
    setForm({ student_id: '', name: '', grade_section: '' });
    setShowModal(true);
  };

  const handleEdit = (voter) => {
    setEditing(voter);
    setForm({ student_id: voter.student_id, name: voter.name, grade_section: voter.grade_section });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await api.voters.update(editing.id, form);
      } else {
        await api.voters.create(form);
      }
      resetForm();
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this voter?')) return;
    try {
      await api.voters.delete(id);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCsvImport = async (e) => {
    e.preventDefault();
    setSuccess(null);
    setError(null);
    try {
      const lines = csvText.split(/\r?\n/).filter(line => line.trim());
      if (lines.length < 2) return setError('CSV must have header + at least one data row');
      const header = lines[0].split(',').map(h => h.trim().toLowerCase());
      const sidIdx = header.indexOf('student_id');
      const nameIdx = header.indexOf('name');
      const gradeIdx = header.indexOf('grade_section');
      if (sidIdx === -1 || nameIdx === -1 || gradeIdx === -1) {
        return setError('CSV must have columns: student_id, name, grade_section');
      }
      const rows = [];
      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(',').map(c => c.trim());
        if (cols.length >= 3 && cols[sidIdx] && cols[nameIdx] && cols[gradeIdx]) {
          rows.push({ student_id: cols[sidIdx], name: cols[nameIdx], grade_section: cols[gradeIdx] });
        }
      }
      if (rows.length === 0) return setError('No valid data rows found');
      const created = await api.voters.createBulk(rows);
      setSuccess(`${created.length} voters imported successfully`);
      setCsvText('');
      setShowCsv(false);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setSuccess(null);
    setError(null);
    try {
      const created = await api.voters.uploadCsv(file);
      setSuccess(`${created.length} voters imported from file`);
      load();
    } catch (err) {
      setError(err.message);
    }
    e.target.value = '';
  };

  const handleDownloadTemplate = async () => {
    try {
      const blob = await api.voters.getTemplate();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'voters_template.csv';
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <div className="text-center py-5"><div className="spinner-border" /></div>;

  return (
    <div>
      <div className="page-header">
        <h3>Voters</h3>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button className="btn btn-outline" onClick={handleDownloadTemplate}>Template</button>
          <button className="btn btn-outline" onClick={() => setShowCsv(!showCsv)}>Import CSV</button>
          <input type="file" accept=".csv" onChange={handleFileUpload} ref={fileInputRef} style={{ display: 'none' }} />
          <button className="btn btn-outline" onClick={() => fileInputRef.current?.click()}>Upload File</button>
          <button className="btn btn-primary" onClick={handleCreate}>Add Voter</button>
        </div>
      </div>
      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {showCsv && (
        <div className="card" style={{ marginBottom: '1rem' }}>
          <h5 style={{ marginBottom: '0.75rem' }}>Paste CSV</h5>
          <p className="text-muted" style={{ fontSize: '0.8rem' }}>Format: student_id,name,grade_section (one per line)</p>
          <form onSubmit={handleCsvImport}>
            <textarea
              className="form-control"
              rows="6"
              value={csvText}
              onChange={e => setCsvText(e.target.value)}
              placeholder="student_id,name,grade_section&#10;2024-0001,Juan Dela Cruz,12-A&#10;2024-0002,Maria Santos,12-B"
              style={{ fontFamily: "'Fira Code', monospace", fontSize: '0.85rem' }}
            />
            <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem' }}>
              <button type="submit" className="btn btn-primary" disabled={!csvText.trim()}>Import</button>
              <button type="button" className="btn btn-outline" onClick={() => setShowCsv(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {voters.length === 0 ? (
        <div className="empty-state">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
          <p>No voters registered yet.</p>
        </div>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Student ID</th>
              <th>Name</th>
              <th>Grade/Section</th>
              <th>Access Code</th>
              <th>Voted In</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {voters.map(v => (
              <tr key={v.id}>
                <td style={{ fontFamily: "'Fira Code', monospace", fontSize: '0.85rem' }}>{v.student_id}</td>
                <td>{v.name}</td>
                <td>{v.grade_section}</td>
                <td style={{ fontFamily: "'Fira Code', monospace", fontWeight: 600, color: 'var(--primary)' }}>{v.access_code}</td>
                <td>
                  {v.votedIn && v.votedIn.length > 0 ? (
                    <span className="badge badge-voted">{v.votedIn.map(e => e.title).join(', ')}</span>
                  ) : (
                    <span className="badge badge-pending">Not yet</span>
                  )}
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '0.35rem' }}>
                    <button className="btn btn-sm btn-outline" onClick={() => handleEdit(v)}>Edit</button>
                    <button className="btn btn-sm btn-danger" onClick={() => handleDelete(v.id)}>Del</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={resetForm}>
          <div className="modal-dialog" onClick={e => e.stopPropagation()}>
            <h5>{editing ? 'Edit Voter' : 'Add Voter'}</h5>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Student ID</label>
                <input className="form-control" value={form.student_id} onChange={e => setForm({ ...form, student_id: e.target.value })} required placeholder="e.g., 2024-0001" />
              </div>
              <div className="form-group">
                <label>Full Name</label>
                <input className="form-control" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required placeholder="Full name" />
              </div>
              <div className="form-group">
                <label>Grade &amp; Section</label>
                <input className="form-control" value={form.grade_section} onChange={e => setForm({ ...form, grade_section: e.target.value })} required placeholder="e.g., 12-A" />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-outline" onClick={resetForm}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editing ? 'Save' : 'Add'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
