import React, { useEffect, useState } from 'react';
import { X, Trophy, AlertTriangle, CheckCircle } from 'lucide-react';

export type ToastType = 'achievement' | 'warning' | 'success' | 'info';

export interface ToastData {
  id: string;
  type: ToastType;
  title: string;
  message: string;
  icon?: string;
  tier?: string;
  kanji?: string;
  duration?: number;
}

// ========== ACHIEVEMENT POPUP - Full screen center, golden frame ==========
const AchievementPopup = ({ toast, onDismiss }) => {
  const [phase, setPhase] = useState('enter'); // enter, show, exit

  useEffect(() => {
    setTimeout(() => setPhase('show'), 50);
    const timer = setTimeout(() => {
      setPhase('exit');
      setTimeout(() => onDismiss(toast.id), 500);
    }, toast.duration || 5000);
    return () => clearTimeout(timer);
  }, []);

  const tierColors = {
    bronze: { border: '#CD7F32', bg: 'rgba(205,127,50,0.15)', glow: 'rgba(205,127,50,0.4)' },
    silver: { border: '#C0C0C0', bg: 'rgba(192,192,192,0.15)', glow: 'rgba(192,192,192,0.4)' },
    gold: { border: '#FFD700', bg: 'rgba(255,215,0,0.15)', glow: 'rgba(255,215,0,0.5)' },
    legendary: { border: '#a855f7', bg: 'rgba(168,85,247,0.15)', glow: 'rgba(168,85,247,0.4)' },
    mythical: { border: '#e11d48', bg: 'rgba(225,29,72,0.15)', glow: 'rgba(225,29,72,0.5)' },
  };
  const colors = tierColors[toast.tier] || tierColors.gold;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: phase === 'exit' ? 'rgba(0,0,0,0)' : 'rgba(0,0,0,0.6)',
      transition: 'background 0.5s ease',
      pointerEvents: phase === 'exit' ? 'none' : 'auto',
    }} onClick={() => { setPhase('exit'); setTimeout(() => onDismiss(toast.id), 500); }}>
      <div onClick={e => e.stopPropagation()} style={{
        transform: phase === 'enter' ? 'scale(0.3) translateY(50px)' : phase === 'exit' ? 'scale(0.5) translateY(-30px)' : 'scale(1)',
        opacity: phase === 'enter' ? 0 : phase === 'exit' ? 0 : 1,
        transition: 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
        background: 'linear-gradient(135deg, #111 0%, #1a1a2e 100%)',
        border: '3px solid ' + colors.border,
        borderRadius: '24px',
        padding: '32px 40px',
        maxWidth: '400px',
        width: '90%',
        textAlign: 'center',
        boxShadow: '0 0 40px ' + colors.glow + ', 0 0 80px ' + colors.glow + ', 0 20px 60px rgba(0,0,0,0.5), inset 0 0 30px ' + colors.bg,
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Corner accents */}
        <div style={{ position: 'absolute', top: 8, left: 8, width: 20, height: 20, borderTop: '2px solid ' + colors.border, borderLeft: '2px solid ' + colors.border, borderRadius: '4px 0 0 0', opacity: 0.6 }}></div>
        <div style={{ position: 'absolute', top: 8, right: 8, width: 20, height: 20, borderTop: '2px solid ' + colors.border, borderRight: '2px solid ' + colors.border, borderRadius: '0 4px 0 0', opacity: 0.6 }}></div>
        <div style={{ position: 'absolute', bottom: 8, left: 8, width: 20, height: 20, borderBottom: '2px solid ' + colors.border, borderLeft: '2px solid ' + colors.border, borderRadius: '0 0 0 4px', opacity: 0.6 }}></div>
        <div style={{ position: 'absolute', bottom: 8, right: 8, width: 20, height: 20, borderBottom: '2px solid ' + colors.border, borderRight: '2px solid ' + colors.border, borderRadius: '0 0 4px 0', opacity: 0.6 }}></div>

        {/* Animated glow ring */}
        <div style={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          width: 120, height: 120, borderRadius: '50%',
          border: '1px solid ' + colors.border,
          opacity: 0.2,
          animation: 'achieveRing 2s ease-out infinite',
        }}></div>

        <style>{`
          @keyframes achieveRing { 0% { transform: translate(-50%,-50%) scale(0.8); opacity: 0.3; } 100% { transform: translate(-50%,-50%) scale(2); opacity: 0; } }
          @keyframes achieveShine { 0% { transform: translateX(-100%) rotate(25deg); } 100% { transform: translateX(200%) rotate(25deg); } }
          @keyframes achieveBounce { 0%,100% { transform: scale(1); } 50% { transform: scale(1.1); } }
        `}</style>

        {/* Shine effect */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflow: 'hidden', borderRadius: 24, pointerEvents: 'none' }}>
          <div style={{ position: 'absolute', top: -50, width: 40, height: 200, background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)', animation: 'achieveShine 3s ease-in-out infinite' }}></div>
        </div>

        {/* Trophy label */}
        <div style={{ fontSize: 10, fontWeight: 900, letterSpacing: 4, textTransform: 'uppercase', color: colors.border, marginBottom: 12 }}>
          Achievement Unlocked
        </div>

        {/* Icon */}
        <div style={{
          fontSize: 56, lineHeight: 1, marginBottom: 12,
          animation: 'achieveBounce 1s ease-in-out infinite',
          filter: 'drop-shadow(0 0 15px ' + colors.glow + ')',
        }}>
          {toast.icon || '\u2728'}
        </div>

        {/* Name */}
        <div style={{ fontSize: 24, fontWeight: 900, textTransform: 'uppercase', letterSpacing: -1, color: 'white', marginBottom: 6 }}>
          {toast.title}
        </div>

        {/* Description */}
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', fontWeight: 500, marginBottom: 16 }}>
          {toast.message}
        </div>

        {/* Tier badge + kanji */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
          <span style={{
            fontSize: 10, fontWeight: 900, textTransform: 'uppercase', letterSpacing: 2,
            padding: '4px 12px', borderRadius: 20,
            border: '1px solid ' + colors.border, color: colors.border,
          }}>
            {toast.tier || 'bronze'}
          </span>
          {toast.kanji && <span style={{ fontSize: 28, opacity: 0.3, color: 'white' }}>{toast.kanji}</span>}
        </div>

        {/* Tap to dismiss */}
        <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', marginTop: 16, fontWeight: 600 }}>
          Tap to dismiss
        </div>
      </div>
    </div>
  );
};

// ========== REGULAR TOAST (warning, success, info) ==========
const Toast = ({ toast, onDismiss }) => {
  useEffect(() => {
    const timer = setTimeout(() => onDismiss(toast.id), toast.duration || 5000);
    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, onDismiss]);

  const getIcon = () => {
    switch (toast.type) {
      case 'warning': return <AlertTriangle className="text-orange-500" size={20} />;
      case 'success': return <CheckCircle className="text-green-500" size={20} />;
      default: return null;
    }
  };

  const getBg = () => {
    switch (toast.type) {
      case 'warning': return 'bg-orange-50 dark:bg-orange-900/30 border-orange-400';
      case 'success': return 'bg-green-50 dark:bg-green-900/30 border-green-400';
      default: return 'bg-white dark:bg-gray-800 border-gray-300';
    }
  };

  return (
    <div className={`${getBg()} border-2 border-black rounded-2xl p-4 shadow-lg anime-border-sm flex items-start gap-3 min-w-[300px] max-w-[400px]`}
      style={{ animation: 'slideIn 0.3s ease-out' }}>
      <div className="shrink-0">{getIcon()}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h4 className="font-black uppercase text-sm tracking-tight">{toast.title}</h4>
            <p className="text-xs opacity-70 font-medium mt-1">{toast.message}</p>
          </div>
          <button onClick={() => onDismiss(toast.id)} className="opacity-40 hover:opacity-100 transition-opacity shrink-0"><X size={16} /></button>
        </div>
      </div>
    </div>
  );
};

// ========== CONTAINER ==========
export const ToastContainer = ({ toasts, onDismiss }) => {
  const achievements = toasts.filter(t => t.type === 'achievement');
  const others = toasts.filter(t => t.type !== 'achievement');

  return (
    <>
      {/* Achievement popups - center of screen */}
      {achievements.map(t => <AchievementPopup key={t.id} toast={t} onDismiss={onDismiss} />)}
      {/* Regular toasts - top right */}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-3">
        {others.map(t => <Toast key={t.id} toast={t} onDismiss={onDismiss} />)}
      </div>
    </>
  );
};

// ========== HOOK ==========
export function useToasts() {
  const [toasts, setToasts] = useState([]);

  const addToast = React.useCallback((toast) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { ...toast, id }]);
  }, []);

  const dismissToast = React.useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const showAchievement = React.useCallback((name, description, icon, tier, kanji) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, {
      id, type: 'achievement', title: name, message: description,
      icon: icon || '\u2728', tier: tier || 'bronze', kanji: kanji || '',
      duration: 6000
    }]);
  }, []);

  const showWarning = React.useCallback((title, message) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, type: 'warning', title, message, duration: 5000 }]);
  }, []);

  const showSuccess = React.useCallback((title, message) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, type: 'success', title, message, duration: 4000 }]);
  }, []);

  return { toasts, addToast, dismissToast, showAchievement, showWarning, showSuccess };
}

export default Toast;
