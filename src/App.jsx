import { BrowserRouter, Routes, Route } from 'react-router';
import { ThemeProvider } from './context/ThemeContext';
import { AppProvider } from './context/AppContext';
import Layout from './components/layout/Layout';

/* ── Phase 1 Screens ── */
import SplashScreen from './pages/SplashScreen';
import Onboarding from './pages/Onboarding';
import Auth from './pages/Auth';
import ProfileSetup from './pages/ProfileSetup';
import Dashboard from './pages/Dashboard';
import BrowseOpportunities from './pages/BrowseOpportunities';
import OpportunityDetail from './pages/OpportunityDetail';

/* ── Phase 2 Screens ── */
import LearningRoadmaps from './pages/LearningRoadmaps';
import RoadmapDetail from './pages/RoadmapDetail';
import SkillGapAnalysis from './pages/SkillGapAnalysis';
import CourseRecommendations from './pages/CourseRecommendations';
import CVBuilder from './pages/CVBuilder';
import CoverLetterBuilder from './pages/CoverLetterBuilder';
import InterviewPrep from './pages/InterviewPrep';
import TestPrep from './pages/TestPrep';
import ReviewSystem from './pages/ReviewSystem';
import CommunityHub from './pages/CommunityHub';

/* ── Placeholder pages for Phase 3 navigation ── */
function PlaceholderPage({ title, emoji, desc }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', textAlign: 'center', gap: 'var(--space-md)', padding: 'var(--space-xl)' }}>
      <span style={{ fontSize: 56 }}>{emoji}</span>
      <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', margin: 0, color: 'var(--text-primary)' }}>{title}</h1>
      <p style={{ color: 'var(--text-secondary)', maxWidth: 400, margin: 0 }}>{desc}</p>
      <span className="badge badge-primary" style={{ fontFamily: 'var(--font-accent)' }}>Coming in Phase 3</span>
    </div>
  );
}

const Profile = () => <PlaceholderPage title="Your Profile" emoji="👤" desc="View and edit your profile, manage settings, and customize your experience." />;
const Jobs = () => <PlaceholderPage title="Job Board" emoji="💼" desc="Find jobs, internships, and NYSC placements from top Nigerian companies." />;
const Applications = () => <PlaceholderPage title="Application Tracker" emoji="📋" desc="Track your scholarship and job applications with a Kanban-style board." />;
const Messages = () => <PlaceholderPage title="Messages" emoji="💬" desc="Chat with mentors, peers, and community members." />;
const Settings = () => <PlaceholderPage title="Settings" emoji="⚙️" desc="Manage your account, notifications, theme, and privacy preferences." />;
const Streak = () => <PlaceholderPage title="Streak Dashboard" emoji="🔥" desc="Track your self-paced learning streaks and celebrate your consistency." />;
const Notifications = () => <PlaceholderPage title="Notifications" emoji="🔔" desc="Stay updated on deadlines, new matches, reviews, and messages." />;
const Saved = () => <PlaceholderPage title="Saved Opportunities" emoji="🔖" desc="Your bookmarked scholarships, jobs, and opportunities sorted by deadline." />;
const Leaderboard = () => <PlaceholderPage title="Leaderboard" emoji="🏆" desc="See how your consistency compares with peers across Nigerian universities." />;
const Mentors = () => <PlaceholderPage title="Mentor Directory" emoji="🧑‍🏫" desc="Connect with scholarship alumni and industry professionals for guidance." />;
const Documents = () => <PlaceholderPage title="Document Vault" emoji="📂" desc="Securely store your certificates, transcripts, and IDs for quick access." />;
const Help = () => <PlaceholderPage title="Help & Support" emoji="❓" desc="Find answers to common questions and get in touch with our support team." />;

export default function App() {
  return (
    <ThemeProvider>
      <AppProvider>
        <BrowserRouter>
          <Routes>
            {/* Auth flow (no layout shell) */}
            <Route path="/splash" element={<SplashScreen />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/profile-setup" element={<ProfileSetup />} />

            {/* Main app (with layout shell) */}
            <Route element={<Layout />}>
              {/* Phase 1 */}
              <Route path="/" element={<Dashboard />} />
              <Route path="/discover" element={<BrowseOpportunities />} />
              <Route path="/opportunity/:id" element={<OpportunityDetail />} />

              {/* Phase 2 — Learning & Career */}
              <Route path="/learn" element={<LearningRoadmaps />} />
              <Route path="/learn/:id" element={<RoadmapDetail />} />
              <Route path="/skill-gap" element={<SkillGapAnalysis />} />
              <Route path="/courses" element={<CourseRecommendations />} />
              <Route path="/cv-builder" element={<CVBuilder />} />
              <Route path="/cover-letter" element={<CoverLetterBuilder />} />
              <Route path="/interview-prep" element={<InterviewPrep />} />
              <Route path="/test-prep" element={<TestPrep />} />
              <Route path="/reviews" element={<ReviewSystem />} />
              <Route path="/community" element={<CommunityHub />} />

              {/* Phase 3 placeholders */}
              <Route path="/profile" element={<Profile />} />
              <Route path="/jobs" element={<Jobs />} />
              <Route path="/applications" element={<Applications />} />
              <Route path="/messages" element={<Messages />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/streak" element={<Streak />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/saved" element={<Saved />} />
              <Route path="/leaderboard" element={<Leaderboard />} />
              <Route path="/mentors" element={<Mentors />} />
              <Route path="/documents" element={<Documents />} />
              <Route path="/help" element={<Help />} />
              <Route path="*" element={<Dashboard />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AppProvider>
    </ThemeProvider>
  );
}
