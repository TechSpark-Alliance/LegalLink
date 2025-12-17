import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ClientsList.css';
import logo from '../../assets/legal-link-logo.png';

const NAV_ITEMS = [
  { key: 'cases', label: 'Cases', path: '/lawyer/cases' },
  { key: 'clients', label: 'Clients', path: '/lawyer/clients' },
  { key: 'appointments', label: 'Appointments', path: '/lawyer/appointments' },
  { key: 'conversations', label: 'Conversations', path: '/lawyer/conversations' },
];

const initialForm = { full_name: '', email: '', phone: '', nric: '', company_reg: '', address: '' };

export default function ClientsList() {
  const [clients, setClients] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [cases, setCases] = useState([]);
  const [q, setQ] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const apiBase = import.meta.env.VITE_APP_API || 'http://localhost:8000/api/v1';
  const token = localStorage.getItem('token') || sessionStorage.getItem('token') || '';
  const lawyerName =
    localStorage.getItem('full_name') ||
    sessionStorage.getItem('full_name') ||
    'Profile';

  const fetchClients = async () => {
    try {
      const params = new URLSearchParams();
      if (q) params.append('q', q);
      const res = await fetch(`${apiBase}/clients?${params.toString()}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();
      const items = data.items || [];
      setClients(items);
      setFiltered(items);
    } catch {
      setClients([]);
      setFiltered([]);
    }
  };

  const fetchCases = async () => {
    try {
      const res = await fetch(`${apiBase}/cases`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();
      setCases(data.items || []);
    } catch {
      setCases([]);
    }
  };

  useEffect(() => {
    const role = localStorage.getItem('role') || sessionStorage.getItem('role');
    if (role && role !== 'lawyer') {
      navigate('/login', { replace: true });
      return;
    }
    fetchClients();
    fetchCases();
  }, []);

  const handleSearch = () => {
    const text = q.toLowerCase();
    setFiltered(
      clients.filter(
        (c) =>
          c.full_name?.toLowerCase().includes(text) ||
          c.email?.toLowerCase().includes(text) ||
          c.phone?.toLowerCase().includes(text)
      )
    );
  };

  const resetForm = () => setForm(initialForm);

  const saveClient = async () => {
    try {
      if (!form.full_name.trim() || !form.email.trim() || !form.phone.trim()) {
        alert('Name, Email, and Phone are required.');
        return;
      }
      const res = await fetch(`${apiBase}/clients`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || 'Save failed');
      }
      resetForm();
      setShowForm(false);
      fetchClients();
    } catch (err) {
      alert(err.message || 'Save failed');
    }
  };

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

  const caseByClientId = useMemo(() => {
    const map = new Map();
    cases.forEach((cs) => {
      if (cs.client_id) {
        map.set(cs.client_id, cs);
      }
    });
    return map;
  }, [cases]);

  const matterForClient = (client) => {
    const byId = client?._id && caseByClientId.get(client._id);
    if (byId) return byId.matter_title || '-';
    const byIdentity = cases.find(
      (cs) =>
        (client?.email && cs.email === client.email) ||
        (client?.full_name && cs.client_name === client.full_name)
    );
    return byIdentity?.matter_title || '-';
  };

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
        <div className="clients-toolbar">
          <div className="search-input">
            <input
              placeholder="Search client name, email, phone"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <button className="filter-btn" onClick={handleSearch}>Filter</button>
          <div className="toolbar-spacer" />
          <button className="primary-btn" onClick={() => { resetForm(); setShowForm(true); }}>Add client</button>
        </div>

        {showForm && (
          <div className="clients-form">
            <div className="form-grid">
              <label>
                Name *
                <input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
              </label>
              <label>
                Email *
                <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </label>
              <label>
                Phone *
                <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </label>
              <label>
                NRIC
                <input value={form.nric} onChange={(e) => setForm({ ...form, nric: e.target.value })} />
              </label>
              <label>
                Company reg
                <input value={form.company_reg} onChange={(e) => setForm({ ...form, company_reg: e.target.value })} />
              </label>
              <label>
                Address
                <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
              </label>
            </div>
            <div className="form-actions">
              <button className="ghost-btn" onClick={() => { resetForm(); setShowForm(false); }}>Cancel</button>
              <button className="primary-btn" onClick={saveClient}>Create client</button>
            </div>
          </div>
        )}

        <div className="clients-table">
          <div className="table-head">
            <span>#</span>
            <span>Name</span>
            <span>Email</span>
            <span>Phone</span>
            <span>Address</span>
            <span>Matter</span>
            <span>Created</span>
          </div>
          {filtered.length === 0 && (
            <div className="table-row empty-row">
              <span>No clients found.</span>
              <span />
              <span />
              <span />
              <span />
              <span />
              <span />
            </div>
          )}
          {filtered.map((c, idx) => (
            <div className="table-row table-row--link" key={c._id || idx} onClick={() => navigate(`/lawyer/clients/${c._id}`)}>
              <span>{idx + 1}</span>
              <span className="link-text">{c.full_name || '-'}</span>
              <span>{c.email || '-'}</span>
              <span>{c.phone || '-'}</span>
              <span>{c.address || '-'}</span>
              <span>{matterForClient(c)}</span>
              <span>{(c.created_at || '').slice(0, 10) || '-'}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
