import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import NavBar from '../../components/NavBar/NavBar';
import './LawyerBio.css';
import lawyerPortrait from '../../assets/lawyer1.png';

const API_BASE = import.meta.env.VITE_APP_API || 'http://localhost:8000/api/v1';

const normalizeExpertise = (value) => {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (!value) return [];
  return String(value)
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
};

const buildProfile = (raw) => {
  if (!raw) return null;
  return {
    id: raw._id || raw.id || raw.user_id,
    name: raw.full_name || raw.fullName || raw.name || 'Lawyer',
    bio: raw.about || raw.bio || 'Biography not available.',
    location: raw.location || [raw.city, raw.state].filter(Boolean).join(', ') || 'Location unavailable',
    casesWon: raw.casesWon || raw.cases_won || raw.cases || '',
    experience: raw.years_of_experience || raw.yearsOfExperience || raw.experience || '',
    rating: raw.rating || raw.review?.stars || raw.reviews?.[0]?.stars || '',
    expertise: normalizeExpertise(raw.expertise),
    reviewQuote: raw.review?.quote || raw.reviews?.[0]?.text || 'No reviews yet for this lawyer.',
    reviewReviewer: raw.review?.reviewer || raw.reviews?.[0]?.reviewer || 'Client',
    reviewStars: raw.review?.stars || raw.reviews?.[0]?.stars || '5',
    firmName: raw.firm?.name || raw.law_firm || raw.lawFirm || '-',
    firmAddress: raw.firm?.address || raw.address || '-',
    firmPhone: raw.firm?.office || raw.phone || raw.phone_number || 'Firm office number',
    firmEmail: raw.firm?.email || raw.email || 'Firm email',
    image: raw.profile_image || raw.profileImage || raw.image || '',
  };
};

const dummyProfile = {
  id: 'krystal-jung',
  name: 'Krystal Jung',
  bio: 'Krystal is a Kuala Lumpur-based family lawyer focused on personal matters, mediation, and compassionate client advocacy.',
  location: 'Kuala Lumpur, Malaysia',
  casesWon: '120+',
  experience: '8+ years',
  rating: '4.9',
  expertise: ['Family & Personal Matters', 'Mediation', 'Custody'],
  reviewQuote: 'Calm, clear, and incredibly supportive during a tough time.',
  reviewReviewer: 'Client',
  reviewStars: '5',
  firmName: 'Jung & Partners',
  firmAddress: 'Jalan Raja Chulan, Kuala Lumpur',
  firmPhone: '+60 3-5555 2145',
  firmEmail: 'krystal.jung@jungpartners.my',
  image: lawyerPortrait,
};

const buildImageUrl = (value) => {
  if (!value) return '';
  const str = String(value);
  if (str.startsWith('http')) return str;
  const apiRoot = API_BASE.replace(/\/api\/v1\/?$/, '');
  const prefix = apiRoot.endsWith('/') ? apiRoot.slice(0, -1) : apiRoot;
  const path = str.startsWith('/') ? str : `/${str}`;
  return `${prefix}${path}`;
};

const formatExperience = (value) => {
  if (!value) return '3+ years';
  if (typeof value === 'number') return `${value}+ years`;
  return String(value).includes('year') ? String(value) : `${value} years`;
};

const LawyerBio = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;
    const fetchProfile = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(`${API_BASE}/lawyers/${id}`);
        if (!res.ok) {
          throw new Error('Failed to load lawyer');
        }
        const data = await res.json();
        const raw = data.lawyer || data.profile || data.user || data;
        const normalized = buildProfile(raw);
        if (isMounted) setProfile(normalized);
      } catch (err) {
        if (isMounted) {
          if (id === dummyProfile.id) {
            setProfile(dummyProfile);
          } else {
            setError(err.message || 'Failed to load lawyer');
          }
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchProfile();
    return () => {
      isMounted = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="lawyer-bio-page">
        <NavBar forceActive="/client/lawyers" />
        <main className="lawyer-bio-main">
          <p className="lawyer-bio-loading">Loading...</p>
        </main>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="lawyer-bio-page">
        <NavBar forceActive="/client/lawyers" />
        <main className="lawyer-bio-main">
          <p className="lawyer-bio-error">{error || 'Lawyer not found.'}</p>
        </main>
      </div>
    );
  }

  const imageUrl = buildImageUrl(profile.image) || lawyerPortrait;

  return (
    <div className="lawyer-bio-page">
      <NavBar forceActive="/client/lawyers" />
      <main className="lawyer-bio-main">
        <div className="lawyer-bio-topbar">
          <button type="button" className="bio-btn ghost" onClick={() => navigate(-1)}>
            Back
          </button>
          {/* <button
            type="button"
            className="bio-btn link"
            onClick={() => navigate(`/client/lawyers/lawyer/${profile.id}/reviews`)}
          >
            Show all reviews
          </button> */}
        </div>

        <section className="lawyer-bio-hero">
          <div className="bio-copy">
            <h1>Lawyer&apos;s profile</h1>
            <p className="bio-text">{profile.bio}</p>
            {profile.expertise.length > 0 && (
              <div className="bio-expertise">
                {profile.expertise.map((item) => (
                  <span key={item} className="expertise-pill">{item}</span>
                ))}
              </div>
            )}
            {/* <div className="bio-review">
              <div className="bio-review-title">Reviews</div>
              <p className="bio-review-quote">"{profile.reviewQuote}"</p>
            </div> */}
          </div>

          <div className="bio-card">
            <div className="bio-avatar">
              {imageUrl ? (
                <img src={imageUrl} alt={profile.name} />
              ) : (
                <div className="bio-avatar-fallback">{profile.name.charAt(0)}</div>
              )}
            </div>
            <div className="bio-location">{profile.location}</div>
          </div>
        </section>

        <section className="bio-firm">
          <div className="bio-firm-info">
            <div className="bio-firm-title">Firm details:</div>
            <div className="bio-firm-grid">
              <div>
                <div className="bio-firm-label">Firm name</div>
                <div className="bio-firm-value">{profile.firmName}</div>
              </div>
              <div>
                <div className="bio-firm-label">Firm address</div>
                <div className="bio-firm-value">{profile.firmAddress}</div>
              </div>
              <div>
                <div className="bio-firm-label">Firm office number</div>
                <div className="bio-firm-value">{profile.firmPhone}</div>
              </div>
              <div>
                <div className="bio-firm-label">Email</div>
                <div className="bio-firm-value">{profile.firmEmail}</div>
              </div>
            </div>
          </div>
          <div className="bio-firm-actions">
            <button
              type="button"
              className="bio-cta primary"
              onClick={() => navigate(`/client/lawyers/lawyer/${profile.id}/book-appointment`)}
            >
              Book appointment
            </button>
            <button
              type="button"
              className="bio-cta secondary"
              onClick={() => navigate(`/client/conversations/chat/${profile.id}/lawyer/${profile.id}`)}
            >
              Have a quick chat
            </button>
          </div>
        </section>
      </main>
    </div>
  );
};

export default LawyerBio;
