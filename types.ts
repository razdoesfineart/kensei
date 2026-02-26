export interface Trade {
  id: string;
  signature?: string;
  tokenName: string;
  tokenMint?: string;
  tokenLogo?: string;
  tradeType: 'Long' | 'Short' | 'BUY' | 'SELL';
  entryPrice: number;
  exitPrice: number;
  positionSize: number;
  tradeReason: string;
  outcome: 'Win' | 'Loss' | 'Open';
  emotion: string;
  timestamp: string;
  passedChecklist: boolean;
  pnl: number;
  pnlPercent: number;
  isFromChain?: boolean;
  amount?: number;
  currentPrice?: number;
  logCompleted?: boolean;
}

export interface DetectedTrade {
  signature: string;
  type: 'BUY' | 'SELL';
  tokenMint: string;
  tokenSymbol: string;
  tokenName: string;
  tokenLogo: string;
  amount: number;
  pricePerToken: number;
  totalValue: number;
  timestamp: number;
  emotion?: string;
  checklist?: boolean;
  notes?: string;
}

export interface TokenInfo {
  mint: string;
  symbol: string;
  name: string;
  logo: string;
  decimals: number;
  price?: number;
  priceChange24h?: number;
}

export interface WalletHolding {
  mint: string;
  symbol: string;
  name: string;
  logo: string;
  amount: number;
  value: number;
  avgEntryPrice?: number;
  currentPrice: number;
  pnl: number;
  pnlPercent: number;
}

export interface TrackedWallet {
  address: string;
  nickname?: string;
  addedAt: string;
  lastChecked?: string;
  totalPnl: number;
  tradesCount: number;
}

export interface PriceHistory {
  timestamp: number;
  price: number;
}

export interface Emotion {
  emoji: string;
  label: string;
  kanji: string;
  color: string;
}

export enum View {
  HOME = 'home',
  JOURNAL = 'journal',
  STATS = 'stats',
  GUARDIAN = 'guardian',
  SETTINGS = 'settings',
  ACHIEVEMENTS = 'achievements',
  TRACKER = 'tracker'
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  kanji: string;
  requirement: string;
  unlockedAt?: string;
  progress: number;
  maxProgress: number;
  tier: 'bronze' | 'silver' | 'gold' | 'legendary' | 'mythical';
}

export interface AppSettings {
  isDarkMode: boolean;
  realityCheckEnabled: boolean;
  realityCheckInterval: number;
  meditationCooldownEnabled: boolean;
  consecutiveLossLimit: number;
  cooldownDuration: number;
  soundEnabled: boolean;
  trackedWallet: string | null;
  heliusApiKey: string;
  autoTrackEnabled: boolean;
  pollingInterval: number;
}

export interface CooldownState {
  isActive: boolean;
  endsAt: string | null;
  reason: string;
}

export interface EscalatingCooldown {
  missedLogs: number;
  currentPenaltyMinutes: number;
  lastMissedAt: string | null;
}

export interface PendingTrade {
  trade: DetectedTrade;
  detectedAt: string;
  deadlineAt: string;
  logCompleted: boolean;
}

export interface AppState {
  trades: Trade[];
  streak: number;
  achievements: Achievement[];
  settings: AppSettings;
  cooldown: CooldownState;
  escalatingCooldown: EscalatingCooldown;
  lastRealityCheck: string | null;
  consecutiveLosses: number;
  trackedWallet: TrackedWallet | null;
  pendingTrades: PendingTrade[];
  holdings: WalletHolding[];
  lastPolledSignature: string | null;
}
