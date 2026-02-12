import React, { useEffect, useState } from 'react';
import { Achievement } from '../types';
import { getTierColor } from '../achievements';
import { X, Trophy, AlertTriangle, CheckCircle } from 'lucide-react';

export type ToastType = 'achievement' | 'warning' | 'success' | 'info';

export interface ToastData {
  id: string;
  type: ToastType;
  title: string;
  message: string;
  achievement?: Achievement;
  duration?: number;
}

interface ToastProps {
  toast: ToastData;
  onDismiss: (id: string) => void;
}

const Toast: React.FC<ToastProps> = ({ toast, onDismiss }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, toast.duration || 5000);
    
    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, onDismiss]);

  const getIcon = () => {
    switch (toast.type) {
      case 'achievement':
        return <Trophy className="text-yellow-500" size={24} />;
      case 'warning':
        return <AlertTriangle className="text-orange-500" size={24} />;
      case 'success':
        return <CheckCircle className="text-green-500" size={24} />;
      default:
        return null;
    }
  };

  const getBgColor = () => {
    switch (toast.type) {
      case 'achievement':
        return 'bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/30 dark:to-orange-900/30 border-yellow-400';
      case 'warning':
        return 'bg-orange-50 dark:bg-orange-900/30 border-orange-400';
      case 'success':
        return 'bg-green-50 dark:bg-green-900/30 border-green-400';
      default:
        return 'bg-white dark:bg-gray-800 border-gray-300';
    }
  };

  return (
    <div 
      className={`${getBgColor()} border-2 border-black rounded-2xl p-4 shadow-lg anime-border-sm flex items-start gap-4 animate-slide-in min-w-[320px] max-w-[420px]`}
      style={{ animation: 'slideIn 0.3s ease-out' }}
    >
      {toast.type === 'achievement' && toast.achievement ? (
        <div 
          className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl border-2 border-black shrink-0"
          style={{ backgroundColor: getTierColor(toast.achievement.tier) + '30' }}
        >
          {toast.achievement.icon}
        </div>
      ) : (
        <div className="shrink-0">{getIcon()}</div>
      )}
      
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h4 className="font-black uppercase text-sm tracking-tight">{toast.title}</h4>
            <p className="text-xs opacity-70 font-medium mt-1">{toast.message}</p>
            {toast.achievement && (
              <div className="mt-2 flex items-center gap-2">
                <span 
                  className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full border"
                  style={{ 
                    borderColor: getTierColor(toast.achievement.tier),
                    color: getTierColor(toast.achievement.tier)
                  }}
                >
                  {toast.achievement.tier}
                </span>
                <span className="text-lg opacity-50">{toast.achievement.kanji}</span>
              </div>
            )}
          </div>
          <button 
            onClick={() => onDismiss(toast.id)}
            className="opacity-40 hover:opacity-100 transition-opacity shrink-0"
          >
            <X size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

interface ToastContainerProps {
  toasts: ToastData[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-3">
      {toasts.map(toast => (
        <Toast key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
};

// Hook for managing toasts
export function useToasts() {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const addToast = React.useCallback((toast: Omit<ToastData, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { ...toast, id }]);
  }, []);

  const dismissToast = React.useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const showAchievement = React.useCallback((name: string, description: string, icon: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, {
      id,
      type: 'achievement' as ToastType,
      title: 'Achievement Unlocked!',
      message: description,
      duration: 6000
    }]);
  }, []);

  const showWarning = React.useCallback((title: string, message: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, {
      id,
      type: 'warning' as ToastType,
      title,
      message,
      duration: 5000
    }]);
  }, []);

  const showSuccess = React.useCallback((title: string, message: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, {
      id,
      type: 'success' as ToastType,
      title,
      message,
      duration: 4000
    }]);
  }, []);

  return {
    toasts,
    addToast,
    dismissToast,
    showAchievement,
    showWarning,
    showSuccess
  };
}

export default Toast;
