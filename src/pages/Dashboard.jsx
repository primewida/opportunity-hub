import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Flame, ChevronRight, TrendingUp, ClipboardList, Sparkles, MessageSquare } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Card, OpportunityCard, ProgressBar, FilterChips } from '../components/ui';
import { getGreeting } from '../utils/helpers';
import { dashboard, opportunities, roadmaps, community } from '../services/api';
import './Dashboard.css';

export default function Dashboard() {
  const navigate = useNavigate();
  const app = useApp();
  const [feedFilter, setFeedFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [dashboardData, setDashboardData] = useState({
    topMatches: [],
    activeRoadmap: null,
    feedOpps: [],
    jobList: [],
    communityPosts: [],
    stats: null
  });

  useEffect(() => {
    Promise.all([
      opportunities.getFeed(),
      jobs.getAll().catch(() => ({ data: [] })),
      roadmaps.getAll().catch(() => ({ data: [] })),
      community.getTrending().catch(() => ({ data: [] })),
      dashboard.get().catch(() => null)
    ]).then(([feedRes, jobsRes, roadmapsRes, commRes, dashRes]) => {
      const rawOpps = feedRes.data || feedRes;
      const opps = Array.isArray(rawOpps) ? rawOpps.map(o => ({
        ...o,
        type: o.type || o.opportunityType || '',
        organization: o.organization || o.provider || '',
      })) : [];

      const rawJobs = jobsRes.data || jobsRes;
      const loadedJobs = (Array.isArray(rawJobs) ? rawJobs : []).map(j => ({
        ...j,
        company: j.companyName || j.company || 'Tech Company',
        type: j.jobType || j.type || 'Full-time',
        location: j.location || 'Remote',
        salary: j.salaryRange || j.salary,
        deadline: j.applicationDeadline || j.deadline,
        applyUrl: j.applyUrl || j.applicationLink || '#'
      }));

      const roads = roadmapsRes.data || roadmapsRes;
      const posts = commRes.data || commRes;
      
      setDashboardData({
        topMatches: [...opps].sort((a, b) => (b.matchPercentage || 0) - (a.matchPercentage || 0)).slice(0, 6),
        activeRoadmap: Array.isArray(roads) ? roads.find(r => r.progress > 0 && r.progress < 100) : null,
        feedOpps: opps,
        jobList: loadedJobs,
        communityPosts: Array.isArray(posts) ? posts : [],
        stats: dashRes?.stats || null
      });
      setLoading(false);
    }).catch(err => {
      setError(err);
      setLoading(false);
    });
  }, []);

  const userName = app.user?.firstName || app.user?.name?.split(' ')[0] || 'Student';
  const feedTypes = ['All', 'Scholarships', 'Jobs', 'Internships', 'Training'];
  
  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading dashboard...</div>;
  if (error) return <div style={{ padding: '2rem', textAlign: 'center', color: 'red' }}>Error loading dashboard: {error.message}</div>;

  const { topMatches, activeRoadmap, feedOpps, jobList, communityPosts, stats } = dashboardData;
  
  const filteredFeed = feedOpps.filter(o => {
    if (feedFilter === 'All') return true;
    const oppType = (o.type || o.opportunityType || '').toLowerCase();
    if (feedFilter === 'Scholarships') return oppType.includes('scholarship');
    if (feedFilter === 'Internships') return oppType.includes('intern');
    if (feedFilter === 'Training') return oppType.includes('train') || oppType.includes('bootcamp');
    return false;
  });

  return (
    <div className="dashboard">
      <div className="dashboard__hero">
        <h1 className="dashboard__greeting">{getGreeting(userName)}</h1>
        <div className="dashboard__streak-card">
          <div className="dashboard__streak-icon"><Flame size={28} /></div>
          <div className="dashboard__streak-info">
            <span className="dashboard__streak-count">{app.streakData?.currentStreak || 12} Day Streak</span>
            <span className="dashboard__streak-label">Keep your streak burning! 🔥</span>
          </div>
        </div>
      </div>

      <section className="dashboard__section">
        <div className="dashboard__section-header">
          <h2 className="dashboard__section-title">🎯 Top Recommendations For You</h2>
          <button className="dashboard__see-all" onClick={() => navigate('/discover')}>See all <ChevronRight size={14} /></button>
        </div>
        <div className="dashboard__matches-scroll">
          {topMatches.map(opp => (
            <OpportunityCard key={opp.id} opportunity={opp} onClick={() => navigate(`/opportunity/${opp.id}`)}
              onBookmark={() => app.toggleSave(opp.id)} />
          ))}
        </div>
      </section>

      {activeRoadmap && (
        <section className="dashboard__section">
          <div className="dashboard__section-header">
            <h2 className="dashboard__section-title">📖 Continue Learning</h2>
          </div>
          <Card variant="interactive" onClick={() => navigate(`/learn/${activeRoadmap.id}`)}>
            <div className="card-body dashboard__roadmap-card">
              <div className="dashboard__roadmap-icon">{activeRoadmap.icon || '📚'}</div>
              <div className="dashboard__roadmap-info">
                <span className="badge badge-primary">{activeRoadmap.category}</span>
                <h3 className="dashboard__roadmap-title">{activeRoadmap.title}</h3>
                <ProgressBar progress={activeRoadmap.progress || 35} size="sm" />
              </div>
              <button className="btn btn-primary btn-sm">Resume</button>
            </div>
          </Card>
        </section>
      )}

      <section className="dashboard__section">
        <div className="dashboard__section-header">
          <h2 className="dashboard__section-title">📊 Quick Stats</h2>
        </div>
        <div className="dashboard__stats-grid">
          {[
            { icon: TrendingUp, num: stats?.matchedOpportunities || '23', label: 'New Matches', color: 'var(--color-primary)' },
            { icon: ClipboardList, num: stats?.applications || '5', label: 'Applications', color: 'var(--color-accent-teal)' },
            { icon: Flame, num: `${app.streakData?.currentStreak || stats?.streakDays || 12}`, label: 'Day Streak', color: 'var(--color-accent-amber)' },
          ].map((s, i) => (
            <div key={i} className="dashboard__stat-card" style={{ borderLeftColor: s.color }}>
              <s.icon size={20} style={{ color: s.color }} />
              <span className="dashboard__stat-number">{s.num}</span>
              <span className="dashboard__stat-label">{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="dashboard__section">
        <div className="dashboard__section-header">
          <h2 className="dashboard__section-title"><MessageSquare size={18} /> Community Buzz</h2>
          <button className="dashboard__see-all" onClick={() => navigate('/community')}>See all <ChevronRight size={14} /></button>
        </div>
        {communityPosts.slice(0, 3).map(post => (
          <div key={post.id} className="dashboard__community-post" onClick={() => navigate('/community')}>
            <div className="dashboard__post-avatar">{post.author?.initials || 'A'}</div>
            <div className="dashboard__post-content">
              <span className="dashboard__post-author">{post.author?.name || 'Anonymous'}</span>
              <p className="dashboard__post-text">{post.content?.slice(0, 120)}...</p>
              <span className="dashboard__post-meta">👍 {post.upvotes || 0} · 💬 {post.commentCount || 0}</span>
            </div>
          </div>
        ))}
      </section>

      <section className="dashboard__section">
        <div className="dashboard__section-header">
          <h2 className="dashboard__section-title">🌍 Explore Opportunities & Jobs</h2>
          {feedFilter === 'Jobs' && (
            <button className="dashboard__see-all" onClick={() => navigate('/jobs')}>Open Job Board <ChevronRight size={14} /></button>
          )}
        </div>
        <FilterChips options={feedTypes} selected={feedFilter} onChange={setFeedFilter} />
        <div className="dashboard__feed" style={{ marginTop: 'var(--space-md)' }}>
          {feedFilter === 'Jobs' ? (
            jobList.slice(0, 5).map(job => (
              <Card key={job.id} variant="interactive" style={{ marginBottom: 'var(--space-sm)' }}>
                <div className="card-body" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 'var(--space-md)' }}>
                  <div>
                    <span className="badge badge-neutral" style={{ marginBottom: '4px' }}>{job.type}</span>
                    <h4 style={{ margin: '4px 0', fontSize: 'var(--text-base)' }}>{job.title}</h4>
                    <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: 'var(--text-subhead)' }}>{job.company} · {job.location}</p>
                  </div>
                  <a href={job.applyUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-sm" onClick={e => e.stopPropagation()}>Apply</a>
                </div>
              </Card>
            ))
          ) : (
            filteredFeed.slice(0, 5).map(opp => (
              <OpportunityCard key={opp.id} opportunity={opp} onClick={() => navigate(`/opportunity/${opp.id}`)}
                onBookmark={() => app.toggleSave(opp.id)} />
            ))
          )}
        </div>
      </section>
    </div>
  );
}
