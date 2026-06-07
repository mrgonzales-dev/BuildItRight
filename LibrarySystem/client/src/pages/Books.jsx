import { useState, useEffect } from 'react';
import { api } from '../api';

export default function Books() {
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [formError, setFormError] = useState(null);
  const [form, setForm] = useState({
    title: '', author: '', isbn: '', publisher: '',
    publication_year: '', category_id: '', total_quantity: 1, available_quantity: 1,
  });

  async function load() {
    try {
      setLoading(true);
      const [b, c] = await Promise.all([api.books.getAll(), api.categories.getAll()]);
      setBooks(b);
      setCategories(c);
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
      const results = await api.books.search(q);
      setBooks(results);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function openCreate() {
    setEditing(null);
    setFormError(null);
    setForm({ title: '', author: '', isbn: '', publisher: '', publication_year: '', category_id: '', total_quantity: 1, available_quantity: 1 });
    setShowModal(true);
  }

  function openEdit(book) {
    setEditing(book);
    setFormError(null);
    setForm({
      title: book.title,
      author: book.author,
      isbn: book.isbn,
      publisher: book.publisher ?? '',
      publication_year: book.publication_year ?? '',
      category_id: book.category_id ?? '',
      total_quantity: book.total_quantity,
      available_quantity: book.available_quantity,
    });
    setShowModal(true);
  }

  async function handleSave(e) {
    e.preventDefault();
    setFormError(null);
    try {
      if (editing) {
        await api.books.update(editing.id, form);
      } else {
        await api.books.create(form);
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
      await api.books.delete(id);
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
        <strong>Error loading books:</strong> {error}
        <p className="mb-0 mt-2 text-muted small">Make sure the backend server is running on port 3000.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header d-flex justify-content-between align-items-center">
        <div>
          <h4>Books</h4>
          <p className="text-muted mb-0">Manage book inventory</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>+ Add Book</button>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="search-wrapper">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              className="form-control"
              placeholder="Search by title, author, or ISBN..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
        </div>
        <div className="table-responsive">
          <table className="table table-hover">
            <thead>
              <tr>
                <th>Title</th>
                <th>Author</th>
                <th>ISBN</th>
                <th>Category</th>
                <th>Available</th>
                <th style={{ width: 100 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-4">
                    <div className="spinner-border spinner-border-sm text-primary me-2" role="status" />
                    Loading...
                  </td>
                </tr>
              ) : books.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-4 text-muted">No books found</td>
                </tr>
              ) : (
                books.map((book) => (
                  <tr key={book.id}>
                    <td className="fw-medium">{book.title}</td>
                    <td>{book.author}</td>
                    <td className="text-muted">{book.isbn}</td>
                    <td><span className="badge bg-light text-dark">{book.category_name || '—'}</span></td>
                    <td>
                      <span className={`badge ${book.available_quantity > 0 ? 'bg-success' : 'bg-danger'}`}>
                        {book.available_quantity} / {book.total_quantity}
                      </span>
                    </td>
                    <td>
                      <div className="d-flex gap-1">
                        <button className="btn btn-sm btn-outline-primary" onClick={() => openEdit(book)}>Edit</button>
                        <button className="btn btn-sm btn-outline-danger" onClick={() => setDeleting(book)}>Delete</button>
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
              <h5 className="modal-title">{editing ? 'Edit Book' : 'Add Book'}</h5>
              <button type="button" className="btn-close" onClick={() => setShowModal(false)} />
            </div>
            <form onSubmit={handleSave}>
              <div className="modal-body">
                {formError && <div className="alert alert-danger">{formError}</div>}
                <div className="row g-3">
                  <div className="col-12">
                    <label className="form-label">Title *</label>
                    <input name="title" className="form-control" value={form.title} onChange={handleChange} required />
                  </div>
                  <div className="col-6">
                    <label className="form-label">Author *</label>
                    <input name="author" className="form-control" value={form.author} onChange={handleChange} required />
                  </div>
                  <div className="col-6">
                    <label className="form-label">ISBN *</label>
                    <input name="isbn" className="form-control" value={form.isbn} onChange={handleChange} required />
                  </div>
                  <div className="col-6">
                    <label className="form-label">Publisher</label>
                    <input name="publisher" className="form-control" value={form.publisher} onChange={handleChange} />
                  </div>
                  <div className="col-6">
                    <label className="form-label">Year</label>
                    <input name="publication_year" type="number" className="form-control" value={form.publication_year} onChange={handleChange} />
                  </div>
                  <div className="col-6">
                    <label className="form-label">Category *</label>
                    <select name="category_id" className="form-select" value={form.category_id} onChange={handleChange} required>
                      <option value="">Select...</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-3">
                    <label className="form-label">Total</label>
                    <input name="total_quantity" type="number" min="1" className="form-control" value={form.total_quantity} onChange={handleChange} />
                  </div>
                  <div className="col-3">
                    <label className="form-label">Available</label>
                    <input name="available_quantity" type="number" min="0" className="form-control" value={form.available_quantity} onChange={handleChange} />
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
              <p className="mb-0">Delete <strong>{deleting?.title}</strong>? This cannot be undone.</p>
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
