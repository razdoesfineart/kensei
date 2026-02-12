import React, { useState } from 'react';
import { Brain, CheckCircle } from 'lucide-react';

interface RealityCheckModalProps {
  isOpen: boolean;
  onComplete: () => void;
}

const EMOTIONS = [
  { emoji: '😌', label: 'Calm', color: 'bg-emerald-100 border-emerald-400' },
  { emoji: '😃', label: 'Good', color: 'bg-blue-100 border-blue-400' },
  { emoji: '😰', label: 'Anxious', color: 'bg-yellow-100 border-yellow-400' },
  { emoji: '😤', label: 'Frustrated', color: 'bg-orange-100 border-orange-400' },
  { emoji: '😔', label: 'Down', color: 'bg-indigo-100 border-indigo-400' },
];

const RealityCheckModal: React.FC<RealityCheckModalProps> = ({ isOpen, onComplete }) => {
  const [selectedEmotion, setSelectedEmotion] = useState<string>('');
  const [step, setStep] = useState(1);

  if (!isOpen) return null;

  const handleContinue = () => {
    if (step === 1 && selectedEmotion) {
      setStep(2);
    } else if (step === 2) {
      setSelectedEmotion('');
      setStep(1);
      onComplete();
    }
  };

  const isNegativeEmotion = ['Anxious', 'Frustrated', 'Down'].includes(selectedEmotion);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[150] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#1a1a2e] border-4 border-black rounded-[2rem] p-8 max-w-md w-full anime-border text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
          <span className="text-9xl font-black">心</span>
        </div>

        <div className="relative z-10">
          <div className="w-16 h-16 mx-auto mb-6 bg-purple-100 dark:bg-purple-900/30 rounded-2xl border-2 border-black flex items-center justify-center">
            <Brain className="text-purple-600" size={32} />
          </div>

          <h2 className="text-2xl font-black uppercase tracking-tighter mb-2">
            Reality <span className="text-purple-600">Check</span>
          </h2>

          {step === 1 && (
            <>
              <p className="text-sm opacity-70 mb-6">
                A true samurai knows their emotional state. How are you feeling right now?
              </p>

              <div className="grid grid-cols-5 gap-2 mb-6">
                {EMOTIONS.map(e => (
                  <button
                    key={e.label}
                    onClick={() => setSelectedEmotion(e.label)}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${
                      selectedEmotion === e.label 
                        ? `${e.color} border-black scale-105` 
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-400'
                    }`}
                  >
                    <span className="text-2xl mb-1">{e.emoji}</span>
                    <span className="text-[8px] font-bold uppercase">{e.label}</span>
                  </button>
                ))}
              </div>

              <button
                onClick={handleContinue}
                disabled={!selectedEmotion}
                className="w-full bg-black text-white py-4 rounded-2xl font-black uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] transition-transform"
              >
                Continue
              </button>
            </>
          )}

          {step === 2 && (
            <>
              {isNegativeEmotion ? (
                <div className="bg-orange-50 dark:bg-orange-900/20 border-2 border-orange-300 rounded-2xl p-4 mb-6 text-left">
                  <h4 className="font-black text-orange-700 dark:text-orange-300 text-sm uppercase mb-2">⚠️ Caution Advised</h4>
                  <p className="text-xs text-orange-600 dark:text-orange-400">
                    You're feeling <strong>{selectedEmotion.toLowerCase()}</strong>. Trading in this state often leads to poor decisions. Consider taking a break or reducing your position sizes.
                  </p>
                </div>
              ) : (
                <div className="bg-green-50 dark:bg-green-900/20 border-2 border-green-300 rounded-2xl p-4 mb-6 text-left">
                  <h4 className="font-black text-green-700 dark:text-green-300 text-sm uppercase mb-2">✨ Optimal State</h4>
                  <p className="text-xs text-green-600 dark:text-green-400">
                    You're feeling <strong>{selectedEmotion.toLowerCase()}</strong>. This is a good mindset for trading. Remember to stick to your plan!
                  </p>
                </div>
              )}

              <button
                onClick={handleContinue}
                className="w-full bg-black text-white py-4 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform"
              >
                <CheckCircle size={20} /> Acknowledged
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default RealityCheckModal;
