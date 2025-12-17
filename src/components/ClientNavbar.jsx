import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ClientNavbar.css';
import logo from '../assets/legal-link-logo.png';

const NAV_ITEMS = [
  { key: 'home', label: 'Home', path: '/home/client' },
  { key: 'lawyers', label: 'Lawyers', path: '/home/client' },
  { key: 'appointments', label: 'Appointments', path: '/home/client' },
  { key: 'conversations', label: 'Conversations', path: '/home/client' },
];

export default function ClientNavbar({ activeKey = 'home' }) {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userName, setUserName] = useState('Profile');
  const apiBase = import.meta.env.VITE_APP_API || 'http://localhost:8000/api/v1';

  useEffect(() => {
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
  }, []);

  const handleLogout = async () => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    try {
      if (token) {
        await fetch(`${apiBase}/auth/user/logout`, {
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

  return (
    <header className="client-nav-shell">
      <div className="client-brand" onClick={() => navigate('/home/client')}>
        <img src={logo} alt="LegalLink" className="brand-logo" />
        <span className="brand-name">LegalLink</span>
      </div>
      <nav className="client-nav">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.key}
            className={`nav-link ${activeKey === item.key ? 'active' : ''}`}
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
            <button className="profile-menu__item" onClick={() => navigate('/profile/client')}>Profile</button>
            <button className="profile-menu__item" onClick={handleLogout}>Logout</button>
          </div>
        )}
      </div>
    </header>
  );
}
