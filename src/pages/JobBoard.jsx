import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { jobs } from '../services/api';
import { SearchBar, FilterChips, Card, Badge, Button } from '../components/ui';
import { MapPin, Briefcase, Clock, DollarSign } from 'lucide-react';
import './JobBoard.css';

export default function JobBoard() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const types = ['All', 'Full-time', 'Part-time', 'Internship', 'NYSC', 'Contract'];
  
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    jobs.getAll().then(res => {
      setData(res.data || res);
      setLoading(false);
    }).catch(err => {
      setError(err);
      setLoading(false);
    });
  }, []);
  
  const filtered = useMemo(() => (data || []).filter(j => {
    if (search && !j.title.toLowerCase().includes(search.toLowerCase()) && !(j.company && j.company.toLowerCase().includes(search.toLowerCase()))) return false;
    if (typeFilter !== 'All' && j.type !== typeFilter) return false;
    return true;
  }), [search, typeFilter, data]);

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading jobs...</div>;
  if (error) return <div style={{ padding: '2rem', textAlign: 'center', color: 'red' }}>Error: {error.message}</div>;

  return (
    <div className="jobs">
      <div className="jobs__header"><h1 className="jobs__title">💼 Job Board</h1><p className="jobs__subtitle">Find jobs, internships, and NYSC placements across Nigeria</p></div>
      <SearchBar value={search} onChange={setSearch} onClear={() => setSearch('')} placeholder="Search jobs, companies..." />
      <FilterChips options={types} selected={typeFilter} onChange={setTypeFilter} />
      <p className="jobs__count">{filtered.length} jobs found</p>
      <div className="jobs__list">
        {filtered.map(job => (
          <Card key={job.id} variant="interactive" onClick={() => navigate(`/jobs/${job.id}`)}>
            <div className="card-body jobs__card">
              <div className="jobs__card-logo">{job.company?.charAt(0) || 'J'}</div>
              <div className="jobs__card-info">
                <h3 className="jobs__card-title">{job.title}</h3>
                <p className="jobs__card-company">{job.company}</p>
                <div className="jobs__card-meta">
                  <span><MapPin size={12} /> {job.location}</span>
                  <span><Briefcase size={12} /> {job.type}</span>
                  {job.salary && <span><DollarSign size={12} /> {job.salary}</span>}
                  {job.deadline && <span><Clock size={12} /> {job.deadline}</span>}
                </div>
                <div className="jobs__card-tags">{(job.skills || []).slice(0, 3).map(s => <Badge key={s} variant="primary">{s}</Badge>)}</div>
              </div>
              <Button variant="outline" size="sm">Apply</Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
