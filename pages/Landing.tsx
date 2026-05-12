import React, { useState, useRef, useEffect } from 'react';
import { signIn, signUp, resetPassword } from '../db';
import { playSwordSlashSound } from '../sounds';

// Sword slash animation on login
const SwordSlash = ({ active }) => {
  if (!active) return null;
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100, pointerEvents: 'none',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(circle, rgba(225,29,72,0.3) 0%, rgba(0,0,0,0.8) 70%)',
        animation: 'slashFade 1.2s ease-out forwards',
      }} />
      <svg width="600" height="200" viewBox="0 0 600 200" style={{ animation: 'slashDraw 0.6s ease-out forwards', opacity: 0 }}>
        <path d="M0 180 Q150 100 300 95 Q450 90 600 20" stroke="#e11d48" strokeWidth="3" fill="none"
          strokeDasharray="800" strokeDashoffset="800"
          style={{ animation: 'slashLine 0.5s 0.1s ease-out forwards' }} />
      </svg>
      <div style={{
        position: 'absolute', fontSize: '4rem', fontWeight: 900, color: 'white',
        textShadow: '0 0 40px rgba(225,29,72,0.8)',
        animation: 'slashText 0.8s 0.4s ease-out forwards', opacity: 0,
      }}>
        剣聖
      </div>
    </div>
  );
};

const Landing = ({ onAuthSuccess }) => {
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSlash, setShowSlash] = useState(false);
  const emailRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTimeout(() => emailRef.current?.focus(), 300);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setSuccess(''); setLoading(true);
    try {
      if (mode === 'signup') {
        if (password !== confirmPassword) { setError('Passwords do not match'); setLoading(false); return; }
        if (password.length < 6) { setError('Password must be at least 6 characters'); setLoading(false); return; }
        await signUp(email, password);
        setSuccess('Account created! You can now log in.');
        setMode('login');
      } else if (mode === 'login') {
        await signIn(email, password);
        setShowSlash(true);
        playSwordSlashSound();
        setTimeout(() => onAuthSuccess(), 1400);
        return;
      } else {
        await resetPassword(email);
        setSuccess('Password reset email sent. Check your inbox.');
        setMode('login');
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      if (mode !== 'login' || !showSlash) setLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, overflow: 'hidden' }}>
      <style>{`
        @keyframes slashFade {
          0% { opacity: 0; } 20% { opacity: 1; } 80% { opacity: 1; } 100% { opacity: 0; }
        }
        @keyframes slashDraw {
          0% { opacity: 0; transform: scale(0.5); } 100% { opacity: 1; transform: scale(1); }
        }
        @keyframes slashLine { to { stroke-dashoffset: 0; } }
        @keyframes slashText {
          0% { opacity: 0; transform: scale(2); }
          50% { opacity: 1; transform: scale(1); }
          100% { opacity: 0; transform: scale(0.8); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(-50%) translateX(0); }
          20% { transform: translateX(-50%) translateX(-6px); }
          40% { transform: translateX(-50%) translateX(6px); }
          60% { transform: translateX(-50%) translateX(-4px); }
          80% { transform: translateX(-50%) translateX(4px); }
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        .kensei-input {
          width: 100%;
          background: transparent;
          border: none;
          outline: none;
          color: #1a2535;
          font-family: 'Cinzel', Georgia, serif;
          font-size: clamp(11px, 1.5vw, 15px);
          font-weight: 700;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          text-align: center;
          caret-color: #3a6090;
          padding: 0;
          box-sizing: border-box;
        }
        .kensei-input::placeholder {
          color: rgba(50, 80, 120, 0.45);
          letter-spacing: 0.22em;
        }
        .kensei-input:-webkit-autofill {
          -webkit-box-shadow: 0 0 0 100px rgba(0,0,0,0) inset !important;
          -webkit-text-fill-color: #1a2535 !important;
        }
        .enter-btn {
          cursor: pointer;
          transition: filter 0.15s, transform 0.12s;
          background: transparent;
          border: none;
          padding: 0;
          display: block;
        }
        .enter-btn:hover { filter: brightness(1.15); transform: scale(1.02); }
        .enter-btn:active { transform: scale(0.98); }
        .enter-btn:disabled { cursor: default; opacity: 0.7; }

        .mode-link {
          font-family: 'Cinzel', Georgia, serif;
          font-size: clamp(8px, 0.9vw, 10px);
          letter-spacing: 0.16em;
          color: rgba(60, 100, 160, 0.8);
          background: none;
          border: none;
          cursor: pointer;
          text-decoration: underline;
          padding: 0;
        }
        .mode-link:hover { color: rgba(40, 70, 130, 1); }
      `}</style>

      {/* Full-bleed background */}
      <img
        src="/kensei-login-bg.png"
        alt=""
        draggable={false}
        style={{
          position: 'absolute', inset: 0,
          width: '100%', height: '100%',
          objectFit: 'cover', objectPosition: 'center',
          userSelect: 'none', pointerEvents: 'none',
        }}
      />

      <SwordSlash active={showSlash} />

      {/*
        Panel overlay — centred on the artwork's login box.
        USERNAME bar  ≈ 38.5% from top
        PASSWORD bar  ≈ 44.5% from top
        ENTER button  ≈ 52%   from top
        Panel width   ≈ 23vw  centred
      */}
      <form
        onSubmit={handleSubmit}
        noValidate
        style={{
          position: 'absolute',
          left: '50%',
          transform: 'translateX(-50%)',
          top: '37%',
          width: 'clamp(190px, 23vw, 300px)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        {/* EMAIL / USERNAME field */}
        <div style={{
          width: '100%',
          height: 'clamp(28px, 3.8vw, 48px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: 'clamp(5px, 0.8vw, 12px)',
        }}>
          <input
            ref={emailRef}
            type="email"
            className="kensei-input"
            value={email}
            onChange={e => { setEmail(e.target.value); setError(''); }}
            placeholder="EMAIL"
            autoComplete="email"
            spellCheck={false}
            required
          />
        </div>

        {/* PASSWORD field */}
        {mode !== 'forgot' && (
          <div style={{
            width: '100%',
            height: 'clamp(28px, 3.8vw, 48px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: 'clamp(4px, 0.6vw, 10px)',
          }}>
            <input
              type="password"
              className="kensei-input"
              value={password}
              onChange={e => { setPassword(e.target.value); setError(''); }}
              placeholder="PASSWORD"
              autoComplete="current-password"
              required
            />
          </div>
        )}

        {/* CONFIRM PASSWORD (signup only) */}
        {mode === 'signup' && (
          <div style={{
            width: '100%',
            height: 'clamp(28px, 3.8vw, 48px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: 'clamp(4px, 0.6vw, 10px)',
          }}>
            <input
              type="password"
              className="kensei-input"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              placeholder="CONFIRM PASSWORD"
              required
            />
          </div>
        )}

        {/* Error / Success */}
        {(error || success) && (
          <div style={{
            fontFamily: 'Georgia, serif',
            fontSize: 'clamp(8px, 0.85vw, 10px)',
            letterSpacing: '0.12em',
            color: error ? '#c0392b' : '#1a7a3a',
            textShadow: error ? '0 0 8px rgba(192,57,43,0.5)' : 'none',
            textAlign: 'center',
            marginBottom: 'clamp(3px, 0.4vw, 6px)',
            maxWidth: '100%',
            padding: '0 4px',
          }}>
            {error || success}
          </div>
        )}

        {/* ENTER button — transparent overlay on artwork's gold button */}
        <button
          type="submit"
          className="enter-btn"
          disabled={loading}
          style={{
            width: '100%',
            height: 'clamp(34px, 4.8vw, 60px)',
          }}
        >
          {loading && (
            <div style={{
              width: 18, height: 18, margin: '0 auto',
              border: '2px solid rgba(200,160,60,0.35)',
              borderTopColor: '#c8a028',
              borderRadius: '50%',
              animation: 'spin 0.7s linear infinite',
            }} />
          )}
        </button>

        {/* Mode switcher links */}
        <div style={{ marginTop: 'clamp(6px, 0.8vw, 12px)', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 4 }}>
          {mode === 'login' && (
            <>
              <button type="button" className="mode-link" onClick={() => { setMode('signup'); setError(''); setSuccess(''); }}>
                CREATE ACCOUNT
              </button>
              <button type="button" className="mode-link" onClick={() => { setMode('forgot'); setError(''); setSuccess(''); }}>
                FORGOT PASSWORD
              </button>
            </>
          )}
          {mode !== 'login' && (
            <button type="button" className="mode-link" onClick={() => { setMode('login'); setError(''); setSuccess(''); }}>
              BACK TO LOGIN
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default Landing;
