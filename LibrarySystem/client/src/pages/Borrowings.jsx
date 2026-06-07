import { useState, useEffect } from 'react';
import { api } from '../api';

export default function Borrowings() {
  const [borrowings, setBorrowings] = useState([]);
  const [books, setBooks] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showOverdue, setShowOverdue] = useState(false);
  const [formError, setFormError] = useState(null);
  const [form, setForm] = useState({ book_id: '', member_id: '', due_date: '' });

  async function loadAll() {
    try {
      setLoading(true);
      const [b, m, br] = await Promise.all([
        api.books.getAll(),
        api.members.getAll(),
        showOverdue ? api.borrowings.getOverdue() : api.borrowings.getAll(),
      ]);
      setBooks(b);
      setMembers(m);
      setBorrowings(br);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadAll(); }, [showOverdue]);

  function openCreate() {
    setFormError(null);
    setForm({ book_id: '', member_id: '', due_date: '' });
    setShowModal(true);
  }

  async function handleSave(e) {
    e.preventDefault();
    setFormError(null);
    try {
      await api.borrowings.create(form);
      setShowModal(false);
      await loadAll();
    } catch (err) {
      setFormError(err.message);
    }
  }

  async function handleReturn(id) {
    setFormError(null);
    try {
      await api.borrowings.returnBook(id);
      await loadAll();
    } catch (err) {
      setFormError(err.message);
    }
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function statusBadge(status) {
    const map = {
      borrowed: 'bg-warning text-dark',
      returned: 'bg-success',
      overdue: 'bg-danger',
    };
    return <span className={`badge badge-status ${map[status] || 'bg-secondary'}`}>{status}</span>;
  }

  if (error) {
    return (
      <div className="alert alert-danger">
        <strong>Error loading borrowings:</strong> {error}
        <p className="mb-0 mt-2 text-muted small">Make sure the backend server is running on port 3000.</p>
      </div>
    );
  }

  const availableBooks = books.filter((b) => b.available_quantity > 0);

  return (
    <div>
      <div className="page-header d-flex justify-content-between align-items-center">
        <div>
          <h4>Borrowings</h4>
          <p className="text-muted mb-0">Track book loans and returns</p>
        </div>
        <div className="d-flex gap-2">
          <div className="form-check form-switch mb-0 d-flex align-items-center">
            <input
              className="form-check-input mt-0 me-2"
              type="checkbox"
              id="overdueOnly"
              checked={showOverdue}
              onChange={() => setShowOverdue(!showOverdue)}
            />
            <label className="form-check-label small" htmlFor="overdueOnly">Overdue only</label>
          </div>
          <button className="btn btn-primary" onClick={openCreate}>+ New Borrowing</button>
        </div>
      </div>

      <div className="card">
        <div className="table-responsive">
          <table className="table table-hover">
            <thead>
              <tr>
                <th>Book</th>
                <th>Member</th>
                <th>Borrow Date</th>
                <th>Due Date</th>
                <th>Return Date</th>
                <th>Status</th>
                <th style={{ width: 80 }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-4">
                    <div className="spinner-border spinner-border-sm text-primary me-2" role="status" />
                    Loading...
                  </td>
                </tr>
              ) : borrowings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-4 text-muted">
                    {showOverdue ? 'No overdue borrowings' : 'No borrowings yet'}
                  </td>
                </tr>
              ) : (
                borrowings.map((br) => (
                  <tr key={br.id}>
                    <td className="fw-medium">{br.book_title}</td>
                    <td>{br.member_name}</td>
                    <td className="text-muted">{br.borrow_date}</td>
                    <td className="text-muted">{br.due_date}</td>
                    <td className="text-muted">{br.return_date || '—'}</td>
                    <td>{statusBadge(br.status)}</td>
                    <td>
                      {br.status === 'borrowed' || br.status === 'overdue' ? (
                        <button className="btn btn-sm btn-success" onClick={() => handleReturn(br.id)}>Return</button>
                      ) : (
                        <span className="text-muted small">—</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className={`modal fade${showModal ? ' show d-block' : ''}`} tabIndex="-1" onClick={() => setShowModal(false)}>
        <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">New Borrowing</h5>
              <button type="button" className="btn-close" onClick={() => setShowModal(false)} />
            </div>
            <form onSubmit={handleSave}>
              <div className="modal-body">
                {formError && <div className="alert alert-danger">{formError}</div>}
                <div className="row g-3">
                  <div className="col-12">
                    <label className="form-label">Book *</label>
                    <select name="book_id" className="form-select" value={form.book_id} onChange={handleChange} required>
                      <option value="">Select a book...</option>
                      {availableBooks.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.title} ({b.available_quantity} available)
                        </option>
                      ))}
                    </select>
                    {availableBooks.length === 0 && (
                      <small className="text-danger">No books currently available</small>
                    )}
                  </div>
                  <div className="col-12">
                    <label className="form-label">Member *</label>
                    <select name="member_id" className="form-select" value={form.member_id} onChange={handleChange} required>
                      <option value="">Select a member...</option>
                      {members.map((m) => (
                        <option key={m.id} value={m.id}>{m.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-12">
                    <label className="form-label">Due Date *</label>
                    <input name="due_date" type="date" className="form-control" value={form.due_date} onChange={handleChange} required />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-light" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Borrow</button>
              </div>
            </form>
          </div>
        </div>
      </div>
      {showModal && <div className="modal-backdrop fade show" />}
    </div>
  );
}
