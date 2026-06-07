import { useState, useEffect } from 'react';
import { api } from '../../api';
import { IconClipboard } from '../../icons';
import { STATUS_COLORS } from '../../constants';

export default function OwnerOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDetail, setShowDetail] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)');
    setIsMobile(mq.matches);
    const handler = (e) => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await api.orders.getAll();
        setOrders(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    if (showDetail === null) return;
    const handleKey = (e) => { if (e.key === 'Escape') setShowDetail(null); };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [showDetail]);

  const handleStatusChange = async (orderId, status) => {
    try {
      const updated = await api.orders.updateStatus(orderId, status);
      setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
    } catch (err) {
      setError(err.message);
    }
  };

  const openDetail = async (order) => {
    setShowDetail(order);
    try {
      const full = await api.orders.getById(order.id);
      setShowDetail(full);
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div>
        <div className="page-header"><h3>Orders</h3></div>
        {[1,2,3,4].map((i) => <div key={i} className="skeleton skeleton-table-row" />)}
      </div>
    );
  }

  const renderMobileCards = () => (
    <div className="order-cards-mobile">
      {orders.map((o) => (
        <div key={o.id} className="order-card">
          <div className="order-card-row">
            <span className="order-card-id">#{o.id}</span>
            <span className="order-card-total">&#8369;{Number(o.total).toLocaleString()}</span>
          </div>
          <div className="order-card-row">
            <div>
              <div style={{ fontSize: '0.82rem' }}>{o.customer_name}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{o.customer_email}</div>
            </div>
            <select className="form-select form-select-sm badge-status" value={o.status}
              onChange={(e) => handleStatusChange(o.id, e.target.value)}
              style={{ width: 110, border: 'none', borderRadius: 12, fontWeight: 500, fontSize: '0.72rem', background: STATUS_COLORS[o.status]?.bg || '#f3f4f6', color: STATUS_COLORS[o.status]?.text || '#6b7280' }}>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div className="order-card-meta">
            <span>{new Date(o.created_at).toLocaleDateString()}</span>
            <button className="btn btn-outline-secondary" onClick={() => openDetail(o)} style={{ fontSize: '0.72rem', padding: '0.3rem 0.6rem' }}>
              View Details
            </button>
          </div>
        </div>
      ))}
    </div>
  );

  const renderDesktopTable = () => (
    <div className="table-container order-table-desktop">
      <table className="table">
        <thead>
          <tr>
            <th>Order #</th>
            <th>Customer</th>
            <th>Total</th>
            <th>Status</th>
            <th>Date</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o.id}>
              <td><strong style={{ fontFamily: 'Fira Code, monospace' }}>#{o.id}</strong></td>
              <td>{o.customer_name}<br /><small style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{o.customer_email}</small></td>
              <td>&#8369;{Number(o.total).toLocaleString()}</td>
              <td>
                <select className="form-select form-select-sm badge-status" value={o.status}
                  onChange={(e) => handleStatusChange(o.id, e.target.value)} style={{ width: 125, border: 'none', borderRadius: 12, fontWeight: 500, background: STATUS_COLORS[o.status]?.bg || '#f3f4f6', color: STATUS_COLORS[o.status]?.text || '#6b7280' }}>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </td>
              <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{new Date(o.created_at).toLocaleDateString()}</td>
              <td>
                <button className="btn btn-outline-secondary" onClick={() => openDetail(o)} style={{ fontSize: '0.75rem' }}>
                  View Details
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div>
      <div className="page-header"><h3>Orders</h3></div>

      {error && <div className="alert alert-danger">{error}</div>}

      {orders.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon"><IconClipboard /></div>
          <p>No orders yet</p>
        </div>
      ) : (
        <>
          {isMobile ? renderMobileCards() : renderDesktopTable()}
        </>
      )}

      {showDetail && (
        <>
          <div className="modal-backdrop" onClick={() => setShowDetail(null)} />
          <div className="modal-dialog-centered" style={{ maxWidth: 550 }}>
            <div className="modal-header">
              <h5 className="modal-title">Order #{showDetail.id}</h5>
              <button className="btn-close" onClick={() => setShowDetail(null)}>&times;</button>
            </div>
            <div className="modal-body">
              <div style={{ marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                <strong>Customer:</strong> {showDetail.customer_name} ({showDetail.customer_email})
              </div>
              <div style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                <span className="badge badge-status" style={{ fontSize: '0.7rem', fontWeight: 500, background: STATUS_COLORS[showDetail.status]?.bg || '#f3f4f6', color: STATUS_COLORS[showDetail.status]?.text || '#6b7280' }}>
                  {showDetail.status.charAt(0).toUpperCase() + showDetail.status.slice(1)}
                </span>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  {new Date(showDetail.created_at).toLocaleString()}
                </span>
              </div>
              <div style={{ marginBottom: '0.75rem', fontSize: '0.9rem' }}>
                <div><strong>Shipping Address:</strong> {showDetail.shipping_address}</div>
                <div><strong>Contact:</strong> {showDetail.contact_number}</div>
              </div>
              {showDetail.items ? (
                <>
                  <table className="table table-sm order-detail-table" style={{ background: '#fff', borderRadius: 'var(--radius-sm)', marginBottom: '0.5rem' }}>
                    <thead>
                      <tr><th>Product</th><th>Qty</th><th>Price</th><th>Subtotal</th></tr>
                    </thead>
                    <tbody>
                      {showDetail.items.map((item, i) => (
                        <tr key={i}>
                          <td data-label="Product">{item.product_name}</td>
                          <td data-label="Qty">{item.quantity}</td>
                          <td data-label="Price">&#8369;{Number(item.price).toLocaleString()}</td>
                          <td data-label="Subtotal">&#8369;{(item.quantity * item.price).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div style={{ textAlign: 'right', fontSize: '1rem', fontWeight: 600 }}>
                    Total: &#8369;{Number(showDetail.total).toLocaleString()}
                  </div>
                </>
              ) : (
                <div className="skeleton skeleton-table-row" />
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline-secondary" onClick={() => setShowDetail(null)}>Close</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
