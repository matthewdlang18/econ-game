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
        const parsedUserData = JSON.parse(userData);
        // Initialize user data
        window.gameSupabase.initializeUser(parsedUserData);
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

  // Get initial game state
  gameState = await window.gameSupabase.getGameState(gameSession.id, 0);
  if (!gameState) {
    alert('Failed to initialize game state. Please try again.');
    return;
  }

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
  // Calculate portfolio value
  const portfolioValue = calculatePortfolioValue();
  const totalValue = playerState.cash + portfolioValue;

  // Update player state with new total value
  playerState.total_value = totalValue;

  // Create asset rows for the table
  let assetRows = '';
  for (const asset in gameState.asset_prices) {
    const price = gameState.asset_prices[asset];
    const quantity = playerState.portfolio[asset] || 0;
    const value = price * quantity;
    const percentOfPortfolio = totalValue > 0 ? (value / totalValue * 100) : 0;

    // Get price history for this asset
    const priceHistory = gameState.price_history[asset];
    let priceChange = 0;
    let priceChangePercent = 0;

    if (priceHistory.length > 1) {
      const previousPrice = priceHistory[priceHistory.length - 2];
      priceChange = price - previousPrice;
      priceChangePercent = (priceChange / previousPrice) * 100;
    }

    // Determine if price went up or down
    const priceDirection = priceChange >= 0 ? 'up' : 'down';

    assetRows += `
      <tr data-asset="${asset}">
        <td>${asset}</td>
        <td>$${price.toFixed(2)}</td>
        <td class="${priceDirection}">${priceChange >= 0 ? '+' : ''}${priceChangePercent.toFixed(2)}%</td>
        <td>${quantity.toFixed(2)}</td>
        <td>$${value.toFixed(2)}</td>
        <td>${percentOfPortfolio.toFixed(2)}%</td>
        <td>
          <button class="trade-btn buy" data-asset="${asset}">Buy</button>
          <button class="trade-btn sell" data-asset="${asset}" ${quantity <= 0 ? 'disabled' : ''}>Sell</button>
        </td>
      </tr>
    `;
  }

  // Create the game interface
  gameScreen.innerHTML = `
    <div class="game-header">
      <h2>Investment Odyssey Game</h2>
      <div class="game-info">
        <span>Round: ${currentRound} / ${gameSession.max_rounds}</span>
        <span>Cash: $${playerState.cash.toFixed(2)}</span>
        <span>Portfolio Value: $${portfolioValue.toFixed(2)}</span>
        <span>Total Value: $${totalValue.toFixed(2)}</span>
      </div>
    </div>

    <div class="game-content">
      <div class="game-grid">
        <div class="market-panel">
          <h3>Market</h3>
          <table class="asset-table">
            <thead>
              <tr>
                <th>Asset</th>
                <th>Price</th>
                <th>Change</th>
                <th>Quantity</th>
                <th>Value</th>
                <th>% of Portfolio</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${assetRows}
            </tbody>
          </table>
        </div>

        <div class="trade-panel" style="display: none;">
          <h3>Trade <span id="trade-asset-name"></span></h3>
          <div class="trade-form">
            <div class="form-group">
              <label for="trade-action">Action:</label>
              <select id="trade-action">
                <option value="buy">Buy</option>
                <option value="sell">Sell</option>
              </select>
            </div>

            <div class="form-group">
              <label for="trade-quantity">Quantity:</label>
              <input type="number" id="trade-quantity" min="0" step="0.01" value="1">
            </div>

            <div class="form-group">
              <label for="trade-total">Total:</label>
              <span id="trade-total">$0.00</span>
            </div>

            <div class="trade-buttons">
              <button id="execute-trade-btn" class="primary-btn">Execute Trade</button>
              <button id="cancel-trade-btn" class="secondary-btn">Cancel</button>
            </div>
          </div>
        </div>
      </div>

      <div class="game-actions">
        <button id="next-round-btn" class="primary-btn">Next Round</button>
        <button id="back-to-welcome" class="secondary-btn">Exit Game</button>
      </div>
    </div>
  `;

  // Add event listeners for trading
  document.querySelectorAll('.trade-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const asset = btn.getAttribute('data-asset');
      const action = btn.classList.contains('buy') ? 'buy' : 'sell';
      showTradePanel(asset, action);
    });
  });

  // Add event listener for the next round button
  document.getElementById('next-round-btn').addEventListener('click', advanceToNextRound);

  // Add event listener for the back button
  document.getElementById('back-to-welcome').addEventListener('click', () => {
    if (confirm('Are you sure you want to exit the game? Your progress will be saved.')) {
      gameScreen.style.display = 'none';
      welcomeScreen.style.display = 'block';
    }
  });
}

// Show the trade panel for a specific asset
function showTradePanel(asset, action) {
  const tradePanel = document.querySelector('.trade-panel');
  const marketPanel = document.querySelector('.market-panel');
  const assetName = document.getElementById('trade-asset-name');
  const tradeAction = document.getElementById('trade-action');
  const tradeQuantity = document.getElementById('trade-quantity');
  const tradeTotal = document.getElementById('trade-total');

  // Set the asset name and action
  assetName.textContent = asset;
  tradeAction.value = action;

  // Show the trade panel
  tradePanel.style.display = 'block';
  marketPanel.style.width = '60%';

  // Calculate and display the total
  updateTradeTotal();

  // Add event listeners for the trade form
  tradeAction.addEventListener('change', updateTradeTotal);
  tradeQuantity.addEventListener('input', updateTradeTotal);

  // Add event listeners for the trade buttons
  document.getElementById('execute-trade-btn').addEventListener('click', executeTrade);
  document.getElementById('cancel-trade-btn').addEventListener('click', hideTradePanel);

  // Function to update the trade total
  function updateTradeTotal() {
    const quantity = parseFloat(tradeQuantity.value) || 0;
    const price = gameState.asset_prices[asset];
    const total = quantity * price;

    tradeTotal.textContent = `$${total.toFixed(2)}`;

    // Disable the execute button if the quantity is invalid
    const executeBtn = document.getElementById('execute-trade-btn');

    if (tradeAction.value === 'buy') {
      executeBtn.disabled = total > playerState.cash || quantity <= 0;
    } else { // sell
      const currentQuantity = playerState.portfolio[asset] || 0;
      executeBtn.disabled = quantity > currentQuantity || quantity <= 0;
    }
  }

  // Function to execute the trade
  async function executeTrade() {
    const quantity = parseFloat(tradeQuantity.value) || 0;
    const price = gameState.asset_prices[asset];
    const total = quantity * price;

    if (tradeAction.value === 'buy') {
      // Check if player has enough cash
      if (total > playerState.cash) {
        alert('Not enough cash to complete this purchase.');
        return;
      }

      // Update player state
      playerState.cash -= total;
      playerState.portfolio[asset] = (playerState.portfolio[asset] || 0) + quantity;

      // Add to trade history
      playerState.trade_history.push({
        asset: asset,
        action: 'buy',
        quantity: quantity,
        price: price,
        total: total,
        round: currentRound,
        timestamp: new Date().toISOString()
      });
    } else { // sell
      const currentQuantity = playerState.portfolio[asset] || 0;

      // Check if player has enough of the asset
      if (quantity > currentQuantity) {
        alert('Not enough assets to complete this sale.');
        return;
      }

      // Update player state
      playerState.cash += total;
      playerState.portfolio[asset] -= quantity;

      // Remove asset from portfolio if quantity is 0
      if (playerState.portfolio[asset] <= 0) {
        delete playerState.portfolio[asset];
      }

      // Add to trade history
      playerState.trade_history.push({
        asset: asset,
        action: 'sell',
        quantity: quantity,
        price: price,
        total: total,
        round: currentRound,
        timestamp: new Date().toISOString()
      });
    }

    // Calculate new portfolio value
    const portfolioValue = calculatePortfolioValue();
    playerState.total_value = playerState.cash + portfolioValue;

    // Update portfolio value history
    playerState.portfolio_value_history.push(playerState.total_value);

    // Save player state to Supabase
    const updated = await window.gameSupabase.updatePlayerState(gameSession.id, playerState);
    if (!updated) {
      alert('Failed to save your trade. Please try again.');
      return;
    }

    // Hide the trade panel and reload the interface
    hideTradePanel();
    loadGameInterface();
  }

  // Function to hide the trade panel
  function hideTradePanel() {
    tradePanel.style.display = 'none';
    marketPanel.style.width = '100%';
  }
}

// Calculate the total value of the player's portfolio
function calculatePortfolioValue() {
  let portfolioValue = 0;

  for (const asset in playerState.portfolio) {
    const quantity = playerState.portfolio[asset];
    const price = gameState.asset_prices[asset];
    portfolioValue += quantity * price;
  }

  return portfolioValue;
}

// Advance to the next round
async function advanceToNextRound() {
  // Create the next round's game state
  const nextGameState = await window.gameSupabase.createNextRoundState(gameSession.id, gameState);

  // Check if the game is over
  if (nextGameState && nextGameState.gameOver) {
    // Complete the game and show results
    const completed = await window.gameSupabase.completeGame(gameSession.id);
    if (!completed) {
      alert('Failed to complete the game. Please try again.');
      return;
    }

    // Show game results
    showGameResults();
    return;
  }

  if (!nextGameState) {
    alert('Failed to advance to the next round. Please try again.');
    return;
  }

  // Update game state and round number
  gameState = nextGameState;
  currentRound = gameState.round_number;

  // Reload the game interface
  loadGameInterface();
}

// Show game results
function showGameResults() {
  // Calculate final portfolio value
  const portfolioValue = calculatePortfolioValue();
  const totalValue = playerState.cash + portfolioValue;

  // Create a summary of the player's performance
  const initialValue = 10000; // Starting cash
  const totalReturn = totalValue - initialValue;
  const percentReturn = (totalReturn / initialValue) * 100;

  // Create the results screen
  gameScreen.innerHTML = `
    <div class="game-header">
      <h2>Game Complete!</h2>
    </div>

    <div class="game-content results-screen">
      <h3>Your Investment Results</h3>

      <div class="results-summary">
        <div class="result-item">
          <span class="result-label">Initial Investment:</span>
          <span class="result-value">$${initialValue.toFixed(2)}</span>
        </div>

        <div class="result-item">
          <span class="result-label">Final Portfolio Value:</span>
          <span class="result-value">$${totalValue.toFixed(2)}</span>
        </div>

        <div class="result-item">
          <span class="result-label">Total Return:</span>
          <span class="result-value ${totalReturn >= 0 ? 'positive' : 'negative'}">$${totalReturn.toFixed(2)} (${percentReturn.toFixed(2)}%)</span>
        </div>
      </div>

      <div class="results-actions">
        <button id="play-again-btn" class="primary-btn">Play Again</button>
        <button id="back-to-welcome" class="secondary-btn">Back to Welcome Screen</button>
      </div>
    </div>
  `;

  // Add event listeners for the buttons
  document.getElementById('play-again-btn').addEventListener('click', startSinglePlayerGame);
  document.getElementById('back-to-welcome').addEventListener('click', () => {
    gameScreen.style.display = 'none';
    welcomeScreen.style.display = 'block';
  });
}
