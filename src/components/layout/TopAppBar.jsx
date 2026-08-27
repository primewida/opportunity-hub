import { useNavigate, useLocation } from 'react-router';
import { Search, Bell, Flame, Menu } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import './TopAppBar.css';

export default function TopAppBar({ title, onMenuClick }) {
  const navigate = useNavigate();
  const app = useApp();
  const unreadCount = (app.notifications || []).filter(n => !n.isRead && !n.read).length;

  return (
    <header className="top-bar">
      <div className="top-bar__left">
        <button className="top-bar__menu-btn hide-desktop" onClick={onMenuClick} aria-label="Open menu">
          <Menu size={22} />
        </button>
        <h1 className="top-bar__title">{title}</h1>
      </div>

      <div className="top-bar__right">
        <button
          className="top-bar__action"
          onClick={() => navigate('/discover')}
          aria-label="Search"
        >
          <Search size={20} />
        </button>

        <button
          className="top-bar__action top-bar__streak"
          onClick={() => navigate('/streak')}
          aria-label={`Current streak: ${app.streakData?.currentStreakCount ?? app.streakData?.currentStreak ?? app.user?.streakCount ?? 0} days`}
        >
          <Flame size={20} className="streak-flame" />
          <span className="top-bar__streak-count">{app.streakData?.currentStreakCount ?? app.streakData?.currentStreak ?? app.user?.streakCount ?? 0}</span>
        </button>

        <button
          className="top-bar__action"
          onClick={() => navigate('/notifications')}
          aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`}
        >
          <Bell size={20} />
          {unreadCount > 0 && (
            <span className="top-bar__badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
          )}
        </button>
      </div>
    </header>
  );
}
