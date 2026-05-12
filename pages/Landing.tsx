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

const Landing = ({ onAuthSuccess }: { onAuthSuccess: () => void }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSlash, setShowSlash] = useState(false);
  const [clickY, setClickY] = useState<number | null>(null);
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

  // DEBUG: track clicks to show where user is clicking
  const handleClick = (e: React.MouseEvent) => {
    if (bounds.height === 0) return;
    const imgY = (e.clientY - bounds.top) / bounds.height;
    const imgX = (e.clientX - bounds.left) / bounds.width;
    setClickY(Math.round(imgY * 10000) / 100);
    console.log(`Click: imgX=${(imgX*100).toFixed(1)}% imgY=${(imgY*100).toFixed(1)}%  fullImgPx: x=${Math.round(imgX*IMG_W)} y=${Math.round(imgY*IMG_H)}`);
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

  // These are placeholders — user will click the real boxes and we read the %
  const USERNAME_TOP_PCT = 0.295;
  const USERNAME_H_PCT   = 0.075;
  const PASSWORD_TOP_PCT = 0.415;
  const PASSWORD_H_PCT   = 0.075;
  const ENTER_TOP_PCT    = 0.555;
  const ENTER_H_PCT      = 0.095;
  const BOX_LEFT_PCT     = 0.376;
  const BOX_W_PCT        = 0.249;

  const box = (topPct: number, hPct: number) => ({
    position: 'absolute' as const,
    left:   bounds.left + BOX_LEFT_PCT * bounds.width,
    top:    bounds.top  + topPct * bounds.height,
    width:  BOX_W_PCT * bounds.width,
    height: hPct * bounds.height,
  });

  return (
    <div ref={wrapRef} onClick={handleClick} style={{ position: 'fixed', inset: 0, overflow: 'hidden', background: '#050c18' }}>
      <style>{`
        @keyframes spin { to { transform:rotate(360deg) } }
        input:-webkit-autofill { -webkit-box-shadow:0 0 0 100px transparent inset!important; -webkit-text-fill-color:#1c2b3a!important; }
      `}</style>

      <img src="/kensei-login-bg.png" alt="" draggable={false}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', userSelect: 'none', pointerEvents: 'none' }} />

      {/* DEBUG: show click position */}
      {clickY !== null && (
        <div style={{ position: 'fixed', top: 10, left: 10, background: 'rgba(0,0,0,0.85)', color: '#fff', padding: '8px 14px', borderRadius: 6, fontFamily: 'monospace', fontSize: 14, zIndex: 999, pointerEvents: 'none' }}>
          Last click: <b>{clickY}%</b> from image top
        </div>
      )}

      {bounds.width > 0 && (
        <form onSubmit={handleSubmit} style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>

          {/* USERNAME — red outline for debug */}
          <div style={{ ...box(USERNAME_TOP_PCT, USERNAME_H_PCT), pointerEvents: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center', outline: '2px solid red' }}>
            <input ref={emailRef} type="email" value={email} onChange={e => { setEmail(e.target.value); setError(''); }}
              autoComplete="email" spellCheck={false} style={inputStyle} />
          </div>

          {/* PASSWORD — blue outline for debug */}
          <div style={{ ...box(PASSWORD_TOP_PCT, PASSWORD_H_PCT), pointerEvents: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center', outline: '2px solid blue' }}>
            <input type="password" value={password} onChange={e => { setPassword(e.target.value); setError(''); }}
              autoComplete="current-password" style={inputStyle} />
          </div>

          {/* ENTER — green outline for debug */}
          <div style={{ ...box(ENTER_TOP_PCT, ENTER_H_PCT), pointerEvents: 'auto' }}>
            <button type="submit" disabled={loading}
              style={{ width: '100%', height: '100%', background: 'transparent', border: '2px solid green', cursor: 'pointer', padding: 0 }}>
              {loading && <div style={{ width: 22, height: 22, margin: '0 auto', border: '2px solid rgba(200,160,60,0.35)', borderTopColor: '#c8a028', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />}
            </button>
          </div>

          {error && (
            <div style={{ ...box(ENTER_TOP_PCT + ENTER_H_PCT + 0.01, 0.05), display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#c0392b', fontFamily: 'Georgia', fontSize: 13, pointerEvents: 'none' }}>
              {error}
            </div>
          )}
        </form>
      )}
    </div>
  );
};

export default Landing;
