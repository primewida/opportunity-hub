import { useState } from 'react';
import { Outlet, useLocation } from 'react-router';
import TopAppBar from './TopAppBar';
import BottomNav from './BottomNav';
import SideDrawer from './SideDrawer';
import './Layout.css';

export default function Layout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const getPageTitle = () => {
    const path = location.pathname;
    const titles = {
      '/': 'Home',
      '/discover': 'Discover',
      '/learn': 'Learn',
      '/community': 'Community',
      '/profile': 'Profile',
      '/jobs': 'Jobs',
      '/applications': 'Applications',
      '/messages': 'Messages',
      '/settings': 'Settings',
      '/notifications': 'Notifications',
      '/saved': 'Saved',
      '/streak': 'Streak',
      '/leaderboard': 'Leaderboard',
      '/mentors': 'Mentors',
      '/documents': 'Document Vault',
      '/help': 'Help & Support',
      '/cv-builder': 'CV Builder',
      '/cover-letter': 'Cover Letter',
      '/interview-prep': 'Interview Prep',
      '/test-prep': 'Test Prep',
      '/reviews': 'Reviews',
      '/courses': 'Courses',
      '/skill-gap': 'Skill Analysis',
    };
    return titles[path] || 'OpportunityHub';
  };

  return (
    <div className={`layout ${sidebarCollapsed ? 'layout--collapsed' : ''}`}>
      <SideDrawer
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        mobileOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)}
      />
      <div className="layout__main">
        <TopAppBar
          title={getPageTitle()}
          onMenuClick={() => setMobileMenuOpen(true)}
        />
        <main className="layout__content">
          <Outlet />
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
