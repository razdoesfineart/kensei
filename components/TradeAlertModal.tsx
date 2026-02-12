import React, { useState, useEffect } from 'react';
import { DetectedTrade, PendingTrade } from '../types';
import { AlertTriangle, Clock, CheckCircle2, Circle, TrendingUp, TrendingDown, Zap } from 'lucide-react';

interface TradeAlertModalProps {
  pendingTrade: PendingTrade;
  onComplete: (emotion: string, checklist: boolean, notes: string) => void;
  onMiss: () => void;
  escalationLevel: number; // 0-4, shows how many times user has missed
}

const EMOTIONS = [
  { emoji: '😌', label: 'Calm', kanji: '静', color: '#4ECDC4' },
  { emoji: '😃', label: 'Confident', kanji: '信', color: '#FFE66D' },
  { emoji: '😰', label: 'Anxious', kanji: '不', color: '#FF6B9D' },
  { emoji: '😤', label: 'FOMO', kanji: '焦', color: '#FF4444' },
  { emoji: '🤑', label: 'Greedy', kanji: '貪', color: '#9333ea' },
  { emoji: '😎', label: 'Excited', kanji: '興', color: '#4ECDC4' },
];

const CHECKLIST_ITEMS = [
  'This trade aligns with my strategy',
  'I have a clear exit plan',
  'Risk is within my limits',
  'I\'m not chasing or FOMOing'
];

const TradeAlertModal: React.FC<TradeAlertModalProps> = ({
  pendingTrade,
  onComplete,
  onMiss,
  escalationLevel
}) => {
  const [selectedEmotion, setSelectedEmotion] = useState<string>('');
  const [checklist, setChecklist] = useState<Record<number, boolean>>({});
  const [notes, setNotes] = useState('');
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [step, setStep] = useState<1 | 2>(1);

  const trade = pendingTrade.trade;
  const deadline = new Date(pendingTrade.deadlineAt).getTime();

  // Countdown timer
  useEffect(() => {
    const updateTimer = () => {
      const now = Date.now();
      const remaining = Math.max(0, Math.floor((deadline - now) / 1000));
      setTimeLeft(remaining);

      if (remaining === 0) {
        onMiss();
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [deadline, onMiss]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const allChecked = Object.keys(checklist).length === CHECKLIST_ITEMS.length && 
                     Object.values(checklist).every(v => v);

  const handleComplete = () => {
    if (selectedEmotion) {
      onComplete(selectedEmotion, allChecked, notes);
    }
  };

  const getEscalationWarning = () => {
    const penalties = [2, 5, 10, 20, 60];
    const nextPenalty = penalties[Math.min(escalationLevel, penalties.length - 1)];
    const futurepenalty = penalties[Math.min(escalationLevel + 1, penalties.length - 1)];
    
    if (escalationLevel === 0) {
      return `First offense: ${nextPenalty} min cooldown if missed`;
    }
    return `Warning: ${nextPenalty} min cooldown → Next: ${futurepenalty} min`;
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="bg-white dark:bg-[#1a1a2e] rounded-3xl border-4 border-black max-w-lg w-full max-h-[90vh] overflow-y-auto anime-border">
        {/* Header */}
        <div className={`p-6 border-b-4 border-black ${trade.type === 'BUY' ? 'bg-[#4ECDC4]' : 'bg-[#FF6B9D]'}`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-xl border-2 border-black flex items-center justify-center ${trade.type === 'BUY' ? 'bg-white/20' : 'bg-white/20'}`}>
                {trade.type === 'BUY' ? <TrendingUp size={24} className="text-white" /> : <TrendingDown size={24} className="text-white" />}
              </div>
              <div>
                <span className="text-white text-xs font-bold uppercase tracking-widest opacity-80">Trade Detected</span>
                <h2 className="text-white text-2xl font-black uppercase">{trade.type} {trade.tokenSymbol}</h2>
              </div>
            </div>
            {trade.tokenLogo && (
              <img 
                src={trade.tokenLogo} 
                alt={trade.tokenSymbol}
                className="w-12 h-12 rounded-full border-2 border-white"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
            )}
          </div>

          {/* Trade Details */}
          <div className="grid grid-cols-2 gap-3 text-white">
            <div className="bg-white/20 rounded-xl p-3">
              <span className="text-[10px] font-bold uppercase opacity-70">Amount</span>
              <span className="block text-lg font-black">{trade.amount.toLocaleString(undefined, { maximumFractionDigits: 4 })}</span>
            </div>
            <div className="bg-white/20 rounded-xl p-3">
              <span className="text-[10px] font-bold uppercase opacity-70">Value</span>
              <span className="block text-lg font-black">${trade.totalValue.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Timer Warning */}
        <div className={`p-4 flex items-center justify-between ${timeLeft < 30 ? 'bg-red-100 dark:bg-red-900/30' : 'bg-yellow-50 dark:bg-yellow-900/20'}`}>
          <div className="flex items-center gap-3">
            <AlertTriangle className={`${timeLeft < 30 ? 'text-red-500 animate-pulse' : 'text-yellow-600'}`} size={24} />
            <div>
              <span className="text-xs font-bold uppercase text-gray-600 dark:text-gray-400">Complete your log or face cooldown</span>
              <p className="text-[10px] text-gray-500 dark:text-gray-500">{getEscalationWarning()}</p>
            </div>
          </div>
          <div className={`text-2xl font-black ${timeLeft < 30 ? 'text-red-500 animate-pulse' : 'text-yellow-600'}`}>
            <Clock className="inline mr-1" size={20} />
            {formatTime(timeLeft)}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {step === 1 ? (
            <>
              {/* Emotion Selection */}
              <div>
                <h3 className="text-lg font-black uppercase mb-4 flex items-center gap-2 text-black dark:text-white">
                  <Zap className="text-yellow-500" size={20} />
                  How are you feeling?
                </h3>
                <div className="grid grid-cols-3 gap-2">
                  {EMOTIONS.map(e => (
                    <button
                      key={e.label}
                      onClick={() => setSelectedEmotion(e.label)}
                      className={`p-3 rounded-xl border-2 transition-all ${
                        selectedEmotion === e.label
                          ? 'border-black bg-gray-100 dark:bg-gray-700 scale-105'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-400'
                      }`}
                    >
                      <span className="text-2xl block">{e.emoji}</span>
                      <span className="text-[10px] font-bold uppercase text-black dark:text-white">{e.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={() => setStep(2)}
                disabled={!selectedEmotion}
                className="w-full bg-black text-white py-4 rounded-xl font-black uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next: Quick Checklist
              </button>
            </>
          ) : (
            <>
              {/* Checklist */}
              <div>
                <h3 className="text-lg font-black uppercase mb-4 text-black dark:text-white">Quick Discipline Check</h3>
                <div className="space-y-2">
                  {CHECKLIST_ITEMS.map((item, i) => (
                    <button
                      key={i}
                      onClick={() => setChecklist(prev => ({ ...prev, [i]: !prev[i] }))}
                      className={`w-full p-3 rounded-xl border-2 flex items-center justify-between transition-all ${
                        checklist[i] 
                          ? 'border-green-500 bg-green-50 dark:bg-green-900/20' 
                          : 'border-gray-200 dark:border-gray-700'
                      }`}
                    >
                      <span className={`text-sm font-medium ${checklist[i] ? 'text-green-700 dark:text-green-300' : 'text-gray-600 dark:text-gray-400'}`}>
                        {item}
                      </span>
                      {checklist[i] ? (
                        <CheckCircle2 className="text-green-500" size={20} />
                      ) : (
                        <Circle className="text-gray-300" size={20} />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes (optional) */}
              <div>
                <label className="block text-xs font-bold uppercase mb-2 text-gray-600 dark:text-gray-400">
                  Quick Note (Optional)
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Why this trade?"
                  className="w-full p-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-black dark:text-white"
                />
              </div>

              {/* Warning if not all checked */}
              {!allChecked && (
                <div className="p-3 bg-orange-50 dark:bg-orange-900/20 border-2 border-orange-200 rounded-xl">
                  <p className="text-xs font-bold text-orange-700 dark:text-orange-300">
                    ⚠️ You haven't confirmed all discipline checks. Trading without discipline leads to losses.
                  </p>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 border-2 border-black py-3 rounded-xl font-bold text-black dark:text-white"
                >
                  Back
                </button>
                <button
                  onClick={handleComplete}
                  className="flex-[2] bg-[#4ECDC4] text-white py-3 rounded-xl font-black uppercase tracking-widest"
                >
                  Complete Log
                </button>
              </div>
            </>
          )}
        </div>

        {/* Selected Emotion Badge */}
        {selectedEmotion && (
          <div className="absolute top-4 right-4">
            <div className="bg-white dark:bg-gray-800 px-3 py-1 rounded-full border-2 border-black text-sm font-bold">
              {EMOTIONS.find(e => e.label === selectedEmotion)?.emoji} {selectedEmotion}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TradeAlertModal;
