import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../api';

export default function BallotSetup() {
  const { id } = useParams();
  const [election, setElection] = useState(null);
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showPosModal, setShowPosModal] = useState(false);
  const [posForm, setPosForm] = useState({ title: '', display_order: 0 });
  const [editingPos, setEditingPos] = useState(null);

  const [submitting, setSubmitting] = useState(false);

  const [showCandModal, setShowCandModal] = useState(false);
  const [candForm, setCandForm] = useState({ name: '', tagline: '', display_order: 0 });
  const [editingCand, setEditingCand] = useState(null);
  const [selectedPositionId, setSelectedPositionId] = useState(null);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const e = await api.elections.getById(id);
      setElection(e);
      setPositions(e.positions || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [id]);

  const handleAddPosition = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.positions.create(id, posForm);
      setPosForm({ title: '', display_order: 0 });
      setShowPosModal(false);
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditPosition = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.positions.update(editingPos.id, { title: posForm.title });
      setEditingPos(null);
      setShowPosModal(false);
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletePosition = async (posId) => {
    if (!confirm('Delete this position and all its candidates?')) return;
    setSubmitting(true);
    try {
      await api.positions.delete(posId);
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddCandidate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.candidates.create(selectedPositionId, candForm);
      setCandForm({ name: '', tagline: '', display_order: 0 });
      setShowCandModal(false);
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditCandidate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.candidates.update(editingCand.id, candForm);
      setEditingCand(null);
      setShowCandModal(false);
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCandidate = async (candId) => {
    if (!confirm('Delete this candidate?')) return;
    setSubmitting(true);
    try {
      await api.candidates.delete(candId);
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const openCandidateModal = (positionId, candidate = null) => {
    setSelectedPositionId(positionId);
    if (candidate) {
      setEditingCand(candidate);
      setCandForm({ name: candidate.name, tagline: candidate.tagline || '', display_order: candidate.display_order || 0 });
    } else {
      setEditingCand(null);
      setCandForm({ name: '', tagline: '', display_order: 0 });
    }
    setShowCandModal(true);
  };

  const openPositionModal = (position = null) => {
    if (position) {
      setEditingPos(position);
      setPosForm({ title: position.title, display_order: position.display_order || 0 });
    } else {
      setEditingPos(null);
      setPosForm({ title: '', display_order: 0 });
    }
    setShowPosModal(true);
  };

  if (loading) return <div className="text-center py-5"><div className="spinner-border" /></div>;
  if (!election) return <div className="alert alert-danger">Election not found</div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <Link to="/admin/elections" className="text-muted" style={{ fontSize: '0.85rem', textDecoration: 'none' }}>&larr; Elections</Link>
          <h3>{election.title} — Ballot Setup</h3>
        </div>
        <button className="btn btn-primary" onClick={() => openPositionModal()}>Add Position</button>
      </div>
      {error && <div className="alert alert-danger">{error}</div>}
      {positions.length === 0 ? (
        <div className="empty-state">
          <p>No positions yet. Add positions (e.g., President, Vice President) to build the ballot.</p>
        </div>
      ) : (
        positions.map((pos, i) => (
          <div key={pos.id} className="card" style={{ marginBottom: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h5 style={{ margin: 0 }}>{pos.title}</h5>
              <div style={{ display: 'flex', gap: '0.35rem' }}>
                <button className="btn btn-sm btn-outline" onClick={() => openPositionModal(pos)}>Edit</button>
                <button className="btn btn-sm btn-danger" onClick={() => handleDeletePosition(pos.id)}>Delete</button>
              </div>
            </div>
            {pos.candidates && pos.candidates.length > 0 ? (
              <table className="table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Tagline</th>
                    <th width="120">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pos.candidates.map(c => (
                    <tr key={c.id}>
                      <td><strong>{c.name}</strong></td>
                      <td className="text-muted">{c.tagline || '—'}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.35rem' }}>
                          <button className="btn btn-sm btn-outline" onClick={() => openCandidateModal(pos.id, c)}>Edit</button>
                          <button className="btn btn-sm btn-danger" onClick={() => handleDeleteCandidate(c.id)}>Del</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-muted" style={{ fontSize: '0.85rem' }}>No candidates added.</p>
            )}
            <button className="btn btn-sm btn-outline" style={{ marginTop: '0.5rem' }} onClick={() => openCandidateModal(pos.id)}>Add Candidate</button>
          </div>
        ))
      )}

      {showPosModal && (
        <div className="modal-overlay" onClick={() => { setShowPosModal(false); setEditingPos(null); }}>
          <div className="modal-dialog" onClick={e => e.stopPropagation()}>
            <h5>{editingPos ? 'Edit Position' : 'Add Position'}</h5>
            <form onSubmit={editingPos ? handleEditPosition : handleAddPosition}>
              <div className="form-group">
                <label>Position Title</label>
                <input className="form-control" value={posForm.title} onChange={e => setPosForm({ ...posForm, title: e.target.value })} required placeholder="e.g., President" />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-outline" onClick={() => { setShowPosModal(false); setEditingPos(null); }}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>{editingPos ? 'Save' : 'Add'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showCandModal && (
        <div className="modal-overlay" onClick={() => { setShowCandModal(false); setEditingCand(null); }}>
          <div className="modal-dialog" onClick={e => e.stopPropagation()}>
            <h5>{editingCand ? 'Edit Candidate' : 'Add Candidate'}</h5>
            <form onSubmit={editingCand ? handleEditCandidate : handleAddCandidate}>
              <div className="form-group">
                <label>Name</label>
                <input className="form-control" value={candForm.name} onChange={e => setCandForm({ ...candForm, name: e.target.value })} required placeholder="Candidate full name" />
              </div>
              <div className="form-group">
                <label>Tagline</label>
                <input className="form-control" value={candForm.tagline} onChange={e => setCandForm({ ...candForm, tagline: e.target.value })} placeholder="Optional tagline/motto" />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-outline" onClick={() => { setShowCandModal(false); setEditingCand(null); }}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>{editingCand ? 'Save' : 'Add'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
