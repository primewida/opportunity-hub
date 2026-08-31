import { useState, useEffect } from 'react';
import { faq } from '../services/api';
import { Card, Accordion, SearchBar, Button } from '../components/ui';
import { HelpCircle, MessageCircle, Mail, ExternalLink } from 'lucide-react';
import './Help.css';

// Removed inline faqData
export default function Help() {
  const [search, setSearch] = useState('');
  const [allFaqs, setAllFaqs] = useState([]);
  const [faqData, setFaqData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    faq.getAll().then(res => {
      // Map API array to the format used by JSX
      const mappedFaqs = res.map(f => ({ q: f.question, a: f.answer, category: f.category }));
      setAllFaqs(mappedFaqs);

      // Group by category for the normal view
      const grouped = mappedFaqs.reduce((acc, curr) => {
        if (!acc[curr.category]) acc[curr.category] = [];
        acc[curr.category].push(curr);
        return acc;
      }, {});
      
      const structuredData = Object.keys(grouped).map(cat => ({
        category: cat,
        items: grouped[cat]
      }));
      setFaqData(structuredData);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const q = (typeof search === 'string' ? search : (search?.target?.value ?? String(search ?? ''))).toLowerCase().trim();
  const filtered = q ? allFaqs.filter(f => (typeof f.q === 'string' && f.q.toLowerCase().includes(q)) || (typeof f.a === 'string' && f.a.toLowerCase().includes(q))) : null;

  if (loading) return <div className="help">Loading...</div>;

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
