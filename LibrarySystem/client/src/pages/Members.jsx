import { useState, useEffect } from 'react';
import { api } from '../api';

export default function Members() {
  const [members, setMembers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [formError, setFormError] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', phone: '', address: '' });

  async function load() {
    try {
      setLoading(true);
      const m = await api.members.getAll();
      setMembers(m);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleSearch(q) {
    setSearch(q);
    if (!q.trim()) return load();
    try {
      setLoading(true);
      setMembers(await api.members.search(q));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function openCreate() {
    setEditing(null);
    setFormError(null);
    setForm({ name: '', email: '', phone: '', address: '' });
    setShowModal(true);
  }

  function openEdit(member) {
    setEditing(member);
    setFormError(null);
    setForm({ name: member.name, email: member.email, phone: member.phone || '', address: member.address || '' });
    setShowModal(true);
  }

  async function handleSave(e) {
    e.preventDefault();
    setFormError(null);
    try {
      if (editing) {
        await api.members.update(editing.id, form);
      } else {
        await api.members.create(form);
      }
      setShowModal(false);
      await load();
    } catch (err) {
      setFormError(err.message);
    }
  }

  async function handleDelete(id) {
    setFormError(null);
    try {
      await api.members.delete(id);
      setDeleting(null);
      await load();
    } catch (err) {
      setFormError(err.message);
    }
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  if (error) {
    return (
      <div className="alert alert-danger">
        <strong>Error loading members:</strong> {error}
        <p className="mb-0 mt-2 text-muted small">Make sure the backend server is running on port 3000.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header d-flex justify-content-between align-items-center">
        <div>
          <h4>Members</h4>
          <p className="text-muted mb-0">Manage library members</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>+ Add Member</button>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="search-wrapper">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              className="form-control"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
        </div>
        <div className="table-responsive">
          <table className="table table-hover">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Member Since</th>
                <th style={{ width: 100 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-4">
                    <div className="spinner-border spinner-border-sm text-primary me-2" role="status" />
                    Loading...
                  </td>
                </tr>
              ) : members.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-4 text-muted">No members found</td>
                </tr>
              ) : (
                members.map((m) => (
                  <tr key={m.id}>
                    <td className="fw-medium">{m.name}</td>
                    <td>{m.email}</td>
                    <td className="text-muted">{m.phone || '—'}</td>
                    <td className="text-muted">{m.membership_date}</td>
                    <td>
                      <div className="d-flex gap-1">
                        <button className="btn btn-sm btn-outline-primary" onClick={() => openEdit(m)}>Edit</button>
                        <button className="btn btn-sm btn-outline-danger" onClick={() => setDeleting(m)}>Delete</button>
                      </div>
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
              <h5 className="modal-title">{editing ? 'Edit Member' : 'Add Member'}</h5>
              <button type="button" className="btn-close" onClick={() => setShowModal(false)} />
            </div>
            <form onSubmit={handleSave}>
              <div className="modal-body">
                {formError && <div className="alert alert-danger">{formError}</div>}
                <div className="row g-3">
                  <div className="col-12">
                    <label className="form-label">Name *</label>
                    <input name="name" className="form-control" value={form.name} onChange={handleChange} required />
                  </div>
                  <div className="col-6">
                    <label className="form-label">Email *</label>
                    <input name="email" type="email" className="form-control" value={form.email} onChange={handleChange} required />
                  </div>
                  <div className="col-6">
                    <label className="form-label">Phone</label>
                    <input name="phone" className="form-control" value={form.phone} onChange={handleChange} />
                  </div>
                  <div className="col-12">
                    <label className="form-label">Address</label>
                    <textarea name="address" className="form-control" rows="2" value={form.address} onChange={handleChange} />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-light" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editing ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      </div>
      {showModal && <div className="modal-backdrop fade show" />}

      <div className={`modal fade${deleting ? ' show d-block' : ''}`} tabIndex="-1" onClick={() => setDeleting(null)}>
        <div className="modal-dialog modal-sm" onClick={(e) => e.stopPropagation()}>
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Confirm Delete</h5>
              <button type="button" className="btn-close" onClick={() => setDeleting(null)} />
            </div>
            <div className="modal-body">
              <p className="mb-0">Delete member <strong>{deleting?.name}</strong>? This cannot be undone.</p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-light" onClick={() => setDeleting(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={() => handleDelete(deleting.id)}>Delete</button>
            </div>
          </div>
        </div>
      </div>
      {deleting && <div className="modal-backdrop fade show" />}
    </div>
  );
}
