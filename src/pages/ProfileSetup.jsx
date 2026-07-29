import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useApp } from '../context/AppContext';
import { onboarding, categories as catApi } from '../services/api';
import { NIGERIAN_STATES, EDUCATION_LEVELS, NIGERIAN_UNIVERSITIES, NYSC_STATUSES, INTEREST_TAGS } from '../utils/constants';
import Button from '../components/ui/Button';
import { ProgressBar } from '../components/ui';
import { ArrowRight, ArrowLeft, Check } from 'lucide-react';
import './ProfileSetup.css';

const steps = ['Basic Info', 'Education', 'Details', 'Interests'];

export default function ProfileSetup() {
  const navigate = useNavigate();
  const { completeProfile } = useApp();
  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({ name: '', dob: '', gender: '', education: '', state: '', location: '', institution: '', course: '', cgpa: '', jamb: '', waec: 'Completed', nysc: '', interests: [] });
  const set = (k, v) => setForm({ ...form, [k]: v });
  const toggleInterest = (tag) => set('interests', form.interests.includes(tag) ? form.interests.filter(t => t !== tag) : [...form.interests, tag]);

  const canProceed = () => {
    if (step === 0) return form.name && form.dob && form.gender;
    if (step === 1) return form.education;
    if (step === 2) return form.state;
    if (step === 3) return form.interests.length >= 3;
    return true;
  };

  const finish = async () => { 
    setIsSubmitting(true);
    try {
      await onboarding.updateProfile(form);
      await onboarding.complete();
      completeProfile(form); 
      navigate('/', { replace: true });
    } catch (err) {
      console.error('Failed to complete onboarding:', err);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="profile-setup">
      <div className="profile-setup__progress">
        <div className="profile-setup__steps-label">
          <span className="profile-setup__step-num">Step {step + 1} of {steps.length}</span>
          <span className="profile-setup__step-name">{steps[step]}</span>
        </div>
        <ProgressBar progress={((step + 1) / steps.length) * 100} />
      </div>

      <div className="profile-setup__content">
        {step === 0 && (
          <div className="profile-setup__step animate-fadeInUp" key="s0">
            <h2 className="profile-setup__title">Let's get to know you 👋</h2>
            <p className="profile-setup__desc">Tell us a bit about yourself</p>
            <div className="profile-setup__fields">
              <div className="input-group"><label className="profile-setup__label">Full Name</label><input className="input" placeholder="e.g. Adaeze Okafor" value={form.name} onChange={e => set('name', e.target.value)} /></div>
              <div className="input-group"><label className="profile-setup__label">Date of Birth</label><input className="input" type="date" value={form.dob} onChange={e => set('dob', e.target.value)} /></div>
              <div className="input-group"><label className="profile-setup__label">Gender</label>
                <div className="profile-setup__radios">
                  {['Male', 'Female', 'Prefer not to say'].map(g => (
                    <label key={g} className={`profile-setup__radio ${form.gender === g ? 'active' : ''}`}>
                      <input type="radio" name="gender" value={g} checked={form.gender === g} onChange={() => set('gender', g)} />{g}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="profile-setup__step animate-fadeInUp" key="s1">
            <h2 className="profile-setup__title">Your Education 🎓</h2>
            <p className="profile-setup__desc">This helps us find the right opportunities for you</p>
            <div className="profile-setup__fields">
              <div className="input-group"><label className="profile-setup__label">Education Level</label>
                <select className="input" value={form.education} onChange={e => set('education', e.target.value)}>
                  <option value="">Select your level</option>
                  {EDUCATION_LEVELS.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
                </select>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="profile-setup__step animate-fadeInUp" key="s2">
            <h2 className="profile-setup__title">Nigerian Specifics 🇳🇬</h2>
            <p className="profile-setup__desc">Help us match you with location-specific opportunities</p>
            <div className="profile-setup__fields">
              <div className="input-group"><label className="profile-setup__label">State of Origin</label>
                <select className="input" value={form.state} onChange={e => set('state', e.target.value)}>
                  <option value="">Select state</option>
                  {NIGERIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="input-group"><label className="profile-setup__label">Current Location</label>
                <select className="input" value={form.location} onChange={e => set('location', e.target.value)}>
                  <option value="">Select state</option>
                  {NIGERIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="input-group"><label className="profile-setup__label">Institution</label>
                <input className="input" list="universities" placeholder="Search university..." value={form.institution} onChange={e => set('institution', e.target.value)} />
                <datalist id="universities">{NIGERIAN_UNIVERSITIES.map(u => <option key={u} value={u} />)}</datalist>
              </div>
              <div className="input-group"><label className="profile-setup__label">Course of Study</label><input className="input" placeholder="e.g. Computer Science" value={form.course} onChange={e => set('course', e.target.value)} /></div>
              <div className="profile-setup__row">
                <div className="input-group"><label className="profile-setup__label">CGPA (optional)</label><input className="input" type="number" step="0.01" min="0" max="5" placeholder="e.g. 3.7" value={form.cgpa} onChange={e => set('cgpa', e.target.value)} /></div>
                <div className="input-group"><label className="profile-setup__label">JAMB Score</label><input className="input" type="number" min="0" max="400" placeholder="e.g. 312" value={form.jamb} onChange={e => set('jamb', e.target.value)} /></div>
              </div>
              <div className="input-group"><label className="profile-setup__label">NYSC Status</label>
                <select className="input" value={form.nysc} onChange={e => set('nysc', e.target.value)}>
                  <option value="">Select status</option>
                  {NYSC_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="profile-setup__step animate-fadeInUp" key="s3">
            <h2 className="profile-setup__title">Your Interests ✨</h2>
            <p className="profile-setup__desc">Select at least 3 interests to personalize your feed</p>
            <div className="profile-setup__chips">
              {INTEREST_TAGS.map(tag => (
                <button key={tag} className={`chip ${form.interests.includes(tag) ? 'chip-active' : ''}`} onClick={() => toggleInterest(tag)}>
                  {form.interests.includes(tag) && <Check size={14} />}{tag}
                </button>
              ))}
            </div>
            <p className="profile-setup__chip-count">{form.interests.length} selected (min 3)</p>
          </div>
        )}
      </div>

      <div className="profile-setup__actions">
        {step > 0 && <Button variant="ghost" onClick={() => setStep(step - 1)} icon={ArrowLeft} disabled={isSubmitting}>Back</Button>}
        <div style={{ flex: 1 }} />
        {step < 3 ? (
          <Button variant="primary" onClick={() => setStep(step + 1)} disabled={!canProceed() || isSubmitting} icon={ArrowRight}>Next</Button>
        ) : (
          <Button variant="primary" onClick={finish} disabled={!canProceed() || isSubmitting} icon={Check}>
            {isSubmitting ? 'Saving...' : 'Complete Setup'}
          </Button>
        )}
      </div>
    </div>
  );
}
