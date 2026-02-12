import React from 'react';
import AnimeCard from '../components/AnimeCard';
import { Sparkles, Zap, Star, HelpCircle, Lock } from 'lucide-react';

interface GuardianProps {
  streak: number;
}

const MysteryGuardian: React.FC<{ level: number }> = ({ level }) => {
  return (
    <div className="w-full h-full flex items-center justify-center relative">
      {/* Subtle animated glow rings */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div 
          className="w-48 h-48 rounded-full border border-purple-500/20 animate-ping" 
          style={{ animationDuration: '3s' }} 
        />
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        <div 
          className="w-64 h-64 rounded-full border border-purple-400/10 animate-ping" 
          style={{ animationDuration: '4s', animationDelay: '1s' }} 
        />
      </div>

      {/* Question mark */}
      <div className="relative z-10 flex flex-col items-center gap-4">
        <div className="text-[10rem] font-black text-purple-500/30 leading-none select-none animate-pulse" style={{ animationDuration: '2.5s' }}>
          ?
        </div>
        <div className="bg-white/5 backdrop-blur-sm px-6 py-2 rounded-full border border-white/10">
          <span className="text-white/40 text-xs font-black uppercase tracking-[0.3em]">
            {level === 0 ? 'Awaiting Awakening' : `Spirit Level ${level}`}
          </span>
        </div>
      </div>

      {/* Corner particles */}
      {level > 0 && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-8 left-8 w-1 h-1 bg-purple-400 rounded-full animate-ping" style={{ animationDelay: '0s' }} />
          <div className="absolute top-12 right-12 w-1 h-1 bg-purple-300 rounded-full animate-ping" style={{ animationDelay: '0.5s' }} />
          <div className="absolute bottom-16 left-16 w-1 h-1 bg-indigo-400 rounded-full animate-ping" style={{ animationDelay: '1s' }} />
          <div className="absolute bottom-8 right-8 w-1 h-1 bg-purple-500 rounded-full animate-ping" style={{ animationDelay: '1.5s' }} />
        </div>
      )}
    </div>
  );
};

const Guardian: React.FC<GuardianProps> = ({ streak }) => {
  const getEvolutionStage = () => {
    if (streak >= 30) return { level: 5, name: '???', color: '#a855f7', skill: '???' };
    if (streak >= 20) return { level: 4, name: '???', color: '#9333ea', skill: '???' };
    if (streak >= 10) return { level: 3, name: '???', color: '#7c3aed', skill: '???' };
    if (streak >= 5) return { level: 2, name: '???', color: '#6b21a8', skill: '???' };
    return { level: 1, name: '???', color: '#4c1d95', skill: '???' };
  };

  const stage = getEvolutionStage();
  const nextStageDays = [5, 10, 20, 30].find(d => d > streak) || 30;

  return (
    <div className="space-y-8 pb-10">
      <div className="text-center relative">
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 text-8xl opacity-5 select-none font-black text-purple-600">魂</div>
        <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-black dark:text-white">Your <span className="text-purple-600">Spirit</span></h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 font-medium italic">"The guardian only reveals its true form to the disciplined soul."</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <div className="flex flex-col items-center">
          <div className="relative w-full max-w-md aspect-square flex items-center justify-center">
            {/* Ambient glow */}
            <div className="absolute inset-0 bg-purple-500 rounded-full blur-[80px] opacity-10 animate-pulse" style={{ animationDuration: '3s' }}></div>
            
            {/* Main container — solid black bg */}
            <div className="z-10 bg-black w-full h-full rounded-[4rem] border-8 border-black flex flex-col items-center justify-center relative overflow-hidden">
              {/* Background kanji watermark */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03]">
                <span className="text-[15rem] font-black rotate-12 text-white">クナイ</span>
              </div>

              {/* Mystery Guardian */}
              <div className="w-full h-full p-8 flex items-center justify-center relative z-20">
                <MysteryGuardian level={stage.level} />
              </div>
            </div>
          </div>
          
          <div className="mt-8 text-center">
            <h2 className="text-3xl font-black uppercase tracking-tighter mb-1 text-purple-600">{stage.name}</h2>
            <div className="inline-flex items-center gap-2 bg-black text-white px-6 py-2 rounded-full text-sm font-black uppercase tracking-widest border-2 border-purple-500/30">
              <HelpCircle size={16} className="text-purple-400" />
              Level {stage.level} Guardian
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <AnimeCard title="Guardian Stats" variant="black">
            <div className="space-y-4">
              <ProgressBar label="Soul Synergy" progress={Math.min((streak / 30) * 100, 100)} color="bg-purple-600" />
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 border-2 border-black rounded-2xl text-center bg-purple-50 dark:bg-purple-900/10">
                  <Star className="mx-auto mb-2 text-purple-500" />
                  <span className="block text-[10px] font-black uppercase text-gray-600 dark:text-gray-400">Active Power</span>
                  <span className="text-sm font-bold text-black dark:text-white">{stage.skill}</span>
                </div>
                <div className="p-4 border-2 border-black rounded-2xl text-center bg-white dark:bg-gray-800/50">
                  <Zap className="mx-auto mb-2 text-indigo-500" />
                  <span className="block text-[10px] font-black uppercase text-gray-600 dark:text-gray-400">Honor XP</span>
                  <span className="text-sm font-bold text-black dark:text-white">{streak * 50} pts</span>
                </div>
              </div>
            </div>
          </AnimeCard>

          <AnimeCard title="Evolution Stages" variant="black">
            <div className="space-y-3">
              <EvolutionStep level={1} name="???" days="0-4 Days" current={stage.level === 1} unlocked={streak >= 0} />
              <EvolutionStep level={2} name="???" days="5-9 Days" current={stage.level === 2} unlocked={streak >= 5} />
              <EvolutionStep level={3} name="???" days="10-19 Days" current={stage.level === 3} unlocked={streak >= 10} />
              <EvolutionStep level={4} name="???" days="20-29 Days" current={stage.level === 4} unlocked={streak >= 20} />
              <EvolutionStep level={5} name="???" days="30+ Days" current={stage.level === 5} unlocked={streak >= 30} />
            </div>
            
            {streak < 30 && (
              <div className="mt-6 p-4 bg-purple-50 dark:bg-purple-900/10 rounded-2xl border-2 border-dashed border-purple-200 text-center">
                <p className="text-xs font-bold text-purple-800 dark:text-purple-300 uppercase italic">
                  Complete {nextStageDays - streak} more disciplined days to reveal your spirit's next form.
                </p>
              </div>
            )}
          </AnimeCard>
        </div>
      </div>
    </div>
  );
};

const ProgressBar = ({ label, progress, color }: { label: string, progress: number, color: string }) => (
  <div>
    <div className="flex justify-between mb-1">
      <span className="text-xs font-black uppercase text-gray-600 dark:text-gray-400 tracking-widest">{label}</span>
      <span className="text-xs font-black text-black dark:text-white">{Math.round(progress)}%</span>
    </div>
    <div className="h-6 bg-gray-200 dark:bg-gray-800 border-2 border-black rounded-full overflow-hidden">
      <div className={`h-full ${color} rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(168,85,247,0.5)]`} style={{ width: `${progress}%` }}></div>
    </div>
  </div>
);

const EvolutionStep = ({ level, name, days, current, unlocked }: { level: number, name: string, days: string, current: boolean, unlocked: boolean }) => (
  <div className={`flex items-center gap-4 p-3 border-2 rounded-xl transition-all ${
    current 
      ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/20 translate-x-1' 
      : unlocked ? 'border-black bg-white dark:bg-gray-800' : 'border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-800/50'
  }`}>
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black ${unlocked ? 'bg-black text-white' : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400'}`}>
      {unlocked ? level : <Lock size={16} />}
    </div>
    <div className="flex-1">
      <h4 className={`text-sm font-black uppercase tracking-tight ${unlocked ? 'text-black dark:text-white' : 'text-gray-500 dark:text-gray-500'}`}>
        {name}
      </h4>
      <p className={`text-[10px] font-bold tracking-wider ${unlocked ? 'text-gray-600 dark:text-gray-400' : 'text-gray-400 dark:text-gray-600'}`}>{days}</p>
    </div>
    {current && <div className="bg-purple-600 text-white px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest">Active</div>}
    {unlocked && !current && <div className="text-green-500 text-xs">✓</div>}
  </div>
);

export default Guardian;
