import React, { useEffect, useRef, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import styles from './NavBar.module.css';
import logo from '../../assets/legal-link-logo.png';

const API_BASE = import.meta.env.VITE_APP_API || 'http://localhost:8000/api/v1';

const links = [
  { to: '/client/home', label: 'Home' },
  { to: '/client/lawyers', label: 'Lawyers' },
  { to: '/client/appointment', label: 'Appointment' },
  { to: '/client/conversations', label: 'Conversations' },
];

const NavBar = ({ forceActive }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [userName, setUserName] = useState('Profile');
  const menuRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    let name = '';
    try {
      const stored = localStorage.getItem('ll_user') || sessionStorage.getItem('ll_user');
      if (stored && stored !== 'undefined') {
        const parsed = JSON.parse(stored);
        name = parsed?.full_name || parsed?.fullName || parsed?.name || parsed?.email || '';
      }
    } catch {
      /* ignore */
    }
    if (!name) {
      name =
        localStorage.getItem('full_name') ||
        sessionStorage.getItem('full_name') ||
        localStorage.getItem('user') ||
        sessionStorage.getItem('user') ||
        'Profile';
    }
    setUserName(name);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  const handleMenuAction = async (action) => {
    setMenuOpen(false);

    if (action === 'profile') {
      navigate('/client/profile');
      return;
    }

    if (action === 'signOut') {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      try {
        if (token) {
          await fetch(`${API_BASE}/auth/user/logout`, {
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
        navigate('/login', { replace: true });
      }
    }
  };

  return (
    <header className={styles.shell}>
      <div className={styles.brand}>
        <img src={logo} alt="LegalLink logo" className={styles.logo} />
        <div className={styles.brandText}>
          <span className={styles.brandName}>LegalLink</span>
        </div>
      </div>
      <div className={styles.rightGroup}>
        <nav className={styles.nav}>
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `${styles.link}${
                  isActive || (forceActive && link.to.startsWith(forceActive))
                    ? ` ${styles.active}`
                    : ''
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
        <div className={styles.profileWrapper} ref={menuRef}>
          <button
            type="button"
            className={styles.profileBtn}
            aria-label="User settings"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span className={styles.avatar}>{(userName || 'P').charAt(0)}</span>
            <span className={styles.profileName}>{userName}</span>
          </button>
          <div
            className={`${styles.menu} ${menuOpen ? styles.menuOpen : ''}`}
            role="menu"
            aria-label="Profile menu"
          >
            <button
              type="button"
              className={styles.menuItem}
              onClick={() => handleMenuAction('profile')}
              role="menuitem"
            >
              Profile
            </button>
            <div className={styles.menuDivider} aria-hidden="true" />
            <button
              type="button"
              className={`${styles.menuItem} ${styles.signOut}`}
              onClick={() => handleMenuAction('signOut')}
              role="menuitem"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default NavBar;
