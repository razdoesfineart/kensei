import { Achievement, Trade } from './types';

export const ACHIEVEMENTS_DATA: Omit<Achievement, 'unlockedAt' | 'progress'>[] = [
  // Bronze Tier - Easy to unlock
  {
    id: 'first_blood',
    name: 'First Blood',
    description: 'Record your first trade',
    icon: '⚔️',
    kanji: '初',
    requirement: '1 trade',
    maxProgress: 1,
    tier: 'bronze'
  },
  {
    id: 'triple_strike',
    name: 'Triple Strike',
    description: 'Complete 3 trades in one day',
    icon: '🎯',
    kanji: '三',
    requirement: '3 trades in a day',
    maxProgress: 3,
    tier: 'bronze'
  },
  {
    id: 'first_victory',
    name: 'First Victory',
    description: 'Win your first trade',
    icon: '🏆',
    kanji: '勝',
    requirement: '1 winning trade',
    maxProgress: 1,
    tier: 'bronze'
  },
  {
    id: 'discipline_initiate',
    name: 'Discipline Initiate',
    description: 'Complete a trade with full checklist',
    icon: '📜',
    kanji: '律',
    requirement: '1 disciplined trade',
    maxProgress: 1,
    tier: 'bronze'
  },

  // Silver Tier - Medium difficulty
  {
    id: 'winning_streak_5',
    name: 'Hot Streak',
    description: 'Win 5 trades in a row',
    icon: '🔥',
    kanji: '連',
    requirement: '5 consecutive wins',
    maxProgress: 5,
    tier: 'silver'
  },
  {
    id: 'century_warrior',
    name: 'Century Warrior',
    description: 'Complete 100 total trades',
    icon: '💯',
    kanji: '百',
    requirement: '100 trades',
    maxProgress: 100,
    tier: 'silver'
  },
  {
    id: 'zen_master',
    name: 'Zen Master',
    description: 'Trade while calm 10 times',
    icon: '🧘',
    kanji: '禅',
    requirement: '10 calm trades',
    maxProgress: 10,
    tier: 'silver'
  },
  {
    id: 'profit_hunter',
    name: 'Profit Hunter',
    description: 'Accumulate $1,000 in profits',
    icon: '💰',
    kanji: '富',
    requirement: '$1,000 total profit',
    maxProgress: 1000,
    tier: 'silver'
  },
  {
    id: 'week_warrior',
    name: 'Week Warrior',
    description: 'Maintain a 7-day discipline streak',
    icon: '📅',
    kanji: '週',
    requirement: '7-day streak',
    maxProgress: 7,
    tier: 'silver'
  },

  // Gold Tier - Hard to unlock
  {
    id: 'winning_streak_10',
    name: 'Unstoppable',
    description: 'Win 10 trades in a row',
    icon: '⚡',
    kanji: '神',
    requirement: '10 consecutive wins',
    maxProgress: 10,
    tier: 'gold'
  },
  {
    id: 'discipline_master',
    name: 'Discipline Master',
    description: 'Complete 50 trades with full checklist',
    icon: '🎖️',
    kanji: '師',
    requirement: '50 disciplined trades',
    maxProgress: 50,
    tier: 'gold'
  },
  {
    id: 'profit_lord',
    name: 'Profit Lord',
    description: 'Accumulate $10,000 in profits',
    icon: '👑',
    kanji: '王',
    requirement: '$10,000 total profit',
    maxProgress: 10000,
    tier: 'gold'
  },
  {
    id: 'month_master',
    name: 'Month Master',
    description: 'Maintain a 30-day discipline streak',
    icon: '🌙',
    kanji: '月',
    requirement: '30-day streak',
    maxProgress: 30,
    tier: 'gold'
  },

  // Legendary Tier - Epic achievements
  {
    id: 'void_sovereign',
    name: 'Void Sovereign',
    description: 'Evolve your guardian to max level',
    icon: '🐉',
    kanji: '龍',
    requirement: 'Level 5 Guardian',
    maxProgress: 30,
    tier: 'legendary'
  },
  {
    id: 'perfect_month',
    name: 'Perfect Month',
    description: '80%+ win rate with 50+ trades in a month',
    icon: '✨',
    kanji: '完',
    requirement: '80% win rate, 50 trades',
    maxProgress: 100,
    tier: 'legendary'
  },
  {
    id: 'samurai_legend',
    name: 'Samurai Legend',
    description: 'Unlock all other achievements',
    icon: '🏯',
    kanji: '伝',
    requirement: 'All achievements',
    maxProgress: 14,
    tier: 'legendary'
  }
];

export function calculateAchievementProgress(
  achievementId: string,
  trades: Trade[],
  streak: number
): number {
  const today = new Date().toDateString();
  const todayTrades = trades.filter(t => new Date(t.timestamp).toDateString() === today);
  const wins = trades.filter(t => t.outcome === 'Win');
  const disciplinedTrades = trades.filter(t => t.passedChecklist);
  const calmTrades = trades.filter(t => t.emotion === 'Calm');
  const totalProfit = trades.reduce((sum, t) => sum + (t.pnl > 0 ? t.pnl : 0), 0);
  
  // Calculate current win streak
  let currentWinStreak = 0;
  for (let i = trades.length - 1; i >= 0; i--) {
    if (trades[i].outcome === 'Win') {
      currentWinStreak++;
    } else {
      break;
    }
  }

  // Calculate max win streak ever
  let maxWinStreak = 0;
  let tempStreak = 0;
  for (const trade of trades) {
    if (trade.outcome === 'Win') {
      tempStreak++;
      maxWinStreak = Math.max(maxWinStreak, tempStreak);
    } else {
      tempStreak = 0;
    }
  }

  switch (achievementId) {
    case 'first_blood':
      return Math.min(trades.length, 1);
    case 'triple_strike':
      return Math.min(todayTrades.length, 3);
    case 'first_victory':
      return Math.min(wins.length, 1);
    case 'discipline_initiate':
      return Math.min(disciplinedTrades.length, 1);
    case 'winning_streak_5':
      return Math.min(maxWinStreak, 5);
    case 'winning_streak_10':
      return Math.min(maxWinStreak, 10);
    case 'century_warrior':
      return Math.min(trades.length, 100);
    case 'zen_master':
      return Math.min(calmTrades.length, 10);
    case 'profit_hunter':
      return Math.min(totalProfit, 1000);
    case 'profit_lord':
      return Math.min(totalProfit, 10000);
    case 'week_warrior':
      return Math.min(streak, 7);
    case 'month_master':
      return Math.min(streak, 30);
    case 'discipline_master':
      return Math.min(disciplinedTrades.length, 50);
    case 'void_sovereign':
      return Math.min(streak, 30);
    case 'perfect_month':
      // Check last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const monthTrades = trades.filter(t => new Date(t.timestamp) >= thirtyDaysAgo);
      const monthWins = monthTrades.filter(t => t.outcome === 'Win');
      const winRate = monthTrades.length > 0 ? (monthWins.length / monthTrades.length) * 100 : 0;
      if (monthTrades.length >= 50 && winRate >= 80) return 100;
      return Math.min(monthTrades.length, 50) + (winRate >= 80 ? 50 : 0);
    case 'samurai_legend':
      // Count unlocked achievements (excluding this one)
      return 0; // Will be calculated separately
    default:
      return 0;
  }
}

export function checkNewAchievements(
  currentAchievements: Achievement[],
  trades: Trade[],
  streak: number
): { updated: Achievement[], newlyUnlocked: Achievement[] } {
  const newlyUnlocked: Achievement[] = [];
  
  const updated = ACHIEVEMENTS_DATA.map(achData => {
    const existing = currentAchievements.find(a => a.id === achData.id);
    const progress = calculateAchievementProgress(achData.id, trades, streak);
    const isComplete = progress >= achData.maxProgress;
    
    const achievement: Achievement = {
      ...achData,
      progress,
      unlockedAt: existing?.unlockedAt || (isComplete ? new Date().toISOString() : undefined)
    };

    // Check if newly unlocked
    if (isComplete && !existing?.unlockedAt) {
      newlyUnlocked.push(achievement);
    }

    return achievement;
  });

  // Handle samurai_legend separately
  const legendIndex = updated.findIndex(a => a.id === 'samurai_legend');
  if (legendIndex !== -1) {
    const unlockedCount = updated.filter(a => a.id !== 'samurai_legend' && a.unlockedAt).length;
    updated[legendIndex].progress = unlockedCount;
    if (unlockedCount >= 14 && !updated[legendIndex].unlockedAt) {
      updated[legendIndex].unlockedAt = new Date().toISOString();
      newlyUnlocked.push(updated[legendIndex]);
    }
  }

  return { updated, newlyUnlocked };
}

export function getTierColor(tier: Achievement['tier']): string {
  switch (tier) {
    case 'bronze': return '#CD7F32';
    case 'silver': return '#C0C0C0';
    case 'gold': return '#FFD700';
    case 'legendary': return '#a855f7';
    default: return '#666';
  }
}

export function getTierBg(tier: Achievement['tier']): string {
  switch (tier) {
    case 'bronze': return 'bg-orange-100 dark:bg-orange-900/20';
    case 'silver': return 'bg-gray-100 dark:bg-gray-800/50';
    case 'gold': return 'bg-yellow-100 dark:bg-yellow-900/20';
    case 'legendary': return 'bg-purple-100 dark:bg-purple-900/20';
    default: return 'bg-gray-100';
  }
}
