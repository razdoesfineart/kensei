import React, { useState, useRef, useEffect } from 'react';
import { signIn } from '../db';
import { playSwordSlashSound } from '../sounds';

const IMG_W = 2912;
const IMG_H = 1462;

// Pixel coordinates measured directly from user feedback
// USERNAME: screenshot 17-35% → full image y=460-608
// PASSWORD: screenshot 38-55% → full image y=632-771
// ENTER:    screenshot 65-85% → full image y=853-1017
// Horizontal: panel x=1095-1820 (centred)
const ZONES = {
  username: { x: 1095, y: 460, w: 725, h: 148 },
  password: { x: 1095, y: 632, w: 725, h: 139 },
  enter:    { x: 1095, y: 853, w: 725, h: 164 },
};

function useImageBounds() {
  const [bounds, setBounds] = useState({ left: 0, top: 0, width: 0, height: 0 });
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function calc() {
      if (!ref.current) return;
      const vw = ref.current.clientWidth;
      const vh = ref.current.clientHeight;
      const imgAR = IMG_W / IMG_H;
      const vpAR  = vw / vh;
      let rw: number, rh: number;
      if (vpAR > imgAR) { rw = vw; rh = vw / imgAR; }
      else               { rh = vh; rw = vh * imgAR; }
      setBounds({ left: (vw - rw) / 2, top: (vh - rh) / 2, width: rw, height: rh });
    }
    calc();
    window.addEventListener('resize', calc);
    return () => window.removeEventListener('resize', calc);
  }, []);

  return { ref, bounds };
}

function zone(name: keyof typeof ZONES, b: { left: number; top: number; width: number; height: number }) {
  const z = ZONES[name];
  const sx = b.width  / IMG_W;
  const sy = b.height / IMG_H;
  return {
    position: 'absolute' as const,
    left:   b.left + z.x * sx,
    top:    b.top  + z.y * sy,
    width:  z.w * sx,
    height: z.h * sy,
  };
}

const SwordSlash = ({ active }: { active: boolean }) => {
  if (!active) return null;
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, pointerEvents: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle, rgba(225,29,72,0.3) 0%, rgba(0,0,0,0.8) 70%)', animation: 'slashFade 1.2s ease-out forwards' }} />
      <div style={{ position: 'absolute', fontSize: '4rem', fontWeight: 900, color: 'white', textShadow: '0 0 40px rgba(225,29,72,0.8)', animation: 'slashText 0.8s 0.4s ease-out forwards', opacity: 0 }}>剣聖</div>
    </div>
  );
};

const Landing = ({ onAuthSuccess }: { onAuthSuccess: () => void }) => {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [showSlash, setShowSlash] = useState(false);
  const emailRef = useRef<HTMLInputElement>(null);
  const { ref: wrapRef, bounds } = useImageBounds();

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

  const inputStyle: React.CSSProperties = {
    width: '100%', height: '100%',
    background: 'transparent',
    border: 'none', outline: 'none',
    color: '#1c2b3a',
    fontFamily: 'Cinzel, Georgia, serif',
    fontSize: 'clamp(11px, 1.3vw, 16px)',
    fontWeight: 700,
    letterSpacing: '0.14em',
    textAlign: 'center',
    caretColor: '#3a6090',
    padding: 0,
    boxSizing: 'border-box' as const,
  };

  return (
    <div ref={wrapRef} style={{ position: 'fixed', inset: 0, overflow: 'hidden', background: '#050c18' }}>
      <style>{`
        @keyframes slashFade { 0%{opacity:0} 20%{opacity:1} 80%{opacity:1} 100%{opacity:0} }
        @keyframes slashText { 0%{opacity:0;transform:scale(2)} 50%{opacity:1;transform:scale(1)} 100%{opacity:0;transform:scale(0.8)} }
        @keyframes spin { to { transform:rotate(360deg) } }
        input:-webkit-autofill { -webkit-box-shadow:0 0 0 100px transparent inset!important; -webkit-text-fill-color:#1c2b3a!important; }
      `}</style>

      <img
        src="/kensei-login-bg.png"
        alt=""
        draggable={false}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', userSelect: 'none', pointerEvents: 'none' }}
      />

      <SwordSlash active={showSlash} />

      {bounds.width > 0 && (
        <form onSubmit={handleSubmit} style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>

          {/* USERNAME */}
          <div style={{ ...zone('username', bounds), pointerEvents: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <input
              ref={emailRef}
              type="email"
              value={email}
              onChange={e => { setEmail(e.target.value); setError(''); }}
              autoComplete="email"
              spellCheck={false}
              style={inputStyle}
            />
          </div>

          {/* PASSWORD */}
          <div style={{ ...zone('password', bounds), pointerEvents: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <input
              type="password"
              value={password}
              onChange={e => { setPassword(e.target.value); setError(''); }}
              autoComplete="current-password"
              style={inputStyle}
            />
          </div>

          {/* ENTER */}
          <div style={{ ...zone('enter', bounds), pointerEvents: 'auto' }}>
            <button type="submit" disabled={loading}
              style={{ width: '100%', height: '100%', background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}>
              {loading && (
                <div style={{ width: 22, height: 22, margin: '0 auto', border: '2px solid rgba(200,160,60,0.35)', borderTopColor: '#c8a028', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
              )}
            </button>
          </div>

          {/* Error */}
          {error && (
            <div style={{
              position: 'absolute',
              left: zone('enter', bounds).left,
              top:  zone('enter', bounds).top + zone('enter', bounds).height + 6,
              width: zone('enter', bounds).width,
              textAlign: 'center',
              fontFamily: 'Georgia, serif',
              fontSize: 'clamp(9px, 0.9vw, 13px)',
              color: '#c0392b',
              textShadow: '0 0 8px rgba(192,57,43,0.7)',
              pointerEvents: 'none',
            }}>{error}</div>
          )}

        </form>
      )}
    </div>
  );
};

export default Landing;
