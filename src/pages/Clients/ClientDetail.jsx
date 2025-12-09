import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './ClientsList.css';
import logo from '../../assets/legal-link-logo.png';

const NAV_ITEMS = [
  { key: 'cases', label: 'Cases', path: '/lawyer/cases' },
  { key: 'clients', label: 'Clients', path: '/lawyer/clients' },
  { key: 'appointments', label: 'Appointments', path: '/lawyer/appointments' },
  { key: 'conversations', label: 'Conversations', path: '/lawyer/conversations' },
];

export default function ClientDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [client, setClient] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');

  const apiBase = import.meta.env.VITE_APP_API || 'http://localhost:8000/api/v1';
  const token = localStorage.getItem('token') || sessionStorage.getItem('token') || '';
  const lawyerName =
    localStorage.getItem('full_name') ||
    sessionStorage.getItem('full_name') ||
    'Profile';

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2200);
  };

  const fetchClient = async () => {
    try {
      setError('');
      const res = await fetch(`${apiBase}/clients/${id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || 'Failed to load client');
      }
      const data = await res.json();
      setClient(data.client);
    } catch (err) {
      setError(err.message || 'Failed to load client');
    }
  };

  useEffect(() => {
    const role = localStorage.getItem('role') || sessionStorage.getItem('role');
    if (role && role !== 'lawyer') {
      navigate('/login', { replace: true });
      return;
    }
    fetchClient();
  }, [id]);

  const handleLogout = async () => {
    try {
      const logoutUrl = `${apiBase}/auth/user/logout`;
      if (token) {
        await fetch(logoutUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });
      }
    } catch {
      /* ignore */
    } finally {
      localStorage.clear();
      sessionStorage.clear();
      navigate('/login');
    }
  };

  const save = async () => {
    if (!client) return;
    if (!client.full_name?.trim() || !client.email?.trim() || !client.phone?.trim()) {
      alert('Name, Email, and Phone are required.');
      return;
    }
    try {
      setUpdating(true);
      const res = await fetch(`${apiBase}/clients/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          full_name: client.full_name,
          email: client.email,
          phone: client.phone,
          nric: client.nric,
          company_reg: client.company_reg,
          address: client.address,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || 'Update failed');
      }
      showToast('Client saved');
      setTimeout(() => navigate('/lawyer/clients'), 900);
    } catch (err) {
      setError(err.message || 'Update failed');
    } finally {
      setUpdating(false);
    }
  };

  const remove = async () => {
    if (!confirm('Delete this client?')) return;
    try {
      setUpdating(true);
      const res = await fetch(`${apiBase}/clients/${id}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || 'Delete failed');
      }
      showToast('Client deleted');
      setTimeout(() => navigate('/lawyer/clients'), 700);
    } catch (err) {
      setError(err.message || 'Delete failed');
    } finally {
      setUpdating(false);
    }
  };

  if (error) return <div className="clients-shell"><p className="admin-error">{error}</p></div>;
  if (!client) return <div className="clients-shell"><p className="muted">Loading...</p></div>;

  return (
    <div className="clients-shell">
      <header className="clients-header">
        <div className="clients-brand">
          <img src={logo} alt="LegalLink" className="brand-logo" />
          <span className="brand-name">LegalLink</span>
        </div>
        <nav className="clients-nav">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.key}
              className={`nav-link ${item.key === 'clients' ? 'active' : ''}`}
              onClick={() => navigate(item.path)}
            >
              {item.label}
            </button>
          ))}
        </nav>
        <div className="profile-wrapper">
          <button
            className="profile-badge"
            onClick={() => setMenuOpen((o) => !o)}
            aria-haspopup="true"
            aria-expanded={menuOpen}
          >
            <div className="avatar">{(lawyerName || 'P').charAt(0)}</div>
            <span className="profile-name">{lawyerName}</span>
          </button>
          {menuOpen && (
            <div className="profile-menu" role="menu">
              <button className="profile-menu__item" onClick={() => navigate('/lawyer/profile')}>Profile</button>
              <button className="profile-menu__item" onClick={handleLogout}>Logout</button>
            </div>
          )}
        </div>
      </header>

      <div className="clients-card">
        <h3>Client Details</h3>
        <div className="form-grid clients-detail-grid">
          <label>
            Name *
            <input value={client.full_name || ''} onChange={(e) => setClient({ ...client, full_name: e.target.value })} />
          </label>
          <label>
            Email *
            <input value={client.email || ''} onChange={(e) => setClient({ ...client, email: e.target.value })} />
          </label>
          <label>
            Phone *
            <input value={client.phone || ''} onChange={(e) => setClient({ ...client, phone: e.target.value })} />
          </label>
          <label>
            NRIC
            <input value={client.nric || ''} onChange={(e) => setClient({ ...client, nric: e.target.value })} />
          </label>
          <label>
            Company reg
            <input value={client.company_reg || ''} onChange={(e) => setClient({ ...client, company_reg: e.target.value })} />
          </label>
          <label>
            Address
            <input value={client.address || ''} onChange={(e) => setClient({ ...client, address: e.target.value })} />
          </label>
        </div>
        <div className="form-actions">
          <button className="ghost-btn" onClick={() => navigate('/lawyer/clients')}>
            Back
          </button>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="ghost-btn" onClick={remove} disabled={updating}>
              Delete
            </button>
            <button className="primary-btn" onClick={save} disabled={updating}>
              {updating ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </div>

      {toast && <div className="toast success">{toast}</div>}
    </div>
  );
}
