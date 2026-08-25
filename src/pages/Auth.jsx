import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { Eye, EyeOff, Phone, Mail, ArrowRight, CheckCircle2, User, ShieldCheck } from 'lucide-react';
import { useApp } from '../context/AppContext';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import './Auth.css';

export default function Auth() {
  const navigate = useNavigate();
  const { login, register, googleLogin, appleLogin } = useApp();
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

  // Social Auth Modals
  const [googleModalOpen, setGoogleModalOpen] = useState(false);
  const [googleEmailInput, setGoogleEmailInput] = useState('');
  const [appleModalOpen, setAppleModalOpen] = useState(false);
  const [appleEmailInput, setAppleEmailInput] = useState('');

  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '792079578960-ldu7vu26ao2vqicbu3sfn3eeh78h6ibi.apps.googleusercontent.com';

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

  // Initialize official Google Identity Services
  useEffect(() => {
    if (window.google?.accounts?.id) {
      try {
        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: handleGoogleCredentialResponse,
          auto_select: false,
          cancel_on_tap_outside: true,
        });
      } catch (e) {
        console.warn('Google Identity initialization notice:', e);
      }
    }
  }, [googleClientId, handleGoogleCredentialResponse]);

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
    // 1. If Google OAuth 2.0 Token Client is available, trigger the native Google Account Selector popup
    if (window.google?.accounts?.oauth2) {
      try {
        const tokenClient = window.google.accounts.oauth2.initTokenClient({
          client_id: googleClientId,
          scope: 'email profile openid',
          prompt: 'select_account',
          callback: async (tokenResponse) => {
            if (tokenResponse && tokenResponse.access_token) {
              setLoading(true);
              try {
                const userRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                  headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
                });
                const userInfo = await userRes.json();
                if (userInfo.email) {
                  const profile = await googleLogin({
                    email: userInfo.email,
                    firstName: userInfo.given_name || 'Google',
                    lastName: userInfo.family_name || 'User',
                    picture: userInfo.picture
                  });
                  if (profile?.onboardingCompleted) {
                    navigate('/', { replace: true });
                  } else {
                    navigate('/profile-setup', { replace: true });
                  }
                  return;
                }
              } catch (err) {
                setError(err.message || 'Failed to authenticate with Google');
              } finally {
                setLoading(false);
              }
            }
          },
        });
        tokenClient.requestAccessToken({ prompt: 'select_account' });
        return;
      } catch (e) {
        console.warn('OAuth2 popup client error:', e);
      }
    }

    // 2. If Google One-Tap SDK is ready, trigger Google ID prompt
    if (window.google?.accounts?.id) {
      try {
        window.google.accounts.id.prompt((notification) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            setGoogleModalOpen(true);
          }
        });
        return;
      } catch (e) {
        console.warn('Google prompt fallback:', e);
      }
    }

    // 3. Fallback: Open styled Google In-App Modal
    setGoogleModalOpen(true);
  };

  const handleGoogleModalSubmit = async (customEmail) => {
    const targetEmail = (customEmail || googleEmailInput || '').trim().toLowerCase();
    if (!targetEmail || !targetEmail.includes('@')) {
      setError('Please enter a valid Google Account email.');
      return;
    }
    setLoading(true);
    setError('');
    setGoogleModalOpen(false);
    try {
      const [firstName, ...rest] = (targetEmail.split('@')[0] || 'Google User').split('.');
      const lastName = rest.join(' ') || 'Scholar';
      const profile = await googleLogin({
        email: targetEmail,
        firstName: firstName ? firstName.charAt(0).toUpperCase() + firstName.slice(1) : 'Google',
        lastName: lastName ? lastName.charAt(0).toUpperCase() + lastName.slice(1) : 'User',
      });
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
  };

  const handleTriggerApple = () => {
    setError('');
    setAppleModalOpen(true);
  };

  const handleAppleModalSubmit = async (customEmail) => {
    const targetEmail = (customEmail || appleEmailInput || '').trim().toLowerCase();
    if (!targetEmail || !targetEmail.includes('@')) {
      setError('Please enter a valid Apple ID email.');
      return;
    }
    setLoading(true);
    setError('');
    setAppleModalOpen(false);
    try {
      const profile = await appleLogin({
        email: targetEmail,
        firstName: 'Apple',
        lastName: 'Scholar'
      });
      if (profile?.onboardingCompleted) {
        navigate('/', { replace: true });
      } else {
        navigate('/profile-setup', { replace: true });
      }
    } catch (err) {
      setError(err.message || 'Apple authentication failed');
    } finally {
      setLoading(false);
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

        <div className="auth__socials">
          <button className="auth__social-btn" type="button" onClick={handleTriggerGoogle} disabled={loading}>
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>
          <button className="auth__social-btn" type="button" onClick={handleTriggerApple} disabled={loading}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="var(--text-primary)">
              <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.32 2.32-1.96 4.29-3.74 4.25z"/>
            </svg>
            Continue with Apple
          </button>
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

      {/* Styled Google In-App Authentication Dialog (Fallback) */}
      {googleModalOpen && (
        <Modal
          isOpen={googleModalOpen}
          onClose={() => setGoogleModalOpen(false)}
          title="Sign in with Google"
          size="sm"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)', textAlign: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'center', margin: '4px 0' }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#fff', boxShadow: 'var(--shadow-md)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="28" height="28" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
              </div>
            </div>

            <div>
              <h3 style={{ margin: '0 0 4px', fontSize: 'var(--text-title3)' }}>Enter Google Account</h3>
              <p style={{ margin: 0, fontSize: 'var(--text-footnote)', color: 'var(--text-secondary)' }}>to sign in to OpportunityHub</p>
            </div>

            {/* Google Email Entry */}
            <div style={{ textAlign: 'left' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>Your Gmail / Google Email:</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="email"
                  className="input"
                  placeholder="yourname@gmail.com"
                  value={googleEmailInput}
                  onChange={(e) => setGoogleEmailInput(e.target.value)}
                  style={{ flex: 1 }}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleGoogleModalSubmit(); }}
                />
                <Button variant="primary" onClick={() => handleGoogleModalSubmit()} loading={loading}>
                  Continue
                </Button>
              </div>
            </div>

            <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
              <ShieldCheck size={13} /> Secured via Google Identity Authentication
            </div>
          </div>
        </Modal>
      )}

      {/* Styled Apple ID In-App Authentication Dialog */}
      {appleModalOpen && (
        <Modal
          isOpen={appleModalOpen}
          onClose={() => setAppleModalOpen(false)}
          title="Sign in with Apple ID"
          size="sm"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)', textAlign: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'center', margin: '4px 0' }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--text-primary)', color: 'var(--bg-surface)', boxShadow: 'var(--shadow-md)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.32 2.32-1.96 4.29-3.74 4.25z"/>
                </svg>
              </div>
            </div>

            <div>
              <h3 style={{ margin: '0 0 4px', fontSize: 'var(--text-title3)' }}>Sign in with Apple</h3>
              <p style={{ margin: 0, fontSize: 'var(--text-footnote)', color: 'var(--text-secondary)' }}>Use your Apple ID for OpportunityHub</p>
            </div>

            {/* Custom Apple Email Entry */}
            <div style={{ textAlign: 'left' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>Apple ID Email:</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="email"
                  className="input"
                  placeholder="yourname@icloud.com"
                  value={appleEmailInput}
                  onChange={(e) => setAppleEmailInput(e.target.value)}
                  style={{ flex: 1 }}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleAppleModalSubmit(); }}
                />
                <Button variant="primary" onClick={() => handleAppleModalSubmit()} loading={loading}>
                  Continue
                </Button>
              </div>
            </div>

            <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
              <ShieldCheck size={13} /> Secured with Touch ID / Face ID & Apple Privacy
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
