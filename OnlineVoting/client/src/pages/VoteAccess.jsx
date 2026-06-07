import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../api';

export default function VoteAccess() {
  const [accessCode, setAccessCode] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const code = accessCode.trim().toUpperCase();
      await api.vote.validate(code);
      navigate(`/vote/access/${code}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 480, margin: '3rem auto' }}>
      <div className="card" style={{ textAlign: 'center' }}>
        <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '1rem' }}>
          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
        <h5 style={{ marginBottom: '0.5rem' }}>Cast Your Vote</h5>
        <p className="text-muted" style={{ marginBottom: '1.5rem', fontSize: '0.9rem' }}>
          Enter your unique access code to access your ballot.
        </p>
        {error && <div className="alert alert-danger" style={{ textAlign: 'left' }}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              className="form-control"
              style={{ textAlign: 'center', fontFamily: "'Fira Code', monospace", fontSize: '1.25rem', letterSpacing: '0.1em', padding: '0.75rem' }}
              value={accessCode}
              onChange={e => setAccessCode(e.target.value.toUpperCase())}
              placeholder="Enter access code"
              autoFocus
              maxLength={12}
            />
          </div>
          <button
            type="submit"
            className="btn btn-cta"
            style={{ width: '100%', padding: '0.75rem', fontSize: '1rem', marginTop: '0.5rem' }}
            disabled={loading || !accessCode.trim()}
          >
            {loading ? 'Verifying...' : 'Access Ballot'}
          </button>
        </form>
        <div style={{ marginTop: '1.5rem' }}>
          <Link to="/" style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Back to Dashboard</Link>
        </div>
      </div>
    </div>
  );
}
