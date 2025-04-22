// Investment Odyssey Supabase Integration

// Use the same Supabase credentials as the main application
const SUPABASE_URL = 'https://bvvkevmqnnlecghyraao.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ2dmtldm1xbm5sZWNnaHlyYWFvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ5MDAzNDEsImV4cCI6MjA2MDQ3NjM0MX0.UY_H91jIbbZWq6A-l7XbdyF6s3rSoBVcJfawhZ2CyVg';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Store the current user profile
let currentUser = null;

// Initialize the game with user data from the parent application
async function initializeUser(userData) {
  currentUser = userData;
  displayUserInfo();

  // Since we don't have email in the profiles table, we'll use a different approach
  // We'll use the service role key to bypass RLS for now
  // In a real application, you would implement proper authentication

  // For now, we'll just store the user data and proceed
  return;
}

// Display user information in the header
function displayUserInfo() {
  const userInfoElement = document.getElementById('user-info');
  if (currentUser) {
    userInfoElement.innerHTML = `
      <span>Welcome, ${currentUser.name}</span>
      <button id="back-to-dashboard" class="secondary-btn">Back to Dashboard</button>
    `;

    // Add event listener for the back button
    document.getElementById('back-to-dashboard').addEventListener('click', () => {
      window.location.href = '../index.html';
    });
  }
}

// Check if a game session exists for the current user's section
async function checkExistingGameSession() {
  if (!currentUser || !currentUser.section_id) return null;

  const { data, error } = await supabase
    .from('game_sessions')
    .select('*')
    .eq('section_id', currentUser.section_id)
    .eq('active', true)
    .maybeSingle();

  if (error) {
    console.error('Error checking for game session:', error);
    return null;
  }

  return data;
}

// Create a new game session for single player mode
async function createSinglePlayerGame() {
  if (!currentUser) return null;

  try {
    // Create a game session with 5 rounds
    const { data: gameSession, error: sessionError } = await supabase
      .from('game_sessions')
      .insert([
        {
          section_id: currentUser.section_id,
          current_round: 0,
          max_rounds: 5, // Simplified to 5 rounds
          active: true
        }
      ])
      .select()
      .single();

    if (sessionError) {
      console.error('Error creating game session:', sessionError);
      return null;
    }

    // Initialize game state with starting asset prices
    const initialGameState = {
      game_id: gameSession.id,
      user_id: currentUser.id,
      round_number: 0,
      asset_prices: {
        'S&P 500': 100,
        'Bonds': 100,
        'Real Estate': 5000,
        'Gold': 3000,
        'Commodities': 100,
        'Bitcoin': 50000
      },
      price_history: {
        'S&P 500': [100],
        'Bonds': [100],
        'Real Estate': [5000],
        'Gold': [3000],
        'Commodities': [100],
        'Bitcoin': [50000]
      },
      cpi: 100,
      cpi_history: [100],
      last_bitcoin_crash_round: 0,
      bitcoin_shock_range: [-0.5, -0.75]
    };

    // Save initial game state to Supabase
    const { error: gameStateError } = await supabase
      .from('game_states')
      .insert([initialGameState]);

    if (gameStateError) {
      console.error('Error creating initial game state:', gameStateError);
      // Delete the game session if we couldn't create the game state
      await supabase.from('game_sessions').delete().eq('id', gameSession.id);
      return null;
    }

    return gameSession;
  } catch (error) {
    console.error('Error in createSinglePlayerGame:', error);
    return null;
  }
}

// Join an existing game session
async function joinGameSession(gameId) {
  if (!currentUser) return false;

  try {
    // Check if player already exists
    const { data: existingPlayers } = await supabase
      .from('player_states')
      .select('id')
      .eq('game_id', gameId)
      .eq('user_id', currentUser.id);

    if (existingPlayers && existingPlayers.length > 0) {
      return true; // Player already joined
    }

    // Initialize player state for this game
    const { error } = await supabase
      .from('player_states')
      .insert([
        {
          game_id: gameId,
          user_id: currentUser.id,
          cash: 10000,
          portfolio: {},
          trade_history: [],
          portfolio_value_history: [10000],
          total_value: 10000
        }
      ]);

    if (error) {
      // Check if error is because player already exists (unique violation)
      if (error.code === '23505') { // Unique violation
        return true; // Player already joined
      }
      console.error('Error joining game session:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in joinGameSession:', error);
    return false;
  }
}

// Get player state for the current game
async function getPlayerState(gameId) {
  if (!currentUser) return null;

  try {
    const { data, error } = await supabase
      .from('player_states')
      .select('*')
      .eq('game_id', gameId)
      .eq('user_id', currentUser.id)
      .maybeSingle();

    if (error) {
      console.error('Error getting player state:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in getPlayerState:', error);
    return null;
  }
}

// Get game state for the current round
async function getGameState(gameId, roundNumber) {
  try {
    const { data, error } = await supabase
      .from('game_states')
      .select('*')
      .eq('game_id', gameId)
      .eq('round_number', roundNumber)
      .maybeSingle();

    if (error) {
      console.error('Error getting game state:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in getGameState:', error);
    return null;
  }
}

// Update player state after making trades
async function updatePlayerState(gameId, updatedState) {
  if (!currentUser) return false;

  try {
    const { error } = await supabase
      .from('player_states')
      .update(updatedState)
      .eq('game_id', gameId)
      .eq('user_id', currentUser.id);

    if (error) {
      console.error('Error updating player state:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in updatePlayerState:', error);
    return false;
  }
}

// Create a new game state for the next round
async function createNextRoundState(gameId, previousState) {
  if (!currentUser) return null;

  try {
    // Get the current game session
    const { data: gameSession, error: sessionError } = await supabase
      .from('game_sessions')
      .select('*')
      .eq('id', gameId)
      .single();

    if (sessionError) {
      console.error('Error getting game session:', sessionError);
      return null;
    }

    // Calculate new round number
    const newRoundNumber = gameSession.current_round + 1;

    // Check if we've reached the maximum number of rounds
    if (newRoundNumber > gameSession.max_rounds) {
      return { gameOver: true };
    }

    // Generate new asset prices based on previous state
    const newPrices = generateNewPrices(previousState.asset_prices, previousState);

    // Create price history by copying previous history and adding new prices
    const newPriceHistory = {};
    for (const asset in previousState.price_history) {
      newPriceHistory[asset] = [...previousState.price_history[asset], newPrices[asset]];
    }

    // Update CPI (simplified for now)
    const cpiChange = -0.01 + Math.random() * 0.04; // Between -1% and 3%
    const newCPI = previousState.cpi * (1 + cpiChange);

    // Create new game state
    const newGameState = {
      game_id: gameId,
      user_id: currentUser.id,
      round_number: newRoundNumber,
      asset_prices: newPrices,
      price_history: newPriceHistory,
      cpi: newCPI,
      cpi_history: [...previousState.cpi_history, newCPI],
      last_bitcoin_crash_round: previousState.last_bitcoin_crash_round,
      bitcoin_shock_range: previousState.bitcoin_shock_range
    };

    // Check for Bitcoin crash (simplified)
    if (newRoundNumber - previousState.last_bitcoin_crash_round >= 4) {
      if (Math.random() < 0.5) { // 50% chance of crash after 4 rounds
        // Apply shock to Bitcoin price
        const shockFactor = previousState.bitcoin_shock_range[0] +
          Math.random() * (previousState.bitcoin_shock_range[1] - previousState.bitcoin_shock_range[0]);

        newGameState.asset_prices['Bitcoin'] = newGameState.asset_prices['Bitcoin'] * (1 + shockFactor);
        newGameState.last_bitcoin_crash_round = newRoundNumber;

        // Update shock range for next crash (less severe but still negative)
        newGameState.bitcoin_shock_range = [
          Math.min(Math.max(previousState.bitcoin_shock_range[0] + 0.1, -0.5), -0.05),
          Math.min(Math.max(previousState.bitcoin_shock_range[1] + 0.1, -0.75), -0.15)
        ];
      }
    }

    // Save new game state to Supabase
    const { data, error: gameStateError } = await supabase
      .from('game_states')
      .insert([newGameState])
      .select()
      .single();

    if (gameStateError) {
      console.error('Error creating new game state:', gameStateError);
      return null;
    }

    // Update game session with new round number
    const { error: updateError } = await supabase
      .from('game_sessions')
      .update({ current_round: newRoundNumber })
      .eq('id', gameId);

    if (updateError) {
      console.error('Error updating game session:', updateError);
    }

    return data;
  } catch (error) {
    console.error('Error in createNextRoundState:', error);
    return null;
  }
}

// Generate new prices based on previous prices
function generateNewPrices(previousPrices, gameState) {
  const newPrices = {};

  // Define asset parameters (simplified version)
  const assetParams = {
    'S&P 500': { mean: 0.03, stdDev: 0.05, min: -0.15, max: 0.15 },
    'Bonds': { mean: 0.01, stdDev: 0.01, min: 0, max: 0.05 },
    'Real Estate': { mean: 0.02, stdDev: 0.03, min: -0.05, max: 0.08 },
    'Gold': { mean: 0.02, stdDev: 0.06, min: -0.10, max: 0.12 },
    'Commodities': { mean: 0.025, stdDev: 0.04, min: -0.08, max: 0.10 },
    'Bitcoin': { mean: 0.10, stdDev: 0.25, min: -0.30, max: 0.50 }
  };

  // Generate new prices for each asset
  for (const asset in previousPrices) {
    // Special case for Bitcoin
    if (asset === 'Bitcoin') {
      // Bitcoin has more volatility
      const params = assetParams[asset];
      const randomFactor = (Math.random() * 2 - 1) * params.stdDev;
      const percentChange = params.mean + randomFactor;

      // Ensure return is within bounds
      const boundedChange = Math.max(
        params.min,
        Math.min(params.max, percentChange)
      );

      newPrices[asset] = previousPrices[asset] * (1 + boundedChange);
    } else {
      // Regular assets
      const params = assetParams[asset];
      const randomFactor = (Math.random() * 2 - 1) * params.stdDev;
      const percentChange = params.mean + randomFactor;

      // Ensure return is within bounds
      const boundedChange = Math.max(
        params.min,
        Math.min(params.max, percentChange)
      );

      newPrices[asset] = previousPrices[asset] * (1 + boundedChange);
    }
  }

  return newPrices;
}

// Complete the game and save to leaderboard
async function completeGame(gameId) {
  if (!currentUser) return false;

  try {
    // Get final player state
    const { data: playerState, error: playerError } = await supabase
      .from('player_states')
      .select('*')
      .eq('game_id', gameId)
      .eq('user_id', currentUser.id)
      .single();

    if (playerError) {
      console.error('Error getting player state:', playerError);
      return false;
    }

    // Get game session
    const { data: gameSession, error: sessionError } = await supabase
      .from('game_sessions')
      .select('*')
      .eq('id', gameId)
      .single();

    if (sessionError) {
      console.error('Error getting game session:', sessionError);
      return false;
    }

    // Add to leaderboard
    const { error: leaderboardError } = await supabase
      .from('leaderboard')
      .insert([
        {
          user_id: currentUser.id,
          user_name: currentUser.name,
          game_mode: 'single',
          game_id: gameId,
          section_id: gameSession.section_id,
          final_value: playerState.total_value
        }
      ]);

    if (leaderboardError) {
      console.error('Error adding to leaderboard:', leaderboardError);
      return false;
    }

    // Mark game as inactive
    const { error: updateError } = await supabase
      .from('game_sessions')
      .update({ active: false })
      .eq('id', gameId);

    if (updateError) {
      console.error('Error updating game session:', updateError);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in completeGame:', error);
    return false;
  }
}

// Export functions for use in game.js
window.gameSupabase = {
  initializeUser,
  checkExistingGameSession,
  createSinglePlayerGame,
  joinGameSession,
  getPlayerState,
  getGameState,
  updatePlayerState,
  createNextRoundState,
  completeGame
};
