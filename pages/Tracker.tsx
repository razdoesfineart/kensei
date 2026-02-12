import React, { useState, useEffect } from 'react';
import { TrackedWallet, WalletHolding, Trade } from '../types';
import AnimeCard from '../components/AnimeCard';
import TokenDetailDropdown from '../components/TokenDetailDropdown';
import { Wallet, Search, Zap, TrendingUp, TrendingDown, RefreshCw, Trash2, ExternalLink, Copy, Check, AlertCircle, DollarSign, Coins } from 'lucide-react';
import { isValidSolanaAddress, formatWalletAddress, fetchWalletHoldings } from '../helius';

interface TrackerProps {
  trackedWallet: TrackedWallet | null;
  holdings: WalletHolding[];
  trades: Trade[];
  isTracking: boolean;
  lastPolled: string | null;
  onStartTracking: (address: string) => void;
  onStopTracking: () => void;
  onRefresh: () => void;
}

const Tracker: React.FC<TrackerProps> = ({
  trackedWallet,
  holdings,
  trades,
  isTracking,
  lastPolled,
  onStartTracking,
  onStopTracking,
  onRefresh
}) => {
  const [walletInput, setWalletInput] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [displayCurrency, setDisplayCurrency] = useState<'SOL' | 'USDC'>('USDC');
  const [solPrice, setSolPrice] = useState<number>(0);

  // Fetch SOL price for conversions
  useEffect(() => {
    const fetchSolPrice = async () => {
      try {
        const res = await fetch('https://price.jup.ag/v4/price?ids=So11111111111111111111111111111111111111112');
        const data = await res.json();
        setSolPrice(data.data?.['So11111111111111111111111111111111111111112']?.price || 0);
      } catch (e) {
        console.error('Failed to fetch SOL price');
      }
    };
    fetchSolPrice();
    const interval = setInterval(fetchSolPrice, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  const handleStartTracking = async () => {
    const address = walletInput.trim();
    
    if (!address) {
      setError('Please enter a wallet address');
      return;
    }

    if (!isValidSolanaAddress(address)) {
      setError('Invalid Solana wallet address');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      onStartTracking(address);
      setWalletInput('');
    } catch (err) {
      setError('Failed to start tracking. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyAddress = () => {
    if (trackedWallet) {
      navigator.clipboard.writeText(trackedWallet.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatValue = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(2)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(2)}K`;
    return `$${value.toFixed(2)}`;
  };

  const totalValue = holdings.reduce((sum, h) => sum + (h.amount * h.currentPrice), 0);

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-black dark:text-white">
            Wallet <span className="text-purple-500">Tracker</span>
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 font-medium">
            Track any Solana wallet's trading activity in real-time.
          </p>
        </div>
        {isTracking && (
          <div className="flex items-center gap-2 bg-green-100 dark:bg-green-900/30 px-4 py-2 rounded-full border-2 border-green-500">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-bold text-green-700 dark:text-green-300 uppercase">Live Tracking</span>
          </div>
        )}
      </div>

      {!trackedWallet ? (
        /* No wallet tracked - Show input */
        <AnimeCard title="Connect Wallet" subtitle="Paste any Solana wallet address to start tracking" variant="purple">
          <div className="space-y-4">
            <div className="relative">
              <Wallet className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                value={walletInput}
                onChange={(e) => { setWalletInput(e.target.value); setError(''); }}
                placeholder="Enter Solana wallet address..."
                className="w-full pl-12 pr-4 py-4 border-4 border-black rounded-2xl font-mono text-sm bg-gray-50 dark:bg-gray-800 text-black dark:text-white focus:outline-none focus:ring-4 ring-purple-500/30"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border-2 border-red-200 rounded-xl">
                <AlertCircle className="text-red-500" size={18} />
                <span className="text-sm font-bold text-red-600 dark:text-red-400">{error}</span>
              </div>
            )}

            <button
              onClick={handleStartTracking}
              disabled={isLoading || !walletInput}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white py-4 rounded-2xl font-black uppercase tracking-widest border-4 border-black anime-border-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <RefreshCw className="animate-spin" size={20} />
              ) : (
                <Search size={20} />
              )}
              {isLoading ? 'Connecting...' : 'Start Tracking'}
            </button>

            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl border-2 border-dashed border-purple-200">
              <h4 className="font-bold text-sm text-purple-800 dark:text-purple-300 mb-2">How it works:</h4>
              <ul className="text-xs text-purple-700 dark:text-purple-400 space-y-1">
                <li>• Paste any Solana wallet address</li>
                <li>• App polls for new trades every ~30 seconds</li>
                <li>• When a trade is detected, you must log your emotional state</li>
                <li>• Trades are auto-saved with all chain data</li>
                <li>• Skip logging = escalating cooldown (2→5→10→20→60 min)</li>
              </ul>
            </div>
          </div>
        </AnimeCard>
      ) : (
        /* Wallet is being tracked */
        <>
          {/* Tracked Wallet Info */}
          <div className="bg-gradient-to-br from-purple-600 to-indigo-700 p-6 rounded-3xl border-4 border-black anime-border text-white">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                  <Wallet size={32} />
                </div>
                <div>
                  <span className="text-xs font-bold uppercase tracking-widest opacity-70">Tracking Wallet</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-lg font-bold">{formatWalletAddress(trackedWallet.address)}</span>
                    <button onClick={handleCopyAddress} className="p-1 hover:bg-white/20 rounded">
                      {copied ? <Check size={16} /> : <Copy size={16} />}
                    </button>
                    <a 
                      href={`https://solscan.io/account/${trackedWallet.address}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1 hover:bg-white/20 rounded"
                    >
                      <ExternalLink size={16} />
                    </a>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={onRefresh}
                  className="p-3 bg-white/20 hover:bg-white/30 rounded-xl transition-colors"
                  title="Refresh holdings"
                >
                  <RefreshCw size={20} />
                </button>
                <button
                  onClick={onStopTracking}
                  className="p-3 bg-red-500/80 hover:bg-red-500 rounded-xl transition-colors"
                  title="Stop tracking"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mt-6">
              <div className="bg-white/10 rounded-xl p-4 text-center">
                <span className="text-xs font-bold uppercase opacity-70 block">Total Value</span>
                <span className="text-2xl font-black">{formatValue(totalValue)}</span>
              </div>
              <div className="bg-white/10 rounded-xl p-4 text-center">
                <span className="text-xs font-bold uppercase opacity-70 block">Trades Logged</span>
                <span className="text-2xl font-black">{trackedWallet.tradesCount}</span>
              </div>
              <div className="bg-white/10 rounded-xl p-4 text-center">
                <span className="text-xs font-bold uppercase opacity-70 block">Total P&L</span>
                <span className={`text-2xl font-black ${trackedWallet.totalPnl >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                  {trackedWallet.totalPnl >= 0 ? '+' : ''}{formatValue(trackedWallet.totalPnl)}
                </span>
              </div>
            </div>

            {lastPolled && (
              <div className="mt-4 text-center text-xs opacity-60">
                Last checked: {new Date(lastPolled).toLocaleTimeString()}
              </div>
            )}
          </div>

          {/* Holdings */}
          <AnimeCard title="Current Holdings" subtitle="Click any token for details, charts & trade history" variant="black">
            {/* Currency Toggle */}
            <div className="flex items-center justify-between mb-4 p-3 bg-gray-100 dark:bg-gray-800 rounded-xl">
              <span className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase">Display Values In</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setDisplayCurrency('USDC')}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-bold transition-colors ${
                    displayCurrency === 'USDC' 
                      ? 'bg-black text-white' 
                      : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-2 border-gray-200 dark:border-gray-600'
                  }`}
                >
                  <DollarSign size={14} /> USDC
                </button>
                <button
                  onClick={() => setDisplayCurrency('SOL')}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-bold transition-colors ${
                    displayCurrency === 'SOL' 
                      ? 'bg-black text-white' 
                      : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-2 border-gray-200 dark:border-gray-600'
                  }`}
                >
                  <Coins size={14} /> SOL
                </button>
              </div>
            </div>

            {holdings.length === 0 ? (
              <div className="text-center py-10">
                <Wallet className="mx-auto mb-4 text-gray-300" size={48} />
                <p className="text-gray-500 font-medium">No token holdings found</p>
                <p className="text-xs text-gray-400 mt-1">Holdings will appear here once detected</p>
              </div>
            ) : (
              <div className="space-y-3">
                {holdings.map((holding) => (
                  <TokenDetailDropdown
                    key={holding.mint}
                    holding={holding}
                    trades={trades}
                    displayCurrency={displayCurrency}
                    solPrice={solPrice}
                    onToggleCurrency={() => setDisplayCurrency(prev => prev === 'USDC' ? 'SOL' : 'USDC')}
                  />
                ))}
              </div>
            )}
          </AnimeCard>

          {/* Instructions */}
          <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border-2 border-yellow-200 dark:border-yellow-800">
            <div className="flex items-start gap-3">
              <Zap className="text-yellow-600 shrink-0 mt-0.5" size={20} />
              <div>
                <h4 className="font-bold text-yellow-800 dark:text-yellow-300 text-sm">Auto-Tracking Active</h4>
                <p className="text-xs text-yellow-700 dark:text-yellow-400 mt-1">
                  When this wallet makes a trade, you'll be prompted to log your emotional state. 
                  All trade data (token, price, amount) will be automatically filled in the Honor section.
                  Missing a log results in escalating cooldowns.
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Tracker;
