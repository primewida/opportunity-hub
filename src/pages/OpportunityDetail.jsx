import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router';
import { ArrowLeft, Bookmark, BookmarkCheck, Share2, ExternalLink, Check, X as XIcon, Calendar, MapPin, Building2, GraduationCap, FileText, ChevronRight, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { MatchBadge, Button, Badge, Card, ProgressBar } from '../components/ui';
import { OPPORTUNITIES } from '../data/mockData';
import { formatDate, getDeadlineColor, getDeadlineText, daysUntilDeadline } from '../utils/helpers';
import './OpportunityDetail.css';

export default function OpportunityDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const app = useApp();
  const [showSticky, setShowSticky] = useState(false);
  const heroRef = useRef(null);
  const opp = OPPORTUNITIES.find(o => o.id === id);
  const isSaved = app.savedOpportunities?.includes(id);

  useEffect(() => {
    const handleScroll = () => { setShowSticky(window.scrollY > 260); };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!opp) return (
    <div style={{ padding: 'var(--space-2xl)', textAlign: 'center' }}>
      <h2>Opportunity not found</h2>
      <Button variant="primary" onClick={() => navigate('/discover')}>Browse Opportunities</Button>
    </div>
  );

  const days = daysUntilDeadline(opp.deadline);
  const metReasons = opp.matchReasons?.filter(r => r.met) || [];
  const missingReasons = opp.matchReasons?.filter(r => !r.met) || [];

  return (
    <div className="detail">
      {/* Sticky Header */}
      <div className={`detail__sticky ${showSticky ? 'detail__sticky--visible' : ''}`}>
        <h3 className="detail__sticky-title">{opp.title}</h3>
        <Button variant="primary" size="sm" icon={ExternalLink}>Apply Now</Button>
      </div>

      {/* Hero */}
      <div className="detail__hero" ref={heroRef} style={{ background: opp.bannerColor || 'var(--gradient-primary)' }}>
        <button className="detail__back" onClick={() => navigate(-1)} aria-label="Go back"><ArrowLeft size={20} /></button>
        <div className="detail__hero-content">
          <Badge variant="primary">{opp.type}</Badge>
          <h1 className="detail__hero-title">{opp.title}</h1>
          <p className="detail__hero-org">{opp.organization}</p>
        </div>
      </div>

      {/* Quick Info Cards */}
      <div className="detail__info-grid">
        {[
          { icon: Building2, label: 'Type', value: opp.type },
          { icon: MapPin, label: 'Location', value: opp.location },
          { icon: Calendar, label: 'Deadline', value: formatDate(opp.deadline), color: getDeadlineColor(opp.deadline) },
          { icon: GraduationCap, label: 'Level', value: opp.educationLevel },
        ].map((item, i) => (
          <div key={i} className="detail__info-card">
            <item.icon size={20} style={{ color: item.color || 'var(--color-primary)' }} />
            <span className="detail__info-label">{item.label}</span>
            <span className="detail__info-value" style={item.color ? { color: item.color } : {}}>{item.value}</span>
          </div>
        ))}
      </div>

      {/* Match Analysis */}
      <div className="detail__section">
        <h2 className="detail__section-title">Your Match Score</h2>
        <div className="detail__match-card">
          <MatchBadge percentage={opp.matchPercentage} size="lg" />
          <p className="detail__match-text">
            {opp.matchPercentage >= 80 ? "Great match! You meet most requirements." :
             opp.matchPercentage >= 50 ? "Good potential. A few things to work on." :
             "Some preparation needed. Check what's missing below."}
          </p>
          <div className="detail__match-reasons">
            {metReasons.length > 0 && (
              <div className="detail__match-col">
                <h4 className="detail__match-heading" style={{ color: 'var(--color-success)' }}>Why you match:</h4>
                {metReasons.map((r, i) => (
                  <div key={i} className="detail__match-item detail__match-item--met">
                    <span className="detail__match-icon detail__match-icon--met"><Check size={12} /></span>
                    <span>{r.text}</span>
                  </div>
                ))}
              </div>
            )}
            {missingReasons.length > 0 && (
              <div className="detail__match-col">
                <h4 className="detail__match-heading" style={{ color: 'var(--color-error)' }}>What you're missing:</h4>
                {missingReasons.map((r, i) => (
                  <div key={i} className="detail__match-item detail__match-item--missing">
                    <span className="detail__match-icon detail__match-icon--missing"><XIcon size={12} /></span>
                    <span>{r.text}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          {opp.matchPercentage < 100 && (
            <div className="detail__build-skills" onClick={() => navigate('/learn')}>
              <div>
                <strong>Build Missing Skills</strong>
                <p style={{ margin: '4px 0 0', fontSize: 'var(--text-xs)', opacity: 0.9 }}>We have a learning roadmap to help you qualify</p>
              </div>
              <ChevronRight size={20} />
            </div>
          )}
        </div>
      </div>

      {/* Requirements */}
      <div className="detail__section">
        <h2 className="detail__section-title">Requirements</h2>
        <Card variant="elevated">
          <div className="card-body">
            <ul className="detail__list">
              {opp.requirements?.map((req, i) => (
                <li key={i} className="detail__list-item"><span className="detail__bullet">•</span>{req}</li>
              ))}
            </ul>
          </div>
        </Card>
      </div>

      {/* Required Documents */}
      <div className="detail__section">
        <h2 className="detail__section-title">Required Documents</h2>
        <Card variant="elevated">
          <div className="card-body">
            {opp.requiredDocuments?.map((doc, i) => (
              <div key={i} className="detail__doc-item">
                <FileText size={16} style={{ color: 'var(--color-primary)', flexShrink: 0 }} />
                <span>{doc}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Application Steps */}
      <div className="detail__section">
        <h2 className="detail__section-title">How to Apply</h2>
        <Card variant="elevated">
          <div className="card-body">
            {opp.applicationSteps?.map((step, i) => (
              <div key={i} className="detail__step">
                <span className="detail__step-num">{i + 1}</span>
                <span className="detail__step-text">{step}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Benefits */}
      {opp.benefits && (
        <div className="detail__section">
          <h2 className="detail__section-title">Benefits</h2>
          <div className="detail__benefits">
            {opp.benefits.map((b, i) => (
              <span key={i} className="detail__benefit-tag"><Sparkles size={12} /> {b}</span>
            ))}
          </div>
        </div>
      )}

      {/* Spacer for fixed footer */}
      <div style={{ height: 80 }} />

      {/* Fixed Footer */}
      <div className="detail__footer">
        <button className="detail__footer-btn" onClick={() => app.toggleSave(opp.id)} aria-label={isSaved ? 'Unsave' : 'Save'}>
          {isSaved ? <BookmarkCheck size={22} style={{ color: 'var(--color-primary)' }} /> : <Bookmark size={22} />}
        </button>
        <button className="detail__footer-btn" aria-label="Share"><Share2 size={22} /></button>
        <Button variant="primary" size="lg" icon={ExternalLink} fullWidth>Apply Now</Button>
      </div>
    </div>
  );
}
