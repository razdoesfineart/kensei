import React, { useState } from 'react';
import { signUp, signIn, resetPassword } from '../db';
import { Eye, EyeOff, Mail, Lock, Wallet, ArrowRight, Loader2 } from 'lucide-react';

const Landing = ({ onAuthSuccess }) => {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

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
        onAuthSuccess();
      } else {
        await resetPassword(email);
        setSuccess('Password reset email sent. Check your inbox.');
        setMode('login');
      }
    } catch (err) { setError(err.message || 'Something went wrong'); }
    finally { setLoading(false); }
  };

  const handleWalletConnect = async () => {
    setError(''); setLoading(true);
    try {
      const sol = window.solana || window.phantom?.solana;
      if (!sol || !sol.isPhantom) { setError('Phantom wallet not found. Install it at phantom.app'); setLoading(false); return; }
      const resp = await sol.connect();
      const addr = resp.publicKey.toString();
      const we = addr.slice(0, 8) + '@wallet.kensei';
      try { await signIn(we, addr); onAuthSuccess(); }
      catch { await signUp(we, addr); await signIn(we, addr); onAuthSuccess(); }
    } catch (err) { setError(err.message || 'Wallet connection failed'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-black via-[#1a0a0a] to-[#0a0a1a]"></div>
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#e11d48]/10 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-900/10 rounded-full blur-[100px]"></div>
      <div className="relative z-10 w-full max-w-md px-6">
        <div className="text-center mb-10">
          <h1 className="text-6xl font-black tracking-tighter mb-2"><span className="text-[#e11d48]">剣聖</span></h1>
          <h2 className="text-4xl font-black tracking-tighter uppercase">Kensei</h2>
          <p className="text-gray-500 text-sm font-medium mt-2 tracking-widest uppercase">Way of the Blade</p>
        </div>
        <div className="bg-[#111] border-2 border-gray-800 rounded-3xl p-8">
          <h3 className="text-xl font-black uppercase tracking-tight mb-6 text-center">
            {mode === 'login' ? 'Enter the Dojo' : mode === 'signup' ? 'Begin Your Path' : 'Reset Password'}
          </h3>
          {error && <div className="bg-red-900/30 border border-red-800 text-red-400 text-sm rounded-xl px-4 py-3 mb-4 font-medium">{error}</div>}
          {success && <div className="bg-green-900/30 border border-green-800 text-green-400 text-sm rounded-xl px-4 py-3 mb-4 font-medium">{success}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
              <input type="email" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full bg-black border-2 border-gray-700 rounded-xl pl-12 pr-4 py-3 text-white placeholder-gray-600 focus:border-[#e11d48] focus:outline-none transition-colors font-medium" />
            </div>
            {mode !== 'forgot' && (
              <div className="relative">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                <input type={showPassword ? 'text' : 'password'} placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full bg-black border-2 border-gray-700 rounded-xl pl-12 pr-12 py-3 text-white placeholder-gray-600 focus:border-[#e11d48] focus:outline-none transition-colors font-medium" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            )}
            {mode === 'signup' && (
              <div className="relative">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                <input type={showPassword ? 'text' : 'password'} placeholder="Confirm password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className="w-full bg-black border-2 border-gray-700 rounded-xl pl-12 pr-4 py-3 text-white placeholder-gray-600 focus:border-[#e11d48] focus:outline-none transition-colors font-medium" />
              </div>
            )}
            <button type="submit" disabled={loading} className="w-full bg-[#e11d48] hover:bg-[#be123c] text-white py-3 rounded-xl font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-colors disabled:opacity-50">
              {loading ? <Loader2 size={20} className="animate-spin" /> : <>{mode === 'login' ? 'Enter' : mode === 'signup' ? 'Create Account' : 'Send Reset Email'} <ArrowRight size={18} /></>}
            </button>
          </form>
          {mode === 'login' && <button onClick={() => { setMode('forgot'); setError(''); setSuccess(''); }} className="w-full text-center text-gray-500 hover:text-gray-300 text-xs font-bold uppercase tracking-widest mt-4 transition-colors">Forgot Password?</button>}
          {mode !== 'forgot' && (
            <>
              <div className="flex items-center gap-4 my-6"><div className="flex-1 h-px bg-gray-800"></div><span className="text-gray-600 text-xs font-bold uppercase tracking-widest">or</span><div className="flex-1 h-px bg-gray-800"></div></div>
              <button onClick={handleWalletConnect} disabled={loading} className="w-full bg-[#1a1a2e] hover:bg-[#252540] border-2 border-purple-900/50 text-purple-300 py-3 rounded-xl font-bold uppercase tracking-widest flex items-center justify-center gap-3 transition-colors disabled:opacity-50">
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
