import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api';
import { IconCart } from '../../icons';

export default function CustomerCart({ onCartChange }) {
  const [cartData, setCartData] = useState({ items: [], total: 0, count: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [shippingAddress, setShippingAddress] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [checkingOut, setCheckingOut] = useState(false);
  const navigate = useNavigate();

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.cart.get();
      setCartData(data);
      onCartChange(data.count);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleQtyChange = async (id, qty) => {
    try {
      const result = await api.cart.update(id, { quantity: qty });
      setCartData({ items: result.items, total: result.total, count: result.count });
      onCartChange(result.count);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleRemove = async (id) => {
    try {
      const result = await api.cart.remove(id);
      setCartData({ items: result.items, total: result.total, count: result.count });
      onCartChange(result.count);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    setError(null);
    setCheckingOut(true);
    try {
      await api.cart.checkout({ shipping_address: shippingAddress, contact_number: contactNumber });
      setCartData({ items: [], total: 0, count: 0 });
      onCartChange(0);
      navigate('/customers/orders');
    } catch (err) {
      setError(err.message);
    } finally {
      setCheckingOut(false);
    }
  };

  if (loading) {
    return (
      <div>
        <div className="page-header"><h3>Cart</h3></div>
        {[1,2,3].map((i) => <div key={i} className="skeleton skeleton-table-row" />)}
      </div>
    );
  }

  if (cartData.items.length === 0) {
    return (
      <div>
        <div className="page-header"><h3>Cart</h3></div>
        {error && <div className="alert alert-danger">{error}</div>}
        <div className="empty-state">
          <div className="empty-state-icon"><IconCart /></div>
          <p style={{ marginBottom: '1rem' }}>Your cart is empty</p>
          <button className="btn btn-primary" onClick={() => navigate('/customers/dashboard')}>Browse Products</button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header"><h3>Cart</h3></div>
      {error && <div className="alert alert-danger">{error}</div>}

      <div className="row">
        <div className="col-lg-8">
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Price</th>
                  <th>Quantity</th>
                  <th>Subtotal</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {cartData.items.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div className="d-flex align-items-center gap-3">
                        {item.product_image ? (
                          <img src={`/${item.product_image}`} alt={item.product_name} style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 6 }} />
                        ) : (
                          <div style={{ width: 48, height: 48, background: 'var(--border-light)', borderRadius: 6 }} />
                        )}
                        <span style={{ fontWeight: 500 }}>{item.product_name}</span>
                      </div>
                    </td>
                    <td>₱{Number(item.product_price).toLocaleString()}</td>
                    <td style={{ width: 140 }}>
                      <div className="qty-stepper">
                        <button type="button" className="qty-stepper-btn" onClick={() => { if (item.quantity > 1) handleQtyChange(item.id, item.quantity - 1); }}>−</button>
                        <input type="number" className="qty-stepper-value" value={item.quantity} min={1}
                          onChange={(e) => { const v = parseInt(e.target.value); if (v > 0) handleQtyChange(item.id, v); }} />
                        <button type="button" className="qty-stepper-btn" onClick={() => handleQtyChange(item.id, item.quantity + 1)}>+</button>
                      </div>
                    </td>
                    <td style={{ fontWeight: 600 }}>₱{(item.quantity * item.product_price).toLocaleString()}</td>
                    <td>
                      <button className="btn btn-outline-danger" onClick={() => handleRemove(item.id)} style={{ fontSize: '0.75rem' }}>Remove</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="card" style={{ position: 'sticky', top: '2rem' }}>
            <div className="card-body">
              <h5 className="card-title">Order Summary</h5>
              <div className="d-flex justify-content-between mb-2" style={{ fontSize: '0.875rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Items</span>
                <span>{cartData.count}</span>
              </div>
              <hr />
              <div className="d-flex justify-content-between mb-3">
                <strong>Total</strong>
                <strong style={{ fontSize: '1.3rem', fontFamily: 'Fira Code, monospace' }}>₱{Number(cartData.total).toLocaleString()}</strong>
              </div>
              <form onSubmit={handleCheckout}>
                <div className="mb-3">
                  <label className="form-label">Shipping Address</label>
                  <textarea className="form-control" rows="2" value={shippingAddress} onChange={(e) => setShippingAddress(e.target.value)} required placeholder="123 Main St, City" />
                </div>
                <div className="mb-3">
                  <label className="form-label">Contact Number</label>
                  <input type="text" className="form-control" value={contactNumber} onChange={(e) => setContactNumber(e.target.value)} required placeholder="+63 912 345 6789" />
                </div>
                <button type="submit" className="btn btn-primary w-100" disabled={checkingOut} style={{ padding: '0.65rem' }}>
                  {checkingOut ? 'Placing Order...' : 'Place Order'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
