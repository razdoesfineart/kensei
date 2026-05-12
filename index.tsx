import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import Landing from './pages/Landing';
import { getSession, onAuthChange } from './db';

const AuthWrapper = () => {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Hard 4-second timeout — if Supabase doesn't respond, treat as logged out
    const timeout = setTimeout(() => {
      console.warn('Kensei: Supabase session check timed out, proceeding as logged out');
      setLoading(false);
    }, 4000);

    getSession()
      .then(s => {
        clearTimeout(timeout);
        setSession(s);
        setLoading(false);
      })
      .catch(() => {
        clearTimeout(timeout);
        setLoading(false);
      });

    let subscription: any = null;
    try {
      const { data } = onAuthChange((event: string, newSession: any) => {
        setSession(newSession);
        if (event === 'SIGNED_OUT') setSession(null);
      });
      subscription = data?.subscription;
    } catch (e) {
      console.warn('Kensei: onAuthChange failed', e);
    }

    return () => {
      clearTimeout(timeout);
      subscription?.unsubscribe?.();
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl font-black text-[#e11d48] mb-4">剣聖</div>
          <div className="text-gray-500 text-sm font-bold uppercase tracking-widest animate-pulse">Loading...</div>
        </div>
      </div>
    );
  }

  if (!session) return <Landing onAuthSuccess={() => { getSession().then(s => setSession(s)); }} />;
  return <App userId={session.user.id} userEmail={session.user.email} />;
};

const root = createRoot(document.getElementById('root')!);
root.render(<AuthWrapper />);
