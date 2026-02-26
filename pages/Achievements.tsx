import React from 'react';
import { Achievement } from '../types';
import AnimeCard from '../components/AnimeCard';
import { getTierColor, getTierBg } from '../achievements';
import { Lock, CheckCircle } from 'lucide-react';

interface AchievementsProps {
  achievements: Achievement[];
}

const Achievements: React.FC<AchievementsProps> = ({ achievements }) => {
  const unlockedCount = achievements.filter(a => a.unlockedAt).length;
  const totalCount = achievements.length;
  
  const tiers = ['bronze', 'silver', 'gold', 'legendary', 'mythical'] as const;

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-black dark:text-white">
            Achievements <span className="text-yellow-500">Ã¥ÂÂ²Ã§Â«Â </span>
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 font-medium">Unlock badges by mastering the way of the samurai.</p>
        </div>
        <div className="bg-black text-white px-6 py-3 rounded-2xl border-4 border-black anime-border-sm">
          <span className="text-3xl font-black">{unlockedCount}</span>
          <span className="text-lg opacity-60">/{totalCount}</span>
          <span className="text-xs font-bold uppercase tracking-widest ml-2 opacity-60">Unlocked</span>
        </div>
      </div>

      {/* Progress Overview */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {tiers.map(tier => {
          const tierAchievements = achievements.filter(a => a.tier === tier);
          const tierUnlocked = tierAchievements.filter(a => a.unlockedAt).length;
          return (
            <div 
              key={tier}
              className={`p-4 rounded-2xl border-4 border-black anime-border-sm ${getTierBg(tier)}`}
            >
              <div className="flex items-center gap-2 mb-2">
                <div 
                  className="w-4 h-4 rounded-full border-2 border-black"
                  style={{ backgroundColor: getTierColor(tier) }}
                ></div>
                <span className="text-xs font-black uppercase tracking-widest text-black dark:text-white">{tier}</span>
              </div>
              <span className="text-2xl font-black text-black dark:text-white">{tierUnlocked}/{tierAchievements.length}</span>
            </div>
          );
        })}
      </div>

      {/* Achievement Cards by Tier */}
      {tiers.map(tier => {
        const tierAchievements = achievements.filter(a => a.tier === tier);
        return (
          <AnimeCard 
            key={tier} 
            title={tier === 'mythical' ? '\u26E9\uFE0F Mythical Tier' : `${tier.charAt(0).toUpperCase() + tier.slice(1)} Tier`}
            variant={tier === 'mythical' ? 'pink' : 'black'}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tierAchievements.map(achievement => (
                <AchievementCard key={achievement.id} achievement={achievement} />
              ))}
            </div>
          </AnimeCard>
        );
      })}
    </div>
  );
};

const AchievementCard: React.FC<{ achievement: Achievement }> = ({ achievement }) => {
  const isUnlocked = !!achievement.unlockedAt;
  const progress = Math.min((achievement.progress / achievement.maxProgress) * 100, 100);
  const tierColor = getTierColor(achievement.tier);

  return (
    <div 
      className={`p-4 rounded-2xl border-4 transition-all ${
        isUnlocked 
          ? 'border-black bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900' 
          : 'border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-800/50'
      }`}
    >
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div 
          className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl border-2 shrink-0 ${
            isUnlocked ? 'border-black' : 'border-gray-300 dark:border-gray-600'
          }`}
          style={{ backgroundColor: isUnlocked ? tierColor + '30' : '#e5e5e5' }}
        >
          {isUnlocked ? achievement.icon : <Lock size={24} className="text-gray-400" />}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h4 className={`font-black uppercase text-sm tracking-tight ${isUnlocked ? 'text-black dark:text-white' : 'text-gray-500 dark:text-gray-500'}`}>{achievement.name}</h4>
              <p className={`text-[10px] font-medium mt-0.5 ${isUnlocked ? 'text-gray-600 dark:text-gray-400' : 'text-gray-400 dark:text-gray-600'}`}>{achievement.description}</p>
            </div>
            <span className={`text-2xl ${isUnlocked ? 'text-gray-300 dark:text-gray-600' : 'text-gray-200 dark:text-gray-700'}`}>{achievement.kanji}</span>
          </div>

          {/* Progress Bar */}
          <div className="mt-3">
            <div className="flex justify-between text-[9px] font-bold mb-1">
              <span className={`uppercase ${isUnlocked ? 'text-gray-600 dark:text-gray-400' : 'text-gray-400 dark:text-gray-600'}`}>{achievement.requirement}</span>
              <span className={isUnlocked ? 'text-black dark:text-white' : 'text-gray-500 dark:text-gray-500'}>{achievement.progress}/{achievement.maxProgress}</span>
            </div>
            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full rounded-full transition-all duration-500"
                style={{ 
                  width: `${progress}%`,
                  backgroundColor: isUnlocked ? tierColor : '#9ca3af'
                }}
              ></div>
            </div>
          </div>

          {/* Unlocked Badge */}
          {isUnlocked && (
            <div className="mt-3 flex items-center gap-2">
              <CheckCircle size={14} className="text-green-500" />
              <span className="text-[10px] font-bold text-green-600 uppercase">
                Unlocked {new Date(achievement.unlockedAt!).toLocaleDateString()}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Achievements;
