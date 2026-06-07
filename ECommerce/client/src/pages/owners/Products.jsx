import { useState, useEffect } from 'react';
import { api } from '../../api';
import { IconBox } from '../../icons';

export default function OwnerProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formStock, setFormStock] = useState('');
  const [formCategory, setFormCategory] = useState('');
  const [formImage, setFormImage] = useState(null);
  const [formImagePreview, setFormImagePreview] = useState('');
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState('');

  const loadProducts = async () => {
    try {
      setError(null);
      let data;
      if (categoryFilter) {
        data = await api.products.getByCategory(categoryFilter);
      } else if (search.trim()) {
        data = await api.products.search(search.trim());
      } else {
        data = await api.products.getAll();
      }
      setProducts(data);
    } catch (err) {
      setError(err.message);
    }
  };

  const loadCategories = async () => {
    try { const data = await api.categories.getAll(); setCategories(data); } catch { }
  };

  const load = async () => { setLoading(true); await Promise.all([loadProducts(), loadCategories()]); setLoading(false); };

  useEffect(() => { load(); }, []);
  useEffect(() => { loadProducts(); }, [categoryFilter]);

  useEffect(() => {
    return () => {
      if (formImagePreview && formImagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(formImagePreview);
      }
    };
  }, [formImagePreview]);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') { setShowModal(false); setDeleteId(null); }
    };
    if (showModal || deleteId) document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [showModal, deleteId]);

  const openCreate = () => {
    setEditId(null); setFormName(''); setFormDescription(''); setFormPrice(''); setFormStock('');
    setFormCategory(''); setFormImage(null); setFormImagePreview(''); setFormError(''); setShowModal(true);
  };

  const openEdit = (prod) => {
    setEditId(prod.id); setFormName(prod.name); setFormDescription(prod.description || '');
    setFormPrice(String(prod.price)); setFormStock(String(prod.stock));
    setFormCategory(prod.category_id ? String(prod.category_id) : '');
    setFormImage(null); setFormImagePreview(prod.image_url ? `/${prod.image_url}` : '');
    setFormError(''); setShowModal(true);
  };

  const closeModal = () => { setShowModal(false); setEditId(null); };

  const handleSave = async (e) => {
    e.preventDefault();
    setFormError('');
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('name', formName);
      if (formDescription) formData.append('description', formDescription);
      formData.append('price', formPrice);
      formData.append('stock', formStock || '0');
      if (formCategory) formData.append('category_id', formCategory);
      if (formImage) formData.append('image', formImage);

      if (editId) { await api.products.update(editId, formData); }
      else { await api.products.create(formData); }
      closeModal();
      loadProducts();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try { await api.products.delete(deleteId); setDeleteId(null); loadProducts(); }
    catch (err) { setError(err.message); }
  };

  const handleSearch = (e) => { e.preventDefault(); loadProducts(); };

  if (loading) {
    return (
      <div>
        <div className="page-header"><h3>Products</h3></div>
        {[1,2,3,4,5].map((i) => <div key={i} className="skeleton skeleton-table-row" style={{ marginBottom: 8 }} />)}
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <h3>Products</h3>
        <button className="btn btn-primary" onClick={openCreate}>Add Product</button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="row mb-3">
        <div className="col-md-4">
          <form onSubmit={handleSearch} className="input-group">
            <input type="text" className="form-control" placeholder="Search products..." value={search} onChange={(e) => setSearch(e.target.value)} />
            <button className="btn btn-outline-secondary" type="submit">Search</button>
          </form>
        </div>
        <div className="col-md-3">
          <select className="form-select" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
            <option value="">All Categories</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
      </div>

      {products.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon"><IconBox /></div>
          <p>No products found</p>
          <button className="btn btn-primary" onClick={openCreate}>Add your first product</button>
        </div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th style={{ width: 150 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id}>
                  <td>
                    {p.image_url ? (
                      <img src={`/${p.image_url}`} alt={p.name} style={{ width: 44, height: 44, objectFit: 'cover', borderRadius: 6 }} />
                    ) : (
                      <div style={{ width: 44, height: 44, background: 'var(--border-light)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem', color: 'var(--text-muted)' }}>N/A</div>
                    )}
                  </td>
                  <td><strong>{p.name}</strong></td>
                  <td style={{ color: 'var(--text-muted)' }}>{p.category_name || '—'}</td>
                  <td>₱{Number(p.price).toLocaleString()}</td>
                  <td><span className={`badge ${p.stock > 10 ? 'bg-success' : p.stock > 0 ? 'bg-warning' : 'bg-danger'}`}>{p.stock}</span></td>
                  <td>
                    <button className="btn btn-outline-secondary me-1" onClick={() => openEdit(p)}>Edit</button>
                    <button className="btn btn-outline-danger" onClick={() => setDeleteId(p.id)}>Delete</button>
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
          <div className="modal-dialog-centered" style={{ maxWidth: 500 }}>
            <div className="modal-header">
              <h5 className="modal-title">{editId ? 'Edit Product' : 'Add Product'}</h5>
              <button className="btn-close" onClick={closeModal}>&times;</button>
            </div>
            <form onSubmit={handleSave}>
              <div className="modal-body">
                {formError && <div className="alert alert-danger">{formError}</div>}
                <div className="mb-2">
                  <label className="form-label">Name</label>
                  <input type="text" className="form-control" value={formName} onChange={(e) => setFormName(e.target.value)} required autoFocus />
                </div>
                <div className="mb-2">
                  <label className="form-label">Description</label>
                  <textarea className="form-control" rows="2" value={formDescription} onChange={(e) => setFormDescription(e.target.value)} />
                </div>
                <div className="row mb-2">
                  <div className="col">
                    <label className="form-label">Price (&#8369;)</label>
                    <input type="number" className="form-control" step="0.01" min="0" value={formPrice} onChange={(e) => setFormPrice(e.target.value)} required />
                  </div>
                  <div className="col">
                    <label className="form-label">Stock</label>
                    <input type="number" className="form-control" min="0" value={formStock} onChange={(e) => setFormStock(e.target.value)} />
                  </div>
                </div>
                <div className="mb-2">
                  <label className="form-label">Category</label>
                  <select className="form-select" value={formCategory} onChange={(e) => setFormCategory(e.target.value)}>
                    <option value="">None</option>
                    {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="form-label">Image</label>
                  <input type="file" className="form-control" accept="image/*" onChange={(e) => { setFormImage(e.target.files[0] || null); if (e.target.files[0]) setFormImagePreview(URL.createObjectURL(e.target.files[0])); }} />
                  {formImagePreview && <img src={formImagePreview} alt="Preview" className="img-preview" />}
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
              <h5 className="modal-title">Delete Product</h5>
              <button className="btn-close" onClick={() => setDeleteId(null)}>&times;</button>
            </div>
            <div className="modal-body">
              <p style={{ margin: 0 }}>Are you sure you want to delete this product?</p>
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
