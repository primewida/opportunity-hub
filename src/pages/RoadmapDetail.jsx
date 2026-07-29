import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { ArrowLeft, Clock, Users, CheckCircle, BookOpen, Play, FileText, HelpCircle, ExternalLink } from 'lucide-react';
import { Stepper, ProgressBar, Modal, Button, Badge } from '../components/ui';
import { roadmaps } from '../services/api';
import './RoadmapDetail.css';

const typeIcons = { video: Play, article: FileText, quiz: HelpCircle, external: ExternalLink };
const typeLabels = { video: 'Video Lesson', article: 'Article', quiz: 'Practice Quiz', external: 'External Resource' };

export default function RoadmapDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [roadmap, setRoadmap] = useState(null);
  const [steps, setSteps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [activeStep, setActiveStep] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    roadmaps.getById(id).then(res => {
      const data = res.data || res;
      setRoadmap(data);
      setSteps(data.steps || []);
      setLoading(false);
    }).catch(err => {
      setError(err);
      setLoading(false);
    });
  }, [id]);

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading roadmap...</div>;
  if (error || !roadmap) {
    return (
      <div className="roadmap-detail">
        <button className="roadmap-detail__back" onClick={() => navigate('/learn')}>
          <ArrowLeft size={20} /> Back
        </button>
        <div className="roadmap-detail__not-found">
          <h2>Roadmap not found</h2>
          <p>The roadmap you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  const completedCount = steps.filter((s) => s.completed).length;
  const totalSteps = steps.length;
  const progress = totalSteps > 0 ? Math.round((completedCount / totalSteps) * 100) : 0;

  const remainingSteps = steps.filter((s) => !s.completed);
  const estimatedTimeRemaining = remainingSteps.reduce((acc, s) => {
    const mins = parseInt(s.duration) || 0;
    return acc + mins;
  }, 0);

  const formatTime = (mins) => {
    if (mins < 60) return `${mins} mins`;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  };

  const handleStepClick = (step, index) => {
    if (step.locked) return;
    setActiveStep({ ...step, index });
    setShowModal(true);
  };

  const handleMarkComplete = () => {
    if (!activeStep) return;
    setSteps((prev) => {
      const updated = prev.map((s, i) => {
        if (i === activeStep.index) return { ...s, completed: true };
        // Unlock the next step
        if (i === activeStep.index + 1) return { ...s, locked: false };
        return s;
      });
      return updated;
    });
    setShowModal(false);
    setActiveStep(null);
  };

  const StepIcon = activeStep ? (typeIcons[activeStep.type] || FileText) : FileText;

  return (
    <div className="roadmap-detail">
      {/* Back button */}
      <button className="roadmap-detail__back" onClick={() => navigate('/learn')}>
        <ArrowLeft size={20} /> Back to Roadmaps
      </button>

      {/* Header */}
      <div className="roadmap-detail__header">
        <div className="roadmap-detail__header-icon">{roadmap.icon}</div>
        <div className="roadmap-detail__header-info">
          <Badge variant="primary" size="sm">{roadmap.category}</Badge>
          <h1 className="roadmap-detail__title">{roadmap.title}</h1>
          <p className="roadmap-detail__desc">{roadmap.description}</p>
          <div className="roadmap-detail__header-meta">
            <span className="roadmap-detail__meta-item">
              <Clock size={15} /> {roadmap.estimatedWeeks} weeks
            </span>
            <span className="roadmap-detail__meta-item">
              <Users size={15} /> {roadmap.enrolledCount?.toLocaleString() || 0} enrolled
            </span>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="roadmap-detail__stats-row">
        <div className="roadmap-detail__stat-card">
          <div className="roadmap-detail__stat-icon"><CheckCircle size={20} /></div>
          <div className="roadmap-detail__stat-info">
            <span className="roadmap-detail__stat-value">{completedCount}/{totalSteps}</span>
            <span className="roadmap-detail__stat-label">Steps Completed</span>
          </div>
        </div>
        <div className="roadmap-detail__stat-card">
          <div className="roadmap-detail__stat-icon"><Clock size={20} /></div>
          <div className="roadmap-detail__stat-info">
            <span className="roadmap-detail__stat-value">{formatTime(estimatedTimeRemaining)}</span>
            <span className="roadmap-detail__stat-label">Time Remaining</span>
          </div>
        </div>
        <div className="roadmap-detail__stat-card">
          <div className="roadmap-detail__stat-icon"><BookOpen size={20} /></div>
          <div className="roadmap-detail__stat-info">
            <span className="roadmap-detail__stat-value">{progress}%</span>
            <span className="roadmap-detail__stat-label">Complete</span>
          </div>
        </div>
      </div>

      {/* Overall Progress */}
      <div className="roadmap-detail__progress">
        <ProgressBar progress={progress} label="Overall Progress" showPercentage />
      </div>

      {/* Steps Timeline */}
      <div className="roadmap-detail__steps">
        <h2 className="roadmap-detail__steps-title">Learning Path</h2>
        <Stepper steps={steps} onStepClick={handleStepClick} />
      </div>

      {/* Step Content Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={activeStep?.title || 'Step Content'}>
        {activeStep && (
          <div className="roadmap-detail__modal-content">
            <div className="roadmap-detail__modal-type">
              <StepIcon size={18} />
              <span>{typeLabels[activeStep.type] || activeStep.type}</span>
              <span className="roadmap-detail__modal-duration">{activeStep.duration}</span>
            </div>
            <p className="roadmap-detail__modal-desc">{activeStep.description}</p>

            <div className="roadmap-detail__modal-sim">
              <div className="roadmap-detail__modal-sim-icon">
                <StepIcon size={32} strokeWidth={1.5} />
              </div>
              <p>Content would load here in the full application.</p>
              <span className="roadmap-detail__modal-sim-label">
                {activeStep.type === 'video' && '▶ Video Player'}
                {activeStep.type === 'article' && '📄 Article Reader'}
                {activeStep.type === 'quiz' && '✍️ Quiz Interface'}
                {activeStep.type === 'external' && '🔗 External Link'}
              </span>
            </div>

            <div className="roadmap-detail__modal-actions">
              {activeStep.completed ? (
                <Badge variant="success">✓ Completed</Badge>
              ) : (
                <Button variant="primary" onClick={handleMarkComplete}>
                  <CheckCircle size={16} /> Mark as Complete
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
