import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import Landing from './pages/Landing';
import { getSession, onAuthChange } from './db';

const AuthWrapper = () => {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSession().then(s => { setSession(s); setLoading(false); }).catch(() => setLoading(false));
    const { data: { subscription } } = onAuthChange((event, newSession) => {
      setSession(newSession);
      if (event === 'SIGNED_OUT') setSession(null);
    });
    return () => subscription.unsubscribe();
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

const root = createRoot(document.getElementById('root'));
root.render(<AuthWrapper />);
