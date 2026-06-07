import { useState, useEffect } from 'react';
import { api } from '../api';

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [form, setForm] = useState({ name: '', description: '' });
  const [formError, setFormError] = useState(null);

  async function load() {
    try {
      setLoading(true);
      setCategories(await api.categories.getAll());
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  function openCreate() {
    setEditing(null);
    setForm({ name: '', description: '' });
    setFormError(null);
    setShowModal(true);
  }

  function openEdit(cat) {
    setEditing(cat);
    setForm({ name: cat.name, description: cat.description || '' });
    setFormError(null);
    setShowModal(true);
  }

  async function handleSave(e) {
    e.preventDefault();
    try {
      if (editing) {
        await api.categories.update(editing.id, form);
      } else {
        await api.categories.create(form);
      }
      setShowModal(false);
      await load();
    } catch (err) {
      setFormError(err.message);
    }
  }

  async function handleDelete(id) {
    try {
      await api.categories.delete(id);
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
        <strong>Error loading categories:</strong> {error}
        <p className="mb-0 mt-2 text-muted small">Make sure the backend server is running on port 3000.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header d-flex justify-content-between align-items-center">
        <div>
          <h4>Categories</h4>
          <p className="text-muted mb-0">Organize books by category</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>+ Add Category</button>
      </div>

      <div className="card">
        <div className="table-responsive">
          <table className="table table-hover">
            <thead>
              <tr>
                <th>Name</th>
                <th>Description</th>
                <th style={{ width: 100 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={3} className="text-center py-4">
                    <div className="spinner-border spinner-border-sm text-primary me-2" role="status" />
                    Loading...
                  </td>
                </tr>
              ) : categories.length === 0 ? (
                <tr>
                  <td colSpan={3} className="text-center py-4 text-muted">No categories yet</td>
                </tr>
              ) : (
                categories.map((cat) => (
                  <tr key={cat.id}>
                    <td className="fw-medium">{cat.name}</td>
                    <td className="text-muted">{cat.description || '—'}</td>
                    <td>
                      <div className="d-flex gap-1">
                        <button className="btn btn-sm btn-outline-primary" onClick={() => openEdit(cat)}>Edit</button>
                        <button className="btn btn-sm btn-outline-danger" onClick={() => setDeleting(cat)}>Delete</button>
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
              <h5 className="modal-title">{editing ? 'Edit Category' : 'Add Category'}</h5>
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
                  <div className="col-12">
                    <label className="form-label">Description</label>
                    <textarea name="description" className="form-control" rows="2" value={form.description} onChange={handleChange} />
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
              <p className="mb-0">Delete category <strong>{deleting?.name}</strong>? Books in this category may be affected.</p>
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
