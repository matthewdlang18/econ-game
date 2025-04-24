// Investment Odyssey Game Logic

// Game state variables
let playerState = null;
let gameState = null;

// Asset information for educational purposes
const assetInfo = {
  'S&P 500': {
    description: 'A stock market index tracking the performance of 500 large companies listed on stock exchanges in the United States.',
    risk: 'Medium',
    expectedReturn: 'Medium-High',
    volatility: 'Medium',
    correlations: 'Negative correlation with bonds, positive with real estate and Bitcoin.'
  },
  'Bonds': {
    description: 'Debt securities issued by governments and corporations to raise capital.',
    risk: 'Low',
    expectedReturn: 'Low',
    volatility: 'Low',
    correlations: 'Negative correlation with stocks, low correlation with other assets.'
  },
  'Real Estate': {
    description: 'Property consisting of land and buildings, often represented through REITs (Real Estate Investment Trusts).',
    risk: 'Medium',
    expectedReturn: 'Medium',
    volatility: 'Medium-Low',
    correlations: 'Positive correlation with stocks, negative with gold.'
  },
  'Gold': {
    description: 'Precious metal often used as a store of value and hedge against inflation.',
    risk: 'Medium',
    expectedReturn: 'Medium',
    volatility: 'Medium-High',
    correlations: 'Negative correlation with real estate and Bitcoin, low correlation with stocks.'
  },
  'Commodities': {
    description: 'Raw materials or primary agricultural products that can be bought and sold.',
    risk: 'Medium-High',
    expectedReturn: 'Medium',
    volatility: 'Medium-High',
    correlations: 'Low correlation with most assets.'
  },
  'Bitcoin': {
    description: 'A decentralized digital currency without a central bank or administrator.',
    risk: 'Very High',
    expectedReturn: 'High',
    volatility: 'Very High',
    correlations: 'Positive correlation with stocks, negative with gold and bonds.'
  }
};

// DOM Elements will be queried upon DOMContentLoaded
// (buttons may not exist until welcome screen is rendered)
const welcomeScreen = document.getElementById('welcome-screen');
const gameScreen = document.getElementById('game-screen');

// Initialize the game
document.addEventListener('DOMContentLoaded', () => {
  // Query buttons and set up event listeners
  const singlePlayerBtn = document.getElementById('single-player-btn');
  const classModeBtn = document.getElementById('class-mode-btn');
  if (singlePlayerBtn) singlePlayerBtn.addEventListener('click', startSinglePlayerGame);
  if (classModeBtn) classModeBtn.addEventListener('click', joinClassGame);

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

// Show a prominent cash injection notification
function showCashInjectionNotification(amount) {
  // Create a special notification for cash injections
  const cashNotification = document.createElement('div');
  cashNotification.className = 'cash-injection-notification';
  cashNotification.innerHTML = `
    <div class="cash-injection-header">Cash Injection Received!</div>
    <div class="cash-injection-amount">+$${amount.toFixed(2)}</div>
    <div class="cash-injection-message">This cash has been added to your account.</div>
  `;

  // Add to the game screen
  const gameContent = document.querySelector('.game-content');
  if (gameContent) {
    // Position it
    cashNotification.style.position = 'absolute';
    cashNotification.style.top = '50%';
    cashNotification.style.left = '50%';
    cashNotification.style.transform = 'translate(-50%, -50%)';
    cashNotification.style.backgroundColor = 'rgba(40, 167, 69, 0.95)';
    cashNotification.style.color = 'white';
    cashNotification.style.padding = '20px';
    cashNotification.style.borderRadius = '10px';
    cashNotification.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.3)';
    cashNotification.style.textAlign = 'center';
    cashNotification.style.zIndex = '1000';
    cashNotification.style.minWidth = '300px';

    // Style the content
    const header = cashNotification.querySelector('.cash-injection-header');
    if (header) {
      header.style.fontSize = '1.5em';
      header.style.fontWeight = 'bold';
      header.style.marginBottom = '10px';
    }

    const amountEl = cashNotification.querySelector('.cash-injection-amount');
    if (amountEl) {
      amountEl.style.fontSize = '2.5em';
      amountEl.style.fontWeight = 'bold';
      amountEl.style.margin = '15px 0';
    }

    // Add to DOM
    gameContent.appendChild(cashNotification);

    // Add animation
    cashNotification.style.animation = 'fadeInOut 4s forwards';

    // Remove after animation
    setTimeout(() => {
      if (cashNotification.parentNode === gameContent) {
        gameContent.removeChild(cashNotification);
      }
    }, 4000);
  }
}

// Show notification to the user
window.showNotification = function(message, type = 'info', duration = 5000) {
  // Create notification container if it doesn't exist
  let notificationContainer = document.getElementById('notification-container');
  if (!notificationContainer) {
    notificationContainer = document.createElement('div');
    notificationContainer.id = 'notification-container';
    notificationContainer.style.position = 'fixed';
    notificationContainer.style.top = '20px';
    notificationContainer.style.right = '20px';
    notificationContainer.style.zIndex = '9999';
    document.body.appendChild(notificationContainer);
  }

  // Create notification element
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.style.backgroundColor = type === 'success' ? '#4CAF50' :
                                      type === 'danger' ? '#f44336' :
                                      type === 'warning' ? '#ff9800' : '#2196F3';
  notification.style.color = 'white';
  notification.style.padding = '15px';
  notification.style.marginBottom = '10px';
  notification.style.borderRadius = '5px';
  notification.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
  notification.style.minWidth = '250px';
  notification.style.opacity = '0';
  notification.style.transition = 'opacity 0.3s ease-in-out';

  // Add message
  notification.innerHTML = message;

  // Add close button
  const closeBtn = document.createElement('span');
  closeBtn.innerHTML = '&times;';
  closeBtn.style.float = 'right';
  closeBtn.style.cursor = 'pointer';
  closeBtn.style.marginLeft = '10px';
  closeBtn.style.fontWeight = 'bold';
  closeBtn.onclick = function() {
    notification.style.opacity = '0';
    setTimeout(() => {
      notificationContainer.removeChild(notification);
    }, 300);
  };
  notification.insertBefore(closeBtn, notification.firstChild);

  // Add to container
  notificationContainer.appendChild(notification);

  // Show notification with animation
  setTimeout(() => {
    notification.style.opacity = '1';
  }, 10);

  // Auto-remove after duration
  setTimeout(() => {
    if (notification.parentNode === notificationContainer) {
      notification.style.opacity = '0';
      setTimeout(() => {
        if (notification.parentNode === notificationContainer) {
          notificationContainer.removeChild(notification);
        }
      }, 300);
    }
  }, duration);
};

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

  console.log('Portfolio value in loadGameInterface:', portfolioValue);
  console.log('Total value in loadGameInterface:', totalValue);

  // Update player state with new total value
  playerState.total_value = totalValue;

  // Make sure the portfolio value history is updated
  if (!playerState.portfolio_value_history) {
    playerState.portfolio_value_history = [totalValue];
  } else if (playerState.portfolio_value_history.length <= currentRound) {
    playerState.portfolio_value_history[currentRound] = totalValue;
  }

  // Update all portfolio value displays in the UI
  const portfolioValueDisplays = document.querySelectorAll('.stat-value');
  portfolioValueDisplays.forEach(display => {
    const label = display.previousElementSibling.textContent;
    if (label.includes('Total Value')) {
      display.textContent = `$${totalValue.toFixed(2)}`;
    } else if (label.includes('Invested')) {
      display.textContent = `$${portfolioValue.toFixed(2)}`;
    }
  });

  // Calculate performance metrics
  const initialValue = 10000; // Starting cash
  const totalReturn = totalValue - initialValue;
  const percentReturn = (totalReturn / initialValue) * 100;

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
    const changeClass = priceChange >= 0 ? 'positive' : 'negative';
    const changeSymbol = priceChange >= 0 ? '+' : '';

    assetRows += `
      <tr data-asset="${asset}" class="asset-row" onclick="showTradePanel('${asset}', 'buy')">
        <td class="asset-name">${asset}</td>
        <td class="price">$${price.toFixed(2)}</td>
        <td class="change ${changeClass}">${changeSymbol}${priceChangePercent.toFixed(2)}%</td>
        <td class="quantity">${quantity.toFixed(6)}</td>
        <td class="value">$${value.toFixed(2)}</td>
        <td class="percentage">${percentOfPortfolio.toFixed(2)}%</td>
      </tr>
    `;
  }

  // Create the asset ticker
  let tickerItems = '';
  for (const asset in gameState.asset_prices) {
    const price = gameState.asset_prices[asset];
    const priceHistory = gameState.price_history[asset];
    let priceChange = 0;
    let priceChangePercent = 0;

    if (priceHistory.length > 1) {
      const previousPrice = priceHistory[priceHistory.length - 2];
      priceChange = price - previousPrice;
      priceChangePercent = (priceChange / previousPrice) * 100;
    }

    const changeClass = priceChange >= 0 ? 'positive' : 'negative';
    const changeSymbol = priceChange >= 0 ? '+' : '';

    tickerItems += `
      <div class="ticker-item">
        <span class="ticker-name">${asset}</span>
        <span class="ticker-price">$${price.toFixed(2)}</span>
        <span class="ticker-change ${changeClass}">${changeSymbol}${priceChangePercent.toFixed(2)}%</span>
      </div>
    `;
  }

  // Prepare data for portfolio allocation chart
  const portfolioData = [];
  const portfolioLabels = [];
  const portfolioColors = [
    '#4285F4', '#EA4335', '#FBBC05', '#34A853', '#8F00FF', '#FF6D01'
  ];

  let colorIndex = 0;
  for (const asset in playerState.portfolio) {
    const quantity = playerState.portfolio[asset];
    if (quantity > 0) {
      const value = quantity * gameState.asset_prices[asset];
      portfolioData.push(value);
      portfolioLabels.push(asset);
      colorIndex = (colorIndex + 1) % portfolioColors.length;
    }
  }

  // Add cash to portfolio allocation
  portfolioData.push(playerState.cash);
  portfolioLabels.push('Cash');

  // Create the game interface
  gameScreen.innerHTML = `
    <!-- Asset Ticker -->
    <div class="asset-ticker">
      ${tickerItems}
    </div>

    <!-- Game Progress -->
    <div class="game-progress">
      <div class="progress-info">
        Game Progress: Round ${currentRound} of ${gameSession.max_rounds}
      </div>
      <div class="progress-actions">
        <button id="start-game-btn" class="primary-btn" ${currentRound > 0 ? 'style="display:none;"' : ''}>Start Game</button>
        <button id="next-round-btn" class="primary-btn" ${currentRound === 0 ? 'style="display:none;"' : ''}>Next Round</button>
        <button id="start-over-btn" class="secondary-btn">Start Over <i class="fas fa-redo"></i></button>
      </div>
    </div>

    <div class="game-content">
      <div class="dashboard-grid">
        <!-- Portfolio Summary Panel -->
        <div class="portfolio-summary-panel">
          <h3>Portfolio Summary</h3>
          <div class="summary-stats">
            <div class="stat-item">
              <span class="stat-label">Total Value:</span>
              <span class="stat-value">$${totalValue.toFixed(2)}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Cash:</span>
              <span class="stat-value">$${playerState.cash.toFixed(2)}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Invested:</span>
              <span class="stat-value">$${portfolioValue.toFixed(2)}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Return:</span>
              <span class="stat-value ${totalReturn >= 0 ? 'positive' : 'negative'}">$${totalReturn.toFixed(2)} (${percentReturn.toFixed(2)}%)</span>
            </div>
          </div>

          <!-- Portfolio Allocation Chart -->
          <div class="chart-container">
            <canvas id="portfolio-allocation-chart"></canvas>
          </div>

          <!-- Portfolio Value History Chart -->
          <div class="chart-container">
            <canvas id="portfolio-value-chart"></canvas>
          </div>
        </div>

        <!-- Market Panel -->
        <div class="market-panel">
          <h3>Market</h3>
          <div class="table-container">
            <table class="asset-table">
              <thead>
                <tr>
                  <th>Asset</th>
                  <th>Price</th>
                  <th>Change</th>
                  <th>Quantity</th>
                  <th>Value</th>
                  <th>% of Portfolio</th>
                </tr>
              </thead>
              <tbody>
                ${assetRows}
              </tbody>
            </table>
          </div>
        </div>

        <!-- Trade Panel -->
        <div class="trade-panel" style="display: none;">
          <h3>Trade <span id="trade-asset-name"></span></h3>
          <div class="trade-form">
            <div class="row mb-3">
              <!-- Asset Selection and Action -->
              <div class="col-md-6">
                <div class="form-group mb-2">
                  <label for="trade-asset-select">Select Asset</label>
                  <select class="form-control form-control-sm" id="trade-asset-select" required>
                    <option value="">-- Select Asset --</option>
                    <option value="Bitcoin">Bitcoin</option>
                    <option value="Bonds">Bonds</option>
                    <option value="Commodities">Commodities</option>
                    <option value="Gold">Gold</option>
                    <option value="Real Estate">Real Estate</option>
                    <option value="S&P 500">S&P 500</option>
                  </select>
                </div>
                <div class="form-group mb-2">
                  <label for="trade-action">Action</label>
                  <select class="form-control form-control-sm" id="trade-action" required>
                    <option value="buy">Buy</option>
                    <option value="sell">Sell</option>
                  </select>
                </div>
                <div class="form-group">
                  <label>Current Price: $<span id="current-price-display">0.00</span></label>
                </div>
              </div>

              <!-- Trade Summary -->
              <div class="col-md-6">
                <div class="card bg-light mb-2">
                  <div class="card-body p-2">
                    <h6 class="card-title mb-2">Trade Summary</h6>
                    <div class="d-flex justify-content-between mb-1">
                      <span>Quantity:</span>
                      <span id="quantity-display">0.00</span>
                    </div>
                    <div class="d-flex justify-content-between mb-1">
                      <span>Total Cost:</span>
                      <span>$<span id="total-cost-display">0.00</span></span>
                    </div>
                    <div class="d-flex justify-content-between">
                      <span>Available Cash:</span>
                      <span>$<span id="available-cash-display">0.00</span></span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Amount and Quantity Inputs -->
            <div class="row">
              <!-- Dollar Amount Input -->
              <div class="col-md-6">
                <div class="card">
                  <div class="card-body p-2">
                    <h6 class="card-title">Amount ($)</h6>
                    <div class="form-group mb-2">
                      <div class="input-group input-group-sm">
                        <div class="input-group-prepend">
                          <span class="input-group-text">$</span>
                        </div>
                        <input type="number" class="form-control form-control-sm" id="amount-input" min="0.01" step="0.01" required>
                      </div>
                    </div>
                    <div class="form-group mb-0">
                      <label for="amount-percentage">Percentage:</label>
                      <div class="btn-group btn-group-sm w-100 mt-1">
                        <button type="button" class="btn btn-outline-secondary amount-percent-btn" data-percent="25">25%</button>
                        <button type="button" class="btn btn-outline-secondary amount-percent-btn" data-percent="50">50%</button>
                        <button type="button" class="btn btn-outline-secondary amount-percent-btn" data-percent="75">75%</button>
                        <button type="button" class="btn btn-outline-secondary amount-percent-btn" data-percent="100">100%</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Quantity Input -->
              <div class="col-md-6">
                <div class="card">
                  <div class="card-body p-2">
                    <h6 class="card-title">Quantity (<span id="quantity-unit">units</span>)</h6>
                    <div class="form-group mb-2">
                      <div class="input-group input-group-sm">
                        <input type="number" class="form-control form-control-sm" id="trade-quantity" min="0.000001" step="0.000001" required>
                      </div>
                    </div>
                    <div class="form-group mb-0">
                      <label for="quantity-percentage">Percentage:</label>
                      <div class="btn-group btn-group-sm w-100 mt-1">
                        <button type="button" class="btn btn-outline-secondary quantity-percent-btn" data-percent="25">25%</button>
                        <button type="button" class="btn btn-outline-secondary quantity-percent-btn" data-percent="50">50%</button>
                        <button type="button" class="btn btn-outline-secondary quantity-percent-btn" data-percent="75">75%</button>
                        <button type="button" class="btn btn-outline-secondary quantity-percent-btn" data-percent="100">100%</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Portfolio Diversification -->
            <div class="row mt-3">
              <div class="col-12">
                <h5 class="mb-2">Portfolio Actions</h5>
                <div class="card mb-3">
                  <div class="card-body p-2">
                    <h6 class="card-title mb-2">Select Assets for Diversification</h6>
                    <div class="row mb-2">
                      <div class="col-6">
                        <div class="custom-control custom-checkbox">
                          <input type="checkbox" class="custom-control-input diversify-asset" id="diversify-bitcoin" value="Bitcoin" checked>
                          <label class="custom-control-label" for="diversify-bitcoin">Bitcoin</label>
                        </div>
                        <div class="custom-control custom-checkbox">
                          <input type="checkbox" class="custom-control-input diversify-asset" id="diversify-bonds" value="Bonds" checked>
                          <label class="custom-control-label" for="diversify-bonds">Bonds</label>
                        </div>
                        <div class="custom-control custom-checkbox">
                          <input type="checkbox" class="custom-control-input diversify-asset" id="diversify-commodities" value="Commodities" checked>
                          <label class="custom-control-label" for="diversify-commodities">Commodities</label>
                        </div>
                      </div>
                      <div class="col-6">
                        <div class="custom-control custom-checkbox">
                          <input type="checkbox" class="custom-control-input diversify-asset" id="diversify-gold" value="Gold" checked>
                          <label class="custom-control-label" for="diversify-gold">Gold</label>
                        </div>
                        <div class="custom-control custom-checkbox">
                          <input type="checkbox" class="custom-control-input diversify-asset" id="diversify-real-estate" value="Real Estate" checked>
                          <label class="custom-control-label" for="diversify-real-estate">Real Estate</label>
                        </div>
                        <div class="custom-control custom-checkbox">
                          <input type="checkbox" class="custom-control-input diversify-asset" id="diversify-sp500" value="S&P 500" checked>
                          <label class="custom-control-label" for="diversify-sp500">S&P 500</label>
                        </div>
                      </div>
                    </div>
                    <div class="d-flex justify-content-between">
                      <button id="select-all-assets-btn" class="btn btn-outline-secondary btn-sm">Select All</button>
                      <button id="deselect-all-assets-btn" class="btn btn-outline-secondary btn-sm">Deselect All</button>
                    </div>
                  </div>
                </div>
                <div class="d-flex justify-content-between">
                  <button id="buy-all-btn" class="btn btn-success btn-sm">Distribute Cash Evenly</button>
                  <button id="buy-selected-btn" class="btn btn-success btn-sm">Distribute to Selected</button>
                  <button id="sell-all-btn" class="btn btn-danger btn-sm">Sell All Assets</button>
                </div>
              </div>
            </div>

            <div class="trade-buttons mt-3">
              <button id="execute-trade-btn" class="primary-btn">Execute Trade</button>
              <button id="cancel-trade-btn" class="secondary-btn">Cancel</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Game Controls -->
      <div class="game-actions">
        <button id="next-round-btn" class="primary-btn">Next Round</button>
        <button id="view-history-btn" class="secondary-btn">Trade History</button>
        <button id="view-correlation-btn" class="secondary-btn">Correlation Matrix</button>
        <button id="back-to-welcome" class="secondary-btn">Exit Game</button>
      </div>

      <!-- Trade History Modal (hidden by default) -->
      <div id="trade-history-modal" class="modal" style="display: none;">
        <div class="modal-content">
          <span class="close-modal">&times;</span>
          <h3>Trade History</h3>
          <div class="trade-history-container">
            <table class="trade-history-table">
              <thead>
                <tr>
                  <th>Round</th>
                  <th>Asset</th>
                  <th>Action</th>
                  <th>Quantity</th>
                  <th>Price</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody id="trade-history-body">
                ${generateTradeHistoryRows()}
              </tbody>
            </table>
          </div>
          <div class="modal-actions">
            <button class="secondary-btn close-history-btn">Close</button>
          </div>
        </div>
      </div>

      <!-- Asset Information Modal (hidden by default) -->
      <div id="asset-info-modal" class="modal" style="display: none;">
        <div class="modal-content">
          <span class="close-modal">&times;</span>
          <h3>Asset Information</h3>
          <div id="asset-info-content">
            <!-- Asset information will be loaded here -->
          </div>
          <div class="modal-actions">
            <button class="secondary-btn close-asset-info-btn">Close</button>
          </div>
        </div>
      </div>

      <!-- Correlation Matrix Modal (hidden by default) -->
      <div id="correlation-modal" class="modal" style="display: none;">
        <div class="modal-content">
          <span class="close-modal">&times;</span>
          <h3>Asset Correlation Matrix</h3>
          <p class="modal-description">
            This matrix shows how different assets move in relation to each other.
            Values close to 1 indicate assets that tend to move together,
            values close to -1 indicate assets that tend to move in opposite directions,
            and values close to 0 indicate little relationship.
          </p>
          <div class="correlation-container">
            <table class="correlation-table">
              <thead>
                <tr>
                  <th>Asset</th>
                  <th>S&P 500</th>
                  <th>Bonds</th>
                  <th>Real Estate</th>
                  <th>Gold</th>
                  <th>Commodities</th>
                  <th>Bitcoin</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>S&P 500</strong></td>
                  <td class="corr-1">1.00</td>
                  <td class="corr-neg">-0.52</td>
                  <td class="corr-pos">0.34</td>
                  <td class="corr-neutral">0.02</td>
                  <td class="corr-neutral">0.12</td>
                  <td class="corr-pos">0.41</td>
                </tr>
                <tr>
                  <td><strong>Bonds</strong></td>
                  <td class="corr-neg">-0.52</td>
                  <td class="corr-1">1.00</td>
                  <td class="corr-neutral">0.02</td>
                  <td class="corr-neutral">0.03</td>
                  <td class="corr-neutral">-0.02</td>
                  <td class="corr-neg">-0.23</td>
                </tr>
                <tr>
                  <td><strong>Real Estate</strong></td>
                  <td class="corr-pos">0.34</td>
                  <td class="corr-neutral">0.02</td>
                  <td class="corr-1">1.00</td>
                  <td class="corr-neg">-0.50</td>
                  <td class="corr-neutral">-0.03</td>
                  <td class="corr-neutral">0.16</td>
                </tr>
                <tr>
                  <td><strong>Gold</strong></td>
                  <td class="corr-neutral">0.02</td>
                  <td class="corr-neutral">0.03</td>
                  <td class="corr-neg">-0.50</td>
                  <td class="corr-1">1.00</td>
                  <td class="corr-neutral">0.10</td>
                  <td class="corr-neg">-0.53</td>
                </tr>
                <tr>
                  <td><strong>Commodities</strong></td>
                  <td class="corr-neutral">0.12</td>
                  <td class="corr-neutral">-0.02</td>
                  <td class="corr-neutral">-0.03</td>
                  <td class="corr-neutral">0.10</td>
                  <td class="corr-1">1.00</td>
                  <td class="corr-neutral">0.04</td>
                </tr>
                <tr>
                  <td><strong>Bitcoin</strong></td>
                  <td class="corr-pos">0.41</td>
                  <td class="corr-neg">-0.23</td>
                  <td class="corr-neutral">0.16</td>
                  <td class="corr-neg">-0.53</td>
                  <td class="corr-neutral">0.04</td>
                  <td class="corr-1">1.00</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="correlation-legend">
            <div class="legend-item"><span class="legend-color corr-pos"></span> Positive Correlation</div>
            <div class="legend-item"><span class="legend-color corr-neutral"></span> Low/No Correlation</div>
            <div class="legend-item"><span class="legend-color corr-neg"></span> Negative Correlation</div>
          </div>
          <div class="modal-actions">
            <button class="secondary-btn close-correlation-btn">Close</button>
          </div>
        </div>
      </div>
    </div>
  `;

  // Initialize charts
  initializeCharts(portfolioLabels, portfolioData, portfolioColors);

  // Update the portfolio value chart if it exists
  if (window.portfolioValueChart) {
    updatePortfolioValueChart();
  }

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

  // Add event listener for the trade history button
  document.getElementById('view-history-btn').addEventListener('click', () => {
    document.getElementById('trade-history-modal').style.display = 'block';
  });

  // Add event listener for the correlation matrix button
  document.getElementById('view-correlation-btn').addEventListener('click', () => {
    document.getElementById('correlation-modal').style.display = 'block';
  });

  // Add event listeners for asset information
  document.querySelectorAll('.asset-name').forEach(element => {
    element.style.cursor = 'pointer';
    element.title = 'Click for asset information';
    element.addEventListener('click', () => {
      const asset = element.parentElement.getAttribute('data-asset');
      showAssetInfo(asset);
    });
  });

  // Add event listeners for closing modals
  document.querySelectorAll('.close-modal').forEach(closeBtn => {
    closeBtn.addEventListener('click', () => {
      document.querySelectorAll('.modal').forEach(modal => {
        modal.style.display = 'none';
      });
    });
  });

  document.querySelector('.close-history-btn').addEventListener('click', () => {
    document.getElementById('trade-history-modal').style.display = 'none';
  });

  document.querySelector('.close-asset-info-btn').addEventListener('click', () => {
    document.getElementById('asset-info-modal').style.display = 'none';
  });

  document.querySelector('.close-correlation-btn').addEventListener('click', () => {
    document.getElementById('correlation-modal').style.display = 'none';
  });

  // Add event listener for the back button
  document.getElementById('back-to-welcome').addEventListener('click', () => {
    if (confirm('Are you sure you want to exit the game? Your progress will be saved.')) {
      gameScreen.style.display = 'none';
      welcomeScreen.style.display = 'block';
    }
  });
}

// Generate trade history rows for the trade history modal
function generateTradeHistoryRows() {
  if (!playerState.trade_history || playerState.trade_history.length === 0) {
    return '<tr><td colspan="6">No trades yet</td></tr>';
  }

  // Sort trade history by round (descending) and then by timestamp (descending)
  const sortedHistory = [...playerState.trade_history].sort((a, b) => {
    if (b.round !== a.round) {
      return b.round - a.round;
    }
    return new Date(b.timestamp) - new Date(a.timestamp);
  });

  let rows = '';
  for (const trade of sortedHistory) {
    rows += `
      <tr>
        <td>${trade.round}</td>
        <td>${trade.asset}</td>
        <td class="${trade.action === 'buy' ? 'buy' : 'sell'}">${trade.action.toUpperCase()}</td>
        <td>${trade.quantity.toFixed(2)}</td>
        <td>$${trade.price.toFixed(2)}</td>
        <td>$${(trade.action === 'buy' ? trade.total : trade.value).toFixed(2)}</td>
      </tr>
    `;
  }

  return rows;
}

// Initialize charts using Chart.js
function initializeCharts(portfolioLabels, portfolioData, portfolioColors) {
  // Portfolio Allocation Pie Chart
  const allocationCtx = document.getElementById('portfolio-allocation-chart').getContext('2d');
  new Chart(allocationCtx, {
    type: 'pie',
    data: {
      labels: portfolioLabels,
      datasets: [{
        data: portfolioData,
        backgroundColor: portfolioColors,
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'right',
          labels: {
            boxWidth: 12
          }
        },
        title: {
          display: true,
          text: 'Portfolio Allocation'
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const value = context.raw;
              const total = context.dataset.data.reduce((a, b) => a + b, 0);
              const percentage = ((value / total) * 100).toFixed(1);
              return `${context.label}: $${value.toFixed(2)} (${percentage}%)`;
            }
          }
        }
      }
    }
  });

  // Portfolio Value History Line Chart
  const valueHistoryCtx = document.getElementById('portfolio-value-chart').getContext('2d');

  // Create labels for each round
  const roundLabels = [];
  for (let i = 0; i <= currentRound; i++) {
    roundLabels.push(`Round ${i}`);
  }

  // Log the portfolio value history for debugging
  console.log('Portfolio value history:', playerState.portfolio_value_history);

  // Make sure we have valid data
  let portfolioValueHistory = playerState.portfolio_value_history;
  if (!Array.isArray(portfolioValueHistory) || portfolioValueHistory.length === 0) {
    portfolioValueHistory = [playerState.total_value || 10000];
    console.log('Created new portfolio value history:', portfolioValueHistory);
  }

  // Store the chart instance in a global variable so we can update it later
  window.portfolioValueChart = new Chart(valueHistoryCtx, {
    type: 'line',
    data: {
      labels: roundLabels,
      datasets: [{
        label: 'Portfolio Value',
        data: portfolioValueHistory,
        borderColor: '#4285F4',
        backgroundColor: 'rgba(66, 133, 244, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: 'Portfolio Value History'
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              return `Value: $${context.raw.toFixed(2)}`;
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: false,
          ticks: {
            callback: function(value) {
              return '$' + value.toFixed(0);
            }
          }
        }
      }
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

  // Calculate and display the total
  updateTradeTotal();

  // Add event listeners for the trade form
  tradeAction.addEventListener('change', updateTradeTotal);
  tradeQuantity.addEventListener('input', updateTradeTotal);

  // Add event listeners for the quantity shortcuts
  document.querySelectorAll('.quantity-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const percent = parseInt(btn.getAttribute('data-percent')) / 100;

      if (tradeAction.value === 'buy') {
        // Calculate maximum quantity based on available cash
        const price = gameState.asset_prices[asset];
        const maxQuantity = playerState.cash / price;
        tradeQuantity.value = (maxQuantity * percent).toFixed(2);
      } else { // sell
        // Calculate quantity based on current holdings
        const currentQuantity = playerState.portfolio[asset] || 0;
        tradeQuantity.value = (currentQuantity * percent).toFixed(2);
      }

      updateTradeTotal();
    });
  });

  // Add event listeners for the trade buttons
  document.getElementById('execute-trade-btn').addEventListener('click', executeTrade);
  document.getElementById('cancel-trade-btn').addEventListener('click', hideTradePanel);

  // Function to update the trade total
  function updateTradeTotal() {
    try {
      if (!tradeQuantity) {
        console.error('Trade quantity input not found');
        return;
      }

      const quantity = parseFloat(tradeQuantity.value) || 0;
      const price = gameState.asset_prices[asset];
      const total = quantity * price;

      // Check if tradeTotal exists before updating it
      if (tradeTotal) {
        tradeTotal.textContent = `$${total.toFixed(2)}`;
      } else {
        console.warn('Trade total element not found');
      }

      // Disable the execute button if the quantity is invalid
      const executeBtn = document.getElementById('execute-trade-btn');

    if (tradeAction && executeBtn) {
      if (tradeAction.value === 'buy') {
        executeBtn.disabled = total > playerState.cash || quantity <= 0;
      } else { // sell
        const currentQuantity = playerState.portfolio[asset] || 0;
        executeBtn.disabled = quantity > currentQuantity || quantity <= 0;
      }
    }
    } catch (error) {
      console.error('Error in updateTradeTotal:', error);
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
        value: total,  // Changed from total to value for consistency
        round: currentRound,
        timestamp: new Date().toISOString()
      });
    }

    // Calculate new portfolio value
    const portfolioValue = calculatePortfolioValue();
    playerState.total_value = playerState.cash + portfolioValue;

    console.log('New portfolio value after trade:', portfolioValue);
    console.log('New total value after trade:', playerState.total_value);

    // Update portfolio value history
    if (!playerState.portfolio_value_history) {
      playerState.portfolio_value_history = [];
    }
    playerState.portfolio_value_history.push(playerState.total_value);

    console.log('Updated portfolio value history:', playerState.portfolio_value_history);

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

    // Update the portfolio value chart if it exists
    if (typeof updatePortfolioValueChart === 'function') {
      updatePortfolioValueChart();
    }
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

// Update the portfolio value chart
function updatePortfolioValueChart() {
  // Check if the chart exists
  if (!window.portfolioValueChart) {
    console.warn('Portfolio value chart not found');
    return;
  }

  // Make sure we have valid data
  if (!playerState.portfolio_value_history || !Array.isArray(playerState.portfolio_value_history)) {
    playerState.portfolio_value_history = [playerState.total_value || 10000];
  }

  // Create labels for each round
  const roundLabels = [];
  for (let i = 0; i < playerState.portfolio_value_history.length; i++) {
    roundLabels.push(`Round ${i}`);
  }

  // Update the chart data
  window.portfolioValueChart.data.labels = roundLabels;
  window.portfolioValueChart.data.datasets[0].data = playerState.portfolio_value_history;

  // Log the updated data
  console.log('Updating portfolio value chart with data:', playerState.portfolio_value_history);

  // Update the chart
  window.portfolioValueChart.update();
}

// Generate cash injection
function generateCashInjection() {
  // Base amount increases each round to simulate growing economy
  const baseAmount = 5000 + (currentRound * 500); // Starts at 5000, increases by 500 each round
  const variability = 1000; // Higher variability for more dynamic gameplay

  // Generate random cash injection with increasing trend
  const cashInjection = baseAmount + (Math.random() * 2 - 1) * variability;

  console.log(`Generating cash injection: ${cashInjection.toFixed(2)}`);

  // Update player cash
  playerState.cash += cashInjection;

  // Update game state tracking
  if (!gameState.lastCashInjection) gameState.lastCashInjection = 0;
  if (!gameState.totalCashInjected) gameState.totalCashInjected = 0;

  gameState.lastCashInjection = cashInjection;
  gameState.totalCashInjected += cashInjection;

  // Update total value
  playerState.total_value = playerState.cash + calculatePortfolioValue();

  // Show notification to user
  window.showNotification(`Cash injection: $${cashInjection.toFixed(2)}`, 'success', 8000);

  // Show a more prominent cash injection notification
  showCashInjectionNotification(cashInjection);

  // Update the UI to show the new cash amount
  const cashDisplay = document.querySelector('.stat-item:nth-child(2) .stat-value');
  if (cashDisplay) {
    cashDisplay.textContent = `$${playerState.cash.toFixed(2)}`;
    // Add a highlight animation
    cashDisplay.style.animation = 'highlight-pulse 2s';
    setTimeout(() => {
      cashDisplay.style.animation = '';
    }, 2000);
  }

  // Update the total value display
  const totalValueDisplay = document.querySelector('.stat-item:nth-child(1) .stat-value');
  if (totalValueDisplay) {
    totalValueDisplay.textContent = `$${playerState.total_value.toFixed(2)}`;
    // Add a highlight animation
    totalValueDisplay.style.animation = 'highlight-pulse 2s';
    setTimeout(() => {
      totalValueDisplay.style.animation = '';
    }, 2000);
  }

  return cashInjection;
}

// Advance to the next round
async function advanceToNextRound() {
  console.log('Advancing to next round...');
  try {
    // Create the next round's game state
    const nextGameState = await window.gameSupabase.createNextRoundState(gameSession.id, gameState);
    console.log('Next game state:', nextGameState);

    // Check if the game is over
    if (nextGameState && nextGameState.gameOver) {
      console.log('Game over detected');

      // Calculate final portfolio value before completing the game
      const portfolioValue = calculatePortfolioValue();
      const totalValue = playerState.cash + portfolioValue;

      // Update player state with final values
      playerState.total_value = totalValue;
      console.log('Final game values - Portfolio Value:', portfolioValue, 'Total Value:', totalValue);

      // Save the updated player state to the database
      const updated = await window.gameSupabase.updatePlayerState(gameSession.id, playerState);
      if (!updated) {
        console.error('Failed to save final player state before completing game');
      }

      // Complete the game and show results
      const completed = await window.gameSupabase.completeGame(gameSession.id);
      if (!completed) {
        window.showNotification('Failed to complete the game. Please try again.', 'danger');
        return;
      }

      // Show game results
      await showGameResults();
      return;
    }

    if (!nextGameState) {
      window.showNotification('Failed to advance to the next round. Please try again.', 'danger');
      return;
    }

    // Normalize the game state to ensure consistent property names
    if (window.normalizeGameState) {
      gameState = window.normalizeGameState(nextGameState);
    } else {
      gameState = nextGameState;
    }

    // Update round number
    currentRound = gameState.round_number || gameState.roundNumber || 0;
    console.log('Updated to round:', currentRound);

    // Generate cash injection for this round
    if (currentRound > 0) { // Only inject cash after the first round
      // IMPORTANT: Apply cash injection directly here
      const cashInjection = generateCashInjection();
      console.log(`Cash injection for round ${currentRound}: $${cashInjection.toFixed(2)}`);

      // Force update the UI to show the new cash amount
      const cashDisplay = document.querySelector('.stat-item:nth-child(2) .stat-value');
      if (cashDisplay) {
        cashDisplay.textContent = `$${playerState.cash.toFixed(2)}`;
      }

      // Force update the total value display
      const totalValueDisplay = document.querySelector('.stat-item:nth-child(1) .stat-value');
      if (totalValueDisplay) {
        totalValueDisplay.textContent = `$${playerState.total_value.toFixed(2)}`;
      }

      // Save the updated player state immediately
      await window.gameSupabase.updatePlayerState(gameSession.id, playerState);
    }

    // Calculate new portfolio value
    if (playerState) {
      const portfolioValue = window.calculatePortfolioValue ?
        window.calculatePortfolioValue(playerState, gameState) :
        calculatePortfolioValue();

      playerState.total_value = playerState.cash + portfolioValue;
      console.log('Updated total value after round:', playerState.total_value);

      // Update portfolio value history
      if (!playerState.portfolio_value_history) {
        playerState.portfolio_value_history = [playerState.total_value];
      } else if (Array.isArray(playerState.portfolio_value_history)) {
        playerState.portfolio_value_history.push(playerState.total_value);
      } else {
        // If portfolio_value_history is not an array, create a new one
        playerState.portfolio_value_history = [playerState.total_value];
      }

      // Make sure we don't have both versions
      if (playerState.portfolioValueHistory) {
        delete playerState.portfolioValueHistory;
      }

      // Save updated player state
      const updated = await window.gameSupabase.updatePlayerState(gameSession.id, playerState);
      if (updated) {
        console.log('Successfully saved player state with total value:', playerState.total_value);
      } else {
        console.error('Failed to save player state');
      }
    }

    // Update the portfolio value chart
    if (typeof updatePortfolioValueChart === 'function') {
      updatePortfolioValueChart();
    }

    // Reload the game interface
    if (typeof loadGameInterface === 'function') {
      loadGameInterface();
    } else if (typeof window.loadGameInterface === 'function') {
      window.loadGameInterface();
    } else {
      console.error('loadGameInterface function not found');
      window.showNotification('Error: Could not reload game interface', 'warning');
      // Try to update UI directly
      if (typeof window.updateUI === 'function') {
        window.updateUI();
      }
    }

    window.showNotification('Advanced to round ' + currentRound, 'success');
  } catch (error) {
    console.error('Error in advanceToNextRound:', error);
    window.showNotification('An error occurred while advancing to the next round', 'danger');
  }
}

// Show asset information in a modal
function showAssetInfo(asset) {
  const assetInfoContent = document.getElementById('asset-info-content');
  const assetData = assetInfo[asset];

  if (!assetData) {
    assetInfoContent.innerHTML = `<p>No information available for ${asset}.</p>`;
    document.getElementById('asset-info-modal').style.display = 'block';
    return;
  }

  // Get current price and price change
  const price = gameState.asset_prices[asset];
  const priceHistory = gameState.price_history[asset];
  let priceChange = 0;
  let priceChangePercent = 0;

  if (priceHistory.length > 1) {
    const previousPrice = priceHistory[priceHistory.length - 2];
    priceChange = price - previousPrice;
    priceChangePercent = (priceChange / previousPrice) * 100;
  }

  // Get asset parameters from price generator if available
  let meanReturn = 'N/A';
  let stdDev = 'N/A';
  let minReturn = 'N/A';
  let maxReturn = 'N/A';

  if (window.priceGenerator && window.priceGenerator.assetParams[asset]) {
    const params = window.priceGenerator.assetParams[asset];
    meanReturn = `${(params.mean * 100).toFixed(2)}%`;
    stdDev = `${(params.stdDev * 100).toFixed(2)}%`;
    minReturn = `${(params.min * 100).toFixed(2)}%`;
    maxReturn = `${(params.max * 100).toFixed(2)}%`;
  }

  // Create the asset information content
  assetInfoContent.innerHTML = `
    <div class="asset-info-item">
      <span class="asset-info-label">Description:</span>
      <span class="asset-info-value">${assetData.description}</span>
    </div>

    <div class="asset-info-item">
      <span class="asset-info-label">Current Price:</span>
      <span class="asset-info-value">$${price.toFixed(2)}</span>
    </div>

    <div class="asset-info-item">
      <span class="asset-info-label">Price Change:</span>
      <span class="asset-info-value ${priceChange >= 0 ? 'positive' : 'negative'}">
        ${priceChange >= 0 ? '+' : ''}$${priceChange.toFixed(2)} (${priceChangePercent >= 0 ? '+' : ''}${priceChangePercent.toFixed(2)}%)
      </span>
    </div>

    <div class="asset-info-item">
      <span class="asset-info-label">Risk Level:</span>
      <span class="asset-info-value">${assetData.risk}</span>
    </div>

    <div class="asset-info-item">
      <span class="asset-info-label">Expected Return:</span>
      <span class="asset-info-value">${assetData.expectedReturn} (Mean: ${meanReturn})</span>
    </div>

    <div class="asset-info-item">
      <span class="asset-info-label">Volatility:</span>
      <span class="asset-info-value">${assetData.volatility} (Std Dev: ${stdDev})</span>
    </div>

    <div class="asset-info-item">
      <span class="asset-info-label">Return Range:</span>
      <span class="asset-info-value">Min: ${minReturn}, Max: ${maxReturn}</span>
    </div>

    <div class="asset-info-item">
      <span class="asset-info-label">Correlations:</span>
      <span class="asset-info-value">${assetData.correlations}</span>
    </div>
  `;

  // Show the modal
  document.getElementById('asset-info-modal').style.display = 'block';
}

// Show game results
async function showGameResults() {
  // Calculate final portfolio value with detailed logging
  console.log('Player portfolio:', playerState.portfolio);
  console.log('Asset prices:', gameState.asset_prices);

  let portfolioValue = 0;
  for (const asset in playerState.portfolio) {
    const quantity = playerState.portfolio[asset];
    const price = gameState.asset_prices[asset];
    const assetValue = quantity * price;
    console.log(`Asset: ${asset}, Quantity: ${quantity}, Price: ${price}, Value: ${assetValue}`);
    portfolioValue += assetValue;
  }

  console.log('Calculated portfolio value:', portfolioValue);
  console.log('Player cash:', playerState.cash);

  const totalValue = playerState.cash + portfolioValue;
  console.log('Final total value:', totalValue);

  // Update player state with final values
  playerState.total_value = totalValue;

  // Force update the portfolio_value_history array
  if (!playerState.portfolio_value_history) {
    playerState.portfolio_value_history = [];
  }
  playerState.portfolio_value_history.push(totalValue);

  // DIRECT DATABASE UPDATE - This is the most important part to fix the issue
  try {
    // First, directly update the leaderboard with the final value
    console.log('DIRECT LEADERBOARD UPDATE with final value:', totalValue);
    const { data: leaderboardData, error: leaderboardError } = await supabase
      .from('leaderboard')
      .upsert([{
        game_id: window.gameSession.id,
        user_id: currentUser.id,
        user_name: currentUser.name || 'Anonymous',
        game_mode: 'single',
        section_id: currentUser.section_id || null,
        final_value: totalValue
      }], { onConflict: 'game_id,user_id' })
      .select();

    if (leaderboardError) {
      console.error('Direct leaderboard update failed:', leaderboardError);
    } else {
      console.log('Direct leaderboard update succeeded:', leaderboardData);
    }
  } catch (directError) {
    console.error('Error in direct leaderboard update:', directError);
  }

  // Save the updated player state to the database
  console.log('Saving final player state with total value:', totalValue);
  if (window.gameSession && window.gameSupabase) {
    try {
      // First, directly update the player state in the database with the final value
      const { data, error } = await supabase
        .from('player_states')
        .update({
          total_value: totalValue,
          cash: playerState.cash,
          portfolio: playerState.portfolio,
          portfolio_value_history: playerState.portfolio_value_history
        })
        .eq('game_id', window.gameSession.id)
        .eq('user_id', currentUser.id);

      if (error) {
        console.error('Direct database update failed:', error);
      } else {
        console.log('Direct database update succeeded');
      }

      // Then use the normal update method
      const updated = await window.gameSupabase.updatePlayerState(window.gameSession.id, playerState);
      if (!updated) {
        console.error('Failed to save final player state to database');
      } else {
        console.log('Successfully saved final player state with total value:', totalValue);

        // Explicitly save to leaderboard with updated values
        const savedToLeaderboard = await window.gameSupabase.saveToLeaderboard(window.gameSession.id, playerState, gameState);
        if (savedToLeaderboard) {
          console.log('Successfully saved to leaderboard with final value:', totalValue);
        } else {
          console.error('Failed to save to leaderboard');
        }
      }
    } catch (error) {
      console.error('Error saving final game state:', error);
    }
  }

  // Create a summary of the player's performance
  const initialValue = 10000; // Starting cash
  const totalReturn = totalValue - initialValue;
  const percentReturn = (totalReturn / initialValue) * 100;

  // Create the results screen with detailed breakdown
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
          <span class="result-label">Cash on Hand:</span>
          <span class="result-value">$${playerState.cash.toFixed(2)}</span>
        </div>

        <div class="result-item">
          <span class="result-label">Portfolio Value:</span>
          <span class="result-value">$${portfolioValue.toFixed(2)}</span>
        </div>

        <div class="result-item">
          <span class="result-label">Final Total Value:</span>
          <span class="result-value" style="font-weight: bold; font-size: 1.2em;">$${totalValue.toFixed(2)}</span>
        </div>

        <div class="result-item">
          <span class="result-label">Total Return:</span>
          <span class="result-value ${totalReturn >= 0 ? 'positive' : 'negative'}">$${totalReturn.toFixed(2)} (${percentReturn.toFixed(2)}%)</span>
        </div>
      </div>

      <div class="results-portfolio">
        <h4>Final Portfolio Breakdown</h4>
        <table class="results-table">
          <thead>
            <tr>
              <th>Asset</th>
              <th>Quantity</th>
              <th>Price</th>
              <th>Value</th>
            </tr>
          </thead>
          <tbody>
            ${Object.entries(playerState.portfolio).map(([asset, quantity]) => {
              const price = gameState.asset_prices[asset];
              const value = quantity * price;
              return `
                <tr>
                  <td>${asset}</td>
                  <td>${quantity.toFixed(2)}</td>
                  <td>$${price.toFixed(2)}</td>
                  <td>$${value.toFixed(2)}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>

      <div class="results-actions">
        <button id="play-again-btn" class="primary-btn">Play Again</button>
        <button id="back-to-welcome" class="secondary-btn">Back to Welcome Screen</button>
      </div>
    </div>
  `;

  // Add event listeners for the buttons
  document.getElementById('play-again-btn').addEventListener('click', function() {
    // Start a new single player game
    if (typeof startSinglePlayerGame === 'function') {
      startSinglePlayerGame();
    } else if (typeof window.startSinglePlayerGame === 'function') {
      window.startSinglePlayerGame();
    } else {
      // Fallback: reload the page
      window.location.reload();
    }
  });
  document.getElementById('back-to-welcome').addEventListener('click', () => {
    gameScreen.style.display = 'none';
    welcomeScreen.style.display = 'block';
  });
}
