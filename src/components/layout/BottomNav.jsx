import { NavLink, useLocation } from 'react-router';
import { Home, Compass, BookOpen, Users, User } from 'lucide-react';
import './BottomNav.css';

const navItems = [
  { path: '/', icon: Home, label: 'Home' },
  { path: '/discover', icon: Compass, label: 'Discover' },
  { path: '/learn', icon: BookOpen, label: 'Learn' },
  { path: '/community', icon: Users, label: 'Community' },
  { path: '/profile', icon: User, label: 'Profile' },
];

export default function BottomNav() {
  const location = useLocation();

  return (
    <nav className="bottom-nav" aria-label="Main navigation">
      {navItems.map(({ path, icon: Icon, label }) => {
        const isActive = path === '/'
          ? location.pathname === '/'
          : location.pathname.startsWith(path);

        return (
          <NavLink
            key={path}
            to={path}
            className={`bottom-nav__item ${isActive ? 'bottom-nav__item--active' : ''}`}
            aria-label={label}
          >
            <div className="bottom-nav__icon-wrapper">
              <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
              {isActive && <div className="bottom-nav__indicator" />}
            </div>
            <span className="bottom-nav__label">{label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
}
