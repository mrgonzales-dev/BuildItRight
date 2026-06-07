import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activating, setActivating] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        const [s, e] = await Promise.all([api.elections.getStats(), api.elections.getAll()]);
        setStats(s);
        setElections(e);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleActivate = async (electionId) => {
    setActivating(electionId);
    setError(null);
    try {
      await api.elections.activate(electionId);
      const [s, e] = await Promise.all([api.elections.getStats(), api.elections.getAll()]);
      setStats(s);
      setElections(e);
    } catch (err) {
      setError(err.message);
    } finally {
      setActivating(null);
    }
  };

  if (loading) return <div className="text-center py-5"><div className="spinner-border" /></div>;

  const activeElection = elections.find(e => e.status === 'active');
  const upcomingElection = elections.find(e => e.status === 'upcoming');
  const isAdmin = !!sessionStorage.getItem('admin_pin');

  return (
    <div>
      <div className="page-header">
        <h3>Dashboard</h3>
        {isAdmin ? (
          <Link to="/admin/elections" className="btn btn-primary" style={{ textDecoration: 'none' }}>Manage Elections</Link>
        ) : (
          <button className="btn btn-cta" onClick={() => navigate('/student_vote')} style={{ textDecoration: 'none' }}>Vote Now</button>
        )}
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {activeElection && (
        <div className="card" style={{ marginBottom: '1.5rem', borderColor: 'var(--primary)', background: 'var(--primary-bg)', textAlign: 'center' }}>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '0.5rem' }}>
            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <h5 style={{ color: 'var(--primary)' }}>Voting is now open!</h5>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
            <strong>{activeElection.title}</strong> is currently active.
          </p>
          <div className="kiosk-url-box">
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
              Kiosk Voting URL — open this link on voting stations:
            </p>
            <div className="kiosk-url">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '0.5rem', flexShrink: 0 }}>
                <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/>
                <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/>
              </svg>
              <code>/student_vote</code>
            </div>
          </div>
          <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn btn-cta" onClick={() => navigate('/student_vote')}>
              Go to Voting Page
            </button>
          </div>
        </div>
      )}

      {!activeElection && upcomingElection && isAdmin && (
        <div className="card" style={{ marginBottom: '1.5rem', borderColor: 'var(--cta)', textAlign: 'center' }}>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--cta)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '0.5rem' }}>
            <path d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"/>
          </svg>
          <h5 style={{ color: 'var(--cta)' }}>Ready to start voting?</h5>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
            <strong>{upcomingElection.title}</strong> is set up and ready. Open voting to allow students to cast their ballots.
          </p>
          <button
            className="btn btn-cta btn-lg"
            onClick={() => handleActivate(upcomingElection.id)}
            disabled={activating === upcomingElection.id}
          >
            {activating === upcomingElection.id ? 'Opening...' : 'Open Voting Now'}
          </button>
        </div>
      )}

      {!activeElection && !upcomingElection && isAdmin && (
        <div className="alert alert-info">
          No upcoming election. <Link to="/admin/elections">Create one</Link> to get started.
        </div>
      )}

      <div className="stat-cards">
        <div className="stat-card">
          <div className="stat-value">{stats?.totalElections || 0}</div>
          <div className="stat-label">Total Elections</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats?.activeElections || 0}</div>
          <div className="stat-label">Active Elections</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats?.totalVoters || 0}</div>
          <div className="stat-label">Registered Voters</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats?.totalBallots || 0}</div>
          <div className="stat-label">Votes Cast</div>
        </div>
      </div>

      <div className="card">
        <h5 style={{ marginBottom: '1rem' }}>Recent Elections</h5>
        {elections.length === 0 ? (
          <div className="empty-state">
            <p>No elections yet.</p>
            {isAdmin && <Link to="/admin/elections" className="btn btn-primary" style={{ textDecoration: 'none' }}>Create Election</Link>}
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Status</th>
                <th>Dates</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {elections.slice(0, 5).map(e => (
                <tr key={e.id}>
                  <td><strong>{e.title}</strong></td>
                  <td><span className={`badge badge-${e.status}`}>{e.status}</span></td>
                  <td className="text-muted">{e.start_date} to {e.end_date}</td>
                  <td>
                    {e.status === 'closed' && (
                      <Link to={`/elections/${e.id}/results`} className="btn btn-sm btn-outline" style={{ textDecoration: 'none' }}>
                        Results
                      </Link>
                    )}
                    {e.status === 'active' && (
                      <button className="btn btn-sm btn-cta" onClick={() => navigate('/student_vote')}>Vote</button>
                    )}
                    {e.status === 'upcoming' && isAdmin && (
                      <button
                        className="btn btn-sm btn-cta"
                        onClick={() => handleActivate(e.id)}
                        disabled={activating === e.id}
                      >
                        {activating === e.id ? '...' : 'Open'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
