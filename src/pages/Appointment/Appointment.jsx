import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import NavBar from '../../components/NavBar/NavBar';
import styles from './Appointment.module.css';

const API_BASE = import.meta.env.VITE_APP_API || 'http://localhost:8000/api/v1';

const defaultAppointment = {
  status: 'Pending approval',
  referenceId: '',
  start: null,
  durationMinutes: 60,
  mode: 'In-person',
  appointmentType: 'Initial consultation',
  location: {
    name: '',
    address: '',
  },
  meetingLink: null,
  lawyer: {
    name: '',
    firm: '',
    email: '',
    phone: '',
  },
  client: {
    name: '',
    email: '',
    phone: '',
  },
  caseDetails: {
    practiceArea: '',
    preferredLanguage: 'No preference',
    conflictCheckNames: null,
    issueSummary: null,
    specialRequests: null,
    uploads: 'None',
  },
};

const mockAvailability = {
  '2025-12-18': ['09:00', '10:30', '11:30', '14:00', '16:00'],
  '2025-12-19': ['09:00', '10:00', '13:00', '15:30'],
  '2025-12-22': ['09:30', '11:00', '12:30', '15:00'],
};

const durationOptions = [30, 60, 90, 120];

const getStoredUser = () => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('ll_user');
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

const getStoredAppointment = () => {
  if (typeof window === 'undefined') return null;
  const read = (store) => {
    try {
      const raw = store.getItem('ll_latest_appointment');
      if (!raw) return null;
      return JSON.parse(raw);
    } catch {
      return null;
    }
  };
  return read(sessionStorage) || read(localStorage);
};

const saveStoredAppointment = (apt) => {
  if (typeof window === 'undefined') return;
  try {
    const payload = JSON.stringify(apt);
    sessionStorage.setItem('ll_latest_appointment', payload);
    localStorage.setItem('ll_latest_appointment', payload);
  } catch {
    /* ignore */
  }
};

const clearStoredAppointment = () => {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.removeItem('ll_latest_appointment');
    localStorage.removeItem('ll_latest_appointment');
  } catch {
    /* ignore */
  }
};

// Prefer the most recent tab/session token to avoid using a stale token left in localStorage.
const getAuthToken = () =>
  (typeof window !== 'undefined' &&
    (sessionStorage.getItem('token') || localStorage.getItem('token') || '')) ||
  '';

const sanitizeAppointment = (apt) => {
  if (!apt) return defaultAppointment;
  const lawyer = apt.lawyer || {};
  const client = apt.client || {};
  const mappedCaseDetails = apt.caseDetails || apt.case_details || {};
  return {
    ...defaultAppointment,
    ...apt,
    id: apt.id || apt._id || apt.referenceId || '',
    start:
      apt.start ||
      // Normalize date + time into an ISO-ish string so downstream displays can build a Date.
      (apt.date && apt.time ? `${apt.date}T${apt.time}` : null),
    appointmentType: apt.appointmentType || apt.appointment_type || defaultAppointment.appointmentType,
    durationMinutes: apt.durationMinutes || apt.duration_minutes || defaultAppointment.durationMinutes,
    meetingLink: apt.meetingLink || apt.meeting_link || null,
    lawyer: {
      name: lawyer.full_name || lawyer.name || '',
      firm: lawyer.law_firm || lawyer.firm || '',
      email: lawyer.email || '',
      phone: lawyer.phone || '',
    },
    client: {
      name: client.full_name || client.name || '',
      email: client.email || '',
      phone: client.phone || client.phone_number || client.mobile || '',
    },
    caseDetails: {
      ...defaultAppointment.caseDetails,
      ...(mappedCaseDetails || {}),
      preferredLanguage:
        mappedCaseDetails.preferredLanguage ||
        mappedCaseDetails.preferred_language ||
        defaultAppointment.caseDetails.preferredLanguage,
      conflictCheckNames:
        mappedCaseDetails.conflictCheckNames ||
        mappedCaseDetails.conflict_check_names ||
        defaultAppointment.caseDetails.conflictCheckNames,
      issueSummary:
        mappedCaseDetails.issueSummary ||
        mappedCaseDetails.issue_summary ||
        defaultAppointment.caseDetails.issueSummary,
      specialRequests:
        mappedCaseDetails.specialRequests ||
        mappedCaseDetails.special_requests ||
        defaultAppointment.caseDetails.specialRequests,
    },
  };
};

const formatDate = (date) =>
  new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);

const formatTime = (date) =>
  new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);

const formatDateTime = (date) =>
  new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);

const Countdown = ({ start }) => {
  const now = new Date();
  const diffMs = start.getTime() - now.getTime();
  const diffDays = Math.max(Math.floor(diffMs / (1000 * 60 * 60 * 24)), 0);
  return <span className={styles.countdown}>Starts in {diffDays} days</span>;
};

const Chip = ({ children, tone = 'default' }) => (
  <span className={`${styles.chip} ${styles[`chip${tone}`] || ''}`}>{children}</span>
);

const InfoRow = ({ label, value }) => (
  <div className={styles.infoRow}>
    <span className={styles.infoLabel}>{label}</span>
    <span className={value ? styles.infoValue : styles.infoMuted}>{value || 'Not provided'}</span>
  </div>
);

const InfoSection = ({ title, children }) => (
  <section className={styles.infoSection}>
    <div className={styles.infoHeader}>
      <h3>{title}</h3>
    </div>
    <div className={styles.infoBody}>{children}</div>
  </section>
);

const NoteBanner = ({ status }) => {
  const isPending = status === 'Pending approval';
  return (
    <div className={`${styles.noteBanner} ${isPending ? styles.noteHighlight : ''}`}>
      <div className={styles.noteDot} aria-hidden="true" />
      <div>
        <p className={styles.noteTitle}>Important</p>
        <p className={styles.noteText}>
          Please do your transaction directly to the lawyer to confirm the booking. Once payment is verified, the
          lawyer will approve the booking before you can proceed with the meeting.
        </p>
      </div>
    </div>
  );
};

const AppointmentHero = ({ data, rescheduleDeadline, canReschedule }) => {
  const startDate = new Date(data.start);
  const isOnline = (data.mode || '').toLowerCase().includes('online') || (data.mode || '').toLowerCase().includes('video');
  return (
    <div className={styles.hero}>
      <div className={styles.heroHeader}>
        <Chip tone={data.status === 'Pending approval' ? 'Amber' : 'Success'}>
          {data.status}
        </Chip>
        {data.referenceId && <span className={styles.refId}>Ref: {data.referenceId}</span>}
      </div>
      <div className={styles.heroMain}>
        <div className={styles.datetime}>
          <div className={styles.date}>{formatDate(startDate)}</div>
          <div className={styles.time}>{formatTime(startDate)}</div>
          <Countdown start={startDate} />
        </div>
        <div className={styles.heroMeta}>
          <Chip>{data.mode}</Chip>
          <Chip>{`${data.durationMinutes} min`}</Chip>
          <Chip>{data.appointmentType}</Chip>
          {!canReschedule && <Chip tone="Muted">Rescheduling closed</Chip>}
        </div>
      </div>
      <NoteBanner status={data.status} />
      <div className={styles.locationInline}>
        {isOnline ? (
          <div className={styles.locationText}>
            <span className={styles.locationLabel}>Meeting link:</span>
            <span className={styles.locationValue}> {data.meetingLink || 'Not provided'}</span>
          </div>
        ) : (
          <div className={styles.locationText}>
            <span className={styles.locationLabel}>Location:</span>
            <span className={styles.locationValue}>
              {' '}
              {data.location?.name || 'Not provided'}
              {data.location?.address ? `, ${data.location.address}` : ''}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

const RescheduleModal = ({
  open,
  onClose,
  selectedDate,
  setSelectedDate,
  selectedSlot,
  setSelectedSlot,
  selectedDuration,
  setSelectedDuration,
  availability,
  appointment,
  onConfirm,
}) => {
  if (!open) return null;
  const formattedDate = selectedDate || Object.keys(availability)[0] || '';
  const slots = availability[formattedDate] || [];

  return (
    <div className={styles.modalOverlay} role="dialog" aria-modal="true">
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <div>
            <p className={styles.modalEyebrow}>Reschedule</p>
            <h3 className={styles.modalTitle}>Pick a new slot</h3>
          </div>
          <button type="button" className={styles.closeBtn} onClick={onClose} aria-label="Close reschedule form">
            x
          </button>
        </div>
        <div className={styles.modalContent}>
          <div className={styles.inputGroup}>
            <label htmlFor="reschedule-date">1) Select new date</label>
            <input
              id="reschedule-date"
              type="date"
              value={formattedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              min={Object.keys(availability)[0]}
            />
          </div>
          <div className={styles.inputGroup}>
            <label>2) Select time slot</label>
            <div className={styles.slotGrid}>
              {slots.length === 0 && <span className={styles.infoMuted}>No available slots for this date.</span>}
              {slots.map((slot) => (
                <button
                  key={slot}
                  type="button"
                  className={`${styles.slotBtn} ${selectedSlot === slot ? styles.slotSelected : ''}`}
                  onClick={() => setSelectedSlot(slot)}
                >
                  {slot}
                </button>
              ))}
            </div>
          </div>
          <div className={styles.inputGroup}>
            <label>Duration</label>
            <div className={styles.durationRow}>
              {durationOptions.map((duration) => (
                <button
                  key={duration}
                  type="button"
                  className={`${styles.durationBtn} ${
                    selectedDuration === duration ? styles.durationSelected : ''
                  }`}
                  onClick={() => setSelectedDuration(duration)}
                >
                  {duration} min
                </button>
              ))}
            </div>
          </div>
          <div className={styles.previewPanel}>
            <p className={styles.previewLabel}>3) Confirmation preview</p>
            <div className={styles.previewRow}>
              <span className={styles.previewTitle}>New date/time</span>
              <span className={styles.previewValue}>
                {selectedDate && selectedSlot
                  ? `${formatDate(new Date(selectedDate))} at ${selectedSlot}`
                  : 'Select a date and time'}
              </span>
            </div>
            <div className={styles.previewRow}>
              <span className={styles.previewTitle}>Mode</span>
              <span className={styles.previewValue}>{appointment.mode}</span>
            </div>
            <div className={styles.previewRow}>
              <span className={styles.previewTitle}>Location / Link</span>
              <span className={styles.previewValue}>
                {isOnline
                  ? appointment.meetingLink || 'Online'
                  : `${appointment.location?.name || 'Not provided'}${
                      appointment.location?.address ? `, ${appointment.location.address}` : ''
                    }`}
              </span>
            </div>
            <div className={styles.previewRow}>
              <span className={styles.previewTitle}>Duration</span>
              <span className={styles.previewValue}>{selectedDuration} min</span>
            </div>
          </div>
        </div>
        <div className={styles.modalActions}>
          <button type="button" className={styles.secondaryBtn} onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className={styles.primaryBtn}
            onClick={onConfirm}
            disabled={!selectedDate || !selectedSlot}
          >
            Confirm reschedule
          </button>
        </div>
      </div>
    </div>
  );
};

const Appointment = () => {
  const navigate = useNavigate();
  const routerLocation = useLocation();
  const token = getAuthToken();
  const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};
  const [appointment, setAppointment] = useState(() => sanitizeAppointment(getStoredAppointment()));
  const [appointmentsList, setAppointmentsList] = useState(() => {
    const stored = sanitizeAppointment(getStoredAppointment());
    return stored && stored.id ? [stored] : [];
  });
  const [activeAppointmentId, setActiveAppointmentId] = useState(
    () => (appointment && appointment.id) || null
  );
  const [lawyerProfile, setLawyerProfile] = useState(null);
  const [isRescheduleOpen, setIsRescheduleOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(Object.keys(mockAvailability)[0] || '');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [selectedDuration, setSelectedDuration] = useState(appointment.durationMinutes);
  const [rescheduleMessage, setRescheduleMessage] = useState('');
  const [showDetails, setShowDetails] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const stored = getStoredAppointment();
    if (stored) {
      const cleaned = sanitizeAppointment(stored);
      setAppointment(cleaned);
      if (cleaned && cleaned.id) setAppointmentsList([cleaned]);
      setActiveAppointmentId(cleaned.id || null);
      setSelectedDuration(cleaned.durationMinutes || appointment.durationMinutes);
      setNotFound(false);
    }
  }, []);

  useEffect(() => {
    const loadLawyer = async () => {
      if (!appointment.lawyer_id) return;
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE}/lawyers/${appointment.lawyer_id}`, {
          headers: authHeaders,
        });
        const data = await res.json().catch(() => ({}));
        if (res.ok) {
          setLawyerProfile(data.lawyer || data.user || data.profile || data);
        }
            } catch {
        /* ignore */
      } finally {
        setLoading(false);
      }
    };
    if (!appointment.lawyer?.name && appointment.lawyer_id) {
      loadLawyer();
    }
  }, [appointment.lawyer?.name, appointment.lawyer_id]);

  const isOnline = useMemo(
    () => (appointment.mode || '').toLowerCase().includes('online') || (appointment.mode || '').toLowerCase().includes('video'),
    [appointment.mode]
  );

  const appointmentStart = useMemo(() => {
    // If ISO start exists, respect it (assumed UTC or ISO local).
    if (appointment.start) return new Date(appointment.start);
    // Otherwise, build from date + time (both are stored as strings from the booking payload).
    if (appointment.date && appointment.time) {
      const [h, m] = String(appointment.time).split(':').map(Number);
      const parts = String(appointment.date).split('-').map(Number); // YYYY,MM,DD
      const base = new Date(parts[0], (parts[1] || 1) - 1, parts[2] || 1);
      base.setHours(h || 0, m || 0, 0, 0);
      return base;
    }
    return null;
  }, [appointment.start, appointment.date, appointment.time]);
  const rescheduleDeadline = useMemo(() => {
    if (!appointmentStart) return null;
    return new Date(appointmentStart.getTime() - 7 * 24 * 60 * 60 * 1000);
  }, [appointmentStart]);
  const canReschedule = useMemo(() => {
    if (!rescheduleDeadline) return false;
    return Date.now() <= rescheduleDeadline.getTime();
  }, [rescheduleDeadline]);

  const clientDetails = useMemo(() => {
    const stored = getStoredUser();
    const baseClient = appointment.client || defaultAppointment.client;
    if (!stored) return baseClient;
    return {
      ...baseClient,
      name: stored.full_name || stored.fullName || stored.name || stored.email || baseClient.name,
      email: stored.email || baseClient.email,
      phone: stored.phone || stored.phone_number || stored.mobile || baseClient.phone,
    };
  }, [appointment.client]);

  const lawyerDetails = useMemo(() => {
    const lawyer = appointment.lawyer || {};
    const profile = lawyerProfile || {};
    return {
      name: lawyer.name || profile.full_name || profile.name || 'Not provided',
      firm: lawyer.firm || profile.law_firm || 'Not provided',
      email: lawyer.email || profile.email || 'Not provided',
      phone: lawyer.phone || profile.phone || 'Not provided',
    };
  }, [appointment.lawyer, lawyerProfile]);
  const normalizedStatus = useMemo(() => {
    const s = (appointment.status || '').toLowerCase();
    if (s.includes('reject')) return 'rejected';
    if (s.includes('pending')) return 'pending';
    if (s.includes('cancel')) return 'cancelled';
    if (s.includes('accept')) return 'accepted';
    if (s.includes('confirm')) return 'accepted';
    return s || 'pending';
  }, [appointment.status]);
  const statusTone = normalizedStatus === 'pending' ? 'amber' : normalizedStatus === 'rejected' ? 'error' : 'success';
  const progressPercent = normalizedStatus === 'pending' ? 50 : 100;
  const progressStatus =
    normalizedStatus === 'pending'
      ? 'Awaiting approval'
      : normalizedStatus === 'rejected'
      ? 'Rejected'
      : 'Confirmed - upcoming';

  const handleConfirmReschedule = () => {
    setIsRescheduleOpen(false);
    setRescheduleMessage(
      `Reschedule requested for ${formatDate(new Date(selectedDate))} at ${selectedSlot} (${selectedDuration} min).`
    );
  };

  const handleToggleDetails = () => setShowDetails((prev) => !prev);
  const handleSelectAppointment = (apt) => {
    const cleaned = sanitizeAppointment(apt);
    setAppointment(cleaned);
    setActiveAppointmentId(cleaned.id || null);
    setShowDetails(true);
  };

    // Always refresh the appointment from API (ensures latest status/reason after lawyer updates).
  useEffect(() => {
    if (!appointment.id) return;
    const controller = new AbortController();
    const loadAppointment = async () => {
      setLoading(true);
      try {
        const token = getAuthToken();
        const res = await fetch(`${API_BASE}/lawyers/appointments/${appointment.id}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          signal: controller.signal,
        });
        if (res.status === 404) {
          // If we already have an appointment cached, treat this as "rejected" instead of not-found
          // so the user can still see the last known details.
          if (appointment.id) {
            setAppointment((prev) => ({ ...prev, status: 'Rejected' }));
            setNotFound(false);
          } else {
            setNotFound(true);
            setAppointment(defaultAppointment);
          }
          return;
        }
        if (!res.ok) return;
        const data = await res.json().catch(() => null);
        if (data) {
          const cleaned = sanitizeAppointment(data);
          setAppointment(cleaned);
          setActiveAppointmentId(cleaned.id || null);
          setAppointmentsList((prev) => {
            const others = prev.filter((a) => a.id !== cleaned.id);
            return cleaned.id ? [cleaned, ...others] : [cleaned, ...others];
          });
          setNotFound(false);
          saveStoredAppointment(cleaned);
        }
      } catch {
        /* ignore */
      } finally {
        setLoading(false);
      }
    };
    loadAppointment();
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appointment.id]);

  // If an appointment id is provided via query (?id=...), fetch it directly.
  useEffect(() => {
    const params = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
    const id = params.get('id');
    if (!id) return;
    if (appointment.id && appointment.id === id) return;
    const token = getAuthToken();
    const controller = new AbortController();
    const loadById = async () => {
      try {
        const res = await fetch(`${API_BASE}/lawyers/appointments/${id}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          signal: controller.signal,
        });
        if (!res.ok) return;
        const data = await res.json().catch(() => null);
        if (data) {
          const cleaned = sanitizeAppointment(data);
          setAppointment(cleaned);
          setActiveAppointmentId(cleaned.id || null);
          setAppointmentsList((prev) => {
            const others = prev.filter((a) => a.id !== cleaned.id);
            return cleaned.id ? [cleaned, ...others] : [cleaned, ...others];
          });
          setNotFound(false);
          saveStoredAppointment(cleaned);
        }
      } catch {
        /* ignore */
      }
    };
    loadById();
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appointment.id]);

  // Fetch latest appointments for this client (most recent first) once on mount.
  useEffect(() => {
    const token = getAuthToken();
    if (!token) return;
    const controller = new AbortController();
    const loadLatest = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE}/lawyers/appointments/client`, {
          headers: authHeaders,
          signal: controller.signal,
        });
        if (!res.ok) {
          const cached = getStoredAppointment();
          if (cached) {
            const cleanedCached = sanitizeAppointment(cached);
            setAppointment(cleanedCached);
            setActiveAppointmentId(cleanedCached.id || null);
            setAppointmentsList(cleanedCached.id ? [cleanedCached] : []);
            setNotFound(false);
          } else {
            setNotFound(true);
          }
          return;
        }
        const data = await res.json().catch(() => []);
        const list = Array.isArray(data)
          ? data
          : Array.isArray(data?.appointments)
          ? data.appointments
          : [];
        if (list.length > 0) {
          const cleanedList = list.map((item) => sanitizeAppointment(item)).filter(Boolean);
          const latest = cleanedList[0];
          setAppointment(latest);
          setActiveAppointmentId(latest?.id || null);
          setAppointmentsList(cleanedList);
          setNotFound(false);
          saveStoredAppointment(latest);
        } else {
          setNotFound(true);
          setAppointment(defaultAppointment);
        }
      } catch {
        // If API fails, fall back to any cached appointment rather than showing empty state.
        const cached = getStoredAppointment();
        if (cached) {
          const cleanedCached = sanitizeAppointment(cached);
          setAppointment(cleanedCached);
          setActiveAppointmentId(cleanedCached.id || null);
          setAppointmentsList(cleanedCached.id ? [cleanedCached] : []);
          setNotFound(false);
        }
      } finally {
        setLoading(false);
      }
    };
    loadLatest();
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
const handleCancel = async () => {
    if (!appointment.id) return;
    const confirm = window.confirm('Cancel this appointment?');
    if (!confirm) return;
    const token = getAuthToken();
    try {
      const res = await fetch(`${API_BASE}/lawyers/appointments/${appointment.id}`, {
        method: 'DELETE',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || 'Failed to cancel appointment');
      }
      setAppointment(defaultAppointment);
      clearStoredAppointment();
      setAppointmentsList((prev) => prev.filter((a) => a.id !== appointment.id));
      setActiveAppointmentId(null);
    } catch (err) {
      // eslint-disable-next-line no-alert
      alert(err.message || 'Failed to cancel appointment');
    }
  };

  if (loading) {
    return (
      <div className={styles.page}>
        <NavBar forceActive="/client/appointment" />
        <main className={styles.main}>
          <div className={styles.skeleton} />
        </main>
      </div>
    );
  }

  if (notFound || !appointmentStart) {
    return (
      <div className={styles.page}>
        <NavBar forceActive="/client/appointment" />
        <main className={styles.main}>
          <div className={styles.emptyState}>
            <h2>Appointment not found</h2>
            <p>Please make a booking first, then return here.</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <NavBar forceActive="/client/appointment" />
      <main className={styles.main}>
        <div className={styles.header}>
          <div>
            <p className={styles.eyebrow}>Appointment</p>
            <h1>Your appointment</h1>
            <p className={styles.subhead}>View details and manage rescheduling</p>
          </div>
        </div>

        <section className={styles.summaryGrid}>
          {(appointmentsList.length ? appointmentsList : appointment.id ? [appointment] : []).map((apt) => {
            const start =
              apt.start ? new Date(apt.start) : apt.date && apt.time ? new Date(`${apt.date}T${apt.time}`) : null;
            const statusLower = (apt.status || '').toLowerCase();
            const tone =
              statusLower === 'rejected' ? 'Error' : statusLower === 'pending' ? 'Amber' : statusLower === 'cancelled' ? 'Muted' : 'Success';
            const isCardOnline =
              (apt.mode || '').toLowerCase().includes('online') || (apt.mode || '').toLowerCase().includes('video');
            const isActiveCard = activeAppointmentId ? activeAppointmentId === apt.id : appointment.id === apt.id;
            return (
              <article
                key={apt.id || `${apt.date}-${apt.time}`}
                className={`${styles.summaryCard} ${isActiveCard ? styles.summaryActive : ''}`}
                onClick={() => {
                  const cleaned = sanitizeAppointment(apt);
                  setAppointment(cleaned);
                  setActiveAppointmentId(cleaned.id || null);
                  setShowDetails(true);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    const cleaned = sanitizeAppointment(apt);
                    setAppointment(cleaned);
                    setActiveAppointmentId(cleaned.id || null);
                    setShowDetails(true);
                  }
                }}
              >
                <div className={styles.summaryTop}>
                  <Chip tone={tone}>{apt.status || 'Pending'}</Chip>
                </div>
                <div className={styles.summaryHero}>
                  <div>
                    <div className={styles.summaryDate}>{start ? formatDate(start) : 'Date TBD'}</div>
                    <div className={styles.summaryTime}>{start ? formatTime(start) : 'Time TBD'}</div>
                  </div>
                  <div className={styles.summaryMeta}>
                    <Chip>{apt.mode}</Chip>
                    <Chip>{apt.durationMinutes || apt.duration_minutes || 60} min</Chip>
                    <Chip>{apt.appointmentType || apt.appointment_type}</Chip>
                  </div>
                </div>
                <div className={styles.summaryLocation}>
                  {isCardOnline
                    ? apt.meetingLink || 'Online'
                    : `${apt.location?.name || 'Not provided'}${
                        apt.location?.address ? `, ${apt.location.address}` : ''
                      }`}
                </div>
                <div className={styles.summaryActions}>
                  <button
                    type="button"
                    className={styles.summaryLinkButton || styles.summaryLink}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectAppointment(apt);
                    }}
                  >
                    {isActiveCard && showDetails ? 'Viewing details' : 'View details'}
                  </button>
                  <div className={styles.summaryHelper}>
                    {statusLower === 'rejected'
                      ? 'Rejected'
                      : statusLower === 'pending'
                      ? 'Awaiting approval'
                      : 'Confirmed'}
                  </div>
                </div>
              </article>
            );
          })}
        </section>

        {showDetails && (
          <>
            <section className={styles.primaryCard}>
              <AppointmentHero
                data={{ ...appointment, start: appointmentStart.toISOString() }}
                rescheduleDeadline={rescheduleDeadline}
                canReschedule={canReschedule}
              />

              <div className={styles.rescheduleBar}>
                <div className={styles.rescheduleCopy}>
                  {!canReschedule && (
                    <p className={styles.rescheduleWarning}>
                      Rescheduling is closed. You can only reschedule at least 7 days before the appointment starts - Deadline: {formatDateTime(rescheduleDeadline)}
                    </p>
                  )}
                  {canReschedule && (
                    <p className={styles.rescheduleHelper}>
                      Rescheduling allowed until {formatDateTime(rescheduleDeadline)}
                    </p>
                  )}
                </div>
                <div className={styles.rescheduleActions}>
                  <button
                    type="button"
                    className={`${styles.primaryBtn} ${!canReschedule ? styles.btnDisabled : ''}`}
                    onClick={() => setIsRescheduleOpen(true)}
                    disabled={!canReschedule}
                  >
                    Reschedule
                  </button>
                  {normalizedStatus !== 'cancelled' && (
                    <button type="button" className={styles.secondaryBtn} onClick={handleCancel}>
                      Cancel appointment
                    </button>
                  )}
                </div>
              </div>
            </section>

            <section className={styles.supportingGrid}>
              <InfoSection title="People">
                <div className={styles.twoCol}>
                  <div className={styles.card}>
                    <p className={styles.cardTitle}>Client</p>
                    <InfoRow label="Name" value={clientDetails.name} />
                    <InfoRow label="Email" value={clientDetails.email} />
                    <InfoRow label="Phone" value={clientDetails.phone} />
                  </div>
                  <div className={styles.card}>
                    <p className={styles.cardTitle}>Lawyer</p>
                    <InfoRow label="Name" value={lawyerDetails.name} />
                    <InfoRow label="Firm" value={lawyerDetails.firm} />
                    <InfoRow label="Email" value={lawyerDetails.email} />
                    <InfoRow label="Phone" value={lawyerDetails.phone} />
                  </div>
                </div>
              </InfoSection>

              <InfoSection title="Case details">
                <div className={styles.card}>
                  <InfoRow label="Preferred language" value={appointment.caseDetails?.preferredLanguage} />
                  <InfoRow label="Conflict-check names" value={appointment.caseDetails?.conflictCheckNames} />
                  <InfoRow label="Issue summary" value={appointment.caseDetails?.issueSummary} />
                  <InfoRow label="Special requests/notes" value={appointment.caseDetails?.specialRequests} />
                </div>
              </InfoSection>
            </section>
          </>
        )}

        {rescheduleMessage && <div className={styles.toast}>{rescheduleMessage}</div>}
      </main>

      <RescheduleModal
        open={isRescheduleOpen}
        onClose={() => setIsRescheduleOpen(false)}
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        selectedSlot={selectedSlot}
        setSelectedSlot={setSelectedSlot}
        selectedDuration={selectedDuration}
        setSelectedDuration={setSelectedDuration}
        availability={mockAvailability}
        appointment={appointment}
        onConfirm={handleConfirmReschedule}
      />
    </div>
  );
};

export default Appointment;
