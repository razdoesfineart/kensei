import React, { useState, useEffect, useCallback } from 'react';
import { Trade, WalletHolding } from '../types';
import { ChevronDown, ChevronUp, TrendingUp, TrendingDown, DollarSign, Coins, BarChart3, ExternalLink, RefreshCw, Clock } from 'lucide-react';

interface TokenTradeHistory {
  buys: {
    signature: string;
    timestamp: string;
    amount: number;
    pricePerToken: number;
    totalValue: number;
    marketCap?: number;
  }[];
  sells: {
    signature: string;
    timestamp: string;
    amount: number;
    pricePerToken: number;
    totalValue: number;
    percentSold: number;
    marketCap?: number;
  }[];
  totalBought: number;
  totalSold: number;
  avgBuyPrice: number;
  avgSellPrice: number;
  realizedPnl: number;
  unrealizedPnl: number;
}

interface TokenDetailDropdownProps {
  holding: WalletHolding;
  trades: Trade[];
  displayCurrency: 'SOL' | 'USDC';
  solPrice: number;
  onToggleCurrency: () => void;
}

const TokenDetailDropdown: React.FC<TokenDetailDropdownProps> = ({
  holding,
  trades,
  displayCurrency,
  solPrice,
  onToggleCurrency
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'buys' | 'sells' | 'chart'>('overview');
  const [tokenPrice, setTokenPrice] = useState<number>(holding.currentPrice || 0);
  const [marketCap, setMarketCap] = useState<number | null>(null);
  const [priceChange24h, setPriceChange24h] = useState<number>(0);
  const [isLoadingPrice, setIsLoadingPrice] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  // Filter trades for this token
  const tokenTrades = trades.filter(t => 
    t.tokenMint === holding.mint || 
    t.tokenName?.toUpperCase() === holding.symbol?.toUpperCase()
  );

  // Calculate trade history
  const tradeHistory: TokenTradeHistory = React.useMemo(() => {
    const buys: TokenTradeHistory['buys'] = [];
    const sells: TokenTradeHistory['sells'] = [];
    let totalBought = 0;
    let totalSold = 0;
    let totalBuyValue = 0;
    let totalSellValue = 0;

    tokenTrades.forEach(trade => {
      if (trade.tradeType === 'BUY' || trade.tradeType === 'Long') {
        buys.push({
          signature: trade.signature || trade.id,
          timestamp: trade.timestamp,
          amount: trade.amount || trade.positionSize / trade.entryPrice,
          pricePerToken: trade.entryPrice,
          totalValue: trade.positionSize,
          marketCap: undefined
        });
        totalBought += trade.amount || trade.positionSize / trade.entryPrice;
        totalBuyValue += trade.positionSize;
      } else if (trade.tradeType === 'SELL' || trade.tradeType === 'Short') {
        const amount = trade.amount || trade.positionSize / trade.entryPrice;
        sells.push({
          signature: trade.signature || trade.id,
          timestamp: trade.timestamp,
          amount,
          pricePerToken: trade.entryPrice,
          totalValue: trade.positionSize,
          percentSold: totalBought > 0 ? (amount / totalBought) * 100 : 0,
          marketCap: undefined
        });
        totalSold += amount;
        totalSellValue += trade.positionSize;
      }
    });

    const avgBuyPrice = totalBought > 0 ? totalBuyValue / totalBought : 0;
    const avgSellPrice = totalSold > 0 ? totalSellValue / totalSold : 0;
    const realizedPnl = totalSellValue - (avgBuyPrice * totalSold);
    const currentHoldingValue = holding.amount * tokenPrice;
    const costBasis = avgBuyPrice * holding.amount;
    const unrealizedPnl = currentHoldingValue - costBasis;

    return {
      buys,
      sells,
      totalBought,
      totalSold,
      avgBuyPrice,
      avgSellPrice,
      realizedPnl,
      unrealizedPnl
    };
  }, [tokenTrades, holding, tokenPrice]);

  // Fetch token price and market cap
  const fetchTokenData = useCallback(async () => {
    if (!holding.mint) return;
    setIsLoadingPrice(true);

    try {
      // Try DexScreener first - more reliable for memecoins
      const dexRes = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${holding.mint}`);
      const dexData = await dexRes.json();
      
      if (dexData.pairs?.[0]) {
        const pair = dexData.pairs[0];
        if (pair.priceUsd) {
          setTokenPrice(parseFloat(pair.priceUsd));
        }
        setMarketCap(pair.fdv || pair.marketCap || null);
        setPriceChange24h(pair.priceChange?.h24 || 0);
      } else {
        // Fallback to Jupiter
        const priceRes = await fetch(`https://price.jup.ag/v4/price?ids=${holding.mint}`);
        const priceData = await priceRes.json();
        if (priceData.data?.[holding.mint]) {
          setTokenPrice(priceData.data[holding.mint].price || 0);
        }
      }
      
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error fetching token data:', error);
    } finally {
      setIsLoadingPrice(false);
    }
  }, [holding.mint]);

  // Auto-refresh every 10 seconds when expanded
  useEffect(() => {
    if (isExpanded) {
      fetchTokenData();
      const interval = setInterval(fetchTokenData, 10000); // 10 seconds
      return () => clearInterval(interval);
    }
  }, [isExpanded, fetchTokenData]);

  // Convert value based on display currency - FIXED with SOL symbol
  const convertValue = (usdValue: number, showSymbol = true): string => {
    if (displayCurrency === 'SOL' && solPrice > 0) {
      const solValue = usdValue / solPrice;
      return showSymbol ? `◎${solValue.toFixed(4)}` : solValue.toFixed(4);
    }
    return `$${usdValue.toFixed(2)}`;
  };

  // Format for compact display
  const formatCompact = (usdValue: number): string => {
    if (displayCurrency === 'SOL' && solPrice > 0) {
      const solValue = usdValue / solPrice;
      if (solValue >= 1000) return `◎${(solValue / 1000).toFixed(2)}K`;
      if (solValue >= 1) return `◎${solValue.toFixed(2)}`;
      return `◎${solValue.toFixed(4)}`;
    }
    if (usdValue >= 1000000) return `$${(usdValue / 1000000).toFixed(2)}M`;
    if (usdValue >= 1000) return `$${(usdValue / 1000).toFixed(2)}K`;
    return `$${usdValue.toFixed(2)}`;
  };

  const formatMarketCap = (mc: number | null): string => {
    if (!mc) return 'N/A';
    if (mc >= 1e9) return `$${(mc / 1e9).toFixed(2)}B`;
    if (mc >= 1e6) return `$${(mc / 1e6).toFixed(2)}M`;
    if (mc >= 1e3) return `$${(mc / 1e3).toFixed(2)}K`;
    return `$${mc.toFixed(2)}`;
  };

  const formatPrice = (price: number): string => {
    if (price < 0.00001) return `$${price.toFixed(10)}`;
    if (price < 0.001) return `$${price.toFixed(8)}`;
    if (price < 0.01) return `$${price.toFixed(6)}`;
    if (price < 1) return `$${price.toFixed(4)}`;
    return `$${price.toFixed(2)}`;
  };

  const currentValue = holding.amount * tokenPrice;
  const percentHeld = tradeHistory.totalBought > 0 
    ? ((tradeHistory.totalBought - tradeHistory.totalSold) / tradeHistory.totalBought) * 100 
    : 100;

  return (
    <div className="border-2 border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden bg-white dark:bg-gray-800/50 transition-all">
      {/* Token Header - Always visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          {holding.logo ? (
            <img 
              src={holding.logo} 
              alt={holding.symbol}
              className="w-12 h-12 rounded-full border-2 border-black"
              onError={(e) => {
                (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${holding.symbol}&background=random`;
              }}
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center font-bold">
              {holding.symbol.slice(0, 2)}
            </div>
          )}
          <div className="text-left">
            <div className="flex items-center gap-2">
              <span className="font-black text-black dark:text-white uppercase">{holding.symbol}</span>
              {priceChange24h !== 0 && (
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                  priceChange24h >= 0 ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300' : 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300'
                }`}>
                  {priceChange24h >= 0 ? '+' : ''}{priceChange24h.toFixed(1)}%
                </span>
              )}
            </div>
            <span className="text-xs text-gray-500">{holding.name}</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <span className="font-bold text-black dark:text-white block">
              {holding.amount.toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </span>
            <span className="text-sm font-bold text-gray-600 dark:text-gray-400">
              {formatCompact(currentValue)}
            </span>
          </div>
          <div className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
            <ChevronDown size={24} className="text-gray-400" />
          </div>
        </div>
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="border-t-2 border-gray-200 dark:border-gray-700">
          {/* Live Update Indicator */}
          <div className="px-4 py-2 bg-green-50 dark:bg-green-900/20 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="font-bold">LIVE AUTO-REFRESH (10s)</span>
            </div>
            {lastUpdate && (
              <span className="text-gray-500 flex items-center gap-1">
                <Clock size={12} />
                {lastUpdate.toLocaleTimeString()}
              </span>
            )}
          </div>

          {/* Tabs */}
          <div className="flex border-b-2 border-gray-200 dark:border-gray-700">
            {(['overview', 'buys', 'sells', 'chart'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-colors ${
                  activeTab === tab 
                    ? 'bg-black text-white' 
                    : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Currency Toggle */}
          <div className="p-3 bg-gray-50 dark:bg-gray-800 flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase">Display Currency</span>
            <div className="flex gap-2">
              <button
                onClick={onToggleCurrency}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-bold transition-all ${
                  displayCurrency === 'USDC' 
                    ? 'bg-green-500 text-white' 
                    : 'bg-purple-500 text-white'
                }`}
              >
                {displayCurrency === 'USDC' ? <DollarSign size={14} /> : <span>◎</span>}
                {displayCurrency}
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-4">
            {activeTab === 'overview' && (
              <div className="space-y-4">
                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <StatBox 
                    label="Current Price" 
                    value={formatPrice(tokenPrice)}
                    highlight={isLoadingPrice}
                  />
                  <StatBox 
                    label="Market Cap" 
                    value={formatMarketCap(marketCap)}
                  />
                  <StatBox 
                    label="Avg Buy Price" 
                    value={formatPrice(tradeHistory.avgBuyPrice)}
                  />
                  <StatBox 
                    label="Holdings %" 
                    value={`${percentHeld.toFixed(1)}%`}
                    subValue={`of ${tradeHistory.totalBought.toFixed(2)} bought`}
                  />
                  <StatBox 
                    label="Current Value" 
                    value={convertValue(currentValue)}
                    highlight
                  />
                  <StatBox 
                    label="SOL Price" 
                    value={`$${solPrice.toFixed(2)}`}
                  />
                </div>

                {/* P&L Summary */}
                <div className="grid grid-cols-2 gap-3 mt-4">
                  <div className={`p-4 rounded-xl border-2 ${
                    tradeHistory.unrealizedPnl >= 0 
                      ? 'border-green-300 bg-green-50 dark:bg-green-900/20' 
                      : 'border-red-300 bg-red-50 dark:bg-red-900/20'
                  }`}>
                    <span className="text-[10px] font-bold uppercase text-gray-600 dark:text-gray-400">Unrealized P&L</span>
                    <span className={`block text-xl font-black ${
                      tradeHistory.unrealizedPnl >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {tradeHistory.unrealizedPnl >= 0 ? '+' : ''}{convertValue(tradeHistory.unrealizedPnl)}
                    </span>
                  </div>
                  <div className={`p-4 rounded-xl border-2 ${
                    tradeHistory.realizedPnl >= 0 
                      ? 'border-green-300 bg-green-50 dark:bg-green-900/20' 
                      : 'border-red-300 bg-red-50 dark:bg-red-900/20'
                  }`}>
                    <span className="text-[10px] font-bold uppercase text-gray-600 dark:text-gray-400">Realized P&L</span>
                    <span className={`block text-xl font-black ${
                      tradeHistory.realizedPnl >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {tradeHistory.realizedPnl >= 0 ? '+' : ''}{convertValue(tradeHistory.realizedPnl)}
                    </span>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-700 rounded-xl">
                  <div className="text-center">
                    <span className="text-xs text-gray-500 block">Buys</span>
                    <span className="font-black text-green-600">{tradeHistory.buys.length}</span>
                  </div>
                  <div className="text-center">
                    <span className="text-xs text-gray-500 block">Sells</span>
                    <span className="font-black text-red-600">{tradeHistory.sells.length}</span>
                  </div>
                  <div className="text-center">
                    <span className="text-xs text-gray-500 block">Total Bought</span>
                    <span className="font-black text-black dark:text-white">{tradeHistory.totalBought.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className="text-center">
                    <span className="text-xs text-gray-500 block">Total Sold</span>
                    <span className="font-black text-black dark:text-white">{tradeHistory.totalSold.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'buys' && (
              <div className="space-y-3">
                {tradeHistory.buys.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <TrendingUp className="mx-auto mb-2 opacity-30" size={32} />
                    <p className="text-sm font-medium">No buy history</p>
                  </div>
                ) : (
                  tradeHistory.buys.map((buy, i) => (
                    <div key={buy.signature} className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border-2 border-green-200 dark:border-green-800">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-green-700 dark:text-green-300 uppercase">Buy #{i + 1}</span>
                        <span className="text-xs text-gray-500">{new Date(buy.timestamp).toLocaleString()}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="bg-white/50 dark:bg-black/20 rounded-lg p-2">
                          <span className="text-gray-500 text-[10px] uppercase block">Amount</span>
                          <span className="font-bold text-black dark:text-white">{buy.amount.toLocaleString(undefined, { maximumFractionDigits: 4 })}</span>
                        </div>
                        <div className="bg-white/50 dark:bg-black/20 rounded-lg p-2">
                          <span className="text-gray-500 text-[10px] uppercase block">Price</span>
                          <span className="font-bold text-black dark:text-white">{formatPrice(buy.pricePerToken)}</span>
                        </div>
                        <div className="bg-white/50 dark:bg-black/20 rounded-lg p-2">
                          <span className="text-gray-500 text-[10px] uppercase block">Total ({displayCurrency})</span>
                          <span className="font-bold text-black dark:text-white">{convertValue(buy.totalValue)}</span>
                        </div>
                        <div className="bg-white/50 dark:bg-black/20 rounded-lg p-2">
                          <span className="text-gray-500 text-[10px] uppercase block">Market Cap</span>
                          <span className="font-bold text-black dark:text-white">{formatMarketCap(buy.marketCap || null)}</span>
                        </div>
                      </div>
                      <a 
                        href={`https://solscan.io/tx/${buy.signature}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 flex items-center gap-1 text-xs text-green-600 hover:underline"
                      >
                        View on Solscan <ExternalLink size={12} />
                      </a>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'sells' && (
              <div className="space-y-3">
                {tradeHistory.sells.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <TrendingDown className="mx-auto mb-2 opacity-30" size={32} />
                    <p className="text-sm font-medium">No sell history</p>
                  </div>
                ) : (
                  tradeHistory.sells.map((sell, i) => (
                    <div key={sell.signature} className="p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border-2 border-red-200 dark:border-red-800">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-red-700 dark:text-red-300 uppercase">Sell #{i + 1} of {tradeHistory.sells.length}</span>
                        <span className="text-xs text-gray-500">{new Date(sell.timestamp).toLocaleString()}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="bg-white/50 dark:bg-black/20 rounded-lg p-2">
                          <span className="text-gray-500 text-[10px] uppercase block">Amount Sold</span>
                          <span className="font-bold text-black dark:text-white">{sell.amount.toLocaleString(undefined, { maximumFractionDigits: 4 })}</span>
                        </div>
                        <div className="bg-white/50 dark:bg-black/20 rounded-lg p-2">
                          <span className="text-gray-500 text-[10px] uppercase block">% of Holdings</span>
                          <span className="font-bold text-red-600">{sell.percentSold.toFixed(1)}%</span>
                        </div>
                        <div className="bg-white/50 dark:bg-black/20 rounded-lg p-2">
                          <span className="text-gray-500 text-[10px] uppercase block">Sell Price</span>
                          <span className="font-bold text-black dark:text-white">{formatPrice(sell.pricePerToken)}</span>
                        </div>
                        <div className="bg-white/50 dark:bg-black/20 rounded-lg p-2">
                          <span className="text-gray-500 text-[10px] uppercase block">Value ({displayCurrency})</span>
                          <span className="font-bold text-black dark:text-white">{convertValue(sell.totalValue)}</span>
                        </div>
                      </div>
                      <a 
                        href={`https://solscan.io/tx/${sell.signature}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 flex items-center gap-1 text-xs text-red-600 hover:underline"
                      >
                        View on Solscan <ExternalLink size={12} />
                      </a>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'chart' && (
              <div className="space-y-4">
                {/* DexScreener Embed */}
                <div className="rounded-xl overflow-hidden border-2 border-black">
                  <iframe
                    src={`https://dexscreener.com/solana/${holding.mint}?embed=1&theme=dark&trades=0&info=0`}
                    className="w-full h-[400px]"
                    title={`${holding.symbol} Chart`}
                  />
                </div>
                
                {/* Chart Links */}
                <div className="grid grid-cols-3 gap-2">
                  <a
                    href={`https://dexscreener.com/solana/${holding.mint}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 p-3 bg-gray-100 dark:bg-gray-700 rounded-xl text-sm font-bold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-black dark:text-white"
                  >
                    <BarChart3 size={16} /> DexScreener
                  </a>
                  <a
                    href={`https://birdeye.so/token/${holding.mint}?chain=solana`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 p-3 bg-gray-100 dark:bg-gray-700 rounded-xl text-sm font-bold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-black dark:text-white"
                  >
                    <BarChart3 size={16} /> Birdeye
                  </a>
                  <a
                    href={`https://solscan.io/token/${holding.mint}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 p-3 bg-gray-100 dark:bg-gray-700 rounded-xl text-sm font-bold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-black dark:text-white"
                  >
                    <ExternalLink size={16} /> Solscan
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Stat Box Component
const StatBox: React.FC<{ label: string; value: string; subValue?: string; highlight?: boolean }> = ({ label, value, subValue, highlight }) => (
  <div className={`p-3 rounded-xl ${highlight ? 'bg-purple-100 dark:bg-purple-900/30' : 'bg-gray-100 dark:bg-gray-700'}`}>
    <span className="text-[10px] font-bold uppercase text-gray-500 block">{label}</span>
    <span className="font-black text-black dark:text-white">{value}</span>
    {subValue && <span className="text-[10px] text-gray-500 block">{subValue}</span>}
  </div>
);

export default TokenDetailDropdown;
