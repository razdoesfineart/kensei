import React, { useEffect, useState } from 'react';
import { X, AlertTriangle, CheckCircle } from 'lucide-react';

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

const tierColors = {
  bronze: { border: '#CD7F32', glow: 'rgba(205,127,50,0.4)' },
  silver: { border: '#C0C0C0', glow: 'rgba(192,192,192,0.4)' },
  gold: { border: '#FFD700', glow: 'rgba(255,215,0,0.5)' },
  legendary: { border: '#a855f7', glow: 'rgba(168,85,247,0.4)' },
  mythical: { border: '#e11d48', glow: 'rgba(225,29,72,0.5)' },
};

// Single achievement card
const AchievementCard = ({ toast, isActive, stackIndex, totalCards, onTap }) => {
  const colors = tierColors[toast.tier] || tierColors.gold;
  const offset = isActive ? 0 : stackIndex * 8;
  const scale = isActive ? 1 : 1 - stackIndex * 0.04;
  const rotate = isActive ? 0 : stackIndex * 2 - 1;

  return (
    <div onClick={onTap} style={{
      position: 'absolute',
      top: '50%', left: '50%',
      transform: 'translate(-50%, -50%) translateY(' + offset + 'px) scale(' + scale + ') rotate(' + rotate + 'deg)',
      transition: 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
      zIndex: isActive ? 50 : 40 - stackIndex,
      cursor: 'pointer',
      opacity: isActive ? 1 : 0.6 + (0.3 / (stackIndex + 1)),
      filter: isActive ? 'none' : 'brightness(0.7)',
      width: '90%', maxWidth: 380,
    }}>
      <div style={{
        background: 'linear-gradient(135deg, #111 0%, #1a1a2e 100%)',
        border: '3px solid ' + colors.border,
        borderRadius: 24, padding: '28px 32px',
        textAlign: 'center', position: 'relative', overflow: 'hidden',
        boxShadow: isActive
          ? '0 0 40px ' + colors.glow + ', 0 0 80px ' + colors.glow + ', 0 20px 60px rgba(0,0,0,0.5)'
          : '0 4px 20px rgba(0,0,0,0.3)',
      }}>
        {/* Corner accents */}
        {[['top','left'],['top','right'],['bottom','left'],['bottom','right']].map(([v,h]) => (
          <div key={v+h} style={{
            position:'absolute', [v]:8, [h]:8, width:18, height:18,
            ['border'+v.charAt(0).toUpperCase()+v.slice(1)]: '2px solid '+colors.border,
            ['border'+h.charAt(0).toUpperCase()+h.slice(1)]: '2px solid '+colors.border,
            opacity: 0.5, borderRadius: v==='top'&&h==='left'?'4px 0 0 0':v==='top'&&h==='right'?'0 4px 0 0':v==='bottom'&&h==='left'?'0 0 0 4px':'0 0 4px 0',
          }}></div>
        ))}

        {isActive && <style>{`
          @keyframes achRing { 0% { transform: translate(-50%,-50%) scale(0.8); opacity: 0.3; } 100% { transform: translate(-50%,-50%) scale(2.2); opacity: 0; } }
          @keyframes achShine { 0% { transform: translateX(-100%) rotate(25deg); } 100% { transform: translateX(300%) rotate(25deg); } }
          @keyframes achBounce { 0%,100% { transform: scale(1); } 50% { transform: scale(1.1); } }
        `}</style>}

        {/* Glow ring */}
        {isActive && <div style={{
          position:'absolute',top:'50%',left:'50%',transform:'translate(-50%,-50%)',
          width:110,height:110,borderRadius:'50%',border:'1px solid '+colors.border,
          opacity:0.2,animation:'achRing 2s ease-out infinite',
        }}></div>}

        {/* Shine */}
        {isActive && <div style={{position:'absolute',top:0,left:0,right:0,bottom:0,overflow:'hidden',borderRadius:24,pointerEvents:'none'}}>
          <div style={{position:'absolute',top:-50,width:35,height:200,background:'linear-gradient(90deg,transparent,rgba(255,255,255,0.1),transparent)',animation:'achShine 3s ease-in-out infinite'}}></div>
        </div>}

        {/* Card count indicator */}
        {totalCards > 1 && <div style={{
          position:'absolute',top:10,right:14,
          fontSize:10,fontWeight:900,color:'rgba(255,255,255,0.4)',letterSpacing:1,
        }}>{(totalCards - stackIndex)}/{totalCards}</div>}

        {/* Label */}
        <div style={{fontSize:9,fontWeight:900,letterSpacing:4,textTransform:'uppercase',color:colors.border,marginBottom:10}}>
          Achievement Unlocked
        </div>

        {/* Icon */}
        <div style={{
          fontSize:50,lineHeight:1,marginBottom:10,
          animation: isActive ? 'achBounce 1s ease-in-out infinite' : 'none',
          filter: isActive ? 'drop-shadow(0 0 12px '+colors.glow+')' : 'none',
        }}>{toast.icon || '\u2728'}</div>

        {/* Name */}
        <div style={{fontSize:22,fontWeight:900,textTransform:'uppercase',letterSpacing:-0.5,color:'white',marginBottom:5}}>
          {toast.title}
        </div>

        {/* Description */}
        <div style={{fontSize:12,color:'rgba(255,255,255,0.55)',fontWeight:500,marginBottom:14}}>
          {toast.message}
        </div>

        {/* Tier + kanji */}
        <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:10}}>
          <span style={{fontSize:9,fontWeight:900,textTransform:'uppercase',letterSpacing:2,padding:'3px 10px',borderRadius:16,border:'1px solid '+colors.border,color:colors.border}}>
            {toast.tier || 'bronze'}
          </span>
          {toast.kanji && <span style={{fontSize:24,opacity:0.25,color:'white'}}>{toast.kanji}</span>}
        </div>

        {/* Hint */}
        {isActive && totalCards > 1 && <div style={{fontSize:9,color:'rgba(255,255,255,0.25)',marginTop:12,fontWeight:600}}>
          Tap to see next
        </div>}
        {isActive && totalCards <= 1 && <div style={{fontSize:9,color:'rgba(255,255,255,0.25)',marginTop:12,fontWeight:600}}>
          Tap to dismiss
        </div>}
      </div>
    </div>
  );
};

// Achievement deck overlay
const AchievementDeck = ({ achievements, onDismissAll }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [dismissed, setDismissed] = useState([]);
  const remaining = achievements.filter(a => !dismissed.includes(a.id));

  const handleTap = () => {
    if (remaining.length <= 1) {
      onDismissAll();
      return;
    }
    setDismissed(prev => [...prev, remaining[0].id]);
  };

  if (remaining.length === 0) return null;

  return (
    <div style={{
      position:'fixed',inset:0,zIndex:200,
      display:'flex',alignItems:'center',justifyContent:'center',
      background:'rgba(0,0,0,0.65)',
    }}>
      {remaining.map((ach, i) => (
        <AchievementCard
          key={ach.id}
          toast={ach}
          isActive={i === 0}
          stackIndex={i}
          totalCards={remaining.length}
          onTap={handleTap}
        />
      ))}
    </div>
  );
};

// Regular toast
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

// Container
export const ToastContainer = ({ toasts, onDismiss }) => {
  const achievements = toasts.filter(t => t.type === 'achievement');
  const others = toasts.filter(t => t.type !== 'achievement');

  return (
    <>
      {achievements.length > 0 && (
        <AchievementDeck
          achievements={achievements}
          onDismissAll={() => achievements.forEach(a => onDismiss(a.id))}
        />
      )}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-3">
        {others.map(t => <Toast key={t.id} toast={t} onDismiss={onDismiss} />)}
      </div>
    </>
  );
};

// Hook
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
      duration: 30000
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
