import { useState, useEffect, useCallback } from 'react';
import { Routes, Route, NavLink, Navigate, useNavigate } from 'react-router-dom';
import { api, setAuthUser, onUserChange } from './api';
import { IconDashboard, IconFolder, IconBox, IconClipboard, IconShop, IconCart, IconPackage, IconLogout, IconUser } from './icons';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import OwnerDashboard from './pages/owners/Dashboard';
import OwnerCategories from './pages/owners/Categories';
import OwnerProducts from './pages/owners/Products';
import OwnerOrders from './pages/owners/Orders';
import CustomerDashboard from './pages/customers/Dashboard';
import CustomerCart from './pages/customers/Cart';
import CustomerOrders from './pages/customers/Orders';
import CustomerProfile from './pages/customers/Profile';

export default function App() {
  const [user, setUser] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const saved = localStorage.getItem('user');
    if (saved) {
      const parsed = JSON.parse(saved);
      setAuthUser(parsed);
      setUser(parsed);
    }
    return onUserChange((u) => setUser(u));
  }, []);

  useEffect(() => {
    if (user && user.role === 'customer') {
      api.cart.get().then((data) => setCartCount(data.count)).catch(() => setCartCount(0));
    }
  }, [user]);

  const handleLogout = useCallback(() => {
    localStorage.removeItem('user');
    setAuthUser(null);
    setUser(null);
    setCartCount(0);
    navigate('/');
  }, [navigate]);

  if (!user) {
    return (
      <div className="public-layout">
        <nav className="top-nav">
          <span className="top-nav-brand">My Shop</span>
          <button className="hamburger-btn" onClick={() => setMenuOpen(!menuOpen)}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          <div className={`top-nav-links${menuOpen ? ' mobile-open' : ''}`}>
            <NavLink to="/" end className={({ isActive }) => `top-nav-link${isActive ? ' active' : ''}`}>Shop</NavLink>
            <NavLink to="/login" className={({ isActive }) => `top-nav-link${isActive ? ' active' : ''}`}>Login</NavLink>
            <NavLink to="/register" className={({ isActive }) => `top-nav-link${isActive ? ' active' : ''}`}>Register</NavLink>
          </div>
        </nav>
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    );
  }

  if (user.role === 'customer') {
    return (
      <div className="customer-layout">
        <nav className="top-nav">
          <NavLink to="/customers/dashboard" end className="top-nav-brand">My Shop</NavLink>
          <button className="hamburger-btn" onClick={() => setMenuOpen(!menuOpen)}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          <div className={`nav-collapse${menuOpen ? ' mobile-open' : ''}`}>
            <div className="top-nav-links">
              <NavLink to="/customers/dashboard" end className={({ isActive }) => `top-nav-link${isActive ? ' active' : ''}`}>
                <IconShop />
                <span>Shop</span>
              </NavLink>
              <NavLink to="/customers/cart" className={({ isActive }) => `top-nav-link${isActive ? ' active' : ''}`}>
                <IconCart />
                <span>Cart</span>
                {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
              </NavLink>
              <NavLink to="/customers/orders" className={({ isActive }) => `top-nav-link${isActive ? ' active' : ''}`}>
                <IconPackage />
                <span>My Orders</span>
              </NavLink>
            </div>
            <div className="top-nav-right">
              <NavLink to="/customers/profile" className={({ isActive }) => `top-nav-link${isActive ? ' active' : ''}`}>
                <IconUser />
                <span>{user.name}</span>
              </NavLink>
              <div className="top-nav-link" onClick={handleLogout} style={{ cursor: 'pointer' }}>
                <IconLogout />
                <span>Logout</span>
              </div>
            </div>
          </div>
        </nav>
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Navigate to="/customers/dashboard" replace />} />
            <Route path="/customers/dashboard" element={<CustomerDashboard onCartChange={setCartCount} />} />
            <Route path="/customers/cart" element={<CustomerCart onCartChange={setCartCount} />} />
            <Route path="/customers/orders" element={<CustomerOrders />} />
            <Route path="/customers/profile" element={<CustomerProfile />} />
            <Route path="*" element={<Navigate to="/customers/dashboard" replace />} />
          </Routes>
        </main>
      </div>
    );
  }

  const navItems = [
    { to: '/owners/dashboard', label: 'Dashboard', icon: <IconDashboard /> },
    { to: '/owners/categories', label: 'Categories', icon: <IconFolder /> },
    { to: '/owners/products', label: 'Products', icon: <IconBox /> },
    { to: '/owners/orders', label: 'Orders', icon: <IconClipboard /> },
  ];

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h5 className="mb-0">My Shop</h5>
          <small>{user.role === 'owner' ? 'Owner Panel' : 'Customer'} · {user.name}</small>
        </div>
        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to.endsWith('dashboard')}
              className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
            >
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="nav-item" onClick={handleLogout}>
            <IconLogout />
            <span>Logout</span>
          </div>
        </div>
      </aside>
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Navigate to="/owners/dashboard" replace />} />
          <Route path="/owners/dashboard" element={user.role === 'owner' ? <OwnerDashboard /> : <Navigate to="/customers/dashboard" replace />} />
          <Route path="/owners/categories" element={user.role === 'owner' ? <OwnerCategories /> : <Navigate to="/customers/dashboard" replace />} />
          <Route path="/owners/products" element={user.role === 'owner' ? <OwnerProducts /> : <Navigate to="/customers/dashboard" replace />} />
          <Route path="/owners/orders" element={user.role === 'owner' ? <OwnerOrders /> : <Navigate to="/customers/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/owners/dashboard" replace />} />
        </Routes>
      </main>
    </div>
  );
}
