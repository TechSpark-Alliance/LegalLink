import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './RegisterRole.css';
import logo from '../../assets/legal-link-logo.png';
import heroIllustration from '../../assets/legal-hero.png';

const RegisterRole = () => {
  const navigate = useNavigate();

  const handleRoleSelect = (role) => {
    if (role === 'client') {
      navigate('/register/client');
    } else if (role === 'lawyer') {
      navigate('/register/lawyer');
    }
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

          <div className="role-selection-content">
            <h1>Create Your Account</h1>
            <p className="role-selection-subtitle">
              Choose your role to get started with LegalLink
            </p>

            <div className="role-cards">
              <button
                className="role-card client-card"
                onClick={() => handleRoleSelect('client')}
              >
                <div className="role-icon">👤</div>
                <h2>I'm a Client</h2>
                <p>Looking for legal services and consultations</p>
              </button>

              <button
                className="role-card lawyer-card"
                onClick={() => handleRoleSelect('lawyer')}
              >
                <div className="role-icon">⚖️</div>
                <h2>I'm a Lawyer</h2>
                <p>Provide legal services and consultations</p>
              </button>
            </div>

            <p className="role-selection-footer">
              Already have an account?{' '}
              <Link to="/login" className="link-strong">
                Sign in
              </Link>
            </p>
          </div>
        </section>

        <section className="auth-fluid-right legallink-hero-panel">
          <div className="hero-content">
            <img src={heroIllustration} alt="Justice illustration" className="hero-illustration" />
            <div className="hero-text">
              <p className="hero-eyebrow">Legal guidance, simplified.</p>
              <h2>Join LegalLink Today</h2>
              <p className="hero-quote">
                Whether you are looking for trusted counsel or offering legal expertise, LegalLink connects
                you to the right people at the right time.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default RegisterRole;

