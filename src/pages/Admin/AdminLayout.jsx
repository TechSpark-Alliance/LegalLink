import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import logo from '../../assets/legal-link-logo.png';
import './AdminLayout.css';

const navItems = [
  { to: '/admin/users', label: 'User Management' },
  { to: '/admin/lawyers', label: 'Pending Lawyers' },
];

export default function AdminLayout({ title, subtitle, actions, children }) {
  const location = useLocation();

  return (
    <div className="admin-shell">
      <header className="admin-shell__header">
        <div className="admin-shell__brand">
          <img src={logo} alt="LegalLink logo" className="admin-shell__logo" />
          <div>
            <div className="admin-shell__brand-name">LegalLink Admin</div>
            <div className="admin-shell__brand-subtitle">Control Center</div>
          </div>
        </div>
        <nav className="admin-shell__nav">
          {navItems.map((item) => {
            const active = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`admin-shell__nav-pill${active ? ' is-active' : ''}`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </header>

      <main className="admin-shell__body">
        {(title || subtitle || actions) && (
          <div className="admin-shell__page-head">
            <div>
              {subtitle && <p className="admin-shell__eyebrow">{subtitle}</p>}
              {title && <h1 className="admin-shell__title">{title}</h1>}
            </div>
            {actions && <div className="admin-shell__actions">{actions}</div>}
          </div>
        )}
        {children}
      </main>
    </div>
  );
}
