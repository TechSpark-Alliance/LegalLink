import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ClientHome.css';
import ClientNavbar from '../../components/ClientNavbar';

const NAV_ITEMS = [
  { key: 'home', label: 'Home', path: '/home/client' },
  { key: 'lawyers', label: 'Lawyers', path: '/home/client' },
  { key: 'appointments', label: 'Appointments', path: '/home/client' },
  { key: 'conversations', label: 'Conversations', path: '/home/client' },
];

const expertiseCategories = [
  { key: 'all', label: 'Popular' },
  { key: 'litigation', label: 'Litigation' },
  { key: 'corporate', label: 'Corporate' },
  { key: 'family', label: 'Family' },
  { key: 'criminal', label: 'Criminal' },
  { key: 'employment', label: 'Employment' },
  { key: 'ip', label: 'Intellectual Property' },
  { key: 'tax', label: 'Tax' },
  { key: 'real-estate', label: 'Real Estate' },
  { key: 'immigration', label: 'Immigration' },
  { key: 'other', label: 'Other' },
];

export default function ClientHome() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userName, setUserName] = useState('Profile');
  const [lawyers, setLawyers] = useState([]);
  const [filteredLawyers, setFilteredLawyers] = useState([]);
  const [locationQuery, setLocationQuery] = useState('');
  const [practiceQuery, setPracticeQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  useEffect(() => {
    const role = localStorage.getItem('role') || sessionStorage.getItem('role');
    if (role && role !== 'client') {
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
    } catch (_) {
      /* ignore parse errors */
    }
    if (!name) {
      name = localStorage.getItem('full_name') || sessionStorage.getItem('full_name') || 'Profile';
    }
    setUserName(name);
  }, [navigate]);

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
    const fetchLawyers = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token') || '';
        const res = await fetch(`${apiBase}/auth/admin/users?role=lawyer&status=verified&limit=12`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (!res.ok) throw new Error('Unable to load lawyers');
        const data = await res.json();
        const list = Array.isArray(data.items) ? data.items : [];
        setLawyers(list);
        setFilteredLawyers(list);
      } catch (err) {
        setError(err.message || 'Unable to load lawyers');
        setLawyers([]);
        setFilteredLawyers([]);
      } finally {
        setLoading(false);
      }
    };
    fetchLawyers();
  }, [apiBase]);

  const formatLocation = (lawyer) => {
    const city = lawyer.city || '';
    const state = lawyer.state || '';
    const parts = [city, state].filter(Boolean);
    return parts.join(', ') || 'Location';
  };

  const formatExpertise = (lawyer) => {
    if (Array.isArray(lawyer.expertise) && lawyer.expertise.length) return lawyer.expertise.join(', ');
    if (typeof lawyer.expertise === 'string' && lawyer.expertise.trim()) return lawyer.expertise;
    return 'General practice';
  };

  const buildPhoto = (lawyer) => {
    const raw = lawyer.profile_image || '';
    if (!raw) return '';
    if (raw.startsWith('http')) return raw;
    const prefix = apiRoot.endsWith('/') ? apiRoot.slice(0, -1) : apiRoot;
    const path = raw.startsWith('/') ? raw : `/${raw}`;
    return `${prefix}${path}`;
  };

  const applyFilters = (categoryKey) => {
    const loc = locationQuery.trim().toLowerCase();
    const prac = practiceQuery.trim().toLowerCase();
    const cat = categoryKey ?? activeCategory;
    const next = lawyers.filter((lawyer) => {
      const locationText = formatLocation(lawyer).toLowerCase();
      const practiceText = formatExpertise(lawyer).toLowerCase();
      const expertiseList = Array.isArray(lawyer.expertise)
        ? lawyer.expertise.map((v) => String(v).toLowerCase())
        : String(lawyer.expertise || '').toLowerCase().split(',').map((v) => v.trim()).filter(Boolean);
      const matchLoc = loc ? locationText.includes(loc) : true;
      const matchPrac = prac ? practiceText.includes(prac) : true;
      const matchCategory =
        cat === 'all'
          ? true
          : expertiseList.some((v) => v === cat || practiceText.includes(cat));
      return matchLoc && matchPrac && matchCategory;
    });
    setFilteredLawyers(next);
  };

  return (
    <div className="client-shell">
      <ClientNavbar activeKey="lawyers" />

      <main className="client-body">
        <section className="hero-card">
          <h2>Welcome {userName || 'User'}, what are you looking for today?</h2>
          <p>Secure your peace of mind - consult with our top lawyers today!</p>
          <div className="hero-actions">
            <div className="search-pill input-pill">
              <span className="pill-icon">📍</span>
              <input
                type="text"
                placeholder="By location"
                value={locationQuery}
                onChange={(e) => setLocationQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    applyFilters();
                  }
                }}
              />
            </div>
            <div className="search-pill input-pill">
              <span className="pill-icon">⚖️</span>
              <input
                type="text"
                placeholder="Area of practice"
                value={practiceQuery}
                onChange={(e) => setPracticeQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    applyFilters();
                  }
                }}
              />
            </div>
            <button className="primary-pill" onClick={applyFilters}>🔍 Explore more</button>
          </div>
        </section>

        <div className="category-row">
          {expertiseCategories.map((cat) => (
            <button
              key={cat.key}
              className={`category-pill ${activeCategory === cat.key ? 'active' : ''}`}
              onClick={() => {
                setActiveCategory(cat.key);
                applyFilters(cat.key);
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <section className="cards-grid">
          {loading && <p className="muted">Loading lawyers…</p>}
          {!loading && error && <p className="error">{error}</p>}
          {!loading && !error && lawyers.length === 0 && <p className="muted">No lawyers available yet.</p>}
          {!loading &&
            !error &&
            filteredLawyers.map((lawyer) => {
              const photo = buildPhoto(lawyer);
              const location = formatLocation(lawyer);
              const practice = formatExpertise(lawyer);
              return (
                <article
                  className="lawyer-card wide"
                  key={lawyer._id || lawyer.id || lawyer.email}
                  onClick={() =>
                    navigate(`/lawyers/${lawyer._id || lawyer.id || lawyer.email}`, {
                      state: { lawyer },
                    })
                  }
                >
                  <div className="card-photo">
                    {photo ? <img src={photo} alt={lawyer.full_name || 'Lawyer'} /> : <div className="photo-placeholder" />}
                  </div>
                  <div className="card-footer">
                    <div className="card-name">{lawyer.full_name || lawyer.email || 'Name'}</div>
                    <div className="card-location">📍 {location}</div>
                    <div className="card-practice">{practice}</div>
                  </div>
                </article>
              );
            })}
        </section>
      </main>
    </div>
  );
}
