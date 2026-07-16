import { useState } from 'react';
import { Card, Accordion, SearchBar, Button } from '../components/ui';
import { HelpCircle, MessageCircle, Mail, ExternalLink } from 'lucide-react';
import './Help.css';

const faqData = [
  { category: 'Getting Started', items: [
    { q: 'How do I create an account?', a: 'Tap "Get Started" on the welcome screen, then choose to sign up with your email, phone number, or Google/Apple account. You\'ll need to verify your identity via OTP.' },
    { q: 'How does the match percentage work?', a: 'We analyze your profile (education level, field of study, location, skills, interests) against each opportunity\'s requirements. The match percentage shows how well you fit. You can also see which requirements you meet and which you still need to build.' },
    { q: 'Is OpportunityHub free?', a: 'Yes! OpportunityHub is completely free for students. We\'re committed to making opportunities accessible to every Nigerian student.' },
  ]},
  { category: 'Opportunities', items: [
    { q: 'How often are new opportunities added?', a: 'We add new opportunities daily. Enable notifications to get alerts when new opportunities matching your profile are posted.' },
    { q: 'Can I apply directly through the app?', a: 'For most opportunities, we provide a direct link to the official application portal. Some opportunities may support in-app applications in the future.' },
    { q: 'What types of opportunities are available?', a: 'Scholarships, grants, internships, fellowships, competitions, jobs, NYSC placements, and more — covering local and international opportunities for Nigerian students.' },
  ]},
  { category: 'Learning & Career Tools', items: [
    { q: 'How do learning roadmaps work?', a: 'Roadmaps are curated step-by-step learning paths. Each includes videos, articles, quizzes, and external courses. Complete steps to track your progress and build skills.' },
    { q: 'Can I export my CV as PDF?', a: 'Yes! Build your CV using our ATS-friendly templates, preview it in real-time, and export as a professionally formatted PDF.' },
    { q: 'Are the test prep questions from real exams?', a: 'Our questions are modeled after real exam patterns (JAMB, Post-UTME, GRE, IELTS, etc.) but are not actual exam questions. They\'re designed to help you practice effectively.' },
  ]},
  { category: 'Account & Privacy', items: [
    { q: 'How is my data protected?', a: 'All personal data is encrypted and stored securely. Documents in the vault use end-to-end encryption. We never share your data with third parties without your consent.' },
    { q: 'Can I delete my account?', a: 'Yes. Go to Settings → Account → Delete Account. All your data will be permanently removed within 30 days.' },
  ]},
];

export default function Help() {
  const [search, setSearch] = useState('');
  const allFaqs = faqData.flatMap(c => c.items.map(i => ({ ...i, category: c.category })));
  const filtered = search ? allFaqs.filter(f => f.q.toLowerCase().includes(search.toLowerCase()) || f.a.toLowerCase().includes(search.toLowerCase())) : null;

  return (
    <div className="help">
      <div className="help__hero">
        <HelpCircle size={40} style={{ color: 'var(--color-primary)' }} />
        <h1 className="help__title">How can we help?</h1>
        <p className="help__subtitle">Search our FAQ or contact our support team</p>
      </div>

      <SearchBar value={search} onChange={setSearch} onClear={() => setSearch('')} placeholder="Search for answers..." />

      {filtered ? (
        <div className="help__results">
          <p className="help__results-count">{filtered.length} result{filtered.length !== 1 ? 's' : ''} found</p>
          {filtered.map((f, i) => (
            <Accordion key={i} title={f.q} subtitle={f.category}>
              <p className="help__answer">{f.a}</p>
            </Accordion>
          ))}
        </div>
      ) : (
        faqData.map((cat, ci) => (
          <div key={ci} className="help__category">
            <h2 className="help__cat-title">{cat.category}</h2>
            {cat.items.map((item, ii) => (
              <Accordion key={ii} title={item.q}>
                <p className="help__answer">{item.a}</p>
              </Accordion>
            ))}
          </div>
        ))
      )}

      <Card variant="elevated">
        <div className="card-body help__contact">
          <h2 className="help__contact-title">Still need help?</h2>
          <p className="help__contact-text">Our support team is available Monday–Friday, 9AM–6PM WAT</p>
          <div className="help__contact-actions">
            <Button variant="primary" icon={MessageCircle}>Live Chat</Button>
            <Button variant="outline" icon={Mail}>Email Support</Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
