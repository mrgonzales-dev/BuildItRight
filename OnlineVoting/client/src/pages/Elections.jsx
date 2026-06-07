import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';

export default function Elections() {
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ title: '', description: '', start_date: '', end_date: '' });

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      setElections(await api.elections.getAll());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const resetForm = () => {
    setForm({ title: '', description: '', start_date: '', end_date: '' });
    setEditing(null);
    setShowModal(false);
  };

  const handleCreate = () => {
    setEditing(null);
    setForm({ title: '', description: '', start_date: '', end_date: '' });
    setShowModal(true);
  };

  const handleEdit = (election) => {
    setEditing(election);
    setForm({
      title: election.title,
      description: election.description || '',
      start_date: election.start_date,
      end_date: election.end_date,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await api.elections.update(editing.id, form);
      } else {
        await api.elections.create(form);
      }
      resetForm();
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this election and all its data?')) return;
    try {
      await api.elections.delete(id);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleActivate = async (election) => {
    if (!confirm(`Activate "${election.title}"? This will close any currently active election.`)) return;
    try {
      await api.elections.activate(election.id);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleClose = async (election) => {
    if (!confirm(`Close "${election.title}"? Results will become visible.`)) return;
    try {
      await api.elections.update(election.id, { status: 'closed' });
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleReopen = async (election) => {
    if (!confirm(`Reopen "${election.title}" for voting? Previous ballots will be preserved and new voters can cast votes.`)) return;
    try {
      await api.elections.reopen(election.id);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <div className="text-center py-5"><div className="spinner-border" /></div>;

  return (
    <div>
      <div className="page-header">
        <h3>Elections</h3>
        <button className="btn btn-primary" onClick={handleCreate}>New Election</button>
      </div>
      {error && <div className="alert alert-danger">{error}</div>}
      {elections.length === 0 ? (
        <div className="empty-state">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          <p>No elections yet. Create your first election to get started.</p>
        </div>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Status</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {elections.map(e => (
              <tr key={e.id}>
                <td><strong>{e.title}</strong></td>
                <td><span className={`badge badge-${e.status}`}>{e.status}</span></td>
                <td>{e.start_date}</td>
                <td>{e.end_date}</td>
                <td>
                  <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                    {e.status === 'upcoming' && (
                      <button className="btn btn-sm btn-success" onClick={() => handleActivate(e)}>Activate</button>
                    )}
                    {e.status === 'active' && (
                      <button className="btn btn-sm btn-cta" onClick={() => handleClose(e)}>Close</button>
                    )}
                    {e.status === 'upcoming' && (
                      <>
                        <button className="btn btn-sm btn-outline" onClick={() => handleEdit(e)}>Edit</button>
                        <Link to={`/admin/elections/${e.id}/ballot`} className="btn btn-sm btn-outline" style={{ textDecoration: 'none' }}>Ballot</Link>
                      </>
                    )}
                    {e.status === 'closed' && (
                      <>
                        <button className="btn btn-sm btn-cta" onClick={() => handleReopen(e)}>Reopen</button>
                        <Link to={`/elections/${e.id}/results`} className="btn btn-sm btn-outline" style={{ textDecoration: 'none' }}>Results</Link>
                      </>
                    )}
                    <button className="btn btn-sm btn-danger" onClick={() => handleDelete(e.id)}>Delete</button>
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
            <h5>{editing ? 'Edit Election' : 'New Election'}</h5>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Title</label>
                <input className="form-control" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required placeholder="e.g., SSG Election 2026" />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea className="form-control" rows="2" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Optional description" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Start Date</label>
                  <input className="form-control" type="datetime-local" value={form.start_date} onChange={e => setForm({ ...form, start_date: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>End Date</label>
                  <input className="form-control" type="datetime-local" value={form.end_date} onChange={e => setForm({ ...form, end_date: e.target.value })} required />
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-outline" onClick={resetForm}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editing ? 'Save' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
