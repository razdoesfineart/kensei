import React, { useState } from 'react';
import { View, Trade, Emotion } from '../types';
import AnimeCard from '../components/AnimeCard';
import { CheckCircle2, Circle, AlertTriangle, Send, TrendingUp, TrendingDown } from 'lucide-react';
import { calculatePnL, formatCurrency, formatPercent } from '../utils';

const EMOTIONS: Emotion[] = [
  { emoji: '😌', label: 'Calm', kanji: '静', color: 'bg-emerald-100' },
  { emoji: '😃', label: 'Excited', kanji: '興', color: 'bg-blue-100' },
  { emoji: '😰', label: 'Anxious', kanji: '不', color: 'bg-yellow-100' },
  { emoji: '😠', label: 'Angry', kanji: '怒', color: 'bg-red-100' },
  { emoji: '😔', label: 'Sad', kanji: '悲', color: 'bg-indigo-100' },
  { emoji: '😤', label: 'Frustrated', kanji: '苛', color: 'bg-orange-100' },
  { emoji: '🤔', label: 'Uncertain', kanji: '惑', color: 'bg-gray-100' },
  { emoji: '😎', label: 'Confident', kanji: '信', color: 'bg-green-100' },
  { emoji: '😱', label: 'Fearful', kanji: '恐', color: 'bg-purple-100' },
];

interface JournalProps {
  onSaveTrade: (trade: Trade) => void;
  setView: (view: View) => void;
  isCooldownActive: boolean;
}

const Journal: React.FC<JournalProps> = ({ onSaveTrade, setView, isCooldownActive }) => {
  const [step, setStep] = useState<number>(1);
  const [checklist, setChecklist] = useState({
    noFomo: false,
    exitPlan: false,
    riskLimit: false,
    chartAnalysis: false
  });
  const [selectedEmotion, setSelectedEmotion] = useState<string>('');
  const [tradeData, setTradeData] = useState({
    tokenName: '',
    tradeType: 'Long' as 'Long' | 'Short',
    entryPrice: '',
    exitPrice: '',
    positionSize: '',
    tradeReason: '',
    outcome: 'Win' as 'Win' | 'Loss'
  });

  // Calculate P&L preview
  const pnlPreview = tradeData.entryPrice && tradeData.exitPrice && tradeData.positionSize
    ? calculatePnL(
        tradeData.tradeType,
        parseFloat(tradeData.entryPrice),
        parseFloat(tradeData.exitPrice),
        parseFloat(tradeData.positionSize)
      )
    : null;

  // Auto-detect outcome from P&L
  const autoOutcome = pnlPreview ? (pnlPreview.pnl >= 0 ? 'Win' : 'Loss') : null;

  const handleCompleteJournal = () => {
    const { pnl, pnlPercent } = calculatePnL(
      tradeData.tradeType,
      parseFloat(tradeData.entryPrice),
      parseFloat(tradeData.exitPrice),
      parseFloat(tradeData.positionSize)
    );

    const newTrade: Trade = {
      id: Math.random().toString(36).substring(2, 9),
      ...tradeData,
      entryPrice: parseFloat(tradeData.entryPrice),
      exitPrice: parseFloat(tradeData.exitPrice),
      positionSize: parseFloat(tradeData.positionSize),
      emotion: selectedEmotion,
      timestamp: new Date().toISOString(),
      passedChecklist: Object.values(checklist).every(v => v === true),
      pnl,
      pnlPercent,
      outcome: pnl >= 0 ? 'Win' : 'Loss'
    };
    
    onSaveTrade(newTrade);
    setView(View.HOME);
  };

  const isStepValid = () => {
    if (step === 1) return true;
    if (step === 2) return selectedEmotion !== '';
    if (step === 3) return tradeData.tokenName !== '' && tradeData.entryPrice !== '' && tradeData.exitPrice !== '' && tradeData.positionSize !== '';
    return false;
  };

  if (isCooldownActive) {
    return (
      <div className="max-w-3xl mx-auto pb-10 text-center py-20">
        <span className="text-9xl mb-6 block">🧘</span>
        <h2 className="text-3xl font-black uppercase mb-2 text-black dark:text-white">Meditation in Progress</h2>
        <p className="text-gray-600 dark:text-gray-400 font-medium">You cannot log trades during cooldown. Use this time to reflect.</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto pb-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tighter text-black dark:text-white">Battle <span className="text-[#FF6B9D]">Log</span></h1>
        <div className="flex gap-2">
          {[1, 2, 3].map(s => (
            <div key={s} className={`w-3 h-3 rounded-full border-2 border-black transition-colors ${step >= s ? 'bg-[#FF6B9D]' : 'bg-gray-200'}`}></div>
          ))}
        </div>
      </div>

      {step === 1 && (
        <AnimeCard title="The Pre-Battle Ritual" subtitle="The wise warrior prepares before striking" variant="black">
          <p className="mb-6 text-sm font-medium text-gray-600 dark:text-gray-400">Honor the Bushido code by verifying your discipline before recording the battle results.</p>
          <div className="space-y-4 mb-8">
            <CheckItem 
              label="Is this trade free from FOMO?" 
              checked={checklist.noFomo} 
              onToggle={() => setChecklist(prev => ({...prev, noFomo: !prev.noFomo}))} 
            />
            <CheckItem 
              label="Do you have a clear exit strategy?" 
              checked={checklist.exitPlan} 
              onToggle={() => setChecklist(prev => ({...prev, exitPlan: !prev.exitPlan}))} 
            />
            <CheckItem 
              label="Is the risk within your established limits?" 
              checked={checklist.riskLimit} 
              onToggle={() => setChecklist(prev => ({...prev, riskLimit: !prev.riskLimit}))} 
            />
            <CheckItem 
              label="Have you performed full technical analysis?" 
              checked={checklist.chartAnalysis} 
              onToggle={() => setChecklist(prev => ({...prev, chartAnalysis: !prev.chartAnalysis}))} 
            />
          </div>
          {!Object.values(checklist).every(v => v) && (
            <div className="p-4 bg-orange-50 dark:bg-orange-950/20 border-2 border-orange-200 dark:border-orange-800 rounded-2xl flex items-center gap-4 mb-8">
              <AlertTriangle className="text-orange-500 shrink-0" />
              <p className="text-xs font-bold text-orange-700 dark:text-orange-300 uppercase">Warning: A true samurai maintains perfect discipline in all strikes.</p>
            </div>
          )}
          <button 
            onClick={() => setStep(2)}
            className="w-full bg-black text-white py-4 rounded-2xl font-black uppercase tracking-widest anime-border-sm hover:-translate-y-1 transition-transform"
          >
            Enter Spirit Check
          </button>
        </AnimeCard>
      )}

      {step === 2 && (
        <AnimeCard title="Spirit Check" subtitle="A calm mind leads to victory" variant="pink">
          <div className="grid grid-cols-3 gap-4 mb-8">
            {EMOTIONS.map(e => (
              <button
                key={e.label}
                onClick={() => setSelectedEmotion(e.label)}
                className={`flex flex-col items-center justify-center p-4 rounded-2xl border-4 transition-all ${
                  selectedEmotion === e.label 
                  ? 'border-black bg-[#FF6B9D] text-white scale-105 anime-border-sm' 
                  : 'border-transparent bg-gray-100 dark:bg-gray-800/50 grayscale hover:grayscale-0'
                }`}
              >
                <span className="text-4xl mb-1">{e.emoji}</span>
                <span className={`text-[10px] font-black uppercase tracking-tighter ${selectedEmotion === e.label ? 'text-white' : 'text-black dark:text-white'}`}>{e.label}</span>
                <span className={`text-sm font-bold ${selectedEmotion === e.label ? 'text-white/60' : 'text-gray-500 dark:text-gray-400'}`}>{e.kanji}</span>
              </button>
            ))}
          </div>
          <div className="flex gap-4">
            <button onClick={() => setStep(1)} className="flex-1 border-4 border-black py-4 rounded-2xl font-black uppercase text-black dark:text-white bg-white dark:bg-gray-800">Back</button>
            <button 
              disabled={!selectedEmotion}
              onClick={() => setStep(3)}
              className="flex-[2] bg-black text-white py-4 rounded-2xl font-black uppercase tracking-widest anime-border-sm disabled:opacity-50"
            >
              Log Details
            </button>
          </div>
        </AnimeCard>
      )}

      {step === 3 && (
        <AnimeCard title="Battle Statistics" subtitle="History remembers the disciplined" variant="cyan">
          <div className="space-y-4 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputGroup label="Token Symbol" placeholder="e.g., SOL, BTC" value={tradeData.tokenName} onChange={(v) => setTradeData({...tradeData, tokenName: v.toUpperCase()})} />
              <div>
                <label className="block text-xs font-black uppercase mb-2 text-gray-600 dark:text-gray-400">Battle Type</label>
                <div className="flex gap-2">
                  <button onClick={() => setTradeData({...tradeData, tradeType: 'Long'})} className={`flex-1 py-3 rounded-xl border-2 font-bold ${tradeData.tradeType === 'Long' ? 'bg-[#4ECDC4] border-black text-white' : 'border-gray-300 dark:border-gray-600 text-black dark:text-white bg-white dark:bg-gray-800'}`}>Long ⬆️</button>
                  <button onClick={() => setTradeData({...tradeData, tradeType: 'Short'})} className={`flex-1 py-3 rounded-xl border-2 font-bold ${tradeData.tradeType === 'Short' ? 'bg-[#FF6B9D] border-black text-white' : 'border-gray-300 dark:border-gray-600 text-black dark:text-white bg-white dark:bg-gray-800'}`}>Short ⬇️</button>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <InputGroup label="Entry Price" type="number" placeholder="0.00" value={tradeData.entryPrice} onChange={(v) => setTradeData({...tradeData, entryPrice: v})} />
              <InputGroup label="Exit Price" type="number" placeholder="0.00" value={tradeData.exitPrice} onChange={(v) => setTradeData({...tradeData, exitPrice: v})} />
              <InputGroup label="Pos. Size ($)" type="number" placeholder="0" value={tradeData.positionSize} onChange={(v) => setTradeData({...tradeData, positionSize: v})} />
            </div>

            {/* P&L Preview */}
            {pnlPreview && (
              <div className={`p-6 rounded-2xl border-4 border-black ${pnlPreview.pnl >= 0 ? 'bg-[#4ECDC4]' : 'bg-[#FF6B9D]'} text-white`}>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-black uppercase tracking-widest opacity-80 flex items-center gap-2">
                      {pnlPreview.pnl >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                      Calculated P&L
                    </span>
                    <span className="text-3xl font-black block mt-1">{formatCurrency(pnlPreview.pnl)}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-black uppercase tracking-widest opacity-80">Percentage</span>
                    <span className="text-2xl font-black block mt-1">{formatPercent(pnlPreview.pnlPercent)}</span>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-white/20">
                  <span className="text-sm font-bold">
                    Auto-detected: <span className="uppercase">{autoOutcome === 'Win' ? '⚔️ Victory' : '🩸 Defeat'}</span>
                  </span>
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-black uppercase mb-2 opacity-60 tracking-tight">Trade Reason (Optional)</label>
              <textarea 
                value={tradeData.tradeReason}
                onChange={(e) => setTradeData({...tradeData, tradeReason: e.target.value})}
                placeholder="Why did you take this trade? What was your setup?"
                className="w-full bg-gray-50 dark:bg-gray-800/50 border-2 border-black p-3 rounded-xl focus:outline-none focus:ring-4 ring-[#4ECDC4]/20 transition-all font-medium text-sm h-24 resize-none"
              />
            </div>
          </div>
          
          <div className="flex gap-4">
            <button onClick={() => setStep(2)} className="flex-1 border-4 border-black py-4 rounded-2xl font-black uppercase">Back</button>
            <button 
              disabled={!isStepValid()}
              onClick={handleCompleteJournal}
              className="flex-[2] bg-black text-white py-4 rounded-2xl font-black uppercase tracking-widest anime-border-sm disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Send size={20} /> Save Chronicle
            </button>
          </div>
        </AnimeCard>
      )}
    </div>
  );
};

const CheckItem = ({ label, checked, onToggle }: { label: string, checked: boolean, onToggle: () => void }) => (
  <button 
    onClick={onToggle}
    className={`w-full p-4 rounded-2xl border-2 flex items-center justify-between transition-all ${checked ? 'border-black bg-green-50 dark:bg-green-950/20' : 'border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800/50'}`}
  >
    <span className={`text-sm font-bold ${checked ? 'text-green-800 dark:text-green-300' : 'text-gray-600 dark:text-gray-400'}`}>{label}</span>
    {checked ? <CheckCircle2 className="text-green-500" /> : <Circle className="text-gray-400 dark:text-gray-500" />}
  </button>
);

const InputGroup = ({ label, value, onChange, placeholder, type = 'text' }: { label: string, value: string, onChange: (v: string) => void, placeholder: string, type?: string }) => (
  <div>
    <label className="block text-xs font-black uppercase mb-2 text-gray-600 dark:text-gray-400 tracking-tight">{label}</label>
    <input 
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full bg-gray-100 dark:bg-gray-800/50 border-2 border-black p-3 rounded-xl focus:outline-none focus:ring-4 ring-[#FF6B9D]/20 transition-all font-bold text-black dark:text-white"
    />
  </div>
);

export default Journal;
