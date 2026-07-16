import { useState } from 'react';
import { useNavigate } from 'react-router';
import { NOTIFICATIONS } from '../data/mockData';
import { Card, Button, FilterChips } from '../components/ui';
import { getRelativeTime } from '../utils/helpers';
import { Bell, Bookmark, Award, Calendar, MessageSquare, TrendingUp, CheckCheck } from 'lucide-react';
import './Notifications.css';

const iconMap = { deadline: Calendar, match: TrendingUp, message: MessageSquare, saved: Bookmark, achievement: Award, general: Bell };

export default function Notifications() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('All');
  const filters = ['All', 'Unread', 'Deadlines', 'Matches', 'Messages'];
  const notifs = (NOTIFICATIONS || []).filter(n => {
    if (filter === 'Unread') return !n.isRead && !n.read;
    if (filter === 'Deadlines') return n.type === 'deadline';
    if (filter === 'Matches') return n.type === 'match';
    if (filter === 'Messages') return n.type === 'message';
    return true;
  });

  return (
    <div className="notifs">
      <div className="notifs__header">
        <div className="notifs__header-row">
          <h1 className="notifs__title">🔔 Notifications</h1>
          <Button variant="ghost" size="sm" icon={CheckCheck}>Mark all read</Button>
        </div>
      </div>
      <FilterChips options={filters} selected={filter} onChange={setFilter} />
      <div className="notifs__list">
        {notifs.length === 0 ? (
          <div className="notifs__empty"><Bell size={40} style={{ color: 'var(--text-secondary)', opacity: 0.4 }} /><p>No notifications yet</p></div>
        ) : notifs.map(n => {
          const Icon = iconMap[n.type] || Bell;
          return (
            <div key={n.id} className={`notifs__item ${!n.isRead && !n.read ? 'notifs__item--unread' : ''}`}>
              <div className={`notifs__icon notifs__icon--${n.type || 'general'}`}><Icon size={18} /></div>
              <div className="notifs__content">
                <p className="notifs__text">{n.message || n.title}</p>
                <span className="notifs__time">{getRelativeTime(n.createdAt || n.timestamp || '2026-07-01')}</span>
              </div>
              {(!n.isRead && !n.read) && <div className="notifs__dot" />}
            </div>
          );
        })}
      </div>
    </div>
  );
}
