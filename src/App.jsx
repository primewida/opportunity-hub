import { BrowserRouter, Routes, Route } from 'react-router';
import { ThemeProvider } from './context/ThemeContext';
import { AppProvider } from './context/AppContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/ProtectedRoute';

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

/* ── Phase 3 Screens ── */
import StreakDashboard from './pages/StreakDashboard';
import Leaderboard from './pages/Leaderboard';
import MentorDirectory from './pages/MentorDirectory';
import MentorProfile from './pages/MentorProfile';
import Messages from './pages/Messages';
import JobBoard from './pages/JobBoard';
import Notifications from './pages/Notifications';
import Profile from './pages/Profile';
import SavedOpportunities from './pages/SavedOpportunities';
import ApplicationTracker from './pages/ApplicationTracker';
import DocumentVault from './pages/DocumentVault';
import Help from './pages/Help';

export default function App() {
  return (
    <ThemeProvider>
      <AppProvider>
        <ErrorBoundary>
          <BrowserRouter>
            <Routes>
              {/* Auth flow (no layout shell) */}
              <Route path="/splash" element={<SplashScreen />} />
              <Route path="/onboarding" element={<Onboarding />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/profile-setup" element={<ProfileSetup />} />

              {/* Main app (with layout shell + auth protection) */}
              <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
                {/* Phase 1 — Core */}
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

                {/* Phase 3 — Engagement, Jobs & Utilities */}
                <Route path="/streak" element={<StreakDashboard />} />
                <Route path="/leaderboard" element={<Leaderboard />} />
                <Route path="/mentors" element={<MentorDirectory />} />
                <Route path="/mentors/:id" element={<MentorProfile />} />
                <Route path="/messages" element={<Messages />} />
                <Route path="/jobs" element={<JobBoard />} />
                <Route path="/notifications" element={<Notifications />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/settings" element={<Profile />} />
                <Route path="/saved" element={<SavedOpportunities />} />
                <Route path="/applications" element={<ApplicationTracker />} />
                <Route path="/documents" element={<DocumentVault />} />
                <Route path="/help" element={<Help />} />
                <Route path="*" element={<Dashboard />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </ErrorBoundary>
      </AppProvider>
    </ThemeProvider>
  );
}
