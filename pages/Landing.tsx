import React, { useState, useRef, useEffect } from 'react';
import { signIn } from '../db';
import { playSwordSlashSound } from '../sounds';

// Image natural dimensions
const IMG_W = 2912;
const IMG_H = 1462;

// Pixel coords of each interactive zone in the source image
// (measured from the Gemini artwork at full resolution)
const ZONES = {
  username: { x: 1095, y: 488, w: 725, h: 84 },
  password: { x: 1095, y: 592, w: 725, h: 80 },
  enter:    { x: 1095, y: 688, w: 725, h: 110 },
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
      // objectFit: cover — whichever dimension fills first
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

function zone(name: keyof typeof ZONES, bounds: { left: number; top: number; width: number; height: number }) {
  const z = ZONES[name];
  const scaleX = bounds.width  / IMG_W;
  const scaleY = bounds.height / IMG_H;
  return {
    position: 'absolute' as const,
    left:   bounds.left + z.x * scaleX,
    top:    bounds.top  + z.y * scaleY,
    width:  z.w * scaleX,
    height: z.h * scaleY,
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

          {/* USERNAME — pixel-perfect overlay */}
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

          {/* PASSWORD — pixel-perfect overlay */}
          <div style={{ ...zone('password', bounds), pointerEvents: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <input
              type="password"
              value={password}
              onChange={e => { setPassword(e.target.value); setError(''); }}
              autoComplete="current-password"
              style={inputStyle}
            />
          </div>

          {/* ENTER — pixel-perfect overlay */}
          <div style={{ ...zone('enter', bounds), pointerEvents: 'auto' }}>
            <button
              type="submit"
              disabled={loading}
              style={{ width: '100%', height: '100%', background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}
            >
              {loading && (
                <div style={{ width: 20, height: 20, margin: '0 auto', border: '2px solid rgba(200,160,60,0.35)', borderTopColor: '#c8a028', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
              )}
            </button>
          </div>

          {/* Error */}
          {error && (
            <div style={{
              ...zone('enter', bounds),
              top: zone('enter', bounds).top + zone('enter', bounds).height + 8,
              height: 'auto',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              pointerEvents: 'none',
              fontFamily: 'Georgia, serif',
              fontSize: 'clamp(9px, 0.9vw, 12px)',
              color: '#c0392b',
              textShadow: '0 0 8px rgba(192,57,43,0.7)',
              whiteSpace: 'nowrap',
            }}>{error}</div>
          )}

        </form>
      )}
    </div>
  );
};

export default Landing;
