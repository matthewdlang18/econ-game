// Investment Odyssey - Supabase Integration

// Initialize Supabase client
let supabase;

// Check if Supabase is already initialized (from parent window)
if (window.supabase && typeof window.supabase.from === 'function') {
  console.log('Using existing Supabase client');
  supabase = window.supabase;
} else if (window.SUPABASE_URL && window.SUPABASE_ANON_KEY) {
  console.log('Creating new Supabase client');
  supabase = window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);
} else {
  console.error('Supabase configuration not found');
}

// Create a new game session
async function createGameSession(sectionId, maxRounds = 20) {
  const { data, error } = await supabase
    .from('game_sessions')
    .insert({
      section_id: sectionId,
      max_rounds: maxRounds,
      current_round: 0,
      active: true
    })
    .select()
    .single();

  return { data, error };
}

// Get active game session for a section
async function getActiveGameSession(sectionId) {
  const { data, error } = await supabase
    .from('game_sessions')
    .select('*')
    .eq('section_id', sectionId)
    .eq('active', true)
    .order('created_at', { ascending: false })
    .maybeSingle();

  return { data, error };
}

// Save game state to Supabase
async function saveGameState(gameId, userId, gameState) {
  const { data, error } = await supabase
    .from('game_states')
    .upsert({
      game_id: gameId,
      user_id: userId,
      round_number: gameState.roundNumber,
      asset_prices: gameState.assetPrices,
      price_history: gameState.priceHistory,
      cpi: gameState.cpi,
      cpi_history: gameState.cpiHistory,
      last_bitcoin_crash_round: gameState.lastBitcoinCrashRound,
      bitcoin_shock_range: gameState.bitcoinShockRange
    })
    .select();

  return { data, error };
}

// Load game state from Supabase
async function loadGameState(gameId, userId) {
  const { data, error } = await supabase
    .from('game_states')
    .select('*')
    .eq('game_id', gameId)
    .eq('user_id', userId)
    .order('round_number', { ascending: false })
    .maybeSingle();

  return { data, error };
}

// Save player state to Supabase
async function savePlayerState(gameId, userId, playerState) {
  const { data, error } = await supabase
    .from('player_states')
    .upsert({
      game_id: gameId,
      user_id: userId,
      cash: playerState.cash,
      portfolio: playerState.portfolio,
      trade_history: playerState.tradeHistory,
      portfolio_value_history: playerState.portfolioValueHistory,
      total_value: playerState.totalValue
    })
    .select();

  return { data, error };
}

// Load player state from Supabase
async function loadPlayerState(gameId, userId) {
  const { data, error } = await supabase
    .from('player_states')
    .select('*')
    .eq('game_id', gameId)
    .eq('user_id', userId)
    .maybeSingle();

  return { data, error };
}

// Update game session round
async function updateGameSessionRound(gameId, roundNumber) {
  const { data, error } = await supabase
    .from('game_sessions')
    .update({ current_round: roundNumber, updated_at: new Date().toISOString() })
    .eq('id', gameId)
    .select()
    .single();

  return { data, error };
}

// Submit score to leaderboard
async function submitToLeaderboard(userId, userName, gameMode, gameId, sectionId, finalValue) {
  const { data, error } = await supabase
    .from('leaderboard')
    .upsert({
      user_id: userId,
      user_name: userName,
      game_mode: gameMode,
      game_id: gameId,
      section_id: sectionId,
      final_value: finalValue
    })
    .select();

  return { data, error };
}

// Get leaderboard entries
async function getLeaderboard(gameMode = null, sectionId = null, limit = 10) {
  let query = supabase
    .from('leaderboard')
    .select('*')
    .order('final_value', { ascending: false })
    .limit(limit);

  if (gameMode) {
    query = query.eq('game_mode', gameMode);
  }

  if (sectionId) {
    query = query.eq('section_id', sectionId);
  }

  const { data, error } = await query;

  return { data, error };
}

// Subscribe to game session updates
function subscribeToGameSession(gameId, callback) {
  return supabase
    .channel(`game_session:${gameId}`)
    .on('postgres_changes', {
      event: 'UPDATE',
      schema: 'public',
      table: 'game_sessions',
      filter: `id=eq.${gameId}`
    }, callback)
    .subscribe();
}

// Export functions
window.SupabaseIntegration = {
  createGameSession,
  getActiveGameSession,
  saveGameState,
  loadGameState,
  savePlayerState,
  loadPlayerState,
  updateGameSessionRound,
  submitToLeaderboard,
  getLeaderboard,
  subscribeToGameSession
};
