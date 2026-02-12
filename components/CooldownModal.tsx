import React, { useEffect, useState } from 'react';
import { CooldownState } from '../types';
import { Timer, Flame, Heart } from 'lucide-react';

interface CooldownModalProps {
  cooldown: CooldownState;
  onCooldownEnd: () => void;
}

const CooldownModal: React.FC<CooldownModalProps> = ({ cooldown, onCooldownEnd }) => {
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [progress, setProgress] = useState<number>(0);

  useEffect(() => {
    if (!cooldown.isActive || !cooldown.endsAt) return;

    const updateTimer = () => {
      const now = new Date().getTime();
      const end = new Date(cooldown.endsAt!).getTime();
      const diff = end - now;

      if (diff <= 0) {
        onCooldownEnd();
        return;
      }

      const minutes = Math.floor(diff / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${minutes}:${seconds.toString().padStart(2, '0')}`);

      // Calculate progress (assuming 15 min cooldown)
      const totalDuration = 15 * 60 * 1000;
      const elapsed = totalDuration - diff;
      setProgress((elapsed / totalDuration) * 100);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [cooldown, onCooldownEnd]);

  if (!cooldown.isActive) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
      <div className="bg-[#1a1a2e] border-4 border-[#e11d48] rounded-[2rem] p-8 max-w-md w-full anime-border-red text-white text-center relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-5 pointer-events-none">
          <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[20rem] font-black">禅</span>
        </div>

        <div className="relative z-10">
          {/* Breathing animation */}
          <div className="relative w-32 h-32 mx-auto mb-8">
            <div className="absolute inset-0 bg-[#e11d48]/20 rounded-full animate-ping"></div>
            <div className="absolute inset-4 bg-[#e11d48]/30 rounded-full animate-pulse"></div>
            <div className="absolute inset-8 bg-[#e11d48]/40 rounded-full flex items-center justify-center">
              <Heart size={40} className="text-[#e11d48] animate-pulse" />
            </div>
          </div>

          <h2 className="text-3xl font-black uppercase tracking-tighter mb-2">
            Meditation <span className="text-[#e11d48]">Required</span>
          </h2>
          
          <p className="text-sm opacity-70 mb-6 italic">
            "{cooldown.reason}"
          </p>

          <div className="bg-black/30 rounded-2xl p-6 mb-6">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Timer className="text-[#e11d48]" size={28} />
              <span className="text-5xl font-black tracking-tighter">{timeLeft}</span>
            </div>
            
            {/* Progress bar */}
            <div className="h-3 bg-black/50 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-[#e11d48] to-purple-500 rounded-full transition-all duration-1000"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>

          <div className="space-y-3 text-left">
            <h4 className="text-xs font-black uppercase tracking-widest opacity-60">During this time:</h4>
            <div className="flex items-start gap-3">
              <Flame className="text-orange-400 shrink-0 mt-0.5" size={16} />
              <p className="text-xs opacity-80">Take deep breaths and clear your mind</p>
            </div>
            <div className="flex items-start gap-3">
              <Flame className="text-orange-400 shrink-0 mt-0.5" size={16} />
              <p className="text-xs opacity-80">Review what went wrong in your recent trades</p>
            </div>
            <div className="flex items-start gap-3">
              <Flame className="text-orange-400 shrink-0 mt-0.5" size={16} />
              <p className="text-xs opacity-80">Remember: discipline conquers all</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CooldownModal;
