import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './ClientRegister.css';
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

const ClientRegister = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const progressWidth = currentStep === 1 ? '50%' : '100%';

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (currentStep === 1) {
      setCurrentStep(2);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match.');
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
          role: 'client',
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || 'Registration failed');
      }
      navigate('/client/home');
    } catch (err) {
      alert(err.message || 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-fluid legallink-auth">
      <div className="legallink-card">
        <section className="auth-fluid-form-box legallink-form-panel client-register-panel">
          <div className="signin-brand">
            <img src={logo} alt="LegalLink logo" className="signin-logo" />
            <div>
              <p className="brand-label">LegalLink</p>
            </div>
          </div>

          <div className="register-progress">
            <div className="steps">
              <div
                className={`step ${currentStep === 1 ? 'active' : 'completed'}`}
                aria-current={currentStep === 1 ? 'step' : undefined}
              >
                <span className={`step-circle ${currentStep === 1 ? 'active' : 'completed'}`}>
                  <PersonIcon />
                </span>
                <span className="step-label">Account</span>
              </div>
              <div
                className={`step ${currentStep === 2 ? 'active' : 'pending'}`}
                aria-current={currentStep === 2 ? 'step' : undefined}
              >
                <span className={`step-circle ${currentStep === 2 ? 'active' : 'muted'}`}>
                  &#10003;
                </span>
                <span className="step-label">Finish</span>
              </div>
            </div>
            <div className="client-progress-bar" aria-hidden="true">
              <div className="client-progress-fill" style={{ width: progressWidth }} />
            </div>
          </div>

          <form className="signin-form client-form" onSubmit={handleSubmit}>
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

                <div className="form-row">
                  <div className="form-field full-width">
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
                      placeholder="Enter your full name"
                      value={formData.fullName}
                      onChange={handleChange}
                      required
                    />
                  </div>
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
                </div>

                <div className="form-field">
                  <label htmlFor="phone" className="label-with-icon">
                    <span className="label-icon" aria-hidden="true">
                      <PhoneIcon />
                    </span>
                    Phone Number
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    name="phone"
                    placeholder="Enter your phone number"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                  />
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
                </div>

                <div className="form-field">
                  <label htmlFor="confirmPassword" className="label-with-icon">
                    <span className="label-icon" aria-hidden="true">
                      <LockIcon />
                    </span>
                    Confirm Password
                  </label>
                  <div className="password-wrapper">
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      placeholder="Confirm your password"
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
                </div>
              </section>
            )}

            {currentStep === 2 && (
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
                <button type="button" className="ghost-button" onClick={() => setCurrentStep(1)}>
                  &#8249; Back
                </button>
              )}
              <button
                type={currentStep === 1 ? 'submit' : 'submit'}
                className="ctbutton"
                disabled={currentStep === 2 && !termsAccepted}
              >
                {currentStep === 1 ? 'Next' : (
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

        <section className="auth-fluid-right legallink-hero-panel">
          <div className="hero-content">
            <img src={heroIllustration} alt="Justice illustration" className="hero-illustration" />
            <div className="hero-text">
              <p className="hero-eyebrow">Empowering Access to Legal Expertise</p>
              <h2>Find the right lawyer when you need one most.</h2>
              <p className="hero-quote">LegalLink makes it easy to find the right lawyer when you need one most.</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ClientRegister;

