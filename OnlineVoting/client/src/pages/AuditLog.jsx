import { useState, useEffect } from 'react';
import { api } from '../api';

export default function AuditLog() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({ election_id: '', action_type: '' });
  const [actionTypes, setActionTypes] = useState([]);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {};
      if (filters.election_id) params.election_id = filters.election_id;
      if (filters.action_type) params.action_type = filters.action_type;
      setLogs(await api.auditLog.getAll(params));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      try {
        const types = await api.auditLog.getActionTypes();
        setActionTypes(types);
      } catch (e) { /* ignore */ }
    };
    init();
  }, []);

  useEffect(() => { load(); }, [filters]);

  return (
    <div>
      <div className="page-header">
        <h3>Audit Log</h3>
        <button className="btn btn-outline" onClick={load}>Refresh</button>
      </div>
      {error && <div className="alert alert-danger">{error}</div>}
      <div className="filter-bar">
        <div className="form-group">
          <label>Action Type</label>
          <select className="form-control" value={filters.action_type} onChange={e => setFilters({ ...filters, action_type: e.target.value })}>
            <option value="">All Types</option>
            {actionTypes.map(t => (
              <option key={t.action_type} value={t.action_type}>{t.action_type}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>Election ID</label>
          <input className="form-control" type="number" value={filters.election_id} onChange={e => setFilters({ ...filters, election_id: e.target.value })} placeholder="Filter by election ID" />
        </div>
      </div>
      {loading ? (
        <div className="text-center py-5"><div className="spinner-border" /></div>
      ) : logs.length === 0 ? (
        <div className="empty-state">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
          <p>No audit log entries found.</p>
        </div>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Time</th>
              <th>Action</th>
              <th>Description</th>
              <th>Election ID</th>
              <th>Voter ID</th>
            </tr>
          </thead>
          <tbody>
            {logs.map(log => (
              <tr key={log.id}>
                <td style={{ whiteSpace: 'nowrap', fontSize: '0.8rem', fontFamily: "'Fira Code', monospace" }}>
                  {log.created_at.split('T')[0]}<br/>{log.created_at.split('T')[1]?.split('.')[0] || ''}
                </td>
                <td><span className="badge" style={{ background: 'var(--primary-bg)', color: 'var(--primary)' }}>{log.action_type}</span></td>
                <td style={{ fontSize: '0.85rem' }}>{log.description}</td>
                <td>{log.election_id || '—'}</td>
                <td>{log.voter_id || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
