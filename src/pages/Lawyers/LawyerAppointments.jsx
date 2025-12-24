import React, { useEffect, useMemo, useState } from 'react';
import LawyerLayout from '../../components/LawyerLayout';
import './LawyerAppointments.css';

const API_BASE = import.meta.env.VITE_APP_API || 'http://localhost:8000/api/v1';

const toIsoLocal = (dateObj) => {
  const y = dateObj.getFullYear();
  const m = (dateObj.getMonth() + 1).toString().padStart(2, '0');
  const d = dateObj.getDate().toString().padStart(2, '0');
  return `${y}-${m}-${d}`;
};

export default function LawyerAppointments() {
  const [availability, setAvailability] = useState([]);
  const [requests, setRequests] = useState([]);
  const [date, setDate] = useState('');
  const [start, setStart] = useState('09:00');
  const [end, setEnd] = useState('17:00');
  const [selectedDates, setSelectedDates] = useState([]);
  const [statusFilter, setStatusFilter] = useState('All');
  const [activeTab, setActiveTab] = useState('availability');
  const [loadingAvail, setLoadingAvail] = useState(false);
  const [loadingReq, setLoadingReq] = useState(false);
  const [error, setError] = useState('');
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const token =
    localStorage.getItem('token') ||
    sessionStorage.getItem('token') ||
    '';

  const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

  const cleanTime = (value) => (value || '').replace(/[^\d:apm\s]/gi, '').trim();

  const fetchAvailability = async () => {
    setLoadingAvail(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/lawyers/availability`, { headers: authHeaders });
      if (!res.ok) throw new Error('Failed to load availability');
      const data = await res.json();
      setAvailability(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Failed to load availability');
    } finally {
      setLoadingAvail(false);
    }
  };

  const fetchRequests = async () => {
    setLoadingReq(true);
    setError('');
    try {
      const query = statusFilter === 'All' ? '' : `?status=${statusFilter.toLowerCase()}`;
      const res = await fetch(`${API_BASE}/lawyers/appointments${query}`, { headers: authHeaders });
      if (!res.ok) throw new Error('Failed to load requests');
      const data = await res.json();
      setRequests(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Failed to load requests');
    } finally {
      setLoadingReq(false);
    }
  };

  useEffect(() => {
    fetchAvailability();
    fetchRequests();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (activeTab === 'requests') {
      fetchRequests();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const monthLabel = useMemo(
    () => currentMonth.toLocaleDateString(undefined, { month: 'long', year: 'numeric' }),
    [currentMonth]
  );

  const daysThisMonth = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const first = new Date(year, month, 1);
    const startOffset = first.getDay();
    const nextMonth = new Date(year, month + 1, 1);
    const days = [];
    for (let i = 0; i < startOffset; i++) {
      days.push(null);
    }
    for (let d = new Date(first); d < nextMonth; d.setDate(d.getDate() + 1)) {
      const iso = d.toISOString().slice(0, 10);
      days.push({ iso, day: d.getDate(), weekday: d.getDay() });
    }
    return days;
  }, [currentMonth]);

  const goPrevMonth = () => {
    setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const goNextMonth = () => {
    setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const toggleSelectedDate = (iso) => {
    setSelectedDates((prev) => (prev.includes(iso) ? prev.filter((d) => d !== iso) : [...prev, iso]));
  };

  const addAvailability = async () => {
    const targets = selectedDates.length ? selectedDates : date ? [date] : [];
    if (!targets.length) return;
    try {
      setError('');
      const res = await fetch(`${API_BASE}/lawyers/availability`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders,
        },
        body: JSON.stringify(targets.map((d) => ({ date: d, start, end }))),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || 'Failed to add availability');
      }
      const data = await res.json();
      const created = Array.isArray(data?.created) ? data.created : [];
      if (created.length) {
        setAvailability((prev) => [...prev, ...created]);
      }
    } catch (err) {
      setError(err.message || 'Failed to add availability');
    }
    setDate('');
    setStart('09:00');
    setEnd('17:00');
    setSelectedDates([]);
  };

  const removeAvailability = async (id) => {
    try {
      setError('');
      const res = await fetch(`${API_BASE}/lawyers/availability/${id}`, {
        method: 'DELETE',
        headers: authHeaders,
      });
      if (!res.ok) throw new Error('Failed to delete slot');
      setAvailability((prev) => prev.filter((slot) => slot.id !== id));
    } catch (err) {
      setError(err.message || 'Failed to delete slot');
    }
  };

  const updateRequestStatus = async (id, status) => {
    const reason = status === 'Rejected' ? window.prompt('Provide a reason for rejection') || '' : '';
    try {
      setError('');
      const res = await fetch(`${API_BASE}/lawyers/appointments/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders,
        },
        body: JSON.stringify({ status, reason }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || 'Failed to update request');
      }
      const updated = await res.json();
      setRequests((prev) =>
        prev.map((req) => (req.id === id ? updated : req)),
      );
    } catch (err) {
      setError(err.message || 'Failed to update request');
    }
  };

  const filteredRequests = useMemo(() => {
    if (statusFilter === 'All') return requests;
    return requests.filter((r) => r.status === statusFilter);
  }, [requests, statusFilter]);

  const sortedAvailability = useMemo(() => {
    const todayIso = toIsoLocal(new Date());
    return [...availability]
      .filter((slot) => (slot?.date || '') >= todayIso)
      .sort((a, b) => {
        if (a.date === b.date) return (a.start || '').localeCompare(b.start || '');
        return (a.date || '').localeCompare(b.date || '');
      });
  }, [availability]);

  const formatRange = (req) => {
    const start = req.time || '';
    const dur = req.duration_minutes || 60;
    if (!start.includes(':')) return start || '-';
    const [h, m] = start.split(':').map(Number);
    const startDate = new Date();
    startDate.setHours(h || 0, m || 0, 0, 0);
    const endDate = new Date(startDate.getTime() + dur * 60000);
    const fmt = (d) =>
      `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
    return `${fmt(startDate)} - ${fmt(endDate)}`;
  };

  const statusLabel = (status) => {
    const s = (status || '').toLowerCase();
    if (s === 'pending') return 'Pending';
    if (s === 'accepted') return 'Accepted';
    if (s === 'rejected') return 'Rejected';
    if (s === 'cancelled') return 'Cancelled';
    return status || '-';
  };

  return (
    <LawyerLayout activeKey="appointments" bodyClassName="lawyer-appt-shell">
      <div className="lawyer-appt-card">
        <header className="lawyer-appt-head">
          <div>
            <p className="lp-kicker">Schedule</p>
            <h1 className="lp-title">Appointments</h1>
            <p className="lp-subtitle">
              Set your availability and manage client bookings.
            </p>
          </div>
        </header>

        <div className="appt-tabs" role="tablist" aria-label="Appointment sections">
          <button
            type="button"
            className={`tab-btn ${activeTab === 'availability' ? 'active' : ''}`}
            onClick={() => setActiveTab('availability')}
            role="tab"
            aria-selected={activeTab === 'availability'}
          >
            Availability
          </button>
          <button
            type="button"
            className={`tab-btn ${activeTab === 'requests' ? 'active' : ''}`}
            onClick={() => setActiveTab('requests')}
            role="tab"
            aria-selected={activeTab === 'requests'}
          >
            Client requests
          </button>
        </div>

        <section className="lawyer-appt-grid">
          {activeTab === 'availability' && (
            <div className="panel" role="tabpanel" aria-label="Availability">
              <div className="panel-head">
                <h3>Availability for this month</h3>
              </div>
              <div className="panel-form">
                <label>
                  Date (single)
                  <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                </label>
                <label>
                  Start
                  <input type="time" value={start} onChange={(e) => setStart(e.target.value)} />
                </label>
                <label>
                  End
                  <input type="time" value={end} onChange={(e) => setEnd(e.target.value)} />
                </label>
                <button
                  type="button"
                  className="primary-btn add-avail-btn"
                  onClick={addAvailability}
                  disabled={!date && selectedDates.length === 0}
                >
                  Add availability
                </button>
              </div>
              <div className="mini-calendar">
                <div className="calendar-head">
                  <div className="cal-month">
                    <button type="button" className="ghost-btn" onClick={goPrevMonth} aria-label="Previous month">
                      <span aria-hidden="true">&#8249;</span>
                    </button>
                    <span>{monthLabel}</span>
                    <button type="button" className="ghost-btn" onClick={goNextMonth} aria-label="Next month">
                      <span aria-hidden="true">&#8250;</span>
                    </button>
                  </div>
                  <span className="muted">Pick multiple days, then click "Add availability"</span>
                </div>
                <div className="calendar-grid">
                  {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((wk) => (
                    <div key={wk} className="cal-day cal-day--header">
                      {wk}
                    </div>
                  ))}
                  {daysThisMonth.map((d, idx) =>
                    d ? (
                      <button
                        key={d.iso}
                        type="button"
                        className={`cal-day ${selectedDates.includes(d.iso) ? 'cal-day--active' : ''}`}
                        onClick={() => toggleSelectedDate(d.iso)}
                      >
                        <span className="cal-day__num">{d.day}</span>
                      </button>
                    ) : (
                      <div key={`blank-${idx}`} className="cal-day cal-day--blank" />
                    )
                  )}
                </div>
              </div>
              <div className="slots slots-vertical">
                {error && <p className="admin-error">{error}</p>}
                {loadingAvail && <p className="muted">Loading availability...</p>}
                {sortedAvailability.length === 0 && <p className="muted">No upcoming slots.</p>}
                {sortedAvailability.map((slot) => (
                  <div className="slot" key={slot.id}>
                    <div>
                      <strong>{slot.date}</strong> {cleanTime(slot.start) ? "- " + cleanTime(slot.start) : ""} {cleanTime(slot.end) ? "to " + cleanTime(slot.end) : ""}
                    </div>
                    <button className="ghost-btn" onClick={() => removeAvailability(slot.id)}>
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'requests' && (
            <div className="panel" role="tabpanel" aria-label="Client requests">
              <div className="panel-head">
                <h3>Client requests</h3>
                <div className="filters">
                  <label>
                    Status
                    <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                      <option>All</option>
                      <option>Pending</option>
                      <option>Accepted</option>
                      <option>Rejected</option>
                    </select>
                  </label>
                </div>
              </div>
              <div className="requests-table">
                <div className="table-head">
                  <span>Client</span>
                  <span>Date</span>
                  <span>Time</span>
                  <span>Status</span>
                  <span>Actions</span>
                </div>
                {error && <div className="table-row empty-row">{error}</div>}
                {loadingReq && <div className="table-row empty-row">Loading requests…</div>}
                {filteredRequests.length === 0 && (
                  <div className="table-row empty-row">No requests</div>
                )}
                {filteredRequests.map((req) => (
                  <div className="table-row" key={req.id}>
                    <span>
                      <strong>{req.client_name || req.client || 'Client'}</strong>
                      {req.notes && <div className="muted">{req.notes}</div>}
                    </span>
                    <span>{req.date}</span>
                    <span>{formatRange(req)}</span>
                    <span className={`status-chip status-${(req.status || '').toLowerCase()}`}>{statusLabel(req.status)}</span>
                    <span className="actions">
                      {req.status === 'Pending' ? (
                        <>
                          <button className="primary-btn" onClick={() => updateRequestStatus(req.id, 'Accepted')}>
                            Accept
                          </button>
                          <button className="ghost-btn" onClick={() => updateRequestStatus(req.id, 'Rejected')}>
                            Reject
                          </button>
                        </>
                      ) : (
                        <div className="muted">
                          {req.status}
                          {req.reason ? ` · ${req.reason}` : ''}
                        </div>
                      )}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>
    </LawyerLayout>
  );
}

