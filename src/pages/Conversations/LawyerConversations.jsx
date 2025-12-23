import React, { useEffect, useMemo, useState } from 'react';
import LawyerLayout from '../../components/LawyerLayout';
import { ChatView } from '../Chat/Chat';
import './Conversations.css';
import '../Chat/Chat.css';

const API_BASE = import.meta.env.VITE_APP_API || 'http://localhost:8000/api/v1';

const sanitizeId = (val) => (val ? String(val).replace(/"/g, '') : '');

const formatTime = (val) => {
  if (!val) return '';
  const d = new Date(val);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const LawyerConversations = () => {
  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentUserId, setCurrentUserId] = useState(
    sanitizeId(
      localStorage.getItem('user_id') ||
        sessionStorage.getItem('user_id') ||
        localStorage.getItem('id') ||
        sessionStorage.getItem('id') ||
        ''
    )
  );

  const token =
    localStorage.getItem('token') ||
    sessionStorage.getItem('token') ||
    '';

  const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

  const buildImageUrl = (img) => {
    if (!img) return null;
    const val = String(img);
    if (val.startsWith('http')) return val;
    const root = API_BASE.replace(/\/api\/v1.*$/, '');
    return `${root}${val.startsWith('/') ? '' : '/'}${val}`;
  };

  const fetchUserProfile = async (userId) => {
    try {
      const res = await fetch(`${API_BASE}/auth/user/${userId}`, { headers: authHeaders });
      if (!res.ok) throw new Error();
      const data = await res.json();
      const user = data.user || data;
      const expertise = Array.isArray(user.expertise) ? user.expertise : [];
      return {
        name: user.full_name || user.name || 'User',
        title: expertise[0] || '',
        image: buildImageUrl(user.profile_image || user.avatar || user.image),
      };
    } catch {
      return {
        name: 'Conversation',
        title: '',
        image: null,
      };
    }
  };

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        let uid = currentUserId;
        if (!uid && token) {
          const resMe = await fetch(`${API_BASE}/auth/user/me`, { headers: authHeaders });
          if (resMe.ok) {
            const data = await resMe.json();
            uid = sanitizeId(data?.user?.id);
            if (uid && isMounted) setCurrentUserId(uid);
          }
        }
        const res = await fetch(`${API_BASE}/chat/conversations`, { headers: authHeaders });
        if (!res.ok) throw new Error('Failed to load conversations');
        const convs = await res.json();
        const hydrated = await Promise.all(
          (convs || []).map(async (conv) => {
            const participants = (conv.participants || []).map(sanitizeId).filter(Boolean);
            let otherId = participants.find((p) => p && p !== uid);
            if (!otherId && participants.length > 1) otherId = participants[1];
            if (!otherId && participants.length > 0) otherId = participants[0];
            const profile = await fetchUserProfile(otherId);
            return {
              id: sanitizeId(otherId),
              name: profile.name,
              title: profile.title,
              lastMessage: conv.last_message || '',
              time: formatTime(conv.last_message_at),
              avatar: profile.image,
            };
          })
        );
        if (isMounted) {
          setConversations(hydrated);
          if (!activeId && hydrated.length > 0) {
            setActiveId(hydrated[0].id);
          }
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Failed to load conversations');
          setConversations([]);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    load();
    return () => {
      isMounted = false;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const directory = useMemo(() => {
    return conversations.reduce((acc, item) => {
      acc[item.id] = {
        name: item.name,
        status: 'Active now',
        image: item.avatar,
      };
      return acc;
    }, {});
  }, [conversations]);

  return (
    <LawyerLayout activeKey="conversations" bodyClassName="conversations-page">
      <main className="conversations-shell">
        <aside className="conversation-list">
          <div className="list-head">
            <h2>Conversations</h2>
            <span className="list-pill">
              {loading ? '...' : `${conversations.length || 0} clients`}
            </span>
          </div>
          <div className="list-scroll" role="list">
            {error && <div className="empty-row">{error}</div>}
            {!error && conversations.length === 0 && !loading && (
              <div className="empty-row">No conversations yet.</div>
            )}
            {conversations.map((contact) => (
              <button
                key={contact.id}
                type="button"
                className={`conversation-row ${activeId === contact.id ? 'is-active' : ''}`}
                onClick={() => setActiveId(contact.id)}
              >
                <span className="avatar">
                  {contact.avatar ? (
                    <img src={contact.avatar} alt={contact.name} />
                  ) : (
                    contact.name.slice(0, 2)
                  )}
                </span>
                <div className="row-body">
                  <div className="row-top">
                    <span className="name">{contact.name}</span>
                    <span className="time">{contact.time}</span>
                  </div>
                  <div className="row-bottom">
                    <span className="title">{contact.title}</span>
                    <span className="last">{contact.lastMessage}</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </aside>

        <section className="conversation-pane">
          {activeId ? (
            <ChatView activeId={activeId} embedded directory={directory} />
          ) : (
            <section className="empty-state">
              <div className="empty-icon" aria-hidden="true">
                <span>💬</span>
              </div>
              <div className="empty-copy">
                <h1>Your messages</h1>
                <p>Select a client to start chatting</p>
              </div>
            </section>
          )}
        </section>
      </main>
    </LawyerLayout>
  );
};

export default LawyerConversations;
