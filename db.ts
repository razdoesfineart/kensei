import { supabase } from './supabase';

export async function signUp(email, password) {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
  return data;
}
export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}
export async function resetPassword(email) {
  const { error } = await supabase.auth.resetPasswordForEmail(email);
  if (error) throw error;
}
export async function getSession() {
  const { data } = await supabase.auth.getSession();
  return data.session;
}
export function onAuthChange(callback) {
  return supabase.auth.onAuthStateChange(callback);
}
export async function fetchTrades(userId) {
  const { data, error } = await supabase.from('trades').select('*').eq('user_id', userId).order('timestamp', { ascending: true });
  if (error) throw error;
  return (data || []).map(r => ({
    id: r.id, signature: r.signature, tokenName: r.token_name, tokenMint: r.token_mint, tokenLogo: r.token_logo,
    tradeType: r.trade_type, entryPrice: Number(r.entry_price), exitPrice: Number(r.exit_price),
    positionSize: Number(r.position_size), tradeReason: r.trade_reason, outcome: r.outcome, emotion: r.emotion,
    timestamp: r.timestamp, passedChecklist: r.passed_checklist, pnl: Number(r.pnl), pnlPercent: Number(r.pnl_percent),
    isFromChain: r.is_from_chain, amount: r.amount ? Number(r.amount) : undefined,
    currentPrice: r.current_price ? Number(r.current_price) : undefined, logCompleted: r.log_completed,
  }));
}
export async function saveTrade(userId, trade) {
  const { error } = await supabase.from('trades').upsert({
    id: trade.id, user_id: userId, signature: trade.signature || null, token_name: trade.tokenName,
    token_mint: trade.tokenMint || null, token_logo: trade.tokenLogo || null, trade_type: trade.tradeType,
    entry_price: trade.entryPrice, exit_price: trade.exitPrice, position_size: trade.positionSize,
    trade_reason: trade.tradeReason, outcome: trade.outcome, emotion: trade.emotion, timestamp: trade.timestamp,
    passed_checklist: trade.passedChecklist, pnl: trade.pnl, pnl_percent: trade.pnlPercent,
    is_from_chain: trade.isFromChain || false, amount: trade.amount || null,
    current_price: trade.currentPrice || null, log_completed: trade.logCompleted || false,
  });
  if (error) throw error;
}
export async function deleteAllTrades(userId) {
  await supabase.from('trades').delete().eq('user_id', userId);
}
export async function fetchUserState(userId) {
  const { data, error } = await supabase.from('user_state').select('*').eq('user_id', userId).single();
  if (error && error.code !== 'PGRST116') throw error;
  return data;
}
export async function saveUserState(userId, state) {
  const update = { updated_at: new Date().toISOString() };
  if (state.streak !== undefined) update.streak = state.streak;
  if (state.consecutiveLosses !== undefined) update.consecutive_losses = state.consecutiveLosses;
  if (state.lastRealityCheck !== undefined) update.last_reality_check = state.lastRealityCheck;
  if (state.lastPolledSignature !== undefined) update.last_polled_signature = state.lastPolledSignature;
  if (state.settings !== undefined) update.settings = state.settings;
  if (state.cooldown !== undefined) update.cooldown = state.cooldown;
  if (state.escalatingCooldown !== undefined) update.escalating_cooldown = state.escalatingCooldown;
  if (state.trackedWallet !== undefined) update.tracked_wallet = state.trackedWallet;
  if (state.holdings !== undefined) update.holdings = state.holdings;
  if (state.pendingTrades !== undefined) update.pending_trades = state.pendingTrades;
  await supabase.from('user_state').update(update).eq('user_id', userId);
}
export async function fetchAchievements(userId) {
  const { data, error } = await supabase.from('achievements').select('*').eq('user_id', userId);
  if (error) throw error;
  return data || [];
}
export async function saveAchievements(userId, achievements) {
  const rows = achievements.map(a => ({ id: a.id, user_id: userId, unlocked_at: a.unlockedAt || null, progress: a.progress }));
  await supabase.from('achievements').upsert(rows, { onConflict: 'user_id,id' });
}
export async function clearAllUserData(userId) {
  await deleteAllTrades(userId);
  await supabase.from('achievements').delete().eq('user_id', userId);
  await supabase.from('user_state').update({
    streak: 0, consecutive_losses: 0, last_reality_check: null, last_polled_signature: null,
    cooldown: { isActive: false, endsAt: null, reason: '' },
    escalating_cooldown: { missedLogs: 0, currentPenaltyMinutes: 0, lastMissedAt: null },
    tracked_wallet: null, holdings: [], pending_trades: [],
  }).eq('user_id', userId);
}
