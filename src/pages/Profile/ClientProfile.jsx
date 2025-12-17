import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../Clients/ClientsList.css';
import './LawyerProfile.css';
import ClientNavbar from '../../components/ClientNavbar';

const NAV_ITEMS = [
  { key: 'home', label: 'Home', path: '/home/client' },
  { key: 'lawyers', label: 'Lawyers', path: '/home/client' },
  { key: 'appointments', label: 'Appointments', path: '/home/client' },
  { key: 'conversations', label: 'Conversations', path: '/home/client' },
];

export default function ClientProfile() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwords, setPasswords] = useState({ password: '', confirm: '' });

  const apiBase = import.meta.env.VITE_APP_API || 'http://localhost:8000/api/v1';
  const token = localStorage.getItem('token') || sessionStorage.getItem('token') || '';

  const fetchProfile = async () => {
    setLoading(true);
    try {
      setError('');
      if (!token) {
        navigate('/login', { replace: true });
        return;
      }
      const res = await fetch(`${apiBase}/auth/user/me`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) {
        if (res.status === 401) {
          navigate('/login', { replace: true });
          return;
        }
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || 'Failed to load profile');
      }
      const data = await res.json();
      setProfile(data.user || null);
      setForm({
        full_name: data.user?.full_name || '',
        email: data.user?.email || '',
        phone: data.user?.phone || '',
        state: data.user?.state || '',
        city: data.user?.city || '',
      });
      setPasswords({ password: '', confirm: '' });
    } catch (err) {
      setError(err.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleLogout = async () => {
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

  if (error) return <div className="profile-shell"><p className="admin-error">{error}</p></div>;
  if (loading || !profile) return <div className="profile-shell"><p className="muted">Loading...</p></div>;

  const handleSave = async () => {
    if (passwords.password && passwords.password !== passwords.confirm) {
      setError('Passwords do not match');
      return;
    }
    setError('');
    setSaving(true);
    try {
      const payload = {
        full_name: form.full_name,
        phone: form.phone,
        state: form.state,
        city: form.city,
      };
      if (passwords.password) {
        payload.password = passwords.password;
      }
      const res = await fetch(`${apiBase}/auth/user/me`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || 'Save failed');
      }
      await fetchProfile();
      setEditing(false);
    } catch (err) {
      setError(err.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="profile-shell">
      <ClientNavbar activeKey="home" />

      <div className="profile-card">
        <div className="profile-header-row">
          <h3>Client Profile</h3>
          {!editing ? (
            <button className="primary-btn" onClick={() => setEditing(true)}>Edit</button>
          ) : (
            <div className="profile-actions">
              <button className="ghost-btn" onClick={() => { setEditing(false); fetchProfile(); }}>Cancel</button>
              <button className="primary-btn" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          )}
        </div>
        <div className="profile-grid">
          <div className="profile-row compact-row">
            <span className="profile-label">Full name</span>
            {!editing ? (
              <span className="profile-value">{profile.full_name || '-'}</span>
            ) : (
              <input
                className="profile-input"
                value={form.full_name}
                onChange={(e) => setForm({ ...form, full_name: e.target.value })}
              />
            )}
          </div>
          <div className="profile-row compact-row">
            <span className="profile-label">Email</span>
            <span className="profile-value">{profile.email || '-'}</span>
          </div>
          <div className="profile-row compact-row">
            <span className="profile-label">Phone</span>
            {!editing ? (
              <span className="profile-value">{profile.phone || '-'}</span>
            ) : (
              <input
                className="profile-input"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            )}
          </div>
          <div className="profile-row compact-row">
            <span className="profile-label">Role</span>
            <span className="profile-value">{profile.role || 'client'}</span>
          </div>
          {editing && (
            <>
              <div className="profile-row compact-row">
                <span className="profile-label">New password</span>
                <div className="password-wrapper profile-input input-dark">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={passwords.password}
                    onChange={(e) => setPasswords({ ...passwords, password: e.target.value })}
                    placeholder=""
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={`${showPassword ? 'Hide' : 'Show'} password`}
                  >
                    👁
                  </button>
                </div>
              </div>
              <div className="profile-row compact-row">
                <span className="profile-label">Confirm password</span>
                <div className="password-wrapper profile-input input-dark">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={passwords.confirm}
                    onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                    placeholder=""
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowConfirmPassword((v) => !v)}
                    aria-label={`${showConfirmPassword ? 'Hide' : 'Show'} password`}
                  >
                    👁
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
