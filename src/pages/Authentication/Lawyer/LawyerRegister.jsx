import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './LawyerRegister.css';
import logo from '../../../assets/legal-link-logo.png';
import heroIllustration from '../../../assets/legal-hero.png';

const PersonIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" />
    <path d="M5 20c0-3.866 3.134-7 7-7s7 3.134 7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const MailIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="2" />
    <path d="M4 6l8 6 8-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const LockIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <rect x="5" y="10" width="14" height="11" rx="2" stroke="currentColor" strokeWidth="2" />
    <path d="M9 10V7a3 3 0 0 1 6 0v3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const PhoneIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path
      d="M6.5 3h3l1.5 4-2 1.5c1 2 2.5 3.5 4.5 4.5L15 11l4 1.5v3a2 2 0 0 1-2 2c-6.627 0-12-5.373-12-12a2 2 0 0 1 2-2z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const LocationIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path
      d="M12 21s7-6.1 7-11.5S16.523 3 12 3 5 5.5 5 9.5 12 21 12 21z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="12" cy="9.5" r="2.5" stroke="currentColor" strokeWidth="2" />
  </svg>
);

const UploadIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M12 16V5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M8 9l4-4 4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M5 19h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const DocumentIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <rect x="5" y="3" width="14" height="18" rx="2" stroke="currentColor" strokeWidth="2" />
    <path d="M8 8h8M8 12h8M8 16h5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const TickIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M4 12.5l5 5 11-11" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const SubmitIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path
      d="M5 4h9a2 2 0 0 1 2 2v3"
      stroke="#1c2740"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
    <path
      d="M5 20h9a2 2 0 0 0 2-2v-2"
      stroke="#1c2740"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
    <path
      d="M5 4v16"
      stroke="#1c2740"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
    <path
      d="M12.5 13.5l2 2 4-4"
      stroke="#1c2740"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  </svg>
);

const EyeIcon = () => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path
      d="M1.75 12s3.5-7 10.25-7 10.25 7 10.25 7-3.5 7-10.25 7S1.75 12 1.75 12z"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8" />
  </svg>
);

const LawyerRegister = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    state: '',
    city: '',
    sijilCertificate: '',
    sijilCertificateUrl: '',
    lawFirm: '',
    lawFirmCertificate: '',
    lawFirmCertificateUrl: '',
    expertise: [],
    yearsOfExperience: '',
    about: '',
  });
  const [fileInputKeys, setFileInputKeys] = useState({
    sijilCertificate: 0,
    lawFirmCertificate: 0,
  });
  const [showExpertiseMenu, setShowExpertiseMenu] = useState(false);

  const expertiseOptions = [
    { value: 'litigation', label: 'Litigation' },
    { value: 'corporate', label: 'Corporate' },
    { value: 'family', label: 'Family' },
    { value: 'criminal', label: 'Criminal' },
    { value: 'employment', label: 'Employment' },
    { value: 'ip', label: 'Intellectual Property' },
    { value: 'tax', label: 'Tax' },
    { value: 'real-estate', label: 'Real Estate' },
    { value: 'immigration', label: 'Immigration' },
    { value: 'other', label: 'Other' },
  ];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setErrors((prev) => ({ ...prev, [e.target.name]: '' }));
  };

  const isFilled = (val) => {
    if (Array.isArray(val)) return val.length > 0;
    if (typeof val === 'string') return val.trim() !== '';
    return !!val;
  };

  const handleExpertiseChange = (e) => {
    const selected = Array.from(e.target.selectedOptions).map((opt) => opt.value);
    setFormData((prev) => ({ ...prev, expertise: selected }));
  };

  const toggleExpertise = (value) => {
    setFormData((prev) => {
      const exists = prev.expertise.includes(value);
      const next = exists ? prev.expertise.filter((v) => v !== value) : [...prev.expertise, value];
      return { ...prev, expertise: next };
    });
  };

  const removeExpertise = (value) => {
    setFormData((prev) => ({ ...prev, expertise: prev.expertise.filter((v) => v !== value) }));
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    const field = e.target.name;
    if (!file) return;
    try {
      setErrors((prev) => ({ ...prev, [field]: '' }));
      const apiBase = import.meta.env.VITE_APP_API || 'http://localhost:8000/api/v1';
      const formDataUpload = new FormData();
      formDataUpload.append('file', file);
      const res = await fetch(`${apiBase}/files/upload`, { method: 'POST', body: formDataUpload });
      if (!res.ok) {
        throw new Error('Upload failed');
      }
      const data = await res.json();
      setFormData((prev) => ({
        ...prev,
        [field]: data.stored_name || file.name,
        [`${field}Url`]: data.url,
      }));
    } catch (err) {
      setErrors((prev) => ({ ...prev, [field]: 'Upload failed' }));
    }
  };

  const handleClearFile = (field) => {
    setFormData({
      ...formData,
      [field]: '',
      [`${field}Url`]: '',
    });
    setFileInputKeys((prev) => ({
      ...prev,
      [field]: prev[field] + 1,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (currentStep === 1) {
      const requiredStep1 = [
        { key: 'fullName', label: 'Full Name' },
        { key: 'email', label: 'Email' },
        { key: 'password', label: 'Password' },
        { key: 'confirmPassword', label: 'Confirm password' },
        { key: 'phone', label: 'Contact number' },
        { key: 'state', label: 'State' },
        { key: 'city', label: 'City / District' },
      ];
      const missing = requiredStep1.filter((f) => !isFilled(formData[f.key]));
      if (missing.length) {
        const nextErrors = {};
        missing.forEach((m) => (nextErrors[m.key] = 'Please fill out this field.'));
        setErrors(nextErrors);
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        setErrors((prev) => ({ ...prev, confirmPassword: 'Passwords do not match.' }));
        return;
      }
      setErrors({});
      setCurrentStep(2);
      return;
    }

    if (currentStep === 2) {
      const requiredStep2 = [
        { key: 'sijilCertificate', label: 'Sijil Annual and Practising Certificate' },
        { key: 'expertise', label: 'Expertise category' },
        { key: 'yearsOfExperience', label: 'Years of experience' },
        { key: 'about', label: 'About' },
      ];
      const missing = requiredStep2.filter((f) => !isFilled(formData[f.key]));
      if (missing.length) {
        const nextErrors = {};
        missing.forEach((m) => (nextErrors[m.key] = 'Please fill out this field.'));
        setErrors(nextErrors);
        return;
      }
      setErrors({});
      setCurrentStep(3);
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match.');
      return;
    }
    if (!termsAccepted) {
      alert('Please accept the terms and conditions.');
      return;
    }

    try {
      setSubmitting(true);
      const apiBase = import.meta.env.VITE_APP_API || 'http://localhost:8000/api/v1';
      const res = await fetch(`${apiBase}/auth/user/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: formData.fullName,
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
          role: 'lawyer',
          state: formData.state,
          city: formData.city,
          sijil_certificate: formData.sijilCertificate,
          sijil_certificate_url: formData.sijilCertificateUrl || undefined,
          law_firm: formData.lawFirm || undefined,
          law_firm_certificate: formData.lawFirmCertificate || undefined,
          law_firm_certificate_url: formData.lawFirmCertificateUrl || undefined,
          expertise: formData.expertise,
          years_of_experience: formData.yearsOfExperience ? Number(formData.yearsOfExperience) : undefined,
          about: formData.about,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || 'Registration failed');
      }
      navigate('/home/lawyer');
    } catch (err) {
      alert(err.message || 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  };

  const progressWidth = currentStep === 1 ? '33%' : currentStep === 2 ? '66%' : '100%';

  return (
    <div className="auth-fluid legallink-auth">
      <div className="legallink-card">
        <section className="auth-fluid-form-box legallink-form-panel lawyer-register-panel">
          <div className="signin-brand">
            <img src={logo} alt="LegalLink logo" className="signin-logo" />
            <div>
              <p className="brand-label">LegalLink</p>
            </div>
          </div>

          <div className="register-progress">
            <div className="steps">
              <div className={`step ${currentStep === 1 ? 'active' : 'completed'}`}>
                <span className={`step-circle ${currentStep === 1 ? 'active' : 'completed'}`}>
                  <PersonIcon />
                </span>
                <span className="step-label">Account</span>
              </div>
              <div className={`step ${currentStep === 2 ? 'active' : currentStep > 2 ? 'completed' : 'pending'}`}>
                <span className={`step-circle ${currentStep === 2 ? 'active' : currentStep > 2 ? 'completed' : 'muted'}`}>
                  <DocumentIcon />
                </span>
                <span className="step-label">Details</span>
              </div>
              <div className={`step ${currentStep === 3 ? 'active' : 'pending'}`}>
                <span className={`step-circle ${currentStep === 3 ? 'active' : 'muted'}`}>
                  <TickIcon />
                </span>
                <span className="step-label">Finish</span>
              </div>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: progressWidth }} />
            </div>
          </div>

          <form className="signin-form lawyer-form" onSubmit={handleSubmit}>
            {currentStep === 1 && (
              <section className="section-card">
                <div className="section-head">
                  <span className="section-icon" aria-hidden="true">
                    <PersonIcon />
                  </span>
                  <div>
                    <p className="section-label">Account Information</p>
                    <p className="section-subtitle">Create your secure account credentials</p>
                  </div>
                </div>

                <div className="form-field">
                  <label htmlFor="fullName" className="label-with-icon">
                    <span className="label-icon" aria-hidden="true">
                      <PersonIcon />
                    </span>
                    Full Name
                  </label>
                  <input
                    id="fullName"
                    type="text"
                    name="fullName"
                    placeholder="Enter your name"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                  />
                  {errors.fullName && <p className="input-error">{errors.fullName}</p>}
                </div>

                <div className="form-field">
                  <label htmlFor="email" className="label-with-icon">
                    <span className="label-icon" aria-hidden="true">
                      <MailIcon />
                    </span>
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    name="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                  {errors.email && <p className="input-error">{errors.email}</p>}
                </div>

                <div className="form-field">
                  <label htmlFor="password" className="label-with-icon">
                    <span className="label-icon" aria-hidden="true">
                      <LockIcon />
                    </span>
                    Password
                  </label>
                  <div className="password-wrapper">
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={`${showPassword ? 'Hide' : 'Show'} password`}
                    >
                      <EyeIcon />
                    </button>
                  </div>
                  {errors.password && <p className="input-error">{errors.password}</p>}
                </div>

                <div className="form-field">
                  <label htmlFor="confirmPassword" className="label-with-icon">
                    <span className="label-icon" aria-hidden="true">
                      <LockIcon />
                    </span>
                    Confirm password
                  </label>
                  <div className="password-wrapper">
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      placeholder="Enter your password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      aria-label={`${showConfirmPassword ? 'Hide' : 'Show'} password`}
                    >
                      <EyeIcon />
                    </button>
                  </div>
                  {errors.confirmPassword && <p className="input-error">{errors.confirmPassword}</p>}
                </div>

                <div className="form-field">
                  <label htmlFor="phone" className="label-with-icon">
                    <span className="label-icon" aria-hidden="true">
                      <PhoneIcon />
                    </span>
                    Contact number
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    name="phone"
                    placeholder="Enter your contact number"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                  />
                  {errors.phone && <p className="input-error">{errors.phone}</p>}
                </div>

                <div className="form-field">
                  <label htmlFor="state" className="label-with-icon">
                    <span className="label-icon" aria-hidden="true">
                      <LocationIcon />
                    </span>
                    State
                  </label>
                  <select
                    id="state"
                    name="state"
                  value={formData.state}
                  onChange={handleChange}
                  required
                >
                  <option value="">Choose your state</option>
                  <option value="johor">Johor</option>
                    <option value="kedah">Kedah</option>
                    <option value="kelantan">Kelantan</option>
                    <option value="melaka">Melaka</option>
                    <option value="negeri-sembilan">Negeri Sembilan</option>
                    <option value="pahang">Pahang</option>
                    <option value="perak">Perak</option>
                    <option value="perlis">Perlis</option>
                    <option value="penang">Penang (Pulau Pinang)</option>
                    <option value="sabah">Sabah</option>
                    <option value="sarawak">Sarawak</option>
                    <option value="selangor">Selangor</option>
                    <option value="terengganu">Terengganu</option>
                    <option value="kuallumpur">Kuala Lumpur (FT)</option>
                    <option value="labuan">Labuan (FT)</option>
                    <option value="putrajaya">Putrajaya (FT)</option>
                  </select>
                  {errors.state && <p className="input-error">{errors.state}</p>}
                </div>

                <div className="form-field">
                  <label htmlFor="city" className="label-with-icon">
                    <span className="label-icon" aria-hidden="true">
                      <LocationIcon />
                    </span>
                    City / District
                  </label>
                  <input
                    id="city"
                    type="text"
                    name="city"
                    placeholder="Enter your city or district"
                    value={formData.city}
                    onChange={handleChange}
                  />
                  {errors.city && <p className="input-error">{errors.city}</p>}
                </div>
              </section>
            )}

            {currentStep === 2 && (
              <section className="section-card">
                <div className="section-head">
                  <span className="section-icon" aria-hidden="true">
                    <TickIcon />
                  </span>
                  <div>
                    <p className="section-label">Account Information</p>
                    <p className="section-subtitle">Create your secure account credentials</p>
                  </div>
                </div>

                <div className="form-field">
                  <label htmlFor="sijilCertificate" className="label-with-icon">
                    <span className="label-icon" aria-hidden="true">
                      <UploadIcon />
                    </span>
                    Sijil Annual and Practising Certificate
                  </label>
                  <input
                    key={fileInputKeys.sijilCertificate}
                    id="sijilCertificate"
                    name="sijilCertificate"
                    type="file"
                    onChange={handleFileChange}
                    required
                  />
                  {formData.sijilCertificate && (
                    <div className="chip-row">
                      <span className="chip file-chip">
                        {formData.sijilCertificate}
                        <button type="button" aria-label="Remove file" onClick={() => handleClearFile('sijilCertificate')}>
                          ×
                        </button>
                      </span>
                    </div>
                  )}
                  {errors.sijilCertificate && <p className="input-error">{errors.sijilCertificate}</p>}
                </div>

                <div className="form-field">
                  <label htmlFor="lawFirm" className="label-with-icon">
                    <span className="label-icon" aria-hidden="true">
                      <PersonIcon />
                    </span>
                    Law firm (optional)
                  </label>
                  <input
                    id="lawFirm"
                    type="text"
                    name="lawFirm"
                    placeholder="Enter your law firm name"
                    value={formData.lawFirm}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="lawFirmCertificate" className="label-with-icon">
                    <span className="label-icon" aria-hidden="true">
                      <UploadIcon />
                    </span>
                    Certificate of Registration of Law Firm (optional)
                  </label>
                  <input
                    key={fileInputKeys.lawFirmCertificate}
                    id="lawFirmCertificate"
                    name="lawFirmCertificate"
                    type="file"
                    onChange={handleFileChange}
                  />
                  {errors.lawFirmCertificate && <p className="input-error">{errors.lawFirmCertificate}</p>}
                  {formData.lawFirmCertificate && (
                    <div className="chip-row">
                      <span className="chip file-chip">
                        {formData.lawFirmCertificate}
                        <button type="button" aria-label="Remove file" onClick={() => handleClearFile('lawFirmCertificate')}>
                          ×
                        </button>
                      </span>
                    </div>
                  )}
                </div>

                <div className="form-field">
                  <label htmlFor="expertise" className="label-with-icon">
                    <span className="label-icon" aria-hidden="true">
                      <PersonIcon />
                    </span>
                    Expertise category
                  </label>
                  <div className="multi-select">
                    <button
                      type="button"
                      className="multi-select-trigger"
                      onClick={() => setShowExpertiseMenu((prev) => !prev)}
                    >
                      {formData.expertise.length ? `${formData.expertise.length} selected` : 'Choose your expertise'}
                      <span className="caret">▼</span>
                    </button>
                    {showExpertiseMenu && (
                      <div className="multi-select-menu">
                        {expertiseOptions.map((opt) => (
                          <label key={opt.value} className="multi-select-option">
                            <input
                              type="checkbox"
                              checked={formData.expertise.includes(opt.value)}
                              onChange={() => toggleExpertise(opt.value)}
                            />
                            <span>{opt.label}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                  {formData.expertise.length > 0 && (
                    <div className="chip-row">
                      {formData.expertise.map((val) => {
                        const label = expertiseOptions.find((o) => o.value === val)?.label || val;
                        return (
                          <span key={val} className="chip">
                            {label}
                            <button type="button" aria-label={`Remove ${label}`} onClick={() => removeExpertise(val)}>
                              ×
                            </button>
                          </span>
                        );
                      })}
                    </div>
                  )}
                  {errors.expertise && <p className="input-error">{errors.expertise}</p>}
                </div>

                <div className="form-field">
                  <label htmlFor="yearsOfExperience" className="label-with-icon">
                    <span className="label-icon" aria-hidden="true">
                      <PersonIcon />
                    </span>
                    Years of experience
                  </label>
                  <input
                    id="yearsOfExperience"
                    type="number"
                    step="0.1"
                    name="yearsOfExperience"
                    placeholder="Enter your years of experience"
                    min="0"
                    value={formData.yearsOfExperience}
                    onChange={handleChange}
                  />
                  {errors.yearsOfExperience && <p className="input-error">{errors.yearsOfExperience}</p>}
                </div>

                <div className="form-field">
                  <label htmlFor="about" className="label-with-icon">
                    <span className="label-icon" aria-hidden="true">
                      <PersonIcon />
                    </span>
                    About (less than 150 words)
                  </label>
                  <textarea
                    id="about"
                    name="about"
                    placeholder="Describe yourself in 150 words"
                    maxLength={900}
                    rows={3}
                    value={formData.about}
                    onChange={handleChange}
                  />
                  {errors.about && <p className="input-error">{errors.about}</p>}
                </div>
              </section>
            )}

            {currentStep === 3 && (
              <>
                <section className="section-card terms-card">
                  <div className="section-head">
                    <span className="section-icon terms-icon" aria-hidden="true">
                      <TickIcon />
                    </span>
                    <div>
                      <p className="section-label">Terms and Conditions</p>
                      <p className="section-subtitle">Please read and accept our terms</p>
                    </div>
                  </div>

                  <div className="terms-container">
                    <ol className="terms-list">
                      <li>
                        <p className="term-title">Platform Usage Agreement</p>
                        <p>
                          By registering, you confirm the information provided is accurate and that you will use
                          LegalLink to seek or manage legal consultations responsibly.
                        </p>
                      </li>
                      <li>
                        <p className="term-title">Confidentiality and Data Privacy</p>
                        <p>
                          We protect your personal information and will only share it with your consent or when
                          required by law. You agree to keep any case details shared with lawyers confidential.
                        </p>
                      </li>
                      <li>
                        <p className="term-title">Bookings, Payments, and Cancellations</p>
                        <p>
                          Consultations may be subject to fees. Payments are processed securely, and late
                          cancellations or missed appointments may incur charges as outlined during booking.
                        </p>
                      </li>
                      <li>
                        <p className="term-title">Communications and Notifications</p>
                        <p>
                          You agree to receive emails or SMS messages about appointments, account activity, and
                          service updates. You can update preferences in your account settings.
                        </p>
                      </li>
                      <li>
                        <p className="term-title">Fair Use and Code of Conduct</p>
                        <p>
                          No harassment, unlawful activity, or misuse of the platform is permitted. LegalLink may
                          suspend accounts that violate these terms.
                        </p>
                      </li>
                    </ol>
                  </div>
                </section>

                <div className="terms-consent">
                  <label className="terms-checkbox">
                    <input
                      type="checkbox"
                      checked={termsAccepted}
                      onChange={(event) => setTermsAccepted(event.target.checked)}
                      required
                    />
                    <span>I have read and agree to the Terms and Conditions</span>
                  </label>
                </div>
              </>
            )}

            <div className="form-actions">
              {currentStep === 1 ? (
                <Link to="/register" className="ghost-button">
                  &#8249; Back
                </Link>
              ) : (
                <button type="button" className="ghost-button" onClick={() => setCurrentStep((prev) => prev - 1)}>
                  &#8249; Back
                </button>
              )}
              <button
                type="submit"
                className="ctbutton"
                disabled={currentStep === 3 && !termsAccepted}
              >
                {currentStep < 3 ? 'Next' : (
                  <>
                    <SubmitIcon /> Submit Registration
                  </>
                )}
              </button>
            </div>
          </form>

          <p className="signin-register">
            Already have an account?{' '}
            <Link to="/login" className="link-strong">
              Sign in
            </Link>
          </p>

          <p className="signin-footer">© 2025 Copyright LegalLink. All rights reserved.</p>
        </section>

        <section className="auth-fluid-right legallink-hero-panel lawyer-hero-panel">
          <div className="hero-content">
            <img src={heroIllustration} alt="Justice illustration" className="hero-illustration" />
            <div className="hero-text">
              <p className="hero-eyebrow">Empowering Access to Legal Expertise</p>
              <h2>LegalLink makes it easy to find the right lawyer when you need one most.</h2>
              <p className="hero-quote">
                "LegalLink makes it easy to find the right lawyer when you need one most."
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default LawyerRegister;
