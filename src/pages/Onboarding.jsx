import { useState, useRef } from 'react';
import { useNavigate } from 'react-router';
import { ArrowRight, ChevronRight } from 'lucide-react';
import './Onboarding.css';

const slides = [
  { id: 1, emoji: '🗺️', title: 'Discover', heading: 'Find Scholarships & Jobs Tailored for You', description: 'Thousands of opportunities from NNPC, PTDF, Chevening, and more — matched to your profile.', color: '#6C5CE7' },
  { id: 2, emoji: '🧩', title: 'Match', heading: 'See Your Match Score', description: "Know exactly what you need to qualify. We show your match percentage and what's missing.", color: '#FF6B6B' },
  { id: 3, emoji: '📚', title: 'Grow', heading: 'Build Skills at Your Own Pace', description: 'Learning roadmaps, test prep, and CV builders. No pressure, just progress.', color: '#00CEC9' },
  { id: 4, emoji: '🤝', title: 'Connect', heading: 'Join the Community', description: 'Connect with mentors, scholarship alumni, and peers across Nigeria.', color: '#FDCB6E' },
];

export default function Onboarding() {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);
  const navigate = useNavigate();
  const touchRef = useRef({ startX: 0 });

  const goTo = (index) => {
    setDirection(index > current ? 1 : -1);
    setCurrent(index);
  };
  const next = () => current < slides.length - 1 ? goTo(current + 1) : finish();
  const finish = () => navigate('/auth', { replace: true });

  const handleTouchStart = (e) => { touchRef.current.startX = e.touches[0].clientX; };
  const handleTouchEnd = (e) => {
    const diff = touchRef.current.startX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) { diff > 0 ? next() : current > 0 && goTo(current - 1); }
  };

  const slide = slides[current];

  return (
    <div className="onboarding" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
      <div className="onboarding__header">
        <button className="onboarding__skip" onClick={finish}>Skip</button>
      </div>

      <div className="onboarding__slide" key={slide.id}>
        <div className="onboarding__illustration" style={{ background: `${slide.color}15`, borderColor: `${slide.color}30` }}>
          <span className="onboarding__emoji">{slide.emoji}</span>
        </div>
        <span className="onboarding__badge" style={{ background: `${slide.color}20`, color: slide.color }}>{slide.title}</span>
        <h2 className="onboarding__heading">{slide.heading}</h2>
        <p className="onboarding__description">{slide.description}</p>
      </div>

      <div className="onboarding__footer">
        <div className="onboarding__dots">
          {slides.map((_, i) => (
            <button key={i} className={`onboarding__dot ${i === current ? 'onboarding__dot--active' : ''}`}
              style={i === current ? { background: slide.color } : {}} onClick={() => goTo(i)} aria-label={`Slide ${i + 1}`} />
          ))}
        </div>
        <button className="onboarding__next-btn" onClick={next} style={{ background: slide.color }}>
          {current === slides.length - 1 ? 'Get Started' : 'Next'}
          {current < slides.length - 1 ? <ChevronRight size={18} /> : <ArrowRight size={18} />}
        </button>
      </div>
    </div>
  );
}
