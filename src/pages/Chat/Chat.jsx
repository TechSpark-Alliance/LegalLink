import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import NavBar from '../../components/NavBar/NavBar';
import './Chat.css';

const lawyerDirectory = {
  'krystal-jung': { name: 'Krystal Jung', specialty: 'Real Estate', location: 'Kuala Lumpur', status: 'Active now' },
  'amelia-cho': { name: 'Amelia Cho', specialty: 'Corporate', location: 'Singapore', status: 'Typically replies in a few hours' },
  'david-lau': { name: 'David Lau', specialty: 'Family Law', location: 'Penang', status: 'Typically replies in a day' },
};

const MAX_CLIENT_MESSAGES = 15;
const API_BASE = import.meta.env.VITE_APP_API || 'http://localhost:8000/api/v1';

export const ChatView = ({ activeId, embedded = false, directory = lawyerDirectory }) => {
  const navigate = useNavigate();
  const [remoteProfile, setRemoteProfile] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState(null);

  const lawyer =
    directory[activeId] ||
    remoteProfile || { name: 'Your Lawyer', specialty: 'Legal', status: 'Typically replies in a day' };
  const [conversationId, setConversationId] = useState(null);
  const [thread, setThread] = useState([]);
  const [input, setInput] = useState('');
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [lockedChats, setLockedChats] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const token =
    localStorage.getItem('token') ||
    sessionStorage.getItem('token') ||
    '';

  const sanitizeId = (val) => (val ? String(val).replace(/"/g, '') : '');
  const currentUserId = sanitizeId(
    localStorage.getItem('user_id') ||
      sessionStorage.getItem('user_id') ||
      localStorage.getItem('id') ||
      sessionStorage.getItem('id') ||
      ''
  );

  const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

  const buildImageUrl = (src) => {
    if (!src) return null;
    const val = String(src);
    if (val.startsWith('http')) return val;
    const root = API_BASE.replace(/\/api\/v1.*$/, '');
    return `${root}${val.startsWith('/') ? '' : '/'}${val}`;
  };

  useEffect(() => {
    const load = async () => {
      if (!activeId || !token) {
        setThread([]);
        return;
      }
      setLoading(true);
      setError('');
      try {
        const resConv = await fetch(`${API_BASE}/chat/conversations`, { headers: authHeaders });
        if (!resConv.ok) throw new Error('Failed to load conversations');
        const convs = await resConv.json();
        const found = convs.find((c) => Array.isArray(c.participants) && c.participants.includes(activeId));
        const convId = found ? found.id : null;
        setConversationId(convId);

        if (convId) {
          const resMsgs = await fetch(`${API_BASE}/chat/conversations/${convId}/messages`, { headers: authHeaders });
          if (!resMsgs.ok) throw new Error('Failed to load messages');
          const msgs = await resMsgs.json();
          setThread(msgs);
        } else {
          setThread([]);
        }
      } catch (err) {
        setError(err.message || 'Failed to load chat');
        setThread([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId]);

  useEffect(() => {
    const fetchProfile = async () => {
      if (directory[activeId]) {
        setRemoteProfile(null);
        setAvatarUrl(directory[activeId].image || null);
        return;
      }
      if (!activeId) return;
      try {
        const res = await fetch(`${API_BASE}/lawyers/${activeId}`, { headers: authHeaders });
        if (!res.ok) return;
        const data = await res.json();
        const profile = data.lawyer || data.profile || data.user || data;
        if (profile) {
          const img = buildImageUrl(profile.profile_image || profile.avatar || profile.image);
          setRemoteProfile({
            name: profile.full_name || profile.name || 'Your Lawyer',
            status: 'Active now',
            image: img,
          });
          setAvatarUrl(img || null);
        }
      } catch {
        /* ignore */
      }
    };
    fetchProfile();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId]);

  const clientCount = thread.filter((msg) => String(msg.sender_id || '') !== String(activeId)).length;
  const isKrystal = activeId === 'krystal-jung';
  const limitReached = lockedChats[activeId] === true;

  const handleSend = async () => {
    if (!input.trim()) return;
    const threshold = isKrystal ? MAX_CLIENT_MESSAGES - 1 : MAX_CLIENT_MESSAGES;
    if (clientCount >= threshold || limitReached) {
      setShowLimitModal(true);
      setLockedChats((prev) => ({ ...prev, [activeId]: true }));
      return;
    }
    const body = {
      text: input.trim(),
      ...(conversationId ? { conversation_id: conversationId } : { to_user_id: activeId }),
    };
    try {
      setError('');
      const res = await fetch(`${API_BASE}/chat/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders,
        },
        body: JSON.stringify(body),
      });
      if (res.status === 403) {
        setShowLimitModal(true);
        setLockedChats((prev) => ({ ...prev, [activeId]: true }));
        return;
      }
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || 'Failed to send message');
      }
      const msg = await res.json();
      if (!conversationId && msg.conversation_id) {
        setConversationId(msg.conversation_id);
      }
      setThread((prev) => [...prev, msg]);
    } catch (err) {
      setError(err.message || 'Failed to send message');
    }
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

  const formatTimestamp = (value) => {
    if (!value) return 'Now';
    const raw = String(value).trim();
    const match = raw.match(
      /^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2})(\.\d{1,6})?/
    );
    const normalized = match
      ? `${match[1]}${match[2] ? match[2].slice(0, 4) : ''}Z`
      : `${raw}${raw.endsWith('Z') ? '' : 'Z'}`;
    const date = new Date(normalized);
    if (Number.isNaN(date.getTime())) return raw;
    return date.toLocaleString('en-MY', {
      timeZone: 'Asia/Kuala_Lumpur',
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
      timeZoneName: 'short',
    });
  };

  return (
    <main className={`chat-shell ${embedded ? 'chat-shell-embedded' : ''}`}>
      <header className="chat-header">
        <div className="chat-meta">
          <span className="chat-avatar">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={lawyer.name}
                onError={() => setAvatarUrl(null)}
              />
            ) : (
              (lawyer.name || 'Your Lawyer').slice(0, 2)
            )}
          </span>
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
        {loading ? (
          <div className="thread-empty">Loading messages…</div>
        ) : thread.length === 0 ? (
          <div className="thread-empty">No messages yet.</div>
        ) : (
          thread.map((msg) => {
            const sender = String(msg.sender_id || '').replace(/"/g, '');
            const isSelf = currentUserId
              ? sender === currentUserId
              : sender !== String(activeId || '');
            const bubbleClass = isSelf ? 'bubble bubble-self' : 'bubble bubble-other';
            const createdAt = formatTimestamp(msg.created_at);
            return (
              <div key={msg.id} className={bubbleClass}>
                <p>{msg.text}</p>
                <span className="bubble-time">{createdAt}</span>
              </div>
            );
          })
        )}
        {error && <div className="thread-empty">{error}</div>}
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
