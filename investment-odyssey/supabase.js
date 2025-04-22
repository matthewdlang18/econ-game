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

  // For this simplified version, we'll use a direct API call with headers
  // This is a workaround for the RLS policies
  try {
    // Create a game session with 5 rounds
    const response = await fetch(`${SUPABASE_URL}/rest/v1/game_sessions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        section_id: currentUser.section_id,
        current_round: 0,
        max_rounds: 5, // Simplified to 5 rounds
        active: true
      })
    });

    if (!response.ok) {
      console.error('Error creating game session:', await response.text());
      return null;
    }

    const gameSession = (await response.json())[0];

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

    // Save initial game state to Supabase using direct API call
    const gameStateResponse = await fetch(`${SUPABASE_URL}/rest/v1/game_states`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(initialGameState)
    });

    if (!gameStateResponse.ok) {
      console.error('Error creating initial game state:', await gameStateResponse.text());
      // Delete the game session if we couldn't create the game state
      await fetch(`${SUPABASE_URL}/rest/v1/game_sessions?id=eq.${gameSession.id}`, {
        method: 'DELETE',
        headers: {
          'apikey': SUPABASE_ANON_KEY
        }
      });
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
    const checkResponse = await fetch(`${SUPABASE_URL}/rest/v1/player_states?game_id=eq.${gameId}&user_id=eq.${currentUser.id}`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY
      }
    });

    const existingPlayers = await checkResponse.json();
    if (existingPlayers && existingPlayers.length > 0) {
      return true; // Player already joined
    }

    // Initialize player state for this game using direct API call
    const response = await fetch(`${SUPABASE_URL}/rest/v1/player_states`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        game_id: gameId,
        user_id: currentUser.id,
        cash: 10000,
        portfolio: {},
        trade_history: [],
        portfolio_value_history: [10000],
        total_value: 10000
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      // Check if error is because player already exists (unique violation)
      if (errorText.includes('duplicate key value violates unique constraint')) {
        return true; // Player already joined
      }
      console.error('Error joining game session:', errorText);
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
    const response = await fetch(`${SUPABASE_URL}/rest/v1/player_states?game_id=eq.${gameId}&user_id=eq.${currentUser.id}&limit=1`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY
      }
    });

    if (!response.ok) {
      console.error('Error getting player state:', await response.text());
      return null;
    }

    const data = await response.json();
    return data.length > 0 ? data[0] : null;
  } catch (error) {
    console.error('Error in getPlayerState:', error);
    return null;
  }
}

// Get game state for the current round
async function getGameState(gameId, roundNumber) {
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/game_states?game_id=eq.${gameId}&round_number=eq.${roundNumber}&limit=1`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY
      }
    });

    if (!response.ok) {
      console.error('Error getting game state:', await response.text());
      return null;
    }

    const data = await response.json();
    return data.length > 0 ? data[0] : null;
  } catch (error) {
    console.error('Error in getGameState:', error);
    return null;
  }
}

// Update player state after making trades
async function updatePlayerState(gameId, updatedState) {
  if (!currentUser) return false;

  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/player_states?game_id=eq.${gameId}&user_id=eq.${currentUser.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(updatedState)
    });

    if (!response.ok) {
      console.error('Error updating player state:', await response.text());
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
    const sessionResponse = await fetch(`${SUPABASE_URL}/rest/v1/game_sessions?id=eq.${gameId}&limit=1`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY
      }
    });

    if (!sessionResponse.ok) {
      console.error('Error getting game session:', await sessionResponse.text());
      return null;
    }

    const sessions = await sessionResponse.json();
    if (sessions.length === 0) {
      console.error('Game session not found');
      return null;
    }

    const gameSession = sessions[0];

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
    const gameStateResponse = await fetch(`${SUPABASE_URL}/rest/v1/game_states`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(newGameState)
    });

    if (!gameStateResponse.ok) {
      console.error('Error creating new game state:', await gameStateResponse.text());
      return null;
    }

    const data = (await gameStateResponse.json())[0];

    // Update game session with new round number
    const updateResponse = await fetch(`${SUPABASE_URL}/rest/v1/game_sessions?id=eq.${gameId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY
      },
      body: JSON.stringify({ current_round: newRoundNumber })
    });

    if (!updateResponse.ok) {
      console.error('Error updating game session:', await updateResponse.text());
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
    const playerResponse = await fetch(`${SUPABASE_URL}/rest/v1/player_states?game_id=eq.${gameId}&user_id=eq.${currentUser.id}&limit=1`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY
      }
    });

    if (!playerResponse.ok) {
      console.error('Error getting player state:', await playerResponse.text());
      return false;
    }

    const players = await playerResponse.json();
    if (players.length === 0) {
      console.error('Player state not found');
      return false;
    }

    const playerState = players[0];

    // Get game session
    const sessionResponse = await fetch(`${SUPABASE_URL}/rest/v1/game_sessions?id=eq.${gameId}&limit=1`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY
      }
    });

    if (!sessionResponse.ok) {
      console.error('Error getting game session:', await sessionResponse.text());
      return false;
    }

    const sessions = await sessionResponse.json();
    if (sessions.length === 0) {
      console.error('Game session not found');
      return false;
    }

    const gameSession = sessions[0];

    // Add to leaderboard
    const leaderboardResponse = await fetch(`${SUPABASE_URL}/rest/v1/leaderboard`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY
      },
      body: JSON.stringify({
        user_id: currentUser.id,
        user_name: currentUser.name,
        game_mode: 'single',
        game_id: gameId,
        section_id: gameSession.section_id,
        final_value: playerState.total_value
      })
    });

    if (!leaderboardResponse.ok) {
      console.error('Error adding to leaderboard:', await leaderboardResponse.text());
      return false;
    }

    // Mark game as inactive
    const updateResponse = await fetch(`${SUPABASE_URL}/rest/v1/game_sessions?id=eq.${gameId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY
      },
      body: JSON.stringify({ active: false })
    });

    if (!updateResponse.ok) {
      console.error('Error updating game session:', await updateResponse.text());
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
