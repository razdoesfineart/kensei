import React, { useState, useEffect, useRef } from 'react';
import { signUp, signIn, resetPassword } from '../db';
import { Eye, EyeOff, Mail, Lock, Wallet, ArrowRight, Loader2 } from 'lucide-react';

// Cherry blossom petal component
const Petal = ({ delay, left, size, duration }) => (
  <div
    style={{
      position: 'fixed', left: left + '%', top: '-20px',
      width: size + 'px', height: size + 'px',
      backgroundColor: '#ffb7c5', borderRadius: '150% 0 150% 0',
      opacity: 0, pointerEvents: 'none', zIndex: 1,
      animation: 'petalFall ' + duration + 's ease-in-out ' + delay + 's infinite',
    }}
  />
);

// Samurai silhouette SVG
const SamuraiSilhouette = () => (
  <div style={{ position: 'absolute', bottom: '0', right: '0', opacity: 0.04, pointerEvents: 'none', zIndex: 0 }}>
    <svg width="400" height="500" viewBox="0 0 400 500" fill="white">
      <path d="M200 50 L210 45 L215 30 L220 15 L218 10 L225 5 L230 0 L228 8 L222 20 L220 35 L225 40 L220 50 L215 55 Z" />
      <circle cx="200" cy="80" r="25" />
      <path d="M175 105 L225 105 L240 130 L250 200 L245 280 L235 350 L240 420 L235 480 L220 480 L215 400 L210 350 L200 300 L190 350 L185 400 L180 480 L165 480 L170 420 L165 350 L155 280 L150 200 L160 130 Z" />
      <path d="M160 130 L120 200 L115 250 L130 240 L150 200 Z" />
      <path d="M240 130 L280 200 L285 250 L270 240 L250 200 Z" />
      <path d="M280 195 L350 140 L380 130 L370 135 L355 145 L285 200 Z" />
    </svg>
  </div>
);

// Sword slash animation on login
const SwordSlash = ({ active, onComplete }) => {
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
        <path d="M0 185 Q150 105 300 100 Q450 95 600 25" stroke="rgba(255,255,255,0.4)" strokeWidth="1" fill="none"
          strokeDasharray="800" strokeDashoffset="800"
          style={{ animation: 'slashLine 0.5s 0.15s ease-out forwards' }} />
      </svg>
      <div style={{
        position: 'absolute', fontSize: '4rem', fontWeight: 900, color: 'white',
        textShadow: '0 0 40px rgba(225,29,72,0.8)', letterSpacing: '-2px',
        animation: 'slashText 0.8s 0.4s ease-out forwards', opacity: 0,
      }}>
        剣聖
      </div>
    </div>
  );
};

const Landing = ({ onAuthSuccess }) => {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSlash, setShowSlash] = useState(false);
  const [petals, setPetals] = useState([]);

  // Generate random petals on mount
  useEffect(() => {
    const p = [];
    for (let i = 0; i < 15; i++) {
      p.push({
        id: i,
        delay: Math.random() * 8,
        left: Math.random() * 100,
        size: Math.random() * 8 + 4,
        duration: Math.random() * 6 + 8,
      });
    }
    setPetals(p);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setSuccess(''); setLoading(true);
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
        setTimeout(() => onAuthSuccess(), 1400);
        return;
      } else {
        await resetPassword(email);
        setSuccess('Password reset email sent. Check your inbox.');
        setMode('login');
      }
    } catch (err) { setError(err.message || 'Something went wrong'); }
    finally { if (mode !== 'login' || !showSlash) setLoading(false); }
  };

  const handleWalletConnect = async () => {
    setError(''); setLoading(true);
    try {
      const sol = window.solana || window.phantom?.solana;
      if (!sol || !sol.isPhantom) { setError('Phantom wallet not found. Install it at phantom.app'); setLoading(false); return; }
      const resp = await sol.connect();
      const addr = resp.publicKey.toString();
      const we = addr.slice(0, 8) + '@wallet.kensei';
      try { await signIn(we, addr); } catch { await signUp(we, addr); await signIn(we, addr); }
      setShowSlash(true);
      setTimeout(() => onAuthSuccess(), 1400);
    } catch (err) { setError(err.message || 'Wallet connection failed'); setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center relative overflow-hidden">
      {/* Animations CSS */}
      <style>{`
        @keyframes petalFall {
          0% { transform: translate(0, -10px) rotate(0deg); opacity: 0; }
          10% { opacity: 0.5; }
          90% { opacity: 0.5; }
          100% { transform: translate(${Math.random() > 0.5 ? '' : '-'}80px, 110vh) rotate(360deg); opacity: 0; }
        }
        @keyframes slashFade {
          0% { opacity: 0; }
          20% { opacity: 1; }
          80% { opacity: 1; }
          100% { opacity: 0; }
        }
        @keyframes slashDraw {
          0% { opacity: 0; transform: scale(0.5); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes slashLine {
          to { stroke-dashoffset: 0; }
        }
        @keyframes slashText {
          0% { opacity: 0; transform: scale(2); }
          50% { opacity: 1; transform: scale(1); }
          100% { opacity: 0; transform: scale(0.8); }
        }
        @keyframes floatUp {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes glowPulse {
          0%, 100% { text-shadow: 0 0 20px rgba(225,29,72,0.5), 0 0 40px rgba(225,29,72,0.2); }
          50% { text-shadow: 0 0 40px rgba(225,29,72,0.8), 0 0 80px rgba(225,29,72,0.4), 0 0 120px rgba(225,29,72,0.2); }
        }
      `}</style>

      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-[#1a0a0a] to-[#0a0a1a]"></div>
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#e11d48]/10 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-900/10 rounded-full blur-[100px]"></div>
      <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-[#e11d48]/5 rounded-full blur-[80px]"></div>

      {/* Cherry blossom petals */}
      {petals.map(p => <Petal key={p.id} {...p} />)}

      {/* Samurai silhouette */}
      <SamuraiSilhouette />

      {/* Sword slash overlay */}
      <SwordSlash active={showSlash} />

      <div className="relative z-10 w-full max-w-md px-6">
        {/* Logo with glow animation */}
        <div className="text-center mb-10" style={{ animation: 'floatUp 4s ease-in-out infinite' }}>
          <h1 className="text-7xl font-black tracking-tighter mb-2" style={{ animation: 'glowPulse 3s ease-in-out infinite' }}>
            <span className="text-[#e11d48]">剣聖</span>
          </h1>
          <h2 className="text-4xl font-black tracking-tighter uppercase">Kensei</h2>
          <p className="text-gray-500 text-sm font-medium mt-2 tracking-widest uppercase">Way of the Blade</p>
        </div>

        {/* Auth Card */}
        <div className="bg-[#111]/90 backdrop-blur-xl border-2 border-gray-800 rounded-3xl p-8 shadow-2xl shadow-[#e11d48]/5">
          <h3 className="text-xl font-black uppercase tracking-tight mb-6 text-center">
            {mode === 'login' ? 'Enter the Dojo' : mode === 'signup' ? 'Begin Your Path' : 'Reset Password'}
          </h3>

          {error && <div className="bg-red-900/30 border border-red-800 text-red-400 text-sm rounded-xl px-4 py-3 mb-4 font-medium">{error}</div>}
          {success && <div className="bg-green-900/30 border border-green-800 text-green-400 text-sm rounded-xl px-4 py-3 mb-4 font-medium">{success}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
              <input type="email" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} required
                className="w-full bg-black/60 border-2 border-gray-700 rounded-xl pl-12 pr-4 py-3 text-white placeholder-gray-600 focus:border-[#e11d48] focus:outline-none transition-colors font-medium" />
            </div>

            {mode !== 'forgot' && (
              <div className="relative">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                <input type={showPassword ? 'text' : 'password'} placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required
                  className="w-full bg-black/60 border-2 border-gray-700 rounded-xl pl-12 pr-12 py-3 text-white placeholder-gray-600 focus:border-[#e11d48] focus:outline-none transition-colors font-medium" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            )}

            {mode === 'signup' && (
              <div className="relative">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                <input type={showPassword ? 'text' : 'password'} placeholder="Confirm password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required
                  className="w-full bg-black/60 border-2 border-gray-700 rounded-xl pl-12 pr-4 py-3 text-white placeholder-gray-600 focus:border-[#e11d48] focus:outline-none transition-colors font-medium" />
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full bg-[#e11d48] hover:bg-[#be123c] text-white py-3.5 rounded-xl font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all disabled:opacity-50 hover:shadow-lg hover:shadow-[#e11d48]/30 hover:scale-[1.02] active:scale-[0.98]">
              {loading ? <Loader2 size={20} className="animate-spin" /> : <>{mode === 'login' ? 'Enter' : mode === 'signup' ? 'Create Account' : 'Send Reset Email'} <ArrowRight size={18} /></>}
            </button>
          </form>

          {mode === 'login' && <button onClick={() => { setMode('forgot'); setError(''); setSuccess(''); }}
            className="w-full text-center text-gray-500 hover:text-gray-300 text-xs font-bold uppercase tracking-widest mt-4 transition-colors">Forgot Password?</button>}

          {mode !== 'forgot' && (
            <>
              <div className="flex items-center gap-4 my-6"><div className="flex-1 h-px bg-gray-800"></div><span className="text-gray-600 text-xs font-bold uppercase tracking-widest">or</span><div className="flex-1 h-px bg-gray-800"></div></div>
              <button onClick={handleWalletConnect} disabled={loading}
                className="w-full bg-[#1a1a2e] hover:bg-[#252540] border-2 border-purple-900/50 text-purple-300 py-3 rounded-xl font-bold uppercase tracking-widest flex items-center justify-center gap-3 transition-all disabled:opacity-50 hover:border-purple-700 hover:shadow-lg hover:shadow-purple-900/20">
                <Wallet size={20} /> Connect Phantom Wallet
              </button>
            </>
          )}

          <div className="text-center mt-6">
            {mode === 'login' ? (
              <p className="text-gray-500 text-sm">No account? <button onClick={() => { setMode('signup'); setError(''); setSuccess(''); }} className="text-[#e11d48] font-bold hover:underline">Sign up</button></p>
            ) : (
              <p className="text-gray-500 text-sm">Already have an account? <button onClick={() => { setMode('login'); setError(''); setSuccess(''); }} className="text-[#e11d48] font-bold hover:underline">Log in</button></p>
            )}
          </div>
        </div>

        <p className="text-center text-gray-700 text-[10px] font-bold uppercase tracking-[0.2em] mt-8">剣聖 Kensei v4.5</p>
      </div>
    </div>
  );
};

export default Landing;
