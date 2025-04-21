// Investment Odyssey - Game State Management

// Asset return characteristics
const assetReturns = {
  'S&P 500': { mean: 0.1151, stdDev: 0.1949, min: -0.43, max: 0.50 },
  'Bonds': { mean: 0.0334, stdDev: 0.0301, min: 0.0003, max: 0.14 },
  'Real Estate': { mean: 0.0439, stdDev: 0.0620, min: -0.12, max: 0.24 },
  'Gold': { mean: 0.0648, stdDev: 0.2076, min: -0.32, max: 1.25 },
  'Commodities': { mean: 0.0815, stdDev: 0.1522, min: -0.25, max: 2.00 },
  'Bitcoin': { mean: 0.50, stdDev: 1.00, min: -0.73, max: 2.50 }
};

// Correlation matrix
const correlationMatrix = [
  [1.0000, -0.5169, 0.3425, 0.0199, 0.1243, 0.4057],  // S&P 500
  [-0.5169, 1.0000, 0.0176, 0.0289, -0.0235, -0.2259], // Bonds
  [0.3425, 0.0176, 1.0000, -0.4967, -0.0334, 0.1559],  // Real Estate
  [0.0199, 0.0289, -0.4967, 1.0000, 0.0995, -0.5343],  // Gold
  [0.1243, -0.0235, -0.0334, 0.0995, 1.0000, 0.0436],  // Commodities
  [0.4057, -0.2259, 0.1559, -0.5343, 0.0436, 1.0000]   // Bitcoin
];

// Initial game state
function createInitialGameState() {
  return {
    roundNumber: 0,
    assetPrices: {
      'S&P 500': 100,
      'Bonds': 100,
      'Real Estate': 5000,
      'Gold': 3000,
      'Commodities': 100,
      'Bitcoin': 50000
    },
    priceHistory: {
      'S&P 500': [100],
      'Bonds': [100],
      'Real Estate': [5000],
      'Gold': [3000],
      'Commodities': [100],
      'Bitcoin': [50000]
    },
    cpi: 100,
    cpiHistory: [100],
    lastBitcoinCrashRound: 0,
    bitcoinShockRange: [-0.5, -0.75]
  };
}

// Initial player state
function createInitialPlayerState() {
  return {
    cash: 10000,
    portfolio: {
      'S&P 500': 0,
      'Bonds': 0,
      'Real Estate': 0,
      'Gold': 0,
      'Commodities': 0,
      'Bitcoin': 0
    },
    tradeHistory: [],
    portfolioValueHistory: [10000],
    totalValue: 10000
  };
}

// Generate correlated returns for assets
function generateCorrelatedReturns(gameState) {
  // Asset names and their parameters
  const assetNames = Object.keys(assetReturns);
  const means = assetNames.map(asset => assetReturns[asset].mean);
  const stdDevs = assetNames.map(asset => assetReturns[asset].stdDev);

  // Generate uncorrelated standard normal random variables
  const uncorrelatedZ = [];
  for (let i = 0; i < assetNames.length; i++) {
    // Box-Muller transform for normal distribution
    const u1 = Math.random();
    const u2 = Math.random();
    const z = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
    uncorrelatedZ.push(z);
  }

  // Apply correlation matrix to get correlated returns
  const correlatedReturns = {};
  
  // Handle Bitcoin separately
  const bitcoinReturn = generateBitcoinReturn(gameState);
  correlatedReturns['Bitcoin'] = bitcoinReturn;

  // Generate correlated returns for other assets
  for (let i = 0; i < assetNames.length - 1; i++) {
    const asset = assetNames[i];
    if (asset === 'Bitcoin') continue;

    let weightedReturn = 0;
    for (let j = 0; j < assetNames.length; j++) {
      weightedReturn += correlationMatrix[i][j] * uncorrelatedZ[j];
    }

    let assetReturn = means[i] + stdDevs[i] * weightedReturn;

    // Ensure return is within bounds
    assetReturn = Math.max(
      assetReturns[asset].min,
      Math.min(assetReturns[asset].max, assetReturn)
    );

    correlatedReturns[asset] = assetReturn;
  }

  return correlatedReturns;
}

// Generate Bitcoin's special return behavior
function generateBitcoinReturn(gameState) {
  const bitcoinPrice = gameState.assetPrices['Bitcoin'];
  let bitcoinReturn;

  // Bitcoin has special growth patterns based on its price
  if (bitcoinPrice < 10000) {
    // Low price: rapid growth
    bitcoinReturn = 2 + Math.random() * 2; // Return between 200% and 400%
  } else if (bitcoinPrice >= 1000000) {
    // Very high price: crash
    bitcoinReturn = -0.3 - Math.random() * 0.2; // Return between -30% and -50%
  } else {
    // Normal price range: correlated with other assets but with high volatility
    // Standard correlation-based return generation
    const u1 = Math.random();
    const u2 = Math.random();
    const z = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
    
    // Base return with Bitcoin's high volatility
    bitcoinReturn = assetReturns['Bitcoin'].mean + assetReturns['Bitcoin'].stdDev * z;

    // Adjust Bitcoin's return based on its current price
    const priceThreshold = 100000;
    if (bitcoinPrice > priceThreshold) {
      // Calculate how many increments above threshold
      const incrementsAboveThreshold = Math.max(0, (bitcoinPrice - priceThreshold) / 50000);

      // Reduce volatility as price grows (more mature asset)
      const volatilityReduction = Math.min(0.7, incrementsAboveThreshold * 0.05);
      const adjustedStdDev = assetReturns['Bitcoin'].stdDev * (1 - volatilityReduction);
      
      // Recalculate return with reduced volatility
      bitcoinReturn = assetReturns['Bitcoin'].mean + adjustedStdDev * z;
    }

    // Check for Bitcoin crash (4-year cycle)
    if (gameState.roundNumber - gameState.lastBitcoinCrashRound >= 4) {
      if (Math.random() < 0.5) { // 50% chance of crash after 4 rounds
        // Apply shock based on current shock range
        bitcoinReturn = gameState.bitcoinShockRange[0] + Math.random() * 
          (gameState.bitcoinShockRange[1] - gameState.bitcoinShockRange[0]);
        
        // Update last crash round
        gameState.lastBitcoinCrashRound = gameState.roundNumber;
        
        // Update shock range for next crash (less severe but still negative)
        gameState.bitcoinShockRange = [
          Math.min(Math.max(gameState.bitcoinShockRange[0] + 0.1, -0.5), -0.05),
          Math.min(Math.max(gameState.bitcoinShockRange[1] + 0.1, -0.75), -0.15)
        ];
      }
    }
  }

  // Ensure Bitcoin return is within bounds
  bitcoinReturn = Math.max(
    assetReturns['Bitcoin'].min,
    Math.min(assetReturns['Bitcoin'].max, bitcoinReturn)
  );

  return bitcoinReturn;
}

// Update CPI (inflation)
function updateCPI(gameState) {
  // Store current CPI in history
  gameState.cpiHistory.push(gameState.cpi);
  
  // Generate random CPI change (between -1% and 3%)
  const cpiChange = -0.01 + Math.random() * 0.04;
  
  // Update CPI
  gameState.cpi = gameState.cpi * (1 + cpiChange);
  
  return gameState;
}

// Calculate cash injection (for future rounds)
function calculateCashInjection(gameState) {
  // Base amount increases each round
  const baseAmount = 5000 + (gameState.roundNumber * 500);
  const variability = 1000;
  
  // Generate random cash injection with increasing trend
  const cashInjection = baseAmount + (Math.random() * 2 - 1) * variability;
  
  return Math.max(0, cashInjection);
}

// Advance to next round
function advanceToNextRound(gameState) {
  // Increment round number
  gameState.roundNumber++;
  
  // Generate returns for all assets
  const returns = generateCorrelatedReturns(gameState);
  
  // Update asset prices
  for (const asset in gameState.assetPrices) {
    const currentPrice = gameState.assetPrices[asset];
    const newPrice = currentPrice * (1 + returns[asset]);
    gameState.assetPrices[asset] = newPrice;
    gameState.priceHistory[asset].push(newPrice);
  }
  
  // Update CPI
  updateCPI(gameState);
  
  return gameState;
}

// Calculate portfolio value
function calculatePortfolioValue(playerState, assetPrices) {
  let portfolioValue = 0;
  
  for (const [asset, quantity] of Object.entries(playerState.portfolio)) {
    const price = assetPrices[asset] || 0;
    portfolioValue += price * quantity;
  }
  
  return portfolioValue;
}

// Calculate total value (portfolio + cash)
function calculateTotalValue(playerState, assetPrices) {
  const portfolioValue = calculatePortfolioValue(playerState, assetPrices);
  return portfolioValue + playerState.cash;
}

// Update player state after round advancement
function updatePlayerState(playerState, gameState) {
  // Calculate new portfolio value
  const portfolioValue = calculatePortfolioValue(playerState, gameState.assetPrices);
  
  // Calculate new total value
  const totalValue = portfolioValue + playerState.cash;
  
  // Update portfolio value history
  playerState.portfolioValueHistory.push(totalValue);
  
  // Update total value
  playerState.totalValue = totalValue;
  
  return playerState;
}

// Export functions
window.GameState = {
  createInitialGameState,
  createInitialPlayerState,
  advanceToNextRound,
  calculatePortfolioValue,
  calculateTotalValue,
  updatePlayerState
};
