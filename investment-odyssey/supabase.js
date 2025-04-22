// Investment Odyssey Supabase Integration

// Use the same Supabase credentials as the main application
const SUPABASE_URL = 'https://bvvkevmqnnlecghyraao.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ2dmtldm1xbm5sZWNnaHlyYWFvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ5MDAzNDEsImV4cCI6MjA2MDQ3NjM0MX0.UY_H91jIbbZWq6A-l7XbdyF6s3rSoBVcJfawhZ2CyVg';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Store the current user profile
let currentUser = null;

// Initialize the game with user data from the parent application
function initializeUser(userData) {
  currentUser = userData;
  displayUserInfo();
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
  
  const { data, error } = await supabase
    .from('game_sessions')
    .insert([
      {
        section_id: currentUser.section_id,
        current_round: 0,
        max_rounds: 20,
        active: true
      }
    ])
    .select()
    .single();
    
  if (error) {
    console.error('Error creating game session:', error);
    return null;
  }
  
  return data;
}

// Join an existing game session
async function joinGameSession(gameId) {
  if (!currentUser) return false;
  
  // Initialize player state for this game
  const { data, error } = await supabase
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
    ])
    .select()
    .single();
    
  if (error) {
    // Check if error is because player already exists
    if (error.code === '23505') { // Unique violation
      return true; // Player already joined
    }
    console.error('Error joining game session:', error);
    return false;
  }
  
  return true;
}

// Get player state for the current game
async function getPlayerState(gameId) {
  if (!currentUser) return null;
  
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
}

// Get game state for the current round
async function getGameState(gameId, roundNumber) {
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
}

// Update player state after making trades
async function updatePlayerState(gameId, updatedState) {
  if (!currentUser) return false;
  
  const { data, error } = await supabase
    .from('player_states')
    .update(updatedState)
    .eq('game_id', gameId)
    .eq('user_id', currentUser.id)
    .select()
    .single();
    
  if (error) {
    console.error('Error updating player state:', error);
    return false;
  }
  
  return true;
}

// Export functions for use in game.js
window.gameSupabase = {
  initializeUser,
  checkExistingGameSession,
  createSinglePlayerGame,
  joinGameSession,
  getPlayerState,
  getGameState,
  updatePlayerState
};
