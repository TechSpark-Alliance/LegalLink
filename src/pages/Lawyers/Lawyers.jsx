import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import NavBar from '../../components/NavBar/NavBar';
import './Lawyers.css';
import lawyerPortrait from '../../assets/lawyer1.png';

const API_BASE = import.meta.env.VITE_APP_API || 'http://localhost:8000/api/v1';

const heroHeadline = 'Welcome User, what are you looking for today';
const heroSubtext = 'Secure your peace of mind - consult with our top lawyers today!';

const filters = [
  { label: 'By location', icon: 'pin', type: 'input', placeholder: 'By location' },
  { label: 'Area of practice', icon: 'scales', type: 'input', placeholder: 'Area of practice' },
  { label: 'Explore more', icon: 'search', cta: true },
];

const tabs = [
  { label: 'Popular', active: true },
  { label: 'Family & Personal Matters' },
  { label: 'Business & Corporate' },
  { label: 'Property & Real Estate' },
  { label: 'Intellectual Property' },
];

const lawyerCards = [
  {
    id: 'krystal-jung',
    label: '',
    name: 'Krystal Jung',
    location: '[CITY], [STATE]',
    description: 'A generalist to handle most cases.',
    image: lawyerPortrait,
  },
  { placeholder: true, description: 'A generalist to handle most cases.' },
  { placeholder: true, description: 'A generalist to handle most cases.' },
  { placeholder: true, description: 'A generalist to handle most cases.' },
  { placeholder: true, description: 'A generalist to handle most cases.' },
  { placeholder: true, description: 'A generalist to handle most cases.' },
  { placeholder: true, description: 'A generalist to handle most cases.' },
  { placeholder: true, description: 'A generalist to handle most cases.' },
];

const normalizeLawyerCard = (lawyer) => {
  if (!lawyer) return null;
  const id = lawyer._id || lawyer.id || lawyer.user_id;
  if (!id) return null;
  const name = lawyer.full_name || lawyer.fullName || lawyer.name || 'Lawyer';
  const city = lawyer.city || lawyer.City || '';
  const state = lawyer.state || lawyer.State || '';
  const locationParts = [city, state].filter(Boolean);
  const location = locationParts.length ? locationParts.join(', ') : '[CITY], [STATE]';
  const makeImageUrl = (img) => {
    if (!img) return null;
    if (String(img).startsWith('http')) return img;
    const root = API_BASE.replace(/\/api\/v1.*$/, '');
    return `${root}${img.startsWith('/') ? '' : '/'}${img}`;
  };
  const image = makeImageUrl(lawyer.profile_image || lawyer.avatar) || lawyerPortrait;
  const expertise = Array.isArray(lawyer.expertise)
    ? lawyer.expertise.filter(Boolean).slice(0, 3)
    : [];
  return {
    id,
    label: lawyer.title || lawyer.specialty || '',
    name,
    location,
    description: lawyer.about || lawyer.bio || 'A generalist to handle most cases.',
    image,
    expertise,
  };
};

const Icon = ({ type }) => {
  if (type === 'pin') {
    return (
      <svg className="icon" viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M12 2.75c-3.18 0-5.75 2.49-5.75 5.64 0 1.61.63 3.07 1.72 4.47.99 1.27 2.26 2.49 3.59 4.24a.75.75 0 0 0 1.16 0c1.33-1.75 2.6-2.97 3.59-4.24 1.09-1.4 1.69-2.86 1.69-4.47 0-3.15-2.59-5.64-5.75-5.64Zm0 8.04a2.4 2.4 0 1 1 0-4.8 2.4 2.4 0 0 1 0 4.8Z"
        />
      </svg>
    );
  }

  if (type === 'scales') {
    return (
      <svg className="icon" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4.75 9.5V7.75c0-.97.78-1.75 1.75-1.75h11c.97 0 1.75.78 1.75 1.75V9.5a.75.75 0 0 1-1.5 0V8.5h-2V17h1.25a.75.75 0 0 1 0 1.5h-9.5a.75.75 0 0 1 0-1.5H9V8.5h-2v1a.75.75 0 0 1-1.5 0Zm9 7.5V8.5h-3.5V17h3.5Zm-7.25-9.25h11v-.5a.25.25 0 0 0-.25-.25h-10.5a.25.25 0 0 0-.25.25v.5Z" />
      </svg>
    );
  }

  return (
    <svg className="icon" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M10.5 3a7.5 7.5 0 1 1 0 15 7.5 7.5 0 0 1 0-15Zm0 1.5A6 6 0 1 0 10.5 16a6 6 0 0 0 0-11.5Z" />
      <path d="M14.66 14.66a.75.75 0 0 1 1.06 0l3.58 3.58a.75.75 0 1 1-1.06 1.06l-3.58-3.58a.75.75 0 0 1 0-1.06Z" />
    </svg>
  );
};

const Lawyers = () => {
  const [lawyers, setLawyers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchLawyers = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE}/lawyers`);
        if (!res.ok) {
          throw new Error('Failed to load lawyers');
        }
        const data = await res.json();
        const items = data.lawyers || data.items || data;
        const normalized = Array.isArray(items)
          ? items.map(normalizeLawyerCard).filter(Boolean)
          : [];
        if (isMounted && normalized.length > 0) {
          setLawyers(normalized);
        }
      } catch {
        if (isMounted) {
          setLawyers([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchLawyers();
    return () => {
      isMounted = false;
    };
  }, []);

  const displayCards = lawyers.length > 0 ? lawyers : lawyerCards;

  return (
    <div className="lawyers-page">
      <NavBar />
      <main className="lawyers-shell">
        <section className="hero">
          <h1>{heroHeadline}</h1>
          <p className="hero-sub">{heroSubtext}</p>
        </section>

        <div className="filters">
          {filters.map((filter) => (
            filter.type === 'input' ? (
              <label key={filter.label} className="pill pill-input">
                <Icon type={filter.icon} />
                <input
                  type="text"
                  maxLength={30}
                  placeholder={filter.placeholder}
                  aria-label={filter.label}
                />
              </label>
            ) : (
              <button
                key={filter.label}
                type="button"
                className={`pill pill-cta pill-cta-short`}
                aria-label={filter.label}
                style={{
                  backgroundColor: '#ffd700',
                  color: '#3b300f',
                  boxShadow: 'none',
                }}
              >
                <Icon type={filter.icon} />
                <span>{filter.label}</span>
              </button>
            )
          ))}
        </div>

        <div className="tabs">
          {tabs.map((tab) => (
            <button
              type="button"
              key={tab.label}
              className={`tab ${tab.active ? 'tab-active' : ''}`}
              aria-pressed={tab.active}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <section className="card-grid" aria-label="Lawyer results">
          {displayCards.map((card, index) => (
            <div key={card.id || card.label || `placeholder-${index}`} className="card-wrap">
              {card.placeholder ? (
                <article className="lawyer-card placeholder">
                  <div className="placeholder-top" />
                  <div className="placeholder-body" />
                  <div className="placeholder-footer" />
                </article>
              ) : (
                <Link
                  to={`/client/lawyers/lawyer/${card.id}`}
                  className="card-link"
                  aria-label={`View ${card.name} profile`}
                >
                  <article className="lawyer-card">
                    {card.label ? <div className="card-label">{card.label}</div> : null}
                    <div className="portrait">
                      <img src={card.image} alt={`${card.name} portrait`} />
                    </div>
                    <div className="card-footer">
                      <div className="footer-name">{card.name}</div>
                      <div className="footer-location">
                        <Icon type="pin" />
                        <span>{card.location}</span>
                      </div>
                      {card.expertise && card.expertise.length > 0 && (
                        <div className="expertise-tags" aria-label="Expertise">
                          {card.expertise.map((tag) => (
                            <span className="chip" key={tag}>
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </article>
                </Link>
              )}
              <p className="card-description">{card.description}</p>
            </div>
          ))}
        </section>

        <div className="load-more-row">
          <a className="load-more" href="/" onClick={(e) => e.preventDefault()}>
            {loading ? 'Loading...' : 'Load more'}
          </a>
        </div>
      </main>
    </div>
  );
};

export default Lawyers;
