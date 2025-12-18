import React, { useMemo, useState } from 'react';
import LawyerLayout from '../../components/LawyerLayout';
import './Conversations.css';
import '../Chat/Chat.css';

const clients = [
  {
    id: 'alicia-tan',
    name: 'Alicia Tan',
    title: 'Family Law - Kuala Lumpur',
    lastMessage: 'Thank you, I have shared the documents.',
    time: '3:18 PM',
    online: true,
  },
  {
    id: 'mohd-hakim',
    name: 'Mohd Hakim',
    title: 'Corporate - Selangor',
    lastMessage: 'Can we move the meeting to Friday?',
    time: 'Yesterday',
  },
  {
    id: 'serene-ong',
    name: 'Serene Ong',
    title: 'Property - Penang',
    lastMessage: 'I just uploaded the updated contract.',
    time: 'Mon',
  },
];

const threads = {
  'alicia-tan': [
    { id: 'c1', from: 'client', text: 'I just submitted the supporting docs.', time: '2:42 PM' },
    { id: 'l1', from: 'lawyer', text: 'Got it. I will review tonight and update you.', time: '2:48 PM' },
    { id: 'c2', from: 'client', text: 'Thank you, I appreciate it.', time: '3:01 PM' },
  ],
  'mohd-hakim': [
    { id: 'c1', from: 'client', text: 'Can we move the meeting to Friday?', time: 'Yesterday' },
    { id: 'l1', from: 'lawyer', text: 'Yes, Friday works. I will send a new invite.', time: 'Yesterday' },
  ],
  'serene-ong': [
    { id: 'c1', from: 'client', text: 'I just uploaded the updated contract.', time: 'Mon' },
    { id: 'l1', from: 'lawyer', text: 'Received. I will draft revisions today.', time: 'Mon' },
  ],
};

const LawyerConversations = () => {
  const [activeId, setActiveId] = useState(null);
  const activeClient = useMemo(
    () => clients.find((client) => client.id === activeId) || null,
    [activeId]
  );
  const thread = activeId ? threads[activeId] || [] : [];

  return (
    <LawyerLayout activeKey="conversations" bodyClassName="conversations-page">
      <div className="conversations-shell">
        <aside className="conversation-list">
          <div className="list-head">
            <h2>Conversations</h2>
            <span className="list-pill">{clients.length} clients</span>
          </div>
          <div className="list-scroll" role="list">
            {clients.map((client) => (
              <button
                key={client.id}
                type="button"
                className={`conversation-row ${activeId === client.id ? 'is-active' : ''}`}
                onClick={() => setActiveId(client.id)}
              >
                <span className="avatar">{client.name.slice(0, 2)}</span>
                <div className="row-body">
                  <div className="row-top">
                    <span className="name">{client.name}</span>
                    <span className="time">{client.time}</span>
                  </div>
                  <div className="row-bottom">
                    <span className="title">{client.title}</span>
                    <span className="last">{client.lastMessage}</span>
                  </div>
                </div>
                {client.online && <span className="status-dot" aria-label="Active" />}
              </button>
            ))}
          </div>
        </aside>

        <section className="conversation-pane">
          {activeClient ? (
            <div className="chat-shell chat-shell-embedded">
              <header className="chat-header">
                <div className="chat-meta">
                  <span className="chat-avatar">{activeClient.name.slice(0, 2)}</span>
                  <div>
                    <div className="chat-name">{activeClient.name}</div>
                    <div className="chat-status">
                      <span className={`status-dot ${activeClient.online ? 'online' : ''}`} aria-hidden="true" />
                      <span>{activeClient.online ? 'Active now' : 'Away'}</span>
                    </div>
                  </div>
                </div>
              </header>

              <section className="chat-thread" aria-live="polite">
                {thread.length === 0 ? (
                  <div className="thread-empty">No messages yet.</div>
                ) : (
                  thread.map((msg) => (
                    <div
                      key={msg.id}
                      className={`bubble ${msg.from === 'lawyer' ? 'bubble-lawyer' : 'bubble-client'}`}
                    >
                      <p>{msg.text}</p>
                      <span className="bubble-time">{msg.time}</span>
                    </div>
                  ))
                )}
              </section>

              <footer className="chat-composer">
                <div className="composer-shell">
                  <textarea rows="1" placeholder="Write a message..." />
                  <button type="button" className="send-btn">
                    Send
                  </button>
                </div>
              </footer>
            </div>
          ) : (
            <section className="empty-state">
              <div className="empty-icon" aria-hidden="true">
                <span>Chat</span>
              </div>
              <div className="empty-copy">
                <h1>Client messages</h1>
                <p>Select a client to view the conversation</p>
              </div>
              <button
                type="button"
                className="primary-btn"
                onClick={() => setActiveId(clients[0]?.id || null)}
              >
                Open latest
              </button>
            </section>
          )}
        </section>
      </div>
    </LawyerLayout>
  );
};

export default LawyerConversations;
