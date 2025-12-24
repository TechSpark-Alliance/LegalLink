import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './CreateCase.css';
import LawyerLayout from '../../components/LawyerLayout';

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

export default function CaseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [caseData, setCaseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState(false);
  const [activeTab, setActiveTab] = useState('details');
  const [progressEntries, setProgressEntries] = useState([]);
  const [progressNote, setProgressNote] = useState('');
  const [progressStatus, setProgressStatus] = useState('');
  const openDateRef = useRef(null);
  const closeDateRef = useRef(null);
  const additionalPartyCount = useMemo(() => {
    const raw = Number(caseData?.additional_parties);
    if (!Number.isFinite(raw) || raw <= 0) return 0;
    return Math.min(5, Math.floor(raw));
  }, [caseData?.additional_parties]);

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

  const deleteProgress = async (progressId) => {
    if (!progressId) return;
    if (!confirm('Delete this progress entry?')) return;
    try {
      await fetch(`${apiBase}/cases/${id}/progress/${progressId}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      fetchProgress();
    } catch {
      // no-op; keep UI unchanged on error
    }
  };

  const formattedDate = (value) =>
    value ? new Date(value).toISOString().slice(0, 10) : '';

  if (loading || error || !caseData) {
    return (
      <LawyerLayout activeKey="cases" bodyClassName="create-shell__body">
        <p className={error ? 'admin-error' : 'muted'}>
          {error || 'Loading case...'}
        </p>
      </LawyerLayout>
    );
  }

  return (
    <LawyerLayout activeKey="cases" bodyClassName="create-shell__body">
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
                  aria-label="Open date picker"
                  onClick={() => openDateRef.current?.showPicker?.()}
                >
                  <svg className="icon-cal" viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      fill="currentColor"
                      d="M19 4h-1V2h-2v2H8V2H6v2H5a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2Zm0 15H5V9h14v10Zm0-12H5V6h14v1Z"
                    />
                  </svg>
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
                  aria-label="Open date picker"
                  onClick={() => closeDateRef.current?.showPicker?.()}
                >
                  <svg className="icon-cal" viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      fill="currentColor"
                      d="M19 4h-1V2h-2v2H8V2H6v2H5a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2Zm0 15H5V9h14v10Zm0-12H5V6h14v1Z"
                    />
                  </svg>
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
                type="number"
                min="0"
                max="5"
                value={caseData.additional_parties || ''}
                onChange={(e) => setCaseData({ ...caseData, additional_parties: e.target.value })}
              />
            </label>
            {additionalPartyCount > 0 &&
              Array.from({ length: additionalPartyCount }, (_, idx) => {
                const n = idx + 1;
                return (
                  <label key={`ap-${n}`}>
                    Additional party {n} name
                    <input
                      value={caseData[`additional_party${n}`] || ''}
                      onChange={(e) => setCaseData({ ...caseData, [`additional_party${n}`]: e.target.value })}
                    />
                  </label>
                );
              })}
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
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    {p.status && <span className="badge">{p.status}</span>}
                    <button
                      className="progress-delete"
                      onClick={() => deleteProgress(p._id || p.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
                {p.note && <p className="progress-note">{p.note}</p>}
              </div>
            ))}
          </div>
        </div>
      )}
    </LawyerLayout>
  );
}
