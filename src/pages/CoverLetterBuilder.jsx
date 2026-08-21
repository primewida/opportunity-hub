import { useState, useEffect } from 'react';
import { ProgressBar, Button, Card } from '../components/ui';
import { opportunities } from '../services/api';
import { ArrowLeft, ArrowRight, Copy, Download, FileText, Check } from 'lucide-react';
import './CoverLetterBuilder.css';

const paragraphGuides = [
  { key: 'opening', label: 'Opening Paragraph', hint: 'Introduce yourself and state the opportunity you\'re applying for. Mention how you discovered it.', placeholder: 'Dear [Hiring Manager/Selection Committee],\n\nI am writing to express my interest in...' },
  { key: 'motivation', label: 'Why This Opportunity', hint: 'Explain why this specific opportunity excites you. Reference the organization\'s mission or values.', placeholder: 'I am particularly drawn to this opportunity because...' },
  { key: 'qualifications', label: 'Your Qualifications', hint: 'Highlight your key achievements, skills, and experiences that make you a strong candidate. Use specific examples.', placeholder: 'During my time at [institution/company], I...' },
  { key: 'contribution', label: 'What You\'ll Contribute', hint: 'Describe how you\'ll add value. What unique perspectives or skills will you bring?', placeholder: 'If selected, I intend to contribute by...' },
  { key: 'closing', label: 'Closing Paragraph', hint: 'Summarize your enthusiasm, mention attached documents, and include a clear call to action.', placeholder: 'I am confident that my background and passion make me a strong candidate. I have attached my CV and...' },
];

export default function CoverLetterBuilder() {
  const [step, setStep] = useState(0);
  const [selectedOpp, setSelectedOpp] = useState('');
  const [paragraphs, setParagraphs] = useState({ opening: '', motivation: '', qualifications: '', contribution: '', closing: '' });
  const [copied, setCopied] = useState(false);
  const [opps, setOpps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    opportunities.getAll()
      .then(data => {
        setOpps(data || []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const opp = opps.find(o => o.id === selectedOpp);
  const totalSteps = 3;
  const canNext = step === 0 ? !!selectedOpp : step === 1 ? Object.values(paragraphs).some(p => p.trim()) : true;

  const getFullLetter = () => {
    const today = new Date().toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' });
    return `${today}\n\n${opp?.organization || 'Organization'}\n\nRe: Application for ${opp?.title || 'the Opportunity'}\n\n${paragraphs.opening}\n\n${paragraphs.motivation}\n\n${paragraphs.qualifications}\n\n${paragraphs.contribution}\n\n${paragraphs.closing}\n\nYours sincerely,\n[Your Name]`;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getFullLetter()).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  };

  return (
    <div className="cover-letter">
      <div className="cover-letter__header">
        <h1 className="cover-letter__title"><FileText size={24} /> Cover Letter Builder</h1>
        <p className="cover-letter__subtitle">Create a compelling cover letter tailored to your target opportunity</p>
      </div>

      <div className="cover-letter__progress">
        <div className="cover-letter__steps">
          {['Select Opportunity', 'Write Content', 'Preview & Export'].map((s, i) => (
            <div key={i} className={`cover-letter__step-dot ${i === step ? 'active' : ''} ${i < step ? 'done' : ''}`}>
              {i < step ? <Check size={14} /> : i + 1}
            </div>
          ))}
        </div>
        <ProgressBar progress={((step + 1) / totalSteps) * 100} />
      </div>

      <div className="cover-letter__content">
        {step === 0 && (
          <div className="cover-letter__step animate-fadeInUp">
            <h2 className="cover-letter__step-title">Which opportunity are you applying to?</h2>
            <p className="cover-letter__step-desc">Select the opportunity to auto-fill context and tailor your letter</p>
            <select className="input cover-letter__select" value={selectedOpp} onChange={e => setSelectedOpp(e.target.value)}>
              <option value="">Choose an opportunity...</option>
              {loading ? <option value="">Loading...</option> : opps.map(o => <option key={o.id} value={o.id}>{o.title} — {o.organization}</option>)}
            </select>
            {opp && (
              <Card variant="elevated">
                <div className="card-body cover-letter__opp-preview">
                  <h3>{opp.title}</h3>
                  <p>{opp.organization} · {opp.location}</p>
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', margin: '8px 0 0' }}>Deadline: {opp.deadline}</p>
                </div>
              </Card>
            )}
          </div>
        )}

        {step === 1 && (
          <div className="cover-letter__step animate-fadeInUp">
            <h2 className="cover-letter__step-title">Write Your Cover Letter</h2>
            <p className="cover-letter__step-desc">Fill in each section — the hints will guide you</p>
            <div className="cover-letter__paragraphs">
              {paragraphGuides.map((pg, i) => (
                <div key={pg.key} className="cover-letter__paragraph">
                  <div className="cover-letter__para-header">
                    <span className="cover-letter__para-num">{i + 1}</span>
                    <div>
                      <h4 className="cover-letter__para-label">{pg.label}</h4>
                      <p className="cover-letter__para-hint">{pg.hint}</p>
                    </div>
                  </div>
                  <textarea className="input cover-letter__textarea" rows={4} placeholder={pg.placeholder}
                    value={paragraphs[pg.key]} onChange={e => setParagraphs({ ...paragraphs, [pg.key]: e.target.value })} />
                  <span className="cover-letter__char-count">{(paragraphs[pg.key] || '').length} characters</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="cover-letter__step animate-fadeInUp">
            <h2 className="cover-letter__step-title">Preview Your Cover Letter</h2>
            <div className="cover-letter__preview-actions">
              <Button variant={copied ? 'success' : 'outline'} size="sm" icon={copied ? Check : Copy} onClick={handleCopy}>
                {copied ? 'Copied!' : 'Copy to Clipboard'}
              </Button>
              <Button variant="outline" size="sm" icon={Download} onClick={() => {
                const element = document.createElement("a");
                const file = new Blob([getFullLetter()], {type: 'text/plain'});
                element.href = URL.createObjectURL(file);
                element.download = `Cover_Letter_${opp?.organization || 'Application'}.txt`;
                document.body.appendChild(element);
                element.click();
                document.body.removeChild(element);
              }}>Download (.txt)</Button>
            </div>
            <div className="cover-letter__preview">
              <div className="cover-letter__paper">
                <p className="cover-letter__date">{new Date().toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                <p className="cover-letter__addressee">{opp?.organization || 'Organization'}</p>
                <p className="cover-letter__re"><strong>Re: Application for {opp?.title || 'the Opportunity'}</strong></p>
                {Object.entries(paragraphs).map(([key, text]) => (
                  text.trim() && <p key={key} className="cover-letter__body-para">{text}</p>
                ))}
                <p className="cover-letter__signoff">Yours sincerely,</p>
                <p className="cover-letter__name">[Your Name]</p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="cover-letter__nav">
        {step > 0 && <Button variant="ghost" icon={ArrowLeft} onClick={() => setStep(step - 1)}>Back</Button>}
        <div style={{ flex: 1 }} />
        {step < 2 ? (
          <Button variant="primary" icon={ArrowRight} disabled={!canNext} onClick={() => setStep(step + 1)}>Next</Button>
        ) : (
          <Button variant="primary" icon={Download} onClick={() => window.print()}>Print / Export as PDF</Button>
        )}
      </div>
    </div>
  );
}
