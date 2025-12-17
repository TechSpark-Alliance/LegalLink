import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NavBar from '../../components/NavBar/NavBar';
import styles from './Appointment.module.css';

const defaultAppointment = {
  status: 'Pending approval',
  referenceId: 'LL-20251216-0018',
  start: '2025-12-16T11:00:00',
  durationMinutes: 60,
  mode: 'In-person',
  appointmentType: 'Initial consultation',
  location: {
    name: 'Jung & Co.',
    address: 'Jalan Ampang (Main)',
  },
  meetingLink: null,
  lawyer: {
    name: 'Krystal Jung',
    firm: 'Jung & Co.',
    email: 'krystal.jung@jungandco.my',
    phone: '+60 3-1234 5678',
  },
  client: {
    name: 'Alicia Tan',
    email: 'alicia.tan@example.com',
    phone: '+60 12-345 6789',
  },
  caseDetails: {
    practiceArea: 'Family & Personal Matters',
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
  try {
    const raw = localStorage.getItem('ll_latest_appointment');
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
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
  const [appointment, setAppointment] = useState(() => getStoredAppointment() || defaultAppointment);
  const [isRescheduleOpen, setIsRescheduleOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(Object.keys(mockAvailability)[0] || '');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [selectedDuration, setSelectedDuration] = useState(appointment.durationMinutes);
  const [rescheduleMessage, setRescheduleMessage] = useState('');
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const stored = getStoredAppointment();
    if (stored) {
      setAppointment(stored);
      setSelectedDuration(stored.durationMinutes || appointment.durationMinutes);
    }
  }, []);

  const isOnline = useMemo(
    () => (appointment.mode || '').toLowerCase().includes('online') || (appointment.mode || '').toLowerCase().includes('video'),
    [appointment.mode]
  );

  const appointmentStart = useMemo(() => new Date(appointment.start), [appointment.start]);
  const rescheduleDeadline = useMemo(
    () => new Date(appointmentStart.getTime() - 7 * 24 * 60 * 60 * 1000),
    [appointmentStart]
  );
  const canReschedule = useMemo(() => Date.now() <= rescheduleDeadline.getTime(), [rescheduleDeadline]);

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

  const loading = false;
  const notFound = false;
  const statusTone = appointment.status === 'Pending approval' ? 'amber' : 'success';
  const progressPercent = appointment.status === 'Pending approval' ? 40 : 70;
  const progressStatus =
    appointment.status === 'Pending approval' ? 'Awaiting payment & approval' : 'Confirmed - upcoming';

  const handleConfirmReschedule = () => {
    setIsRescheduleOpen(false);
    setRescheduleMessage(
      `Reschedule requested for ${formatDate(new Date(selectedDate))} at ${selectedSlot} (${selectedDuration} min).`
    );
  };

  const handleToggleDetails = () => setShowDetails((prev) => !prev);

  if (loading) {
    return (
      <div className={styles.page}>
        <NavBar forceActive="/appointment" />
        <main className={styles.main}>
          <div className={styles.skeleton} />
        </main>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className={styles.page}>
        <NavBar forceActive="/appointment" />
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
      <NavBar forceActive="/appointment" />
      <main className={styles.main}>
        <div className={styles.header}>
          <div>
            <p className={styles.eyebrow}>Appointment</p>
            <h1>Your appointment</h1>
            <p className={styles.subhead}>View details and manage rescheduling</p>
          </div>
        </div>

        <section className={styles.summaryGrid}>
          <article
            className={styles.summaryCard}
            onClick={handleToggleDetails}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleToggleDetails()}
          >
            <div className={styles.summaryTop}>
              <Chip tone={appointment.status === 'Pending approval' ? 'Amber' : 'Success'}>
                {appointment.status}
              </Chip>
            </div>
            <div className={styles.summaryHero}>
              <div>
                <div className={styles.summaryDate}>{formatDate(appointmentStart)}</div>
                <div className={styles.summaryTime}>{formatTime(appointmentStart)}</div>
              </div>
              <div className={styles.summaryMeta}>
                <Chip>{appointment.mode}</Chip>
                <Chip>{appointment.durationMinutes} min</Chip>
                <Chip>{appointment.appointmentType}</Chip>
              </div>
            </div>
            <div className={styles.summaryLocation}>
              {isOnline
                ? appointment.meetingLink || 'Online'
                : `${appointment.location?.name || 'Not provided'}${
                    appointment.location?.address ? `, ${appointment.location.address}` : ''
                  }`}
            </div>
            <div className={styles.progressBlock}>
              <div className={styles.progressLabels}>
                <span>Progress</span>
                <span className={styles.progressStatus}>{progressStatus}</span>
              </div>
              <div className={styles.progressTrack}>
                <div className={styles.progressFill} style={{ width: `${progressPercent}%` }} />
              </div>
              <div className={styles.progressSteps}>
                <span className={styles.stepActive}>Payment</span>
                <span className={appointment.status === 'Pending approval' ? styles.stepMuted : styles.stepActive}>
                  Lawyer approval
                </span>
                <span className={styles.stepMuted}>Meeting</span>
                <span className={styles.stepMuted}>Complete</span>
              </div>
            </div>
            <div className={styles.summaryActions}>
              <span className={styles.summaryLink}>
                {showDetails ? 'Hide details' : 'View details'}
              </span>
              <div className={styles.summaryHelper}>
                {canReschedule ? `Reschedule until ${formatDateTime(rescheduleDeadline)}` : 'Rescheduling closed'}
              </div>
            </div>
          </article>
        </section>

        {showDetails && (
          <>
            <section className={styles.primaryCard}>
              <AppointmentHero
                data={appointment}
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
                    <InfoRow label="Name" value={appointment.lawyer?.name} />
                    <InfoRow label="Firm" value={appointment.lawyer?.firm} />
                    <InfoRow label="Email" value={appointment.lawyer?.email} />
                    <InfoRow label="Phone" value={appointment.lawyer?.phone} />
                  </div>
                </div>
              </InfoSection>

              <InfoSection title="Case details">
                <div className={styles.card}>
                  <InfoRow label="Practice area" value={appointment.caseDetails?.practiceArea} />
                  <InfoRow label="Preferred language" value={appointment.caseDetails?.preferredLanguage} />
                  <InfoRow label="Conflict-check names" value={appointment.caseDetails?.conflictCheckNames} />
                  <InfoRow label="Issue summary" value={appointment.caseDetails?.issueSummary} />
                  <InfoRow label="Special requests/notes" value={appointment.caseDetails?.specialRequests} />
                  <InfoRow label="Uploads" value={appointment.caseDetails?.uploads} />
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
