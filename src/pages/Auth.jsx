import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { Eye, EyeOff, Phone, Mail, ArrowRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import Button from '../components/ui/Button';
import './Auth.css';

const GOOGLE_CLIENT_ID = '792079578960-ldu7vu26ao2vqicbu3sfn3eeh78h6ibi.apps.googleusercontent.com';

export default function Auth() {
  const navigate = useNavigate();
  const { login, register, googleLogin } = useApp();
  const [mode, setMode] = useState('login');
  const [method, setMethod] = useState('email');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [name, setName] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '']);
  const [timer, setTimer] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const otpRefs = [useRef(), useRef(), useRef(), useRef()];
  const googleBtnContainerRef = useRef(null);

  const handleGoogleCredentialResponse = useCallback(async (response) => {
    if (!response?.credential) return;
    setLoading(true);
    setError('');
    try {
      const profile = await googleLogin({ credential: response.credential });
      if (profile?.onboardingCompleted) {
        navigate('/', { replace: true });
      } else {
        navigate('/profile-setup', { replace: true });
      }
    } catch (err) {
      setError(err.message || 'Google authentication failed');
    } finally {
      setLoading(false);
    }
  }, [googleLogin, navigate]);

  // Initialize official Google Identity Services using Authorized JavaScript Origin
  const initGsi = useCallback(() => {
    if (!window.google?.accounts?.id) return;
    try {
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleGoogleCredentialResponse,
        auto_select: false,
        cancel_on_tap_outside: false,
      });

      // Render official Google button
      if (googleBtnContainerRef.current) {
        googleBtnContainerRef.current.innerHTML = '';
        window.google.accounts.id.renderButton(googleBtnContainerRef.current, {
          theme: 'outline',
          size: 'large',
          width: 320,
          text: 'continue_with',
          shape: 'rectangular',
        });
      }

      // Display Google One-Tap account prompt
      window.google.accounts.id.prompt();
    } catch (e) {
      console.warn('GSI init notice:', e);
    }
  }, [handleGoogleCredentialResponse]);

  useEffect(() => {
    if (window.google?.accounts?.id) {
      initGsi();
    } else {
      const interval = setInterval(() => {
        if (window.google?.accounts?.id) {
          clearInterval(interval);
          initGsi();
        }
      }, 200);
      return () => clearInterval(interval);
    }
  }, [initGsi]);

  useEffect(() => {
    if (timer > 0) {
      const t = setTimeout(() => setTimer(timer - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [timer]);

  const handleOtpChange = (val, idx) => {
    const newOtp = [...otp];
    newOtp[idx] = val.slice(-1);
    setOtp(newOtp);
    if (val && idx < 3) otpRefs[idx + 1].current?.focus();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (method === 'phone' && !otpSent) {
      setOtpSent(true);
      setTimer(30);
      return;
    }
    setLoading(true);
    try {
      let profile;
      const cleanEmail = email.trim().toLowerCase();
      if (method === 'phone') {
        profile = await login('student@opportunityhub.ng', 'password123');
      } else if (mode === 'login') {
        profile = await login(cleanEmail, password);
      } else {
        const cleanName = name.trim();
        const [firstName, ...rest] = cleanName.split(' ');
        const lastName = rest.join(' ') || firstName || 'Scholar';
        profile = await register({
          email: cleanEmail,
          password,
          firstName: firstName || 'Scholar',
          lastName,
          educationLevel: 'Undergraduate'
        });
      }

      if (profile?.onboardingCompleted) {
        navigate('/', { replace: true });
      } else {
        navigate('/profile-setup', { replace: true });
      }
    } catch (err) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleTriggerGoogle = () => {
    setError('');
    if (window.google?.accounts?.id) {
      try {
        window.google.accounts.id.prompt();
        const nativeBtn = googleBtnContainerRef.current?.querySelector('div[role=button], button');
        if (nativeBtn) nativeBtn.click();
      } catch (e) {
        console.warn('Google prompt trigger:', e);
      }
    }
  };

  if (otpSent) {
    return (
      <div className="auth">
        <div className="auth__card animate-scaleIn">
          <button className="auth__back" onClick={() => setOtpSent(false)}>← Back</button>
          <h1 className="auth__title">Verify Your Number</h1>
          <p className="auth__subtitle">We sent a verification code to +234 {phone}</p>
          <form onSubmit={handleSubmit} className="auth__form">
            <div className="auth__otp-group">
              {otp.map((d, i) => (
                <input
                  key={i}
                  ref={otpRefs[i]}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={d}
                  onChange={e => handleOtpChange(e.target.value, i)}
                  className="auth__otp-input"
                  onKeyDown={e => e.key === 'Backspace' && !d && i > 0 && otpRefs[i - 1].current?.focus()}
                />
              ))}
            </div>
            <p className="auth__otp-timer">
              {timer > 0 ? `Resend code in ${timer}s` : <button type="button" className="auth__link" onClick={() => setTimer(30)}>Resend Code</button>}
            </p>
            <Button variant="primary" fullWidth loading={loading} type="submit">
              Verify & Continue <ArrowRight size={18} />
            </Button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="auth">
      <div className="auth__card animate-scaleIn">
        <div className="auth__logo">
          <svg viewBox="0 0 40 40" width="40" height="40">
            <circle cx="20" cy="22" r="12" fill="none" stroke="var(--color-primary)" strokeWidth="2.5"/>
            <polygon points="20,6 10,14 20,10 30,14" fill="var(--color-primary)"/>
          </svg>
        </div>
        <h1 className="auth__title">Welcome to OpportunityHub</h1>
        <p className="auth__subtitle">{mode === 'login' ? 'Log in to continue your journey' : 'Create your account to get started'}</p>

        {/* Official Google Sign-In Container */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 'var(--space-md)', width: '100%', minHeight: '44px' }}>
          <div ref={googleBtnContainerRef} style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
            <button className="auth__social-btn" type="button" onClick={handleTriggerGoogle} disabled={loading} style={{ width: '100%' }}>
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </button>
          </div>
        </div>

        <div className="auth__divider"><span>or</span></div>

        <div className="auth__method-toggle">
          <button className={`auth__method-btn ${method === 'email' ? 'active' : ''}`} onClick={() => setMethod('email')}>
            <Mail size={14} /> Email
          </button>
          <button className={`auth__method-btn ${method === 'phone' ? 'active' : ''}`} onClick={() => setMethod('phone')}>
            <Phone size={14} /> Phone
          </button>
        </div>

        <form onSubmit={handleSubmit} className="auth__form">
          {mode === 'signup' && (
            <div className="input-group">
              <label className="auth__label">Full Name</label>
              <input type="text" className="input" placeholder="Enter your full name" value={name} onChange={e => setName(e.target.value)} required />
            </div>
          )}
          {method === 'phone' ? (
            <div className="input-group">
              <label className="auth__label">Phone Number</label>
              <div className="auth__phone-wrapper">
                <span className="auth__phone-prefix">+234</span>
                <input type="tel" className="input auth__phone-input" placeholder="812 345 6789" value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))} required />
              </div>
            </div>
          ) : (
            <>
              <div className="input-group">
                <label className="auth__label">Email Address</label>
                <input type="email" className="input" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
              <div className="input-group">
                <label className="auth__label">Password</label>
                <div className="auth__pw-wrapper">
                  <input type={showPw ? 'text' : 'password'} className="input" placeholder="Enter password" value={password} onChange={e => setPassword(e.target.value)} required />
                  <button type="button" className="auth__pw-toggle" onClick={() => setShowPw(!showPw)}>
                    {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {mode === 'login' && <button type="button" className="auth__link auth__forgot">Forgot Password?</button>}
              </div>
            </>
          )}
          {error && <p className="auth__error" style={{ color: 'var(--color-error, #ef4444)', fontSize: '0.85rem', textAlign: 'center', margin: '0.5rem 0' }}>{error}</p>}
          <Button variant="primary" fullWidth loading={loading} type="submit">
            {mode === 'login' ? 'Log In' : 'Create Account'} <ArrowRight size={18} />
          </Button>
        </form>

        <p className="auth__toggle-text">
          {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}
          <button className="auth__link" onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}>
            {mode === 'login' ? 'Sign Up' : 'Log In'}
          </button>
        </p>
        <p className="auth__footer">By continuing, you agree to our <a href="#" className="auth__link">Terms</a> and <a href="#" className="auth__link">Privacy Policy</a>.</p>
      </div>
    </div>
  );
}
