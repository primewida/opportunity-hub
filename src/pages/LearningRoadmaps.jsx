import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Search, BookOpen, Clock, Users } from 'lucide-react';
import { SearchBar, FilterChips, Card, ProgressBar, Badge } from '../components/ui';
import { roadmaps } from '../services/api';
import './LearningRoadmaps.css';

const CATEGORIES = ['All', 'Test Prep', 'Tech Skills', 'Scholarship Prep', 'Soft Skills'];

export default function LearningRoadmaps() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    roadmaps.getAll().then(res => {
      const raw = res.data || res;
      // Deduplicate by title or id
      const seen = new Set();
      const unique = (Array.isArray(raw) ? raw : []).filter(r => {
        const key = r.title || r.id;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
      setData(unique);
      setLoading(false);
    }).catch(err => {
      setError(err);
      setLoading(false);
    });
  }, []);

  const continueLearning = useMemo(
    () => data.filter((r) => r.progress > 0),
    [data]
  );

  const filtered = useMemo(() => {
    let result = [...data];
    const q = (typeof search === 'string' ? search : (search?.target?.value ?? String(search ?? ''))).toLowerCase().trim();
    if (q) {
      result = result.filter((r) => 
        (typeof r.title === 'string' && r.title.toLowerCase().includes(q)) || 
        (typeof r.description === 'string' && r.description.toLowerCase().includes(q))
      );
    }
    if (category !== 'All') result = result.filter((r) => r.category === category);
    return result;
  }, [search, category, data]);

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading roadmaps...</div>;
  if (error) return <div style={{ padding: '2rem', textAlign: 'center', color: 'red' }}>Error: {error.message}</div>;

  return (
    <div className="learning">
      {/* Header */}
      <div className="learning__header">
        <h1 className="learning__title">Learning Roadmaps</h1>
        <p className="learning__subtitle">
          Master new skills and prepare for opportunities with guided learning paths
        </p>
        <SearchBar
          value={search}
          onChange={setSearch}
          onClear={() => setSearch('')}
          placeholder="Search roadmaps..."
        />
        <FilterChips options={CATEGORIES} selected={category} onChange={setCategory} />
      </div>

      {/* Continue Learning */}
      {continueLearning.length > 0 && !search && category === 'All' && (
        <section className="learning__section">
          <h2 className="learning__section-title">
            <BookOpen size={20} /> Continue Learning
          </h2>
          <div className="learning__continue">
            {continueLearning.map((roadmap) => (
              <div
                key={roadmap.id}
                className="learning__card learning__card--continue"
                onClick={() => navigate(`/learn/${roadmap.id}`)}
              >
                <div className="learning__card-icon">{roadmap.icon}</div>
                <div className="learning__card-body">
                  <h3 className="learning__card-title">{roadmap.title}</h3>
                  <ProgressBar progress={roadmap.progress} showPercentage size="sm" />
                </div>
                <Badge variant="success" size="sm">Continue</Badge>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Results count */}
      <p className="learning__results-count">
        Showing {filtered.length} roadmap{filtered.length !== 1 ? 's' : ''}
      </p>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="learning__empty">
          <Search size={48} strokeWidth={1.2} />
          <h3>No roadmaps found</h3>
          <p>Try a different search term or category</p>
        </div>
      ) : (
        <div className="learning__grid">
          {filtered.map((roadmap, i) => (
            <Card
              key={roadmap.id}
              className="learning__card"
              onClick={() => navigate(`/learn/${roadmap.id}`)}
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              <div className="learning__card-top">
                <div className="learning__card-icon">{roadmap.icon}</div>
                <Badge
                  variant={roadmap.progress > 0 ? 'success' : 'neutral'}
                  size="sm"
                >
                  {roadmap.progress > 0 ? 'Continue' : 'Start'}
                </Badge>
              </div>
              <h3 className="learning__card-title">{roadmap.title}</h3>
              <p className="learning__card-desc">{roadmap.description}</p>
              <div className="learning__badge">
                <Badge variant="primary" size="sm">{roadmap.category}</Badge>
              </div>
              <div className="learning__meta">
                <span className="learning__meta-item">
                  <Clock size={14} />
                  {roadmap.estimatedWeeks} weeks
                </span>
                <span className="learning__meta-item">
                  <Users size={14} />
                  {roadmap.enrolledCount?.toLocaleString() || 0} enrolled
                </span>
              </div>
              {roadmap.progress > 0 && (
                <div className="learning__card-progress">
                  <ProgressBar progress={roadmap.progress} showPercentage size="sm" />
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
