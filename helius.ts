// Helius API Service for Solana Wallet Tracking
import { DetectedTrade, TokenInfo, WalletHolding } from './types';

const HELIUS_API_KEY = '1cc921d2-76b3-4761-aad7-d89a5a5bd011';
const HELIUS_RPC_URL = `https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`;
const HELIUS_API_URL = `https://api.helius.xyz/v0`;

// Known token mints for common tokens
const KNOWN_TOKENS: Record<string, { symbol: string; name: string; logo: string; decimals: number }> = {
  'So11111111111111111111111111111111111111112': {
    symbol: 'SOL',
    name: 'Solana',
    logo: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png',
    decimals: 9
  },
  'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v': {
    symbol: 'USDC',
    name: 'USD Coin',
    logo: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png',
    decimals: 6
  },
  'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB': {
    symbol: 'USDT',
    name: 'Tether USD',
    logo: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB/logo.svg',
    decimals: 6
  }
};

// Stablecoins to identify as "cash" side of trades
const STABLECOINS = ['USDC', 'USDT', 'USDH', 'DAI', 'BUSD', 'UST'];
const SOL_MINT = 'So11111111111111111111111111111111111111112';

export interface HeliusTransaction {
  signature: string;
  timestamp: number;
  type: string;
  source: string;
  fee: number;
  feePayer: string;
  description: string;
  tokenTransfers?: {
    fromUserAccount: string;
    toUserAccount: string;
    fromTokenAccount: string;
    toTokenAccount: string;
    tokenAmount: number;
    mint: string;
    tokenStandard: string;
  }[];
  nativeTransfers?: {
    fromUserAccount: string;
    toUserAccount: string;
    amount: number;
  }[];
  events?: {
    swap?: {
      nativeInput?: { account: string; amount: string };
      nativeOutput?: { account: string; amount: string };
      tokenInputs?: { userAccount: string; tokenAccount: string; mint: string; rawTokenAmount: { tokenAmount: string; decimals: number } }[];
      tokenOutputs?: { userAccount: string; tokenAccount: string; mint: string; rawTokenAmount: { tokenAmount: string; decimals: number } }[];
    };
  };
}

// Fetch recent transactions for a wallet
export async function fetchWalletTransactions(
  walletAddress: string,
  beforeSignature?: string,
  limit: number = 20
): Promise<HeliusTransaction[]> {
  try {
    let url = `${HELIUS_API_URL}/addresses/${walletAddress}/transactions?api-key=${HELIUS_API_KEY}&limit=${limit}`;
    if (beforeSignature) {
      url += `&before=${beforeSignature}`;
    }

    console.log('[Kensei] Fetching transactions from Helius...');
    const response = await fetch(url);
    if (!response.ok) {
      const text = await response.text();
      console.error('[Kensei] Helius API error:', response.status, text);
      throw new Error(`Helius API error: ${response.status}`);
    }

    const transactions = await response.json();
    console.log('[Kensei] Helius returned', transactions.length, 'transactions');
    return transactions;
  } catch (error) {
    console.error('[Kensei] Error fetching wallet transactions:', error);
    return [];
  }
}

// Get token metadata from Helius
export async function fetchTokenMetadata(mintAddress: string): Promise<TokenInfo | null> {
  // Check cache first
  if (KNOWN_TOKENS[mintAddress]) {
    const known = KNOWN_TOKENS[mintAddress];
    return {
      mint: mintAddress,
      ...known
    };
  }

  try {
    const response = await fetch(`${HELIUS_API_URL}/token-metadata?api-key=${HELIUS_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mintAccounts: [mintAddress] })
    });

    if (!response.ok) {
      throw new Error(`Token metadata error: ${response.status}`);
    }

    const data = await response.json();
    if (data && data.length > 0) {
      const token = data[0];
      return {
        mint: mintAddress,
        symbol: token.onChainMetadata?.metadata?.symbol || token.legacyMetadata?.symbol || 'UNKNOWN',
        name: token.onChainMetadata?.metadata?.name || token.legacyMetadata?.name || 'Unknown Token',
        logo: token.onChainMetadata?.metadata?.uri || token.legacyMetadata?.logoURI || '',
        decimals: token.onChainMetadata?.metadata?.decimals || 9
      };
    }
  } catch (error) {
    console.error('Error fetching token metadata:', error);
  }

  return null;
}

// Parse swap transactions to detect trades
export async function parseSwapTransaction(
  tx: HeliusTransaction,
  walletAddress: string
): Promise<DetectedTrade | null> {
  console.log('[Kensei] Parsing tx:', tx.signature?.slice(0, 12), 'Type:', tx.type, 'Source:', tx.source);
  console.log('[Kensei]   tokenTransfers:', tx.tokenTransfers?.length || 0, 'nativeTransfers:', tx.nativeTransfers?.length || 0);
  console.log('[Kensei]   hasSwapEvent:', !!tx.events?.swap);
  
  // METHOD 1: Handle SWAP type with events (Jupiter, Raydium, etc)
  if (tx.events?.swap) {
    const swap = tx.events.swap;
    let tokenIn: { mint: string; amount: number } | null = null;
    let tokenOut: { mint: string; amount: number } | null = null;

    // Parse token inputs (what user sent)
    if (swap.tokenInputs && swap.tokenInputs.length > 0) {
      const input = swap.tokenInputs[0];
      tokenIn = {
        mint: input.mint,
        amount: parseInt(input.rawTokenAmount.tokenAmount) / Math.pow(10, input.rawTokenAmount.decimals)
      };
    } else if (swap.nativeInput) {
      tokenIn = {
        mint: SOL_MINT,
        amount: parseInt(swap.nativeInput.amount) / 1e9
      };
    }

    // Parse token outputs (what user received)
    if (swap.tokenOutputs && swap.tokenOutputs.length > 0) {
      const output = swap.tokenOutputs[0];
      tokenOut = {
        mint: output.mint,
        amount: parseInt(output.rawTokenAmount.tokenAmount) / Math.pow(10, output.rawTokenAmount.decimals)
      };
    } else if (swap.nativeOutput) {
      tokenOut = {
        mint: SOL_MINT,
        amount: parseInt(swap.nativeOutput.amount) / 1e9
      };
    }

    if (tokenIn && tokenOut) {
      console.log('[Kensei]   Swap event parsed: in=', tokenIn.mint.slice(0,8), tokenIn.amount, 'out=', tokenOut.mint.slice(0,8), tokenOut.amount);
      return await buildTradeFromTokens(tx, tokenIn, tokenOut);
    }
  }

  // METHOD 2: Token transfers that look like swaps (bidirectional token movement)
  if (tx.tokenTransfers && tx.tokenTransfers.length >= 1) {
    const inTransfers = tx.tokenTransfers.filter(t => t.toUserAccount === walletAddress);
    const outTransfers = tx.tokenTransfers.filter(t => t.fromUserAccount === walletAddress);
    
    console.log('[Kensei]   Token transfers - in:', inTransfers.length, 'out:', outTransfers.length);
    
    // Two-way token transfer = swap
    if (inTransfers.length > 0 && outTransfers.length > 0) {
      const tokenIn = {
        mint: outTransfers[0].mint,
        amount: outTransfers[0].tokenAmount
      };
      const tokenOut = {
        mint: inTransfers[0].mint,
        amount: inTransfers[0].tokenAmount
      };
      console.log('[Kensei]   Bidirectional token swap detected');
      return await buildTradeFromTokens(tx, tokenIn, tokenOut);
    }
    
    // Received tokens + sent SOL = BUY
    if (inTransfers.length > 0 && tx.nativeTransfers) {
      const solSent = tx.nativeTransfers
        .filter(t => t.fromUserAccount === walletAddress && t.toUserAccount !== walletAddress)
        .reduce((sum, t) => sum + t.amount, 0);
      
      if (solSent > 10000) { // More than dust (0.00001 SOL)
        const tokenIn = { mint: SOL_MINT, amount: solSent / 1e9 };
        const tokenOut = { mint: inTransfers[0].mint, amount: inTransfers[0].tokenAmount };
        console.log('[Kensei]   SOL->Token buy detected. SOL sent:', solSent / 1e9);
        return await buildTradeFromTokens(tx, tokenIn, tokenOut);
      }
    }
    
    // Sent tokens + received SOL = SELL
    if (outTransfers.length > 0 && tx.nativeTransfers) {
      const solReceived = tx.nativeTransfers
        .filter(t => t.toUserAccount === walletAddress && t.fromUserAccount !== walletAddress)
        .reduce((sum, t) => sum + t.amount, 0);
      
      if (solReceived > 10000) { // More than dust
        const tokenIn = { mint: outTransfers[0].mint, amount: outTransfers[0].tokenAmount };
        const tokenOut = { mint: SOL_MINT, amount: solReceived / 1e9 };
        console.log('[Kensei]   Token->SOL sell detected. SOL received:', solReceived / 1e9);
        return await buildTradeFromTokens(tx, tokenIn, tokenOut);
      }
    }
  }

  // METHOD 3: Check for common swap program interactions even without explicit events
  const swapTypes = ['SWAP', 'TOKEN_MINT', 'BURN', 'COMPRESSED_NFT_MINT'];
  const swapSources = ['JUPITER', 'RAYDIUM', 'ORCA', 'METEORA', 'PUMP_FUN', 'PHOENIX', 'LIFINITY', 'MARINADE', 'WHIRLPOOL'];
  
  if (swapTypes.includes(tx.type) || swapSources.includes(tx.source)) {
    // Try to reconstruct from token + native transfers
    if (tx.tokenTransfers && tx.tokenTransfers.length > 0 && tx.nativeTransfers && tx.nativeTransfers.length > 0) {
      const tokensIn = tx.tokenTransfers.filter(t => t.toUserAccount === walletAddress);
      const tokensOut = tx.tokenTransfers.filter(t => t.fromUserAccount === walletAddress);
      const solIn = tx.nativeTransfers.filter(t => t.toUserAccount === walletAddress).reduce((s, t) => s + t.amount, 0);
      const solOut = tx.nativeTransfers.filter(t => t.fromUserAccount === walletAddress).reduce((s, t) => s + t.amount, 0);
      
      // Net SOL movement (exclude fee)
      const netSol = solIn - solOut;
      
      if (tokensIn.length > 0 && netSol < -10000) {
        // Spent SOL, got tokens = BUY
        const tokenIn = { mint: SOL_MINT, amount: Math.abs(netSol) / 1e9 };
        const tokenOut = { mint: tokensIn[0].mint, amount: tokensIn[0].tokenAmount };
        console.log('[Kensei]   Reconstructed BUY from swap source:', tx.source);
        return await buildTradeFromTokens(tx, tokenIn, tokenOut);
      }
      
      if (tokensOut.length > 0 && netSol > 10000) {
        // Got SOL, sent tokens = SELL
        const tokenIn = { mint: tokensOut[0].mint, amount: tokensOut[0].tokenAmount };
        const tokenOut = { mint: SOL_MINT, amount: netSol / 1e9 };
        console.log('[Kensei]   Reconstructed SELL from swap source:', tx.source);
        return await buildTradeFromTokens(tx, tokenIn, tokenOut);
      }
    }
  }

  console.log('[Kensei]   Could not parse transaction as trade');
  return null;
}

// Helper to build trade from token in/out
async function buildTradeFromTokens(
  tx: HeliusTransaction,
  tokenIn: { mint: string; amount: number },
  tokenOut: { mint: string; amount: number }
): Promise<DetectedTrade | null> {
  console.log('[Kensei] buildTradeFromTokens - in:', tokenIn.mint.slice(0, 8), tokenIn.amount, 'out:', tokenOut.mint.slice(0, 8), tokenOut.amount);
  
  const tokenInInfo = await fetchTokenMetadata(tokenIn.mint);
  const tokenOutInfo = await fetchTokenMetadata(tokenOut.mint);

  if (!tokenInInfo || !tokenOutInfo) {
    console.log('[Kensei] Could not fetch token metadata. inInfo:', !!tokenInInfo, 'outInfo:', !!tokenOutInfo);
    return null;
  }

  const isBuy = tokenInInfo.symbol === 'SOL' || STABLECOINS.includes(tokenInInfo.symbol);
  const isSell = tokenOutInfo.symbol === 'SOL' || STABLECOINS.includes(tokenOutInfo.symbol);

  let tradedToken: TokenInfo;
  let tradedAmount: number;
  let cashAmount: number;
  let tradeType: 'BUY' | 'SELL';

  if (isBuy && !isSell) {
    tradedToken = tokenOutInfo;
    tradedAmount = tokenOut.amount;
    cashAmount = tokenIn.amount;
    tradeType = 'BUY';
  } else if (isSell && !isBuy) {
    tradedToken = tokenInInfo;
    tradedAmount = tokenIn.amount;
    cashAmount = tokenOut.amount;
    tradeType = 'SELL';
  } else {
    tradedToken = tokenOutInfo;
    tradedAmount = tokenOut.amount;
    cashAmount = tokenIn.amount;
    tradeType = 'BUY';
  }

  // Get cash value in USD
  let totalValueUsd = cashAmount;
  if (tokenInInfo.symbol === 'SOL' || tokenOutInfo.symbol === 'SOL') {
    const solPrice = await getTokenPrice(SOL_MINT);
    if (solPrice) {
      totalValueUsd = cashAmount * solPrice;
    }
  }

  const pricePerToken = tradedAmount > 0 ? totalValueUsd / tradedAmount : 0;

  let tokenLogo = tradedToken.logo;
  if (tokenLogo && tokenLogo.includes('arweave')) {
    try {
      const metaResponse = await fetch(tokenLogo);
      const metadata = await metaResponse.json();
      if (metadata.image) tokenLogo = metadata.image;
    } catch { /* use default */ }
  }

  const trade: DetectedTrade = {
    signature: tx.signature,
    type: tradeType,
    tokenMint: tradedToken.mint,
    tokenSymbol: tradedToken.symbol,
    tokenName: tradedToken.name,
    tokenLogo: tokenLogo || `https://ui-avatars.com/api/?name=${tradedToken.symbol}&background=random`,
    amount: tradedAmount,
    pricePerToken,
    totalValue: totalValueUsd,
    timestamp: tx.timestamp * 1000
  };

  console.log('Detected trade:', trade);
  return trade;
}

// Fetch all token balances for a wallet
export async function fetchWalletHoldings(walletAddress: string): Promise<WalletHolding[]> {
  try {
    // Use Helius DAS API for token holdings
    const response = await fetch(HELIUS_RPC_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 'holdings',
        method: 'getAssetsByOwner',
        params: {
          ownerAddress: walletAddress,
          page: 1,
          limit: 100,
          displayOptions: {
            showFungible: true,
            showNativeBalance: true
          }
        }
      })
    });

    const data = await response.json();
    const holdings: WalletHolding[] = [];

    if (data.result?.items) {
      for (const item of data.result.items) {
        if (item.interface === 'FungibleToken' || item.interface === 'FungibleAsset') {
          const balance = item.token_info?.balance || 0;
          const decimals = item.token_info?.decimals || 9;
          const amount = balance / Math.pow(10, decimals);
          
          if (amount > 0) {
            holdings.push({
              mint: item.id,
              symbol: item.token_info?.symbol || item.content?.metadata?.symbol || 'UNKNOWN',
              name: item.content?.metadata?.name || 'Unknown Token',
              logo: item.content?.links?.image || item.content?.files?.[0]?.uri || '',
              amount,
              value: 0, // Would need price API
              currentPrice: item.token_info?.price_info?.price_per_token || 0,
              pnl: 0,
              pnlPercent: 0
            });
          }
        }
      }
    }

    // Add native SOL balance
    if (data.result?.nativeBalance) {
      const solAmount = data.result.nativeBalance.lamports / 1e9;
      if (solAmount > 0) {
        holdings.unshift({
          mint: SOL_MINT,
          symbol: 'SOL',
          name: 'Solana',
          logo: KNOWN_TOKENS[SOL_MINT].logo,
          amount: solAmount,
          value: 0,
          currentPrice: data.result.nativeBalance.price_per_sol || 0,
          pnl: 0,
          pnlPercent: 0
        });
      }
    }

    return holdings;
  } catch (error) {
    console.error('Error fetching wallet holdings:', error);
    return [];
  }
}

// Poll for new transactions since last check
export async function pollNewTransactions(
  walletAddress: string,
  lastSignature: string | null,
  onNewTrade: (trade: DetectedTrade) => void
): Promise<string | null> {
  try {
    console.log('[Kensei] pollNewTransactions called. wallet:', walletAddress.slice(0, 8), 'lastSig:', lastSignature?.slice(0, 10) || 'null');
    
    const transactions = await fetchWalletTransactions(walletAddress, undefined, 15);
    
    console.log('[Kensei] Fetched', transactions.length, 'transactions');
    
    if (transactions.length === 0) {
      return lastSignature;
    }

    // Log what we got
    transactions.slice(0, 5).forEach((tx, i) => {
      console.log(`[Kensei]   tx[${i}]: ${tx.signature?.slice(0, 12)} type=${tx.type} source=${tx.source} time=${new Date(tx.timestamp * 1000).toLocaleTimeString()}`);
    });

    // Find new transactions (ones we haven't seen yet)
    const newTransactions: HeliusTransaction[] = [];

    if (!lastSignature) {
      // First poll - only take the most recent to establish baseline
      // Don't process old trades as new
      console.log('[Kensei] First poll - establishing baseline signature');
      return transactions[0]?.signature || null;
    }

    for (const tx of transactions) {
      if (tx.signature === lastSignature) {
        break; // Found our last known - everything before this is new
      }
      newTransactions.push(tx);
    }

    console.log('[Kensei] Found', newTransactions.length, 'new transactions since last poll');

    // Parse new transactions for trades (process oldest first)
    for (const tx of newTransactions.reverse()) {
      const trade = await parseSwapTransaction(tx, walletAddress);
      if (trade) {
        console.log('[Kensei] ✅ TRADE DETECTED:', trade.type, trade.tokenSymbol, 'value:', trade.totalValue.toFixed(2));
        onNewTrade(trade);
      }
    }

    // Return the newest signature
    return transactions[0]?.signature || lastSignature;
  } catch (error) {
    console.error('[Kensei] Error polling transactions:', error);
    return lastSignature;
  }
}

// Validate a Solana wallet address
export function isValidSolanaAddress(address: string): boolean {
  // Basic validation: 32-44 characters, base58
  const base58Regex = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
  return base58Regex.test(address);
}

// Get price for a token (simplified - would need price API for real data)
export async function getTokenPrice(mintAddress: string): Promise<number | null> {
  try {
    // Try Jupiter Price API (free)
    const response = await fetch(`https://price.jup.ag/v4/price?ids=${mintAddress}`);
    const data = await response.json();
    return data.data?.[mintAddress]?.price || null;
  } catch {
    return null;
  }
}

// Format wallet address for display
export function formatWalletAddress(address: string): string {
  if (!address || address.length < 10) return address;
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
}
