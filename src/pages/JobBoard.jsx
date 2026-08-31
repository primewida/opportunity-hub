import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { jobs, opportunities } from '../services/api';
import { useApp } from '../context/AppContext';
import { SearchBar, FilterChips, Card, Badge, Button, Modal } from '../components/ui';
import { MapPin, Briefcase, Calendar, DollarSign, ExternalLink, RefreshCw, CheckCircle2, FileText, ChevronRight, Share2, Compass } from 'lucide-react';
import { formatDate } from '../utils/helpers';
import './JobBoard.css';

export default function JobBoard() {
  const navigate = useNavigate();
  const app = useApp();
  const userState = app.user?.currentState || app.user?.stateOfOrigin || app.user?.state || '';
  
  const [search, setSearch] = useState('');
  const [scopeFilter, setScopeFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');

  const types = ['All', 'Full-time', 'Part-time', 'Internship', 'NYSC', 'Volunteer'];
  const scopes = [
    'All',
    ...(userState ? [`📍 In ${userState}`] : []),
    '🇳🇬 Nigeria',
    '🌐 Remote',
    '🌍 International'
  ];
  
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scraping, setScraping] = useState(false);
  const [error, setError] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);

  const getProximityTier = (jobLoc = '', userSt = '') => {
    const l = (jobLoc || '').toLowerCase();
    const s = (userSt || '').toLowerCase().trim();
    if (s && s.length > 2 && l.includes(s)) return 1; // State match
    if (l.includes('nigeria') || l.includes('lagos') || l.includes('abuja') || l.includes('port harcourt') || l.includes('ibadan') || l.includes('kano') || l.includes('enugu') || l.includes('nationwide')) return 2; // Nigeria
    if (l.includes('remote')) return 3; // Remote
    return 4; // International
  };

  const fetchJobs = () => {
    setLoading(true);
    jobs.getAll().then(res => {
      const raw = res.data || res;
      const normalized = (Array.isArray(raw) ? raw : []).map(j => {
        let tags = [];
        if (Array.isArray(j.tags)) tags = j.tags;
        else if (typeof j.tags === 'string') {
          try { const pt = JSON.parse(j.tags); if (Array.isArray(pt)) tags = pt; } catch { tags = []; }
        }

        let requirements = [];
        if (Array.isArray(j.requirements)) requirements = j.requirements;
        else if (typeof j.requirements === 'string') {
          try {
            const pr = JSON.parse(j.requirements);
            if (Array.isArray(pr)) requirements = pr;
            else if (typeof pr === 'string') requirements = [pr];
          } catch {
            requirements = j.requirements.split(/\n|•|-|\*/).map(s => s.trim()).filter(Boolean);
          }
        }

        if (requirements.length === 0) {
          if (tags.length > 0) requirements = tags.map(t => `Demonstrated competence in ${t}`);
          else requirements = [
            'Relevant degree, diploma, or equivalent professional qualification in a related discipline.',
            'Strong analytical, communication, and collaborative team-working abilities.',
            'Ability to meet delivery milestones and adhere to organizational quality standards.'
          ];
        }

        const tier = getProximityTier(j.location, userState);

        return {
          ...j,
          id: j.id,
          title: j.title,
          company: j.companyName || j.company || 'Employer / Organization',
          type: j.jobType || j.type || 'Full-time',
          location: j.location || 'Nigeria & Remote',
          salary: j.salaryRange || j.salary,
          deadline: j.applicationDeadline || j.deadline,
          description: j.description || 'Exciting career opportunity. Review the requirements and submit your application via the official portal.',
          responsibilities: j.responsibilities || 'Execute assigned organizational and technical duties, collaborate with team leads, and meet scheduled project deliverables.',
          requirements,
          applyUrl: j.applyUrl || j.applicationLink || '#',
          tags: Array.isArray(tags) && tags.length > 0 ? tags : requirements.slice(0, 3),
          proximityTier: tier
        };
      });

      // Strict Proximity Sort: 1 (State) -> 2 (Nigeria) -> 3 (Remote) -> 4 (International)
      normalized.sort((a, b) => {
        if (a.proximityTier !== b.proximityTier) {
          return a.proximityTier - b.proximityTier;
        }
        return new Date(b.postedAt || b.createdAt || 0) - new Date(a.postedAt || a.createdAt || 0);
      });

      setData(normalized);
      setLoading(false);
    }).catch(err => {
      setError(err);
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchJobs();
  }, [userState]);

  const handleSyncJobs = async () => {
    setScraping(true);
    try {
      await opportunities.syncScraped();
      fetchJobs();
    } catch (e) {
      console.warn('Jobs sync error:', e);
      fetchJobs();
    } finally {
      setScraping(false);
    }
  };
  
  const filtered = useMemo(() => (data || []).filter(j => {
    const q = (typeof search === 'string' ? search : (search?.target?.value ?? String(search ?? ''))).toLowerCase().trim();
    if (q) {
      const matchTitle = typeof j.title === 'string' && j.title.toLowerCase().includes(q);
      const matchCompany = typeof j.company === 'string' && j.company.toLowerCase().includes(q);
      const matchLoc = typeof j.location === 'string' && j.location.toLowerCase().includes(q);
      const matchReq = Array.isArray(j.requirements) && j.requirements.some(r => typeof r === 'string' && r.toLowerCase().includes(q));
      const matchTags = Array.isArray(j.tags) && j.tags.some(t => typeof t === 'string' && t.toLowerCase().includes(q));
      if (!matchTitle && !matchCompany && !matchLoc && !matchReq && !matchTags) return false;
    }
    if (typeFilter !== 'All') {
      const jType = String(j.type || '').toLowerCase();
      const fType = String(typeFilter || '').toLowerCase();
      if (!jType.includes(fType) && !fType.includes(jType)) return false;
    }
    if (scopeFilter !== 'All') {
      if (scopeFilter.includes('In ') && j.proximityTier !== 1) return false;
      if (scopeFilter.includes('Nigeria') && (j.proximityTier > 2)) return false;
      if (scopeFilter.includes('Remote') && j.proximityTier !== 3) return false;
      if (scopeFilter.includes('International') && j.proximityTier !== 4) return false;
    }
    return true;
  }), [search, typeFilter, scopeFilter, data]);

  const handleShareJob = (job) => {
    if (navigator.share) {
      navigator.share({
        title: job.title,
        text: `Job Opening: ${job.title} at ${job.company}`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(job.applyUrl);
      alert('Application link copied to clipboard!');
    }
  };

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading jobs & requirements...</div>;
  if (error) return <div style={{ padding: '2rem', textAlign: 'center', color: 'red' }}>Error: {error.message}</div>;

  return (
    <div className="jobs">
      <div className="jobs__header">
        <h1 className="jobs__title">💼 Tech & Graduate Job Board</h1>
        <p className="jobs__subtitle">Live software engineering, data, design, NYSC and NGO career opportunities</p>
      </div>

      <div style={{ display: 'flex', gap: 'var(--space-sm)', alignItems: 'center', marginBottom: 'var(--space-md)' }}>
        <div style={{ flex: 1 }}>
          <SearchBar value={search} onChange={setSearch} onClear={() => setSearch('')} placeholder="Search jobs, tech stacks, skills, companies..." />
        </div>
        <button 
          className={`btn btn-icon btn-ghost ${scraping ? 'animate-spin' : ''}`}
          onClick={handleSyncJobs}
          title="Scrape and sync latest web tech jobs"
          disabled={scraping}
        >
          <RefreshCw size={20} />
        </button>
      </div>

      <div style={{ marginBottom: 'var(--space-sm)' }}>
        <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', margin: '0 0 6px' }}>Location Proximity:</p>
        <FilterChips options={scopes} selected={scopeFilter} onChange={setScopeFilter} />
      </div>

      <div style={{ marginBottom: 'var(--space-md)' }}>
        <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', margin: '0 0 6px' }}>Job Type:</p>
        <FilterChips options={types} selected={typeFilter} onChange={setTypeFilter} />
      </div>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: 'var(--space-sm) 0 var(--space-md)' }}>
        <p className="jobs__count" style={{ margin: 0 }}>{filtered.length} live jobs (ordered by proximity)</p>
        {scraping && <span style={{ fontSize: 'var(--text-caption)', color: 'var(--color-primary)' }}>🔄 Syncing live Nigerian & remote jobs...</span>}
      </div>

      <div className="jobs__list">
        {filtered.map(job => (
          <Card 
            key={job.id} 
            variant="interactive" 
            style={{ marginBottom: 'var(--space-md)', cursor: 'pointer' }}
            onClick={() => setSelectedJob(job)}
          >
            <div className="card-body jobs__card" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-md)' }}>
                <div className="jobs__card-logo" style={{ width: 48, height: 48, borderRadius: 'var(--radius-md)', background: 'var(--color-primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '18px', flexShrink: 0 }}>
                  {job.company?.charAt(0).toUpperCase() || 'J'}
                </div>
                <div className="jobs__card-info" style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
                    <h3 className="jobs__card-title" style={{ margin: 0, fontSize: 'var(--text-base)', fontWeight: 600 }}>{job.title}</h3>
                    {job.proximityTier === 1 && (
                      <span className="badge badge-success" style={{ fontSize: '10px', padding: '2px 8px' }}>📍 In {userState}</span>
                    )}
                    {job.proximityTier === 2 && (
                      <span className="badge badge-neutral" style={{ fontSize: '10px', padding: '2px 8px' }}>🇳🇬 Nigeria</span>
                    )}
                    {job.proximityTier === 3 && (
                      <span className="badge badge-primary" style={{ fontSize: '10px', padding: '2px 8px' }}>🌐 Remote</span>
                    )}
                    {job.proximityTier === 4 && (
                      <span className="badge badge-secondary" style={{ fontSize: '10px', padding: '2px 8px' }}>🌍 Global</span>
                    )}
                  </div>
                  <p className="jobs__card-company" style={{ color: 'var(--text-secondary)', margin: '0 0 8px', fontSize: 'var(--text-subhead)' }}>{job.company}</p>
                  <div className="jobs__card-meta" style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-sm)', fontSize: 'var(--text-caption)', color: 'var(--text-tertiary)' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><MapPin size={13} /> {job.location}</span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><Briefcase size={13} /> {job.type}</span>
                    {job.salary && <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: 'var(--color-success)', fontWeight: 600 }}><DollarSign size={13} /> {job.salary}</span>}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px', flexShrink: 0, alignItems: 'center' }}>
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    onClick={(e) => { e.stopPropagation(); setSelectedJob(job); }}
                  >
                    Requirements
                  </Button>
                  <a
                    href={job.applyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary btn-sm"
                    style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    Apply <ExternalLink size={14} />
                  </a>
                </div>
              </div>

              {/* Requirements & Skills Chips preview */}
              {job.requirements && job.requirements.length > 0 && (
                <div style={{ borderTop: '0.5px solid var(--separator)', paddingTop: '8px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Requirements:</span>
                  {job.requirements.slice(0, 3).map((req, i) => (
                    <span key={i} className="chip chip-sm" style={{ fontSize: '11px', background: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}>
                      ✓ {req.length > 35 ? req.slice(0, 35) + '...' : req}
                    </span>
                  ))}
                  {job.requirements.length > 3 && (
                    <span style={{ fontSize: '11px', color: 'var(--color-primary)', fontWeight: 600 }}>+{job.requirements.length - 3} more</span>
                  )}
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Interactive Job Detail & Requirements Modal */}
      {selectedJob && (
        <Modal 
          isOpen={!!selectedJob} 
          onClose={() => setSelectedJob(null)}
          title={selectedJob.title}
          size="lg"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            {/* Header info */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)', paddingBottom: 'var(--space-sm)', borderBottom: '0.5px solid var(--separator)' }}>
              <div style={{ width: 52, height: 52, borderRadius: 'var(--radius-md)', background: 'var(--color-primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '22px', flexShrink: 0 }}>
                {selectedJob.company?.charAt(0).toUpperCase() || 'J'}
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: '0 0 4px', fontSize: 'var(--text-title3)' }}>{selectedJob.title}</h3>
                <p style={{ margin: 0, color: 'var(--text-secondary)', fontWeight: 500 }}>{selectedJob.company}</p>
              </div>
            </div>

            {/* Meta badges */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 'var(--space-xs)' }}>
              <div style={{ background: 'var(--bg-secondary)', padding: '8px 12px', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
                <MapPin size={14} style={{ color: 'var(--color-primary)' }} />
                <span>{selectedJob.location}</span>
              </div>
              <div style={{ background: 'var(--bg-secondary)', padding: '8px 12px', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
                <Briefcase size={14} style={{ color: 'var(--color-primary)' }} />
                <span>{selectedJob.type}</span>
              </div>
              {selectedJob.salary && (
                <div style={{ background: 'rgba(52, 199, 89, 0.12)', color: 'var(--color-success)', padding: '8px 12px', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600 }}>
                  <DollarSign size={14} />
                  <span>{selectedJob.salary}</span>
                </div>
              )}
              {selectedJob.deadline && (
                <div style={{ background: 'var(--bg-secondary)', padding: '8px 12px', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
                  <Calendar size={14} style={{ color: 'var(--color-primary)' }} />
                  <span>{formatDate(selectedJob.deadline)}</span>
                </div>
              )}
            </div>

            {/* Role Overview */}
            <div>
              <h4 style={{ margin: '0 0 6px', fontSize: 'var(--text-subhead)', fontWeight: 700, color: 'var(--text-primary)' }}>
                📌 Role Overview
              </h4>
              <p style={{ margin: 0, fontSize: 'var(--text-subhead)', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                {selectedJob.description}
              </p>
            </div>

            {/* Requirements & Qualifications */}
            <div>
              <h4 style={{ margin: '0 0 8px', fontSize: 'var(--text-subhead)', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle2 size={16} style={{ color: 'var(--color-primary)' }} /> Candidate Requirements & Qualifications
              </h4>
              <div style={{ background: 'var(--bg-surface)', border: '0.5px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: 'var(--space-md)' }}>
                <ul style={{ margin: 0, paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {selectedJob.requirements?.map((req, i) => (
                    <li key={i} style={{ fontSize: 'var(--text-subhead)', color: 'var(--text-primary)', lineHeight: 1.5 }}>
                      {req}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Core Responsibilities */}
            {selectedJob.responsibilities && (
              <div>
                <h4 style={{ margin: '0 0 6px', fontSize: 'var(--text-subhead)', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <FileText size={16} style={{ color: 'var(--color-primary)' }} /> Key Responsibilities
                </h4>
                <p style={{ margin: 0, fontSize: 'var(--text-subhead)', color: 'var(--text-secondary)', lineHeight: 1.6, background: 'var(--bg-secondary)', padding: 'var(--space-md)', borderRadius: 'var(--radius-md)' }}>
                  {selectedJob.responsibilities}
                </p>
              </div>
            )}

            {/* Modal Actions */}
            <div style={{ display: 'flex', gap: 'var(--space-sm)', marginTop: 'var(--space-sm)', paddingTop: 'var(--space-md)', borderTop: '0.5px solid var(--separator)' }}>
              <Button variant="secondary" onClick={() => handleShareJob(selectedJob)}>
                <Share2 size={16} /> Share
              </Button>
              <a
                href={selectedJob.applyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary btn-lg"
                style={{ flex: 1, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                <ExternalLink size={18} /> Apply Directly on Official Portal
              </a>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
