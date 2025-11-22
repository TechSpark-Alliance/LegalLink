import React, { useState } from 'react';
import './UserLogin.css';
import logo from '../../../assets/legal-link-logo.png';
import heroIllustration from '../../../assets/legal-hero.png';

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

const UserLogin = () => {
  const [showPassword, setShowPassword] = useState(false);

  const togglePassword = () => setShowPassword((prev) => !prev);

  const handleSubmit = (event) => {
    event.preventDefault();
  };

  return (
    <div className="auth-fluid legallink-auth">
      <div className="legallink-card">
        <section className="auth-fluid-form-box legallink-form-panel">
          <div className="signin-brand">
            <img src={logo} alt="LegalLink logo" className="signin-logo" />
            <div>
              <p className="brand-label">LegalLink</p>
            </div>
          </div>

          <div className="signin-welcome">
            <h1>Welcome to LegalLink</h1>
            <p>
              A platform that brings clients and legal professionals together through secure and
              seamless online consultations.
            </p>
            <div className="signin-highlight">
              <span className="highlight-icon" aria-hidden="true">
                i
              </span>
              <div>
                <p>Discover trusted lawyers, manage your appointments, and handle legal matters with ease.</p>
              </div>
            </div>
          </div>

          <form className="signin-form" onSubmit={handleSubmit}>
            <div className="form-field">
              <label htmlFor="email">Email</label>
              <input id="email" type="email" name="email" placeholder="Enter your email" required />
            </div>

            <div className="form-field">
              <div className="label-row">
                <label htmlFor="password">Password</label>
                <a href="/" className="link-muted">
                  Forgot your password?
                </a>
              </div>
              <div className="password-wrapper">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={togglePassword}
                  aria-label={`${showPassword ? 'Hide' : 'Show'} password`}
                >
                  <EyeIcon />
                </button>
              </div>
            </div>

            <button type="submit" className="cta-button">
              Sign in
            </button>
          </form>

          <p className="signin-register">
            New to LegalLink?{' '}
            <a href="/" className="link-strong">
              Register your account.
            </a>
          </p>

          <p className="signin-footer">© 2025 Copyright LegalLink. All rights reserved.</p>
        </section>

        <section className="auth-fluid-right legallink-hero-panel">
          <div className="hero-content">
            <img src={heroIllustration} alt="Justice illustration" className="hero-illustration" />
            <div className="hero-text">
              <p className="hero-eyebrow">Empowering Access to Legal Expertise</p>
              <h2>Find the right lawyer when you need one most.</h2>
              <p className="hero-quote">
                “LegalLink makes it easy to find the right lawyer when you need one most.”
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default UserLogin;

