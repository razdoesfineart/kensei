import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Trade, Achievement, AppSettings, CooldownState, TrackedWallet, WalletHolding, PendingTrade, DetectedTrade, EscalatingCooldown } from './types';
import Home from './pages/Home';
import Journal from './pages/Journal';
import Stats from './pages/Stats';
import Guardian from './pages/Guardian';
import Settings from './pages/Settings';
import Achievements from './pages/Achievements';
import Tracker from './pages/Tracker';
import Navigation from './components/Navigation';
import { ToastContainer, useToasts } from './components/Toast';
import CooldownModal from './components/CooldownModal';
import RealityCheckModal from './components/RealityCheckModal';
import TradeAlertModal from './components/TradeAlertModal';
import { ACHIEVEMENTS_DATA, checkNewAchievements } from './achievements';
import { pollNewTransactions, fetchWalletHoldings, formatWalletAddress } from './helius';

// Debug helper - logs with timestamp
const dbg = (msg: string, ...args: any[]) => {
  console.log(`[Kensei ${new Date().toLocaleTimeString()}] ${msg}`, ...args);
};

const DEFAULT_SETTINGS: AppSettings = {
  isDarkMode: false,
  realityCheckEnabled: true,
  realityCheckInterval: 30,
  meditationCooldownEnabled: true,
  consecutiveLossLimit: 3,
  cooldownDuration: 15,
  soundEnabled: true,
  trackedWallet: null,
  heliusApiKey: '1cc921d2-76b3-4761-aad7-d89a5a5bd011',
  autoTrackEnabled: true,
  pollingInterval: 30
};

const DEFAULT_ESCALATING_COOLDOWN: EscalatingCooldown = {
  missedLogs: 0,
  currentPenaltyMinutes: 2,
  lastMissedAt: null
};

const COOLDOWN_PENALTIES = [2, 5, 10, 20, 60];

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>(View.HOME);
  
  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('settings');
    return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
  });

  const [trades, setTrades] = useState<Trade[]>(() => {
    const saved = localStorage.getItem('trades');
    return saved ? JSON.parse(saved) : [];
  });

  const [streak, setStreak] = useState<number>(() => {
    const saved = localStorage.getItem('streak');
    return saved ? parseInt(saved) : 0;
  });

  const [achievements, setAchievements] = useState<Achievement[]>(() => {
    const saved = localStorage.getItem('achievements');
    if (saved) return JSON.parse(saved);
    return ACHIEVEMENTS_DATA.map(a => ({ ...a, progress: 0 }));
  });

  const [cooldown, setCooldown] = useState<CooldownState>(() => {
    const saved = localStorage.getItem('cooldown');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.isActive && parsed.endsAt && new Date(parsed.endsAt) <= new Date()) {
        return { isActive: false, endsAt: null, reason: '' };
      }
      return parsed;
    }
    return { isActive: false, endsAt: null, reason: '' };
  });

  const [escalatingCooldown, setEscalatingCooldown] = useState<EscalatingCooldown>(() => {
    const saved = localStorage.getItem('escalatingCooldown');
    return saved ? JSON.parse(saved) : DEFAULT_ESCALATING_COOLDOWN;
  });

  const [consecutiveLosses, setConsecutiveLosses] = useState<number>(() => {
    const saved = localStorage.getItem('consecutiveLosses');
    return saved ? parseInt(saved) : 0;
  });

  const [showRealityCheck, setShowRealityCheck] = useState(false);
  const [lastRealityCheck, setLastRealityCheck] = useState<string | null>(() => {
    return localStorage.getItem('lastRealityCheck');
  });

  const [trackedWallet, setTrackedWallet] = useState<TrackedWallet | null>(() => {
    const saved = localStorage.getItem('trackedWallet');
    return saved ? JSON.parse(saved) : null;
  });

  const [holdings, setHoldings] = useState<WalletHolding[]>([]);
  const [lastPolledSignature, setLastPolledSignature] = useState<string | null>(() => {
    return localStorage.getItem('lastPolledSignature');
  });
  const [lastPolledTime, setLastPolledTime] = useState<string | null>(null);
  const [isTracking, setIsTracking] = useState(false);

  const [pendingTrades, setPendingTrades] = useState<PendingTrade[]>(() => {
    const saved = localStorage.getItem('pendingTrades');
    return saved ? JSON.parse(saved) : [];
  });

  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastPolledSigRef = useRef<string | null>(lastPolledSignature);
  const pendingTradesRef = useRef<PendingTrade[]>(pendingTrades);
  const tradesRef = useRef<Trade[]>(trades);
  const trackedWalletRef = useRef<TrackedWallet | null>(trackedWallet);
  const { toasts, dismissToast, showAchievement, showWarning, showSuccess } = useToasts();

  // Keep refs in sync with state (avoids stale closures in polling interval)
  useEffect(() => { lastPolledSigRef.current = lastPolledSignature; }, [lastPolledSignature]);
  useEffect(() => { pendingTradesRef.current = pendingTrades; }, [pendingTrades]);
  useEffect(() => { tradesRef.current = trades; }, [trades]);
  useEffect(() => { trackedWalletRef.current = trackedWallet; }, [trackedWallet]);

  // Save to localStorage
  useEffect(() => { localStorage.setItem('trades', JSON.stringify(trades)); }, [trades]);
  useEffect(() => { localStorage.setItem('settings', JSON.stringify(settings)); }, [settings]);
  useEffect(() => { localStorage.setItem('streak', streak.toString()); }, [streak]);
  useEffect(() => { localStorage.setItem('achievements', JSON.stringify(achievements)); }, [achievements]);
  useEffect(() => { localStorage.setItem('cooldown', JSON.stringify(cooldown)); }, [cooldown]);
  useEffect(() => { localStorage.setItem('escalatingCooldown', JSON.stringify(escalatingCooldown)); }, [escalatingCooldown]);
  useEffect(() => { localStorage.setItem('consecutiveLosses', consecutiveLosses.toString()); }, [consecutiveLosses]);
  useEffect(() => { if (lastRealityCheck) localStorage.setItem('lastRealityCheck', lastRealityCheck); }, [lastRealityCheck]);
  useEffect(() => { 
    if (trackedWallet) localStorage.setItem('trackedWallet', JSON.stringify(trackedWallet));
    else localStorage.removeItem('trackedWallet');
  }, [trackedWallet]);
  useEffect(() => { if (lastPolledSignature) localStorage.setItem('lastPolledSignature', lastPolledSignature); }, [lastPolledSignature]);
  useEffect(() => { localStorage.setItem('pendingTrades', JSON.stringify(pendingTrades)); }, [pendingTrades]);

  useEffect(() => {
    if (settings.isDarkMode) {
      document.body.classList.add('dark', 'bg-[#0f0f12]', 'text-[#F5F5F5]');
      document.body.classList.remove('bg-[#F8F8F8]', 'text-[#2D2D2D]');
    } else {
      document.body.classList.remove('dark', 'bg-[#0f0f12]', 'text-[#F5F5F5]');
      document.body.classList.add('bg-[#F8F8F8]', 'text-[#2D2D2D]');
    }
  }, [settings.isDarkMode]);

  const handleNewTradeDetected = useCallback((trade: DetectedTrade) => {
    dbg('handleNewTradeDetected called:', trade.type, trade.tokenSymbol, trade.signature?.slice(0, 10));
    
    const alreadyPending = pendingTradesRef.current.some(p => p.trade.signature === trade.signature);
    const alreadyLogged = tradesRef.current.some(t => t.signature === trade.signature);
    if (alreadyPending || alreadyLogged) {
      dbg('Trade already known, skipping. pending:', alreadyPending, 'logged:', alreadyLogged);
      return;
    }

    const now = new Date();
    const deadline = new Date(now.getTime() + 2 * 60 * 1000);

    const newPendingTrade: PendingTrade = {
      trade,
      detectedAt: now.toISOString(),
      deadlineAt: deadline.toISOString(),
      logCompleted: false
    };

    dbg('Adding new pending trade:', trade.tokenSymbol);
    setPendingTrades(prev => [...prev, newPendingTrade]);
    showWarning(`${trade.type} Detected!`, `${trade.type === 'BUY' ? 'Bought' : 'Sold'} ${trade.amount.toFixed(4)} ${trade.tokenSymbol} - Log now!`);
    setCurrentView(View.TRACKER);
  }, [showWarning]);

  // Stable ref for handleNewTradeDetected so polling never restarts
  const handleNewTradeRef = useRef(handleNewTradeDetected);
  useEffect(() => { handleNewTradeRef.current = handleNewTradeDetected; }, [handleNewTradeDetected]);

  const startPolling = useCallback(() => {
    if (!trackedWalletRef.current || pollingIntervalRef.current) {
      dbg('Polling not started - wallet:', !!trackedWalletRef.current, 'existing interval:', !!pollingIntervalRef.current);
      return;
    }
    
    const walletAddr = trackedWalletRef.current.address;
    dbg('Starting polling for wallet:', walletAddr);
    setIsTracking(true);

    const poll = async () => {
      const wallet = trackedWalletRef.current;
      if (!wallet) {
        dbg('No wallet in ref, skipping poll');
        return;
      }
      
      const currentSig = lastPolledSigRef.current;
      dbg('Polling... Last sig:', currentSig?.slice(0, 10) || 'null');
      
      try {
        const newSig = await pollNewTransactions(wallet.address, currentSig, (trade) => handleNewTradeRef.current(trade));
        dbg('Poll complete. New sig:', newSig?.slice(0, 10) || 'null', 'Changed:', newSig !== currentSig);
        
        if (newSig && newSig !== currentSig) {
          setLastPolledSignature(newSig);
        }
        setLastPolledTime(new Date().toISOString());
        
        const newHoldings = await fetchWalletHoldings(wallet.address);
        setHoldings(newHoldings);
      } catch (error) {
        console.error('Polling error:', error);
      }
    };

    // Initial poll immediately
    poll();
    
    // Then poll every 15 seconds
    pollingIntervalRef.current = setInterval(poll, 15000);
  }, []); // No dependencies - uses only refs

  const stopPolling = useCallback(() => {
    console.log('Stopping polling');
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    setIsTracking(false);
  }, []);

  // Start polling when wallet is tracked
  useEffect(() => {
    if (trackedWallet && settings.autoTrackEnabled) {
      dbg('Wallet tracked, auto-track enabled, starting polling');
      startPolling();
    }
    return () => {
      if (pollingIntervalRef.current) {
        dbg('Cleaning up polling interval');
        stopPolling();
      }
    };
  }, [trackedWallet?.address, settings.autoTrackEnabled]);

  const handleStartTracking = async (address: string) => {
    const newWallet: TrackedWallet = {
      address,
      addedAt: new Date().toISOString(),
      totalPnl: 0,
      tradesCount: trades.filter(t => t.isFromChain).length
    };
    setTrackedWallet(newWallet);
    setLastPolledSignature(null);
    const initialHoldings = await fetchWalletHoldings(address);
    setHoldings(initialHoldings);
    showSuccess('Tracking Started', `Now tracking ${formatWalletAddress(address)}`);
  };

  const handleStopTracking = () => {
    stopPolling();
    setTrackedWallet(null);
    setHoldings([]);
    setLastPolledSignature(null);
    localStorage.removeItem('trackedWallet');
    localStorage.removeItem('lastPolledSignature');
    showSuccess('Tracking Stopped', 'Wallet tracking has been disabled');
  };

  const handleCompletePendingLog = (emotion: string, passedChecklist: boolean, notes: string) => {
    const pending = pendingTrades[0];
    if (!pending) return;

    const newTrade: Trade = {
      id: pending.trade.signature,
      signature: pending.trade.signature,
      tokenName: pending.trade.tokenSymbol,
      tokenMint: pending.trade.tokenMint,
      tokenLogo: pending.trade.tokenLogo,
      tradeType: pending.trade.type,
      entryPrice: pending.trade.pricePerToken,
      exitPrice: 0,
      positionSize: pending.trade.totalValue,
      tradeReason: notes,
      outcome: 'Open',
      emotion,
      timestamp: new Date(pending.trade.timestamp).toISOString(),
      passedChecklist,
      pnl: 0,
      pnlPercent: 0,
      isFromChain: true,
      amount: pending.trade.amount,
      currentPrice: pending.trade.pricePerToken,
      logCompleted: true
    };

    setTrades(prev => [...prev, newTrade]);
    setPendingTrades(prev => prev.slice(1));

    if (trackedWallet) {
      setTrackedWallet(prev => prev ? { ...prev, tradesCount: prev.tradesCount + 1 } : null);
    }

    const newAchievements = checkNewAchievements(achievements, [...trades, newTrade], streak);
    if (newAchievements.length > 0) {
      newAchievements.forEach(a => showAchievement(a.name, a.description, a.icon));
      setAchievements(newAchievements);
    }

    showSuccess('Trade Logged!', `${pending.trade.type} ${pending.trade.tokenSymbol} recorded with discipline`);
  };

  const handleMissedLog = () => {
    const pending = pendingTrades[0];
    if (!pending) return;

    const missedCount = escalatingCooldown.missedLogs + 1;
    const penaltyIndex = Math.min(missedCount - 1, COOLDOWN_PENALTIES.length - 1);
    const penaltyMinutes = COOLDOWN_PENALTIES[penaltyIndex];

    const newTrade: Trade = {
      id: pending.trade.signature,
      signature: pending.trade.signature,
      tokenName: pending.trade.tokenSymbol,
      tokenMint: pending.trade.tokenMint,
      tokenLogo: pending.trade.tokenLogo,
      tradeType: pending.trade.type,
      entryPrice: pending.trade.pricePerToken,
      exitPrice: 0,
      positionSize: pending.trade.totalValue,
      tradeReason: '[LOG MISSED]',
      outcome: 'Open',
      emotion: 'Unknown',
      timestamp: new Date(pending.trade.timestamp).toISOString(),
      passedChecklist: false,
      pnl: 0,
      pnlPercent: 0,
      isFromChain: true,
      amount: pending.trade.amount,
      currentPrice: pending.trade.pricePerToken,
      logCompleted: false
    };

    setTrades(prev => [...prev, newTrade]);
    setPendingTrades(prev => prev.slice(1));

    setEscalatingCooldown({
      missedLogs: missedCount,
      currentPenaltyMinutes: penaltyMinutes,
      lastMissedAt: new Date().toISOString()
    });

    const cooldownEnd = new Date(Date.now() + penaltyMinutes * 60 * 1000);
    setCooldown({
      isActive: true,
      endsAt: cooldownEnd.toISOString(),
      reason: `Missed trade log (${missedCount} offense${missedCount > 1 ? 's' : ''})`
    });

    showWarning('Log Missed!', `${penaltyMinutes} minute cooldown activated`);
  };

  const addTrade = useCallback((trade: Trade) => {
    const newTrades = [...trades, trade];
    setTrades(newTrades);

    if (trade.outcome === 'Loss') {
      const newConsecutive = consecutiveLosses + 1;
      setConsecutiveLosses(newConsecutive);
      if (settings.meditationCooldownEnabled && newConsecutive >= settings.consecutiveLossLimit) {
        const cooldownEnd = new Date(Date.now() + settings.cooldownDuration * 60 * 1000);
        setCooldown({ isActive: true, endsAt: cooldownEnd.toISOString(), reason: `${newConsecutive} consecutive losses` });
        showWarning('Cooldown Activated', `Take ${settings.cooldownDuration} minutes to reflect.`);
      }
    } else {
      setConsecutiveLosses(0);
    }

    const newAchievements = checkNewAchievements(achievements, newTrades, streak);
    if (newAchievements.length > 0) {
      newAchievements.forEach(a => showAchievement(a.name, a.description, a.icon));
      setAchievements(newAchievements);
    }
  }, [trades, consecutiveLosses, settings, achievements, streak, showAchievement, showWarning]);

  const updateSettings = (updates: Partial<AppSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  };

  const handleCooldownEnd = () => {
    setCooldown({ isActive: false, endsAt: null, reason: '' });
    showSuccess('Cooldown Complete', 'You may resume trading. Stay disciplined!');
  };

  const handleRealityCheckComplete = () => {
    setShowRealityCheck(false);
    setLastRealityCheck(new Date().toISOString());
  };

  const handleRefreshHoldings = async () => {
    if (!trackedWallet) return;
    const newHoldings = await fetchWalletHoldings(trackedWallet.address);
    setHoldings(newHoldings);
    setLastPolledTime(new Date().toISOString());
    showSuccess('Refreshed', 'Holdings updated');
  };

  const handleClearData = () => {
    setTrades([]);
    setStreak(0);
    setConsecutiveLosses(0);
    setCooldown({ isActive: false, endsAt: null, reason: '' });
    setEscalatingCooldown(DEFAULT_ESCALATING_COOLDOWN);
    setAchievements(ACHIEVEMENTS_DATA.map(a => ({ ...a, progress: 0 })));
    setPendingTrades([]);
    localStorage.clear();
  };

  const unlockedAchievements = achievements.filter(a => a.unlockedAt).length;

  const renderView = () => {
    switch (currentView) {
      case View.HOME: return <Home trades={trades} streak={streak} setView={setCurrentView} />;
      case View.TRACKER: return <Tracker trackedWallet={trackedWallet} holdings={holdings} trades={trades} isTracking={isTracking} lastPolled={lastPolledTime} onStartTracking={handleStartTracking} onStopTracking={handleStopTracking} onRefresh={handleRefreshHoldings} />;
      case View.JOURNAL: return <Journal onSaveTrade={addTrade} setView={setCurrentView} isCooldownActive={cooldown.isActive} />;
      case View.STATS: return <Stats trades={trades} />;
      case View.GUARDIAN: return <Guardian streak={streak} />;
      case View.ACHIEVEMENTS: return <Achievements achievements={achievements} />;
      case View.SETTINGS: return <Settings settings={settings} updateSettings={updateSettings} onClearData={handleClearData} trades={trades} />;
      default: return <Home trades={trades} streak={streak} setView={setCurrentView} />;
    }
  };

  const currentPendingTrade = pendingTrades[0];

  return (
    <div className="min-h-screen flex flex-col md:flex-row font-['Space_Grotesk'] relative">
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
      <CooldownModal cooldown={cooldown} onCooldownEnd={handleCooldownEnd} />
      {showRealityCheck && <RealityCheckModal onComplete={handleRealityCheckComplete} onWarning={(msg) => showWarning('Emotional Warning', msg)} />}
      {currentPendingTrade && !cooldown.isActive && (
        <TradeAlertModal pendingTrade={currentPendingTrade} onComplete={handleCompletePendingLog} onMiss={handleMissedLog} escalationLevel={escalatingCooldown.missedLogs} />
      )}

      <Navigation currentView={currentView} setCurrentView={setCurrentView} unlockedAchievements={unlockedAchievements} isTracking={isTracking} />

      <div className="flex-1 flex flex-col overflow-x-hidden">
        <div className="h-32 md:h-48 pointer-events-none opacity-80 overflow-hidden relative">
          <div className="absolute top-0 right-0 p-4 flex flex-col items-end">
            <span className="text-6xl md:text-8xl font-black opacity-10 select-none">剣聖</span>
          </div>
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-pink-100/50 via-transparent to-transparent"></div>
        </div>

        <main className="flex-1 p-4 md:p-8 z-10 pb-24 md:pb-12">
          <div className="max-w-5xl mx-auto">{renderView()}</div>
        </main>

        <footer className="kensei-footer mt-auto flex items-center justify-between gap-4 p-4 border-t-4 border-black bg-black text-white">
          <div className="flex items-center gap-4">
            <span className="text-3xl font-black">剣聖</span>
            <div className="text-xs font-bold opacity-60">
              <span>Kensei v4.4</span>
              {isTracking && <span className="ml-2 text-green-400">● Live</span>}
            </div>
          </div>
          <div className="text-[10px] font-bold opacity-40">Way of the Blade</div>
        </footer>
      </div>
    </div>
  );
};

export default App;
