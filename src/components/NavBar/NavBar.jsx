import React from 'react';
import { NavLink } from 'react-router-dom';
import styles from './NavBar.module.css';
import logo from '../../assets/legal-link-logo.png';

const links = [
  { to: '/home/client', label: 'Home' },
  { to: '/lawyers', label: 'Lawyers' },
  { to: '/appointment', label: 'Appointment' },
  { to: '/conversations', label: 'Conversations' },
];

const NavBar = () => {
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
                `${styles.link}${isActive ? ` ${styles.active}` : ''}`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
        <button type="button" className={styles.profileBtn} aria-label="User settings">
          <span className={styles.avatar}>U</span>
          <span className={styles.profileName}>Your Profile</span>
        </button>
      </div>
    </header>
  );
};

export default NavBar;
