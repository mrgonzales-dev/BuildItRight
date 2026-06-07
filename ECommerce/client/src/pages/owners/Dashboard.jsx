import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api';
import { IconBox, IconClipboard, IconUser, IconClock } from '../../icons';
import { STATUS_COLORS } from '../../constants';
import styles from './OwnerDashboard.module.css';

export default function OwnerDashboard() {
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        const [products, orders] = await Promise.all([api.products.getAll(), api.orders.getAll()]);
        const customers = new Set(orders.map((o) => o.user_id)).size;
        const revenue = orders.reduce((sum, o) => sum + o.total, 0);
        const pending = orders.filter((o) => o.status === 'pending').length;
        const delivered = orders.filter((o) => o.status === 'delivered').length;
        const lowStock = products.filter((p) => p.stock > 0 && p.stock <= 10).length;
        const outOfStock = products.filter((p) => p.stock === 0).length;

        setStats({
          products: products.length,
          orders: orders.length,
          customers,
          revenue,
          pending,
          delivered,
          lowStock,
          outOfStock,
        });
        setRecentOrders(orders.slice(0, 5));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div>
        <div className="page-header"><h3>Dashboard</h3></div>
        <div className={styles['stat-cards']}>
          {[1,2,3,4].map((i) => <div key={i} className="skeleton" style={{ height: 120, borderRadius: 'var(--radius)' }} />)}
        </div>
      </div>
    );
  }

  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div>
      <div className="page-header">
        <h3>Dashboard</h3>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </span>
      </div>

      <div className={styles['stat-cards']} style={{ marginBottom: '0.5rem' }}>
        <div className={styles['stat-card']} style={{ borderTop: '3px solid var(--primary)' }}>
          <div className={styles['stat-icon-circle']} style={{ background: 'rgba(23,23,23,0.06)', color: 'var(--primary)' }}>
            <IconBox />
          </div>
          <div className={styles['stat-content']}>
            <div className={styles['stat-label']}>Total Products</div>
            <div className={styles['stat-value']}>{stats.products}</div>
            <div className={styles['stat-detail']}>
              {stats.outOfStock > 0 && <span style={{ color: 'var(--red)' }}>{stats.outOfStock} out of stock</span>}
              {stats.lowStock > 0 && <span style={{ color: 'var(--orange)' }}>{stats.lowStock} low stock</span>}
              {stats.outOfStock === 0 && stats.lowStock === 0 && <span style={{ color: 'var(--green)' }}>All stocked</span>}
            </div>
          </div>
        </div>

        <div className={styles['stat-card']} style={{ borderTop: '3px solid var(--blue)' }}>
          <div className={styles['stat-icon-circle']} style={{ background: 'rgba(59,130,246,0.08)', color: 'var(--blue)' }}>
            <IconClipboard />
          </div>
          <div className={styles['stat-content']}>
            <div className={styles['stat-label']}>Total Orders</div>
            <div className={styles['stat-value']}>{stats.orders}</div>
            <div className={styles['stat-detail']}>
              <span style={{ color: 'var(--green)' }}>{stats.delivered} delivered</span>
              {stats.pending > 0 && <span style={{ color: 'var(--orange)', marginLeft: 8 }}>{stats.pending} pending</span>}
            </div>
          </div>
        </div>

        <div className={styles['stat-card']} style={{ borderTop: '3px solid var(--purple)' }}>
          <div className={styles['stat-icon-circle']} style={{ background: 'rgba(139,92,246,0.08)', color: 'var(--purple)' }}>
            <IconUser />
          </div>
          <div className={styles['stat-content']}>
            <div className={styles['stat-label']}>Customers</div>
            <div className={styles['stat-value']}>{stats.customers}</div>
            <div className={styles['stat-detail']}>
              <span style={{ color: 'var(--text-muted)' }}>Unique buyers</span>
            </div>
          </div>
        </div>

        <div className={`${styles['stat-card']} ${styles.highlight}`} style={{ borderTop: '3px solid var(--accent)' }}>
          <div className={styles['stat-icon-circle']} style={{ background: 'rgba(212,175,55,0.12)', color: 'var(--accent)' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: 700 }}>₱</span>
          </div>
          <div className={styles['stat-content']}>
            <div className={styles['stat-label']}>Revenue</div>
            <div className={styles['stat-value']}>₱{stats.revenue.toLocaleString()}</div>
            <div className={styles['stat-detail']}>
              <span style={{ color: 'var(--text-muted)' }}>
                ~₱{stats.orders > 0 ? Math.round(stats.revenue / stats.orders).toLocaleString() : 0} avg / order
              </span>
            </div>
          </div>
        </div>
      </div>

      {stats.pending > 0 && (
        <div className={styles['dashboard-alert']}>
          <span style={{ color: 'var(--orange)', display: 'flex' }}><IconClock /></span>
          <span><strong>{stats.pending}</strong> order{stats.pending > 1 ? 's' : ''} waiting to be processed</span>
          <button className="btn btn-outline-secondary" onClick={() => navigate('/owners/orders')} style={{ marginLeft: 'auto', fontSize: '0.75rem' }}>
            View Orders
          </button>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1rem', marginTop: '1.5rem' }}>
        <div className={styles['dashboard-section']}>
          <div className={styles['section-header']}>
            <h4>Recent Orders</h4>
            <button className="btn btn-outline-secondary" onClick={() => navigate('/owners/orders')} style={{ fontSize: '0.75rem' }}>View All</button>
          </div>
          {recentOrders.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', padding: '1rem 0' }}>No orders yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {recentOrders.map((o) => (
                <div key={o.id} className={styles['order-row']} onClick={() => navigate('/owners/orders')} style={{ cursor: 'pointer' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div className={styles['order-avatar']}>
                      {(o.customer_name || '?')[0].toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontWeight: 500, fontSize: '0.85rem' }}>{o.customer_name || 'Unknown'}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                        {new Date(o.created_at).toLocaleDateString()} · #{o.id}
                      </div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 600, fontSize: '0.85rem', fontFamily: 'Fira Code, monospace' }}>
                      ₱{Number(o.total).toLocaleString()}
                    </div>
                    <span style={{
                      fontSize: '0.65rem',
                      fontWeight: 600,
                      padding: '0.15rem 0.5rem',
                      borderRadius: 10,
                      background: STATUS_COLORS[o.status]?.bg || '#f3f4f6',
                      color: STATUS_COLORS[o.status]?.text || '#6b7280',
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                    }}>
                      {o.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className={styles['dashboard-section']}>
          <div className={styles['section-header']}>
            <h4>Inventory Health</h4>
          </div>
          {stats.products === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', padding: '1rem 0' }}>No products in inventory.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className={styles['inventory-bar']}>
                <div className={styles['inventory-bar-label']}>
                  <span>In Stock</span>
                  <span style={{ fontWeight: 600 }}>{stats.products - stats.outOfStock}</span>
                </div>
                <div className={styles['inventory-bar-track']}>
                  <div className={styles['inventory-bar-fill']} style={{ width: `${stats.products > 0 ? ((stats.products - stats.outOfStock) / stats.products) * 100 : 0}%`, background: 'var(--green)' }} />
                </div>
              </div>
              {stats.lowStock > 0 && (
                <div className={styles['inventory-bar']}>
                  <div className={styles['inventory-bar-label']}>
                    <span>Low Stock</span>
                    <span style={{ fontWeight: 600, color: 'var(--orange)' }}>{stats.lowStock}</span>
                  </div>
                  <div className={styles['inventory-bar-track']}>
                    <div className={styles['inventory-bar-fill']} style={{ width: `${(stats.lowStock / stats.products) * 100}%`, background: 'var(--orange)' }} />
                  </div>
                </div>
              )}
              {stats.outOfStock > 0 && (
                <div className={styles['inventory-bar']}>
                  <div className={styles['inventory-bar-label']}>
                    <span>Out of Stock</span>
                    <span style={{ fontWeight: 600, color: 'var(--red)' }}>{stats.outOfStock}</span>
                  </div>
                  <div className={styles['inventory-bar-track']}>
                    <div className={styles['inventory-bar-fill']} style={{ width: `${(stats.outOfStock / stats.products) * 100}%`, background: 'var(--red)' }} />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
