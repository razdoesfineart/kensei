import React from 'react';
import { Achievement } from '../types';
import { calculateTotalXP, getCurrentStage, getNextStage, getXPProgress, hasHatched, EVOLUTION_STAGES, ACHIEVEMENT_XP } from '../xp';
import { Lock } from 'lucide-react';

interface GuardianProps { streak: number; achievements?: Achievement[]; }

const Guardian: React.FC<GuardianProps> = ({ streak, achievements = [] }) => {
  const totalXP = calculateTotalXP(achievements);
  const { current, next, progress, xpToNext } = getXPProgress(totalXP);
  const hatched = hasHatched(totalXP);

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-10">
      <div className="text-center">
        <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-black dark:text-white">
          Your <span className="text-purple-500">Spirit</span>
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 italic mt-2">
          {hatched ? '"The spirit grows stronger with each disciplined battle."' : '"The guardian only reveals its true form to the disciplined soul."'}
        </p>
      </div>

      {/* Guardian Visual */}
      <div className="relative bg-black rounded-3xl border-4 border-gray-800 overflow-hidden" style={{ minHeight: 320 }}>
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 via-black to-black"></div>
        {hatched ? (
          <div className="relative flex flex-col items-center justify-center py-8">
            <img src="/guardian_hatch.gif" alt="Spirit Guardian" className="w-64 h-64 object-contain"
              style={{ filter: 'drop-shadow(0 0 20px rgba(168,85,247,0.4)) drop-shadow(0 0 40px rgba(168,85,247,0.2))' }} />
            <div className="mt-4 px-6 py-2 bg-purple-900/40 rounded-full border border-purple-700/50">
              <span className="text-sm font-black uppercase tracking-widest text-purple-300">{current.name}</span>
            </div>
          </div>
        ) : (
          <div className="relative flex flex-col items-center justify-center py-12">
            <div className="relative">
              <div className="text-[10rem] leading-none text-purple-500/40 font-black animate-pulse">?</div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-32 h-32 rounded-full border-2 border-purple-500/20 animate-ping" style={{ animationDuration: '3s' }}></div>
              </div>
            </div>
            <div className="mt-4 px-6 py-2 bg-gray-800/60 rounded-full border border-gray-700">
              <span className="text-sm font-bold text-gray-400">Mystery Egg</span>
            </div>
          </div>
        )}
        <div className="absolute top-4 left-4 w-2 h-2 bg-purple-500 rounded-full animate-ping" style={{ animationDuration: '2s' }}></div>
        <div className="absolute top-4 right-4 w-2 h-2 bg-purple-500 rounded-full animate-ping" style={{ animationDuration: '3s' }}></div>
        <div className="absolute bottom-4 left-4 w-2 h-2 bg-purple-500 rounded-full animate-ping" style={{ animationDuration: '2.5s' }}></div>
        <div className="absolute bottom-4 right-4 w-2 h-2 bg-purple-500 rounded-full animate-ping" style={{ animationDuration: '3.5s' }}></div>
      </div>

      {/* XP Progress */}
      <div className="bg-gray-100 dark:bg-gray-800/50 rounded-2xl border-4 border-black p-6">
        <div className="flex items-center justify-between mb-3">
          <div>
            <span className="text-xs font-black uppercase tracking-widest text-purple-500">Soul Energy</span>
            <span className="text-2xl font-black text-black dark:text-white block">{totalXP.toLocaleString()} XP</span>
          </div>
          <div className="text-right">
            <span className="text-xs font-bold text-gray-500 uppercase">Level {current.level}</span>
            {next ? <span className="text-xs font-bold text-gray-400 block">{xpToNext.toLocaleString()} XP to next</span>
              : <span className="text-xs font-bold text-green-500 block">MAX LEVEL</span>}
          </div>
        </div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden border-2 border-black">
          <div className="h-full rounded-full transition-all duration-1000 bg-gradient-to-r from-purple-600 to-purple-400" style={{ width: progress + '%' }}></div>
        </div>
        {next && <p className="text-[10px] text-gray-500 mt-2 text-center font-medium">Next: <span className="text-purple-400 font-bold">{next.name}</span> at {next.xpRequired.toLocaleString()} XP</p>}
      </div>

      {/* Evolution Stages */}
      <div className="bg-gray-100 dark:bg-gray-800/50 rounded-2xl border-4 border-black p-6">
        <h3 className="text-lg font-black uppercase tracking-tight mb-4 text-black dark:text-white">Evolution Stages</h3>
        <div className="space-y-3">
          {EVOLUTION_STAGES.map((stage, i) => {
            const isUnlocked = totalXP >= stage.xpRequired;
            const isActive = current.level === stage.level;
            return (
              <div key={stage.level} className={`flex items-center gap-4 p-3 rounded-xl border-2 transition-all ${
                isActive ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20' :
                isUnlocked ? 'border-green-500/30 bg-green-50/50 dark:bg-green-900/10' :
                'border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800/30'
              }`}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center border-2 font-black text-sm ${
                  isActive ? 'border-purple-500 bg-purple-500 text-white' :
                  isUnlocked ? 'border-green-500 bg-green-100 dark:bg-green-900/30 text-green-600' :
                  'border-gray-400 bg-gray-200 dark:bg-gray-700 text-gray-500'
                }`}>{isUnlocked ? stage.level : <Lock size={16} />}</div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className={`text-sm font-black uppercase ${
                      isActive ? 'text-purple-600 dark:text-purple-400' :
                      isUnlocked ? 'text-black dark:text-white' : 'text-gray-400 dark:text-gray-600'
                    }`}>{isUnlocked || i <= 1 ? stage.name : '???'}</span>
                    {isActive && <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-purple-500 text-white">Active</span>}
                  </div>
                  <span className="text-[10px] font-medium text-gray-500">{stage.xpRequired.toLocaleString()} XP</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* XP Sources */}
      <div className="bg-gray-100 dark:bg-gray-800/50 rounded-2xl border-4 border-black p-6">
        <h3 className="text-lg font-black uppercase tracking-tight mb-4 text-black dark:text-white">XP Sources</h3>
        <div className="space-y-2">
          {achievements.filter(a => ACHIEVEMENT_XP[a.id]).map(ach => {
            const xp = ACHIEVEMENT_XP[ach.id];
            const earned = !!ach.unlockedAt;
            return (
              <div key={ach.id} className={`flex items-center justify-between py-2 px-3 rounded-lg ${earned ? 'bg-green-50 dark:bg-green-900/10' : 'opacity-40'}`}>
                <div className="flex items-center gap-3">
                  <span className="text-lg">{earned ? ach.icon : '\uD83D\uDD12'}</span>
                  <span className={`text-xs font-bold uppercase ${earned ? 'text-black dark:text-white' : 'text-gray-500'}`}>{ach.name}</span>
                </div>
                <span className={`text-xs font-black ${earned ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}`}>{earned ? '+' : ''}{xp} XP</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="text-center py-6">
        <p className="text-xs font-bold text-gray-400 dark:text-gray-600 italic">
          {hatched ? current.description : 'Complete all Bronze achievements to hatch your guardian.'}
        </p>
      </div>
    </div>
  );
};

export default Guardian;
