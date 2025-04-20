/**
 * Investment Odyssey - Game UI
 * Handles UI updates, charts, and visualizations
 */

// Initialize charts
let allocationChart = null;
let priceChart = null;
let finalAllocationChart = null;

// Format currency
function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', { 
    minimumFractionDigits: 2,
    maximumFractionDigits: 2 
  }).format(amount);
}

// Format percentage
function formatPercentage(percentage) {
  return new Intl.NumberFormat('en-US', { 
    minimumFractionDigits: 2,
    maximumFractionDigits: 2 
  }).format(percentage) + '%';
}

// Update portfolio display
function updatePortfolioDisplay() {
  // Update portfolio value
  const portfolioValue = playerState.calculatePortfolioValue(gameState.assetPrices);
  document.getElementById('portfolio-value').textContent = formatCurrency(portfolioValue);
  
  // Update cash balance
  document.getElementById('cash-balance').textContent = formatCurrency(playerState.cash);
  
  // Update portfolio progress bar
  const progressPercentage = (portfolioValue / 10000 - 1) * 100;
  const progressBar = document.getElementById('portfolio-progress');
  progressBar.style.width = `${Math.max(0, progressPercentage)}%`;
  
  if (progressPercentage > 0) {
    progressBar.classList.remove('bg-danger');
    progressBar.classList.add('bg-success');
  } else {
    progressBar.classList.remove('bg-success');
    progressBar.classList.add('bg-danger');
  }
  
  // Update allocation chart
  updateAllocationChart();
}

// Update market data display
function updateMarketDisplay(priceChanges) {
  const marketDataTable = document.getElementById('market-data');
  marketDataTable.innerHTML = '';
  
  Object.keys(assetClasses).forEach(asset => {
    const row = document.createElement('tr');
    const change = priceChanges ? priceChanges[asset] : 0;
    const changeClass = change > 0 ? 'price-up' : (change < 0 ? 'price-down' : 'price-unchanged');
    const changeSign = change > 0 ? '+' : '';
    
    row.innerHTML = `
      <td>${assetClasses[asset].name}</td>
      <td>$${formatCurrency(gameState.assetPrices[asset])}</td>
      <td class="${changeClass}">${changeSign}${formatPercentage(change * 100)}</td>
    `;
    
    // Add animation for price changes
    if (priceChanges) {
      if (change > 0) {
        row.classList.add('flash-green');
      } else if (change < 0) {
        row.classList.add('flash-red');
      }
    }
    
    marketDataTable.appendChild(row);
  });
  
  // Update price chart
  updatePriceChart();
}

// Update trade history display
function updateTradeHistory() {
  const tradeHistoryTable = document.getElementById('trade-history');
  tradeHistoryTable.innerHTML = '';
  
  // Display most recent trades first
  const reversedHistory = [...playerState.tradeHistory].reverse();
  
  reversedHistory.slice(0, 10).forEach(trade => {
    const row = document.createElement('tr');
    const actionClass = trade.action === 'buy' ? 'trade-buy' : 'trade-sell';
    
    row.innerHTML = `
      <td>${trade.round}</td>
      <td>${assetClasses[trade.asset].name}</td>
      <td class="${actionClass}">${trade.action.toUpperCase()}</td>
      <td>$${formatCurrency(trade.amount)}</td>
      <td>$${formatCurrency(trade.price)}</td>
      <td>${trade.quantity.toFixed(4)}</td>
    `;
    
    tradeHistoryTable.appendChild(row);
  });
}

// Initialize allocation chart
function initAllocationChart() {
  const ctx = document.getElementById('allocation-chart').getContext('2d');
  
  allocationChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Cash', ...Object.values(assetClasses).map(asset => asset.name)],
      datasets: [{
        data: [100, 0, 0, 0, 0, 0, 0], // Start with 100% cash
        backgroundColor: ['#a0a0a0', ...Object.values(assetClasses).map(asset => asset.color)]
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'right',
          labels: {
            font: {
              size: 10
            }
          }
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const label = context.label || '';
              const value = context.raw || 0;
              return `${label}: ${value.toFixed(1)}%`;
            }
          }
        }
      }
    }
  });
}

// Update allocation chart
function updateAllocationChart() {
  if (!allocationChart) {
    initAllocationChart();
    return;
  }
  
  const allocation = playerState.getPortfolioAllocation(gameState.assetPrices);
  
  allocationChart.data.datasets[0].data = [
    allocation.cash,
    allocation.sp500,
    allocation.bonds,
    allocation.real_estate,
    allocation.gold,
    allocation.commodities,
    allocation.bitcoin
  ];
  
  allocationChart.update();
}

// Initialize price chart
function initPriceChart() {
  const ctx = document.getElementById('price-chart').getContext('2d');
  
  priceChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: Array.from({ length: gameState.roundNumber + 1 }, (_, i) => i),
      datasets: Object.keys(assetClasses).map(asset => ({
        label: assetClasses[asset].name,
        data: gameState.priceHistory[asset],
        borderColor: assetClasses[asset].color,
        backgroundColor: assetClasses[asset].color + '20',
        borderWidth: 2,
        tension: 0.1,
        pointRadius: 1,
        pointHoverRadius: 3
      }))
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          title: {
            display: true,
            text: 'Round'
          }
        },
        y: {
          title: {
            display: true,
            text: 'Price'
          }
        }
      },
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            boxWidth: 12,
            font: {
              size: 10
            }
          }
        }
      }
    }
  });
}

// Update price chart
function updatePriceChart() {
  if (!priceChart) {
    initPriceChart();
    return;
  }
  
  priceChart.data.labels = Array.from({ length: gameState.roundNumber + 1 }, (_, i) => i);
  
  Object.keys(assetClasses).forEach((asset, index) => {
    priceChart.data.datasets[index].data = gameState.priceHistory[asset];
  });
  
  priceChart.update();
}

// Initialize final allocation chart for game end modal
function initFinalAllocationChart() {
  const ctx = document.getElementById('final-allocation-chart').getContext('2d');
  
  const allocation = playerState.getPortfolioAllocation(gameState.assetPrices);
  
  finalAllocationChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Cash', ...Object.values(assetClasses).map(asset => asset.name)],
      datasets: [{
        data: [
          allocation.cash,
          allocation.sp500,
          allocation.bonds,
          allocation.real_estate,
          allocation.gold,
          allocation.commodities,
          allocation.bitcoin
        ],
        backgroundColor: ['#a0a0a0', ...Object.values(assetClasses).map(asset => asset.color)]
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'right',
          labels: {
            font: {
              size: 10
            }
          }
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const label = context.label || '';
              const value = context.raw || 0;
              return `${label}: ${value.toFixed(1)}%`;
            }
          }
        }
      }
    }
  });
}

// Show game end modal
function showGameEndModal() {
  const portfolioValue = playerState.calculatePortfolioValue(gameState.assetPrices);
  const returnPercentage = ((portfolioValue / 10000) - 1) * 100;
  
  document.getElementById('final-value').textContent = formatCurrency(portfolioValue);
  document.getElementById('final-return').textContent = formatPercentage(returnPercentage);
  
  // Initialize final allocation chart
  initFinalAllocationChart();
  
  // Show modal
  const gameEndModal = new bootstrap.Modal(document.getElementById('game-end-modal'));
  gameEndModal.show();
  
  // Save to leaderboard if user is logged in
  saveGameToLeaderboard(portfolioValue);
}

// Save game to leaderboard
async function saveGameToLeaderboard(finalValue) {
  // Check if user is logged in
  const userInfo = document.getElementById('user-info');
  if (userInfo.classList.contains('d-none')) {
    console.log('User not logged in, not saving to leaderboard');
    return;
  }
  
  try {
    const { data: profile, error } = await supabase.auth.getUser();
    if (error || !profile) {
      console.error('Error getting user profile:', error);
      return;
    }
    
    // Get user name from display
    const userName = document.getElementById('user-name').textContent;
    
    // Save to leaderboard table
    const { data, error: saveError } = await supabase
      .from('leaderboard')
      .insert({
        user_id: profile.id,
        user_name: userName,
        game_type: 'single_player',
        game_mode: 'standard',
        final_portfolio: finalValue,
        created_at: new Date().toISOString()
      });
    
    if (saveError) {
      console.error('Error saving to leaderboard:', saveError);
    } else {
      console.log('Game saved to leaderboard');
    }
  } catch (err) {
    console.error('Error saving game:', err);
  }
}

// Update round display
function updateRoundDisplay() {
  document.getElementById('current-round').textContent = gameState.roundNumber;
  document.getElementById('max-rounds').textContent = gameState.maxRounds;
}

// Initialize game UI
function initGameUI() {
  updateRoundDisplay();
  updatePortfolioDisplay();
  updateMarketDisplay();
  updateTradeHistory();
}

// Export functions for use in other modules
if (typeof window !== 'undefined') {
  window.gameUI = {
    initGameUI,
    updatePortfolioDisplay,
    updateMarketDisplay,
    updateTradeHistory,
    updateRoundDisplay,
    showGameEndModal,
    formatCurrency,
    formatPercentage
  };
}
