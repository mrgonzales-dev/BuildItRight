import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';

export default function AdminGuard({ children }) {
  const [verified, setVerified] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;
    const pin = sessionStorage.getItem('admin_pin');
    if (!pin) {
      navigate('/admin/login');
      setLoading(false);
      return;
    }
    api.auth.verify(pin)
      .then(res => {
        if (cancelled) return;
        if (res.valid) setVerified(true);
        else {
          sessionStorage.removeItem('admin_pin');
          navigate('/admin/login');
        }
      })
      .catch(() => {
        if (cancelled) return;
        sessionStorage.removeItem('admin_pin');
        navigate('/admin/login');
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [navigate]);

  if (loading) {
    return <div className="text-center py-5"><div className="spinner-border" /></div>;
  }

  if (!verified) return null;

  return children;
}
