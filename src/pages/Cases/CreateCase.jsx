import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './CreateCase.css';
import logo from '../../assets/legal-link-logo.png';

const steps = ['Client', 'Matter', 'Party Involved', 'Finish'];
const API_BASE = import.meta.env.VITE_APP_API || 'http://localhost:8000/api/v1';

const requiredByStep = {
  0: ['clientName', 'phone', 'email'],
  1: ['matterType', 'matterTitle', 'fileCode'],
};

const matterTypeOptions = [
  'Criminal',
  'Corporate',
  'Family',
  'Employment',
  'Intellectual Property',
  'Real Estate',
  'Litigation',
  'Arbitration',
  'Tax',
  'Immigration',
  'Other',
];

export default function CreateCase() {
  const navigate = useNavigate();
  const initialForm = {
    clientName: '',
    phone: '',
    email: '',
    nric: '',
    companyReg: '',
    address: '',
    matterType: '',
    matterTypeOther: '',
    subCategory: '',
    matterTitle: '',
    fileCode: '',
    description: '',
    opposingParty: '',
    opposingFirm: '',
    additionalParties: '',
    openDate: '',
    closeDate: '',
    additionalParty1: '',
    additionalParty2: '',
    additionalParty3: '',
    additionalParty4: '',
    additionalParty5: '',
  };

  const [form, setForm] = useState(initialForm);
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [lawyerName, setLawyerName] = useState('Profile');
  const [menuOpen, setMenuOpen] = useState(false);
  const openDateRef = useRef(null);
  const closeDateRef = useRef(null);

  useEffect(() => {
    const role = localStorage.getItem('role') || sessionStorage.getItem('role');
    if (role && role !== 'lawyer') {
      navigate('/login', { replace: true });
      return;
    }
    let name = '';
    try {
      const storedUser = localStorage.getItem('user') || sessionStorage.getItem('user');
      if (storedUser && storedUser !== 'undefined') {
        const parsed = JSON.parse(storedUser);
        name = parsed?.full_name || parsed?.fullName || parsed?.email || '';
      }
    } catch {
      /* ignore */
    }
    if (!name) {
      name =
        localStorage.getItem('full_name') ||
        sessionStorage.getItem('full_name') ||
        '';
    }
    if (name) setLawyerName(name);
  }, []);

  const handleLogout = async () => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    try {
      const apiBase = import.meta.env.VITE_APP_API || 'http://localhost:8000/api/v1';
      if (token) {
        await fetch(`${apiBase}/auth/user/logout`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });
      }
    } catch {
      /* ignore logout errors */
    } finally {
      localStorage.clear();
      sessionStorage.clear();
      navigate('/login');
    }
  };

  const progress = useMemo(() => ((step + 1) / steps.length) * 100, [step]);

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const validateStep = (targetStep = step) => {
    const requiredFields = requiredByStep[targetStep] || [];
    const nextErrors = { ...errors };
    let ok = true;
    requiredFields.forEach((field) => {
      if (!form[field]?.trim()) {
        nextErrors[field] = 'Required';
        ok = false;
      }
    });
    setErrors(nextErrors);
    return ok;
  };

  const goNext = () => {
    if (!validateStep(step)) return;
    setStep((s) => Math.min(s + 1, steps.length - 1));
  };

  const goBack = () => {
    setSubmitError('');
    setStep((s) => Math.max(s - 1, 0));
  };

  const getAdditionalPartyCount = () => {
    const count = parseInt(form.additionalParties, 10);
    return Number.isFinite(count) && count > 0 ? Math.min(count, 5) : 0;
  };

  const handleSubmit = async () => {
    const allRequired = [...(requiredByStep[0] || []), ...(requiredByStep[1] || [])];
    const missing = allRequired.filter((f) => !form[f]?.trim());
    if (missing.length) {
      validateStep(0);
      validateStep(1);
      setStep(0);
      return;
    }

    const payload = {
      client_name: form.clientName,
      phone: form.phone,
      email: form.email,
      nric: form.nric || null,
      company_reg: form.companyReg || null,
      address: form.address || null,
      matter_type: form.matterType === 'Other' ? form.matterTypeOther || 'Other' : form.matterType,
      sub_category: form.subCategory || null,
      matter_title: form.matterTitle,
      file_code: form.fileCode,
      description: form.description || null,
      open_date: form.openDate || null,
      close_date: form.closeDate || null,
      opposing_party: form.opposingParty || null,
      opposing_firm: form.opposingFirm || null,
      additional_parties: getAdditionalPartyCount() || null,
      additional_party1: form.additionalParty1 || null,
      additional_party2: form.additionalParty2 || null,
      additional_party3: form.additionalParty3 || null,
      additional_party4: form.additionalParty4 || null,
      additional_party5: form.additionalParty5 || null,
      lawyer_id: (localStorage.getItem('user_id') || sessionStorage.getItem('user_id')) || null,
      status: 'Active',
    };

    setSubmitting(true);
    setSubmitError('');
    try {
      const apiBase = import.meta.env.VITE_APP_API || 'http://localhost:8000/api/v1';
      const token = localStorage.getItem('token') || sessionStorage.getItem('token') || '';
      const res = await fetch(`${apiBase}/cases`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || 'Failed to create case');
      }
      navigate('/lawyer/cases');
    } catch (err) {
      setSubmitError('Failed to create case. Please try again or check API wiring.');
    } finally {
      setSubmitting(false);
    }
  };

  const navItems = [
    { key: 'cases', label: 'Cases', path: '/lawyer/cases' },
    { key: 'clients', label: 'Clients', path: '/lawyer/clients' },
    { key: 'appointments', label: 'Appointments', path: '/lawyer/appointments' },
    { key: 'conversations', label: 'Conversations', path: '/lawyer/conversations' },
  ];

  return (
    <div className="create-shell">
      <header className="create-shell__top">
        <div className="create-shell__brand">
          <img src={logo} alt="LegalLink" className="brand-logo" />
          <span className="brand-name">LegalLink</span>
        </div>
        <nav className="create-shell__nav">
          {navItems.map((item) => (
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

      <main className="create-shell__body">
        <div className="wizard-card">
          <div className="wizard-progress">
            <div className="progress-label">Overall Progress</div>
            <div className="progress-track">
              <div className="progress-bar" style={{ width: `${progress}%` }} />
            </div>
          </div>

          <div className="wizard-steps">
            {steps.map((label, i) => (
              <div
                key={label}
                className={`wizard-step ${i === step ? 'current' : ''} ${i < step ? 'done' : ''}`}
              >
                <span className="step-index">{i + 1}</span>
                <span className="step-label">{label}</span>
              </div>
            ))}
          </div>

          {step === 0 && (
            <div className="wizard-form">
              <h3>Client Information</h3>
              <div className="form-grid">
                <label>
                  Client name *
                  <input
                    value={form.clientName}
                    onChange={(e) => updateField('clientName', e.target.value)}
                    placeholder="Enter client name"
                  />
                  {errors.clientName && <span className="field-error">{errors.clientName}</span>}
                </label>
                <label>
                  NRIC
                  <input
                    value={form.nric}
                    onChange={(e) => updateField('nric', e.target.value)}
                    placeholder="Enter NRIC"
                  />
                </label>
                <label>
                  Phone number *
                  <input
                    value={form.phone}
                    onChange={(e) => updateField('phone', e.target.value)}
                    placeholder="Enter phone number"
                  />
                  {errors.phone && <span className="field-error">{errors.phone}</span>}
                </label>
                <label>
                  Company registration number
                  <input
                    value={form.companyReg}
                    onChange={(e) => updateField('companyReg', e.target.value)}
                    placeholder="Enter company registration number"
                  />
                </label>
                <label>
                  Email *
                  <input
                    value={form.email}
                    onChange={(e) => updateField('email', e.target.value)}
                    placeholder="Enter email address"
                  />
                  {errors.email && <span className="field-error">{errors.email}</span>}
                </label>
                <label>
                  Address
                  <input
                    value={form.address}
                    onChange={(e) => updateField('address', e.target.value)}
                    placeholder="Enter address"
                  />
                </label>
              </div>
              <div className="form-actions">
                <button className="ghost-btn" onClick={() => navigate('/lawyer/cases')}>
                  Cancel
                </button>
                <button className="primary-btn" onClick={goNext}>
                  Next
                </button>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="wizard-form">
              <h3>Matter Details</h3>
              <div className="form-grid">
                <label>
                  Open date
                  <div className="date-field">
                    <input
                      type="date"
                      ref={openDateRef}
                      value={form.openDate}
                      onChange={(e) => updateField('openDate', e.target.value)}
                    />
                    <button
                      type="button"
                      className="date-trigger"
                      onClick={() => openDateRef.current?.showPicker?.()}
                    >
                      <svg className="icon-cal" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                        <rect x="3" y="5" width="18" height="16" rx="2" ry="2" />
                        <path d="M3 9h18" />
                        <rect x="7" y="3" width="2" height="4" />
                        <rect x="15" y="3" width="2" height="4" />
                      </svg>
                    </button>
                  </div>
                </label>
                <label>
                  Close date
                  <div className="date-field">
                    <input
                      type="date"
                      ref={closeDateRef}
                      value={form.closeDate}
                      onChange={(e) => updateField('closeDate', e.target.value)}
                    />
                    <button
                      type="button"
                      className="date-trigger"
                      onClick={() => closeDateRef.current?.showPicker?.()}
                    >
                      <svg className="icon-cal" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                        <rect x="3" y="5" width="18" height="16" rx="2" ry="2" />
                        <path d="M3 9h18" />
                        <rect x="7" y="3" width="2" height="4" />
                        <rect x="15" y="3" width="2" height="4" />
                      </svg>
                    </button>
                  </div>
                </label>
                <label>
                  Matter type *
                  <select
                    value={form.matterType}
                    onChange={(e) => updateField('matterType', e.target.value)}
                  >
                    <option value="">Choose matter type</option>
                    {matterTypeOptions.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                  {form.matterType === 'Other' && (
                    <input
                      className="stacked-input"
                      value={form.matterTypeOther}
                      onChange={(e) => updateField('matterTypeOther', e.target.value)}
                      placeholder="Specify matter type"
                    />
                  )}
                  {errors.matterType && <span className="field-error">{errors.matterType}</span>}
                </label>
                <label>
                  Sub-category
                  <input
                    value={form.subCategory}
                    onChange={(e) => updateField('subCategory', e.target.value)}
                    placeholder="Enter sub-category"
                  />
                </label>
                <label>
                  Matter title *
                  <input
                    value={form.matterTitle}
                    onChange={(e) => updateField('matterTitle', e.target.value)}
                    placeholder="Enter matter title"
                  />
                  {errors.matterTitle && <span className="field-error">{errors.matterTitle}</span>}
                </label>
                <label>
                  File code / file reference no. *
                  <input
                    value={form.fileCode}
                    onChange={(e) => updateField('fileCode', e.target.value)}
                    placeholder="Enter file code"
                  />
                  {errors.fileCode && <span className="field-error">{errors.fileCode}</span>}
                </label>
                <label className="full-row">
                  Matter description
                  <textarea
                    value={form.description}
                    onChange={(e) => updateField('description', e.target.value)}
                    placeholder="Type your description"
                  />
                </label>
              </div>
              <div className="form-actions">
                <button className="ghost-btn" onClick={goBack}>
                  Back
                </button>
                <button className="primary-btn" onClick={goNext}>
                  Next
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="wizard-form">
              <h3>Parties involved</h3>
              <div className="form-grid">
                <label>
                  Opposing party name
                  <input
                    value={form.opposingParty}
                    onChange={(e) => updateField('opposingParty', e.target.value)}
                    placeholder="Type name"
                  />
                </label>
                <label>
                  Opposing lawyer / firm
                  <input
                    value={form.opposingFirm}
                    onChange={(e) => updateField('opposingFirm', e.target.value)}
                    placeholder="Enter firm"
                  />
                </label>
                <label>
                  Number of additional parties
                  <input
                    value={form.additionalParties}
                    onChange={(e) => updateField('additionalParties', e.target.value)}
                    placeholder="Choose number"
                  />
                </label>
                {Array.from({ length: getAdditionalPartyCount() }).map((_, idx) => (
                  <label key={`party-${idx + 1}`}>
                    Additional party {idx + 1} name
                    <input
                      placeholder="Type name"
                      value={form[`additionalParty${idx + 1}`] || ''}
                      onChange={(e) => updateField(`additionalParty${idx + 1}`, e.target.value)}
                    />
                  </label>
                ))}
              </div>
              <div className="form-actions">
                <button className="ghost-btn" onClick={goBack}>
                  Back
                </button>
                <button className="primary-btn" onClick={() => setStep(3)}>
                  Next
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="wizard-form">
              <h3>Review &amp; Create Case</h3>
              <p className="muted">Please review your responses before final submission.</p>
              <div className="review-grid">
                <div>
                  <div className="review-label">Client name</div>
                  <div className="review-value">{form.clientName || '-'}</div>
                </div>
                <div>
                  <div className="review-label">NRIC</div>
                  <div className="review-value">{form.nric || '-'}</div>
                </div>
                <div>
                  <div className="review-label">Phone number</div>
                  <div className="review-value">{form.phone || '-'}</div>
                </div>
                <div>
                  <div className="review-label">Company registration number</div>
                  <div className="review-value">{form.companyReg || '-'}</div>
                </div>
                <div>
                  <div className="review-label">Email</div>
                  <div className="review-value">{form.email || '-'}</div>
                </div>
                <div>
                  <div className="review-label">Address</div>
                  <div className="review-value">{form.address || '-'}</div>
                </div>
                <div>
                  <div className="review-label">Open date</div>
                  <div className="review-value">{form.openDate || '-'}</div>
                </div>
                <div>
                  <div className="review-label">Close date</div>
                  <div className="review-value">{form.closeDate || '-'}</div>
                </div>
                <div>
                  <div className="review-label">Matter type</div>
                  <div className="review-value">
                    {form.matterType === 'Other'
                      ? form.matterTypeOther || 'Other'
                      : form.matterType || '-'}
                  </div>
                </div>
                <div>
                  <div className="review-label">Sub-category</div>
                  <div className="review-value">{form.subCategory || '-'}</div>
                </div>
                <div>
                  <div className="review-label">Matter title</div>
                  <div className="review-value">{form.matterTitle || '-'}</div>
                </div>
                <div>
                  <div className="review-label">File code</div>
                  <div className="review-value">{form.fileCode || '-'}</div>
                </div>
                <div className="full-row">
                  <div className="review-label">Matter description</div>
                  <div className="review-value">{form.description || '-'}</div>
                </div>
                <div>
                  <div className="review-label">Opposing party</div>
                  <div className="review-value">{form.opposingParty || '-'}</div>
                </div>
                <div>
                  <div className="review-label">Opposing lawyer / firm</div>
                  <div className="review-value">{form.opposingFirm || '-'}</div>
                </div>
                <div className="full-row">
                  <div className="review-label">Additional parties</div>
                  <div className="review-value">
                    {getAdditionalPartyCount() === 0 && '-'}
                    {getAdditionalPartyCount() > 0 && (
                      <ul className="review-list">
                        {Array.from({ length: getAdditionalPartyCount() }).map((_, idx) => (
                          <li key={`review-party-${idx + 1}`}>
                            Additional party {idx + 1}: {form[`additionalParty${idx + 1}`] || '-'}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>
              {submitError && <div className="submit-error">{submitError}</div>}
              <div className="form-actions">
                <button className="ghost-btn" onClick={goBack}>
                  Back
                </button>
                <button className="primary-btn" onClick={handleSubmit} disabled={submitting}>
                  {submitting ? 'Submitting...' : 'Submit'}
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
