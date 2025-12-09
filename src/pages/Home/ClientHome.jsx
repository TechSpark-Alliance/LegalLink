import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ClientHome.css';
import logo from '../../assets/legal-link-logo.png';

const NAV_ITEMS = [
  { key: 'home', label: 'Home', path: '/home/client' },
  { key: 'lawyers', label: 'Lawyers', path: '/home/client' },
  { key: 'appointments', label: 'Appointments', path: '/home/client' },
  { key: 'conversations', label: 'Conversations', path: '/home/client' },
];

export default function ClientHome() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userName, setUserName] = useState('Profile');

  useEffect(() => {
    const role = localStorage.getItem('role') || sessionStorage.getItem('role');
    if (role && role !== 'client') {
      navigate('/login', { replace: true });
      return;
    }
    let name = '';
    try {
      const storedUser = localStorage.getItem('user') || sessionStorage.getItem('user');
      if (storedUser && storedUser !== 'undefined') {
        const parsed = JSON.parse(storedUser);
        name = parsed?.full_name || parsed?.fullName || parsed?.email || '';
      }
    } catch (_) {
      /* ignore parse errors */
    }
    if (!name) {
      name = localStorage.getItem('full_name') || sessionStorage.getItem('full_name') || 'Profile';
    }
    setUserName(name);
  }, [navigate]);

  const handleLogout = async () => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    try {
      const apiBase = import.meta.env.VITE_APP_API || 'http://localhost:8000/api/v1';
      if (token) {
        await fetch(`${apiBase}/auth/user/logout`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });
      }
    } catch (_) {
      /* ignore */
    } finally {
      localStorage.clear();
      sessionStorage.clear();
      navigate('/login');
    }
  };

  return (
    <div className="client-shell">
      <header className="client-top">
        <div className="client-brand">
          <img src={logo} alt="LegalLink" className="brand-logo" />
          <span className="brand-name">LegalLink</span>
        </div>
        <nav className="client-nav">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.key}
              className={`nav-link ${item.key === 'home' ? 'active' : ''}`}
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
            <div className="avatar">{(userName || 'P').charAt(0)}</div>
            <span className="profile-name">{userName}</span>
          </button>
          {menuOpen && (
            <div className="profile-menu" role="menu">
              <button className="profile-menu__item" onClick={() => navigate('/home/client')}>Profile</button>
              <button className="profile-menu__item" onClick={handleLogout}>Logout</button>
            </div>
          )}
        </div>
      </header>

      <main className="client-body">
        <section className="hero-card">
          <h2>Welcome, User</h2>
          <p>Secure your peace of mind - consult with our top lawyers today!</p>
          <div className="hero-actions">
            <button className="search-pill">🔍 By location</button>
            <button className="search-pill">⚖️ Area of practice</button>
            <button className="primary-pill">Explore more</button>
          </div>
        </section>
      </main>
    </div>
  );
}
