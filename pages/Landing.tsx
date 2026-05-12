import React, { useState, useRef, useEffect } from 'react';
import { signIn } from '../db';
import { playSwordSlashSound } from '../sounds';

const IMG_W = 2912;
const IMG_H = 1462;

function useImageBounds() {
  const [bounds, setBounds] = useState({ left: 0, top: 0, width: 0, height: 0 });
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function calc() {
      if (!ref.current) return;
      const vw = ref.current.clientWidth;
      const vh = ref.current.clientHeight;
      const imgAR = IMG_W / IMG_H;
      const vpAR = vw / vh;
      let rw: number, rh: number;
      if (vpAR > imgAR) { rw = vw; rh = vw / imgAR; }
      else { rh = vh; rw = vh * imgAR; }
      setBounds({ left: (vw - rw) / 2, top: (vh - rh) / 2, width: rw, height: rh });
    }
    calc();
    window.addEventListener('resize', calc);
    return () => window.removeEventListener('resize', calc);
  }, []);
  return { ref, bounds };
}

const Snowflakes = () => {
  const flakes = React.useMemo(() => Array.from({ length: 28 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 12,
    duration: Math.random() * 7 + 9,
    size: Math.random() * 10 + 6,
    opacity: Math.random() * 0.45 + 0.25,
  })), []);
  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 4 }}>
      {flakes.map(f => (
        <div key={f.id} style={{ position: 'absolute', left: f.left + '%', top: '-30px', fontSize: f.size + 'px', color: 'rgba(200,230,255,' + f.opacity + ')', textShadow: '0 0 6px rgba(180,215,255,0.8)', animation: 'snowfall ' + f.duration + 's linear ' + f.delay + 's infinite' }}>❄</div>
      ))}
    </div>
  );
};

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
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSlash, setShowSlash] = useState(false);
  const [clickInfo, setClickInfo] = useState<string | null>(null);

  const emailRef = useRef<HTMLInputElement>(null);
  const { ref: wrapRef, bounds } = useImageBounds();

  useEffect(() => { setTimeout(() => emailRef.current?.focus(), 200); }, []);

  const handleClick = (e: React.MouseEvent) => {
    if (bounds.width === 0) return;
    const xPct = ((e.clientX - bounds.left) / bounds.width * 100).toFixed(2);
    const yPct = ((e.clientY - bounds.top)  / bounds.height * 100).toFixed(2);
    setClickInfo('X: ' + xPct + '%   Y: ' + yPct + '%');
  };

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
    color: '#0a1520',
    fontFamily: "'Exo 2', sans-serif",
    fontSize: 'clamp(15px, 1.8vw, 22px)',
    fontWeight: 500,
    letterSpacing: '0.06em',
    textAlign: 'left',
    caretColor: '#0a1520',
    paddingLeft: '45%',
    paddingRight: '0',
    maxWidth: '87.5%',
    position: 'relative',
    zIndex: 10,
    boxSizing: 'border-box',
  };

  const BOX_LEFT = 0.376;
  const BOX_W    = 0.249;

  const box = (centerPct: number, halfH: number) => ({
    position: 'absolute' as const,
    left:   bounds.left + BOX_LEFT * bounds.width,
    top:    bounds.top  + (centerPct - halfH) * bounds.height,
    width:  BOX_W * bounds.width,
    height: halfH * 2 * bounds.height,
    overflow: 'hidden' as const,
  });

  return (
    <div ref={wrapRef} onClick={handleClick} style={{ position: 'fixed', inset: 0, overflow: 'hidden', background: '#050c18' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Exo+2:wght@500;600&display=swap');
        @keyframes slashFade { 0%{opacity:0} 20%{opacity:1} 80%{opacity:1} 100%{opacity:0} }
        @keyframes slashText { 0%{opacity:0;transform:scale(2)} 50%{opacity:1;transform:scale(1)} 100%{opacity:0;transform:scale(0.8)} }
        @keyframes spin { to { transform:rotate(360deg) } }
        @keyframes snowfall { 0%{transform:translateY(-30px) rotate(0deg);opacity:0} 10%{opacity:1} 90%{opacity:0.7} 100%{transform:translateY(110vh) rotate(360deg);opacity:0} }
        input:-webkit-autofill { -webkit-box-shadow:0 0 0 100px transparent inset!important; -webkit-text-fill-color:#0a1520!important; }
      `}</style>

      <img src="/kensei-login-bg.png" alt="" draggable={false}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', userSelect: 'none', pointerEvents: 'none', zIndex: 1 }} />

      {clickInfo && (
        <div style={{ position: 'fixed', top: 10, left: 10, background: 'rgba(0,0,0,0.85)', color: '#fff', padding: '8px 14px', borderRadius: 6, fontFamily: 'monospace', fontSize: 14, zIndex: 999, pointerEvents: 'none' }}>
          {clickInfo}
        </div>
      )}
      <Snowflakes />
      <SwordSlash active={showSlash} />

      {bounds.width > 0 && (
        <form onSubmit={handleSubmit} style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 10 }}>

          {/* USERNAME — red outline debug */}
          <div style={{ ...box(0.4974, 0.04), pointerEvents: 'auto', display: 'flex', alignItems: 'center' }}>
            <input ref={emailRef} type="text" value={email}
              onChange={e => { setEmail(e.target.value); setError(''); }}
              autoComplete="off" spellCheck={false} style={inputStyle} />
          </div>

          {/* PASSWORD — blue outline debug */}
          <div style={{ ...box(0.5762, 0.04), pointerEvents: 'auto', display: 'flex', alignItems: 'center' }}>
            <input type="password" value={password}
              onChange={e => { setPassword(e.target.value); setError(''); }}
              autoComplete="current-password" style={inputStyle} />
          </div>

          {/* ENTER — green outline debug */}
          <div style={{ ...box(0.6831, 0.05), pointerEvents: 'auto' }}>
            <button type="submit" disabled={loading}
              style={{ width: '100%', height: '100%', background: 'transparent', cursor: 'pointer', padding: 0 }}>
              {loading && <div style={{ width: 22, height: 22, margin: '0 auto', border: '2px solid rgba(200,160,60,0.35)', borderTopColor: '#c8a028', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />}
            </button>
          </div>

          {/* Forgot Password + Sign Up — gold, side by side, below ENTER */}
          <div style={{
            position: 'absolute',
            left: bounds.left + BOX_LEFT * bounds.width,
            top: bounds.top + (0.6831 + 0.05 + 0.03) * bounds.height,
            width: BOX_W * bounds.width,
            display: 'flex',
            gap: '8px',
            justifyContent: 'center',
            zIndex: 20,
            pointerEvents: 'auto',
          }}>
            <button
              type="button"
              onClick={() => alert('Forgot password coming soon!')}
              style={{
                flex: 1,
                background: 'linear-gradient(135deg, #c9a84c, #f5d17a, #c9a84c)',
                border: '1px solid #a07830',
                borderRadius: 4,
                color: '#3a2000',
                fontFamily: "'Exo 2', sans-serif",
                fontSize: 'clamp(9px, 0.9vw, 12px)',
                fontWeight: 700,
                letterSpacing: '0.08em',
                padding: '6px 4px',
                cursor: 'pointer',
                textShadow: '0 1px 0 rgba(255,255,255,0.3)',
                boxShadow: '0 2px 8px rgba(180,130,0,0.5)',
                whiteSpace: 'nowrap',
              }}
            >FORGOT PASSWORD</button>
            <button
              type="button"
              onClick={() => alert('Sign up coming soon!')}
              style={{
                flex: 1,
                background: 'linear-gradient(135deg, #c9a84c, #f5d17a, #c9a84c)',
                border: '1px solid #a07830',
                borderRadius: 4,
                color: '#3a2000',
                fontFamily: "'Exo 2', sans-serif",
                fontSize: 'clamp(9px, 0.9vw, 12px)',
                fontWeight: 700,
                letterSpacing: '0.08em',
                padding: '6px 4px',
                cursor: 'pointer',
                textShadow: '0 1px 0 rgba(255,255,255,0.3)',
                boxShadow: '0 2px 8px rgba(180,130,0,0.5)',
                whiteSpace: 'nowrap',
              }}
            >SIGN UP</button>
          </div>

          {error && (
            <div style={{ position: 'absolute', left: bounds.left + BOX_LEFT * bounds.width, top: bounds.top + 0.745 * bounds.height, width: BOX_W * bounds.width, textAlign: 'center', color: '#c0392b', fontFamily: 'Georgia', fontSize: 13, pointerEvents: 'none' }}>
              {error}
            </div>
          )}
        </form>
      )}
    </div>
  );
};

export default Landing;
