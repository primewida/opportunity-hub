import { useParams, useNavigate } from 'react-router';
import { MENTORS } from '../data/mockData';
import { Avatar, Button, Badge, Card } from '../components/ui';
import { ArrowLeft, MapPin, Briefcase, ExternalLink, MessageSquare, Calendar } from 'lucide-react';
import './MentorProfile.css';

const mockJourney = [
  { year: '2018', event: 'Graduated from University of Lagos with First Class in Computer Science' },
  { year: '2019', event: 'Won Chevening Scholarship to study at University of Edinburgh' },
  { year: '2020', event: 'Completed MSc in Artificial Intelligence' },
  { year: '2021', event: 'Joined Google as Software Engineer in London' },
  { year: '2023', event: 'Promoted to Senior Software Engineer' },
  { year: '2024', event: 'Started mentoring Nigerian students on OpportunityHub' },
];

export default function MentorProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const mentor = (MENTORS || []).find(m => m.id === id);

  if (!mentor) return (
    <div style={{ textAlign: 'center', padding: 'var(--space-2xl)' }}>
      <h2>Mentor not found</h2>
      <Button variant="primary" onClick={() => navigate('/mentors')}>Back to Directory</Button>
    </div>
  );

  return (
    <div className="mentor-profile">
      <button className="mentor-profile__back" onClick={() => navigate(-1)}><ArrowLeft size={20} /> Back</button>
      <div className="mentor-profile__hero">
        <Avatar name={mentor.name} size={80} />
        <h1 className="mentor-profile__name">{mentor.name}</h1>
        <p className="mentor-profile__role">{mentor.role || mentor.title}</p>
        <div className="mentor-profile__meta">
          {mentor.company && <span><Briefcase size={14} /> {mentor.company}</span>}
          {mentor.location && <span><MapPin size={14} /> {mentor.location}</span>}
        </div>
        <div className="mentor-profile__tags">
          {(mentor.topics || mentor.skills || []).map(t => <Badge key={t} variant="primary">{t}</Badge>)}
        </div>
        <div className="mentor-profile__actions">
          <Button variant="primary" icon={MessageSquare}>Send Message</Button>
          <Button variant="outline" icon={Calendar}>Book Session</Button>
        </div>
      </div>

      <div className="mentor-profile__section">
        <h2 className="mentor-profile__section-title">About</h2>
        <Card variant="elevated"><div className="card-body">
          <p className="mentor-profile__bio">{mentor.bio || `${mentor.name} is an experienced professional passionate about helping Nigerian students achieve their goals through mentorship and guidance. With years of experience in ${mentor.field || 'their field'}, they provide practical advice on scholarships, career development, and skill building.`}</p>
        </div></Card>
      </div>

      <div className="mentor-profile__section">
        <h2 className="mentor-profile__section-title">My Journey</h2>
        <div className="mentor-profile__timeline">
          {mockJourney.map((item, i) => (
            <div key={i} className="mentor-profile__timeline-item">
              <div className="mentor-profile__timeline-dot" />
              <div className="mentor-profile__timeline-content">
                <span className="mentor-profile__timeline-year">{item.year}</span>
                <p className="mentor-profile__timeline-text">{item.event}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mentor-profile__section">
        <h2 className="mentor-profile__section-title">Availability</h2>
        <Card variant="elevated"><div className="card-body" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
          <div style={{ width: 12, height: 12, borderRadius: '50%', background: 'var(--color-success)' }} />
          <div>
            <strong style={{ fontSize: 'var(--text-sm)' }}>Available for Mentoring</strong>
            <p style={{ margin: '4px 0 0', fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>Usually responds within 24 hours</p>
          </div>
        </div></Card>
      </div>
    </div>
  );
}
