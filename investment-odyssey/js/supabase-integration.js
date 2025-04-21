// Investment Odyssey - Supabase Integration

// Always use the global Supabase client
// This ensures we're using the same client throughout the application
let supabaseClient;

// Check if we have a working Supabase client
if (window.supabase && typeof window.supabase.from === 'function') {
  console.log('Using global Supabase client in supabase-integration.js');
  supabaseClient = window.supabase;

  // Initialize database tables if needed
  initializeDatabase().catch(error => {
    console.error('Error initializing database:', error);
  });
} else {
  console.error('No working Supabase client available in supabase-integration.js');
  // Create a dummy client to prevent errors
  supabaseClient = {
    from: () => ({
      select: () => ({
        eq: () => ({
          eq: () => ({
            single: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
            maybeSingle: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } })
          }),
          single: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
          maybeSingle: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } })
        }),
        order: () => ({
          limit: () => Promise.resolve({ data: [], error: null })
        })
      }),
      insert: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
      update: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
      upsert: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } })
    }),
    channel: () => ({
      on: () => ({
        subscribe: () => ({})
      })
    }),
    rpc: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } })
  };
}

// Check if database tables exist
async function initializeDatabase() {
  try {
    console.log('Checking if game tables exist...');

    // Check if tables exist by querying them
    const tables = ['game_sessions', 'game_states', 'player_states', 'leaderboard'];
    let allTablesExist = true;

    for (const table of tables) {
      try {
        const { error } = await supabaseClient.from(table).select('count').limit(1);
        if (error) {
          console.error(`Error checking ${table} table:`, error);
          allTablesExist = false;
        } else {
          console.log(`${table} table exists`);
        }
      } catch (error) {
        console.error(`Error checking ${table} table:`, error);
        allTablesExist = false;
      }
    }

    if (allTablesExist) {
      console.log('All required tables exist');
    } else {
      console.warn('Some tables may be missing. The game will use local storage as fallback.');
    }

    console.log('Database initialization complete');
  } catch (error) {
    console.error('Error initializing database:', error);
  }
}

// No need for table creation functions as tables already exist in the database

// Create a new game session
async function createGameSession(sectionId, maxRounds = 20) {
  try {
    console.log('Creating new game session for section:', sectionId);

    // First check if there's already an active session for this section
    const { data: existingSession, error: checkError } = await supabaseClient
      .from('game_sessions')
      .select('*')
      .eq('section_id', sectionId)
      .eq('active', true)
      .maybeSingle();

    if (checkError) {
      console.error('Error checking existing game sessions:', checkError);
      throw checkError;
    }

    // If there's an active session, deactivate it
    if (existingSession) {
      console.log('Found existing active session, deactivating:', existingSession.id);
      await supabaseClient
        .from('game_sessions')
        .update({ active: false })
        .eq('id', existingSession.id);
    }

    // Create new session
    const { data, error } = await supabaseClient
      .from('game_sessions')
      .insert({
        section_id: sectionId,
        max_rounds: maxRounds,
        current_round: 0,
        active: true
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating game session:', error);
      throw error;
    }

    console.log('Created new game session:', data.id);
    return { data, error: null };
  } catch (error) {
    console.error('Error in createGameSession:', error);
    return { data: null, error };
  }
}

// Get active game session for a section
async function getActiveGameSession(sectionId) {
  const { data, error } = await supabaseClient
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
  const { data, error } = await supabaseClient
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
  const { data, error } = await supabaseClient
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
  const { data, error } = await supabaseClient
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
  const { data, error } = await supabaseClient
    .from('player_states')
    .select('*')
    .eq('game_id', gameId)
    .eq('user_id', userId)
    .maybeSingle();

  return { data, error };
}

// Update game session round
async function updateGameSessionRound(gameId, roundNumber) {
  const { data, error } = await supabaseClient
    .from('game_sessions')
    .update({ current_round: roundNumber, updated_at: new Date().toISOString() })
    .eq('id', gameId)
    .select()
    .single();

  return { data, error };
}

// Submit score to leaderboard
async function submitToLeaderboard(userId, userName, gameMode, gameId, sectionId, finalValue) {
  try {
    console.log('Submitting to leaderboard:', { userId, userName, gameMode, gameId, sectionId, finalValue });

    // Check if there's an existing entry
    const { data: existingEntry, error: checkError } = await supabaseClient
      .from('leaderboard')
      .select('*')
      .eq('user_id', userId)
      .eq('game_id', gameId)
      .maybeSingle();

    if (checkError) {
      console.error('Error checking existing leaderboard entry:', checkError);
      throw checkError;
    }

    let result;

    if (existingEntry) {
      // Update existing entry if new score is better
      if (finalValue > existingEntry.final_value) {
        result = await supabaseClient
          .from('leaderboard')
          .update({
            final_value: finalValue,
            user_name: userName // Update name in case it changed
          })
          .eq('id', existingEntry.id)
          .select();
      } else {
        console.log('Existing score is better, not updating');
        return { data: existingEntry, error: null };
      }
    } else {
      // Insert new entry
      result = await supabaseClient
        .from('leaderboard')
        .insert({
          user_id: userId,
          user_name: userName,
          game_mode: gameMode,
          game_id: gameId,
          section_id: sectionId,
          final_value: finalValue
        })
        .select();
    }

    return result;
  } catch (error) {
    console.error('Error submitting to leaderboard:', error);
    return { data: null, error };
  }
}

// Get leaderboard entries
async function getLeaderboard(gameMode = null, sectionId = null, limit = 10) {
  let query = supabaseClient
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
  return supabaseClient
    .channel(`game_session:${gameId}`)
    .on('postgres_changes', {
      event: 'UPDATE',
      schema: 'public',
      table: 'game_sessions',
      filter: `id=eq.${gameId}`
    }, callback)
    .subscribe();
}

// Update game session active status
async function updateGameSessionActive(gameId, active = false) {
  const { data, error } = await supabaseClient
    .from('game_sessions')
    .update({ active: active, updated_at: new Date().toISOString() })
    .eq('id', gameId)
    .select()
    .single();

  return { data, error };
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
  updateGameSessionActive,
  submitToLeaderboard,
  getLeaderboard,
  subscribeToGameSession
};
