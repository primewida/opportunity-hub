import { Check, Lock, Play, FileText, HelpCircle, ExternalLink } from 'lucide-react';
import './Stepper.css';

const typeIcons = { video: Play, article: FileText, quiz: HelpCircle, external: ExternalLink };

export default function Stepper({ steps = [], onStepClick }) {
  return (
    <div className="stepper">
      {steps.map((step, i) => {
        const Icon = typeIcons[step.type] || FileText;
        const status = step.completed ? 'completed' : step.locked ? 'locked' : step.active !== false && !step.locked ? 'active' : 'default';
        return (
          <div key={step.id || i} className={`stepper__step stepper__step--${status}`}
            onClick={() => !step.locked && onStepClick?.(step, i)}>
            {i < steps.length - 1 && <div className="stepper__line" />}
            <div className="stepper__indicator">
              {step.completed ? <Check size={14} /> : step.locked ? <Lock size={14} /> : <Icon size={14} />}
            </div>
            <div className="stepper__content">
              <h4 className="stepper__title">{step.title}</h4>
              {step.description && <p className="stepper__desc">{step.description}</p>}
              <div className="stepper__meta">
                <span className="badge badge-neutral" style={{ fontFamily: 'var(--font-accent)' }}>{step.type}</span>
                {step.duration && <span className="stepper__duration">{step.duration}</span>}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
