import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../api';

export default function VoteReceipt() {
  const { receiptCode } = useParams();
  const [receipt, setReceipt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        setReceipt(await api.vote.getReceipt(receiptCode));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [receiptCode]);

  if (loading) return <div className="text-center py-5"><div className="spinner-border" /></div>;
  if (error) {
    return (
      <div style={{ maxWidth: 480, margin: '3rem auto' }}>
        <div className="alert alert-danger">{error}</div>
        <div style={{ textAlign: 'center', marginTop: '1rem' }}>
          <Link to="/" className="btn btn-outline" style={{ textDecoration: 'none' }}>Back to Dashboard</Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 520, margin: '3rem auto' }}>
      <div className="card" style={{ textAlign: 'center' }}>
        <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '1rem' }}>
          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
        <h5>Vote Submitted Successfully</h5>
        <p className="text-muted" style={{ marginBottom: '1.5rem', fontSize: '0.9rem' }}>
          Your vote has been recorded for <strong>{receipt.election_title}</strong>.
        </p>
        <div className="receipt-box">
          <p className="text-muted" style={{ fontSize: '0.8rem', marginBottom: '0.5rem' }}>Your Receipt Code</p>
          <div className="receipt-code">{receiptCode}</div>
          <p className="text-muted" style={{ marginTop: '0.75rem', fontSize: '0.75rem', marginBottom: 0 }}>
            Keep this code to verify your vote was counted. It does not reveal who you voted for.
          </p>
        </div>
        <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <Link to="/" className="btn btn-primary" style={{ textDecoration: 'none' }}>Back to Dashboard</Link>
        </div>
      </div>
    </div>
  );
}
