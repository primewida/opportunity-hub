import { useState } from 'react';
import { Card, Button, TabBar, Badge } from '../components/ui';
import { FileText, Upload, Star, Eye, MessageSquare } from 'lucide-react';
import './ReviewSystem.css';

const mockSubmissions = [
  { id: 'sub-1', type: 'CV', title: 'Professional CV v3', submittedAt: '2026-06-25', status: 'Reviewed', rating: 4, feedback: 'Strong layout and clear structure. Consider adding more quantifiable achievements in your experience section. Your skills section is well-organized.' },
  { id: 'sub-2', type: 'Essay', title: 'Chevening Leadership Essay', submittedAt: '2026-06-28', status: 'Pending', rating: null, feedback: null },
  { id: 'sub-3', type: 'Cover Letter', title: 'Flutterwave Application Letter', submittedAt: '2026-06-20', status: 'Reviewed', rating: 3, feedback: 'Good opening paragraph. The body needs more specific examples of your technical skills. Closing could be stronger — include a clear call to action.' },
];

const mockReviewQueue = [
  { id: 'rev-1', type: 'CV', title: 'Data Analyst Resume', author: 'Emeka N.', submittedAt: '2026-06-29' },
  { id: 'rev-2', type: 'Essay', title: 'PTDF Motivation Letter', author: 'Fatima A.', submittedAt: '2026-06-29' },
  { id: 'rev-3', type: 'Cover Letter', title: 'Andela Application', author: 'Tunde B.', submittedAt: '2026-06-28' },
];

const rubricItems = [
  { id: 'r1', label: 'Clarity & Structure', description: 'Is the document well-organized and easy to follow?' },
  { id: 'r2', label: 'Relevance', description: 'Does the content align with the target opportunity?' },
  { id: 'r3', label: 'Impact & Evidence', description: 'Are achievements quantified and impactful?' },
  { id: 'r4', label: 'Grammar & Style', description: 'Is the writing professional and error-free?' },
];

export default function ReviewSystem() {
  const [activeTab, setActiveTab] = useState(0);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [selectedReview, setSelectedReview] = useState(null);
  const [reviewScores, setReviewScores] = useState({});
  const [reviewComment, setReviewComment] = useState('');

  const tabs = [
    { label: 'My Submissions', icon: FileText },
    { label: 'Review Others', icon: Eye },
  ];

  const renderStars = (rating, interactive = false, onChange) => (
    <div className="review__stars">
      {[1, 2, 3, 4, 5].map(i => (
        <button key={i} className={`review__star ${i <= (rating || 0) ? 'review__star--filled' : ''}`}
          onClick={() => interactive && onChange?.(i)} disabled={!interactive}>
          <Star size={18} fill={i <= (rating || 0) ? 'var(--color-accent-amber)' : 'none'} />
        </button>
      ))}
    </div>
  );

  return (
    <div className="review">
      <div className="review__header">
        <h1 className="review__title">Peer Review</h1>
        <p className="review__subtitle">Get feedback on your documents or help others improve theirs</p>
      </div>

      <TabBar tabs={tabs} activeIndex={activeTab} onChange={setActiveTab} />

      {activeTab === 0 && (
        <div className="review__content">
          <button className="review__upload-card" onClick={() => {}}>
            <Upload size={28} style={{ color: 'var(--color-primary)' }} />
            <span className="review__upload-text">Submit a Document for Review</span>
            <span className="review__upload-hint">CV, Essay, or Cover Letter (PDF, DOC)</span>
          </button>

          <h3 className="review__section-title">Your Submissions</h3>
          {mockSubmissions.map(sub => (
            <Card key={sub.id} variant="interactive" onClick={() => setSelectedSubmission(selectedSubmission?.id === sub.id ? null : sub)}>
              <div className="card-body">
                <div className="review__submission">
                  <div className="review__submission-icon"><FileText size={20} /></div>
                  <div className="review__submission-info">
                    <h4 className="review__submission-title">{sub.title}</h4>
                    <div className="review__submission-meta">
                      <Badge variant={sub.type === 'CV' ? 'primary' : sub.type === 'Essay' ? 'info' : 'success'}>{sub.type}</Badge>
                      <span>Submitted {sub.submittedAt}</span>
                      <Badge variant={sub.status === 'Reviewed' ? 'success' : 'warning'}>{sub.status}</Badge>
                    </div>
                    {sub.rating && renderStars(sub.rating)}
                  </div>
                </div>
                {selectedSubmission?.id === sub.id && sub.feedback && (
                  <div className="review__feedback animate-fadeInUp">
                    <h5 className="review__feedback-title"><MessageSquare size={14} /> Reviewer Feedback</h5>
                    <p className="review__feedback-text">{sub.feedback}</p>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {activeTab === 1 && (
        <div className="review__content">
          <div className="review__ai-card">
            <span style={{ fontSize: 28 }}>✨</span>
            <div>
              <strong>AI Quick Review</strong>
              <p style={{ margin: '4px 0 0', fontSize: 'var(--text-xs)', opacity: 0.9 }}>Get instant feedback powered by AI analysis</p>
            </div>
            <Button variant="primary" size="sm">Try It</Button>
          </div>

          <h3 className="review__section-title">Review Queue</h3>
          {mockReviewQueue.map(item => (
            <Card key={item.id} variant="interactive" onClick={() => setSelectedReview(selectedReview?.id === item.id ? null : item)}>
              <div className="card-body">
                <div className="review__submission">
                  <div className="review__submission-icon"><FileText size={20} /></div>
                  <div className="review__submission-info">
                    <h4 className="review__submission-title">{item.title}</h4>
                    <div className="review__submission-meta">
                      <Badge variant="primary">{item.type}</Badge>
                      <span>by {item.author}</span>
                      <span>{item.submittedAt}</span>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">Review</Button>
                </div>
                {selectedReview?.id === item.id && (
                  <div className="review__rubric animate-fadeInUp">
                    <h5 className="review__feedback-title">Review Rubric</h5>
                    {rubricItems.map(r => (
                      <div key={r.id} className="review__rubric-item">
                        <div className="review__rubric-label">
                          <strong>{r.label}</strong>
                          <span>{r.description}</span>
                        </div>
                        {renderStars(reviewScores[r.id] || 0, true, (v) => setReviewScores(s => ({ ...s, [r.id]: v })))}
                      </div>
                    ))}
                    <textarea className="input review__comment" placeholder="Additional comments and suggestions..." value={reviewComment} onChange={e => setReviewComment(e.target.value)} rows={3} />
                    <Button variant="primary" fullWidth>Submit Review</Button>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
