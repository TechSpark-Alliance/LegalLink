import React, { useEffect, useRef, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import styles from './NavBar.module.css';
import logo from '../../assets/legal-link-logo.png';

const links = [
  { to: '/home/client', label: 'Home' },
  { to: '/lawyers', label: 'Lawyers' },
  { to: '/appointment', label: 'Appointment' },
  { to: '/conversations', label: 'Conversations' },
];

const NavBar = ({ forceActive }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

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

  const handleMenuAction = (action) => {
    setMenuOpen(false);

    if (action === 'signOut') {
      navigate('/register', { replace: true });
      return;
    }

    if (action === 'account') {
      console.info('Navigate to account settings');
      return;
    }

    if (action === 'privacy') {
      console.info('Navigate to privacy settings');
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
            <span className={styles.avatar}>U</span>
            <span className={styles.profileName}>Your Profile</span>
          </button>
          <div
            className={`${styles.menu} ${menuOpen ? styles.menuOpen : ''}`}
            role="menu"
            aria-label="Profile menu"
          >
            <button
              type="button"
              className={styles.menuItem}
              onClick={() => handleMenuAction('account')}
              role="menuitem"
            >
              Account settings
            </button>
            <button
              type="button"
              className={styles.menuItem}
              onClick={() => handleMenuAction('privacy')}
              role="menuitem"
            >
              Privacy settings
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
