import React from 'react';
import { View, Trade } from '../types';
import AnimeCard from '../components/AnimeCard';
import { Flame, Target, TrendingUp, Heart, Swords, ChevronRight, Zap, TrendingDown } from 'lucide-react';
import { getTotalPnL, getTodayPnL, formatCurrency } from '../utils';

// Animated Background Component
const AnimatedBackground: React.FC = () => (
  <div className="absolute inset-0 overflow-hidden rounded-[2.5rem]">
    {/* Samurai Battle GIF Background */}
    <img 
      src="/samurai_bg.gif" 
      alt=""
      className="absolute inset-0 w-full h-full object-cover opacity-30"
      style={{ filter: 'blur(1px)' }}
    />
    {/* Dark overlay for readability */}
    <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70"></div>
    {/* Color tint overlay */}
    <div className="absolute inset-0 bg-gradient-to-br from-rose-900/30 via-transparent to-purple-900/30"></div>
  </div>
);

// Guardian visual for home preview — mystery placeholder
const MysteryGuardianPreview: React.FC = () => (
  <div className="w-full h-full flex items-center justify-center relative">
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="w-32 h-32 rounded-full border border-purple-500/20 animate-ping" style={{ animationDuration: '3s' }} />
    </div>
    <div className="text-[8rem] font-black text-purple-500/30 leading-none select-none animate-pulse" style={{ animationDuration: '2.5s' }}>
      ?
    </div>
    <div className="absolute inset-0 pointer-events-none">
      <div className="absolute top-6 left-6 w-1 h-1 bg-purple-400 rounded-full animate-ping" style={{ animationDelay: '0s' }} />
      <div className="absolute top-10 right-10 w-1 h-1 bg-purple-300 rounded-full animate-ping" style={{ animationDelay: '0.5s' }} />
      <div className="absolute bottom-10 left-10 w-1 h-1 bg-indigo-400 rounded-full animate-ping" style={{ animationDelay: '1s' }} />
      <div className="absolute bottom-6 right-6 w-1 h-1 bg-purple-500 rounded-full animate-ping" style={{ animationDelay: '1.5s' }} />
    </div>
  </div>
);

interface HomeProps {
  trades: Trade[];
  streak: number;
  setView: (view: View) => void;
}

const Home: React.FC<HomeProps> = ({ trades, streak, setView }) => {
  const winRate = trades.length > 0 
    ? Math.round((trades.filter(t => t.outcome === 'Win').length / trades.length) * 100) 
    : 0;
  
  const todayTrades = trades.filter(t => {
    const tradeDate = new Date(t.timestamp).toDateString();
    return tradeDate === new Date().toDateString();
  }).length;

  const totalPnL = getTotalPnL(trades);
  const todayPnL = getTodayPnL(trades);

  const getRank = () => {
    if (totalPnL >= 10000) return 'Shogun';
    if (totalPnL >= 5000) return 'Daimyo';
    if (totalPnL >= 1000) return 'Samurai';
    if (totalPnL >= 0) return 'Ronin';
    return 'Ashigaru';
  };

  return (
    <div className="space-y-10 pb-10">
      {/* Hero Section with Animated Samurai Battle Background */}
      <div className="relative rounded-[2.5rem] border-4 border-black anime-border overflow-hidden">
        <AnimatedBackground />
        <div className="relative z-10 p-8 md:p-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none mb-2 text-white drop-shadow-lg">
                Warrior's <span className="text-[#e11d48]">Strike</span>
              </h1>
              <p className="text-xl text-white/80 font-medium">Welcome, Samurai. Your discipline is your edge.</p>
            </div>
            <div className="bg-[#e11d48] text-white border-4 border-black px-6 py-3 rounded-2xl anime-border-sm rotate-3 flex items-center gap-3 shrink-0">
              <Zap size={20} fill="white" />
              <span className="font-black text-sm uppercase tracking-widest">Rank: {getRank()}</span>
            </div>
          </div>
          <div className="absolute bottom-4 right-4 text-8xl font-black text-white/10 select-none pointer-events-none">刃</div>
        </div>
      </div>

      {/* P&L Summary Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className={`p-6 rounded-2xl border-4 border-black anime-border-sm ${totalPnL >= 0 ? 'bg-[#4ECDC4]' : 'bg-[#FF6B9D]'} text-white`}>
          <div className="flex items-center gap-2 mb-2">
            {totalPnL >= 0 ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
            <span className="text-xs font-black uppercase tracking-widest opacity-80">Total P&L</span>
          </div>
          <span className="text-3xl md:text-4xl font-black">{formatCurrency(totalPnL)}</span>
        </div>
        <div className={`p-6 rounded-2xl border-4 border-black anime-border-sm ${todayPnL >= 0 ? 'bg-emerald-500' : 'bg-orange-500'} text-white`}>
          <div className="flex items-center gap-2 mb-2">
            {todayPnL >= 0 ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
            <span className="text-xs font-black uppercase tracking-widest opacity-80">Today's P&L</span>
          </div>
          <span className="text-3xl md:text-4xl font-black">{formatCurrency(todayPnL)}</span>
        </div>
      </div>

      <div className="relative group cursor-pointer" onClick={() => setView(View.GUARDIAN)}>
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-[#e11d48] to-indigo-600 rounded-[3rem] blur-2xl opacity-20 group-hover:opacity-40 transition-opacity duration-700"></div>
        <div className="relative bg-[#0f0f12] text-white p-8 md:p-14 rounded-[2.5rem] border-4 border-black flex flex-col md:flex-row items-center gap-10 overflow-hidden anime-border">
          
          <div className="flex-1 text-center md:text-left z-10">
            <div className="flex items-center justify-center md:justify-start gap-3 mb-4">
              <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></div>
              <span className="text-purple-400 font-black uppercase tracking-[0.3em] text-[10px]">Soul Synchronized</span>
            </div>
            <h2 className="text-8xl md:text-9xl font-black mb-4 tracking-tighter">{streak} <span className="text-3xl opacity-50 font-medium">days</span></h2>
            <div className="h-2 w-32 bg-purple-600/30 rounded-full mb-6 flex overflow-hidden">
               <div className="h-full bg-purple-500" style={{width: `${Math.min((streak / 30) * 100, 100)}%`}}></div>
            </div>
            <p className="text-lg opacity-80 font-medium max-w-sm">Evolve into the next form in {30 - streak > 0 ? 30 - streak : 0} days.</p>
          </div>

          <div className="w-64 h-64 md:w-80 md:h-80 flex items-center justify-center animate-float overflow-visible">
             <MysteryGuardianPreview />
          </div>

          <div className="absolute -left-10 -bottom-10 text-[20rem] font-black opacity-[0.03] select-none rotate-12">魂</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatItem icon={<Target className="text-[#e11d48]" />} label="Today's Battles" value={`${todayTrades}/10`} />
        <StatItem icon={<TrendingUp className="text-[#4ECDC4]" />} label="Victory Rate" value={`${winRate}%`} />
        <StatItem icon={<Flame className="text-[#FFE66D]" />} label="Honor Level" value={`${trades.length * 10} XP`} />
        <StatItem icon={<Heart className="text-[#FF4081]" />} label="Mental Spirit" value={streak >= 7 ? 'Zen' : 'Training'} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <AnimeCard title="The Battlefield" variant="black">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ActionButton 
                onClick={() => setView(View.JOURNAL)} 
                title="Log Strike" 
                subtitle="Record your latest combat result"
                icon={<Swords size={32} />}
                color="bg-[#e11d48]"
              />
              <ActionButton 
                onClick={() => setView(View.STATS)} 
                title="Honor Rolls" 
                subtitle="Review your strategic analytics"
                icon={<TrendingUp size={32} />}
                color="bg-black"
              />
            </div>
          </AnimeCard>

          <div className="bg-white dark:bg-[#1a1a1e] border-4 border-black p-8 rounded-[2rem] anime-border-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
              <span className="text-9xl font-black">道</span>
            </div>
            <h3 className="text-2xl font-black uppercase mb-6 flex items-center gap-2 text-black dark:text-white">
               <span className="w-2 h-8 bg-[#e11d48]"></span> Bushido Code
            </h3>
            <ul className="space-y-6">
              <li className="flex items-start gap-4">
                <span className="text-3xl font-black text-[#e11d48]">01</span>
                <div>
                  <h4 className="font-black uppercase text-xs tracking-widest mb-1 text-black dark:text-white">Discipline First</h4>
                  <p className="font-medium text-sm text-gray-600 dark:text-gray-400 italic">"The sword is only as sharp as the mind behind it." (Avoid Emotional Trades)</p>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <span className="text-3xl font-black text-[#e11d48]">02</span>
                <div>
                  <h4 className="font-black uppercase text-xs tracking-widest mb-1 text-black dark:text-white">Strategic Retreat</h4>
                  <p className="font-medium text-sm text-gray-600 dark:text-gray-400 italic">"Know when to sheathe your blade." (Adhere to your Stop Losses)</p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div className="space-y-8">
          <AnimeCard title="Recent Scrolls" variant="black">
             {trades.length === 0 ? (
               <div className="text-center py-20">
                  <span className="text-6xl grayscale opacity-20 block mb-4">📜</span>
                  <p className="text-sm font-bold text-gray-500 dark:text-gray-500 uppercase">History is empty...</p>
               </div>
             ) : (
               <div className="space-y-4">
                 {trades.slice(-4).reverse().map(trade => (
                   <div key={trade.id} className="flex items-center justify-between p-4 border-2 border-black rounded-2xl bg-gray-50 dark:bg-white/5 hover:-translate-y-1 transition-all cursor-pointer group">
                     <div className="flex items-center gap-4">
                       <div className={`w-3 h-3 rounded-full ${trade.outcome === 'Win' ? 'bg-[#4ECDC4]' : 'bg-[#e11d48]'} group-hover:scale-150 transition-transform`}></div>
                       <div>
                        <span className="font-black text-sm uppercase block tracking-tighter text-black dark:text-white">{trade.tokenName}</span>
                        <span className={`text-[10px] font-bold ${trade.pnl >= 0 ? 'text-[#4ECDC4]' : 'text-[#e11d48]'}`}>
                          {formatCurrency(trade.pnl)}
                        </span>
                       </div>
                     </div>
                     <span className="text-[10px] font-black text-gray-500 dark:text-gray-500">{new Date(trade.timestamp).toLocaleDateString()}</span>
                   </div>
                 ))}
                 <button onClick={() => setView(View.STATS)} className="w-full py-3 text-xs font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors">View All Scrolls</button>
               </div>
             )}
          </AnimeCard>
        </div>
      </div>
    </div>
  );
};

const StatItem = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) => (
  <div className="bg-white dark:bg-[#1a1a1e] border-4 border-black p-6 rounded-[2rem] flex flex-col items-center text-center anime-border-sm hover:-translate-y-1 transition-transform">
    <div className="p-4 bg-gray-100 dark:bg-white/5 rounded-2xl border-2 border-black mb-4">
      {icon}
    </div>
    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-600 dark:text-gray-400 mb-1">{label}</span>
    <span className="text-2xl font-black tracking-tight text-black dark:text-white">{value}</span>
  </div>
);

const ActionButton = ({ onClick, title, subtitle, icon, color }: { onClick: () => void, title: string, subtitle: string, icon: React.ReactNode, color: string }) => (
  <button 
    onClick={onClick}
    className={`${color} text-white p-8 rounded-[2rem] border-4 border-black anime-border flex flex-col items-start text-left hover:-translate-y-2 transition-all group active:scale-95`}
  >
    <div className="bg-white/10 p-4 rounded-2xl mb-6 group-hover:rotate-12 transition-transform shadow-lg">
      {icon}
    </div>
    <div className="flex items-center justify-between w-full mb-1">
      <h4 className="text-2xl font-black uppercase tracking-tighter">{title}</h4>
      <ChevronRight size={24} className="group-hover:translate-x-2 transition-transform" />
    </div>
    <p className="text-xs opacity-70 font-bold uppercase tracking-widest">{subtitle}</p>
  </button>
);

export default Home;
