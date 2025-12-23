import React, { useEffect, useState } from 'react';
import NavBar from '../../components/NavBar/NavBar';
import './ClientProfile.css';

const API_BASE = import.meta.env.VITE_APP_API || 'http://localhost:8000/api/v1';

const EyeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path
      d="M1.75 12s3.5-7 10.25-7 10.25 7 10.25 7-3.5 7-10.25 7S1.75 12 1.75 12z"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.7" />
  </svg>
);

const getToken = () =>
  (typeof window !== 'undefined' &&
    (sessionStorage.getItem('token') || localStorage.getItem('token') || '')) ||
  '';

const normalizeClient = (user = {}) => ({
  full_name: user.full_name || user.fullName || user.name || '',
  email: user.email || '',
  phone: user.phone || '',
});

export default function ClientProfile() {
  const [client, setClient] = useState(null);
  const [passwords, setPasswords] = useState({ current: '', next: '', confirm: '' });
  const [showPassword, setShowPassword] = useState({ current: false, next: false, confirm: false });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(`${API_BASE}/auth/user/me`, {
          headers: {
            'Content-Type': 'application/json',
            ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
          },
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.detail || 'Failed to load profile');
        }
        const data = await res.json().catch(() => ({}));
        const normalized = normalizeClient(data.user || {});
        setClient(normalized);
        try {
          sessionStorage.setItem('ll_user', JSON.stringify(data.user));
          localStorage.setItem('ll_user', JSON.stringify(data.user));
        } catch {
          /* ignore */
        }
      } catch (err) {
        setError(err.message || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const renderPasswordField = (id, label, key) => (
    <div className="field-col">
      <label className="label" htmlFor={id}>{label}</label>
      <div className="input-eye-wrap">
        <input
          id={id}
          type={showPassword[key] ? 'text' : 'password'}
          value={passwords[key]}
          onChange={(e) => setPasswords((p) => ({ ...p, [key]: e.target.value }))}
          placeholder={`Enter ${label.toLowerCase()}`}
        />
        <button
          type="button"
          className="eye-btn"
          aria-label={showPassword[key] ? 'Hide password' : 'Show password'}
          onClick={() => setShowPassword((s) => ({ ...s, [key]: !s[key] }))}
        >
          <EyeIcon />
        </button>
      </div>
    </div>
  );

  return (
    <div className="client-profile-page">
      <NavBar forceActive="/client/profile" />
      <main className="client-profile-main">
        <header className="client-profile-header">
          <p className="eyebrow">Profile</p>
          <h1>Your profile</h1>
          <p className="subhead">View your registered information.</p>
        </header>

        {loading && <div className="card">Loading profile...</div>}
        {error && !loading && <div className="card error">Error: {error}</div>}
        {!loading && !error && client && (
          <>
            <section className="card">
              <div className="field-row">
                <span className="label">Name</span>
                <span className="value">{client.full_name || 'Not provided'}</span>
              </div>
              <div className="field-row">
                <span className="label">Email</span>
                <span className="value">{client.email || 'Not provided'}</span>
              </div>
              <div className="field-row">
                <span className="label">Phone</span>
                <span className="value">{client.phone || 'Not provided'}</span>
              </div>
            </section>

            <section className="card">
              <h3 className="section-title">Change password</h3>
              {renderPasswordField('current-pass', 'Current password', 'current')}
              {renderPasswordField('new-pass', 'New password', 'next')}
              {renderPasswordField('confirm-pass', 'Confirm new password', 'confirm')}
              <div className="actions">
                <button
                  type="button"
                  className="primary"
                  disabled={saving || !passwords.current || !passwords.next || passwords.next !== passwords.confirm}
                  onClick={async () => {
                    if (passwords.next !== passwords.confirm) {
                      setError('New passwords do not match');
                      return;
                    }
                    setSaving(true);
                    setError('');
                    try {
                      const res = await fetch(`${API_BASE}/auth/user/me`, {
                        method: 'PUT',
                        headers: {
                          'Content-Type': 'application/json',
                          ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
                        },
                        body: JSON.stringify({ password: passwords.next }),
                      });
                      if (!res.ok) {
                        const data = await res.json().catch(() => ({}));
                        throw new Error(data.detail || 'Failed to update password');
                      }
                      setPasswords({ current: '', next: '', confirm: '' });
                    } catch (err) {
                      setError(err.message || 'Failed to update password');
                    } finally {
                      setSaving(false);
                    }
                  }}
                >
                  {saving ? 'Updating...' : 'Update password'}
                </button>
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}
