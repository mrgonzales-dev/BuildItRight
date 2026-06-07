import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';

export default function VoteKiosk() {
  const [step, setStep] = useState('loading');
  const [election, setElection] = useState(null);
  const [accessCode, setAccessCode] = useState('');
  const [voter, setVoter] = useState(null);
  const [selections, setSelections] = useState({});
  const [receiptCode, setReceiptCode] = useState(null);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    api.vote.kiosk()
      .then(res => {
        if (res && res.active) {
          setElection(res.election);
          setStep('access_code');
        } else {
          setStep('closed');
        }
      })
      .catch(err => {
        setError(err.message);
        setStep('error');
      });
  }, []);

  const handleValidate = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await api.vote.validate(accessCode);
      setVoter(res?.voter);
      setElection(res?.election);
      const sel = {};
      (res?.election?.positions || []).forEach(p => { sel[p.id] = null; });
      setSelections(sel);
      setStep('ballot');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSelect = (positionId, candidateId) => {
    setSelections(prev => ({ ...prev, [positionId]: candidateId }));
  };

  const handleCast = async () => {
    const selList = Object.entries(selections).map(([positionId, candidateId]) => ({
      position_id: Number(positionId),
      candidate_id: candidateId,
    }));
    if (selList.length === 0) return setError('No positions to vote on');
    setSubmitting(true);
    setError(null);
    try {
      const res = await api.vote.cast(accessCode, selList);
      setReceiptCode(res?.receipt_code);
      setStep('receipt');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDone = () => {
    setStep('access_code');
    setAccessCode('');
    setVoter(null);
    setSelections({});
    setReceiptCode(null);
    setError(null);
    navigate('/student_vote');
  };

  if (step === 'loading') {
    return (
      <div className="kiosk-wrapper">
        <div className="spinner-border" />
      </div>
    );
  }

  if (step === 'closed' || step === 'error') {
    return (
      <div className="kiosk-wrapper">
        <div className="kiosk-card" style={{ textAlign: 'center' }}>
          <svg width="72" height="72" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '1.5rem' }}>
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
          </svg>
          <h2 style={{ marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Voting Is Not Open</h2>
          <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', marginBottom: '0' }}>
            The election is not currently active. Please check back later or contact your election administrator.
          </p>
        </div>
      </div>
    );
  }

  if (step === 'access_code') {
    return (
      <div className="kiosk-wrapper">
        <div className="kiosk-card" style={{ textAlign: 'center' }}>
          {election && (
            <div className="kiosk-election-banner">
              <h4 style={{ margin: 0, color: 'var(--primary)' }}>{election.title}</h4>
              <span className="badge badge-active" style={{ marginTop: '0.25rem' }}>Voting Open</span>
            </div>
          )}
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '0.75rem', marginTop: '0.5rem' }}>
            <path d="M15 7h2a5 5 0 015 5 5 5 0 01-5 5h-2m-6 0H7a5 5 0 01-5-5 5 5 0 015-5h2M8 12h8"/>
          </svg>
          <h5 style={{ marginBottom: '0.5rem' }}>Enter Your Access Code</h5>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
            Type your unique access code to open your ballot.
          </p>
          {error && <div className="alert alert-danger" style={{ textAlign: 'left' }}>{error}</div>}
          <form onSubmit={handleValidate}>
            <div className="form-group">
              <input
                className="form-control kiosk-code-input"
                value={accessCode}
                onChange={e => setAccessCode(e.target.value.toUpperCase())}
                placeholder="Access Code"
                autoFocus
                maxLength={12}
              />
            </div>
            <button
              type="submit"
              className="btn btn-cta btn-lg"
              style={{ width: '100%', padding: '0.85rem', fontSize: '1.1rem' }}
              disabled={submitting || !accessCode.trim()}
            >
              {submitting ? 'Verifying...' : 'Open Ballot'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (step === 'ballot') {
    return (
      <div className="kiosk-wrapper">
        <div className="kiosk-card" style={{ maxWidth: 680 }}>
          <div className="kiosk-election-banner">
            <h4 style={{ margin: 0, color: 'var(--primary)' }}>{election.title}</h4>
            <span className="badge badge-active" style={{ marginTop: '0.25rem' }}>Voting Open</span>
          </div>
          <div style={{ padding: '0.5rem 0', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            Voting as <strong>{voter.name}</strong> ({voter.student_id})
          </div>
          {error && <div className="alert alert-danger">{error}</div>}
          {election.positions.map(pos => (
            <div key={pos.id} className="card" style={{ marginBottom: '1rem' }}>
              <h5 style={{ marginBottom: '0.75rem' }}>{pos.title}</h5>
              {pos.candidates && pos.candidates.length > 0 ? (
                <>
                  {pos.candidates.map(c => (
                    <div
                      key={c.id}
                      className={`radio-group ${selections[pos.id] === c.id ? 'selected' : ''}`}
                      onClick={() => handleSelect(pos.id, c.id)}
                    >
                      <input
                        type="radio"
                        name={`pos-${pos.id}`}
                        checked={selections[pos.id] === c.id}
                        onChange={() => handleSelect(pos.id, c.id)}
                      />
                      <div>
                        <strong>{c.name}</strong>
                        {c.tagline && <span style={{ color: 'var(--text-secondary)', marginLeft: '0.5rem', fontSize: '0.85rem' }}>— {c.tagline}</span>}
                      </div>
                    </div>
                  ))}
                  {selections[pos.id] !== null && (
                    <div className="radio-group" onClick={() => handleSelect(pos.id, null)}>
                      <input
                        type="radio"
                        name={`pos-${pos.id}`}
                        checked={selections[pos.id] === null}
                        onChange={() => handleSelect(pos.id, null)}
                      />
                      <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Clear selection (skip)</span>
                    </div>
                  )}
                </>
              ) : (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No candidates for this position</p>
              )}
            </div>
          ))}
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
            <button className="btn btn-outline" onClick={() => { setStep('access_code'); setError(null); }}>
              Cancel
            </button>
            <button
              className="btn btn-cta"
              onClick={handleCast}
              disabled={submitting}
            >
              {submitting ? 'Submitting...' : 'Submit Ballot'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'receipt') {
    return (
      <div className="kiosk-wrapper">
        <div className="kiosk-card" style={{ maxWidth: 520, textAlign: 'center' }}>
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '1rem' }}>
            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <h4 style={{ marginBottom: '0.5rem' }}>Vote Submitted!</h4>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
            Your vote has been recorded for <strong>{election.title}</strong>.
          </p>
          <div className="receipt-box" style={{ marginBottom: '1.25rem' }}>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Your Receipt Code</p>
            <div className="receipt-code">{receiptCode}</div>
            <p style={{ marginTop: '0.75rem', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: 0 }}>
              Keep this code to verify your vote was counted.
            </p>
          </div>
          <button className="btn btn-cta btn-lg" onClick={handleDone} style={{ padding: '0.85rem 2rem', fontSize: '1.1rem' }}>
            Done — Next Voter
          </button>
        </div>
      </div>
    );
  }

  return null;
}
