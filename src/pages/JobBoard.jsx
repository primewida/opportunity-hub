import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { jobs, opportunities } from '../services/api';
import { SearchBar, FilterChips, Card, Badge, Button } from '../components/ui';
import { MapPin, Briefcase, Clock, DollarSign, ExternalLink, RefreshCw } from 'lucide-react';
import './JobBoard.css';

export default function JobBoard() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const types = ['All', 'Full-time', 'Part-time', 'Internship', 'NYSC'];
  
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scraping, setScraping] = useState(false);
  const [error, setError] = useState(null);

  const fetchJobs = () => {
    setLoading(true);
    jobs.getAll().then(res => {
      const raw = res.data || res;
      const normalized = (Array.isArray(raw) ? raw : []).map(j => {
        let tags = [];
        if (Array.isArray(j.tags)) tags = j.tags;
        else if (typeof j.tags === 'string') {
          try { tags = JSON.parse(j.tags); } catch { tags = []; }
        } else if (typeof j.requirements === 'string') {
          try { tags = JSON.parse(j.requirements); } catch { tags = []; }
        }

        return {
          ...j,
          id: j.id,
          title: j.title,
          company: j.companyName || j.company || 'Tech Company',
          type: j.jobType || j.type || 'Full-time',
          location: j.location || 'Remote',
          salary: j.salaryRange || j.salary,
          deadline: j.applicationDeadline || j.deadline,
          applyUrl: j.applyUrl || j.applicationLink || '#',
          tags: Array.isArray(tags) ? tags : []
        };
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
  }, []);

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
    if (search) {
      const q = search.toLowerCase();
      const matchTitle = j.title?.toLowerCase().includes(q);
      const matchCompany = j.company?.toLowerCase().includes(q);
      const matchLoc = j.location?.toLowerCase().includes(q);
      if (!matchTitle && !matchCompany && !matchLoc) return false;
    }
    if (typeFilter !== 'All') {
      const jType = (j.type || '').toLowerCase();
      const fType = typeFilter.toLowerCase();
      if (!jType.includes(fType) && !fType.includes(jType)) return false;
    }
    return true;
  }), [search, typeFilter, data]);

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading jobs...</div>;
  if (error) return <div style={{ padding: '2rem', textAlign: 'center', color: 'red' }}>Error: {error.message}</div>;

  return (
    <div className="jobs">
      <div className="jobs__header">
        <h1 className="jobs__title">💼 Tech & Graduate Job Board</h1>
        <p className="jobs__subtitle">Live software engineering, data, design, NYSC and internship opportunities</p>
      </div>

      <div style={{ display: 'flex', gap: 'var(--space-sm)', alignItems: 'center', marginBottom: 'var(--space-md)' }}>
        <div style={{ flex: 1 }}>
          <SearchBar value={search} onChange={setSearch} onClear={() => setSearch('')} placeholder="Search jobs, tech stacks, companies..." />
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

      <FilterChips options={types} selected={typeFilter} onChange={setTypeFilter} />
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: 'var(--space-sm) 0 var(--space-md)' }}>
        <p className="jobs__count" style={{ margin: 0 }}>{filtered.length} live jobs available</p>
        {scraping && <span style={{ fontSize: 'var(--text-caption)', color: 'var(--color-primary)' }}>🔄 Syncing live web jobs...</span>}
      </div>

      <div className="jobs__list">
        {filtered.map(job => (
          <Card key={job.id} variant="interactive" style={{ marginBottom: 'var(--space-md)' }}>
            <div className="card-body jobs__card" style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-md)' }}>
              <div className="jobs__card-logo" style={{ width: 48, height: 48, borderRadius: 'var(--radius-md)', background: 'var(--color-primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '18px', flexShrink: 0 }}>
                {job.company?.charAt(0).toUpperCase() || 'J'}
              </div>
              <div className="jobs__card-info" style={{ flex: 1, minWidth: 0 }}>
                <h3 className="jobs__card-title" style={{ margin: '0 0 4px', fontSize: 'var(--text-base)', fontWeight: 600 }}>{job.title}</h3>
                <p className="jobs__card-company" style={{ color: 'var(--text-secondary)', margin: '0 0 8px', fontSize: 'var(--text-subhead)' }}>{job.company}</p>
                <div className="jobs__card-meta" style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-sm)', fontSize: 'var(--text-caption)', color: 'var(--text-tertiary)', marginBottom: '8px' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><MapPin size={13} /> {job.location}</span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><Briefcase size={13} /> {job.type}</span>
                  {job.salary && <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: 'var(--color-success)' }}><DollarSign size={13} /> {job.salary}</span>}
                </div>
                {job.tags && job.tags.length > 0 && (
                  <div className="jobs__card-tags" style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {job.tags.slice(0, 4).map(s => <Badge key={s} variant="neutral" size="sm">{s}</Badge>)}
                  </div>
                )}
              </div>
              <div style={{ alignSelf: 'center', flexShrink: 0 }}>
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
          </Card>
        ))}
      </div>
    </div>
  );
}
