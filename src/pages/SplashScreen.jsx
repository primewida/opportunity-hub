import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import './SplashScreen.css';

export default function SplashScreen() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 400);
    const t2 = setTimeout(() => setPhase(2), 900);
    const t3 = setTimeout(() => navigate('/onboarding', { replace: true }), 2600);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [navigate]);

  return (
    <div className="splash">
      <div className="splash__glow" />
      <div className="splash__content">
        <div className={`splash__logo ${phase >= 0 ? 'splash__logo--visible' : ''}`}>
          <svg viewBox="0 0 120 120" className="splash__logo-svg">
            <circle cx="60" cy="62" r="32" fill="none" stroke="white" strokeWidth="3.5" opacity="0.9"/>
            <polygon points="60,18 32,35 60,28 88,35" fill="white" opacity="0.95"/>
            <line x1="60" y1="18" x2="60" y2="36" stroke="white" strokeWidth="2" opacity="0.9"/>
            <rect x="80" y="33" width="2" height="10" fill="white" opacity="0.8"/>
            <circle cx="81" cy="44" r="2.5" fill="white" opacity="0.8"/>
            <line x1="60" y1="92" x2="60" y2="102" stroke="rgba(253,203,110,0.8)" strokeWidth="2.5" strokeLinecap="round"/>
            <line x1="46" y1="96" x2="40" y2="104" stroke="rgba(253,203,110,0.6)" strokeWidth="2" strokeLinecap="round"/>
            <line x1="74" y1="96" x2="80" y2="104" stroke="rgba(253,203,110,0.6)" strokeWidth="2" strokeLinecap="round"/>
            <line x1="36" y1="88" x2="28" y2="92" stroke="rgba(253,203,110,0.4)" strokeWidth="1.5" strokeLinecap="round"/>
            <line x1="84" y1="88" x2="92" y2="92" stroke="rgba(253,203,110,0.4)" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </div>
        <h1 className={`splash__title ${phase >= 1 ? 'splash__title--visible' : ''}`}>
          Opportunity<span>Hub</span>
        </h1>
        <p className={`splash__subtitle ${phase >= 1 ? 'splash__subtitle--visible' : ''}`}>
          Your path to every opportunity
        </p>
        <div className={`splash__loader ${phase >= 2 ? 'splash__loader--visible' : ''}`}>
          <div className="splash__spinner" />
        </div>
      </div>
    </div>
  );
}
