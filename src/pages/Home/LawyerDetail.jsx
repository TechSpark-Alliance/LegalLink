import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import './LawyerDetail.css';
import ClientNavbar from '../../components/ClientNavbar';

const NAV_ITEMS = [
  { key: 'home', label: 'Home', path: '/home/client' },
  { key: 'lawyers', label: 'Lawyers', path: '/home/client' },
  { key: 'appointments', label: 'Appointments', path: '/home/client' },
  { key: 'conversations', label: 'Conversations', path: '/home/client' },
];

export default function LawyerDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const passedLawyer = location.state?.lawyer;
  const [lawyer, setLawyer] = useState(passedLawyer || null);
  const [error, setError] = useState('');

  const apiBase = import.meta.env.VITE_APP_API || 'http://localhost:8000/api/v1';
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

  useEffect(() => {
    if (passedLawyer) return;
    const fetchLawyer = async () => {
      try {
        const res = await fetch(`${apiBase}/auth/admin/users?role=lawyer&limit=1&q=${encodeURIComponent(id || '')}`);
        if (!res.ok) throw new Error('Unable to load lawyer');
        const data = await res.json();
        if (Array.isArray(data.items) && data.items.length) {
          setLawyer(data.items[0]);
        } else {
          setError('Lawyer not found');
        }
      } catch (err) {
        setError(err.message || 'Unable to load lawyer');
      }
    };
    fetchLawyer();
  }, [apiBase, id, passedLawyer]);

  const buildPhoto = () => {
    const raw = lawyer?.profile_image || '';
    if (!raw) return '';
    if (raw.startsWith('http')) return raw;
    const prefix = apiRoot.endsWith('/') ? apiRoot.slice(0, -1) : apiRoot;
    const path = raw.startsWith('/') ? raw : `/${raw}`;
    return `${prefix}${path}`;
  };

  if (error) return <div className="detail-shell"><p className="admin-error">{error}</p></div>;
  if (!lawyer) return <div className="detail-shell"><p className="muted">Loading...</p></div>;

  const photo = buildPhoto();
  const locationText = [lawyer.city, lawyer.state].filter(Boolean).join(', ') || 'Location';
  const aboutText = lawyer.about || 'No bio provided yet.';

  return (
    <div className="detail-shell">
      <ClientNavbar activeKey="lawyers" />

      <main className="detail-body">
        <section className="detail-hero">
          <div className="detail-text">
            <h2>Lawyer&apos;s profile</h2>
            <p className="about-text">{aboutText}</p>
            <div className="metrics-row">
              <div className="metric-chip">
                <span>Cases Won</span>
                <strong>70+</strong>
              </div>
              <div className="metric-chip">
                <span>Experience</span>
                <strong>{lawyer.years_of_experience ? `${lawyer.years_of_experience}+ years` : '3+ years'}</strong>
              </div>
              <div className="metric-chip">
                <span>Ratings</span>
                <strong>4.8 ⭐</strong>
              </div>
            </div>
          </div>
          <div className="detail-photo-card">
            <div className="detail-photo">
              {photo ? <img src={photo} alt={lawyer.full_name || 'Lawyer'} /> : <div className="photo-placeholder" />}
            </div>
            <p className="detail-location">📍 {locationText}</p>
          </div>
        </section>

        <section className="reviews">
          <h3>Reviews</h3>
          <p className="muted">This lawyer has not received any reviews yet.</p>
        </section>

        <section className="firm-details">
          <div className="firm-header">
            <h3>Firm details:</h3>
            <div className="firm-actions">
              <button className="primary-pill">Book appointment</button>
              <button className="ghost-pill">Have a quick chat</button>
            </div>
          </div>
          <div className="firm-grid">
            <div className="firm-item">
              <span className="firm-label">Firm name</span>
              <span className="firm-value">{lawyer.law_firm || 'N/A'}</span>
            </div>
            <div className="firm-item">
              <span className="firm-label">Firm address</span>
              <span className="firm-value">{locationText}</span>
            </div>
            <div className="firm-item">
              <span className="firm-label">Firm office number</span>
              <span className="firm-value">{lawyer.phone || 'N/A'}</span>
            </div>
            <div className="firm-item">
              <span className="firm-label">Email</span>
              <span className="firm-value">{lawyer.email || 'N/A'}</span>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
