// XP System for Guardian Evolution
export const ACHIEVEMENT_XP = {
  first_blood: 50, triple_strike: 75, first_victory: 50, discipline_initiate: 100,
  winning_streak_5: 200, century_warrior: 300, zen_master: 250, profit_hunter: 350, week_warrior: 200,
  winning_streak_10: 500, discipline_master: 600, profit_lord: 750, month_master: 500,
  void_sovereign: 1000, perfect_month: 1500, samurai_legend: 2000,
  kensei: 5000,
};

export const EVOLUTION_STAGES = [
  { level: 1, name: 'Mystery Egg', xpRequired: 0, description: 'The egg awaits...' },
  { level: 2, name: 'Spirit Hatchling', xpRequired: 275, description: 'Your guardian has awakened!' },
  { level: 3, name: 'Storm Whelp', xpRequired: 1575, description: 'Growing stronger with each battle.' },
  { level: 4, name: 'Thunder Drake', xpRequired: 3925, description: 'A force to be reckoned with.' },
  { level: 5, name: 'Celestial Dragon', xpRequired: 8425, description: 'Mastery of the ancient arts.' },
  { level: 6, name: 'Ascended Kensei', xpRequired: 13425, description: 'The ultimate form. Legend incarnate.' },
];

export function calculateTotalXP(achievements) {
  let total = 0;
  for (const ach of achievements) {
    if (ach.unlockedAt && ACHIEVEMENT_XP[ach.id]) total += ACHIEVEMENT_XP[ach.id];
  }
  return total;
}

export function getCurrentStage(totalXP) {
  let stage = EVOLUTION_STAGES[0];
  for (const s of EVOLUTION_STAGES) {
    if (totalXP >= s.xpRequired) stage = s; else break;
  }
  return stage;
}

export function getNextStage(totalXP) {
  for (const s of EVOLUTION_STAGES) {
    if (totalXP < s.xpRequired) return s;
  }
  return null;
}

export function getXPProgress(totalXP) {
  const current = getCurrentStage(totalXP);
  const next = getNextStage(totalXP);
  if (!next) return { current, next: null, progress: 100, xpToNext: 0 };
  const xpInLevel = totalXP - current.xpRequired;
  const xpNeeded = next.xpRequired - current.xpRequired;
  return { current, next, progress: Math.min((xpInLevel / xpNeeded) * 100, 100), xpToNext: next.xpRequired - totalXP };
}

export function hasHatched(totalXP) { return totalXP >= 275; }
