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
  try {
    // Skip database operations for local IDs
    if (gameId && gameId.startsWith('local-')) {
      console.log('Using localStorage for game state (local ID)');
      return { data: null, error: null };
    }

    // For UUIDs, try to save to database
    // First validate that gameId is a valid UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(gameId)) {
      console.error('Invalid UUID format for game_id:', gameId);
      return { data: null, error: { message: 'Invalid UUID format for game_id' } };
    }

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

    if (error) {
      console.error('Error saving game state to database:', error);
      // Also save to localStorage as backup
      try {
        localStorage.setItem('investmentOdyssey_gameState_' + userId, JSON.stringify(gameState));
      } catch (localError) {
        console.error('Error saving to localStorage:', localError);
      }
    } else {
      console.log('Game state saved to database successfully');
    }

    return { data, error };
  } catch (error) {
    console.error('Exception in saveGameState:', error);
    return { data: null, error };
  }
}

// Load game state from Supabase
async function loadGameState(gameId, userId) {
  try {
    // Skip database operations for local IDs
    if (gameId && gameId.startsWith('local-')) {
      console.log('Loading game state from localStorage (local ID)');
      try {
        const savedState = localStorage.getItem('investmentOdyssey_gameState_' + userId);
        if (savedState) {
          return { data: JSON.parse(savedState), error: null };
        }
      } catch (localError) {
        console.error('Error loading from localStorage:', localError);
      }
      return { data: null, error: null };
    }

    // For UUIDs, try to load from database
    // First validate that gameId is a valid UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(gameId)) {
      console.error('Invalid UUID format for game_id:', gameId);
      return { data: null, error: { message: 'Invalid UUID format for game_id' } };
    }

    const { data, error } = await supabaseClient
      .from('game_states')
      .select('*')
      .eq('game_id', gameId)
      .eq('user_id', userId)
      .order('round_number', { ascending: false })
      .maybeSingle();

    if (error) {
      console.error('Error loading game state from database:', error);
      // Try to load from localStorage as backup
      try {
        const savedState = localStorage.getItem('investmentOdyssey_gameState_' + userId);
        if (savedState) {
          return { data: JSON.parse(savedState), error: null };
        }
      } catch (localError) {
        console.error('Error loading from localStorage:', localError);
      }
    } else if (data) {
      console.log('Game state loaded from database successfully');
    }

    return { data, error };
  } catch (error) {
    console.error('Exception in loadGameState:', error);
    return { data: null, error };
  }
}

// Save player state to Supabase
async function savePlayerState(gameId, userId, playerState) {
  try {
    // Skip database operations for local IDs
    if (gameId && gameId.startsWith('local-')) {
      console.log('Using localStorage for player state (local ID)');
      return { data: null, error: null };
    }

    // For UUIDs, try to save to database
    // First validate that gameId is a valid UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(gameId)) {
      console.error('Invalid UUID format for game_id:', gameId);
      return { data: null, error: { message: 'Invalid UUID format for game_id' } };
    }

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

    if (error) {
      console.error('Error saving player state to database:', error);
      // Also save to localStorage as backup
      try {
        localStorage.setItem('investmentOdyssey_playerState_' + userId, JSON.stringify(playerState));
      } catch (localError) {
        console.error('Error saving to localStorage:', localError);
      }
    } else {
      console.log('Player state saved to database successfully');
    }

    return { data, error };
  } catch (error) {
    console.error('Exception in savePlayerState:', error);
    return { data: null, error };
  }
}

// Load player state from Supabase
async function loadPlayerState(gameId, userId) {
  try {
    // Skip database operations for local IDs
    if (gameId && gameId.startsWith('local-')) {
      console.log('Loading player state from localStorage (local ID)');
      try {
        const savedState = localStorage.getItem('investmentOdyssey_playerState_' + userId);
        if (savedState) {
          return { data: JSON.parse(savedState), error: null };
        }
      } catch (localError) {
        console.error('Error loading from localStorage:', localError);
      }
      return { data: null, error: null };
    }

    // For UUIDs, try to load from database
    // First validate that gameId is a valid UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(gameId)) {
      console.error('Invalid UUID format for game_id:', gameId);
      return { data: null, error: { message: 'Invalid UUID format for game_id' } };
    }

    const { data, error } = await supabaseClient
      .from('player_states')
      .select('*')
      .eq('game_id', gameId)
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error loading player state from database:', error);
      // Try to load from localStorage as backup
      try {
        const savedState = localStorage.getItem('investmentOdyssey_playerState_' + userId);
        if (savedState) {
          return { data: JSON.parse(savedState), error: null };
        }
      } catch (localError) {
        console.error('Error loading from localStorage:', localError);
      }
    } else if (data) {
      console.log('Player state loaded from database successfully');
    }

    return { data, error };
  } catch (error) {
    console.error('Exception in loadPlayerState:', error);
    return { data: null, error };
  }
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
    console.log('Submitting to leaderboard:', { userId, userName, gameMode, finalValue });

    // Always save to localStorage first as a backup
    const leaderboardEntry = {
      user_id: userId,
      user_name: userName,
      game_mode: gameMode,
      final_value: finalValue,
      created_at: new Date().toISOString()
    };

    try {
      const existingEntries = JSON.parse(localStorage.getItem('investmentOdyssey_leaderboard') || '[]');
      existingEntries.push(leaderboardEntry);
      localStorage.setItem('investmentOdyssey_leaderboard', JSON.stringify(existingEntries));
      console.log('Score saved to local leaderboard');
    } catch (localError) {
      console.error('Error saving to localStorage:', localError);
    }

    // Now try to save to the database
    // We'll simplify this by not using game_id at all
    // The leaderboard table allows game_id to be null
    let insertData = {
      user_id: userId,
      user_name: userName,
      game_mode: gameMode,
      final_value: finalValue
    };

    // Include section_id if provided
    if (sectionId) {
      insertData.section_id = sectionId;
    }

    // First check if there's an existing entry for this user and game mode
    const { data: existingEntry, error: checkError } = await supabaseClient
      .from('leaderboard')
      .select('*')
      .eq('user_id', userId)
      .eq('game_mode', gameMode)
      .maybeSingle();

    if (checkError) {
      console.error('Error checking existing leaderboard entry:', checkError);
      return { data: leaderboardEntry, error: checkError };
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

        console.log('Updated existing leaderboard entry with better score');
      } else {
        console.log('Existing score is better, not updating');
        return { data: existingEntry, error: null };
      }
    } else {
      // Insert new entry
      result = await supabaseClient
        .from('leaderboard')
        .insert(insertData)
        .select();

      console.log('Inserted new leaderboard entry');
    }

    if (result.error) {
      console.error('Error saving to leaderboard:', result.error);
      return { data: leaderboardEntry, error: result.error };
    }

    console.log('Leaderboard entry saved to database successfully');
    return result;
  } catch (error) {
    console.error('Error submitting to leaderboard:', error);
    return { data: leaderboardEntry, error };
  }
}

// Get leaderboard entries
async function getLeaderboard(gameMode = null, sectionId = null, limit = 20) {
  try {
    // First try to get online entries
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

    // Get local entries
    let localEntries = [];
    try {
      localEntries = JSON.parse(localStorage.getItem('investmentOdyssey_leaderboard') || '[]');

      // Filter by game mode if specified
      if (gameMode) {
        localEntries = localEntries.filter(entry => entry.game_mode === gameMode);
      }
    } catch (localError) {
      console.error('Error loading local leaderboard entries:', localError);
    }

    // If we have an error from the database or no data, just use local entries
    if (error || !data || data.length === 0) {
      if (error) {
        console.error('Error fetching leaderboard from database:', error);
      }

      // Sort by final value
      localEntries.sort((a, b) => b.final_value - a.final_value);

      // Limit entries
      if (localEntries.length > limit) {
        localEntries = localEntries.slice(0, limit);
      }

      console.log('Using local leaderboard entries only');
      return { data: localEntries, error: null };
    }

    // If we have both online and local entries, merge them
    if (localEntries.length > 0) {
      // Merge with online data
      const mergedEntries = [...data, ...localEntries];

      // Sort by final value
      mergedEntries.sort((a, b) => b.final_value - a.final_value);

      // Limit entries
      if (mergedEntries.length > limit) {
        const limitedEntries = mergedEntries.slice(0, limit);
        console.log('Using merged leaderboard entries (online + local)');
        return { data: limitedEntries, error: null };
      }

      console.log('Using merged leaderboard entries (online + local)');
      return { data: mergedEntries, error: null };
    }

    // If we only have online entries, return those
    console.log('Using online leaderboard entries only');
    return { data, error: null };
  } catch (error) {
    console.error('Exception in getLeaderboard:', error);

    // Try to return local entries as a fallback
    try {
      let localEntries = JSON.parse(localStorage.getItem('investmentOdyssey_leaderboard') || '[]');

      // Filter by game mode if specified
      if (gameMode) {
        localEntries = localEntries.filter(entry => entry.game_mode === gameMode);
      }

      // Sort by final value
      localEntries.sort((a, b) => b.final_value - a.final_value);

      // Limit entries
      if (localEntries.length > limit) {
        localEntries = localEntries.slice(0, limit);
      }

      console.log('Using local leaderboard entries as fallback after error');
      return { data: localEntries, error: null };
    } catch (localError) {
      console.error('Error loading local leaderboard entries as fallback:', localError);
      return { data: [], error };
    }
  }
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

// Get or create a shared single player game session
// This is a simplified version that doesn't try to find or create a shared session
// Instead, it just returns a local ID for single player games
async function getSharedSinglePlayerSession() {
  // We're not going to try to use a shared session anymore
  // Just return a local ID
  const localId = 'local-' + Date.now();
  console.log('Using local ID for single player game:', localId);
  return { data: { id: localId }, error: null };
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
  getSharedSinglePlayerSession,
  submitToLeaderboard,
  getLeaderboard,
  subscribeToGameSession
};
