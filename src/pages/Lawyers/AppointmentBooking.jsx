import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import NavBar from '../../components/NavBar/NavBar';
import './AppointmentBooking.css';

const PRESELECTED_DATE = new Date(2025, 11, 16); // 16/12/2025
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
const locationOptions = {
  'In-person': ['Jung & Co. - Jalan Ampang (Main)', 'Jung & Co. - Bangsar (Branch)'],
  'Video call': ['Zoom', 'Google Meet', 'Microsoft Teams', 'Auto-generate link'],
};
const practiceAreas = [
  'Family & Personal Matters',
  'Business & Corporate',
  'Property & Real Estate',
  'Intellectual Property',
  'Employment / Labour',
  'Criminal Defence',
];
const languageOptions = ['English', 'Bahasa Melayu', 'Mandarin'];

const bookedSlots = ['10:00', '13:00', '14:30'];
const latestStartByDuration = {
  30: 16.5,
  60: 16,
  90: 15.5,
};
const mockLawyer = {
  name: 'Krystal Jung',
  email: 'krystal.jung@jungandco.my',
  phone: '+60 3-1234 5678',
};
const monthNames = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const formatTime = (slot) => {
  const [hours, minutes] = slot.split(':').map(Number);
  const labelHours = hours % 12 || 12;
  const period = hours >= 12 ? 'PM' : 'AM';
  return `${labelHours}:${minutes.toString().padStart(2, '0')} ${period}`;
};

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

const splitLocation = (location) => {
  if (!location) return { name: 'Not provided', address: '' };
  const [name, ...rest] = location.split(' - ');
  return { name: name || location, address: rest.join(' - ') || '' };
};

const makeReference = () => {
  const now = new Date();
  const ref = `${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now
    .getDate()
    .toString()
    .padStart(2, '0')}${now.getHours().toString().padStart(2, '0')}${now.getMinutes().toString().padStart(2, '0')}`;
  return `LL-${ref}`;
};

const buildSlots = () => {
  const startMinutes = 9 * 60;
  const endMinutes = 17 * 60;
  const slots = [];
  for (let m = startMinutes; m < endMinutes; m += 30) {
    const hours = Math.floor(m / 60);
    const minutes = m % 60;
    slots.push(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`);
  }
  return slots;
};

const timeSlots = buildSlots();

const AppointmentBooking = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [visibleMonth, setVisibleMonth] = useState(PRESELECTED_DATE.getMonth());
  const [appointmentType, setAppointmentType] = useState(appointmentTypes[0]);
  const [mode, setMode] = useState(modeOptions[0]);
  const [duration, setDuration] = useState(durationOptions[1].value);
  const [location, setLocation] = useState(locationOptions[modeOptions[0]][0]);
  const [practiceArea, setPracticeArea] = useState(practiceAreas[0]);
  const [issueSummary, setIssueSummary] = useState('');
  const [conflictNames, setConflictNames] = useState('');
  const [ackFee, setAckFee] = useState(false);
  const [ackPrivacy, setAckPrivacy] = useState(false);
  const [language, setLanguage] = useState('');
  const [notes, setNotes] = useState('');
  const [uploads, setUploads] = useState([]);
  const [selectedDate, setSelectedDate] = useState(PRESELECTED_DATE);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [receipt, setReceipt] = useState(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const bookingPath = id ? `/client/lawyers/lawyer/${id}/book-appointment` : '/client/lawyers/book-appointment';
  const clientInfo = useMemo(() => {
    const stored = getStoredUser();
    return {
      name: stored?.full_name || stored?.fullName || stored?.name || stored?.email || 'Alicia Tan (Client)',
      email: stored?.email || 'alicia.tan@example.com',
      phone: stored?.phone || stored?.phone_number || stored?.mobile || '+60 12-345 6789',
    };
  }, []);

  useEffect(() => {
    setLocation(locationOptions[mode][0]);
    setSelectedSlot('');
  }, [mode]);

  useEffect(() => {
    // Keep visible month in sync with the selected date (useful when cancel/back changes selection).
    setVisibleMonth(selectedDate.getMonth());
  }, [selectedDate]);

  const handleUpload = (event) => {
    const files = Array.from(event.target.files || []);
    setUploads(files.map((file) => file.name));
  };

  const dayButtons = useMemo(() => {
    const daysInMonth = new Date(2025, visibleMonth + 1, 0).getDate();
    return Array.from({ length: daysInMonth }, (_, index) => index + 1);
  }, [visibleMonth]);

  const filteredSlots = useMemo(
    () =>
      timeSlots.map((slot) => {
        const [hours, minutes] = slot.split(':').map(Number);
        const slotValue = hours + minutes / 60;
        const exceedsWindow = slotValue > latestStartByDuration[duration];
        const isBooked = bookedSlots.includes(slot);
        return {
          value: slot,
          label: formatTime(slot),
          disabled: exceedsWindow || isBooked,
          reason: exceedsWindow ? 'Not enough time' : isBooked ? 'Booked' : '',
        };
      }),
    [duration]
  );

  const selectedDateLabel = `${selectedDate.getDate().toString().padStart(2, '0')}/${(selectedDate.getMonth() + 1)
    .toString()
    .padStart(2, '0')}/${selectedDate.getFullYear()}`;

  const profilePath = id ? `/client/lawyers/lawyer/${id}` : '/client/lawyers';

  const heroDateLabel = useMemo(
    () =>
      selectedDate.toLocaleDateString('en-GB', {
        weekday: 'short',
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }),
    [selectedDate]
  );

  const buildAppointmentPayload = () => {
    const startDateTime = new Date(selectedDate);
    if (selectedSlot) {
      const [h, m] = selectedSlot.split(':').map(Number);
      startDateTime.setHours(h, m, 0, 0);
    }
    return {
      status: 'Pending approval',
      referenceId: makeReference(),
      start: startDateTime.toISOString(),
      durationMinutes: duration,
      mode,
      appointmentType,
      location: splitLocation(location),
      meetingLink: mode === 'Video call' ? location : null,
      lawyer: { ...mockLawyer },
      client: { ...clientInfo },
      caseDetails: {
        practiceArea,
        preferredLanguage: language || 'No preference',
        conflictCheckNames: conflictNames || null,
        issueSummary: issueSummary || null,
        specialRequests: notes || null,
        uploads: uploads.length ? uploads.join(', ') : 'None',
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
    setReceipt({
      clientName: clientInfo.name,
      clientEmail: clientInfo.email,
      clientPhone: clientInfo.phone,
      lawyerName: mockLawyer.name,
      lawyerEmail: mockLawyer.email,
      lawyerPhone: mockLawyer.phone,
      appointmentType,
      mode,
      duration: durationOptions.find((opt) => opt.value === duration)?.label || `${duration} min`,
      location,
      practiceArea,
      issueSummary,
      conflictNames,
      language: language || 'No preference',
      notes: notes || '-',
      uploads,
      date: heroDateLabel,
      time: selectedSlot ? formatTime(selectedSlot) : 'Not provided',
    });
    setShowReceiptModal(true);
  };

  const handleFinalize = () => {
    saveLatestAppointment();
    setShowReceiptModal(false);
    navigate('/client/appointment');
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
          { label: 'Practice area', value: receipt.practiceArea },
          { label: 'Preferred language', value: receipt.language || 'Not provided' },
          { label: 'Conflict-check names', value: receipt.conflictNames || 'Not provided' },
          { label: 'Issue summary', value: receipt.issueSummary || 'Not provided' },
          { label: 'Special requests/notes', value: receipt.notes || 'Not provided' },
          {
            label: 'Uploads',
            value: receipt.uploads && receipt.uploads.length > 0 ? receipt.uploads.join(', ') : 'None',
          },
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
          <div className="date-pill">Preselected: 16/12/2025</div>
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
              <label htmlFor="location">Meeting location / link preference</label>
              <select
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
              >
                {locationOptions[mode].map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>

            <div className="field">
              <label htmlFor="practiceArea">Case category / practice area</label>
              <select
                id="practiceArea"
                value={practiceArea}
                onChange={(e) => setPracticeArea(e.target.value)}
                required
              >
                {practiceAreas.map((area) => (
                  <option key={area} value={area}>
                    {area}
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
                  <span className="label">Document upload</span>
                  <label className="dropzone" htmlFor="documents">
                    <input
                      id="documents"
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      multiple
                      onChange={handleUpload}
                    />
                    <div className="dropzone-inner">
                      <span className="upload-icon">⬆</span>
                      <div>
                        <div className="strong">Upload documents (optional)</div>
                        <div className="muted">PDF, JPG, PNG — multiple files allowed</div>
                      </div>
                    </div>
                  </label>
                  {uploads.length > 0 && (
                    <ul className="upload-list">
                      {uploads.map((file) => (
                        <li key={file}>{file}</li>
                      ))}
                    </ul>
                  )}
                </div>

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
              <div className="calendar" aria-label="Mock calendar for 2025">
                <div className="calendar-head">
                  <div className="month-label">
                    {monthNames[visibleMonth]} 2025
                  </div>
                  <div className="calendar-nav">
                    <button
                      type="button"
                      className="nav-btn"
                      onClick={() => setVisibleMonth((m) => Math.max(0, m - 1))}
                      disabled={visibleMonth === 0}
                      aria-label="Previous month"
                    >
                      ‹
                    </button>
                    <button
                      type="button"
                      className="nav-btn"
                      onClick={() => setVisibleMonth((m) => Math.min(11, m + 1))}
                      disabled={visibleMonth === 11}
                      aria-label="Next month"
                    >
                      ›
                    </button>
                  </div>
                </div>
                <div className="calendar-grid">
                  {dayButtons.map((day) => {
                    const isSelected =
                      day === selectedDate.getDate() &&
                      selectedDate.getMonth() === visibleMonth &&
                      selectedDate.getFullYear() === 2025;
                    return (
                      <button
                        type="button"
                        key={day}
                        className={`day ${isSelected ? 'day-selected' : ''}`}
                        onClick={() => setSelectedDate(new Date(2025, visibleMonth, day))}
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
                  <p className="muted">9:00 AM — 5:00 PM</p>
                </div>
                <div className="slots">
                  {filteredSlots.map((slot) => (
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
                  ))}
                </div>
                <p className="muted note">
                  Slots auto-adjust to duration. Booked slots are greyed out to show real availability.
                </p>
              </div>

              <div className="summary">
                <div className="summary-row">
                  <span>Date</span>
                  <strong>{selectedDateLabel}</strong>
                </div>
                <div className="summary-row">
                  <span>Time</span>
                  <strong>{selectedSlot ? formatTime(selectedSlot) : 'Select a time'}</strong>
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
                disabled={!selectedSlot || !ackFee || !ackPrivacy}
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
                      Confirm booking
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
