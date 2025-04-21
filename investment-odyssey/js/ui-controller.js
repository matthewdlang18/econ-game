// Investment Odyssey - UI Controller

// UI Elements
const uiElements = {
  // Sections
  loginSection: document.getElementById('login-section'),
  introSection: document.getElementById('intro-section'),
  gameDashboard: document.getElementById('game-dashboard'),
  gameResults: document.getElementById('game-results'),
  waitingRoom: document.getElementById('waiting-room'),
  
  // User Info
  userInfo: document.getElementById('user-info'),
  userName: document.getElementById('user-name'),
  logoutBtn: document.getElementById('logout-btn'),
  
  // Login Form
  loginForm: document.getElementById('login-form'),
  loginError: document.getElementById('login-error'),
  
  // Introduction Tabs
  tabBtns: document.querySelectorAll('.tab-btn'),
  tabContents: document.querySelectorAll('.tab-content'),
  
  // Game Mode Buttons
  startSinglePlayerBtn: document.getElementById('start-single-player'),
  joinClassGameBtn: document.getElementById('join-class-game'),
  createClassGameBtn: document.getElementById('create-class-game'),
  studentJoinGame: document.getElementById('student-join-game'),
  instructorCreateGame: document.getElementById('instructor-create-game'),
  
  // Dashboard Elements
  currentRound: document.getElementById('current-round'),
  maxRounds: document.getElementById('max-rounds'),
  cashValue: document.getElementById('cash-value'),
  portfolioValue: document.getElementById('portfolio-value'),
  totalValue: document.getElementById('total-value'),
  cpiValue: document.getElementById('cpi-value'),
  assetPriceTable: document.getElementById('asset-price-table'),
  
  // Trading Interface
  tradeForm: document.getElementById('trade-form'),
  assetSelect: document.getElementById('asset-select'),
  actionSelect: document.getElementById('action-select'),
  quantityInput: document.getElementById('quantity-input'),
  amountInput: document.getElementById('amount-input'),
  percentageBtns: document.querySelectorAll('.percentage-btn'),
  tradeMessage: document.getElementById('trade-message'),
  
  // Chart Tabs
  chartTabBtns: document.querySelectorAll('.chart-tab-btn'),
  charts: document.querySelectorAll('.chart'),
  
  // Game Controls
  nextRoundBtn: document.getElementById('next-round-btn'),
  resetGameBtn: document.getElementById('reset-game-btn'),
  saveGameBtn: document.getElementById('save-game-btn'),
  endGameBtn: document.getElementById('end-game-btn'),
  gameMessage: document.getElementById('game-message'),
  
  // Trade History
  tradeHistoryTable: document.getElementById('trade-history-table'),
  
  // Game Results
  startingValue: document.getElementById('starting-value'),
  finalValue: document.getElementById('final-value'),
  totalReturn: document.getElementById('total-return'),
  annualizedReturn: document.getElementById('annualized-return'),
  leaderboardTable: document.getElementById('leaderboard-table'),
  submitScoreBtn: document.getElementById('submit-score-btn'),
  playAgainBtn: document.getElementById('play-again-btn'),
  returnIntroBtn: document.getElementById('return-intro-btn'),
  
  // Waiting Room
  participantsList: document.getElementById('participants-list'),
  instructorControls: document.getElementById('instructor-controls'),
  startClassGameBtn: document.getElementById('start-class-game-btn'),
  cancelClassGameBtn: document.getElementById('cancel-class-game-btn'),
  
  // Notification
  notification: document.getElementById('notification')
};

// Show section and hide others
function showSection(sectionId) {
  const sections = [
    uiElements.loginSection,
    uiElements.introSection,
    uiElements.gameDashboard,
    uiElements.gameResults,
    uiElements.waitingRoom
  ];
  
  sections.forEach(section => {
    if (section.id === sectionId) {
      section.classList.remove('hidden');
    } else {
      section.classList.add('hidden');
    }
  });
}

// Show user info
function showUserInfo(profile) {
  uiElements.userInfo.classList.remove('hidden');
  uiElements.userName.textContent = profile.name;
  
  // Show appropriate game mode controls based on user role
  if (profile.role === 'student') {
    uiElements.studentJoinGame.classList.remove('hidden');
    uiElements.instructorCreateGame.classList.add('hidden');
  } else if (profile.role === 'ta') {
    uiElements.studentJoinGame.classList.add('hidden');
    uiElements.instructorCreateGame.classList.remove('hidden');
  }
}

// Handle tab switching
function setupTabs() {
  uiElements.tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Remove active class from all buttons and contents
      uiElements.tabBtns.forEach(b => b.classList.remove('active'));
      uiElements.tabContents.forEach(c => c.classList.remove('active'));
      
      // Add active class to clicked button and corresponding content
      btn.classList.add('active');
      const tabId = btn.getAttribute('data-tab');
      document.getElementById(tabId).classList.add('active');
    });
  });
}

// Handle chart tab switching
function setupChartTabs() {
  uiElements.chartTabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Remove active class from all buttons and charts
      uiElements.chartTabBtns.forEach(b => b.classList.remove('active'));
      uiElements.charts.forEach(c => c.classList.remove('active-chart'));
      
      // Add active class to clicked button and corresponding chart
      btn.classList.add('active');
      const chartId = btn.getAttribute('data-chart');
      document.getElementById(`${chartId}-chart`).classList.add('active-chart');
    });
  });
}

// Update dashboard with game state and player state
function updateDashboard(gameState, playerState) {
  // Update round information
  uiElements.currentRound.textContent = gameState.roundNumber;
  
  // Update portfolio summary
  uiElements.cashValue.textContent = formatCurrency(playerState.cash);
  
  const portfolioValue = window.GameState.calculatePortfolioValue(playerState, gameState.assetPrices);
  uiElements.portfolioValue.textContent = formatCurrency(portfolioValue);
  
  const totalValue = window.GameState.calculateTotalValue(playerState, gameState.assetPrices);
  uiElements.totalValue.textContent = formatCurrency(totalValue);
  
  uiElements.cpiValue.textContent = gameState.cpi.toFixed(2);
  
  // Update asset price table
  updateAssetPriceTable(gameState, playerState);
  
  // Update trade history table
  updateTradeHistoryTable(playerState);
  
  // Update charts
  window.Charts.updateCharts(gameState, playerState);
}

// Update asset price table
function updateAssetPriceTable(gameState, playerState) {
  const tbody = uiElements.assetPriceTable.querySelector('tbody');
  tbody.innerHTML = '';
  
  for (const asset in gameState.assetPrices) {
    const currentPrice = gameState.assetPrices[asset];
    const priceHistory = gameState.priceHistory[asset];
    const previousPrice = priceHistory.length > 1 ? priceHistory[priceHistory.length - 2] : currentPrice;
    
    const priceChange = currentPrice - previousPrice;
    const percentChange = (priceChange / previousPrice) * 100;
    
    const holdings = playerState.portfolio[asset] || 0;
    const value = holdings * currentPrice;
    
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${asset}</td>
      <td>${formatCurrency(currentPrice)}</td>
      <td class="${percentChange >= 0 ? 'positive' : 'negative'}">
        ${percentChange >= 0 ? '+' : ''}${percentChange.toFixed(2)}%
      </td>
      <td>${holdings.toFixed(2)}</td>
      <td>${formatCurrency(value)}</td>
    `;
    
    tbody.appendChild(row);
  }
}

// Update trade history table
function updateTradeHistoryTable(playerState) {
  const tbody = uiElements.tradeHistoryTable.querySelector('tbody');
  tbody.innerHTML = '';
  
  // Sort trade history by timestamp (newest first)
  const sortedHistory = [...playerState.tradeHistory].reverse();
  
  for (const trade of sortedHistory) {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${trade.round || '-'}</td>
      <td>${trade.action === 'buy' ? 'Buy' : 'Sell'}</td>
      <td>${trade.asset}</td>
      <td>${trade.quantity.toFixed(2)}</td>
      <td>${formatCurrency(trade.price)}</td>
      <td>${formatCurrency(trade.action === 'buy' ? trade.cost : trade.value)}</td>
    `;
    
    tbody.appendChild(row);
  }
}

// Update game results
function updateGameResults(playerState) {
  const startingValue = 10000; // Initial cash
  const finalValue = playerState.totalValue;
  const totalReturnValue = ((finalValue - startingValue) / startingValue) * 100;
  const rounds = playerState.portfolioValueHistory.length - 1;
  const annualizedReturnValue = Math.pow((1 + totalReturnValue / 100), (4 / rounds)) - 1;
  
  uiElements.startingValue.textContent = formatCurrency(startingValue);
  uiElements.finalValue.textContent = formatCurrency(finalValue);
  uiElements.totalReturn.textContent = `${totalReturnValue >= 0 ? '+' : ''}${totalReturnValue.toFixed(2)}%`;
  uiElements.annualizedReturn.textContent = `${annualizedReturnValue >= 0 ? '+' : ''}${(annualizedReturnValue * 100).toFixed(2)}%`;
  
  // Update results chart
  window.Charts.createResultsChart(playerState.portfolioValueHistory);
}

// Update leaderboard table
function updateLeaderboardTable(leaderboardData) {
  const tbody = uiElements.leaderboardTable.querySelector('tbody');
  tbody.innerHTML = '';
  
  leaderboardData.forEach((entry, index) => {
    const row = document.createElement('tr');
    const returnValue = ((entry.final_value - 10000) / 10000) * 100;
    
    row.innerHTML = `
      <td>${index + 1}</td>
      <td>${entry.user_name}</td>
      <td>${formatCurrency(entry.final_value)}</td>
      <td class="${returnValue >= 0 ? 'positive' : 'negative'}">
        ${returnValue >= 0 ? '+' : ''}${returnValue.toFixed(2)}%
      </td>
    `;
    
    tbody.appendChild(row);
  });
}

// Update participants list in waiting room
function updateParticipantsList(participants) {
  uiElements.participantsList.innerHTML = '';
  
  participants.forEach(participant => {
    const li = document.createElement('li');
    li.textContent = participant.name;
    uiElements.participantsList.appendChild(li);
  });
}

// Show notification
function showNotification(message, type = 'info', duration = 3000) {
  uiElements.notification.textContent = message;
  uiElements.notification.className = `notification ${type}`;
  uiElements.notification.classList.remove('hidden');
  
  setTimeout(() => {
    uiElements.notification.classList.add('hidden');
  }, duration);
}

// Format currency
function formatCurrency(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(value);
}

// Setup percentage buttons for trading
function setupPercentageButtons(gameState, playerState) {
  uiElements.percentageBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const percentage = parseInt(btn.getAttribute('data-percentage')) / 100;
      const action = uiElements.actionSelect.value;
      const asset = uiElements.assetSelect.value;
      
      if (action === 'buy') {
        const maxCash = playerState.cash;
        const price = gameState.assetPrices[asset];
        const maxQuantity = Math.floor((maxCash * percentage) / price);
        
        uiElements.quantityInput.value = maxQuantity;
        uiElements.amountInput.value = (maxQuantity * price).toFixed(2);
      } else if (action === 'sell') {
        const currentQuantity = playerState.portfolio[asset] || 0;
        const sellQuantity = currentQuantity * percentage;
        const price = gameState.assetPrices[asset];
        
        uiElements.quantityInput.value = sellQuantity.toFixed(2);
        uiElements.amountInput.value = (sellQuantity * price).toFixed(2);
      }
    });
  });
}

// Synchronize quantity and amount inputs
function setupInputSynchronization(gameState) {
  uiElements.quantityInput.addEventListener('input', () => {
    const quantity = parseFloat(uiElements.quantityInput.value) || 0;
    const asset = uiElements.assetSelect.value;
    const price = gameState.assetPrices[asset];
    
    uiElements.amountInput.value = (quantity * price).toFixed(2);
  });
  
  uiElements.amountInput.addEventListener('input', () => {
    const amount = parseFloat(uiElements.amountInput.value) || 0;
    const asset = uiElements.assetSelect.value;
    const price = gameState.assetPrices[asset];
    
    uiElements.quantityInput.value = (amount / price).toFixed(2);
  });
  
  uiElements.assetSelect.addEventListener('change', () => {
    const quantity = parseFloat(uiElements.quantityInput.value) || 0;
    const asset = uiElements.assetSelect.value;
    const price = gameState.assetPrices[asset];
    
    uiElements.amountInput.value = (quantity * price).toFixed(2);
  });
}

// Export functions
window.UIController = {
  elements: uiElements,
  showSection,
  showUserInfo,
  setupTabs,
  setupChartTabs,
  updateDashboard,
  updateGameResults,
  updateLeaderboardTable,
  updateParticipantsList,
  showNotification,
  setupPercentageButtons,
  setupInputSynchronization
};
