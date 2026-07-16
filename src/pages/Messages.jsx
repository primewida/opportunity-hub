import { useState } from 'react';
import { CONVERSATIONS } from '../data/mockData';
import { Avatar } from '../components/ui';
import { Send, ArrowLeft, Phone, MoreVertical } from 'lucide-react';
import { getRelativeTime } from '../utils/helpers';
import './Messages.css';

export default function Messages() {
  const [selectedConvo, setSelectedConvo] = useState(null);
  const [message, setMessage] = useState('');
  const convos = CONVERSATIONS || [];
  const active = convos.find(c => c.id === selectedConvo);

  return (
    <div className="messages">
      <div className={`messages__list ${selectedConvo ? 'messages__list--hidden' : ''}`}>
        <h2 className="messages__list-title">Messages</h2>
        {convos.map(c => (
          <div key={c.id} className={`messages__convo ${c.unread ? 'messages__convo--unread' : ''} ${selectedConvo === c.id ? 'messages__convo--active' : ''}`}
            onClick={() => setSelectedConvo(c.id)}>
            <Avatar name={c.name || c.participant?.name} size={44} />
            <div className="messages__convo-info">
              <div className="messages__convo-top">
                <span className="messages__convo-name">{c.name || c.participant?.name}</span>
                <span className="messages__convo-time">{getRelativeTime(c.lastMessageAt || c.lastMessage?.timestamp || '2026-06-28')}</span>
              </div>
              <p className="messages__convo-preview">{c.lastMessage?.text || c.lastMessagePreview || 'Start a conversation...'}</p>
            </div>
            {c.unread && <div className="messages__unread-dot" />}
          </div>
        ))}
      </div>

      <div className={`messages__chat ${selectedConvo ? 'messages__chat--visible' : ''}`}>
        {active ? (
          <>
            <div className="messages__chat-header">
              <button className="messages__back-btn" onClick={() => setSelectedConvo(null)}><ArrowLeft size={20} /></button>
              <Avatar name={active.name || active.participant?.name} size={36} />
              <div className="messages__chat-info">
                <span className="messages__chat-name">{active.name || active.participant?.name}</span>
                <span className="messages__chat-status">Online</span>
              </div>
              <button className="messages__header-action"><Phone size={18} /></button>
              <button className="messages__header-action"><MoreVertical size={18} /></button>
            </div>
            <div className="messages__chat-body">
              {(active.messages || []).map((msg, i) => (
                <div key={i} className={`messages__bubble ${msg.sender === 'you' || msg.fromMe ? 'messages__bubble--sent' : 'messages__bubble--received'}`}>
                  <p className="messages__bubble-text">{msg.text || msg.content}</p>
                  <span className="messages__bubble-time">{msg.time || '12:30 PM'}</span>
                </div>
              ))}
            </div>
            <div className="messages__input-bar">
              <input className="input messages__input" placeholder="Type a message..." value={message}
                onChange={e => setMessage(e.target.value)} onKeyDown={e => e.key === 'Enter' && setMessage('')} />
              <button className="messages__send-btn" disabled={!message.trim()}><Send size={20} /></button>
            </div>
          </>
        ) : (
          <div className="messages__empty">
            <span style={{ fontSize: 48 }}>💬</span>
            <h3>Select a conversation</h3>
            <p>Choose from your contacts to start chatting</p>
          </div>
        )}
      </div>
    </div>
  );
}
