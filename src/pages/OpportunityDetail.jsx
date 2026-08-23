import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router';
import { ArrowLeft, Bookmark, BookmarkCheck, Share2, ExternalLink, Check, X as XIcon, Calendar, MapPin, Building2, GraduationCap, FileText, ChevronRight, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { MatchBadge, Button, Badge, Card, ProgressBar } from '../components/ui';
import { opportunities } from '../services/api';
import { formatDate, getDeadlineColor, getDeadlineText, daysUntilDeadline } from '../utils/helpers';
import './OpportunityDetail.css';

export default function OpportunityDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const app = useApp();
  const [showSticky, setShowSticky] = useState(false);
  const heroRef = useRef(null);
  
  const [opp, setOpp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const isSaved = app.savedOpportunities?.includes(id);

  useEffect(() => {
    opportunities.getById(id).then(res => {
      const raw = res.data || res;
      // Robust parser for JSON strings, arrays, or objects
      const parseJSON = (val) => {
        if (Array.isArray(val)) return val;
        if (typeof val === 'string') {
          try {
            const p = JSON.parse(val);
            if (Array.isArray(p)) return p;
            if (typeof p === 'string') return [p];
            return [];
          } catch {
            return [val];
          }
        }
        return [];
      };

      // Robust parser for Requirements & Eligibility Criteria
      const parseRequirements = (criteria, rawReqs, oppData) => {
        const list = [];
        
        // 1. If explicit requirements array is passed
        if (Array.isArray(rawReqs) && rawReqs.length > 0) return rawReqs;
        if (typeof rawReqs === 'string') {
          try {
            const parsed = JSON.parse(rawReqs);
            if (Array.isArray(parsed) && parsed.length > 0) return parsed;
          } catch (e) {}
        }

        // 2. Parse eligibilityCriteria (object, array, or string)
        let parsedCriteria = criteria;
        if (typeof criteria === 'string') {
          try {
            parsedCriteria = JSON.parse(criteria);
          } catch (e) {
            parsedCriteria = criteria;
          }
        }

        if (Array.isArray(parsedCriteria) && parsedCriteria.length > 0) {
          return parsedCriteria;
        }

        if (parsedCriteria && typeof parsedCriteria === 'object') {
          if (parsedCriteria.eligibility_summary) {
            list.push(parsedCriteria.eligibility_summary);
          }
          if (parsedCriteria.education_level && Array.isArray(parsedCriteria.education_level)) {
            list.push(`Academic Level: Open to ${parsedCriteria.education_level.join(', ')} students and graduates.`);
          } else if (oppData?.educationLevel) {
            list.push(`Academic Level: Open to ${oppData.educationLevel} applicants.`);
          }
          if (parsedCriteria.nationality) {
            list.push(`Nationality / Region: Open to ${parsedCriteria.nationality} citizens and residents.`);
          }
          if (parsedCriteria.min_cgpa) {
            list.push(`Minimum Academic Standing: Minimum CGPA of ${parsedCriteria.min_cgpa} / 5.0 (or Second Class Upper / 2:1 equivalent).`);
          }
          if (parsedCriteria.field_of_study) {
            list.push(`Target Disciplines: ${parsedCriteria.field_of_study}`);
          } else if (oppData?.fieldOfStudy) {
            list.push(`Target Disciplines: ${oppData.fieldOfStudy} and related academic programs.`);
          }
          if (parsedCriteria.age_limit) {
            list.push(`Age Requirement: ${parsedCriteria.age_limit}`);
          }
        }

        // 3. If still empty or partial, supplement with metadata
        if (list.length === 0) {
          if (oppData?.educationLevel) {
            list.push(`Target Academic Standing: Open to ${oppData.educationLevel} applicants.`);
          }
          if (oppData?.location) {
            list.push(`Location Eligibility: Open to candidates applying from or studying in ${oppData.location}.`);
          }
          if (oppData?.fieldOfStudy) {
            list.push(`Eligible Fields of Study: ${oppData.fieldOfStudy} and allied disciplines.`);
          }
          list.push('Must possess accredited academic certificates, transcripts, or valid student identification.');
          list.push('Must complete and submit the official application form with all required attachments before the stated deadline.');
        }

        return list;
      };

      const parseSteps = (val) => {
        if (Array.isArray(val)) return val;
        if (typeof val === 'string') {
          try {
            const p = JSON.parse(val);
            if (Array.isArray(p)) return p;
            return val.split(/\n|(?:\d+\.\s*)/).map(s => s.trim()).filter(Boolean);
          } catch {
            return val.split(/\n|(?:\d+\.\s*)/).map(s => s.trim()).filter(Boolean);
          }
        }
        return ['1. Access the official application portal using the Apply button below.', '2. Register or log in to the host platform.', '3. Fill in applicant biodata and academic history.', '4. Upload required transcripts and documentation.', '5. Review and submit before the deadline.'];
      };

      // Map backend field names to what JSX expects
      setOpp({
        ...raw,
        type: raw.type || raw.opportunityType || '',
        organization: raw.organization || raw.provider || '',
        requirements: parseRequirements(raw.eligibilityCriteria, raw.requirements, raw),
        requiredDocuments: parseJSON(raw.requiredDocuments).length > 0 ? parseJSON(raw.requiredDocuments) : ['Curriculum Vitae (CV) / Resume', 'Academic Transcripts / Statement of Results', 'Valid Government ID / Student Identification', 'Statement of Purpose / Motivation Letter'],
        applicationSteps: parseSteps(raw.applicationSteps),
        benefits: parseJSON(raw.benefits).length > 0 ? parseJSON(raw.benefits) : ['Full or Partial Financial Funding Support', 'Career Mentorship & Global Network Access', 'Official Certificate / Recognition Award'],
        tags: parseJSON(raw.tags),
        matchReasons: raw.matchReasons || [],
      });
      setLoading(false);
    }).catch(err => {
      setError(err);
      setLoading(false);
    });
  }, [id]);

  useEffect(() => {
    const handleScroll = () => { setShowSticky(window.scrollY > 260); };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading opportunity...</div>;
  if (error || !opp) return (
    <div style={{ padding: 'var(--space-2xl)', textAlign: 'center' }}>
      <h2>Opportunity not found</h2>
      <Button variant="primary" onClick={() => navigate('/discover')}>Browse Opportunities</Button>
    </div>
  );

  const days = daysUntilDeadline(opp.deadline);
  const metReasons = opp.matchReasons?.filter(r => r.met) || [];
  const missingReasons = opp.matchReasons?.filter(r => !r.met) || [];

  const handleApply = () => {
    const url = opp.applicationLink || opp.applyUrl || opp.sourceUrl;
    if (url) window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: opp?.title || 'Opportunity on OpportunityHub',
        text: `Check out this opportunity: ${opp?.title} by ${opp?.organization || opp?.provider}`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  const applyUrl = opp.applicationLink || opp.applyUrl || opp.sourceUrl || '#';

  // Soften bright banner colors for better dark mode readability
  const bannerBg = opp.bannerColor
    ? `linear-gradient(135deg, ${opp.bannerColor}88, ${opp.bannerColor}44)`
    : 'var(--gradient-primary)';

  return (
    <div className="detail">
      {/* Sticky Header */}
      <div className={`detail__sticky ${showSticky ? 'detail__sticky--visible' : ''}`}>
        <h3 className="detail__sticky-title">{opp.title}</h3>
        <a 
          href={applyUrl} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="btn btn-primary btn-sm"
          style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
        >
          <ExternalLink size={14} /> Apply Now
        </a>
      </div>

      {/* Hero */}
      <div className="detail__hero" ref={heroRef} style={{ background: bannerBg }}>
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
          <MatchBadge percentage={opp.matchPercentage || 0} size="lg" />
          <p className="detail__match-text">
            {(opp.matchPercentage || 0) >= 80 ? "Great match! You meet most requirements." :
             (opp.matchPercentage || 0) >= 50 ? "Good potential. A few things to work on." :
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
          {(opp.matchPercentage || 0) < 100 && (
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
        <div className="detail__footer-container">
          <button className="detail__footer-btn" onClick={() => app.toggleSave(opp.id)} aria-label={isSaved ? 'Unsave' : 'Save'} title={isSaved ? 'Unsave' : 'Save'}>
            {isSaved ? <BookmarkCheck size={22} style={{ color: 'var(--color-primary)' }} /> : <Bookmark size={22} />}
          </button>
          <button className="detail__footer-btn" aria-label="Share" title="Share" onClick={handleShare}>
            <Share2 size={22} />
          </button>
          <a 
            href={applyUrl} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="btn btn-primary btn-lg"
            style={{ flex: 1, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
          >
            <ExternalLink size={20} /> Apply Now
          </a>
        </div>
      </div>
    </div>
  );
}
