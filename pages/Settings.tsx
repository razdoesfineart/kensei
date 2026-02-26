import React from 'react';
import { AppSettings } from '../types';
import AnimeCard from '../components/AnimeCard';
import { Moon, Sun, Trash2, ShieldAlert, Heart, Download, Bell, Clock, Volume2 } from 'lucide-react';
import { exportToCSV } from '../utils';
import { Trade } from '../types';

interface SettingsProps {
  settings: AppSettings;
  updateSettings: (updates: Partial<AppSettings>) => void;
  onClearData: () => void;
  trades: Trade[];
}

const Settings: React.FC<SettingsProps> = ({ settings, updateSettings, onClearData, trades }) => {
  const handleExportCSV = () => {
    if (trades.length === 0) {
      alert('No trades to export!');
      return;
    }
    exportToCSV(trades);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-10">
      <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-black dark:text-white">Dojo <span className="text-[#FFE66D]">Config</span></h1>

      <AnimeCard title="Appearance" variant="gold">
        <div className="flex items-center justify-between p-4 bg-gray-100 dark:bg-gray-800 rounded-[1.5rem] border-2 border-black">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-xl border-2 border-black ${settings.isDarkMode ? 'bg-[#2A2438] text-white' : 'bg-white text-black'}`}>
              {settings.isDarkMode ? <Moon /> : <Sun />}
            </div>
            <div>
              <h4 className="font-black uppercase text-sm text-black dark:text-white">Dark Mode</h4>
              <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">Protect your eyes during night strikes</p>
            </div>
          </div>
          <ToggleSwitch 
            enabled={settings.isDarkMode} 
            onChange={(v) => updateSettings({ isDarkMode: v })} 
          />
        </div>
      </AnimeCard>

      <AnimeCard title="Battle Rules" variant="black">
        <div className="space-y-4">
          {/* Reality Check Alerts */}
          <div className="flex items-center justify-between p-4 bg-gray-100 dark:bg-[#1A1625]/40 rounded-2xl border-2 border-black">
            <div className="flex items-center gap-4">
              <div className="text-gray-500 dark:text-gray-400"><Bell size={20} /></div>
              <div>
                <h4 className="font-bold text-sm uppercase text-black dark:text-white">Reality Check Alerts</h4>
                <p className="text-[10px] text-gray-600 dark:text-gray-400 font-medium">Get reminded to check your emotional state</p>
              </div>
            </div>
            <ToggleSwitch 
              enabled={settings.realityCheckEnabled} 
              onChange={(v) => updateSettings({ realityCheckEnabled: v })} 
            />
          </div>

          {/* Reality Check Interval */}
          {settings.realityCheckEnabled && (
            <div className="ml-12 p-4 bg-gray-100 dark:bg-gray-800/50 rounded-xl border-2 border-dashed border-gray-300">
              <label className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase text-gray-600 dark:text-gray-400 flex items-center gap-2">
                  <Clock size={14} /> Check Every
                </span>
                <select 
                  value={settings.realityCheckInterval}
                  onChange={(e) => updateSettings({ realityCheckInterval: parseInt(e.target.value) })}
                  className="bg-white dark:bg-gray-800 border-2 border-black rounded-xl px-3 py-2 font-bold text-sm text-black dark:text-white"
                >
                  <option value={60}>1 hour</option>
                  <option value={120}>2 hours</option>
                  <option value={180}>3 hours</option>
                  <option value={240}>4 hours</option>
                  <option value={300}>5 hours</option>
                </select>
              </label>
            </div>
          )}

          {/* Meditation Cooldown */}
          <div className="flex items-center justify-between p-4 bg-gray-100 dark:bg-[#1A1625]/40 rounded-2xl border-2 border-black">
            <div className="flex items-center gap-4">
              <div className="text-gray-500 dark:text-gray-400"><Heart size={20} /></div>
              <div>
                <h4 className="font-bold text-sm uppercase text-black dark:text-white">Mandatory Meditation</h4>
                <p className="text-[10px] text-gray-600 dark:text-gray-400 font-medium">Lock trading after consecutive losses</p>
              </div>
            </div>
            <ToggleSwitch 
              enabled={settings.meditationCooldownEnabled} 
              onChange={(v) => updateSettings({ meditationCooldownEnabled: v })} 
            />
          </div>

          {/* Cooldown Settings */}
          {settings.meditationCooldownEnabled && (
            <div className="ml-12 p-4 bg-gray-100 dark:bg-gray-800/50 rounded-xl border-2 border-dashed border-gray-300 space-y-4">
              <label className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase text-gray-600 dark:text-gray-400">Losses to trigger</span>
                <select 
                  value={settings.consecutiveLossLimit}
                  onChange={(e) => updateSettings({ consecutiveLossLimit: parseInt(e.target.value) })}
                  className="bg-white dark:bg-gray-800 border-2 border-black rounded-xl px-3 py-2 font-bold text-sm text-black dark:text-white"
                >
                  <option value={2}>2 consecutive</option>
                  <option value={3}>3 consecutive</option>
                  <option value={4}>4 consecutive</option>
                  <option value={5}>5 consecutive</option>
                </select>
              </label>
              <label className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase text-gray-600 dark:text-gray-400">Cooldown Duration</span>
                <select 
                  value={settings.cooldownDuration}
                  onChange={(e) => updateSettings({ cooldownDuration: parseInt(e.target.value) })}
                  className="bg-white dark:bg-gray-800 border-2 border-black rounded-xl px-3 py-2 font-bold text-sm text-black dark:text-white"
                >
                  <option value={5}>5 minutes</option>
                  <option value={10}>10 minutes</option>
                  <option value={15}>15 minutes</option>
                  <option value={30}>30 minutes</option>
                </select>
              </label>
            </div>
          )}

          {/* Sound Effects */}
          <div className="flex items-center justify-between p-4 bg-gray-100 dark:bg-[#1A1625]/40 rounded-2xl border-2 border-black">
            <div className="flex items-center gap-4">
              <div className="text-gray-500 dark:text-gray-400"><Volume2 size={20} /></div>
              <div>
                <h4 className="font-bold text-sm uppercase text-black dark:text-white">Sound Effects</h4>
                <p className="text-[10px] text-gray-600 dark:text-gray-400 font-medium">Audio feedback for achievements and alerts</p>
              </div>
            </div>
            <ToggleSwitch 
              enabled={settings.soundEnabled} 
              onChange={(v) => updateSettings({ soundEnabled: v })} 
            />
          </div>
        </div>
      </AnimeCard>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <AnimeCard title="Data Mastery" variant="cyan">
           <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-6 italic">Secure your chronicles for the future.</p>
           <button 
             onClick={handleExportCSV}
             className="w-full flex items-center justify-center gap-2 bg-black text-white py-3 rounded-xl font-black uppercase tracking-widest hover:scale-105 transition-transform"
           >
             <Download size={18} /> Export CSV
           </button>
           <p className="text-[10px] text-center mt-3 text-gray-500 dark:text-gray-500">
             {trades.length} trades ready to export
           </p>
        </AnimeCard>

        <AnimeCard title="The Red Tablet" variant="pink">
           <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-6 italic">Erasing records is permanent. Proceed with honor.</p>
           <button 
             onClick={() => { if(window.confirm('Erase all chronicles? This path cannot be untrod.')) onClearData(); }}
             className="w-full flex items-center justify-center gap-2 border-4 border-[#FF6B9D] text-[#FF6B9D] py-3 rounded-xl font-black uppercase tracking-widest hover:bg-pink-50 dark:hover:bg-pink-900/20 transition-colors"
           >
             <Trash2 size={18} /> Reset All Data
           </button>
        </AnimeCard>
      </div>

      <div className="text-center py-10">
        <p className="font-black text-xs uppercase tracking-[0.2em] text-gray-500 dark:text-gray-500">å£è Kensei v4.4</p>
        <p className="text-[10px] font-bold mt-1 text-gray-400 dark:text-gray-600">Way of the Blade</p>
      </div>
    </div>
  );
};

const ToggleSwitch: React.FC<{ enabled: boolean, onChange: (v: boolean) => void }> = ({ enabled, onChange }) => (
  <button 
    onClick={() => onChange(!enabled)}
    className={`w-14 h-8 rounded-full border-2 border-black relative transition-colors ${enabled ? 'bg-[#4ECDC4]' : 'bg-gray-200'}`}
  >
    <div className={`absolute top-1 w-5 h-5 bg-white border-2 border-black rounded-full transition-all ${enabled ? 'right-1' : 'left-1'}`}></div>
  </button>
);

export default Settings;
