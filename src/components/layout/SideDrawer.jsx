import { NavLink, useLocation } from 'react-router';
import {
  Home, Compass, BookOpen, Users, Briefcase,
  ClipboardList, MessageSquare, Settings,
  ChevronLeft, ChevronRight, X, Flame, GraduationCap
} from 'lucide-react';
import './SideDrawer.css';

const menuItems = [
  { path: '/', icon: Home, label: 'Home' },
  { path: '/discover', icon: Compass, label: 'Discover' },
  { path: '/learn', icon: BookOpen, label: 'Learn' },
  { path: '/community', icon: Users, label: 'Community' },
  { path: '/jobs', icon: Briefcase, label: 'Jobs' },
  { path: '/applications', icon: ClipboardList, label: 'Applications' },
  { path: '/messages', icon: MessageSquare, label: 'Messages' },
  { path: '/settings', icon: Settings, label: 'Settings' },
];

export default function SideDrawer({ collapsed, onToggle, mobileOpen, onMobileClose }) {
  const location = useLocation();

  const renderNavItems = () => (
    <ul className="side-drawer__menu">
      {menuItems.map(({ path, icon: Icon, label }) => {
        const isActive = path === '/'
          ? location.pathname === '/'
          : location.pathname.startsWith(path);

        return (
          <li key={path}>
            <NavLink
              to={path}
              className={`side-drawer__item ${isActive ? 'side-drawer__item--active' : ''}`}
              onClick={onMobileClose}
              title={collapsed ? label : undefined}
            >
              <Icon size={20} />
              {!collapsed && <span className="side-drawer__label">{label}</span>}
              {isActive && <div className="side-drawer__active-bg" />}
            </NavLink>
          </li>
        );
      })}
    </ul>
  );

  return (
    <>
      {/* Desktop Side Drawer */}
      <aside className={`side-drawer ${collapsed ? 'side-drawer--collapsed' : ''}`}>
        <div className="side-drawer__header">
          {!collapsed && (
            <div className="side-drawer__brand">
              <div className="side-drawer__logo">
                <GraduationCap size={24} />
              </div>
              <span className="side-drawer__brand-text">OpportunityHub</span>
            </div>
          )}
          <button className="side-drawer__toggle" onClick={onToggle} aria-label="Toggle sidebar">
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>
        {renderNavItems()}
      </aside>

      {/* Mobile Overlay Drawer */}
      {mobileOpen && (
        <div className="side-drawer__overlay" onClick={onMobileClose}>
          <aside className="side-drawer side-drawer--mobile" onClick={e => e.stopPropagation()}>
            <div className="side-drawer__header">
              <div className="side-drawer__brand">
                <div className="side-drawer__logo">
                  <GraduationCap size={24} />
                </div>
                <span className="side-drawer__brand-text">OpportunityHub</span>
              </div>
              <button className="side-drawer__toggle" onClick={onMobileClose} aria-label="Close menu">
                <X size={18} />
              </button>
            </div>
            {renderNavItems()}
          </aside>
        </div>
      )}
    </>
  );
}
