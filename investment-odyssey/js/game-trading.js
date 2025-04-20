/**
 * Investment Odyssey - Game Trading
 * Handles trading functionality and game flow
 */

// Initialize game
function initializeGame() {
  // Reset game state and player state
  gameState = new GameState();
  playerState = new PlayerState();
  
  // Initialize UI
  gameUI.initGameUI();
  
  // Show game interface
  document.getElementById('game-dashboard').classList.add('d-none');
  document.getElementById('game-interface').classList.remove('d-none');
  
  // Add event listeners
  setupEventListeners();
}

// Set up event listeners for game controls
function setupEventListeners() {
  // Trade form submission
  const tradeForm = document.getElementById('trade-form');
  tradeForm.addEventListener('submit', handleTrade);
  
  // Next round button
  const nextRoundBtn = document.getElementById('next-round-btn');
  nextRoundBtn.addEventListener('click', handleNextRound);
  
  // End game button
  const endGameBtn = document.getElementById('end-game-btn');
  endGameBtn.addEventListener('click', handleEndGame);
  
  // Play again button
  const playAgainBtn = document.getElementById('play-again-btn');
  playAgainBtn.addEventListener('click', handlePlayAgain);
  
  // Asset select change - update price display
  const assetSelect = document.getElementById('asset-select');
  assetSelect.addEventListener('change', updateTradeFormPriceDisplay);
  
  // Action select change - update validation
  const actionSelect = document.getElementById('action-select');
  actionSelect.addEventListener('change', updateTradeFormValidation);
}

// Handle trade form submission
function handleTrade(event) {
  event.preventDefault();
  
  const assetSelect = document.getElementById('asset-select');
  const actionSelect = document.getElementById('action-select');
  const amountInput = document.getElementById('amount-input');
  
  const asset = assetSelect.value;
  const action = actionSelect.value;
  const amount = parseFloat(amountInput.value);
  
  if (!asset || !action || isNaN(amount) || amount <= 0) {
    showNotification('Please fill in all fields correctly', 'danger');
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
    showNotification(result.message, 'success');
    
    // Reset form
    amountInput.value = '';
  } else {
    // Show error notification
    showNotification(result.message, 'danger');
  }
}

// Handle next round button click
function handleNextRound() {
  // Generate new prices
  const { prices, changes } = gameState.nextRound();
  
  // Update portfolio value history
  playerState.updatePortfolioHistory(prices);
  
  // Check for cash injection (income)
  const cashInjection = gameState.generateCashInjection(playerState);
  if (cashInjection > 0) {
    playerState.addCash(cashInjection);
    showNotification(`You received income of $${gameUI.formatCurrency(cashInjection)}`, 'info');
  }
  
  // Update UI
  gameUI.updateRoundDisplay();
  gameUI.updatePortfolioDisplay();
  gameUI.updateMarketDisplay(changes);
  
  // Check if game is over
  if (gameState.isGameOver()) {
    handleEndGame();
  }
}

// Handle end game button click
function handleEndGame() {
  // Calculate final portfolio value
  const finalValue = playerState.calculatePortfolioValue(gameState.assetPrices);
  
  // Show game end modal
  gameUI.showGameEndModal();
  
  // Disable game controls
  document.getElementById('next-round-btn').disabled = true;
  document.getElementById('end-game-btn').disabled = true;
  document.getElementById('trade-form').querySelectorAll('input, select, button').forEach(el => {
    el.disabled = true;
  });
}

// Handle play again button click
function handlePlayAgain() {
  // Hide modal
  const gameEndModal = bootstrap.Modal.getInstance(document.getElementById('game-end-modal'));
  gameEndModal.hide();
  
  // Initialize new game
  initializeGame();
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

// Show notification
function showNotification(message, type) {
  // Create notification element
  const notification = document.createElement('div');
  notification.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
  notification.style.top = '20px';
  notification.style.right = '20px';
  notification.style.zIndex = '1050';
  notification.innerHTML = `
    ${message}
    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
  `;
  
  // Add to document
  document.body.appendChild(notification);
  
  // Auto-dismiss after 3 seconds
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => {
      notification.remove();
    }, 300);
  }, 3000);
}

// Start single player game
function startSinglePlayerGame() {
  // Hide dashboard, show game interface
  document.getElementById('game-dashboard').classList.add('d-none');
  document.getElementById('game-interface').classList.remove('d-none');
  
  // Initialize game
  initializeGame();
}

// Export functions for use in other modules
if (typeof window !== 'undefined') {
  window.gameFunctions = {
    initializeGame,
    startSinglePlayerGame,
    showNotification
  };
}
