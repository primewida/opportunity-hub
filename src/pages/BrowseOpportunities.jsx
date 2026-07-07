import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { SlidersHorizontal, Grid3X3, List, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { OpportunityCard, FilterChips, SearchBar, Button, Modal, EmptyState } from '../components/ui';
import { OPPORTUNITIES } from '../data/mockData';
import { OPPORTUNITY_TYPES, EDUCATION_LEVELS, FIELDS_OF_STUDY } from '../utils/constants';
import { Search } from 'lucide-react';
import './BrowseOpportunities.css';

export default function BrowseOpportunities() {
  const navigate = useNavigate();
  const app = useApp();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('match');
  const [filters, setFilters] = useState({ types: [], education: '', fields: [], location: 'Any', minMatch: 0, deadline: 'Any' });

  const chipOptions = ['All', ...OPPORTUNITY_TYPES];

  const filtered = useMemo(() => {
    let result = [...OPPORTUNITIES];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(o => o.title.toLowerCase().includes(q) || o.organization.toLowerCase().includes(q));
    }
    if (typeFilter !== 'All') result = result.filter(o => o.type === typeFilter);
    if (filters.types.length) result = result.filter(o => filters.types.includes(o.type));
    if (filters.education) result = result.filter(o => o.educationLevel?.toLowerCase() === filters.education);
    if (filters.minMatch > 0) result = result.filter(o => o.matchPercentage >= filters.minMatch);
    if (filters.location !== 'Any') {
      if (filters.location === 'Nigeria') result = result.filter(o => o.location === 'Nigeria');
      else if (filters.location === 'Global') result = result.filter(o => o.location !== 'Nigeria');
    }
    if (filters.deadline === '7days') result = result.filter(o => { const d = (new Date(o.deadline) - new Date()) / 86400000; return d <= 7 && d >= 0; });
    if (filters.deadline === '30days') result = result.filter(o => { const d = (new Date(o.deadline) - new Date()) / 86400000; return d <= 30 && d >= 0; });

    if (sortBy === 'match') result.sort((a, b) => b.matchPercentage - a.matchPercentage);
    else if (sortBy === 'deadline') result.sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
    else if (sortBy === 'newest') result.sort((a, b) => new Date(b.deadline) - new Date(a.deadline));
    return result;
  }, [search, typeFilter, sortBy, filters]);

  const toggleType = (t) => {
    setFilters(f => ({ ...f, types: f.types.includes(t) ? f.types.filter(x => x !== t) : [...f.types, t] }));
  };

  const clearFilters = () => setFilters({ types: [], education: '', fields: [], location: 'Any', minMatch: 0, deadline: 'Any' });

  return (
    <div className="browse">
      <div className="browse__header">
        <SearchBar value={search} onChange={setSearch} onClear={() => setSearch('')} placeholder="Search scholarships, jobs, grants..." />
        <div className="browse__controls">
          <FilterChips options={chipOptions} selected={typeFilter} onChange={setTypeFilter} />
          <div className="browse__control-right">
            <select className="browse__sort" value={sortBy} onChange={e => setSortBy(e.target.value)}>
              <option value="match">Best Match</option>
              <option value="deadline">Deadline (Soonest)</option>
              <option value="newest">Newest</option>
            </select>
            <button className={`btn btn-icon btn-ghost ${showFilters ? 'active' : ''}`} onClick={() => setShowFilters(true)} aria-label="Filters">
              <SlidersHorizontal size={18} />
            </button>
            <button className={`btn btn-icon btn-ghost ${viewMode === 'grid' ? 'active' : ''}`} onClick={() => setViewMode('grid')} aria-label="Grid view"><Grid3X3 size={18} /></button>
            <button className={`btn btn-icon btn-ghost ${viewMode === 'list' ? 'active' : ''}`} onClick={() => setViewMode('list')} aria-label="List view"><List size={18} /></button>
          </div>
        </div>
        <p className="browse__results-count">Showing {filtered.length} opportunities</p>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={Search} title="No opportunities found" description="Try adjusting your search or filters" actionLabel="Clear Filters" onAction={() => { setSearch(''); setTypeFilter('All'); clearFilters(); }} />
      ) : (
        <div className={`browse__grid browse__grid--${viewMode}`}>
          {filtered.map((opp, i) => (
            <div key={opp.id} className="browse__item" style={{ animationDelay: `${i * 0.05}s` }}>
              <OpportunityCard opportunity={opp} onClick={() => navigate(`/opportunity/${opp.id}`)}
                onBookmark={() => app.toggleSave(opp.id)} />
            </div>
          ))}
        </div>
      )}

      {/* Advanced Filters Modal */}
      <Modal isOpen={showFilters} onClose={() => setShowFilters(false)} title="Advanced Filters">
        <div className="browse__filters">
          <div className="browse__filter-group">
            <label className="browse__filter-label">Opportunity Type</label>
            <div className="browse__filter-checks">
              {OPPORTUNITY_TYPES.map(t => (
                <label key={t} className="browse__filter-check">
                  <input type="checkbox" checked={filters.types.includes(t)} onChange={() => toggleType(t)} />
                  <span>{t}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="browse__filter-group">
            <label className="browse__filter-label">Education Level</label>
            <select className="input" value={filters.education} onChange={e => setFilters(f => ({ ...f, education: e.target.value }))}>
              <option value="">All Levels</option>
              {EDUCATION_LEVELS.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
            </select>
          </div>
          <div className="browse__filter-group">
            <label className="browse__filter-label">Location</label>
            <div className="browse__filter-radios">
              {['Any', 'Nigeria', 'Africa', 'Global'].map(loc => (
                <label key={loc} className="browse__filter-radio">
                  <input type="radio" name="location" checked={filters.location === loc} onChange={() => setFilters(f => ({ ...f, location: loc }))} />
                  <span>{loc}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="browse__filter-group">
            <label className="browse__filter-label">Minimum Match: {filters.minMatch}%</label>
            <input type="range" className="browse__slider" min="0" max="100" step="5" value={filters.minMatch}
              onChange={e => setFilters(f => ({ ...f, minMatch: Number(e.target.value) }))} />
          </div>
          <div className="browse__filter-group">
            <label className="browse__filter-label">Deadline</label>
            <div className="browse__filter-radios">
              {[{ v: 'Any', l: 'Any Time' }, { v: '7days', l: 'Next 7 Days' }, { v: '30days', l: 'Next 30 Days' }].map(d => (
                <label key={d.v} className="browse__filter-radio">
                  <input type="radio" name="deadline" checked={filters.deadline === d.v} onChange={() => setFilters(f => ({ ...f, deadline: d.v }))} />
                  <span>{d.l}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="browse__filter-actions">
            <button className="btn btn-ghost" onClick={clearFilters}>Clear All</button>
            <Button variant="primary" onClick={() => setShowFilters(false)}>Show {filtered.length} Results</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
