import { useState, useEffect } from 'react';
import { api } from '../../api';
import { IconFolder } from '../../icons';

export default function OwnerCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.categories.getAll();
      setCategories(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') {
        setShowModal(false);
        setDeleteId(null);
      }
    };
    if (showModal || deleteId) document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [showModal, deleteId]);

  const openCreate = () => { setEditId(null); setFormName(''); setFormDescription(''); setFormError(''); setShowModal(true); };
  const openEdit = (cat) => { setEditId(cat.id); setFormName(cat.name); setFormDescription(cat.description || ''); setFormError(''); setShowModal(true); };
  const closeModal = () => { setShowModal(false); setEditId(null); };

  const handleSave = async (e) => {
    e.preventDefault();
    setFormError('');
    setSaving(true);
    try {
      if (editId) {
        await api.categories.update(editId, { name: formName, description: formDescription });
      } else {
        await api.categories.create({ name: formName, description: formDescription });
      }
      closeModal();
      load();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await api.categories.delete(deleteId);
      setDeleteId(null);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div>
        <div className="page-header"><h3>Categories</h3></div>
        {[1,2,3,4].map((i) => <div key={i} className="skeleton skeleton-table-row" />)}
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <h3>Categories</h3>
        <button className="btn btn-primary" onClick={openCreate}>Add Category</button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {categories.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon"><IconFolder /></div>
          <p>No categories yet</p>
          <button className="btn btn-primary" onClick={openCreate}>Add your first category</button>
        </div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Description</th>
                <th style={{ width: 150 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => (
                <tr key={cat.id}>
                  <td><strong>{cat.name}</strong></td>
                  <td style={{ color: 'var(--text-muted)' }}>{cat.description || '—'}</td>
                  <td>
                    <button className="btn btn-outline-secondary me-1" onClick={() => openEdit(cat)}>Edit</button>
                    <button className="btn btn-outline-danger" onClick={() => setDeleteId(cat.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <>
          <div className="modal-backdrop" onClick={closeModal} />
          <div className="modal-dialog-centered">
            <div className="modal-header">
              <h5 className="modal-title">{editId ? 'Edit Category' : 'Add Category'}</h5>
              <button className="btn-close" onClick={closeModal}>&times;</button>
            </div>
            <form onSubmit={handleSave}>
              <div className="modal-body">
                {formError && <div className="alert alert-danger">{formError}</div>}
                <div className="mb-2">
                  <label className="form-label">Name</label>
                  <input type="text" className="form-control" value={formName} onChange={(e) => setFormName(e.target.value)} required autoFocus />
                </div>
                <div>
                  <label className="form-label">Description</label>
                  <textarea className="form-control" rows="3" value={formDescription} onChange={(e) => setFormDescription(e.target.value)} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline-secondary" onClick={closeModal}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
              </div>
            </form>
          </div>
        </>
      )}

      {deleteId && (
        <>
          <div className="modal-backdrop" onClick={() => setDeleteId(null)} />
          <div className="modal-dialog-centered" style={{ maxWidth: 380 }}>
            <div className="modal-header">
              <h5 className="modal-title">Delete Category</h5>
              <button className="btn-close" onClick={() => setDeleteId(null)}>&times;</button>
            </div>
            <div className="modal-body">
              <p style={{ margin: 0 }}>Are you sure you want to delete this category?</p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline-secondary" onClick={() => setDeleteId(null)}>Cancel</button>
              <button className="btn btn-outline-danger" onClick={handleDelete}>Delete</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
