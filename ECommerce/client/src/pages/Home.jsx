import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import { IconSearch, IconImage } from '../icons';
import styles from '../components/ProductCard.module.css';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.products.getAll();
      setProducts(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      setError(null);
      if (search.trim()) {
        const data = await api.products.search(search.trim());
        setProducts(data);
      } else {
        load();
      }
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div>
        <div className="page-header">
          <h3>Shop</h3>
        </div>
        <div className={styles['product-grid']}>
          {[1,2,3,4].map((i) => <div key={i} className="skeleton skeleton-product-card" />)}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <h3>Shop</h3>
        <form onSubmit={handleSearch} className="input-group" style={{ maxWidth: 320 }}>
          <input type="text" className="form-control" placeholder="Search products..." value={search} onChange={(e) => setSearch(e.target.value)} />
          <button className="btn btn-outline-secondary" type="submit">Search</button>
        </form>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {products.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon"><IconSearch /></div>
          <p>No products found</p>
        </div>
      ) : (
        <div className={styles['product-grid']}>
          {products.map((p) => (
            <div key={p.id} className={styles['product-card']}>
              {p.image_url ? (
                <img src={`/${p.image_url}`} alt={p.name} className={styles['product-card-img']} />
              ) : (
                <div className={styles['product-card-img']} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--border-light)' }}>
                  <IconImage />
                </div>
              )}
              <div className={styles['product-card-body']}>
                <div className={styles['category-tag']}>{p.category_name || 'Uncategorized'}</div>
                <h5>{p.name}</h5>
                <div className={styles['desc']}>{p.description || ''}</div>
                <div className={styles['price']}>₱{Number(p.price).toLocaleString()}</div>
                <div className={styles['stock']}>{p.stock > 0 ? `${p.stock} in stock` : 'Sold out'}</div>
                <button
                  className="btn btn-primary w-100"
                  disabled={p.stock === 0}
                  onClick={() => navigate('/login')}
                  style={p.stock === 0 ? { background: 'var(--border)', borderColor: 'var(--border)', color: 'var(--text-muted)', opacity: 0.7 } : {}}
                >
                  {p.stock === 0 ? 'Sold Out' : 'Login to Buy'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
