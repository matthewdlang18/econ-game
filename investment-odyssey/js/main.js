// Investment Odyssey - Main Application

// Global state
let currentUser = null;
let gameState = null;
let playerState = null;
let gameMode = 'single'; // 'single' or 'class'
let gameId = null;
let sectionId = null;
let gameSubscription = null;

// Initialize application
document.addEventListener('DOMContentLoaded', () => {
  // Check if we're embedded and parent has a logged-in user
  checkParentSession();

  // Setup UI event listeners
  setupEventListeners();

  // Initialize charts
  window.Charts.initializeCharts();
});

// Check for parent session (to avoid double login)
async function checkParentSession() {
  // Check if we're in an iframe and parent has a logged-in user
  const isEmbedded = window.parent !== window;

  if (isEmbedded && window.parent.currentUser) {
    // Use the parent's user
    currentUser = window.parent.currentUser;

    // Show user info
    window.UIController.showUserInfo(currentUser);

    // Show introduction section
    window.UIController.showSection('intro-section');

    console.log('Using parent session for user:', currentUser.name);
  }
}

// Setup event listeners
function setupEventListeners() {
  // Login form
  const loginForm = window.UIController.elements.loginForm;
  loginForm.addEventListener('submit', handleLogin);

  // Logout button
  const logoutBtn = window.UIController.elements.logoutBtn;
  logoutBtn.addEventListener('click', handleLogout);

  // Tab navigation
  window.UIController.setupTabs();

  // Chart tabs
  window.UIController.setupChartTabs();

  // Game mode buttons
  const startSinglePlayerBtn = window.UIController.elements.startSinglePlayerBtn;
  startSinglePlayerBtn.addEventListener('click', startSinglePlayerGame);

  const joinClassGameBtn = window.UIController.elements.joinClassGameBtn;
  joinClassGameBtn.addEventListener('click', joinClassGame);

  const createClassGameBtn = window.UIController.elements.createClassGameBtn;
  createClassGameBtn.addEventListener('click', createClassGame);

  // Trading form
  const tradeForm = window.UIController.elements.tradeForm;
  tradeForm.addEventListener('submit', handleTrade);

  // Game control buttons
  const nextRoundBtn = window.UIController.elements.nextRoundBtn;
  nextRoundBtn.addEventListener('click', handleNextRound);

  const resetGameBtn = window.UIController.elements.resetGameBtn;
  resetGameBtn.addEventListener('click', handleResetGame);

  const saveGameBtn = window.UIController.elements.saveGameBtn;
  saveGameBtn.addEventListener('click', handleSaveGame);

  const endGameBtn = window.UIController.elements.endGameBtn;
  endGameBtn.addEventListener('click', handleEndGame);

  // Game results buttons
  const submitScoreBtn = window.UIController.elements.submitScoreBtn;
  submitScoreBtn.addEventListener('click', handleSubmitScore);

  const playAgainBtn = window.UIController.elements.playAgainBtn;
  playAgainBtn.addEventListener('click', handlePlayAgain);

  const returnIntroBtn = window.UIController.elements.returnIntroBtn;
  returnIntroBtn.addEventListener('click', handleReturnToIntro);

  // Instructor controls
  const startClassGameBtn = window.UIController.elements.startClassGameBtn;
  startClassGameBtn.addEventListener('click', handleStartClassGame);

  const cancelClassGameBtn = window.UIController.elements.cancelClassGameBtn;
  cancelClassGameBtn.addEventListener('click', handleCancelClassGame);
}

// Handle login
async function handleLogin(event) {
  event.preventDefault();

  const nameInput = document.getElementById('name');
  const passcodeInput = document.getElementById('passcode');
  const loginError = window.UIController.elements.loginError;

  const name = nameInput.value.trim();
  const passcode = passcodeInput.value.trim();

  if (!name || !passcode) {
    loginError.textContent = 'Please enter both name and passcode.';
    return;
  }

  try {
    const { data: profile, error } = await fetchProfile(name, passcode);

    if (error || !profile) {
      loginError.textContent = 'Invalid name or passcode.';
      return;
    }

    // Update last_login timestamp
    await supabase
      .from('profiles')
      .update({ last_login: new Date().toISOString() })
      .eq('id', profile.id);

    // Set current user
    currentUser = profile;

    // Show user info
    window.UIController.showUserInfo(profile);

    // Show introduction section
    window.UIController.showSection('intro-section');

    // Clear login form
    nameInput.value = '';
    passcodeInput.value = '';
    loginError.textContent = '';

  } catch (error) {
    console.error('Login error:', error);
    loginError.textContent = 'An error occurred during login. Please try again.';
  }
}

// Handle logout
function handleLogout() {
  // Clear current user
  currentUser = null;

  // Clear game state
  gameState = null;
  playerState = null;
  gameMode = 'single';
  gameId = null;
  sectionId = null;

  // Unsubscribe from game updates
  if (gameSubscription) {
    gameSubscription.unsubscribe();
    gameSubscription = null;
  }

  // Hide user info
  window.UIController.elements.userInfo.classList.add('hidden');

  // Show login section
  window.UIController.showSection('login-section');
}

// Start single player game
function startSinglePlayerGame() {
  // Set game mode
  gameMode = 'single';

  // Initialize game state
  gameState = window.GameState.createInitialGameState();
  playerState = window.GameState.createInitialPlayerState();

  // Set max rounds
  window.UIController.elements.maxRounds.textContent = '20';

  // Setup trading interface
  window.UIController.setupPercentageButtons(gameState, playerState);
  window.UIController.setupInputSynchronization(gameState);

  // Update dashboard
  window.UIController.updateDashboard(gameState, playerState);

  // Show game dashboard
  window.UIController.showSection('game-dashboard');

  // Show notification
  window.UIController.showNotification('Single player game started!', 'success');
}

// Join class game
async function joinClassGame() {
  if (!currentUser || !currentUser.section_id) {
    window.UIController.showNotification('You need to be assigned to a section first.', 'error');
    return;
  }

  try {
    // Set section ID
    sectionId = currentUser.section_id;

    // Get active game session for the section
    const { data: gameSession, error } = await window.SupabaseIntegration.getActiveGameSession(sectionId);

    if (error) {
      throw new Error(error.message);
    }

    if (!gameSession) {
      window.UIController.showNotification('No active game session found for your section.', 'error');
      return;
    }

    // Set game ID and mode
    gameId = gameSession.id;
    gameMode = 'class';

    // Initialize game state
    gameState = window.GameState.createInitialGameState();
    playerState = window.GameState.createInitialPlayerState();

    // Set max rounds
    window.UIController.elements.maxRounds.textContent = gameSession.max_rounds.toString();

    // Load existing game state if available
    const { data: existingGameState } = await window.SupabaseIntegration.loadGameState(gameId, currentUser.id);
    const { data: existingPlayerState } = await window.SupabaseIntegration.loadPlayerState(gameId, currentUser.id);

    if (existingGameState && existingPlayerState) {
      // Restore game state
      gameState = existingGameState;
      playerState = existingPlayerState;

      // Update dashboard
      window.UIController.updateDashboard(gameState, playerState);

      // Show game dashboard
      window.UIController.showSection('game-dashboard');
    } else {
      // Save initial game state
      await window.SupabaseIntegration.saveGameState(gameId, currentUser.id, gameState);
      await window.SupabaseIntegration.savePlayerState(gameId, currentUser.id, playerState);

      // Show waiting room
      window.UIController.showSection('waiting-room');

      // Update participants list
      updateParticipantsList();
    }

    // Subscribe to game session updates
    subscribeToGameUpdates();

    // Setup trading interface
    window.UIController.setupPercentageButtons(gameState, playerState);
    window.UIController.setupInputSynchronization(gameState);

    // Show notification
    window.UIController.showNotification('Joined class game!', 'success');

  } catch (error) {
    console.error('Join class game error:', error);
    window.UIController.showNotification('Failed to join class game: ' + error.message, 'error');
  }
}

// Create class game (for instructors)
async function createClassGame() {
  if (!currentUser || currentUser.role !== 'ta') {
    window.UIController.showNotification('Only instructors can create class games.', 'error');
    return;
  }

  try {
    // Get sections for this instructor
    const { data: sections, error: sectionsError } = await fetchTASections(currentUser.custom_id);

    if (sectionsError) {
      throw new Error(sectionsError.message);
    }

    if (!sections || sections.length === 0) {
      window.UIController.showNotification('You have no sections assigned.', 'error');
      return;
    }

    // For simplicity, use the first section
    sectionId = sections[0].id;

    // Create new game session
    const { data: gameSession, error } = await window.SupabaseIntegration.createGameSession(sectionId, 20);

    if (error) {
      throw new Error(error.message);
    }

    // Set game ID and mode
    gameId = gameSession.id;
    gameMode = 'class';

    // Show instructor controls
    window.UIController.elements.instructorControls.classList.remove('hidden');

    // Show waiting room
    window.UIController.showSection('waiting-room');

    // Update participants list
    updateParticipantsList();

    // Show notification
    window.UIController.showNotification('Class game created! Waiting for students to join.', 'success');

  } catch (error) {
    console.error('Create class game error:', error);
    window.UIController.showNotification('Failed to create class game: ' + error.message, 'error');
  }
}

// Update participants list
async function updateParticipantsList() {
  if (!sectionId) return;

  try {
    const { data: students, error } = await fetchStudentsBySection(sectionId);

    if (error) {
      throw new Error(error.message);
    }

    window.UIController.updateParticipantsList(students);

  } catch (error) {
    console.error('Update participants list error:', error);
  }
}

// Subscribe to game updates
function subscribeToGameUpdates() {
  if (!gameId) return;

  // Unsubscribe from previous subscription
  if (gameSubscription) {
    gameSubscription.unsubscribe();
  }

  // Subscribe to game session updates
  gameSubscription = window.SupabaseIntegration.subscribeToGameSession(gameId, handleGameSessionUpdate);
}

// Handle game session update
async function handleGameSessionUpdate(payload) {
  const updatedGameSession = payload.new;

  if (!updatedGameSession) return;

  // Check if game has started
  if (updatedGameSession.current_round > 0 && window.UIController.elements.waitingRoom.classList.contains('active')) {
    // Game has started, show game dashboard
    window.UIController.showSection('game-dashboard');

    // Load game state
    await loadGameState();
  }

  // Check if round has advanced
  if (updatedGameSession.current_round > gameState.roundNumber) {
    // Round has advanced, update game state
    await loadGameState();

    // Show notification
    window.UIController.showNotification(`Round ${updatedGameSession.current_round} has started!`, 'info');
  }
}

// Load game state from Supabase
async function loadGameState() {
  if (!gameId || !currentUser) return;

  try {
    const { data: loadedGameState, error: gameStateError } = await window.SupabaseIntegration.loadGameState(gameId, currentUser.id);

    if (gameStateError) {
      throw new Error(gameStateError.message);
    }

    const { data: loadedPlayerState, error: playerStateError } = await window.SupabaseIntegration.loadPlayerState(gameId, currentUser.id);

    if (playerStateError) {
      throw new Error(playerStateError.message);
    }

    if (loadedGameState && loadedPlayerState) {
      // Update game state
      gameState = loadedGameState;
      playerState = loadedPlayerState;

      // Update dashboard
      window.UIController.updateDashboard(gameState, playerState);
    }

  } catch (error) {
    console.error('Load game state error:', error);
    window.UIController.showNotification('Failed to load game state: ' + error.message, 'error');
  }
}

// Handle trade
function handleTrade(event) {
  event.preventDefault();

  const asset = window.UIController.elements.assetSelect.value;
  const action = window.UIController.elements.actionSelect.value;
  const quantity = parseFloat(window.UIController.elements.quantityInput.value);

  if (isNaN(quantity) || quantity <= 0) {
    window.UIController.elements.tradeMessage.textContent = 'Please enter a valid quantity.';
    window.UIController.elements.tradeMessage.className = 'message error';
    return;
  }

  let result;

  if (action === 'buy') {
    result = window.Trading.buyAsset(playerState, gameState, asset, quantity);
  } else {
    result = window.Trading.sellAsset(playerState, gameState, asset, quantity);
  }

  if (result.success) {
    // Update dashboard
    window.UIController.updateDashboard(gameState, playerState);

    // Clear form
    window.UIController.elements.quantityInput.value = '';
    window.UIController.elements.amountInput.value = '';

    // Show success message
    window.UIController.elements.tradeMessage.textContent = result.message;
    window.UIController.elements.tradeMessage.className = 'message success';

    // Save player state if in class mode
    if (gameMode === 'class' && gameId) {
      window.SupabaseIntegration.savePlayerState(gameId, currentUser.id, playerState);
    }
  } else {
    // Show error message
    window.UIController.elements.tradeMessage.textContent = result.message;
    window.UIController.elements.tradeMessage.className = 'message error';
  }
}

// Handle next round
async function handleNextRound() {
  if (gameMode === 'class' && currentUser.role !== 'ta') {
    window.UIController.showNotification('Only instructors can advance rounds in class mode.', 'error');
    return;
  }

  // Add current round to trade history
  playerState.tradeHistory.forEach(trade => {
    if (!trade.round) {
      trade.round = gameState.roundNumber;
    }
  });

  // Advance to next round
  gameState = window.GameState.advanceToNextRound(gameState);

  // Update player state
  playerState = window.GameState.updatePlayerState(playerState, gameState);

  // Update dashboard
  window.UIController.updateDashboard(gameState, playerState);

  // Check if game is over
  const maxRounds = parseInt(window.UIController.elements.maxRounds.textContent);
  if (gameState.roundNumber >= maxRounds) {
    handleEndGame();
    return;
  }

  // Save game state if in class mode
  if (gameMode === 'class' && gameId) {
    try {
      await window.SupabaseIntegration.saveGameState(gameId, currentUser.id, gameState);
      await window.SupabaseIntegration.savePlayerState(gameId, currentUser.id, playerState);

      // Update game session round if instructor
      if (currentUser.role === 'ta') {
        await window.SupabaseIntegration.updateGameSessionRound(gameId, gameState.roundNumber);
      }

    } catch (error) {
      console.error('Save game state error:', error);
      window.UIController.showNotification('Failed to save game state: ' + error.message, 'error');
    }
  }

  // Show notification
  window.UIController.showNotification(`Advanced to round ${gameState.roundNumber}!`, 'success');
}

// Handle reset game
function handleResetGame() {
  if (gameMode === 'class') {
    window.UIController.showNotification('Cannot reset a class game.', 'error');
    return;
  }

  // Confirm reset
  if (!confirm('Are you sure you want to reset the game? All progress will be lost.')) {
    return;
  }

  // Reset game state
  gameState = window.GameState.createInitialGameState();
  playerState = window.GameState.createInitialPlayerState();

  // Update dashboard
  window.UIController.updateDashboard(gameState, playerState);

  // Show notification
  window.UIController.showNotification('Game reset!', 'success');
}

// Handle save game
async function handleSaveGame() {
  if (!gameId && gameMode === 'class') {
    window.UIController.showNotification('Game is automatically saved in class mode.', 'info');
    return;
  }

  if (gameMode === 'single') {
    // For single player, we could implement local storage saving
    localStorage.setItem('investmentOdyssey_gameState', JSON.stringify(gameState));
    localStorage.setItem('investmentOdyssey_playerState', JSON.stringify(playerState));

    window.UIController.showNotification('Game saved!', 'success');
  } else if (gameMode === 'class' && gameId) {
    try {
      await window.SupabaseIntegration.saveGameState(gameId, currentUser.id, gameState);
      await window.SupabaseIntegration.savePlayerState(gameId, currentUser.id, playerState);

      window.UIController.showNotification('Game saved!', 'success');

    } catch (error) {
      console.error('Save game error:', error);
      window.UIController.showNotification('Failed to save game: ' + error.message, 'error');
    }
  }
}

// Handle end game
function handleEndGame() {
  // Update game results
  window.UIController.updateGameResults(playerState);

  // Load leaderboard
  loadLeaderboard();

  // Show game results section
  window.UIController.showSection('game-results');

  // Show notification
  window.UIController.showNotification('Game completed!', 'success');
}

// Load leaderboard
async function loadLeaderboard() {
  try {
    let leaderboardData;

    if (gameMode === 'class' && sectionId) {
      // Get leaderboard for this section
      const { data, error } = await window.SupabaseIntegration.getLeaderboard('class', sectionId);

      if (error) {
        throw new Error(error.message);
      }

      leaderboardData = data;
    } else {
      // Get global leaderboard
      const { data, error } = await window.SupabaseIntegration.getLeaderboard('single');

      if (error) {
        throw new Error(error.message);
      }

      leaderboardData = data;
    }

    // Update leaderboard table
    window.UIController.updateLeaderboardTable(leaderboardData);

  } catch (error) {
    console.error('Load leaderboard error:', error);
    window.UIController.showNotification('Failed to load leaderboard: ' + error.message, 'error');
  }
}

// Handle submit score
async function handleSubmitScore() {
  if (!currentUser) return;

  try {
    await window.SupabaseIntegration.submitToLeaderboard(
      currentUser.id,
      currentUser.name,
      gameMode,
      gameId,
      sectionId,
      playerState.totalValue
    );

    // Reload leaderboard
    await loadLeaderboard();

    // Disable submit button
    window.UIController.elements.submitScoreBtn.disabled = true;

    // Show notification
    window.UIController.showNotification('Score submitted to leaderboard!', 'success');

  } catch (error) {
    console.error('Submit score error:', error);
    window.UIController.showNotification('Failed to submit score: ' + error.message, 'error');
  }
}

// Handle play again
function handlePlayAgain() {
  if (gameMode === 'single') {
    // Start new single player game
    startSinglePlayerGame();
  } else {
    // Return to introduction for class mode
    handleReturnToIntro();
  }
}

// Handle return to introduction
function handleReturnToIntro() {
  // Clear game state
  gameState = null;
  playerState = null;

  // Show introduction section
  window.UIController.showSection('intro-section');
}

// Handle start class game (for instructors)
async function handleStartClassGame() {
  if (!currentUser || currentUser.role !== 'ta' || !gameId) {
    return;
  }

  try {
    // Initialize game state
    gameState = window.GameState.createInitialGameState();
    playerState = window.GameState.createInitialPlayerState();

    // Advance to first round
    gameState = window.GameState.advanceToNextRound(gameState);

    // Update game session
    await window.SupabaseIntegration.updateGameSessionRound(gameId, gameState.roundNumber);

    // Save instructor's game state
    await window.SupabaseIntegration.saveGameState(gameId, currentUser.id, gameState);
    await window.SupabaseIntegration.savePlayerState(gameId, currentUser.id, playerState);

    // Setup trading interface
    window.UIController.setupPercentageButtons(gameState, playerState);
    window.UIController.setupInputSynchronization(gameState);

    // Update dashboard
    window.UIController.updateDashboard(gameState, playerState);

    // Show game dashboard
    window.UIController.showSection('game-dashboard');

    // Show notification
    window.UIController.showNotification('Class game started!', 'success');

  } catch (error) {
    console.error('Start class game error:', error);
    window.UIController.showNotification('Failed to start class game: ' + error.message, 'error');
  }
}

// Handle cancel class game (for instructors)
async function handleCancelClassGame() {
  if (!currentUser || currentUser.role !== 'ta' || !gameId) {
    return;
  }

  // Confirm cancellation
  if (!confirm('Are you sure you want to cancel the game? All progress will be lost.')) {
    return;
  }

  try {
    // Update game session to inactive
    await supabase
      .from('game_sessions')
      .update({ active: false })
      .eq('id', gameId);

    // Clear game state
    gameState = null;
    playerState = null;
    gameId = null;
    sectionId = null;

    // Show introduction section
    window.UIController.showSection('intro-section');

    // Show notification
    window.UIController.showNotification('Class game cancelled.', 'info');

  } catch (error) {
    console.error('Cancel class game error:', error);
    window.UIController.showNotification('Failed to cancel class game: ' + error.message, 'error');
  }
}
