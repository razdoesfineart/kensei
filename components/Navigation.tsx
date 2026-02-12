import React from 'react';
import { View } from '../types';
import { LayoutDashboard, ScrollText, Swords, ShieldHalf, Settings as SettingsIcon, Trophy, Radar } from 'lucide-react';

interface NavigationProps {
  currentView: View;
  setCurrentView: (view: View) => void;
  unlockedAchievements: number;
  isTracking?: boolean;
}

const Navigation: React.FC<NavigationProps> = ({ currentView, setCurrentView, unlockedAchievements, isTracking }) => {
  const tabs = [
    { id: View.HOME, label: 'Dojo', icon: LayoutDashboard, kanji: '道場' },
    { id: View.TRACKER, label: 'Track', icon: Radar, kanji: '追跡', highlight: isTracking },
    { id: View.JOURNAL, label: 'Log', icon: ScrollText, kanji: '巻物' },
    { id: View.STATS, label: 'Honor', icon: Swords, kanji: '栄誉' },
    { id: View.GUARDIAN, label: 'Spirit', icon: ShieldHalf, kanji: '精神' },
    { id: View.ACHIEVEMENTS, label: 'Medals', icon: Trophy, kanji: '勲章', badge: unlockedAchievements },
    { id: View.SETTINGS, label: 'Config', icon: SettingsIcon, kanji: '設定' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 md:relative md:w-24 lg:w-72 bg-white dark:bg-[#0f0f12] border-t-4 md:border-t-0 md:border-r-4 border-black z-50 transition-all duration-300">
      <div className="flex md:flex-col h-full items-center justify-around md:justify-start md:pt-10 gap-1 md:gap-3 p-2 md:p-6">
        
        {/* Kensei Branding - High Contrast Red/White */}
        <div className="hidden md:flex flex-col items-center mb-8 w-full">
          <div className="w-14 h-14 lg:w-20 lg:h-20 bg-[#e11d48] rounded-3xl border-4 border-black flex items-center justify-center anime-border-red mb-3 group cursor-pointer hover:rotate-6 transition-transform">
            <span className="text-white text-2xl lg:text-4xl font-black">剣</span>
          </div>
          <div className="text-center">
            <h2 className="text-xs font-black uppercase tracking-[0.4em] mb-1">KENSEI</h2>
            <p className="hidden lg:block text-[8px] font-bold uppercase tracking-widest opacity-40">Way of the Blade</p>
          </div>
        </div>

        {tabs.map((tab) => {
          const isActive = currentView === tab.id;
          const Icon = tab.icon;
          
          return (
            <button
              key={tab.id}
              onClick={() => setCurrentView(tab.id)}
              className={`relative flex flex-col lg:flex-row items-center gap-1 lg:gap-4 p-2 lg:p-4 rounded-2xl lg:w-full transition-all duration-300 border-2 ${
                isActive 
                  ? 'bg-black text-white border-black scale-105 anime-border-sm' 
                  : 'text-gray-400 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 border-transparent'
              }`}
            >
              <div className={`relative ${isActive ? 'text-[#e11d48]' : ''}`}>
                <Icon size={isActive ? 26 : 22} />
                {tab.highlight && !isActive && (
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                )}
              </div>
              <div className="flex flex-col items-start leading-tight">
                <span className="text-[8px] lg:text-xs font-black uppercase tracking-[0.1em]">{tab.label}</span>
                <span className="hidden lg:block text-[10px] opacity-40 font-bold">{tab.kanji}</span>
              </div>
              {tab.badge !== undefined && tab.badge > 0 && (
                <div className="absolute -top-1 -right-1 md:top-0 md:right-0 lg:right-2 w-5 h-5 bg-[#e11d48] text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-black">
                  {tab.badge}
                </div>
              )}
            </button>
          );
        })}

        {/* Decorative Element at bottom of nav */}
        <div className="mt-auto hidden lg:block pb-6 w-full text-center">
           <div className="text-5xl opacity-5 font-black select-none pointer-events-none">侍</div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
