import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../api';

export default function VoteBallot() {
  const { accessCode } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [selections, setSelections] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const validate = async () => {
      try {
        const res = await api.vote.validate(accessCode);
        setData(res);
        const sel = {};
        res.election.positions.forEach(p => { sel[p.id] = null; });
        setSelections(sel);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    validate();
  }, [accessCode]);

  const handleSelect = (positionId, candidateId) => {
    setSelections(prev => ({ ...prev, [positionId]: candidateId }));
  };

  const handleSubmit = async () => {
    const selList = Object.entries(selections).map(([position_id, candidate_id]) => ({
      position_id: Number(position_id),
      candidate_id: candidate_id,
    }));
    if (selList.length === 0) return setError('No positions to vote on');
    setSubmitting(true);
    setError(null);
    try {
      const res = await api.vote.cast(accessCode, selList);
      navigate(`/vote/receipt/${res.receipt_code}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="text-center py-5"><div className="spinner-border" /></div>;
  if (error) {
    return (
      <div style={{ maxWidth: 480, margin: '3rem auto' }}>
        <div className="alert alert-danger">{error}</div>
        <div style={{ textAlign: 'center', marginTop: '1rem' }}>
          <button className="btn btn-outline" onClick={() => navigate('/vote')}>Try Again</button>
        </div>
      </div>
    );
  }

  const voter = data?.voter;
  const election = data?.election;

  return (
    <div style={{ maxWidth: 640, margin: '1.5rem auto' }}>
      <div className="card" style={{ marginBottom: '1rem' }}>
        <h5>{election.title}</h5>
        <p className="text-muted" style={{ fontSize: '0.85rem', margin: 0 }}>
          Voter: <strong>{voter.name}</strong> ({voter.student_id}) — {voter.grade_section}
        </p>
      </div>
      {error && <div className="alert alert-danger">{error}</div>}
      {(election.positions || []).map(pos => (
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
                    {c.tagline && <span className="text-muted" style={{ marginLeft: '0.5rem', fontSize: '0.85rem' }}>— {c.tagline}</span>}
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
                  <span className="text-muted" style={{ fontStyle: 'italic' }}>Clear selection (skip)</span>
                </div>
              )}
            </>
          ) : (
            <p className="text-muted" style={{ fontSize: '0.85rem' }}>No candidates for this position</p>
          )}
        </div>
      ))}
      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
        <button className="btn btn-outline" onClick={() => navigate('/vote')}>Cancel</button>
        <button
          className="btn btn-cta"
          onClick={handleSubmit}
          disabled={submitting}
        >
          {submitting ? 'Submitting...' : 'Submit Ballot'}
        </button>
      </div>
    </div>
  );
}
