import React, { useEffect, useMemo, useState } from 'react';
import { useLocation as useRouterLocation, useNavigate, useParams } from 'react-router-dom';
import NavBar from '../../components/NavBar/NavBar';
import './AppointmentBooking.css';

const API_BASE = import.meta.env.VITE_APP_API || 'http://localhost:8000/api/v1';

const appointmentTypes = [
  'Initial consultation',
  'Follow-up',
  'Document review',
  'Representation inquiry',
];
const modeOptions = ['In-person', 'Video call'];
const durationOptions = [
  { label: '30 min', value: 30 },
  { label: '60 min', value: 60 },
  { label: '90 min', value: 90 },
];
const languageOptions = ['English', 'Bahasa Melayu', 'Mandarin'];

const formatTime = (slot) => {
  if (!slot) return '';
  const [hours, minutes] = slot.split(':').map(Number);
  const labelHours = hours % 12 || 12;
  const period = hours >= 12 ? 'PM' : 'AM';
  return `${labelHours}:${minutes.toString().padStart(2, '0')} ${period}`;
};

const minutesFromTime = (timeStr) => {
  const [h, m] = String(timeStr || '00:00').split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
};

const timeFromMinutes = (mins) => {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
};

const getStoredUser = () => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('ll_user');
    if (raw) return JSON.parse(raw);
    // Fallback to session data we stash on login
    const name = localStorage.getItem('full_name') || sessionStorage.getItem('full_name');
    const email = localStorage.getItem('email') || sessionStorage.getItem('email');
    const phone = localStorage.getItem('phone') || sessionStorage.getItem('phone');
    if (name || email || phone) {
      return { full_name: name, email, phone };
    }
    return null;
  } catch {
    return null;
  }
};

const getAuthToken = () =>
  (typeof window !== 'undefined' && (localStorage.getItem('token') || sessionStorage.getItem('token') || '')) ||
  '';

const splitLocation = (location) => {
  if (!location) return { name: 'Not provided', address: '' };
  const [name, ...rest] = location.split(' - ');
  return { name: name || location, address: rest.join(' - ') || '' };
};

const toDateFromIso = (iso) => {
  if (!iso) return new Date();
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
};

const toIsoLocal = (dateObj) => {
  const y = dateObj.getFullYear();
  const m = (dateObj.getMonth() + 1).toString().padStart(2, '0');
  const d = dateObj.getDate().toString().padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const makeReference = () => {
  const now = new Date();
  const ref = `${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now
    .getDate()
    .toString()
    .padStart(2, '0')}${now.getHours().toString().padStart(2, '0')}${now.getMinutes().toString().padStart(2, '0')}`;
  return `LL-${ref}`;
};

const AppointmentBooking = () => {
  const { id } = useParams();
  const routerLocation = useRouterLocation();
  const navigate = useNavigate();
  const lawyerId =
    id ||
    routerLocation.state?.lawyerId ||
    new URLSearchParams(routerLocation.search || '').get('lawyerId') ||
    '';
  const [lawyerProfile, setLawyerProfile] = useState(null);
  const [availability, setAvailability] = useState([]);
  const [bookedSlots, setBookedSlots] = useState([]);
  const [loadingAvail, setLoadingAvail] = useState(false);
  const [visibleMonth, setVisibleMonth] = useState(() => new Date().getMonth());
  const [visibleYear, setVisibleYear] = useState(() => new Date().getFullYear());
  const [appointmentType, setAppointmentType] = useState(appointmentTypes[0]);
  const [mode, setMode] = useState(modeOptions[0]);
  const [duration, setDuration] = useState(durationOptions[1].value);
  const [meetingLocation, setMeetingLocation] = useState('');
  const [issueSummary, setIssueSummary] = useState('');
  const [conflictNames, setConflictNames] = useState('');
  const [ackFee, setAckFee] = useState(false);
  const [ackPrivacy, setAckPrivacy] = useState(false);
  const [language, setLanguage] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [receipt, setReceipt] = useState(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const bookingPath = lawyerId ? `/client/lawyers/lawyer/${lawyerId}/book-appointment` : '/client/lawyers/book-appointment';
  const clientInfo = useMemo(() => {
    const stored = getStoredUser();
    return {
      name: stored?.full_name || stored?.fullName || stored?.name || stored?.email || 'Alicia Tan (Client)',
      email: stored?.email || 'alicia.tan@example.com',
      phone: stored?.phone || stored?.phone_number || stored?.mobile || '+60 12-345 6789',
    };
  }, []);

  useEffect(() => {
    if (!lawyerId) return;
    const loadLawyer = async () => {
      try {
        const res = await fetch(`${API_BASE}/lawyers/${lawyerId}`);
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.detail || 'Failed to load lawyer');
        const profile = data.lawyer || data.user || data.profile || data;
        setLawyerProfile(profile);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error(err);
      }
    };
    loadLawyer();

    const loadAvailability = async () => {
      setLoadingAvail(true);
      try {
        const res = await fetch(`${API_BASE}/lawyers/${lawyerId}/availability`);
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.detail || 'Failed to load availability');
        const slots = Array.isArray(data) ? data : data?.availability || [];
        setAvailability(slots);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error(err);
      } finally {
        setLoadingAvail(false);
      }
    };
    loadAvailability();
  }, [lawyerId]);

  const physicalMeetingOptions = useMemo(() => {
    const opts = [];
    const firm = lawyerProfile?.law_firm;
    const city = lawyerProfile?.city ? `, ${lawyerProfile.city}` : '';
    const state = lawyerProfile?.state ? `, ${lawyerProfile.state}` : '';
    if (firm) {
      opts.push(`${firm}${city}${state}`);
    }
    // Always provide a generic in-person option even if no address is on file.
    opts.push('In-person at lawyer office');
    return Array.from(new Set(opts));
  }, [lawyerProfile]);

  const virtualMeetingOptions = useMemo(
    () => ['Video call (online)', 'Zoom / Meet link from lawyer'],
    []
  );

  const meetingOptions = useMemo(
    () => (mode === 'In-person' ? physicalMeetingOptions : virtualMeetingOptions),
    [mode, physicalMeetingOptions, virtualMeetingOptions]
  );

  const isoSelected = selectedDate ? toIsoLocal(selectedDate) : '';

  const futureAvailability = useMemo(() => {
    const todayIso = toIsoLocal(new Date());
    return availability.filter((slot) => (slot?.date || '') >= todayIso);
  }, [availability]);

  const slotsForSelectedDay = useMemo(
    () => futureAvailability.filter((slot) => slot.date === isoSelected),
    [futureAvailability, isoSelected]
  );

  useEffect(() => {
    if (meetingOptions.length) {
      setMeetingLocation(meetingOptions[0]);
    }
  }, [meetingOptions]);

  useEffect(() => {
    // Reset selected slot when mode changes.
    setSelectedSlot('');
  }, [mode]);

  useEffect(() => {
    // Keep visible month in sync with the selected date (useful when cancel/back changes selection).
    if (!selectedDate) return;
    setVisibleMonth(selectedDate.getMonth());
    setVisibleYear(selectedDate.getFullYear());
  }, [selectedDate]);

  const allowedDates = useMemo(
    () => new Set(futureAvailability.map((slot) => String(slot.date))),
    [futureAvailability]
  );
  const monthLabel = useMemo(
    () =>
      new Date(visibleYear, visibleMonth, 1).toLocaleDateString('en', { month: 'long', year: 'numeric' }),
    [visibleMonth, visibleYear]
  );

  const goPrevMonth = () => {
    setVisibleMonth((m) => {
      if (m === 0) {
        setVisibleYear((y) => y - 1);
        return 11;
      }
      return m - 1;
    });
  };

  const goNextMonth = () => {
    setVisibleMonth((m) => {
      if (m === 11) {
        setVisibleYear((y) => y + 1);
        return 0;
      }
      return m + 1;
    });
  };

  useEffect(() => {
    if (slotsForSelectedDay.length === 0) {
      setSelectedSlot('');
      return;
    }
  }, [slotsForSelectedDay]);

  useEffect(() => {
    if (!lawyerId || !isoSelected) return;
    const loadBooked = async () => {
      try {
        const res = await fetch(`${API_BASE}/lawyers/${lawyerId}/appointments/public?status=accepted&date=${isoSelected}`);
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.detail || 'Failed to load booked slots');
        const appts = Array.isArray(data) ? data : data?.appointments || [];
        setBookedSlots(appts);
      } catch {
        setBookedSlots([]);
      }
    };
    loadBooked();
  }, [lawyerId, isoSelected]);

  const dayButtons = useMemo(() => {
    const daysInMonth = new Date(visibleYear, visibleMonth + 1, 0).getDate();
    return Array.from({ length: daysInMonth }, (_, index) => index + 1);
  }, [visibleMonth, visibleYear]);

  const availableSegments = useMemo(() => {
    const bookedSet = new Set(
      bookedSlots
        .filter((b) => !b.date || b.date === isoSelected)
        .map((b) => b.time || b.start || '')
        .filter(Boolean)
    );
    const segments = [];
    slotsForSelectedDay.forEach((slot) => {
      const startMin = minutesFromTime(slot.start || '09:00');
      const endMin = minutesFromTime(slot.end || '17:00');
      for (let m = startMin; m + duration <= endMin; m += duration) {
        const s = timeFromMinutes(m);
        const e = timeFromMinutes(m + duration);
        if (bookedSet.has(s)) continue;
        segments.push({
          value: `${s}-${e}`,
          label: `${formatTime(s)} - ${formatTime(e)}`,
          disabled: false,
          reason: '',
        });
      }
    });
    return segments;
  }, [slotsForSelectedDay, duration, bookedSlots, isoSelected]);

  useEffect(() => {
    if (availableSegments.length && !availableSegments.some((seg) => seg.value === selectedSlot)) {
      setSelectedSlot(availableSegments[0].value);
    }
    if (!availableSegments.length) {
      setSelectedSlot('');
    }
  }, [availableSegments, selectedSlot]);

  const filteredSlots = availableSegments;

  const selectedSlotLabel = useMemo(() => {
    if (selectedSlot) return selectedSlot.replace('-', ' - ');
    return 'Select a time';
  }, [selectedSlot]);

  const readableSlot = useMemo(() => {
    if (!selectedSlot) return 'Select a time';
    const [s, e] = selectedSlot.split('-');
    return `${formatTime(s)} - ${formatTime(e)}`;
  }, [selectedSlot]);

  const selectedDateLabel = selectedDate
    ? `${selectedDate.getDate().toString().padStart(2, '0')}/${(selectedDate.getMonth() + 1)
        .toString()
        .padStart(2, '0')}/${selectedDate.getFullYear()}`
    : 'Select a date';

  const profilePath = id ? `/client/lawyers/lawyer/${id}` : '/client/lawyers';

  const heroDateLabel = useMemo(() => {
    if (!selectedDate) return 'Select a date';
    return selectedDate.toLocaleDateString('en-GB', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }, [selectedDate]);

  const buildAppointmentPayload = () => {
    const lawyerName = lawyerProfile?.full_name || lawyerProfile?.name || 'Not provided';
    const lawyerEmail = lawyerProfile?.email || 'Not provided';
    const lawyerPhone = lawyerProfile?.phone || 'Not provided';
    const startDateTime = new Date(selectedDate || Date.now());
    const endDateTime = new Date(selectedDate || Date.now());
    if (selectedSlot) {
      const [rawStart, rawEnd] = selectedSlot.split('-');
      const [sh, sm] = rawStart.split(':').map(Number);
      const [eh, em] = rawEnd ? rawEnd.split(':').map(Number) : [sh, sm];
      startDateTime.setHours(sh, sm || 0, 0, 0);
      endDateTime.setHours(eh || sh, em || sm || 0, 0, 0);
    }
    const locationParts = splitLocation(meetingLocation);
    return {
      status: 'Pending approval',
      referenceId: makeReference(),
      start: startDateTime.toISOString(),
      end: selectedSlot ? endDateTime.toISOString() : null,
      durationMinutes: duration,
      mode,
      appointmentType,
      location: locationParts,
      meetingLink: mode === 'Video call' ? meetingLocation : null,
      lawyer: {
        ...((lawyerProfile || {}) ?? {}),
        name: lawyerName,
        full_name: lawyerName,
        email: lawyerEmail,
        phone: lawyerPhone,
      },
      client: { ...clientInfo },
      caseDetails: {
        preferredLanguage: language || 'No preference',
        conflictCheckNames: conflictNames || null,
        issueSummary: issueSummary || null,
        specialRequests: notes || null,
      },
    };
  };

  const saveLatestAppointment = () => {
    try {
      localStorage.setItem('ll_latest_appointment', JSON.stringify(buildAppointmentPayload()));
    } catch {
      /* ignore */
    }
  };

  const handleConfirm = () => {
    if (!selectedDate || !selectedSlot) return;
    setReceipt({
      clientName: clientInfo.name,
      clientEmail: clientInfo.email,
      clientPhone: clientInfo.phone,
      lawyerName: lawyerProfile?.full_name || lawyerProfile?.name || 'Not provided',
      lawyerEmail: lawyerProfile?.email || 'Not provided',
      lawyerPhone: lawyerProfile?.phone || 'Not provided',
      appointmentType,
      mode,
      duration: durationOptions.find((opt) => opt.value === duration)?.label || `${duration} min`,
      location: meetingLocation,
      issueSummary,
      conflictNames,
      language: language || 'No preference',
      notes: notes || '-',
      date: heroDateLabel,
      time: readableSlot,
    });
    setShowReceiptModal(true);
  };

  const handleFinalize = async () => {
    if (!selectedDate || !selectedSlot || !lawyerId) return;
    const token = getAuthToken();
    const payload = buildAppointmentPayload();
    const [slotStart] = selectedSlot.split('-');
    const body = {
      lawyer_id: lawyerId,
      date: isoSelected,
      time: slotStart,
      duration_minutes: duration,
      mode,
      appointment_type: appointmentType,
      location_name: payload.location?.name || '',
      location_address: payload.location?.address || '',
      meeting_link: payload.meetingLink,
      notes: notes || null,
      client_name: clientInfo.name,
      client_email: clientInfo.email,
      client_phone: clientInfo.phone,
    };
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/lawyers/appointments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.detail || 'Failed to create appointment');
      // Persist latest booking locally for the client view page.
      localStorage.setItem('ll_latest_appointment', JSON.stringify(data));
      setShowReceiptModal(false);
      navigate('/client/appointment');
    } catch (err) {
      // eslint-disable-next-line no-alert
      alert(err.message || 'Failed to create appointment');
    } finally {
      setSubmitting(false);
    }
  };

  const receiptFields = receipt
    ? {
        appointment: {
          date: receipt.date,
          time: receipt.time,
          mode: receipt.mode,
          duration: receipt.duration,
          type: receipt.appointmentType,
          location: receipt.location,
        },
        people: {
          client: receipt.clientName,
          clientEmail: receipt.clientEmail,
          clientPhone: receipt.clientPhone,
          lawyer: receipt.lawyerName,
          lawyerEmail: receipt.lawyerEmail,
          lawyerPhone: receipt.lawyerPhone,
        },
        caseDetails: [
          { label: 'Preferred language', value: receipt.language || 'Not provided' },
          { label: 'Conflict-check names', value: receipt.conflictNames || 'Not provided' },
          { label: 'Issue summary', value: receipt.issueSummary || 'Not provided' },
          { label: 'Special requests/notes', value: receipt.notes || 'Not provided' },
        ],
      }
    : null;

  return (
    <div className="booking-page">
      <NavBar forceActive="/client/lawyers" />
      <main className="booking-shell">
        <header className="page-head">
          <div>
            <p className="eyebrow">Appointment booking</p>
            <h1>Book Appointment</h1>
            <p className="muted">Fill in the details below to schedule your consultation.</p>
          </div>
        </header>

        <section className="booking-grid">
          <form className="booking-form" aria-label="Appointment details">
            <div className="field">
              <label htmlFor="appointmentType">Appointment Type</label>
              <select
                id="appointmentType"
                value={appointmentType}
                onChange={(e) => setAppointmentType(e.target.value)}
                required
              >
                {appointmentTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div className="field">
              <span className="label">Mode</span>
              <div className="segmented">
                {modeOptions.map((option) => (
                  <button
                    key={option}
                    type="button"
                    className={`chip ${mode === option ? 'chip-active' : ''}`}
                    onClick={() => setMode(option)}
                    aria-pressed={mode === option}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            <div className="field">
              <label htmlFor="duration">Duration</label>
              <select
                id="duration"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                required
              >
                {durationOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <p className="helper">Available times will update based on duration.</p>
            </div>

            <div className="field">
              <label htmlFor="meetingLocation">Meeting location / link preference</label>
              <select
                id="meetingLocation"
                value={meetingLocation}
                onChange={(e) => setMeetingLocation(e.target.value)}
                required
              >
                {meetingOptions.map((locVal) => (
                  <option key={locVal} value={locVal}>
                    {locVal}
                  </option>
                ))}
              </select>
            </div>

            <div className="field">
              <label htmlFor="conflicts">Conflict-check names</label>
              <input
                id="conflicts"
                type="text"
                placeholder="e.g. Jane Tan, ABC Sdn Bhd"
                value={conflictNames}
                onChange={(e) => setConflictNames(e.target.value)}
                required
              />
              <p className="helper">
                List individuals/companies involved so the lawyer can check conflicts.
              </p>
            </div>

            <div className="field">
              <label htmlFor="issueSummary">Issue summary</label>
              <textarea
                id="issueSummary"
                minLength={20}
                maxLength={500}
                placeholder="Briefly describe your situation and what outcome you want."
                value={issueSummary}
                onChange={(e) => setIssueSummary(e.target.value)}
                required
              />
            </div>

            <div className="field optional-block">
              <div className="optional-head">
                <h3>Optional details</h3>
                <span className="muted">Share extra context if you like.</span>
              </div>
              <div className="optional-grid">
                <div className="field">
                  <label htmlFor="language">Preferred communication language</label>
                  <select
                    id="language"
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                  >
                    <option value="">No preference</option>
                    {languageOptions.map((lang) => (
                      <option key={lang} value={lang}>
                        {lang}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="field">
                  <label htmlFor="notes" className="notes-label">
                    Special requests / notes
                  </label>
                  <textarea
                    id="notes"
                    maxLength={300}
                    placeholder="Add any access needs, interpreter requests, or other notes."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="field acknowledgements">
              <label className="checkbox">
                <input
                  type="checkbox"
                  checked={ackFee}
                  onChange={(e) => setAckFee(e.target.checked)}
                  required
                />
                <span>I agree to the consultation fee and cancellation policy.</span>
              </label>
              <label className="checkbox">
                <input
                  type="checkbox"
                  checked={ackPrivacy}
                  onChange={(e) => setAckPrivacy(e.target.checked)}
                  required
                />
                <span>
                  I consent to privacy/data processing and understand this is not legal advice until
                  engagement is confirmed.
                </span>
              </label>
            </div>
          </form>

          <aside className="schedule-panel">
            <div className="panel-card">
              <div className="panel-head">
                <div>
                  <p className="eyebrow">Schedule</p>
                  <h2>Select a date & time</h2>
                </div>
              </div>
              <div className="calendar" aria-label="Available dates">
                <div className="calendar-head">
                  <div className="month-label">
                    {monthLabel}
                  </div>
                  <div className="calendar-nav">
                    <button
                      type="button"
                      className="nav-btn"
                      onClick={goPrevMonth}
                      
                      aria-label="Previous month"
                    >
                      ‹
                    </button>
                    <button
                      type="button"
                      className="nav-btn"
                      onClick={goNextMonth}
                      
                      aria-label="Next month"
                    >
                      ›
                    </button>
                  </div>
                </div>
                <div className="calendar-grid">
                  {dayButtons.map((day) => {
                    const dateObj = new Date(visibleYear, visibleMonth, day);
                    const iso = toIsoLocal(dateObj);
                    const isAllowed = allowedDates.has(iso);
                    const isSelected =
                      isAllowed &&
                      selectedDate &&
                      day === selectedDate.getDate() &&
                      selectedDate.getMonth() === visibleMonth &&
                      selectedDate.getFullYear() === visibleYear;
                    return (
                      <button
                        type="button"
                        key={day}
                        className={`day ${isSelected ? 'day-selected' : ''} ${!isAllowed ? 'day-disabled' : ''}`}
                        disabled={!isAllowed}
                        onClick={() => {
                          if (!isAllowed) return;
                          setSelectedDate(dateObj);
                        }}
                        aria-pressed={isSelected}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="times">
                <div className="times-head">
                  <p className="strong">Time slots</p>
                  <p className="muted">Choose from available slots</p>
                </div>
                <div className="slots">
                  {filteredSlots.length === 0 ? (
                    <div className="muted">No slots for this date.</div>
                  ) : (
                    filteredSlots.map((slot) => (
                      <button
                        type="button"
                        key={slot.value}
                        className={`slot ${selectedSlot === slot.value ? 'slot-active' : ''}`}
                        disabled={slot.disabled}
                        onClick={() => setSelectedSlot(slot.value)}
                        title={slot.reason || 'Available'}
                      >
                        {slot.label}
                      </button>
                    ))
                  )}
                </div>
                <p className="muted note">
                  Slots reflect the lawyer's published availability.
                </p>
              </div>

              <div className="summary">
                <div className="summary-row">
                  <span>Date</span>
                  <strong>{selectedDateLabel}</strong>
                </div>
                <div className="summary-row">
                  <span>Time</span>
                  <strong>{readableSlot}</strong>
                </div>
                <div className="summary-row">
                  <span>Mode</span>
                  <strong>{mode}</strong>
                </div>
                <div className="summary-row">
                  <span>Duration</span>
                  <strong>
                    {durationOptions.find((opt) => opt.value === duration)?.label || `${duration} min`}
                  </strong>
                </div>
                <div className="summary-row">
                  <span>Appointment type</span>
                  <strong>{appointmentType}</strong>
                </div>
              </div>
            </div>

            <div className="panel-actions">
              <button
                type="button"
                className="btn primary"
                disabled={!selectedDate || !selectedSlot || !ackFee || !ackPrivacy}
                onClick={handleConfirm}
              >
                Review & submit booking
              </button>
              <button type="button" className="btn ghost" onClick={() => navigate(profilePath)}>
                Cancel
              </button>
            </div>

            {showReceiptModal && receipt && receiptFields && (
              <div className="modal-backdrop" role="presentation">
                <div className="receipt-modal" role="dialog" aria-modal="true" aria-label="Booking receipt">
                  <header className="receipt-header">
                    <div>
                      <p className="muted small">A copy will be emailed to {receipt.clientEmail} and {receipt.lawyerEmail} for confirmation.</p>
                      <h2>Review booking details</h2>
                    </div>
                  </header>

                  <div className="receipt-card">
                    <section className="receipt-section hero">
                      <div className="hero-date">
                        <div className="hero-label">Date</div>
                        <div className="hero-value">{receiptFields.appointment.date}</div>
                        <div className="hero-time">{receiptFields.appointment.time}</div>
                      </div>
                      <div className="hero-chips">
                        <span className="chip soft">{receiptFields.appointment.mode}</span>
                        <span className="chip soft">{receiptFields.appointment.duration}</span>
                        <span className="chip soft">{receiptFields.appointment.type}</span>
                      </div>
                      <div className="hero-location">
                        <span className="muted">Location:</span>
                        <span className="hero-location-value">{receiptFields.appointment.location}</span>
                      </div>
                    </section>

                    <section className="receipt-section people">
                      <div className="section-title">People</div>
                      <div className="people-grid">
                        <div className="people-block">
                          <div className="muted">Client</div>
                          <div className="people-name">{receiptFields.people.client}</div>
                          <div className="people-sub">{receiptFields.people.clientEmail}</div>
                          <div className="people-sub">{receiptFields.people.clientPhone}</div>
                        </div>
                        <div className="people-block">
                          <div className="muted">Lawyer</div>
                          <div className="people-name">{receiptFields.people.lawyer}</div>
                          <div className="people-sub">{receiptFields.people.lawyerEmail}</div>
                          <div className="people-sub">{receiptFields.people.lawyerPhone}</div>
                        </div>
                      </div>
                    </section>

                    <section className="receipt-section">
                      <div className="section-title">Case details</div>
                      <div className="details-list">
                        {receiptFields.caseDetails.map((item) => (
                          <div className="detail-row" key={item.label}>
                            <span className="muted">{item.label}</span>
                            <span
                              className={`detail-value ${
                                !item.value || item.value === 'Not provided' || item.value === 'None'
                                  ? 'placeholder'
                                  : ''
                              }`}
                            >
                              {item.value || 'Not provided'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </section>
                  </div>

                  <div className="receipt-actions">
                <button type="button" className="btn primary" onClick={handleFinalize}>
                      {submitting ? 'Submitting...' : 'Confirm booking'}
                </button>
                    <button type="button" className="btn ghost" onClick={() => setShowReceiptModal(false)}>
                      Edit booking
                    </button>
                  </div>
                </div>
              </div>
            )}
          </aside>
        </section>
      </main>
    </div>
  );
};

export default AppointmentBooking;
