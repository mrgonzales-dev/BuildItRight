import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../api';

export default function Results() {
  const { id } = useParams();
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        setResults(await api.results.getByElection(id));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) return <div className="text-center py-5"><div className="spinner-border" /></div>;
  if (error) {
    return (
      <div style={{ maxWidth: 600, margin: '3rem auto' }}>
        <div className="alert alert-danger">{error}</div>
        <div style={{ textAlign: 'center', marginTop: '1rem' }}>
          <Link to="/" className="btn btn-outline" style={{ textDecoration: 'none' }}>Back to Dashboard</Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 640, margin: '1.5rem auto' }}>
      <div className="page-header">
        <div>
          <Link to="/" className="text-muted" style={{ fontSize: '0.85rem', textDecoration: 'none' }}>&larr; Dashboard</Link>
          <h3>Election Results</h3>
        </div>
      </div>
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <h5>{results.election_title}</h5>
        <p className="text-muted" style={{ margin: 0 }}>Total voters who cast ballots: <strong>{results.total_voters}</strong></p>
      </div>
      {(results.positions || []).map(pos => {
        const maxVotes = pos.candidates.length > 0 ? Math.max(...pos.candidates.map(c => c.votes), 0) : 0;
        return (
          <div key={pos.position_id} className="card" style={{ marginBottom: '1rem' }}>
            <h5 style={{ marginBottom: '0.75rem' }}>{pos.position_title}</h5>
            {!pos.candidates || pos.candidates.length === 0 ? (
              <p className="text-muted" style={{ fontSize: '0.85rem' }}>No candidates</p>
            ) : (
              (pos.candidates || []).map(c => {
                const pct = results.total_voters > 0 ? Math.round((c.votes / results.total_voters) * 100) : 0;
                const isWinner = c.votes === maxVotes && maxVotes > 0;
                return (
                  <div key={c.id} style={{ marginBottom: '0.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                      <span>
                        <strong>{c.name}</strong>
                        {isWinner && <span className="badge badge-active" style={{ marginLeft: '0.5rem' }}>Winner</span>}
                      </span>
                      <span style={{ fontFamily: "'Fira Code', monospace", fontSize: '0.9rem', color: 'var(--primary)' }}>
                        {c.votes} votes ({pct}%)
                      </span>
                    </div>
                    <div style={{ background: 'var(--border)', borderRadius: '4px', height: '6px', overflow: 'hidden' }}>
                      <div
                        style={{
                          width: `${pct}%`,
                          height: '100%',
                          background: isWinner ? 'var(--primary)' : 'var(--primary-light)',
                          borderRadius: '4px',
                          transition: 'width 0.5s ease'
                        }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        );
      })}
    </div>
  );
}
