import { useNavigate } from 'react-router';
import { useApp } from '../context/AppContext';
import { OPPORTUNITIES } from '../data/mockData';
import { Card, Badge, Button, EmptyState } from '../components/ui';
import { Bookmark, Clock, MapPin, Trash2 } from 'lucide-react';
import { daysUntilDeadline, getDeadlineColor } from '../utils/helpers';
import './SavedOpportunities.css';

export default function SavedOpportunities() {
  const navigate = useNavigate();
  const app = useApp();
  const savedIds = app.savedOpportunities || [];
  const saved = OPPORTUNITIES.filter(o => savedIds.includes(o.id));

  return (
    <div className="saved">
      <div className="saved__header">
        <h1 className="saved__title">🔖 Saved Opportunities</h1>
        <p className="saved__subtitle">{saved.length} opportunities saved</p>
      </div>
      {saved.length === 0 ? (
        <EmptyState title="No saved opportunities" description="Bookmark opportunities you're interested in and they'll appear here" icon="🔖" />
      ) : (
        <div className="saved__list">
          {saved.map(opp => {
            const days = daysUntilDeadline(opp.deadline);
            return (
              <Card key={opp.id} variant="interactive" onClick={() => navigate(`/opportunity/${opp.id}`)}>
                <div className="card-body saved__card">
                  <div className="saved__card-logo">{opp.organization?.charAt(0) || 'O'}</div>
                  <div className="saved__card-info">
                    <h3 className="saved__card-title">{opp.title}</h3>
                    <p className="saved__card-org">{opp.organization}</p>
                    <div className="saved__card-meta">
                      <span><MapPin size={12} /> {opp.location}</span>
                      <span style={{ color: getDeadlineColor(days) }}><Clock size={12} /> {days > 0 ? `${days} days left` : 'Expired'}</span>
                    </div>
                    <div className="saved__card-tags">
                      <Badge variant={opp.type === 'Scholarship' ? 'primary' : opp.type === 'Internship' ? 'success' : 'info'}>{opp.type}</Badge>
                      <Badge variant="success">{opp.matchPercentage || 85}% Match</Badge>
                    </div>
                  </div>
                  <button className="saved__remove" onClick={e => { e.stopPropagation(); app.dispatch({ type: 'TOGGLE_SAVED', payload: opp.id }); }} title="Remove">
                    <Trash2 size={16} />
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
