import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import NavBar from '../../components/NavBar/NavBar';
import './Chat.css';

const lawyerDirectory = {
  'krystal-jung': { name: 'Krystal Jung', specialty: 'Real Estate', location: 'Kuala Lumpur', status: 'Active now' },
  'amelia-cho': { name: 'Amelia Cho', specialty: 'Corporate', location: 'Singapore', status: 'Typically replies in a few hours' },
  'david-lau': { name: 'David Lau', specialty: 'Family Law', location: 'Penang', status: 'Typically replies in a day' },
};

const baseThreads = {
  'krystal-jung': [
    { id: 'm1', from: 'lawyer', text: "Hi, I reviewed your documents. Let's finalize the purchase agreement.", time: '1:02 PM' },
    { id: 'c1', from: 'client', text: 'Thank you. I want to make sure the penalty clause is fair.', time: '1:04 PM' },
    { id: 'm2', from: 'lawyer', text: "Understood. I'll highlight the risks and propose safer wording.", time: '1:06 PM' },
    { id: 'c2', from: 'client', text: 'There is also an addendum with new conditions.', time: '1:08 PM' },
    { id: 'm3', from: 'lawyer', text: 'Please share that. I will merge it into the review.', time: '1:10 PM' },
    { id: 'c3', from: 'client', text: 'Uploading now.', time: '1:12 PM' },
    { id: 'c4', from: 'client', text: 'Let me know if you can soften the penalty language.', time: '1:14 PM' },
    { id: 'm4', from: 'lawyer', text: 'Yes. I can add a cure period and cap the exposure.', time: '1:16 PM' },
    { id: 'c5', from: 'client', text: 'Great, a cure period sounds right.', time: '1:18 PM' },
    { id: 'c6', from: 'client', text: 'Please also check assignment terms.', time: '1:20 PM' },
    { id: 'm5', from: 'lawyer', text: 'Will do. I will ensure any assignment needs your written consent.', time: '1:22 PM' },
    { id: 'c7', from: 'client', text: 'Perfect. Timeline looks tight; any risk there?', time: '1:24 PM' },
    { id: 'c8', from: 'client', text: 'They asked for completion within 30 days.', time: '1:25 PM' },
    { id: 'm6', from: 'lawyer', text: 'We can add milestone-based extensions if delays are out of your control.', time: '1:27 PM' },
    { id: 'c9', from: 'client', text: 'Please draft that.', time: '1:29 PM' },
    { id: 'c10', from: 'client', text: 'Is there anything else I should flag?', time: '1:31 PM' },
    { id: 'm7', from: 'lawyer', text: "I'll also check indemnities and limitation of liability.", time: '1:33 PM' },
    { id: 'c11', from: 'client', text: 'Thanks. I want a clear liability cap.', time: '1:35 PM' },
    { id: 'c12', from: 'client', text: 'And mutual confidentiality.', time: '1:36 PM' },
    { id: 'm8', from: 'lawyer', text: 'Noted. I will insert mutual confidentiality language.', time: '1:38 PM' },
    { id: 'c13', from: 'client', text: 'Appreciate the quick turnaround.', time: '1:40 PM' },
    { id: 'c14', from: 'client', text: 'Let me know when the revised draft is ready.', time: '1:42 PM' },
  ],
};

const MAX_CLIENT_MESSAGES = 15;

export const ChatView = ({ activeId, embedded = false }) => {
  const navigate = useNavigate();
  const lawyer = lawyerDirectory[activeId] || { name: 'Your Lawyer', specialty: 'Legal', status: 'Typically replies in a day' };

  const [threads, setThreads] = useState(() => ({
    ...baseThreads,
  }));
  const [input, setInput] = useState('');
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [lockedChats, setLockedChats] = useState({});

  useEffect(() => {
    setThreads((prev) => {
      if (prev[activeId]) return prev;
      return { ...prev, [activeId]: [] };
    });
  }, [activeId]);

  const thread = threads[activeId] || [];
  const clientCount = thread.filter((msg) => msg.from === 'client').length;
  const isKrystal = activeId === 'krystal-jung';
  const limitReached = lockedChats[activeId] === true;

  const handleSend = () => {
    if (!input.trim()) return;
    const threshold = isKrystal ? MAX_CLIENT_MESSAGES - 1 : MAX_CLIENT_MESSAGES;
    if (clientCount >= threshold || limitReached) {
      setShowLimitModal(true);
      setLockedChats((prev) => ({ ...prev, [activeId]: true }));
      return;
    }
    const newMessage = {
      id: `c-${Date.now()}`,
      from: 'client',
      text: input.trim(),
      time: 'Now',
    };
    setThreads((prev) => ({
      ...prev,
      [activeId]: [...(prev[activeId] || []), newMessage],
    }));
    setInput('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const goToAppointment = () => {
    navigate(`/client/lawyers/lawyer/${activeId}/book-appointment`);
  };

  return (
    <main className={`chat-shell ${embedded ? 'chat-shell-embedded' : ''}`}>
      <header className="chat-header">
        <div className="chat-meta">
          <span className="chat-avatar">{lawyer.name.slice(0, 2)}</span>
          <div>
            <div className="chat-name">{lawyer.name}</div>
            <div className="chat-status">
              <span className={`status-dot ${lawyer.status === 'Active now' ? 'online' : ''}`} aria-hidden="true" />
              <span>{lawyer.status}</span>
            </div>
          </div>
        </div>
        <div className="chat-actions">
          <button type="button" className="icon-btn" aria-label="Info">
            i
          </button>
          <button type="button" className="icon-btn" aria-label="More options">
            ...
          </button>
        </div>
      </header>

      <section className="chat-thread" aria-live="polite">
        {thread.length === 0 && !isKrystal ? (
          <div className="thread-empty">No messages yet.</div>
        ) : (
          thread.map((msg) => (
            <div
              key={msg.id}
              className={`bubble ${msg.from === 'client' ? 'bubble-client' : 'bubble-lawyer'}`}
            >
              <p>{msg.text}</p>
              <span className="bubble-time">{msg.time}</span>
            </div>
          ))
        )}
      </section>

      <footer className="chat-composer">
        <div className={`composer-shell ${limitReached ? 'composer-disabled' : ''}`}>
          <textarea
            rows="1"
            placeholder="Write a message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            disabled={limitReached}
          />
          <button
            type="button"
            className="send-btn"
            onClick={handleSend}
            disabled={limitReached}
          >
            Send
          </button>
        </div>
        {limitReached && (
          <p className="limit-hint">
            You&apos;ve reached the 15 free message limit. Book an appointment to continue.
          </p>
        )}
      </footer>

      {showLimitModal && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal-card">
            <h3>Message limit reached</h3>
            <p>
              You&apos;ve reached the limit of 15 free messages for this lawyer. To continue chatting, please
              book an appointment first.
            </p>
            <div className="modal-actions">
              <button type="button" className="primary-btn" onClick={goToAppointment}>
                Book appointment
              </button>
              <button type="button" className="ghost-btn" onClick={() => setShowLimitModal(false)}>
                Not now
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

const Chat = () => {
  const { chatId, lawyerId } = useParams();
  const activeId = useMemo(() => lawyerId || chatId, [chatId, lawyerId]);

  return (
    <div className="chat-page">
      <NavBar forceActive="/client/conversations" />
      <ChatView activeId={activeId} />
    </div>
  );
};

export default Chat;
