import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import NavBar from '../../components/NavBar/NavBar';
import { ChatView } from '../Chat/Chat';
import './Conversations.css';

const contacts = [
  {
    id: 'krystal-jung',
    name: 'Krystal Jung',
    title: 'Real Estate • Kuala Lumpur',
    lastMessage: 'I’ll review your documents tonight and send an update.',
    time: '2:48 PM',
    online: true,
  },
  {
    id: 'amelia-cho',
    name: 'Amelia Cho',
    title: 'Corporate • Singapore',
    lastMessage: 'Ready when you are.',
    time: 'Yesterday',
  },
  {
    id: 'david-lau',
    name: 'David Lau',
    title: 'Family Law • Penang',
    lastMessage: 'Let’s confirm the timeline.',
    time: 'Mon',
  },
];

const Conversations = () => {
  const navigate = useNavigate();
  const params = useParams();
  const activeId = params.lawyerId || params.chatId || null;

  const handleOpenChat = (contactId) => {
    navigate(`/conversation/chat/${contactId}/lawyer/${contactId}`);
  };

  return (
    <div className="conversations-page">
      <NavBar forceActive="/conversations" />
      <main className="conversations-shell">
        <aside className="conversation-list">
          <div className="list-head">
            <h2>Conversations</h2>
            <span className="list-pill">3 lawyers</span>
          </div>
          <div className="list-scroll" role="list">
            {contacts.map((contact) => (
              <button
                key={contact.id}
                type="button"
                className={`conversation-row ${activeId === contact.id ? 'is-active' : ''}`}
                onClick={() => handleOpenChat(contact.id)}
              >
                <span className="avatar">{contact.name.slice(0, 2)}</span>
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
                {contact.online && <span className="status-dot" aria-label="Active" />}
              </button>
            ))}
          </div>
        </aside>

        <section className="conversation-pane">
          {activeId ? (
            <ChatView activeId={activeId} embedded />
          ) : (
            <section className="empty-state">
              <div className="empty-icon" aria-hidden="true">
                <span>✶</span>
              </div>
              <div className="empty-copy">
                <h1>Your messages</h1>
                <p>Send a message to start a chat</p>
              </div>
              <button
                type="button"
                className="primary-btn"
                onClick={() => handleOpenChat('krystal-jung')}
              >
                Send message
              </button>
            </section>
          )}
        </section>
      </main>
    </div>
  );
};

export default Conversations;
