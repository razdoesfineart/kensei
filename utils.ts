import { Trade } from './types';

// Calculate P&L for a single trade
export function calculatePnL(
  tradeType: 'Long' | 'Short',
  entryPrice: number,
  exitPrice: number,
  positionSize: number
): { pnl: number; pnlPercent: number } {
  let pnlPercent: number;
  
  if (tradeType === 'Long') {
    // Long: profit when exit > entry
    pnlPercent = ((exitPrice - entryPrice) / entryPrice) * 100;
  } else {
    // Short: profit when exit < entry
    pnlPercent = ((entryPrice - exitPrice) / entryPrice) * 100;
  }
  
  const pnl = (pnlPercent / 100) * positionSize;
  
  return {
    pnl: Math.round(pnl * 100) / 100,
    pnlPercent: Math.round(pnlPercent * 100) / 100
  };
}

// Get total P&L from all trades
export function getTotalPnL(trades: Trade[]): number {
  return trades.reduce((sum, trade) => sum + trade.pnl, 0);
}

// Get today's P&L
export function getTodayPnL(trades: Trade[]): number {
  const today = new Date().toDateString();
  return trades
    .filter(t => new Date(t.timestamp).toDateString() === today)
    .reduce((sum, trade) => sum + trade.pnl, 0);
}

// Get this week's P&L
export function getWeekPnL(trades: Trade[]): number {
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  return trades
    .filter(t => new Date(t.timestamp) >= weekAgo)
    .reduce((sum, trade) => sum + trade.pnl, 0);
}

// Get P&L by day for charts
export function getPnLByDay(trades: Trade[], days: number = 30): { date: string; pnl: number; cumulative: number }[] {
  const result: { date: string; pnl: number; cumulative: number }[] = [];
  const now = new Date();
  
  let cumulative = 0;
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const dateStr = date.toISOString().split('T')[0];
    const dayTrades = trades.filter(t => t.timestamp.startsWith(dateStr));
    const dayPnL = dayTrades.reduce((sum, t) => sum + t.pnl, 0);
    cumulative += dayPnL;
    
    result.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      pnl: Math.round(dayPnL * 100) / 100,
      cumulative: Math.round(cumulative * 100) / 100
    });
  }
  
  return result;
}

// Get best and worst trades
export function getBestTrade(trades: Trade[]): Trade | null {
  if (trades.length === 0) return null;
  return trades.reduce((best, trade) => trade.pnl > best.pnl ? trade : best);
}

export function getWorstTrade(trades: Trade[]): Trade | null {
  if (trades.length === 0) return null;
  return trades.reduce((worst, trade) => trade.pnl < worst.pnl ? trade : worst);
}

// Get average win and loss
export function getAverageWin(trades: Trade[]): number {
  const wins = trades.filter(t => t.pnl > 0);
  if (wins.length === 0) return 0;
  return Math.round((wins.reduce((sum, t) => sum + t.pnl, 0) / wins.length) * 100) / 100;
}

export function getAverageLoss(trades: Trade[]): number {
  const losses = trades.filter(t => t.pnl < 0);
  if (losses.length === 0) return 0;
  return Math.round((losses.reduce((sum, t) => sum + t.pnl, 0) / losses.length) * 100) / 100;
}

// Calculate win/loss ratio (risk/reward)
export function getProfitFactor(trades: Trade[]): number {
  const totalWins = trades.filter(t => t.pnl > 0).reduce((sum, t) => sum + t.pnl, 0);
  const totalLosses = Math.abs(trades.filter(t => t.pnl < 0).reduce((sum, t) => sum + t.pnl, 0));
  if (totalLosses === 0) return totalWins > 0 ? Infinity : 0;
  return Math.round((totalWins / totalLosses) * 100) / 100;
}

// Export trades to CSV
export function exportToCSV(trades: Trade[]): void {
  const headers = [
    'Date',
    'Token',
    'Type',
    'Entry Price',
    'Exit Price',
    'Position Size',
    'P&L ($)',
    'P&L (%)',
    'Outcome',
    'Emotion',
    'Passed Checklist',
    'Trade Reason'
  ];
  
  const rows = trades.map(trade => [
    new Date(trade.timestamp).toLocaleString(),
    trade.tokenName,
    trade.tradeType,
    trade.entryPrice,
    trade.exitPrice,
    trade.positionSize,
    trade.pnl,
    trade.pnlPercent,
    trade.outcome,
    trade.emotion,
    trade.passedChecklist ? 'Yes' : 'No',
    `"${trade.tradeReason.replace(/"/g, '""')}"`
  ]);
  
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `samurai_trades_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Format currency
export function formatCurrency(amount: number): string {
  const prefix = amount >= 0 ? '+$' : '-$';
  return `${prefix}${Math.abs(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// Format percentage
export function formatPercent(percent: number): string {
  const prefix = percent >= 0 ? '+' : '';
  return `${prefix}${percent.toFixed(2)}%`;
}
