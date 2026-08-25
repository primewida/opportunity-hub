import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useApp } from '../context/AppContext';
import { onboarding, categories as catApi } from '../services/api';
import { 
  NIGERIAN_STATES, 
  EDUCATION_LEVELS, 
  NIGERIAN_UNIVERSITIES, 
  NIGERIAN_SECONDARY_SCHOOLS, 
  NIGERIAN_PRIMARY_SCHOOLS, 
  NYSC_STATUSES, 
  INTEREST_TAGS 
} from '../utils/constants';
import Button from '../components/ui/Button';
import { ProgressBar } from '../components/ui';
import { ArrowRight, ArrowLeft, Check, School, GraduationCap, BookOpen, Award } from 'lucide-react';
import './ProfileSetup.css';

const steps = ['Basic Info', 'Education', 'School & Details', 'Interests'];

const GENDER_OPTIONS = [
  { value: 'Male', label: 'Male', icon: '👨' },
  { value: 'Female', label: 'Female', icon: '👩' },
  { value: 'Prefer not to say', label: 'Prefer not to say', icon: '✨' },
];

export default function ProfileSetup() {
  const navigate = useNavigate();
  const app = useApp();
  const { completeProfile } = app;
  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [form, setForm] = useState(() => ({
    name: app.user ? `${app.user.firstName || ''} ${app.user.lastName || ''}`.trim() : '',
    dob: app.user?.dateOfBirth ? new Date(app.user.dateOfBirth).toISOString().split('T')[0] : '',
    gender: app.user?.gender || '',
    education: app.user?.educationLevel || 'undergraduate',
    state: app.user?.stateOfOrigin || app.user?.currentState || '',
    location: app.user?.currentCity || '',
    institution: app.user?.institutionName || '',
    course: app.user?.courseOfStudy || '',
    cgpa: app.user?.cgpa !== undefined && app.user?.cgpa !== null ? String(app.user.cgpa) : '',
    jamb: app.user?.jambScore !== undefined && app.user?.jambScore !== null ? String(app.user.jambScore) : '',
    waec: app.user?.waecStatus || 'Completed',
    nysc: app.user?.nyscStatus || '',
    interests: Array.isArray(app.user?.interests) ? app.user.interests.map(i => i.name || i) : []
  }));

  const set = (k, v) => setForm((prev) => ({ ...prev, [k]: v }));
  const toggleInterest = (tag) => set('interests', form.interests.includes(tag) ? form.interests.filter(t => t !== tag) : [...form.interests, tag]);

  const eduLower = (form.education || '').toLowerCase();
  const isPrimary = eduLower.includes('primary');
  const isSecondary = eduLower.includes('jss') || eduLower.includes('sss') || eduLower.includes('secondary');
  const isTertiary = !isPrimary && !isSecondary;

  const canProceed = () => {
    if (step === 0) return form.name && form.gender;
    if (step === 1) return form.education;
    if (step === 2) return form.state;
    if (step === 3) return form.interests.length >= 3;
    return true;
  };

  const finish = async () => { 
    setIsSubmitting(true);
    try {
      const [firstName, ...rest] = (form.name || '').split(' ');
      const lastName = rest.join(' ') || firstName;
      const profileData = {
        firstName,
        lastName,
        dateOfBirth: form.dob || undefined,
        gender: form.gender || undefined,
        educationLevel: form.education || undefined,
        stateOfOrigin: form.state || undefined,
        currentState: form.state || undefined,
        currentCity: form.location || undefined,
        institutionName: form.institution || undefined,
        courseOfStudy: form.course || undefined,
        cgpa: form.cgpa ? parseFloat(form.cgpa) : undefined,
        jambScore: form.jamb ? parseInt(form.jamb) : undefined,
        waecStatus: form.waec || undefined,
        nyscStatus: form.nysc || undefined,
        onboardingCompleted: true
      };

      await onboarding.updateProfile(profileData).catch(e => console.warn('Profile update warning:', e));
      if (form.interests && form.interests.length > 0) {
        await onboarding.setInterests(form.interests).catch(() => {});
      }
      await onboarding.complete().catch(() => {});
    } catch (err) {
      console.error('Onboarding API error:', err);
    }
    completeProfile(form); 
    navigate('/', { replace: true });
  };

  return (
    <div className="profile-setup">
      <div className="profile-setup__progress-card">
        <div className="profile-setup__steps-header">
          <span className="profile-setup__step-badge">Step {step + 1} of {steps.length}</span>
          <span className="profile-setup__step-name">{steps[step]}</span>
        </div>
        <ProgressBar progress={((step + 1) / steps.length) * 100} size="sm" />
      </div>

      <div className="profile-setup__content">
        {step === 0 && (
          <div className="profile-setup__step animate-fadeInUp" key="s0">
            <h2 className="profile-setup__title">Let's get to know you 👋</h2>
            <p className="profile-setup__desc">Tell us a bit about yourself to customize your opportunities</p>
            <div className="profile-setup__fields">
              <div className="input-group">
                <label className="profile-setup__label">Full Name</label>
                <input className="input" placeholder="e.g. Adaeze Okafor" value={form.name} onChange={e => set('name', e.target.value)} />
              </div>
              <div className="input-group">
                <label className="profile-setup__label">Date of Birth</label>
                <input className="input" type="date" value={form.dob} onChange={e => set('dob', e.target.value)} />
              </div>
              <div className="input-group">
                <label className="profile-setup__label">Gender</label>
                <div className="profile-setup__gender-grid">
                  {GENDER_OPTIONS.map(g => (
                    <button
                      key={g.value}
                      type="button"
                      className={`profile-setup__gender-card ${form.gender === g.value ? 'profile-setup__gender-card--active' : ''}`}
                      onClick={() => set('gender', g.value)}
                    >
                      <span className="profile-setup__gender-icon">{g.icon}</span>
                      <span className="profile-setup__gender-text">{g.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="profile-setup__step animate-fadeInUp" key="s1">
            <h2 className="profile-setup__title">Your Education 🎓</h2>
            <p className="profile-setup__desc">Select your current educational level to discover matching grants, scholarships, and competitions</p>
            <div className="profile-setup__fields">
              <div className="input-group">
                <label className="profile-setup__label">Current Educational Level</label>
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
            <h2 className="profile-setup__title">
              {isPrimary ? 'Primary School & Location 🏫' : isSecondary ? 'Secondary School & Location 🎒' : 'Academic Institution & Location 🇳🇬'}
            </h2>
            <p className="profile-setup__desc">
              {isPrimary ? 'Tell us your primary school and state to discover kid/junior competitions and scholarships' : 
               isSecondary ? 'Tell us your secondary school, class, and state for WAEC/NECO grants and high school awards' : 
               'Help us match you with university, state-of-origin, and tertiary opportunities'}
            </p>
            
            <div className="profile-setup__fields">
              <div className="input-group">
                <label className="profile-setup__label">State of Origin</label>
                <select className="input" value={form.state} onChange={e => set('state', e.target.value)}>
                  <option value="">Select state</option>
                  {NIGERIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div className="input-group">
                <label className="profile-setup__label">Current Location / State</label>
                <select className="input" value={form.location} onChange={e => set('location', e.target.value)}>
                  <option value="">Select state</option>
                  {NIGERIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              {/* 1. PRIMARY SCHOOL VIEW */}
              {isPrimary && (
                <>
                  <div className="input-group">
                    <label className="profile-setup__label">Primary School Name</label>
                    <input 
                      className="input" 
                      list="primary-schools" 
                      placeholder="Type or search your primary school (e.g. Corona Primary School)..." 
                      value={form.institution} 
                      onChange={e => set('institution', e.target.value)} 
                    />
                    <datalist id="primary-schools">
                      {NIGERIAN_PRIMARY_SCHOOLS.map(s => <option key={s} value={s} />)}
                    </datalist>
                    <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '4px', display: 'block' }}>
                      💡 You can pick from the list or type your primary school name freely if it's not listed.
                    </span>
                  </div>

                  <div className="input-group">
                    <label className="profile-setup__label">Current Class / Level</label>
                    <input 
                      className="input" 
                      placeholder="e.g. Primary 5, Primary 6 (Common Entrance)" 
                      value={form.course} 
                      onChange={e => set('course', e.target.value)} 
                    />
                  </div>
                </>
              )}

              {/* 2. SECONDARY SCHOOL (JSS / SSS) VIEW */}
              {isSecondary && (
                <>
                  <div className="input-group">
                    <label className="profile-setup__label">Secondary School / College Name</label>
                    <input 
                      className="input" 
                      list="secondary-schools" 
                      placeholder="Type or search your secondary school (e.g. King's College Lagos, FGC)..." 
                      value={form.institution} 
                      onChange={e => set('institution', e.target.value)} 
                    />
                    <datalist id="secondary-schools">
                      {NIGERIAN_SECONDARY_SCHOOLS.map(s => <option key={s} value={s} />)}
                    </datalist>
                    <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '4px', display: 'block' }}>
                      💡 You can select a school or type your secondary school name freely if not on the list.
                    </span>
                  </div>

                  <div className="input-group">
                    <label className="profile-setup__label">Class & Department / Track</label>
                    <input 
                      className="input" 
                      placeholder="e.g. SS2 Science, SS3 Commercial, JSS 3" 
                      value={form.course} 
                      onChange={e => set('course', e.target.value)} 
                    />
                  </div>

                  <div className="input-group">
                    <label className="profile-setup__label">WAEC / NECO / BECE Exam Status</label>
                    <select className="input" value={form.waec} onChange={e => set('waec', e.target.value)}>
                      <option value="Preparing">Preparing / Enrolled for Exams</option>
                      <option value="Completed">Completed / Awaiting Results</option>
                      <option value="Not Applicable">Not Applicable</option>
                    </select>
                  </div>
                </>
              )}

              {/* 3. TERTIARY / UNIVERSITY VIEW */}
              {isTertiary && (
                <>
                  <div className="input-group">
                    <label className="profile-setup__label">University / Tertiary Institution</label>
                    <input 
                      className="input" 
                      list="universities" 
                      placeholder="Type or search your university / polytechnic..." 
                      value={form.institution} 
                      onChange={e => set('institution', e.target.value)} 
                    />
                    <datalist id="universities">
                      {NIGERIAN_UNIVERSITIES.map(u => <option key={u} value={u} />)}
                    </datalist>
                    <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '4px', display: 'block' }}>
                      💡 You can pick from suggestions or type any university / polytechnic freely.
                    </span>
                  </div>

                  <div className="input-group">
                    <label className="profile-setup__label">Course of Study</label>
                    <input 
                      className="input" 
                      placeholder="e.g. Computer Science, Medicine, Accounting" 
                      value={form.course} 
                      onChange={e => set('course', e.target.value)} 
                    />
                  </div>

                  <div className="profile-setup__row">
                    <div className="input-group">
                      <label className="profile-setup__label">CGPA (optional)</label>
                      <input className="input" type="number" step="0.01" min="0" max="5" placeholder="e.g. 3.7" value={form.cgpa} onChange={e => set('cgpa', e.target.value)} />
                    </div>
                    <div className="input-group">
                      <label className="profile-setup__label">JAMB Score (optional)</label>
                      <input className="input" type="number" min="0" max="400" placeholder="e.g. 312" value={form.jamb} onChange={e => set('jamb', e.target.value)} />
                    </div>
                  </div>

                  <div className="input-group">
                    <label className="profile-setup__label">NYSC Status</label>
                    <select className="input" value={form.nysc} onChange={e => set('nysc', e.target.value)}>
                      <option value="">Select status</option>
                      {NYSC_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </>
              )}
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
