// Investment Odyssey Game Logic

// Game state variables
let gameSession = null;
let playerState = null;
let gameState = null;
let currentRound = 0;

// DOM Elements
const singlePlayerBtn = document.getElementById('single-player-btn');
const classModeBtn = document.getElementById('class-mode-btn');
const welcomeScreen = document.getElementById('welcome-screen');
const gameScreen = document.getElementById('game-screen');

// Initialize the game
document.addEventListener('DOMContentLoaded', () => {
  // Set up event listeners
  singlePlayerBtn.addEventListener('click', startSinglePlayerGame);
  classModeBtn.addEventListener('click', joinClassGame);
  
  // Check if we have user data passed from the parent window
  window.addEventListener('message', (event) => {
    // Verify the origin of the message
    if (event.origin !== window.location.origin) return;
    
    if (event.data && event.data.type === 'USER_DATA') {
      window.gameSupabase.initializeUser(event.data.userData);
    }
  });
  
  // If this page is loaded directly (not in an iframe)
  // Try to get user data from localStorage or redirect to login
  if (window.self === window.top) {
    const userData = localStorage.getItem('userData');
    if (userData) {
      try {
        window.gameSupabase.initializeUser(JSON.parse(userData));
      } catch (e) {
        console.error('Error parsing user data from localStorage', e);
        redirectToLogin();
      }
    } else {
      redirectToLogin();
    }
  }
});

// Redirect to login page if no user data is available
function redirectToLogin() {
  window.location.href = '../index.html';
}

// Start a single player game
async function startSinglePlayerGame() {
  // Create a new game session
  gameSession = await window.gameSupabase.createSinglePlayerGame();
  if (!gameSession) {
    alert('Failed to create a new game. Please try again.');
    return;
  }
  
  // Join the game session
  const joined = await window.gameSupabase.joinGameSession(gameSession.id);
  if (!joined) {
    alert('Failed to join the game. Please try again.');
    return;
  }
  
  // Get initial player state
  playerState = await window.gameSupabase.getPlayerState(gameSession.id);
  if (!playerState) {
    alert('Failed to initialize player state. Please try again.');
    return;
  }
  
  // Initialize game state for round 0 (not yet implemented)
  // This would typically create the initial market conditions
  
  // Show the game screen
  welcomeScreen.style.display = 'none';
  gameScreen.style.display = 'block';
  
  // Load the game interface
  loadGameInterface();
}

// Join a class game
async function joinClassGame() {
  // Check if there's an active game session for the user's section
  const existingSession = await window.gameSupabase.checkExistingGameSession();
  if (!existingSession) {
    alert('No active class game found. Please ask your instructor to start a game.');
    return;
  }
  
  // Join the existing game session
  gameSession = existingSession;
  const joined = await window.gameSupabase.joinGameSession(gameSession.id);
  if (!joined) {
    alert('Failed to join the class game. Please try again.');
    return;
  }
  
  // Get player state
  playerState = await window.gameSupabase.getPlayerState(gameSession.id);
  if (!playerState) {
    alert('Failed to initialize player state. Please try again.');
    return;
  }
  
  // Get current game state
  currentRound = gameSession.current_round;
  gameState = await window.gameSupabase.getGameState(gameSession.id, currentRound);
  
  // Show the game screen
  welcomeScreen.style.display = 'none';
  gameScreen.style.display = 'block';
  
  // Load the game interface
  loadGameInterface();
  
  // Set up real-time subscription for game updates (not yet implemented)
}

// Load the game interface
function loadGameInterface() {
  // For now, just show a placeholder
  gameScreen.innerHTML = `
    <div class="game-header">
      <h2>Investment Odyssey Game</h2>
      <div class="game-info">
        <span>Round: ${currentRound} / ${gameSession.max_rounds}</span>
        <span>Cash: $${playerState.cash.toFixed(2)}</span>
        <span>Portfolio Value: $${playerState.total_value.toFixed(2)}</span>
      </div>
    </div>
    
    <div class="game-content">
      <p>Game interface will be implemented in future steps.</p>
      <p>This is just a placeholder to show that the Supabase connection is working.</p>
      
      <div class="game-actions">
        <button id="back-to-welcome" class="secondary-btn">Back to Welcome Screen</button>
      </div>
    </div>
  `;
  
  // Add event listener for the back button
  document.getElementById('back-to-welcome').addEventListener('click', () => {
    gameScreen.style.display = 'none';
    welcomeScreen.style.display = 'block';
  });
}
