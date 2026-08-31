import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Card, SearchBar, FilterChips, Avatar, Badge, Button } from '../components/ui';
import { mentors } from '../services/api';
import { MapPin, Briefcase, MessageSquare } from 'lucide-react';
import './MentorDirectory.css';

export default function MentorDirectory() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [field, setField] = useState('All');
  const [mentorsList, setMentorsList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    mentors.getAll().then(res => {
      const mapped = (res || []).map(m => ({
        ...m,
        name: m.user ? `${m.user.firstName} ${m.user.lastName}` : 'Unknown Mentor',
        role: m.bio || m.title || 'Mentor',
        expertise: m.mentoringTopics?.[0] || m.expertise || 'General',
        topics: m.mentoringTopics || m.skills || []
      }));
      setMentorsList(mapped);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  const q = (typeof search === 'string' ? search : (search?.target?.value ?? String(search ?? ''))).toLowerCase().trim();
  const filtered = mentorsList.filter(m => {
    if (q && !(typeof m.name === 'string' && m.name.toLowerCase().includes(q)) && !(typeof m.field === 'string' && m.field.toLowerCase().includes(q))) return false;
    if (field !== 'All' && (m.field || m.expertise) !== field) return false;
    return true;
  });

  return (
    <div className="mentors">
      <div className="mentors__header">
        <h1 className="mentors__title">🧑‍🏫 Mentor Directory</h1>
        <p className="mentors__subtitle">Connect with scholarship alumni and industry professionals</p>
      </div>
      <SearchBar value={search} onChange={setSearch} onClear={() => setSearch('')} placeholder="Search mentors by name or expertise..." />
      <FilterChips options={fields} selected={field} onChange={setField} />
      {loading ? <p style={{ padding: '2rem', textAlign: 'center' }}>Loading mentors...</p> : (
      <div className="mentors__grid">
        {filtered.map(mentor => (
          <Card key={mentor.id} variant="interactive" onClick={() => navigate(`/mentors/${mentor.id}`)}>
            <div className="card-body mentors__card">
              <Avatar name={mentor.name} size={56} />
              <h3 className="mentors__name">{mentor.name}</h3>
              <p className="mentors__role">{mentor.role || mentor.title}</p>
              <div className="mentors__meta">
                {mentor.company && <span><Briefcase size={12} /> {mentor.company}</span>}
                {mentor.location && <span><MapPin size={12} /> {mentor.location}</span>}
              </div>
              <div className="mentors__tags">
                {(mentor.topics || mentor.skills || []).slice(0, 3).map(t => <Badge key={t} variant="primary">{t}</Badge>)}
              </div>
              <Button variant="outline" size="sm" icon={MessageSquare} fullWidth>Connect</Button>
            </div>
          </Card>
        ))}
      </div>
      )}
    </div>
  );
}
