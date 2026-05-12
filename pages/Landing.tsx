import React, { useState, useRef, useEffect } from 'react';
import { signIn, signUp, resetPassword } from '../db';
import { playSwordSlashSound } from '../sounds';

const SwordSlash = ({ active }) => {
  if (!active) return null;
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, pointerEvents: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle, rgba(225,29,72,0.3) 0%, rgba(0,0,0,0.8) 70%)', animation: 'slashFade 1.2s ease-out forwards' }} />
      <div style={{ position: 'absolute', fontSize: '4rem', fontWeight: 900, color: 'white', textShadow: '0 0 40px rgba(225,29,72,0.8)', animation: 'slashText 0.8s 0.4s ease-out forwards', opacity: 0 }}>剣聖</div>
    </div>
  );
};

const Landing = ({ onAuthSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSlash, setShowSlash] = useState(false);
  const emailRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setTimeout(() => emailRef.current?.focus(), 200); }, []);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!email.trim() || !password) return;
    setError(''); setLoading(true);
    try {
      await signIn(email.trim(), password);
      setShowSlash(true);
      playSwordSlashSound();
      setTimeout(() => onAuthSuccess(), 1400);
    } catch (err: any) {
      setError(err.message || 'Invalid credentials');
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, overflow: 'hidden' }}>
      <style>{`
        @keyframes slashFade { 0%{opacity:0} 20%{opacity:1} 80%{opacity:1} 100%{opacity:0} }
        @keyframes slashText { 0%{opacity:0;transform:scale(2)} 50%{opacity:1;transform:scale(1)} 100%{opacity:0;transform:scale(0.8)} }
        @keyframes spin { to { transform: rotate(360deg); } }

        .kf-input {
          width: 100%;
          height: 100%;
          background: transparent;
          border: none;
          outline: none;
          color: #1a2535;
          font-family: 'Cinzel', Georgia, serif;
          font-size: clamp(12px, 1.4vw, 17px);
          font-weight: 700;
          letter-spacing: 0.15em;
          text-align: center;
          caret-color: #3a6090;
          padding: 0;
          box-sizing: border-box;
        }
        .kf-input::placeholder {
          color: rgba(60,90,130,0.0);
        }
        .kf-input:-webkit-autofill {
          -webkit-box-shadow: 0 0 0 100px transparent inset !important;
          -webkit-text-fill-color: #1a2535 !important;
        }
        .kf-enter {
          width: 100%;
          height: 100%;
          background: transparent;
          border: none;
          cursor: pointer;
          padding: 0;
        }
        .kf-enter:hover { filter: brightness(1.12); }
        .kf-enter:active { transform: scale(0.98); }
      `}</style>

      {/* Background image — full bleed */}
      <img
        src="/kensei-login-bg.png"
        alt=""
        draggable={false}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', userSelect: 'none', pointerEvents: 'none' }}
      />

      <SwordSlash active={showSlash} />

      {/* Error message */}
      {error && (
        <div style={{
          position: 'absolute',
          left: '50%', transform: 'translateX(-50%)',
          top: '64%',
          fontFamily: 'Georgia, serif',
          fontSize: 'clamp(9px, 1vw, 12px)',
          color: '#c0392b',
          textShadow: '0 0 8px rgba(192,57,43,0.6)',
          whiteSpace: 'nowrap',
          pointerEvents: 'none',
        }}>{error}</div>
      )}

      {/*
        ── Overlay form ──────────────────────────────────────────────
        The artwork panel centre is at ~50% horizontally.
        USERNAME box : top ~38.5%, height ~6.5%
        PASSWORD box : top ~47%,   height ~6.5%
        ENTER button : top ~56.5%, height ~8%
        Panel width  : ~26% of viewport, centred
      */}
      <form onSubmit={handleSubmit} style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>

        {/* USERNAME */}
        <div style={{
          position: 'absolute',
          left: '50%', transform: 'translateX(-50%)',
          top: '38.5%',
          width: '26%',
          height: '6.5%',
          pointerEvents: 'auto',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <input
            ref={emailRef}
            type="email"
            className="kf-input"
            value={email}
            onChange={e => { setEmail(e.target.value); setError(''); }}
            placeholder=""
            autoComplete="email"
            spellCheck={false}
          />
        </div>

        {/* PASSWORD */}
        <div style={{
          position: 'absolute',
          left: '50%', transform: 'translateX(-50%)',
          top: '47%',
          width: '26%',
          height: '6.5%',
          pointerEvents: 'auto',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <input
            type="password"
            className="kf-input"
            value={password}
            onChange={e => { setPassword(e.target.value); setError(''); }}
            placeholder=""
            autoComplete="current-password"
          />
        </div>

        {/* ENTER */}
        <div style={{
          position: 'absolute',
          left: '50%', transform: 'translateX(-50%)',
          top: '56.5%',
          width: '26%',
          height: '8%',
          pointerEvents: 'auto',
        }}>
          <button type="submit" className="kf-enter" disabled={loading}>
            {loading && (
              <div style={{ width: 20, height: 20, margin: '0 auto', border: '2px solid rgba(200,160,60,0.4)', borderTopColor: '#c8a028', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
            )}
          </button>
        </div>

      </form>
    </div>
  );
};

export default Landing;
