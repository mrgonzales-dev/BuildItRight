import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api, setAuthUser } from '../api';
import { IconShop } from '../icons';
import styles from './Auth.module.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await api.users.login({ email, password });
      setAuthUser(user);
      localStorage.setItem('user', JSON.stringify(user));
      navigate(user.role === 'owner' ? '/owners/dashboard' : '/customers/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles['auth-page']}>
      <div className={styles['auth-card']}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.3rem' }}>
          <IconShop />
          <h3 style={{ margin: 0 }}>My Shop</h3>
        </div>
        <p className={styles['auth-subtitle']}>Sign in to your account</p>
        {error && <div className="alert alert-danger">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Email</label>
            <input type="email" className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="owner@shop.com" />
          </div>
          <div className="mb-3">
            <label className="form-label">Password</label>
            <input type="password" className="form-control" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="admin123" />
          </div>
          <button type="submit" className="btn btn-primary w-100" disabled={loading} style={{ padding: '0.65rem' }}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <p className="mt-3 text-center" style={{ fontSize: '0.85rem' }}>
          Don't have an account? <Link to="/register">Register</Link>
        </p>
        <div className="mt-2 text-center">
          <small className="text-muted" style={{ fontSize: '0.75rem' }}>
            Demo: owner@shop.com / admin123 &nbsp;|&nbsp; customer@demo.com / demo123
          </small>
        </div>
      </div>
    </div>
  );
}
