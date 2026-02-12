import React from 'react';
import { Trade } from '../types';
import AnimeCard from '../components/AnimeCard';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, LineChart, Line, Area, AreaChart } from 'recharts';
import { TrendingUp, TrendingDown, Award, Target } from 'lucide-react';
import { 
  getTotalPnL, 
  getWeekPnL, 
  getPnLByDay, 
  getBestTrade, 
  getWorstTrade, 
  getAverageWin, 
  getAverageLoss, 
  getProfitFactor,
  formatCurrency,
  formatPercent
} from '../utils';

interface StatsProps {
  trades: Trade[];
}

const Stats: React.FC<StatsProps> = ({ trades }) => {
  const totalTrades = trades.length;
  const wins = trades.filter(t => t.outcome === 'Win').length;
  const losses = totalTrades - wins;
  const winRate = totalTrades > 0 ? Math.round((wins / totalTrades) * 100) : 0;

  const totalPnL = getTotalPnL(trades);
  const weekPnL = getWeekPnL(trades);
  const pnlByDay = getPnLByDay(trades, 14);
  const bestTrade = getBestTrade(trades);
  const worstTrade = getWorstTrade(trades);
  const avgWin = getAverageWin(trades);
  const avgLoss = getAverageLoss(trades);
  const profitFactor = getProfitFactor(trades);

  const pieData = [
    { name: 'Wins', value: wins, color: '#4ECDC4' },
    { name: 'Losses', value: losses, color: '#FF6B9D' },
  ];

  const emotionImpact = trades.reduce((acc: any, trade) => {
    if (!acc[trade.emotion]) acc[trade.emotion] = { emotion: trade.emotion, wins: 0, total: 0, pnl: 0 };
    acc[trade.emotion].total++;
    acc[trade.emotion].pnl += trade.pnl;
    if (trade.outcome === 'Win') acc[trade.emotion].wins++;
    return acc;
  }, {});

  const emotionChartData = Object.values(emotionImpact).map((v: any) => ({
    name: v.emotion,
    winRate: Math.round((v.wins / v.total) * 100),
    pnl: Math.round(v.pnl * 100) / 100,
    total: v.total
  }));

  if (totalTrades === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <span className="text-9xl mb-6 grayscale opacity-20">📜</span>
        <h2 className="text-3xl font-black uppercase mb-2 text-black dark:text-white">No Chronicles Yet</h2>
        <p className="text-gray-600 dark:text-gray-400 font-medium">Start recording your battles to unlock honor statistics.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
       <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-black dark:text-white">
            Honor <span className="text-[#4ECDC4]">Statistics</span>
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 font-medium">Analyzing the geometry of your discipline.</p>
        </div>
      </div>

      {/* P&L Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className={`p-5 rounded-2xl border-4 border-black anime-border-sm ${totalPnL >= 0 ? 'bg-[#4ECDC4]' : 'bg-[#FF6B9D]'} text-white`}>
          <div className="flex items-center gap-2 mb-1">
            {totalPnL >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
            <span className="text-[10px] font-black uppercase tracking-widest opacity-80">Total P&L</span>
          </div>
          <span className="text-2xl font-black">{formatCurrency(totalPnL)}</span>
        </div>
        <div className={`p-5 rounded-2xl border-4 border-black anime-border-sm ${weekPnL >= 0 ? 'bg-emerald-500' : 'bg-orange-500'} text-white`}>
          <div className="flex items-center gap-2 mb-1">
            {weekPnL >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
            <span className="text-[10px] font-black uppercase tracking-widest opacity-80">7-Day P&L</span>
          </div>
          <span className="text-2xl font-black">{formatCurrency(weekPnL)}</span>
        </div>
        <div className="p-5 rounded-2xl border-4 border-black anime-border-sm bg-purple-500 text-white">
          <div className="flex items-center gap-2 mb-1">
            <Award size={16} />
            <span className="text-[10px] font-black uppercase tracking-widest opacity-80">Win Rate</span>
          </div>
          <span className="text-2xl font-black">{winRate}%</span>
        </div>
        <div className="p-5 rounded-2xl border-4 border-black anime-border-sm bg-indigo-500 text-white">
          <div className="flex items-center gap-2 mb-1">
            <Target size={16} />
            <span className="text-[10px] font-black uppercase tracking-widest opacity-80">Profit Factor</span>
          </div>
          <span className="text-2xl font-black">{profitFactor === Infinity ? '∞' : profitFactor.toFixed(2)}</span>
        </div>
      </div>

      {/* Cumulative P&L Chart */}
      <AnimeCard title="P&L Over Time" subtitle="Last 14 days cumulative profit/loss" variant="cyan">
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={pnlByDay}>
              <defs>
                <linearGradient id="pnlGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4ECDC4" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#4ECDC4" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold'}} />
              <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10}} tickFormatter={(v) => `$${v}`} />
              <Tooltip 
                contentStyle={{borderRadius: '16px', border: '2px solid black', fontWeight: 'bold'}}
                formatter={(value: number) => [formatCurrency(value), 'Cumulative P&L']}
              />
              <Area 
                type="monotone" 
                dataKey="cumulative" 
                stroke="#4ECDC4" 
                strokeWidth={3}
                fill="url(#pnlGradient)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </AnimeCard>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <AnimeCard title="Battle Summary" variant="black" className="lg:col-span-1">
          <div className="h-48 mb-6">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="#000" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-3">
            <StatRow label="Total Trades" value={totalTrades} />
            <StatRow label="Victories" value={wins} color="text-[#4ECDC4]" />
            <StatRow label="Defeats" value={losses} color="text-[#FF6B9D]" />
            <StatRow label="Disciplined Trades" value={trades.filter(t => t.passedChecklist).length} />
          </div>
        </AnimeCard>

        <AnimeCard title="P&L Breakdown" variant="black" className="lg:col-span-2">
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-2xl border-2 border-green-300">
              <span className="text-[10px] font-black uppercase tracking-widest text-green-600">Avg Win</span>
              <span className="block text-2xl font-black text-green-700">{formatCurrency(avgWin)}</span>
            </div>
            <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-2xl border-2 border-red-300">
              <span className="text-[10px] font-black uppercase tracking-widest text-red-600">Avg Loss</span>
              <span className="block text-2xl font-black text-red-700">{formatCurrency(avgLoss)}</span>
            </div>
          </div>
          
          {bestTrade && (
            <div className="p-4 bg-emerald-50 dark:bg-emerald-900/10 rounded-2xl border-2 border-emerald-300 mb-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Best Trade</span>
                  <span className="block text-lg font-black">{bestTrade.tokenName}</span>
                </div>
                <span className="text-2xl font-black text-emerald-600">{formatCurrency(bestTrade.pnl)}</span>
              </div>
            </div>
          )}
          
          {worstTrade && (
            <div className="p-4 bg-rose-50 dark:bg-rose-900/10 rounded-2xl border-2 border-rose-300">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-rose-600">Worst Trade</span>
                  <span className="block text-lg font-black">{worstTrade.tokenName}</span>
                </div>
                <span className="text-2xl font-black text-rose-600">{formatCurrency(worstTrade.pnl)}</span>
              </div>
            </div>
          )}
        </AnimeCard>
      </div>

      <AnimeCard title="Spirit vs. Profit" subtitle="P&L by emotional state" variant="cyan">
         <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={emotionChartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold'}} />
              <YAxis axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
              <Tooltip 
                cursor={{fill: 'rgba(78, 205, 196, 0.1)'}}
                contentStyle={{borderRadius: '16px', border: '2px solid black', fontWeight: 'bold'}}
                formatter={(value: number) => [formatCurrency(value), 'P&L']}
              />
              <Bar dataKey="pnl" name="P&L">
                 {emotionChartData.map((entry, index) => (
                   <Cell 
                     key={`cell-${index}`} 
                     fill={entry.pnl >= 0 ? '#4ECDC4' : '#FF6B9D'} 
                     stroke="#000" 
                     strokeWidth={2} 
                   />
                 ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
         </div>
         <p className="mt-4 text-xs font-bold text-gray-500 dark:text-gray-500 uppercase text-center">Identifying which emotions affect your profitability.</p>
      </AnimeCard>

      <AnimeCard title="Chronicle History" variant="black">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b-2 border-black">
                <th className="pb-4 text-xs font-black uppercase text-gray-600 dark:text-gray-400 tracking-widest">Date</th>
                <th className="pb-4 text-xs font-black uppercase text-gray-600 dark:text-gray-400 tracking-widest">Asset</th>
                <th className="pb-4 text-xs font-black uppercase text-gray-600 dark:text-gray-400 tracking-widest text-center">Side</th>
                <th className="pb-4 text-xs font-black uppercase text-gray-600 dark:text-gray-400 tracking-widest text-right">P&L</th>
                <th className="pb-4 text-xs font-black uppercase text-gray-600 dark:text-gray-400 tracking-widest text-right">%</th>
                <th className="pb-4 text-xs font-black uppercase text-gray-600 dark:text-gray-400 tracking-widest">Spirit</th>
                <th className="pb-4 text-xs font-black uppercase text-gray-600 dark:text-gray-400 tracking-widest text-right">Outcome</th>
              </tr>
            </thead>
            <tbody>
              {trades.slice().reverse().map(trade => (
                <tr key={trade.id} className="border-b border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="py-4 text-sm font-bold text-black dark:text-white">{new Date(trade.timestamp).toLocaleDateString()}</td>
                  <td className="py-4 text-sm font-black uppercase text-black dark:text-white">{trade.tokenName}</td>
                  <td className="py-4 text-center">
                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border border-black ${trade.tradeType === 'Long' ? 'bg-cyan-100 text-cyan-800' : 'bg-pink-100 text-pink-800'}`}>
                      {trade.tradeType}
                    </span>
                  </td>
                  <td className={`py-4 text-sm font-black text-right ${trade.pnl >= 0 ? 'text-[#4ECDC4]' : 'text-[#FF6B9D]'}`}>
                    {formatCurrency(trade.pnl)}
                  </td>
                  <td className={`py-4 text-sm font-bold text-right ${trade.pnlPercent >= 0 ? 'text-[#4ECDC4]' : 'text-[#FF6B9D]'}`}>
                    {formatPercent(trade.pnlPercent)}
                  </td>
                  <td className="py-4 text-sm font-medium text-black dark:text-white">{trade.emotion}</td>
                  <td className="py-4 text-right">
                    <span className={`font-black uppercase tracking-tighter ${trade.outcome === 'Win' ? 'text-[#4ECDC4]' : 'text-[#FF6B9D]'}`}>
                      {trade.outcome === 'Win' ? 'Victory' : 'Defeat'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </AnimeCard>
    </div>
  );
};

const StatRow = ({ label, value, color }: { label: string, value: any, color?: string }) => (
  <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-800 last:border-0">
    <span className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase">{label}</span>
    <span className={`text-lg font-black ${color || 'text-black dark:text-white'}`}>{value}</span>
  </div>
);

export default Stats;
