import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../Clients/ClientsList.css';
import './LawyerProfile.css';
import logo from '../../assets/legal-link-logo.png';

const NAV_ITEMS = [
  { key: 'cases', label: 'Cases', path: '/lawyer/cases' },
  { key: 'clients', label: 'Clients', path: '/lawyer/clients' },
  { key: 'appointments', label: 'Appointments', path: '/lawyer/appointments' },
  { key: 'conversations', label: 'Conversations', path: '/lawyer/conversations' },
];

export default function LawyerProfile() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState({ sijil: false, firm: false });
  const [loading, setLoading] = useState(true);
  const [expertiseOpen, setExpertiseOpen] = useState(false);
  const stateOptions = [
    'Johor',
    'Kedah',
    'Kelantan',
    'Kuala Lumpur',
    'Labuan',
    'Melaka',
    'Negeri Sembilan',
    'Pahang',
    'Pulau Pinang',
    'Perak',
    'Perlis',
    'Putrajaya',
    'Sabah',
    'Sarawak',
    'Selangor',
    'Terengganu',
  ];

  const formatState = (val) => {
    if (!val) return '';
    const cleaned = String(val).replace(/[-_]/g, ' ');
    return cleaned
      .split(' ')
      .filter(Boolean)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(' ');
  };
  const expertiseOptions = [
    'Litigation',
    'Corporate',
    'Family',
    'Criminal',
    'Employment',
    'Intellectual Property',
    'Tax',
    'Real Estate',
    'Immigration',
    'Other',
  ];
  const apiBase = import.meta.env.VITE_APP_API || 'http://localhost:8000/api/v1';
  const apiRoot = (() => {
    try {
      const url = new URL(apiBase);
      // strip trailing /api/v1 if present
      const path = url.pathname.replace(/\/api\/v1\/?$/, '') || '';
      url.pathname = path;
      return url.origin + url.pathname;
    } catch {
      return apiBase.replace(/\/api\/v1$/, '');
    }
  })();
  const token = localStorage.getItem('token') || sessionStorage.getItem('token') || '';
  const lawyerName =
    localStorage.getItem('full_name') ||
    sessionStorage.getItem('full_name') ||
    'Profile';

  const fetchProfile = async () => {
    setLoading(true);
    try {
      setError('');
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
      const user = data.user || null;
      if (user) {
        const expertiseList =
          user.expertise && Array.isArray(user.expertise)
            ? user.expertise
            : user.expertise
            ? String(user.expertise)
                .split(',')
                .map((v) => v.trim())
                .filter(Boolean)
            : [];
        const normalizedState = formatState(user.state || '');
        const normalizedUser = { ...user, state: normalizedState };
        setProfile(normalizedUser);
        setForm({
          full_name: user.full_name || '',
          phone: user.phone || '',
          state: normalizedState,
          city: user.city || '',
          about: user.about || '',
          expertise: expertiseList,
          years_of_experience: user.years_of_experience || '',
          law_firm: user.law_firm || '',
          sijil_certificate: user.sijil_certificate || '',
          law_firm_certificate: user.law_firm_certificate || '',
        });
      }
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

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        full_name: form.full_name,
        phone: form.phone,
        state: formatState(form.state),
        city: form.city,
        about: form.about,
        years_of_experience: form.years_of_experience,
        law_firm: form.law_firm,
        sijil_certificate: form.sijil_certificate,
        law_firm_certificate: form.law_firm_certificate,
        expertise: Array.isArray(form.expertise) ? form.expertise : [],
      };
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

  const detailRow = (label, value, fieldKey) => {
    const isEditable = editing && fieldKey;
    const inputProps = {
      value: form[fieldKey] ?? '',
      onChange: (e) => setForm({ ...form, [fieldKey]: e.target.value }),
    };

    return (
      <div className="profile-row" key={label}>
        <span className="profile-label">{label}</span>
        {isEditable ? (
          fieldKey === 'about' ? (
            <textarea className="profile-input profile-textarea" rows={3} {...inputProps} />
          ) : (
            <input className="profile-input" {...inputProps} />
          )
        ) : (
          <span className="profile-value">{value || '-'}</span>
        )}
      </div>
    );
  };

  const expertiseList =
    form?.expertise ||
    (profile?.expertise && Array.isArray(profile.expertise) && profile.expertise.length > 0
      ? profile.expertise.join(', ')
      : '');

  const uploadFile = async (fieldKey, file, uploadLabel) => {
    if (!file) return;
    const loadingKey = fieldKey === 'sijil_certificate' ? 'sijil' : 'firm';
    setUploading((u) => ({ ...u, [loadingKey]: true }));
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch(`${apiBase}/files/upload`, {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || `${uploadLabel} upload failed`);
      }
      const data = await res.json();
      setForm((prev) => ({ ...prev, [fieldKey]: data.url || '' }));
    } catch (err) {
      setError(err.message || `${uploadLabel} upload failed`);
    } finally {
      setUploading((u) => ({ ...u, [loadingKey]: false }));
    }
  };

  const fileRow = (label, fieldKey) => {
    const rawUrl = form[fieldKey] || '';
    const loadingKey = fieldKey === 'sijil_certificate' ? 'sijil' : 'firm';
    const displayUrl = (() => {
      if (!rawUrl) return '';
      const value = String(rawUrl);
      if (value.startsWith('http')) return value;
      const prefix = apiRoot.endsWith('/') ? apiRoot.slice(0, -1) : apiRoot;
      const path = value.startsWith('/') ? value : `/${value}`;
      return `${prefix}${path}`;
    })();
    const fileName = rawUrl ? String(rawUrl).split('/').pop() : '';

    return (
      <div className="profile-row" key={label}>
        <span className="profile-label">{label}</span>
        {!editing ? (
          <span className="profile-value">
            {displayUrl ? (
              <a className="profile-link" href={displayUrl} target="_blank" rel="noreferrer">
                {fileName || 'View file'}
              </a>
            ) : (
              '-'
            )}
          </span>
        ) : (
          <div className="file-actions">
            {rawUrl ? (
              <>
                <a className="profile-link" href={displayUrl} target="_blank" rel="noreferrer">
                  {fileName || 'View file'}
                </a>
                <button className="ghost-btn" onClick={() => setForm({ ...form, [fieldKey]: '' })}>
                  Remove
                </button>
              </>
            ) : (
              <span className="profile-value">No file</span>
            )}
            <div className="upload-inline">
            <label className="upload-btn">
              {uploading[loadingKey] ? 'Uploading...' : 'Upload'}
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => uploadFile(fieldKey, e.target.files?.[0], label)}
              />
            </label>
            </div>
          </div>
        )}
      </div>
    );
  };

  const expertiseRow = () => {
    const selected = Array.isArray(form.expertise) ? form.expertise : [];
    const displayValue = selected.length ? `${selected.length} selected` : 'Choose expertise';
    return (
      <div className="profile-row" key="expertise">
        <span className="profile-label">Expertise</span>
        {!editing ? (
          <span className="profile-value">{selected.length ? selected.join(', ') : '-'}</span>
        ) : (
          <div className="expertise-select">
            <div className="expertise-summary" onClick={() => setExpertiseOpen((o) => !o)}>
              <span>{displayValue}</span>
              <span className="caret">▾</span>
            </div>
            {expertiseOpen && (
              <div className="expertise-dropdown">
                {expertiseOptions.map((opt) => {
                  const checked = selected.includes(opt);
                  return (
                    <label key={opt} className="expertise-option">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => {
                          setForm((prev) => {
                            const next = checked
                              ? prev.expertise.filter((v) => v !== opt)
                              : [...prev.expertise, opt];
                            return { ...prev, expertise: next };
                          });
                        }}
                      />
                      <span>{opt}</span>
                    </label>
                  );
                })}
              </div>
            )}
            <div className="expertise-chips">
              {selected.map((chip) => (
                <span key={chip} className="chip">
                  {chip}
                  <button
                    type="button"
                    onClick={() =>
                      setForm((prev) => ({
                        ...prev,
                        expertise: prev.expertise.filter((v) => v !== chip),
                      }))
                    }
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  if (error) return <div className="profile-shell"><p className="admin-error">{error}</p></div>;
  if (loading || !profile) return <div className="profile-shell"><p className="muted">Loading...</p></div>;

  return (
    <div className="profile-shell">
      <header className="clients-header">
        <div className="clients-brand">
          <img src={logo} alt="LegalLink" className="brand-logo" />
          <span className="brand-name">LegalLink</span>
        </div>
        <nav className="clients-nav">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.key}
              className={`nav-link ${item.key === 'cases' ? 'active' : ''}`}
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

      <div className="profile-card">
        <h3>Lawyer Profile</h3>
        <div className="profile-actions">
          {!editing ? (
            <button className="primary-btn" onClick={() => setEditing(true)}>Edit</button>
          ) : (
            <>
              <button className="ghost-btn" onClick={() => { setEditing(false); fetchProfile(); }}>Cancel</button>
              <button className="primary-btn" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : 'Save'}
              </button>
            </>
          )}
        </div>
        <div className="profile-grid">
          {detailRow('Full name', profile.full_name, 'full_name')}
          {detailRow('Email', profile.email)}
          {detailRow('Phone', profile.phone, 'phone')}
          {detailRow('Role', profile.role)}
          {detailRow('Law firm', profile.law_firm, 'law_firm')}
          {fileRow('Law firm certificate', 'law_firm_certificate')}
          {fileRow('Sijil certificate', 'sijil_certificate')}
          {detailRow('Years of experience', profile.years_of_experience, 'years_of_experience')}
          {expertiseRow()}
          {editing ? (
            <div className="profile-row">
              <span className="profile-label">State</span>
              <select
                className="profile-select"
                value={form.state || ''}
                onChange={(e) => setForm({ ...form, state: e.target.value })}
              >
                <option value="">Choose state</option>
                {stateOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            detailRow('State', profile.state, null)
          )}
          {detailRow('City', profile.city, 'city')}
          {detailRow('About', profile.about, 'about')}
        </div>
      </div>
    </div>
  );
}
