import React, { useEffect, useState } from 'react';
import './VerifyLawyers.css';
import logo from '../../assets/legal-link-logo.png';

const VerifyLawyers = () => {
  const [lawyers, setLawyers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState('');

  const apiBase = import.meta.env.VITE_APP_API || 'http://localhost:8000/api/v1';

  const fetchPending = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await fetch(`${apiBase}/auth/admin/lawyers/pending`);
      if (!res.ok) {
        throw new Error('Failed to load pending lawyers');
      }
      const data = await res.json();
      setLawyers(data.lawyers || []);
    } catch (err) {
      setError(err.message || 'Failed to load pending lawyers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const handleVerify = async (lawyerId, verify = true) => {
    try {
      setUpdatingId(lawyerId);
      setError('');
      const res = await fetch(`${apiBase}/auth/admin/lawyers/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: lawyerId, verify }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || 'Verification failed');
      }
      await fetchPending();
    } catch (err) {
      setError(err.message || 'Verification failed');
    } finally {
      setUpdatingId('');
    }
  };

  const renderDoc = (label, value, urlField) => {
    if (!value) return null;
    const href = urlField || value;
    return (
      <div className="lawyer-docs">
        {label}:{' '}
        <a href={href} target="_blank" rel="noreferrer" className="doc-link">
          {value}
        </a>
      </div>
    );
  };

  return (
    <div className="admin-page">
      <header className="admin-header">
        <div className="admin-brand">
          <img src={logo} alt="LegalLink logo" className="admin-logo" />
          <div>
            <p className="brand-title">LegalLink</p>
            <p className="brand-subtitle">Admin Console</p>
          </div>
        </div>
        <nav className="admin-nav">
          <a className="nav-link active" href="/admin/lawyers">
            Lawyers
          </a>
          <span className="nav-link muted">Clients</span>
          <span className="nav-link muted">Settings</span>
        </nav>
      </header>

      <div className="admin-card">
        <h1>Pending Lawyer Verifications</h1>
        {error && <p className="admin-error">{error}</p>}
        {loading ? (
          <p className="admin-muted">Loading...</p>
        ) : lawyers.length === 0 ? (
          <p className="admin-muted">No pending lawyers.</p>
        ) : (
          <div className="lawyer-list">
            {lawyers.map((lawyer) => (
              <div key={lawyer._id || lawyer.id} className="lawyer-row">
                <div className="lawyer-main">
                  <div className="lawyer-name">{lawyer.full_name || lawyer.fullName}</div>
                  <div className="lawyer-email">{lawyer.email}</div>
                  <div className="lawyer-meta">
                    <span>{lawyer.phone}</span>
                    {lawyer.state && <span>{lawyer.state}</span>}
                    {lawyer.city && <span>{lawyer.city}</span>}
                  </div>
                  {lawyer.expertise && lawyer.expertise.length > 0 && (
                    <div className="lawyer-chips">
                      {lawyer.expertise.map((ex) => (
                        <span key={ex} className="chip file-chip">
                          {ex}
                        </span>
                      ))}
                    </div>
                  )}
                  {renderDoc('Sijil', lawyer.sijil_certificate, lawyer.sijil_certificate_url)}
                  {renderDoc('Firm Cert', lawyer.law_firm_certificate, lawyer.law_firm_certificate_url)}
                </div>
                <div className="lawyer-actions">
                  <button
                    className="verify-btn"
                    onClick={() => handleVerify(lawyer._id || lawyer.id, true)}
                    disabled={updatingId === (lawyer._id || lawyer.id)}
                  >
                    {updatingId === (lawyer._id || lawyer.id) ? 'Verifying...' : 'Verify'}
                  </button>
                  <button
                    className="reject-btn"
                    onClick={() => handleVerify(lawyer._id || lawyer.id, false)}
                    disabled={updatingId === (lawyer._id || lawyer.id)}
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyLawyers;
