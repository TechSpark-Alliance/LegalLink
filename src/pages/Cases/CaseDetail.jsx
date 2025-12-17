import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './CreateCase.css';
import logo from '../../assets/legal-link-logo.png';

const matterTypeOptions = [
  'Criminal',
  'Corporate',
  'Family',
  'Employment',
  'Intellectual Property',
  'Real Estate',
  'Litigation',
  'Arbitration',
  'Tax',
  'Immigration',
  'Other',
];

const NAV_ITEMS = [
  { key: 'cases', label: 'Cases', path: '/lawyer/cases' },
  { key: 'clients', label: 'Clients', path: '/lawyer/clients' },
  { key: 'appointments', label: 'Appointments', path: '/lawyer/appointments' },
  { key: 'conversations', label: 'Conversations', path: '/lawyer/conversations' },
];

export default function CaseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [caseData, setCaseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('details');
  const [progressEntries, setProgressEntries] = useState([]);
  const [progressNote, setProgressNote] = useState('');
  const [progressStatus, setProgressStatus] = useState('');
  const openDateRef = useRef(null);
  const closeDateRef = useRef(null);

  const lawyerName =
    localStorage.getItem('full_name') ||
    sessionStorage.getItem('full_name') ||
    'Profile';

  const apiBase = import.meta.env.VITE_APP_API || 'http://localhost:8000/api/v1';
  const token = localStorage.getItem('token') || sessionStorage.getItem('token') || '';

  const fetchCase = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await fetch(`${apiBase}/cases/${id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || 'Failed to load case');
      }
      const data = await res.json();
      setCaseData(data.case);
    } catch (err) {
      setError(err.message || 'Failed to load case');
    } finally {
      setLoading(false);
    }
  };

  const fetchProgress = async () => {
    try {
      const res = await fetch(`${apiBase}/cases/${id}/progress`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) return;
      const data = await res.json();
      setProgressEntries(data.items || []);
    } catch {
      setProgressEntries([]);
    }
  };

  useEffect(() => {
    const role = localStorage.getItem('role') || sessionStorage.getItem('role');
    if (role && role !== 'lawyer') {
      navigate('/login', { replace: true });
      return;
    }
    fetchCase();
    fetchProgress();
  }, [id]);

  const handleLogout = async () => {
    try {
      const apiBase = import.meta.env.VITE_APP_API || 'http://localhost:8000/api/v1';
      if (token) {
        await fetch(`${apiBase}/auth/user/logout`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });
      }
    } catch {
      /* ignore */
    } finally {
      localStorage.clear();
      sessionStorage.clear();
      navigate('/login');
    }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this case?')) return;
    try {
      setUpdating(true);
      const res = await fetch(`${apiBase}/cases/${id}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || 'Delete failed');
      }
      navigate('/lawyer/cases');
    } catch (err) {
      setError(err.message || 'Delete failed');
    } finally {
      setUpdating(false);
    }
  };

  const handleUpdate = async () => {
    if (!caseData) return;
    try {
      setUpdating(true);
      const payload = {
        client_name: caseData.client_name,
        phone: caseData.phone,
        email: caseData.email,
        nric: caseData.nric,
        company_reg: caseData.company_reg,
        address: caseData.address,
        status: caseData.status,
        matter_title: caseData.matter_title,
        file_code: caseData.file_code,
        open_date: caseData.open_date,
        close_date: caseData.close_date,
        description: caseData.description,
        matter_type: caseData.matter_type,
        matter_type_other: caseData.matter_type_other,
        sub_category: caseData.sub_category,
        opposing_party: caseData.opposing_party,
        opposing_firm: caseData.opposing_firm,
        additional_parties: caseData.additional_parties,
        additional_party1: caseData.additional_party1,
        additional_party2: caseData.additional_party2,
        additional_party3: caseData.additional_party3,
        additional_party4: caseData.additional_party4,
        additional_party5: caseData.additional_party5,
      };
      const res = await fetch(`${apiBase}/cases/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || 'Update failed');
      }
      await fetchCase();
    } catch (err) {
      setError(err.message || 'Update failed');
    } finally {
      setUpdating(false);
    }
  };

  const addProgress = () => {
    if (!progressNote.trim() && !progressStatus) return;
    const payload = {
      note: progressNote.trim(),
      status: progressStatus || null,
    };
    fetch(`${apiBase}/cases/${id}/progress`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(payload),
    })
      .then(() => {
        setProgressNote('');
        setProgressStatus('');
        fetchCase();
        fetchProgress();
      })
      .catch(() => {});
  };

  const formattedDate = (value) =>
    value ? new Date(value).toISOString().slice(0, 10) : '';

  if (loading) return <div className="create-shell"><p className="muted">Loading case...</p></div>;
  if (error) return <div className="create-shell"><p className="admin-error">{error}</p></div>;
  if (!caseData) return null;

  return (
    <div className="create-shell">
      <header className="create-shell__top">
        <div className="create-shell__brand">
          <img src={logo} alt="LegalLink" className="brand-logo" />
          <span className="brand-name">LegalLink</span>
        </div>
        <nav className="create-shell__nav">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.key}
              className={`nav-link ${item.key === 'cases' ? 'active' : ''}`}
              onClick={() => navigate(item.path)}
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
          <span className="profile-name">{lawyerName}</span>
          </button>
          {menuOpen && (
            <div className="profile-menu" role="menu">
              <button className="profile-menu__item" onClick={() => navigate('/lawyer/profile')}>Profile</button>
              <button className="profile-menu__item" onClick={handleLogout}>Logout</button>
            </div>
          )}
        </div>
      </header>

      <main className="create-shell__body">
        <div className="tabs">
          <button
            className={`tab ${activeTab === 'details' ? 'active' : ''}`}
            onClick={() => setActiveTab('details')}
          >
            Details
          </button>
          <button
            className={`tab ${activeTab === 'progress' ? 'active' : ''}`}
            onClick={() => setActiveTab('progress')}
          >
            Progress
          </button>
        </div>

        {activeTab === 'details' && (
          <div className="wizard-card">
            <h3>Case Details</h3>
            <div className="form-grid">
              <label>
                Client name
                <input
                  value={caseData.client_name || ''}
                  onChange={(e) => setCaseData({ ...caseData, client_name: e.target.value })}
                />
              </label>
              <label>
                Email
                <input
                  value={caseData.email || ''}
                  onChange={(e) => setCaseData({ ...caseData, email: e.target.value })}
                />
              </label>
              <label>
                Phone
                <input
                  value={caseData.phone || ''}
                  onChange={(e) => setCaseData({ ...caseData, phone: e.target.value })}
                />
              </label>
              <label>
                NRIC
                <input
                  value={caseData.nric || ''}
                  onChange={(e) => setCaseData({ ...caseData, nric: e.target.value })}
                />
              </label>
              <label>
                Company registration number
                <input
                  value={caseData.company_reg || ''}
                  onChange={(e) => setCaseData({ ...caseData, company_reg: e.target.value })}
                />
              </label>
              <label>
                Address
                <input
                  value={caseData.address || ''}
                  onChange={(e) => setCaseData({ ...caseData, address: e.target.value })}
                />
              </label>
              <label>
                Matter title
                <input
                  value={caseData.matter_title || ''}
                  onChange={(e) => setCaseData({ ...caseData, matter_title: e.target.value })}
                />
              </label>
              <label>
                File code
                <input
                  value={caseData.file_code || ''}
                  onChange={(e) => setCaseData({ ...caseData, file_code: e.target.value })}
                />
              </label>
              <label>
                Matter type
                <select
                  value={caseData.matter_type || ''}
                  onChange={(e) => setCaseData({ ...caseData, matter_type: e.target.value })}
                >
                  <option value="">Choose matter type</option>
                  {matterTypeOptions.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
                {caseData.matter_type === 'Other' && (
                  <input
                    className="stacked-input"
                    value={caseData.matter_type_other || ''}
                    onChange={(e) => setCaseData({ ...caseData, matter_type_other: e.target.value })}
                    placeholder="Specify matter type"
                  />
                )}
              </label>
              <label>
                Sub-category
                <input
                  value={caseData.sub_category || ''}
                  onChange={(e) => setCaseData({ ...caseData, sub_category: e.target.value })}
                />
              </label>
              <label>
                Status
                <select
                  value={caseData.status || 'Active'}
                  onChange={(e) => setCaseData({ ...caseData, status: e.target.value })}
                >
                  <option value="Active">Active</option>
                  <option value="In Progress">In Progress</option>
                  <option value="On Hold">On Hold</option>
                  <option value="Closed">Closed</option>
                  <option value="Won">Won</option>
                  <option value="Lost">Lost</option>
                </select>
              </label>
              <label>
                Open date
                <div className="date-field">
                  <input
                    type="date"
                    ref={openDateRef}
                    value={formattedDate(caseData.open_date)}
                    onChange={(e) => setCaseData({ ...caseData, open_date: e.target.value })}
                  />
                  <button
                    type="button"
                    className="date-trigger"
                    onClick={() => openDateRef.current?.showPicker?.()}
                  >
                    Cal
                  </button>
                </div>
              </label>
              <label>
                Close date
                <div className="date-field">
                  <input
                    type="date"
                    ref={closeDateRef}
                    value={formattedDate(caseData.close_date)}
                    onChange={(e) => setCaseData({ ...caseData, close_date: e.target.value })}
                  />
                  <button
                    type="button"
                    className="date-trigger"
                    onClick={() => closeDateRef.current?.showPicker?.()}
                  >
                    Cal
                  </button>
                </div>
              </label>
              <label className="full-row">
                Description
                <textarea
                  value={caseData.description || ''}
                  onChange={(e) => setCaseData({ ...caseData, description: e.target.value })}
                />
              </label>
              <label>
                Opposing party
                <input
                  value={caseData.opposing_party || ''}
                  onChange={(e) => setCaseData({ ...caseData, opposing_party: e.target.value })}
                />
              </label>
              <label>
                Opposing lawyer / firm
                <input
                  value={caseData.opposing_firm || ''}
                  onChange={(e) => setCaseData({ ...caseData, opposing_firm: e.target.value })}
                />
              </label>
              <label>
                Number of additional parties
                <input
                  value={caseData.additional_parties || ''}
                  onChange={(e) => setCaseData({ ...caseData, additional_parties: e.target.value })}
                />
              </label>
              {[1, 2, 3, 4, 5].map((n) => (
                <label key={`ap-${n}`}>
                  Additional party {n} name
                  <input
                    value={caseData[`additional_party${n}`] || ''}
                    onChange={(e) => setCaseData({ ...caseData, [`additional_party${n}`]: e.target.value })}
                  />
                </label>
              ))}
            </div>
            <div className="form-actions">
              <button className="ghost-btn" onClick={() => navigate('/lawyer/cases')}>
                Back
              </button>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="ghost-btn" onClick={handleDelete} disabled={updating}>
                  Delete
                </button>
            <button className="primary-btn" onClick={handleUpdate} disabled={updating}>
              {updating ? 'Saving...' : 'Save'}
            </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'progress' && (
          <div className="wizard-card">
            <h3>Case Progress</h3>
            <div className="form-grid">
              <label className="full-row">
                Note
                <textarea
                  value={progressNote}
                  onChange={(e) => setProgressNote(e.target.value)}
                  placeholder="Add a quick progress note"
                />
              </label>
              <label>
                Status (optional)
                <select
                  value={progressStatus}
                  onChange={(e) => setProgressStatus(e.target.value)}
                >
                  <option value="">Keep current</option>
                  <option value="Active">Active</option>
                  <option value="In Progress">In Progress</option>
                  <option value="On Hold">On Hold</option>
                  <option value="Closed">Closed</option>
                  <option value="Won">Won</option>
                  <option value="Lost">Lost</option>
                </select>
              </label>
            </div>
            <div className="form-actions">
              <div />
              <button className="primary-btn" onClick={addProgress}>Add entry</button>
            </div>

            <div className="progress-list">
              {progressEntries.length === 0 && (
                <p className="muted">No progress yet.</p>
              )}
              {progressEntries.map((p) => (
                <div className="progress-item" key={p._id || p.id}>
                  <div className="progress-top">
                    <span className="progress-date">
                      {p.created_at ? new Date(p.created_at).toLocaleString() : ''}
                    </span>
                    {p.status && <span className="badge">{p.status}</span>}
                  </div>
                  {p.note && <p className="progress-note">{p.note}</p>}
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
