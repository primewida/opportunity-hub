import React, { useState, useEffect } from 'react';
import { cv } from '../services/api';
import { TabBar, Card, Button, Badge } from '../components/ui';
import './CVBuilder.css';

const TABS = [
  { id: 'templates', label: 'Templates' },
  { id: 'builder', label: 'Builder' },
  { id: 'preview', label: 'Preview' }
];

const TEMPLATE_COLORS = {
  professional: ['#6C5CE7', '#A29BFE'],
  academic: ['#00CEC9', '#55EFC4'],
  tech: ['#FF6B6B', '#FF8E8E'],
  banking: ['#FDCB6E', '#F8B500']
};

const emptyEducation = { institution: '', degree: '', year: '', gpa: '' };
const emptyExperience = { company: '', role: '', dates: '', description: '' };
const emptyReference = { name: '', title: '', email: '' };

export default function CVBuilder() {
  const [activeTab, setActiveTab] = useState('templates');
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [cvTemplates, setCvTemplates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cv.getTemplates()
      .then(data => {
        setCvTemplates(data || []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  /* ── Builder state ── */
  const [personal, setPersonal] = useState({
    name: '',
    email: '',
    phone: '',
    location: ''
  });
  const [summary, setSummary] = useState('');
  const [education, setEducation] = useState([{ ...emptyEducation }]);
  const [experience, setExperience] = useState([{ ...emptyExperience }]);
  const [skills, setSkills] = useState([]);
  const [skillInput, setSkillInput] = useState('');
  const [references, setReferences] = useState([{ ...emptyReference }]);

  /* ── Helpers ── */
  const updatePersonal = (key, value) =>
    setPersonal((prev) => ({ ...prev, [key]: value }));

  const updateListItem = (setter, index, key, value) =>
    setter((prev) => prev.map((item, i) => (i === index ? { ...item, [key]: value } : item)));

  const addListItem = (setter, empty) => setter((prev) => [...prev, { ...empty }]);
  const removeListItem = (setter, index) =>
    setter((prev) => prev.filter((_, i) => i !== index));

  const addSkill = () => {
    const trimmed = skillInput.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills((prev) => [...prev, trimmed]);
    }
    setSkillInput('');
  };

  const removeSkill = (skill) => setSkills((prev) => prev.filter((s) => s !== skill));

  const handleSkillKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSkill();
    }
  };

  const selectTemplate = (template) => {
    setSelectedTemplate(template);
    setActiveTab('builder');
  };

  /* ── Render helpers ── */
  const renderTemplates = () => (
    <div className="cv-templates-grid">
      {loading ? <p>Loading templates...</p> : cvTemplates.map((tpl) => {
        const colors = TEMPLATE_COLORS[tpl.style] || TEMPLATE_COLORS.professional;
        return (
          <Card key={tpl.id} className="cv-template-card">
            <div
              className="cv-template-card__preview"
              style={{
                background: `linear-gradient(135deg, ${colors[0]}, ${colors[1]})`
              }}
            >
              <div className="cv-template-card__lines">
                <div className="cv-template-line cv-template-line--title" />
                <div className="cv-template-line cv-template-line--subtitle" />
                <div className="cv-template-line" />
                <div className="cv-template-line" />
                <div className="cv-template-line cv-template-line--short" />
              </div>
            </div>
            <div className="cv-template-card__info">
              <h3>{tpl.name}</h3>
              <p>{tpl.description}</p>
              <Button size="sm" onClick={() => selectTemplate(tpl)}>
                Use Template
              </Button>
            </div>
          </Card>
        );
      })}
    </div>
  );

  const renderFormInput = (label, value, onChange, type = 'text', placeholder = '') => (
    <div className="cv-form__field">
      <label className="cv-form__label">{label}</label>
      <input
        type={type}
        className="cv-form__input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );

  const renderBuilder = () => (
    <div className="cv-builder-form">
      {selectedTemplate && (
        <div className="cv-builder-form__template-badge">
          Using: <Badge>{selectedTemplate.name}</Badge>
        </div>
      )}

      {/* Personal */}
      <Card className="cv-form-section">
        <h3 className="cv-form-section__title">👤 Personal Information</h3>
        <div className="cv-form-section__grid">
          {renderFormInput('Full Name', personal.name, (v) => updatePersonal('name', v), 'text', 'Adaeze Okafor')}
          {renderFormInput('Email', personal.email, (v) => updatePersonal('email', v), 'email', 'adaeze@email.com')}
          {renderFormInput('Phone', personal.phone, (v) => updatePersonal('phone', v), 'tel', '+234 800 000 0000')}
          {renderFormInput('Location', personal.location, (v) => updatePersonal('location', v), 'text', 'Lagos, Nigeria')}
        </div>
      </Card>

      {/* Summary */}
      <Card className="cv-form-section">
        <h3 className="cv-form-section__title">📝 Professional Summary</h3>
        <textarea
          className="cv-form__textarea"
          rows={4}
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          placeholder="Write a brief summary of your professional background, key skills, and career objectives..."
        />
      </Card>

      {/* Education */}
      <Card className="cv-form-section">
        <h3 className="cv-form-section__title">🎓 Education</h3>
        {education.map((edu, i) => (
          <div key={i} className="cv-form-section__item">
            <div className="cv-form-section__grid">
              {renderFormInput('Institution', edu.institution, (v) => updateListItem(setEducation, i, 'institution', v), 'text', 'University of Lagos')}
              {renderFormInput('Degree', edu.degree, (v) => updateListItem(setEducation, i, 'degree', v), 'text', 'BSc Computer Science')}
              {renderFormInput('Year', edu.year, (v) => updateListItem(setEducation, i, 'year', v), 'text', '2022 - 2026')}
              {renderFormInput('GPA', edu.gpa, (v) => updateListItem(setEducation, i, 'gpa', v), 'text', '4.5 / 5.0')}
            </div>
            {education.length > 1 && (
              <button className="cv-form__remove-btn" onClick={() => removeListItem(setEducation, i)}>
                ✕ Remove
              </button>
            )}
          </div>
        ))}
        <button className="cv-form__add-btn" onClick={() => addListItem(setEducation, emptyEducation)}>
          + Add Education
        </button>
      </Card>

      {/* Experience */}
      <Card className="cv-form-section">
        <h3 className="cv-form-section__title">💼 Experience</h3>
        {experience.map((exp, i) => (
          <div key={i} className="cv-form-section__item">
            <div className="cv-form-section__grid">
              {renderFormInput('Company', exp.company, (v) => updateListItem(setExperience, i, 'company', v), 'text', 'Flutterwave')}
              {renderFormInput('Role', exp.role, (v) => updateListItem(setExperience, i, 'role', v), 'text', 'Software Engineer Intern')}
              {renderFormInput('Dates', exp.dates, (v) => updateListItem(setExperience, i, 'dates', v), 'text', 'Jun 2025 - Aug 2025')}
            </div>
            <div className="cv-form__field cv-form__field--full">
              <label className="cv-form__label">Description</label>
              <textarea
                className="cv-form__textarea"
                rows={3}
                value={exp.description}
                onChange={(e) => updateListItem(setExperience, i, 'description', e.target.value)}
                placeholder="Describe your responsibilities and achievements..."
              />
            </div>
            {experience.length > 1 && (
              <button className="cv-form__remove-btn" onClick={() => removeListItem(setExperience, i)}>
                ✕ Remove
              </button>
            )}
          </div>
        ))}
        <button className="cv-form__add-btn" onClick={() => addListItem(setExperience, emptyExperience)}>
          + Add Experience
        </button>
      </Card>

      {/* Skills */}
      <Card className="cv-form-section">
        <h3 className="cv-form-section__title">🛠 Skills</h3>
        <div className="cv-form__skills-input-row">
          <input
            type="text"
            className="cv-form__input"
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            onKeyDown={handleSkillKeyDown}
            placeholder="Type a skill and press Enter..."
          />
          <Button size="sm" variant="outline" onClick={addSkill}>
            Add
          </Button>
        </div>
        {skills.length > 0 && (
          <div className="cv-form__skills-chips">
            {skills.map((skill) => (
              <span key={skill} className="cv-skill-chip">
                {skill}
                <button className="cv-skill-chip__remove" onClick={() => removeSkill(skill)}>
                  ✕
                </button>
              </span>
            ))}
          </div>
        )}
      </Card>

      {/* References */}
      <Card className="cv-form-section">
        <h3 className="cv-form-section__title">📋 References</h3>
        {references.map((ref, i) => (
          <div key={i} className="cv-form-section__item">
            <div className="cv-form-section__grid">
              {renderFormInput('Name', ref.name, (v) => updateListItem(setReferences, i, 'name', v), 'text', 'Dr. Adaeze Obi')}
              {renderFormInput('Title', ref.title, (v) => updateListItem(setReferences, i, 'title', v), 'text', 'Senior Lecturer, UNILAG')}
              {renderFormInput('Email', ref.email, (v) => updateListItem(setReferences, i, 'email', v), 'email', 'obi@unilag.edu.ng')}
            </div>
            {references.length > 1 && (
              <button className="cv-form__remove-btn" onClick={() => removeListItem(setReferences, i)}>
                ✕ Remove
              </button>
            )}
          </div>
        ))}
        <button className="cv-form__add-btn" onClick={() => addListItem(setReferences, emptyReference)}>
          + Add Reference
        </button>
      </Card>

      {/* Actions */}
      <div className="cv-builder-actions">
        <Button variant="outline" onClick={() => setActiveTab('preview')}>
          Preview CV
        </Button>
        <Button onClick={() => setActiveTab('preview')}>
          Continue →
        </Button>
      </div>
    </div>
  );

  const renderPreview = () => (
    <div className="cv-preview-wrapper">
      <div className="cv-preview">
        {/* Header */}
        <div className="cv-preview__header">
          <h1 className="cv-preview__name">
            {personal.name || 'Your Name'}
          </h1>
          <div className="cv-preview__contact">
            {personal.email && <span>{personal.email}</span>}
            {personal.phone && <span>{personal.phone}</span>}
            {personal.location && <span>{personal.location}</span>}
          </div>
        </div>

        {/* Summary */}
        {summary && (
          <div className="cv-preview__section">
            <h2 className="cv-preview__section-title">Professional Summary</h2>
            <p className="cv-preview__text">{summary}</p>
          </div>
        )}

        {/* Education */}
        {education.some((e) => e.institution) && (
          <div className="cv-preview__section">
            <h2 className="cv-preview__section-title">Education</h2>
            {education
              .filter((e) => e.institution)
              .map((edu, i) => (
                <div key={i} className="cv-preview__entry">
                  <div className="cv-preview__entry-header">
                    <strong>{edu.degree || 'Degree'}</strong>
                    <span className="cv-preview__entry-date">{edu.year}</span>
                  </div>
                  <div className="cv-preview__entry-sub">
                    {edu.institution}
                    {edu.gpa && <span> — GPA: {edu.gpa}</span>}
                  </div>
                </div>
              ))}
          </div>
        )}

        {/* Experience */}
        {experience.some((e) => e.company) && (
          <div className="cv-preview__section">
            <h2 className="cv-preview__section-title">Experience</h2>
            {experience
              .filter((e) => e.company)
              .map((exp, i) => (
                <div key={i} className="cv-preview__entry">
                  <div className="cv-preview__entry-header">
                    <strong>{exp.role || 'Role'}</strong>
                    <span className="cv-preview__entry-date">{exp.dates}</span>
                  </div>
                  <div className="cv-preview__entry-sub">{exp.company}</div>
                  {exp.description && (
                    <p className="cv-preview__text">{exp.description}</p>
                  )}
                </div>
              ))}
          </div>
        )}

        {/* Skills */}
        {skills.length > 0 && (
          <div className="cv-preview__section">
            <h2 className="cv-preview__section-title">Skills</h2>
            <div className="cv-preview__skills">
              {skills.map((skill) => (
                <span key={skill} className="cv-preview__skill-tag">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* References */}
        {references.some((r) => r.name) && (
          <div className="cv-preview__section">
            <h2 className="cv-preview__section-title">References</h2>
            {references
              .filter((r) => r.name)
              .map((ref, i) => (
                <div key={i} className="cv-preview__entry">
                  <strong>{ref.name}</strong>
                  {ref.title && <div className="cv-preview__entry-sub">{ref.title}</div>}
                  {ref.email && (
                    <div className="cv-preview__entry-sub" style={{ color: 'var(--color-primary)' }}>
                      {ref.email}
                    </div>
                  )}
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Export Actions */}
      <div className="cv-preview-actions">
        <Button variant="outline" onClick={() => setActiveTab('builder')}>
          ← Edit
        </Button>
        <Button>📄 Export PDF</Button>
        <Button variant="secondary">📤 Submit for Review</Button>
      </div>
    </div>
  );

  return (
    <div className="cv-builder-page">
      <div className="cv-builder-header">
        <h1>CV Builder</h1>
        <p className="cv-builder-header__subtitle">
          Create a professional CV tailored for your dream opportunity
        </p>
      </div>

      <TabBar tabs={TABS} activeTab={activeTab} onChange={setActiveTab} />

      <div className="cv-builder-content">
        {activeTab === 'templates' && renderTemplates()}
        {activeTab === 'builder' && renderBuilder()}
        {activeTab === 'preview' && renderPreview()}
      </div>
    </div>
  );
}
