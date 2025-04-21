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
document.addEventListener('DOMContentLoaded', async () => {
  // Setup UI event listeners
  setupEventListeners();

  // Initialize charts
  try {
    // Register the matrix controller plugin
    if (Chart.registry && typeof Chart.registry.addControllers === 'function') {
      if (window.MatrixController) {
        Chart.registry.addControllers([window.MatrixController]);
      }
    }

    window.Charts.initializeCharts();
  } catch (error) {
    console.error('Error initializing charts:', error);
  }

  // Check if we have a user from the parent window
  if (window.parentHasUser && window.currentUser) {
    // Use the parent's user
    currentUser = window.currentUser;

    // Show user info
    window.UIController.showUserInfo(currentUser);

    // Show introduction section
    window.UIController.showSection('intro-section');

    console.log('Using parent session for user:', currentUser.name);
  } else {
    // Check if we have a stored user in localStorage
    const storedUser = localStorage.getItem('investmentOdyssey_user');
    if (storedUser) {
      try {
        currentUser = JSON.parse(storedUser);
        console.log('Using stored user:', currentUser.name);

        // Show user info
        window.UIController.showUserInfo(currentUser);

        // Show introduction section
        window.UIController.showSection('intro-section');
      } catch (error) {
        console.error('Error parsing stored user:', error);
        // Show login section
        window.UIController.showSection('login-section');
      }
    } else {
      // Show login section
      window.UIController.showSection('login-section');
    }
  }
});

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

// Fetch profile by name and passcode
async function fetchProfile(name, passcode) {
  try {
    // Try to use the helper function if available
    if (window.dbHelpers && typeof window.dbHelpers.fetchProfile === 'function') {
      console.log('Using dbHelpers.fetchProfile');
      return await window.dbHelpers.fetchProfile(name, passcode);
    }

    // Fallback to direct query if we have a working Supabase client
    if (window.supabase && typeof window.supabase.from === 'function') {
      console.log('Using direct query for profile');
      const { data, error } = await window.supabase
        .from('profiles')
        .select('*')
        .eq('name', name)
        .eq('passcode', passcode)
        .maybeSingle();

      if (error) {
        console.error('Profile query error:', error);
      }

      return { data, error };
    }

    // No working Supabase client available
    console.error('No working Supabase client available');
    return { data: null, error: { message: 'Database connection not available' } };
  } catch (error) {
    console.error('Error fetching profile:', error);
    return { data: null, error };
  }
}

// Fetch TA sections
async function fetchTASections(taId) {
  try {
    // Try to use the helper function if available
    if (window.dbHelpers && typeof window.dbHelpers.fetchTASections === 'function') {
      console.log('Using dbHelpers.fetchTASections');
      return await window.dbHelpers.fetchTASections(taId);
    }

    // Fallback to direct query if we have a working Supabase client
    if (window.supabase && typeof window.supabase.from === 'function') {
      console.log('Using direct query for TA sections');
      const { data, error } = await window.supabase
        .from('sections')
        .select('*')
        .eq('ta_id', taId);

      if (error) {
        console.error('TA sections query error:', error);
      }

      return { data, error };
    }

    // No working Supabase client available
    console.error('No working Supabase client available for TA sections');
    return { data: [], error: { message: 'Database connection not available' } };
  } catch (error) {
    console.error('Error fetching TA sections:', error);
    return { data: [], error };
  }
}

// Fetch students by section
async function fetchStudentsBySection(sectionId) {
  try {
    // Try to use the helper function if available
    if (window.dbHelpers && typeof window.dbHelpers.fetchStudentsBySection === 'function') {
      console.log('Using dbHelpers.fetchStudentsBySection');
      return await window.dbHelpers.fetchStudentsBySection(sectionId);
    }

    // Fallback to direct query if we have a working Supabase client
    if (window.supabase && typeof window.supabase.from === 'function') {
      console.log('Using direct query for students');
      const { data, error } = await window.supabase
        .from('profiles')
        .select('*')
        .eq('section_id', sectionId)
        .eq('role', 'student');

      if (error) {
        console.error('Students query error:', error);
      }

      return { data, error };
    }

    // No working Supabase client available
    console.error('No working Supabase client available for students');
    return { data: [], error: { message: 'Database connection not available' } };
  } catch (error) {
    console.error('Error fetching students:', error);
    return { data: [], error };
  }
}

// Handle login
async function handleLogin(event) {
  event.preventDefault();

  // If we already have a user from the parent window, skip login
  if (window.parentHasUser && window.currentUser) {
    currentUser = window.currentUser;
    window.UIController.showUserInfo(currentUser);
    window.UIController.showSection('intro-section');
    return;
  }

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
    // For testing purposes, allow a special login
    if (name === 'test' && passcode === 'test') {
      console.log('Using test login');

      // Create a dummy user
      const testUser = window.createDummyUser ? window.createDummyUser() : {
        id: 'test-id',
        name: 'Test User',
        role: 'student',
        section_id: null
      };

      // Set current user
      currentUser = testUser;

      // Store user in localStorage
      localStorage.setItem('investmentOdyssey_user', JSON.stringify(testUser));

      // Show user info
      window.UIController.showUserInfo(testUser);

      // Show introduction section
      window.UIController.showSection('intro-section');

      // Clear login form
      nameInput.value = '';
      passcodeInput.value = '';
      loginError.textContent = '';

      return;
    }

    // Try normal login
    const { data: profile, error } = await fetchProfile(name, passcode);

    if (error) {
      console.error('Profile fetch error:', error);
      loginError.textContent = 'Database connection error. Try again or use test/test to login.';
      return;
    }

    if (!profile) {
      loginError.textContent = 'Invalid name or passcode.';
      return;
    }

    // Try to update last_login timestamp if possible
    try {
      if (supabaseClient && typeof supabaseClient.from === 'function') {
        await supabaseClient
          .from('profiles')
          .update({ last_login: new Date().toISOString() })
          .eq('id', profile.id);
      }
    } catch (updateError) {
      console.warn('Could not update last_login:', updateError);
      // Non-critical error, continue with login
    }

    // Set current user
    currentUser = profile;

    // Store user in localStorage
    localStorage.setItem('investmentOdyssey_user', JSON.stringify(profile));

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
    loginError.textContent = 'An error occurred during login. Try again or use test/test to login.';
  }
}

// Handle logout
function handleLogout() {
  // Clear current user
  currentUser = null;

  // Remove stored user from localStorage
  localStorage.removeItem('investmentOdyssey_user');

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
async function startSinglePlayerGame() {
  try {
    // Set game mode
    gameMode = 'single';

    // Generate a unique game ID for this session
    gameId = 'single-' + currentUser.id + '-' + Date.now();
    console.log('Created single player game with ID:', gameId);

    // Initialize game state
    gameState = window.GameState.createInitialGameState();
    playerState = window.GameState.createInitialPlayerState();

    // Advance to first round
    gameState = window.GameState.advanceToNextRound(gameState);

    // Set max rounds
    window.UIController.elements.maxRounds.textContent = '20';

    // Setup trading interface
    window.UIController.setupPercentageButtons(gameState, playerState);
    window.UIController.setupInputSynchronization(gameState);

    // Update dashboard
    window.UIController.updateDashboard(gameState, playerState);

    // Save initial game state to database
    if (window.SupabaseIntegration && typeof window.SupabaseIntegration.saveGameState === 'function') {
      try {
        console.log('Saving initial single player game state to database');
        await window.SupabaseIntegration.saveGameState(gameId, currentUser.id, gameState);
        await window.SupabaseIntegration.savePlayerState(gameId, currentUser.id, playerState);
      } catch (saveError) {
        console.error('Error saving initial game state:', saveError);
        // Non-critical error, continue with game
      }
    } else {
      console.warn('Supabase integration not available, game will not be saved to database');
    }

    // Show game dashboard
    window.UIController.showSection('game-dashboard');

    // Show notification
    window.UIController.showNotification('Single player game started!', 'success');
  } catch (error) {
    console.error('Error starting single player game:', error);
    window.UIController.showNotification('Failed to start game: ' + error.message, 'error');
  }
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

    // Save player state to database
    if (gameId && window.SupabaseIntegration) {
      try {
        console.log('Saving player state after trade for game:', gameId);
        window.SupabaseIntegration.savePlayerState(gameId, currentUser.id, playerState);
      } catch (error) {
        console.error('Error saving player state after trade:', error);
      }
    } else {
      // Save to localStorage as fallback
      try {
        localStorage.setItem('investmentOdyssey_playerState', JSON.stringify(playerState));
      } catch (error) {
        console.error('Error saving to localStorage:', error);
      }
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

  // Save game state to database
  if (gameId && window.SupabaseIntegration) {
    try {
      console.log('Saving game state to database for game:', gameId);
      await window.SupabaseIntegration.saveGameState(gameId, currentUser.id, gameState);
      await window.SupabaseIntegration.savePlayerState(gameId, currentUser.id, playerState);

      // Update game session round if in class mode and user is an instructor
      if (gameMode === 'class' && currentUser.role === 'ta') {
        await window.SupabaseIntegration.updateGameSessionRound(gameId, gameState.roundNumber);
      }

    } catch (error) {
      console.error('Save game state error:', error);
      window.UIController.showNotification('Failed to save game state to database, but game will continue.', 'warning');
    }
  } else {
    // Save to localStorage as fallback
    try {
      localStorage.setItem('investmentOdyssey_gameState', JSON.stringify(gameState));
      localStorage.setItem('investmentOdyssey_playerState', JSON.stringify(playerState));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
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
    // Check if SupabaseIntegration is available
    if (!window.SupabaseIntegration || typeof window.SupabaseIntegration.getLeaderboard !== 'function') {
      console.warn('Leaderboard functionality not available');

      // Create dummy leaderboard data for display
      const dummyData = [
        { user_name: 'Player 1', final_value: 15000 },
        { user_name: 'Player 2', final_value: 12500 },
        { user_name: 'Player 3', final_value: 11000 }
      ];

      // Update leaderboard table with dummy data
      window.UIController.updateLeaderboardTable(dummyData);
      return;
    }

    let leaderboardData;

    if (gameMode === 'class' && sectionId) {
      // Get leaderboard for this section
      const { data, error } = await window.SupabaseIntegration.getLeaderboard('class', sectionId);

      if (error) {
        console.error('Leaderboard error:', error);
        throw new Error(error.message);
      }

      leaderboardData = data || [];
    } else {
      // Get global leaderboard
      const { data, error } = await window.SupabaseIntegration.getLeaderboard('single');

      if (error) {
        console.error('Leaderboard error:', error);
        throw new Error(error.message);
      }

      leaderboardData = data || [];
    }

    // Update leaderboard table
    window.UIController.updateLeaderboardTable(leaderboardData);

  } catch (error) {
    console.error('Load leaderboard error:', error);

    // Create dummy leaderboard data as fallback
    const dummyData = [
      { user_name: 'Player 1', final_value: 15000 },
      { user_name: 'Player 2', final_value: 12500 },
      { user_name: 'Player 3', final_value: 11000 }
    ];

    // Update leaderboard table with dummy data
    window.UIController.updateLeaderboardTable(dummyData);

    // Show notification
    window.UIController.showNotification('Using sample leaderboard data', 'info');
  }
}

// Handle submit score
async function handleSubmitScore() {
  if (!currentUser) return;

  try {
    // Check if SupabaseIntegration is available
    if (!window.SupabaseIntegration || typeof window.SupabaseIntegration.submitToLeaderboard !== 'function') {
      console.warn('Leaderboard submission not available');

      // Just disable the button and show a notification
      window.UIController.elements.submitScoreBtn.disabled = true;
      window.UIController.showNotification('Score saved locally!', 'success');

      // Save to localStorage as fallback
      const leaderboardEntry = {
        user_name: currentUser.name,
        game_mode: gameMode,
        final_value: playerState.totalValue,
        timestamp: new Date().toISOString()
      };

      // Get existing entries or initialize empty array
      const existingEntries = JSON.parse(localStorage.getItem('investmentOdyssey_leaderboard') || '[]');
      existingEntries.push(leaderboardEntry);
      localStorage.setItem('investmentOdyssey_leaderboard', JSON.stringify(existingEntries));

      return;
    }

    // Submit to online leaderboard
    console.log('Submitting score to leaderboard:', {
      userId: currentUser.id,
      userName: currentUser.name,
      gameMode,
      gameId,
      sectionId,
      finalValue: playerState.totalValue
    });

    const { data, error } = await window.SupabaseIntegration.submitToLeaderboard(
      currentUser.id,
      currentUser.name,
      gameMode,
      gameId,
      sectionId,
      playerState.totalValue
    );

    if (error) {
      console.error('Error submitting score to leaderboard:', error);
      throw new Error(error.message || 'Failed to submit score');
    }

    console.log('Score submitted successfully:', data);

    // Reload leaderboard
    await loadLeaderboard();

    // Disable submit button
    window.UIController.elements.submitScoreBtn.disabled = true;

    // Show notification
    window.UIController.showNotification('Score submitted to leaderboard!', 'success');

  } catch (error) {
    console.error('Submit score error:', error);

    // Save to localStorage as fallback
    const leaderboardEntry = {
      user_name: currentUser.name,
      game_mode: gameMode,
      final_value: playerState.totalValue,
      timestamp: new Date().toISOString()
    };

    // Get existing entries or initialize empty array
    const existingEntries = JSON.parse(localStorage.getItem('investmentOdyssey_leaderboard') || '[]');
    existingEntries.push(leaderboardEntry);
    localStorage.setItem('investmentOdyssey_leaderboard', JSON.stringify(existingEntries));

    // Disable submit button
    window.UIController.elements.submitScoreBtn.disabled = true;

    // Show notification
    window.UIController.showNotification('Score saved locally!', 'info');
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
    if (window.SupabaseIntegration && typeof window.SupabaseIntegration.updateGameSessionActive === 'function') {
      const { error } = await window.SupabaseIntegration.updateGameSessionActive(gameId, false);
      if (error) {
        console.error('Error deactivating game session:', error);
      }
    } else if (window.supabase) {
      const { error } = await window.supabase
        .from('game_sessions')
        .update({ active: false })
        .eq('id', gameId);
      if (error) {
        console.error('Error deactivating game session:', error);
      }
    } else {
      console.error('No Supabase client available');
    }

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
