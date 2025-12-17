import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LawyerHome.css';
import logo from '../../assets/legal-link-logo.png';

const NAV_ITEMS = [
  { key: 'cases', label: 'Cases', path: '/lawyer/cases' },
  { key: 'clients', label: 'Clients', path: '/lawyer/clients' },
  { key: 'appointments', label: 'Appointments', path: '/lawyer/appointments' },
  { key: 'conversations', label: 'Conversations', path: '/lawyer/conversations' },
];

const statusClass = (status) => {
  if (status === 'Active') return 'status-chip active';
  if (status === 'Closed' || status === 'Lost') return 'status-chip closed';
  if (status === 'In Progress') return 'status-chip neutral';
  if (status === 'On Hold') return 'status-chip neutral';
  if (status === 'Won') return 'status-chip success';
  return 'status-chip';
};

export default function LawyerHome() {
  const [activeNav] = useState('cases');
  const [query, setQuery] = useState('');
  const [matterTypeFilter, setMatterTypeFilter] = useState('');
  const [cases, setCases] = useState([]);
  const [filteredCases, setFilteredCases] = useState([]);
  const [lawyerName, setLawyerName] = useState('Profile');
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

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
    } catch (_) {
      /* ignore parse errors */
    }
    if (!name) {
      name =
        localStorage.getItem('full_name') ||
        sessionStorage.getItem('full_name') ||
        '';
    }
    if (name) setLawyerName(name);
  }, []);

  const handleSearch = () => {
    const q = query.toLowerCase();
    setFilteredCases(
      cases.filter(
        (c) =>
          (!matterTypeFilter || c.matter_type === matterTypeFilter) &&
          (
            c.client_name?.toLowerCase().includes(q) ||
            c.matter_title?.toLowerCase().includes(q) ||
            c.file_code?.toLowerCase().includes(q)
          )
      )
    );
  };

  useEffect(() => {
    const fetchCases = async () => {
      try {
        const apiBase = import.meta.env.VITE_APP_API || 'http://localhost:8000/api/v1';
        const token = localStorage.getItem('token') || sessionStorage.getItem('token') || '';
        const params = new URLSearchParams();
        if (query) params.append('q', query);
        if (matterTypeFilter) params.append('matter_type', matterTypeFilter);
        const res = await fetch(`${apiBase}/cases?${params.toString()}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const data = await res.json();
        const items = data.items || [];
        setCases(items);
        setFilteredCases(items);
      } catch (err) {
        setCases([]);
        setFilteredCases([]);
      }
    };
    fetchCases();
  }, [query, matterTypeFilter]);

  const startWizard = () => {
    navigate('/lawyer/cases/new');
  };

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
    } catch (_) {
      /* ignore network/logout errors */
    } finally {
      localStorage.clear();
      sessionStorage.clear();
      navigate('/login');
    }
  };

  return (
    <div className="lawyer-shell">
      <header className="lawyer-shell__top">
        <div className="lawyer-shell__brand">
          <img src={logo} alt="LegalLink" className="brand-logo" />
          <span className="brand-name">LegalLink</span>
        </div>
        <nav className="lawyer-shell__nav">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.key}
              className={`nav-link ${item.key === 'cases' ? 'active' : ''}`}
              onClick={() => {
                if (item.path) navigate(item.path);
              }}
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
            <span className="profile-name">{lawyerName || 'Profile'}</span>
          </button>
          {menuOpen && (
            <div className="profile-menu" role="menu">
              <button className="profile-menu__item" onClick={() => navigate('/lawyer/profile')}>Profile</button>
              <button className="profile-menu__item" onClick={handleLogout}>Logout</button>
            </div>
          )}
        </div>
      </header>

      <main className="lawyer-shell__body">
        <section className="cases-card">
          <div className="cases-toolbar">
            <div className="search-filter">
              <div className="search-input">
                <input
                  placeholder="Search client, matter, or file"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
              <select
                className="filter-select"
                value={matterTypeFilter}
                onChange={(e) => setMatterTypeFilter(e.target.value)}
              >
                <option value="">All matter types</option>
                <option value="Criminal">Criminal</option>
                <option value="Corporate">Corporate</option>
                <option value="Family">Family</option>
                <option value="Employment">Employment</option>
                <option value="Intellectual Property">Intellectual Property</option>
                <option value="Real Estate">Real Estate</option>
                <option value="Litigation">Litigation</option>
                <option value="Arbitration">Arbitration</option>
                <option value="Tax">Tax</option>
                <option value="Immigration">Immigration</option>
                <option value="Other">Other</option>
              </select>
              <button className="filter-btn" onClick={handleSearch}>
                Filter
              </button>
            </div>
            <button className="primary-btn" onClick={startWizard}>Create new case</button>
          </div>

          <div className="cases-table">
            <div className="table-head">
              <span>Index</span>
              <span>Client</span>
              <span>Matter</span>
              <span>Type</span>
              <span>File</span>
              <span>Open date</span>
              <span>Close date</span>
              <span>Status</span>
            </div>
            {filteredCases.length === 0 && (
              <div className="table-row empty-row">
                <span>No cases yet.</span>
                <span />
                <span />
                <span />
                <span />
                <span />
                <span />
              </div>
            )}
            {filteredCases.map((c, idx) => (
              <div
                className="table-row table-row--link"
                key={c.id || idx}
                onClick={() => navigate(`/lawyer/cases/${c._id || c.id}`)}
              >
                <span>{idx + 1}</span>
                <span>{c.client_name || '—'}</span>
                <span>{c.matter_title || '—'}</span>
                <span>{c.matter_type || '—'}</span>
                <span>{c.file_code || c.id || '—'}</span>
                <span>{c.open_date || '—'}</span>
                <span>{c.close_date || '—'}</span>
                <span>
                  <span className={statusClass(c.status)}>{c.status || '—'}</span>
                </span>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
