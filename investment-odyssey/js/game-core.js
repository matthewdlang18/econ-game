/**
 * Investment Odyssey - Game Core Logic
 * Handles game state, asset price generation, and portfolio calculations
 */

// Asset class definitions with risk-return characteristics
const assetClasses = {
  sp500: { 
    name: "S&P 500", 
    avgReturn: 0.115, // 11.5% average annual return
    stdDev: 0.195,    // 19.5% standard deviation
    color: '#3a86ff'
  },
  bonds: { 
    name: "Bonds", 
    avgReturn: 0.033, // 3.3% average annual return
    stdDev: 0.03,     // 3.0% standard deviation
    color: '#8338ec'
  },
  real_estate: { 
    name: "Real Estate", 
    avgReturn: 0.044, // 4.4% average annual return
    stdDev: 0.062,    // 6.2% standard deviation
    color: '#ff006e'
  },
  gold: { 
    name: "Gold", 
    avgReturn: 0.065, // 6.5% average annual return
    stdDev: 0.208,    // 20.8% standard deviation
    color: '#ffbe0b'
  },
  commodities: { 
    name: "Commodities", 
    avgReturn: 0.082, // 8.2% average annual return
    stdDev: 0.152,    // 15.2% standard deviation
    color: '#fb5607'
  },
  bitcoin: { 
    name: "Bitcoin", 
    avgReturn: 0.5,   // 50% average annual return
    stdDev: 1.0,      // 100% standard deviation
    color: '#f77f00'
  }
};

// Correlation matrix for asset returns (simplified)
const correlationMatrix = {
  sp500: { sp500: 1.0, bonds: -0.3, real_estate: 0.6, gold: 0.1, commodities: 0.4, bitcoin: 0.2 },
  bonds: { sp500: -0.3, bonds: 1.0, real_estate: 0.2, gold: 0.2, commodities: -0.1, bitcoin: -0.2 },
  real_estate: { sp500: 0.6, bonds: 0.2, real_estate: 1.0, gold: 0.1, commodities: 0.3, bitcoin: 0.1 },
  gold: { sp500: 0.1, bonds: 0.2, gold: 1.0, real_estate: 0.1, commodities: 0.6, bitcoin: 0.3 },
  commodities: { sp500: 0.4, bonds: -0.1, real_estate: 0.3, gold: 0.6, commodities: 1.0, bitcoin: 0.2 },
  bitcoin: { sp500: 0.2, bonds: -0.2, real_estate: 0.1, gold: 0.3, commodities: 0.2, bitcoin: 1.0 }
};

// Game state object
class GameState {
  constructor(maxRounds = 20) {
    this.roundNumber = 0;
    this.maxRounds = maxRounds;
    this.assetPrices = this.initializeAssetPrices();
    this.priceHistory = {};
    this.cpi = 100; // Starting CPI (inflation index)
    this.cpiHistory = [100];
    
    // Initialize price history for each asset
    Object.keys(assetClasses).forEach(asset => {
      this.priceHistory[asset] = [this.assetPrices[asset]];
    });
  }

  // Initialize asset prices
  initializeAssetPrices() {
    return {
      sp500: 100,
      bonds: 100,
      real_estate: 100,
      gold: 100,
      commodities: 100,
      bitcoin: 100
    };
  }

  // Generate new asset prices for the next round
  generateNewPrices() {
    // Generate random returns with correlation
    const randomReturns = this.generateCorrelatedReturns();
    
    // Calculate new prices based on returns
    const newPrices = {};
    const priceChanges = {};
    
    Object.keys(assetClasses).forEach(asset => {
      // Special logic for Bitcoin (4-year cycle simulation)
      if (asset === 'bitcoin') {
        // Simulate Bitcoin halving cycle (every 4 years)
        const cyclePosition = this.roundNumber % 16; // 16 rounds = 4 years in our simulation
        
        // Potential for major crash or bull run
        if (cyclePosition === 0 && Math.random() < 0.3) {
          // 30% chance of major crash at cycle start
          randomReturns[asset] = -0.5 - Math.random() * 0.3; // -50% to -80%
        } else if (cyclePosition >= 12 && Math.random() < 0.4) {
          // 40% chance of bull run in last year of cycle
          randomReturns[asset] = 0.5 + Math.random() * 1.5; // +50% to +200%
        }
      }
      
      // Calculate new price
      const oldPrice = this.assetPrices[asset];
      const newPrice = oldPrice * (1 + randomReturns[asset]);
      
      // Store new price and price change
      newPrices[asset] = Math.max(newPrice, 0.01); // Ensure price doesn't go below 0.01
      priceChanges[asset] = (newPrices[asset] - oldPrice) / oldPrice;
    });
    
    // Update asset prices and price history
    this.assetPrices = newPrices;
    Object.keys(assetClasses).forEach(asset => {
      this.priceHistory[asset].push(newPrices[asset]);
    });
    
    // Update CPI (inflation)
    this.updateCPI();
    
    return { prices: newPrices, changes: priceChanges };
  }

  // Generate correlated random returns for assets
  generateCorrelatedReturns() {
    // Generate independent random normal variables
    const independentReturns = {};
    Object.keys(assetClasses).forEach(asset => {
      // Generate random normal variable using Box-Muller transform
      const u1 = Math.random();
      const u2 = Math.random();
      const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
      
      // Scale by asset's standard deviation and add mean
      const annualizedReturn = assetClasses[asset].avgReturn / 20; // Divide by 20 for per-round return
      const annualizedStdDev = assetClasses[asset].stdDev / Math.sqrt(20); // Scale for per-round volatility
      
      independentReturns[asset] = annualizedReturn + annualizedStdDev * z;
    });
    
    // Apply correlation
    const correlatedReturns = {};
    Object.keys(assetClasses).forEach(asset => {
      correlatedReturns[asset] = independentReturns[asset];
      
      // Add correlation effects (simplified approach)
      Object.keys(assetClasses).forEach(otherAsset => {
        if (asset !== otherAsset) {
          const correlation = correlationMatrix[asset][otherAsset];
          correlatedReturns[asset] += correlation * 0.1 * independentReturns[otherAsset];
        }
      });
    });
    
    return correlatedReturns;
  }

  // Update CPI (inflation)
  updateCPI() {
    // Generate random inflation between 0% and 5% annualized, divided by 20 for per-round
    const inflationRate = (0.02 + Math.random() * 0.03) / 20;
    this.cpi = this.cpi * (1 + inflationRate);
    this.cpiHistory.push(this.cpi);
  }

  // Generate cash injection (income simulation)
  generateCashInjection(playerState) {
    // Every 4 rounds (1 year), add income based on portfolio value
    if (this.roundNumber % 4 === 0 && this.roundNumber > 0) {
      const portfolioValue = playerState.calculatePortfolioValue(this.assetPrices);
      const incomeRate = 0.02 + Math.random() * 0.02; // 2-4% of portfolio value
      const income = portfolioValue * incomeRate;
      
      return Math.round(income * 100) / 100; // Round to 2 decimal places
    }
    
    return 0;
  }

  // Advance to next round
  nextRound() {
    if (this.roundNumber < this.maxRounds) {
      this.roundNumber++;
      return this.generateNewPrices();
    }
    return null;
  }

  // Check if game is over
  isGameOver() {
    return this.roundNumber >= this.maxRounds;
  }
}

// Player state object
class PlayerState {
  constructor(initialCash = 10000) {
    this.cash = initialCash;
    this.portfolio = {
      sp500: 0,
      bonds: 0,
      real_estate: 0,
      gold: 0,
      commodities: 0,
      bitcoin: 0
    };
    this.tradeHistory = [];
    this.portfolioValueHistory = [initialCash];
  }

  // Execute a trade
  executeTrade(asset, action, amount, assetPrice) {
    if (!assetClasses[asset]) {
      return { success: false, message: "Invalid asset" };
    }
    
    if (action === 'buy') {
      // Check if player has enough cash
      if (amount > this.cash) {
        return { success: false, message: "Not enough cash" };
      }
      
      // Calculate quantity to buy
      const quantity = amount / assetPrice;
      
      // Update portfolio and cash
      this.portfolio[asset] += quantity;
      this.cash -= amount;
      
      // Add to trade history
      this.tradeHistory.push({
        round: gameState.roundNumber,
        asset: asset,
        action: 'buy',
        amount: amount,
        price: assetPrice,
        quantity: quantity
      });
      
      return { success: true, message: `Bought ${quantity.toFixed(4)} ${assetClasses[asset].name} for $${amount.toFixed(2)}` };
    } 
    else if (action === 'sell') {
      // Calculate maximum amount that can be sold
      const maxAmount = this.portfolio[asset] * assetPrice;
      
      // Check if player has enough of the asset
      if (amount > maxAmount) {
        return { success: false, message: "Not enough of this asset to sell" };
      }
      
      // Calculate quantity to sell
      const quantity = amount / assetPrice;
      
      // Update portfolio and cash
      this.portfolio[asset] -= quantity;
      this.cash += amount;
      
      // Add to trade history
      this.tradeHistory.push({
        round: gameState.roundNumber,
        asset: asset,
        action: 'sell',
        amount: amount,
        price: assetPrice,
        quantity: quantity
      });
      
      return { success: true, message: `Sold ${quantity.toFixed(4)} ${assetClasses[asset].name} for $${amount.toFixed(2)}` };
    }
    
    return { success: false, message: "Invalid action" };
  }

  // Calculate total portfolio value
  calculatePortfolioValue(assetPrices) {
    let totalValue = this.cash;
    
    Object.keys(this.portfolio).forEach(asset => {
      totalValue += this.portfolio[asset] * assetPrices[asset];
    });
    
    return totalValue;
  }

  // Update portfolio value history
  updatePortfolioHistory(assetPrices) {
    const portfolioValue = this.calculatePortfolioValue(assetPrices);
    this.portfolioValueHistory.push(portfolioValue);
    return portfolioValue;
  }

  // Get portfolio allocation percentages
  getPortfolioAllocation(assetPrices) {
    const totalValue = this.calculatePortfolioValue(assetPrices);
    const allocation = { cash: (this.cash / totalValue) * 100 };
    
    Object.keys(this.portfolio).forEach(asset => {
      allocation[asset] = (this.portfolio[asset] * assetPrices[asset] / totalValue) * 100;
    });
    
    return allocation;
  }

  // Add cash to player's balance (for income simulation)
  addCash(amount) {
    this.cash += amount;
    return this.cash;
  }

  // Sell all assets
  sellAllAssets(assetPrices) {
    let totalSold = 0;
    
    Object.keys(this.portfolio).forEach(asset => {
      const quantity = this.portfolio[asset];
      if (quantity > 0) {
        const amount = quantity * assetPrices[asset];
        this.portfolio[asset] = 0;
        this.cash += amount;
        totalSold += amount;
        
        // Add to trade history
        this.tradeHistory.push({
          round: gameState.roundNumber,
          asset: asset,
          action: 'sell',
          amount: amount,
          price: assetPrices[asset],
          quantity: quantity
        });
      }
    });
    
    return totalSold;
  }
}

// Initialize game state and player state
let gameState = new GameState();
let playerState = new PlayerState();

// Export objects for use in other modules
if (typeof window !== 'undefined') {
  window.gameState = gameState;
  window.playerState = playerState;
  window.GameState = GameState;
  window.PlayerState = PlayerState;
  window.assetClasses = assetClasses;
}
