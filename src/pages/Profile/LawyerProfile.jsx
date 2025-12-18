import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LawyerLayout from '../../components/LawyerLayout';
import './LawyerProfile.css';

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
  return String(val)
    .replace(/[-_]/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
};

export default function LawyerProfile() {
  const navigate = useNavigate();
  const apiBase = import.meta.env.VITE_APP_API || 'http://localhost:8000/api/v1';
  const token = localStorage.getItem('token') || sessionStorage.getItem('token') || '';

  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({});
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState({ avatar: false, sijil: false, firm: false });
  const [expertiseOpen, setExpertiseOpen] = useState(false);

  const apiRoot = (() => {
    try {
      const url = new URL(apiBase);
      const path = url.pathname.replace(/\/api\/v1\/?$/, '') || '';
      url.pathname = path;
      return url.origin + url.pathname;
    } catch {
      return apiBase.replace(/\/api\/v1$/, '');
    }
  })();

  const normalizeUser = (user = {}) => {
    const expertiseList = Array.isArray(user.expertise)
      ? user.expertise
      : user.expertise
      ? String(user.expertise)
          .split(',')
          .map((v) => v.trim())
          .filter(Boolean)
      : [];
    return {
      ...user,
      state: formatState(user.state || ''),
      expertise: expertiseList,
    };
  };

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
      const user = normalizeUser(data.user || {});
      setProfile(user);
      setForm({
        full_name: user.full_name || '',
        email: user.email || '',
        phone: user.phone || '',
        state: user.state || '',
        city: user.city || '',
        about: user.about || '',
        expertise: user.expertise || [],
        years_of_experience: user.years_of_experience || '',
        law_firm: user.law_firm || '',
        sijil_certificate: user.sijil_certificate || '',
        law_firm_certificate: user.law_firm_certificate || '',
        profile_image: user.profile_image || '',
      });
    } catch (err) {
      setError(err.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const uploadFile = async (fieldKey, file, label) => {
    if (!file) return;
    const loadingKey = fieldKey === 'sijil_certificate' ? 'sijil' : fieldKey === 'law_firm_certificate' ? 'firm' : 'avatar';
    setUploading((u) => ({ ...u, [loadingKey]: true }));
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch(`${apiBase}/files/upload`, { method: 'POST', body: formData });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || `${label} upload failed`);
      }
      const data = await res.json();
      setForm((prev) => ({ ...prev, [fieldKey]: data.url || '' }));
    } catch (err) {
      setError(err.message || `${label} upload failed`);
    } finally {
      setUploading((u) => ({ ...u, [loadingKey]: false }));
    }
  };

  const fileDisplayUrl = (rawUrl) => {
    if (!rawUrl) return '';
    const value = String(rawUrl);
    if (value.startsWith('http')) return value;
    const prefix = apiRoot.endsWith('/') ? apiRoot.slice(0, -1) : apiRoot;
    const path = value.startsWith('/') ? value : `/${value}`;
    return `${prefix}${path}`;
  };

  const saveProfile = async () => {
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
        profile_image: form.profile_image,
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

  const detailRow = (label, value, fieldKey, isFull = false, isText = false) => {
    const editable = editing && fieldKey;
    const inputProps = {
      value: form[fieldKey] ?? '',
      onChange: (e) => setForm((prev) => ({ ...prev, [fieldKey]: e.target.value })),
    };
    return (
      <div className={`profile-row ${isFull ? 'span-full' : ''}`} key={label}>
        <span className="profile-label">{label}</span>
        {editable ? (
          isText ? (
            <textarea className="profile-input profile-textarea" rows={4} {...inputProps} />
          ) : (
            <input className="profile-input" {...inputProps} />
          )
        ) : (
          <span className="profile-value">{value || '—'}</span>
        )}
      </div>
    );
  };

  const fileRow = (label, fieldKey) => {
    const rawUrl = form[fieldKey] || '';
    const displayUrl = fileDisplayUrl(rawUrl);
    const loadingKey = fieldKey === 'sijil_certificate' ? 'sijil' : fieldKey === 'law_firm_certificate' ? 'firm' : 'avatar';
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
              '—'
            )}
          </span>
        ) : (
          <div className="file-actions">
            {rawUrl ? (
              <>
                <a className="profile-link" href={displayUrl} target="_blank" rel="noreferrer">
                  {fileName || 'View file'}
                </a>
                <button className="ghost-btn" onClick={() => setForm((prev) => ({ ...prev, [fieldKey]: '' }))}>
                  Remove
                </button>
              </>
            ) : (
              <span className="profile-value">No file</span>
            )}
            <label className="upload-btn">
              {uploading[loadingKey] ? 'Uploading…' : rawUrl ? 'Replace' : 'Upload'}
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => uploadFile(fieldKey, e.target.files?.[0], label)}
              />
            </label>
          </div>
        )}
      </div>
    );
  };

  const profileImageRow = () => {
    const rawUrl = form.profile_image || '';
    const displayUrl = fileDisplayUrl(rawUrl);
    return (
      <div className="profile-row avatar-row" key="profile-image">
        <span className="profile-label">Profile photo</span>
        {!editing ? (
          displayUrl ? <img src={displayUrl} alt="Profile" className="avatar-preview" /> : <div className="avatar-placeholder">—</div>
        ) : (
          <div className="avatar-edit">
            {displayUrl ? <img src={displayUrl} alt="Profile" className="avatar-preview" /> : <div className="avatar-placeholder">No image</div>}
            <div className="file-actions">
              {rawUrl && (
                <button className="ghost-btn" onClick={() => setForm((prev) => ({ ...prev, profile_image: '' }))}>
                  Remove
                </button>
              )}
              <label className="upload-btn">
                {uploading.avatar ? 'Uploading…' : rawUrl ? 'Replace' : 'Upload'}
                <input type="file" accept="image/*" onChange={(e) => uploadFile('profile_image', e.target.files?.[0], 'Profile photo')} />
              </label>
            </div>
          </div>
        )}
      </div>
    );
  };

  const expertiseRow = () => {
    const selected = Array.isArray(form.expertise) ? form.expertise : [];
    return (
      <div className="profile-row" key="expertise">
        <span className="profile-label">Expertise</span>
        {!editing ? (
          <span className="profile-value">{selected.length ? selected.join(', ') : '—'}</span>
        ) : (
          <div className="expertise-select">
            <div className="expertise-summary" onClick={() => setExpertiseOpen((o) => !o)}>
              <span>{selected.length ? `${selected.length} selected` : 'Choose expertise'}</span>
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
                            const next = checked ? prev.expertise.filter((v) => v !== opt) : [...prev.expertise, opt];
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
            {selected.length > 0 && (
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
            )}
          </div>
        )}
      </div>
    );
  };

  if (error) {
    return (
      <LawyerLayout activeKey="cases" bodyClassName="profile-shell">
        <p className="admin-error">{error}</p>
      </LawyerLayout>
    );
  }

  if (loading || !profile) {
    return (
      <LawyerLayout activeKey="cases" bodyClassName="profile-shell">
        <p className="muted">Loading...</p>
      </LawyerLayout>
    );
  }

  return (
    <LawyerLayout activeKey="cases" bodyClassName="profile-shell">
      <div className="profile-card profile-card--wide profile-card--no-padding">
        <div className="profile-inner">
          <div className="profile-card__head">
            <div>
              <p className="lp-kicker">Account</p>
              <h1 className="lp-title">Lawyer Profile</h1>
              <p className="lp-subtitle">All details captured during registration.</p>
            </div>
            <div className="profile-actions">
              {!editing ? (
                <button className="primary-btn" onClick={() => setEditing(true)}>
                  Edit
                </button>
              ) : (
                <>
                  <button className="ghost-btn" onClick={() => { setEditing(false); fetchProfile(); }}>Cancel</button>
                  <button className="primary-btn" onClick={saveProfile} disabled={saving}>
                    {saving ? 'Saving…' : 'Save'}
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="profile-grid">
            {profileImageRow()}
            {detailRow('Full name', profile.full_name, 'full_name')}
            {detailRow('Email', profile.email, null)}
            {detailRow('Phone', profile.phone, 'phone')}
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
                  onChange={(e) => setForm((prev) => ({ ...prev, state: e.target.value }))}
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
            {detailRow('About', profile.about, 'about', true, true)}
          </div>
        </div>
      </div>
    </LawyerLayout>
  );
}
