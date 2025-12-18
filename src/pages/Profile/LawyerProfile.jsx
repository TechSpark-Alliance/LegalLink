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

export default function LawyerProfilePage() {
  const navigate = useNavigate();
  const apiBase = import.meta.env.VITE_APP_API || 'http://localhost:8000/api/v1';
  const token = localStorage.getItem('token') || sessionStorage.getItem('token') || '';

  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({});
  const [editing, setEditing] = useState(true);
  const [activePanel, setActivePanel] = useState('account');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [toast, setToast] = useState('');
  const [uploading, setUploading] = useState({ avatar: false, sijil: false, firm: false });
  const [expertiseOpen, setExpertiseOpen] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');

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

  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(() => setToast(''), 3000);
    return () => clearTimeout(timer);
  }, [toast]);

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
    const nextErrors = {};
    if (!form.law_firm) nextErrors.law_firm = 'Law firm is required.';
    if (!form.years_of_experience) nextErrors.years_of_experience = 'Years of experience is required.';
    if (!Array.isArray(form.expertise) || form.expertise.length === 0) {
      nextErrors.expertise = 'Select at least one expertise category.';
    }
    setFieldErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

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
      setEditing(true);
      setToast('Profile updated successfully.');
    } catch (err) {
      setError(err.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const detailRow = (label, value, fieldKey, isFull = false, isText = false, inputType = 'text') => {
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
            <input className="profile-input" type={inputType} {...inputProps} />
          )
        ) : (
          <span className="profile-value">{value || '-'}</span>
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
              '-'
            )}
          </span>
        ) : (
          <div className="file-actions">
            {rawUrl ? (
              <div className="file-meta">
                <span className="profile-value">{fileName}</span>
                <a className="profile-link" href={displayUrl} target="_blank" rel="noreferrer">
                  View
                </a>
              </div>
            ) : (
              <span className="profile-value">No file uploaded</span>
            )}
            <label className="upload-btn">
              {uploading[loadingKey] ? 'Uploading...' : rawUrl ? 'Replace' : 'Upload'}
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => uploadFile(fieldKey, e.target.files?.[0], label)}
              />
            </label>
            <span className="form-hint">Accepted formats: PDF, JPG, PNG (max 10MB)</span>
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
          displayUrl ? <img src={displayUrl} alt="Profile" className="avatar-preview" /> : <div className="avatar-placeholder">-</div>
        ) : (
          <div className="avatar-edit">
            {displayUrl ? <img src={displayUrl} alt="Profile" className="avatar-preview" /> : <div className="avatar-placeholder">No image</div>}
            <div className="file-actions">
              <label className="upload-btn">
                {uploading.avatar ? 'Uploading...' : rawUrl ? 'Replace' : 'Upload'}
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
          <span className="profile-value">{selected.length ? selected.join(', ') : '-'}</span>
        ) : (
          <div className="expertise-select">
            <div className="expertise-summary" onClick={() => setExpertiseOpen((o) => !o)}>
              <span>{selected.length ? `${selected.length} selected` : 'Choose expertise'}</span>
              <span className="caret">v</span>
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
                      x
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

  const statusBadge = profile?.status?.is_verified ? 'Verified' : profile?.status ? 'Pending' : '';
  const subscription = profile?.subscription || {};
  const subscriptionStatus = subscription.status || 'Trial';
  const subscriptionDate = subscription.renewal_date || subscription.next_billing_date || 'May 30, 2025';
  const isSubscribed = Boolean(subscription.status);
  const aboutCount = (form.about || '').length;
  const aboutLimit = 500;

  const handleCancel = () => {
    setFieldErrors({});
    fetchProfile();
    setEditing(true);
  };

  return (
    <LawyerLayout activeKey="cases" bodyClassName="profile-shell">
      <div className="lawyer-profile-page">
        <aside className="profile-sidebar">
          <h2 className="sidebar-title">Profile</h2>
          <button
            type="button"
            className={`sidebar-link ${activePanel === 'account' ? 'active' : ''}`}
            onClick={() => setActivePanel('account')}
          >
            Account Settings
          </button>
          <button
            type="button"
            className={`sidebar-link ${activePanel === 'subscription' ? 'active' : ''}`}
            onClick={() => setActivePanel('subscription')}
          >
            Manage Subscription
          </button>
        </aside>

        <section className="profile-content">
          {activePanel === 'account' ? (
            <div className="profile-panel">
              <div className="profile-header-card">
                <div className="profile-header-left">
                  <div className="profile-avatar-block">
                    {profileImageRow()}
                  </div>
                  <div>
                    <h1 className="profile-name">{profile.full_name || 'Lawyer Profile'}</h1>
                    {statusBadge && <span className="status-badge">{statusBadge}</span>}
                  </div>
                </div>
                <div className="profile-actions">
                  <button className="ghost-btn" onClick={handleCancel}>
                    Cancel
                  </button>
                  <button className="primary-btn" onClick={saveProfile} disabled={saving}>
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>

              <div className="profile-section">
                <h3>Account Details</h3>
                <div className="profile-grid">
                  {detailRow('Full name', profile.full_name, 'full_name')}
                  {detailRow('Email', profile.email, null)}
                  {detailRow('Phone', profile.phone, 'phone', false, false, 'tel')}
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
                  {detailRow('City', profile.city, 'city')}
                </div>
              </div>

              <div className="profile-section">
                <h3>Lawyer Details</h3>
                <div className="profile-grid">
                  {fileRow('Sijil Annual & Practicing Certificate', 'sijil_certificate')}
                  <div className="profile-row">
                    <span className="profile-label">Law firm</span>
                    <input
                      className="profile-input"
                      value={form.law_firm ?? ''}
                      onChange={(e) => setForm((prev) => ({ ...prev, law_firm: e.target.value }))}
                    />
                    {fieldErrors.law_firm && <span className="field-error">{fieldErrors.law_firm}</span>}
                  </div>
                  {fileRow('Certificate of Registration of Law Firm', 'law_firm_certificate')}
                  {expertiseRow()}
                  <div className="profile-row">
                    <span className="profile-label">Years of experience</span>
                    <input
                      className="profile-input"
                      type="number"
                      min="0"
                      value={form.years_of_experience ?? ''}
                      onChange={(e) => setForm((prev) => ({ ...prev, years_of_experience: e.target.value }))}
                    />
                    {fieldErrors.years_of_experience && (
                      <span className="field-error">{fieldErrors.years_of_experience}</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="profile-section">
                <h3>About Me</h3>
                <div className="profile-row span-full">
                  <textarea
                    className="profile-input profile-textarea"
                    rows={5}
                    maxLength={aboutLimit}
                    value={form.about ?? ''}
                    onChange={(e) => setForm((prev) => ({ ...prev, about: e.target.value }))}
                  />
                  <div className="form-hint">{aboutCount}/{aboutLimit} characters</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="profile-panel">
              <div className="profile-section">
                <h3>Manage Subscription</h3>
                <div className="subscription-card">
                  <div className="subscription-header">
                    <div>
                      <h4>Monthly Plan</h4>
                      <p className="subscription-price">RM150 / month</p>
                    </div>
                    <span className="trial-badge">Trial: 1 month</span>
                  </div>
                  <ul className="subscription-list">
                    <li>Moderate outreach to potential clients</li>
                    <li>Limited access to all platform features</li>
                    <li>1-month trial period before subscription begins</li>
                  </ul>
                  <div className="subscription-meta">
                    <div>Current plan: {isSubscribed ? 'Monthly Plan' : 'None'}</div>
                    <div>Status: {subscriptionStatus}</div>
                    <div>Next billing: {subscriptionDate}</div>
                  </div>
                  <div className="subscription-actions">
                    {isSubscribed ? (
                      <>
                        <button type="button" className="primary-btn">
                          Manage subscription
                        </button>
                        <button type="button" className="ghost-btn">
                          Cancel plan
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        className="primary-btn"
                        onClick={() => setShowPayment(true)}
                      >
                        Subscribe
                      </button>
                    )}
                  </div>
                </div>

                {showPayment && !isSubscribed && (
                  <div className="payment-card">
                    <div className="payment-header">
                      <div>
                        <h4>Payment method</h4>
                        <p className="payment-subtitle">Secure checkout powered by Stripe (UI only).</p>
                      </div>
                      <span className="payment-badge">Cards accepted</span>
                    </div>
                    <div className="payment-methods">
                      <button
                        type="button"
                        className={`method-pill ${paymentMethod === 'card' ? 'active' : ''}`}
                        onClick={() => setPaymentMethod('card')}
                      >
                        Card (Visa/Mastercard)
                      </button>
                      <button
                        type="button"
                        className={`method-pill ${paymentMethod === 'fpx' ? 'active' : ''}`}
                        onClick={() => setPaymentMethod('fpx')}
                      >
                        Internet Banking (FPX)
                      </button>
                    </div>
                    <div className="payment-grid">
                      {paymentMethod === 'card' ? (
                        <>
                          <div className="payment-field span-full">
                            <label htmlFor="cardName">Name on card</label>
                            <input id="cardName" type="text" placeholder="e.g. Aisyah Rahman" />
                          </div>
                          <div className="payment-field span-full">
                            <label htmlFor="cardNumber">Card number</label>
                            <input id="cardNumber" type="text" placeholder="1234 5678 9012 3456" />
                          </div>
                          <div className="payment-field">
                            <label htmlFor="cardExpiry">Expiry</label>
                            <input id="cardExpiry" type="text" placeholder="MM / YY" />
                          </div>
                          <div className="payment-field">
                            <label htmlFor="cardCvc">CVC</label>
                            <input id="cardCvc" type="text" placeholder="123" />
                          </div>
                          <div className="payment-field">
                            <label htmlFor="billingEmail">Billing email</label>
                            <input id="billingEmail" type="email" placeholder="email@example.com" />
                          </div>
                          <div className="payment-field">
                            <label htmlFor="billingZip">Postal code</label>
                            <input id="billingZip" type="text" placeholder="56000" />
                          </div>
                          <div className="payment-field span-full">
                            <label htmlFor="billingCountry">Country</label>
                            <select id="billingCountry" defaultValue="MY">
                              <option value="MY">Malaysia</option>
                              <option value="SG">Singapore</option>
                              <option value="ID">Indonesia</option>
                              <option value="TH">Thailand</option>
                            </select>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="payment-field span-full">
                            <label htmlFor="fpxBank">Select bank</label>
                            <select id="fpxBank" defaultValue="">
                              <option value="" disabled>
                                Choose your bank
                              </option>
                              <option value="maybank">Maybank</option>
                              <option value="cimb">CIMB</option>
                              <option value="public">Public Bank</option>
                              <option value="rhb">RHB</option>
                              <option value="hongleong">Hong Leong</option>
                            </select>
                          </div>
                          <div className="payment-field span-full">
                            <label htmlFor="fpxEmail">Billing email</label>
                            <input id="fpxEmail" type="email" placeholder="email@example.com" />
                          </div>
                        </>
                      )}
                    </div>
                    <div className="payment-actions">
                      <button type="button" className="primary-btn">
                        {paymentMethod === 'card' ? 'Pay RM150' : 'Continue to bank'}
                      </button>
                      <button type="button" className="ghost-btn" onClick={() => setShowPayment(false)}>
                        Cancel
                      </button>
                    </div>
                    <p className="payment-hint">
                      By clicking pay, you agree to our terms and Stripe processing. This is a UI placeholder.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </section>
      </div>
      {toast && <div className="toast success">{toast}</div>}
    </LawyerLayout>
  );
}
