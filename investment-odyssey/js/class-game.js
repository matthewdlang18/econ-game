/**
 * Investment Odyssey - Class Game
 * Handles class game functionality and real-time updates
 */

// DOM Elements
const classGameJoin = document.getElementById('class-game-join');
const classGameInterface = document.getElementById('class-game-interface');
const sectionInfo = document.getElementById('section-info');
const gameList = document.getElementById('game-list');
const availableGames = document.getElementById('available-games');
const noGamesMessage = document.getElementById('no-games-message');
const gameStatus = document.getElementById('game-status');
const userInfo = document.getElementById('user-info');
const userName = document.getElementById('user-name');
const logoutBtn = document.getElementById('logout-btn');
const classRankings = document.getElementById('class-rankings');

// Current user profile and game
let currentProfile = null;
let currentGame = null;
let gameSubscription = null;
let rankingsSubscription = null;

// Check if user is logged in and has a section
async function checkAuth() {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) {
      // No active session, redirect to login
      window.location.href = 'index.html';
      return;
    }
    
    // Get user profile from profiles table
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();
    
    if (profileError || !profile) {
      console.error('Error fetching profile:', profileError);
      window.location.href = 'index.html';
      return;
    }
    
    // Update user info
    userName.textContent = profile.name;
    userInfo.classList.remove('d-none');
    
    // Store current profile
    currentProfile = profile;
    
    // Check if user has a section
    if (!profile.section_id) {
      // No section selected, show message
      sectionInfo.classList.remove('d-none');
      gameList.classList.add('d-none');
      return;
    }
    
    // User has a section, show available games
    sectionInfo.classList.add('d-none');
    gameList.classList.remove('d-none');
    
    // Load available games
    loadAvailableGames(profile.section_id);
  } catch (err) {
    console.error('Auth check error:', err);
    window.location.href = 'index.html';
  }
}

// Load available games for section
async function loadAvailableGames(sectionId) {
  try {
    // Fetch active games for section
    const { data, error } = await supabase
      .from('games')
      .select('*, profiles:creator_id(name)')
      .eq('section_id', sectionId)
      .eq('status', 'in_progress');
    
    if (error) {
      console.error('Error fetching games:', error);
      return;
    }
    
    if (!data || data.length === 0) {
      // No active games
      availableGames.innerHTML = '';
      noGamesMessage.classList.remove('d-none');
      return;
    }
    
    // Hide no games message
    noGamesMessage.classList.add('d-none');
    
    // Render available games
    availableGames.innerHTML = data.map(game => {
      const taName = game.profiles ? game.profiles.name : 'Unknown';
      const date = new Date(game.created_at).toLocaleDateString();
      
      return `
        <a href="#" class="list-group-item list-group-item-action" data-game-id="${game.id}">
          <div class="d-flex w-100 justify-content-between">
            <h5 class="mb-1">Class Game (Round ${game.current_round}/${game.max_rounds})</h5>
            <small>${date}</small>
          </div>
          <p class="mb-1">TA: ${taName}</p>
          <small>Click to join this game</small>
        </a>
      `;
    }).join('');
    
    // Add event listeners to game items
    document.querySelectorAll('[data-game-id]').forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const gameId = item.getAttribute('data-game-id');
        joinGame(gameId);
      });
    });
    
    // Check if player is already in a game
    checkExistingGame(sectionId);
  } catch (err) {
    console.error('Error loading available games:', err);
  }
}

// Check if player is already in a game
async function checkExistingGame(sectionId) {
  try {
    // Fetch player's active game state
    const { data, error } = await supabase
      .from('player_states')
      .select('*, games(*)')
      .eq('user_id', currentProfile.id)
      .eq('games.status', 'in_progress')
      .order('created_at', { ascending: false })
      .maybeSingle();
    
    if (error) {
      console.error('Error checking existing game:', error);
      return;
    }
    
    if (!data) {
      // No active game
      return;
    }
    
    // Player is already in a game, join it
    joinGame(data.game_id, true);
  } catch (err) {
    console.error('Error checking existing game:', err);
  }
}

// Join a class game
async function joinGame(gameId, resuming = false) {
  try {
    // Fetch game details
    const { data: game, error: gameError } = await supabase
      .from('games')
      .select('*')
      .eq('id', gameId)
      .maybeSingle();
    
    if (gameError || !game) {
      console.error('Error fetching game:', gameError);
      return;
    }
    
    // Store current game
    currentGame = game;
    
    // Check if player already has a state for this game
    const { data: existingState, error: stateError } = await supabase
      .from('player_states')
      .select('*')
      .eq('game_id', gameId)
      .eq('user_id', currentProfile.id)
      .maybeSingle();
    
    if (stateError) {
      console.error('Error checking player state:', stateError);
      return;
    }
    
    let playerStateId;
    
    if (!existingState) {
      // Create new player state
      const { data: newState, error: createError } = await supabase
        .from('player_states')
        .insert({
          game_id: gameId,
          user_id: currentProfile.id,
          round_number: game.current_round,
          cash: 10000,
          portfolio: {
            sp500: 0,
            bonds: 0,
            real_estate: 0,
            gold: 0,
            commodities: 0,
            bitcoin: 0
          },
          portfolio_value: 10000,
          portfolio_history: [10000],
          trade_history: [],
          created_at: new Date().toISOString()
        })
        .select()
        .maybeSingle();
      
      if (createError) {
        console.error('Error creating player state:', createError);
        return;
      }
      
      playerStateId = newState.id;
    } else {
      playerStateId = existingState.id;
    }
    
    // Hide join section, show game interface
    classGameJoin.classList.add('d-none');
    classGameInterface.classList.remove('d-none');
    
    // Initialize game state
    initializeClassGame(game, existingState || { 
      cash: 10000,
      portfolio: {
        sp500: 0,
        bonds: 0,
        real_estate: 0,
        gold: 0,
        commodities: 0,
        bitcoin: 0
      },
      portfolio_value: 10000,
      portfolio_history: [10000],
      trade_history: []
    });
    
    // Subscribe to game updates
    subscribeToGameUpdates(gameId);
    
    // Subscribe to rankings updates
    subscribeToRankingsUpdates(gameId);
    
    // Show appropriate message
    if (resuming) {
      gameFunctions.showNotification('Resumed your active game', 'info');
    } else {
      gameFunctions.showNotification('Joined class game successfully', 'success');
    }
  } catch (err) {
    console.error('Error joining game:', err);
  }
}

// Initialize class game
function initializeClassGame(game, playerStateData) {
  // Create game state
  gameState = new GameState(game.max_rounds);
  gameState.roundNumber = game.current_round;
  
  // Fetch current game round data
  fetchGameRoundData(game.id, game.current_round);
  
  // Create player state
  playerState = new PlayerState(playerStateData.cash);
  playerState.portfolio = playerStateData.portfolio;
  playerState.tradeHistory = playerStateData.trade_history;
  playerState.portfolioValueHistory = playerStateData.portfolio_history;
  
  // Update game status
  updateGameStatus(game);
  
  // Initialize UI
  gameUI.initGameUI();
  
  // Set up event listeners
  setupClassGameEventListeners();
  
  // Load class rankings
  loadClassRankings(game.id);
}

// Fetch game round data
async function fetchGameRoundData(gameId, roundNumber) {
  try {
    // Fetch round data
    const { data, error } = await supabase
      .from('game_rounds')
      .select('*')
      .eq('game_id', gameId)
      .eq('round_number', roundNumber)
      .maybeSingle();
    
    if (error) {
      console.error('Error fetching round data:', error);
      return;
    }
    
    if (!data) {
      console.error('No round data found');
      return;
    }
    
    // Update game state with round data
    gameState.assetPrices = data.asset_prices;
    gameState.priceHistory = data.price_history;
    gameState.cpi = data.cpi;
    gameState.cpiHistory = data.cpi_history;
    
    // Update UI
    gameUI.updateRoundDisplay();
    gameUI.updatePortfolioDisplay();
    gameUI.updateMarketDisplay();
  } catch (err) {
    console.error('Error fetching round data:', err);
  }
}

// Update game status display
function updateGameStatus(game) {
  if (game.current_round === 0) {
    gameStatus.innerHTML = 'Waiting for TA to start the game...';
    gameStatus.className = 'alert alert-info mb-4';
    
    // Disable trading
    document.getElementById('trade-form').querySelectorAll('input, select, button').forEach(el => {
      el.disabled = true;
    });
  } else if (game.status === 'completed') {
    gameStatus.innerHTML = 'Game has ended. Final results are displayed.';
    gameStatus.className = 'alert alert-success mb-4';
    
    // Disable trading
    document.getElementById('trade-form').querySelectorAll('input, select, button').forEach(el => {
      el.disabled = true;
    });
    
    // Show game end modal
    gameUI.showGameEndModal();
  } else {
    gameStatus.innerHTML = `Round ${game.current_round} of ${game.max_rounds}. Make your trades!`;
    gameStatus.className = 'alert alert-primary mb-4';
    
    // Enable trading
    document.getElementById('trade-form').querySelectorAll('input, select, button').forEach(el => {
      el.disabled = false;
    });
  }
}

// Set up event listeners for class game
function setupClassGameEventListeners() {
  // Trade form submission
  const tradeForm = document.getElementById('trade-form');
  tradeForm.addEventListener('submit', handleClassGameTrade);
  
  // Asset select change - update price display
  const assetSelect = document.getElementById('asset-select');
  assetSelect.addEventListener('change', updateTradeFormPriceDisplay);
  
  // Action select change - update validation
  const actionSelect = document.getElementById('action-select');
  actionSelect.addEventListener('change', updateTradeFormValidation);
}

// Handle trade form submission for class game
async function handleClassGameTrade(event) {
  event.preventDefault();
  
  const assetSelect = document.getElementById('asset-select');
  const actionSelect = document.getElementById('action-select');
  const amountInput = document.getElementById('amount-input');
  
  const asset = assetSelect.value;
  const action = actionSelect.value;
  const amount = parseFloat(amountInput.value);
  
  if (!asset || !action || isNaN(amount) || amount <= 0) {
    gameFunctions.showNotification('Please fill in all fields correctly', 'danger');
    return;
  }
  
  // Execute trade
  const result = playerState.executeTrade(
    asset,
    action,
    amount,
    gameState.assetPrices[asset]
  );
  
  if (result.success) {
    // Update UI
    gameUI.updatePortfolioDisplay();
    gameUI.updateTradeHistory();
    
    // Show success notification
    gameFunctions.showNotification(result.message, 'success');
    
    // Reset form
    amountInput.value = '';
    
    // Save player state to database
    savePlayerState();
  } else {
    // Show error notification
    gameFunctions.showNotification(result.message, 'danger');
  }
}

// Update trade form price display when asset is selected
function updateTradeFormPriceDisplay() {
  const assetSelect = document.getElementById('asset-select');
  const asset = assetSelect.value;
  
  if (asset) {
    const amountInput = document.getElementById('amount-input');
    amountInput.placeholder = `Current Price: $${gameUI.formatCurrency(gameState.assetPrices[asset])}`;
  }
}

// Update trade form validation based on action
function updateTradeFormValidation() {
  const assetSelect = document.getElementById('asset-select');
  const actionSelect = document.getElementById('action-select');
  const amountInput = document.getElementById('amount-input');
  
  const asset = assetSelect.value;
  const action = actionSelect.value;
  
  if (asset && action) {
    if (action === 'buy') {
      // For buy, max amount is cash
      amountInput.max = playerState.cash;
    } else if (action === 'sell') {
      // For sell, max amount is value of asset holdings
      const maxAmount = playerState.portfolio[asset] * gameState.assetPrices[asset];
      amountInput.max = maxAmount;
    }
  }
}

// Save player state to database
async function savePlayerState() {
  try {
    // Calculate portfolio value
    const portfolioValue = playerState.calculatePortfolioValue(gameState.assetPrices);
    
    // Update player state in database
    const { error } = await supabase
      .from('player_states')
      .update({
        round_number: gameState.roundNumber,
        cash: playerState.cash,
        portfolio: playerState.portfolio,
        portfolio_value: portfolioValue,
        portfolio_history: playerState.portfolioValueHistory,
        trade_history: playerState.tradeHistory
      })
      .eq('game_id', currentGame.id)
      .eq('user_id', currentProfile.id);
    
    if (error) {
      console.error('Error saving player state:', error);
    }
  } catch (err) {
    console.error('Error saving player state:', err);
  }
}

// Load class rankings
async function loadClassRankings(gameId) {
  try {
    // Fetch player states for this game
    const { data, error } = await supabase
      .from('player_states')
      .select('*, profiles:user_id(name)')
      .eq('game_id', gameId)
      .order('portfolio_value', { ascending: false });
    
    if (error) {
      console.error('Error fetching rankings:', error);
      return;
    }
    
    if (!data || data.length === 0) {
      classRankings.innerHTML = '<tr><td colspan="3">No participants yet</td></tr>';
      return;
    }
    
    // Render rankings
    classRankings.innerHTML = data.map((player, index) => {
      const playerName = player.profiles ? player.profiles.name : 'Unknown';
      const rankClass = index < 3 ? `rank-${index + 1}` : '';
      const isCurrentPlayer = player.user_id === currentProfile.id ? 'table-active' : '';
      
      return `
        <tr class="${isCurrentPlayer}">
          <td class="${rankClass}">${index + 1}</td>
          <td>${playerName}</td>
          <td>$${gameUI.formatCurrency(player.portfolio_value)}</td>
        </tr>
      `;
    }).join('');
  } catch (err) {
    console.error('Error loading rankings:', err);
  }
}

// Subscribe to game updates
function subscribeToGameUpdates(gameId) {
  // Unsubscribe from previous subscription if exists
  if (gameSubscription) {
    supabase.removeSubscription(gameSubscription);
  }
  
  // Subscribe to game updates
  gameSubscription = supabase
    .channel('game-updates')
    .on('postgres_changes', {
      event: 'UPDATE',
      schema: 'public',
      table: 'games',
      filter: `id=eq.${gameId}`
    }, handleGameUpdate)
    .on('postgres_changes', {
      event: 'UPDATE',
      schema: 'public',
      table: 'game_rounds',
      filter: `game_id=eq.${gameId}`
    }, handleRoundUpdate)
    .subscribe();
}

// Handle game update
function handleGameUpdate(payload) {
  const updatedGame = payload.new;
  
  // Update current game
  currentGame = updatedGame;
  
  // Check if round changed
  if (updatedGame.current_round !== gameState.roundNumber) {
    // Round advanced, fetch new round data
    gameState.roundNumber = updatedGame.current_round;
    fetchGameRoundData(updatedGame.id, updatedGame.current_round);
    
    // Show notification
    gameFunctions.showNotification(`Round advanced to ${updatedGame.current_round}`, 'info');
  }
  
  // Check if game ended
  if (updatedGame.status === 'completed' && currentGame.status !== 'completed') {
    // Game ended, show game end modal
    gameUI.showGameEndModal();
    
    // Show notification
    gameFunctions.showNotification('Game has ended', 'info');
  }
  
  // Update game status
  updateGameStatus(updatedGame);
}

// Handle round update
function handleRoundUpdate(payload) {
  const updatedRound = payload.new;
  
  // Check if this is the current round
  if (updatedRound.round_number === gameState.roundNumber) {
    // Update game state with round data
    gameState.assetPrices = updatedRound.asset_prices;
    gameState.priceHistory = updatedRound.price_history;
    gameState.cpi = updatedRound.cpi;
    gameState.cpiHistory = updatedRound.cpi_history;
    
    // Update UI
    gameUI.updatePortfolioDisplay();
    gameUI.updateMarketDisplay();
  }
}

// Subscribe to rankings updates
function subscribeToRankingsUpdates(gameId) {
  // Unsubscribe from previous subscription if exists
  if (rankingsSubscription) {
    supabase.removeSubscription(rankingsSubscription);
  }
  
  // Subscribe to player state updates
  rankingsSubscription = supabase
    .channel('rankings-updates')
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'player_states',
      filter: `game_id=eq.${gameId}`
    }, () => loadClassRankings(gameId))
    .subscribe();
}

// Handle logout button click
logoutBtn.addEventListener('click', async () => {
  try {
    // Sign out from Supabase Auth
    await supabase.auth.signOut();
    
    // Redirect to login
    window.location.href = 'index.html';
  } catch (err) {
    console.error('Logout error:', err);
  }
});

// Initialize class game page
document.addEventListener('DOMContentLoaded', () => {
  // Check authentication status
  checkAuth();
});
