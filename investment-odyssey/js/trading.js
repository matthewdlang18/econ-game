// Investment Odyssey - Trading Functions

// Buy asset function
function buyAsset(playerState, gameState, asset, quantity) {
  const price = gameState.assetPrices[asset];
  const cost = price * quantity;
  
  // Validate transaction
  if (cost > playerState.cash) {
    return { success: false, message: "Not enough cash" };
  }
  
  // Update player state
  playerState.cash -= cost;
  playerState.portfolio[asset] = (playerState.portfolio[asset] || 0) + quantity;
  
  // Record transaction
  playerState.tradeHistory.push({
    asset: asset,
    action: 'buy',
    quantity: quantity,
    price: price,
    cost: cost,
    timestamp: new Date().toISOString()
  });
  
  // Update total value
  playerState.totalValue = window.GameState.calculateTotalValue(playerState, gameState.assetPrices);
  
  return { 
    success: true, 
    message: `Bought ${quantity} ${asset} for $${cost.toFixed(2)}` 
  };
}

// Sell asset function
function sellAsset(playerState, gameState, asset, quantity) {
  const currentQuantity = playerState.portfolio[asset] || 0;
  const price = gameState.assetPrices[asset];
  
  // Validate transaction
  if (quantity > currentQuantity) {
    return { success: false, message: "Not enough assets to sell" };
  }
  
  const value = price * quantity;
  
  // Update player state
  playerState.cash += value;
  playerState.portfolio[asset] -= quantity;
  
  // Remove asset from portfolio if quantity is 0
  if (playerState.portfolio[asset] <= 0) {
    delete playerState.portfolio[asset];
  }
  
  // Record transaction
  playerState.tradeHistory.push({
    asset: asset,
    action: 'sell',
    quantity: quantity,
    price: price,
    value: value,
    timestamp: new Date().toISOString()
  });
  
  // Update total value
  playerState.totalValue = window.GameState.calculateTotalValue(playerState, gameState.assetPrices);
  
  return { 
    success: true, 
    message: `Sold ${quantity} ${asset} for $${value.toFixed(2)}` 
  };
}

// Calculate maximum quantity that can be bought with available cash
function calculateMaxBuyQuantity(playerState, gameState, asset) {
  const price = gameState.assetPrices[asset];
  if (price <= 0) return 0;
  
  return Math.floor(playerState.cash / price);
}

// Calculate percentage of portfolio for an asset
function calculateAssetPercentage(playerState, gameState, asset) {
  const portfolioValue = window.GameState.calculatePortfolioValue(playerState, gameState.assetPrices);
  if (portfolioValue <= 0) return 0;
  
  const assetQuantity = playerState.portfolio[asset] || 0;
  const assetValue = assetQuantity * gameState.assetPrices[asset];
  
  return (assetValue / portfolioValue) * 100;
}

// Export functions
window.Trading = {
  buyAsset,
  sellAsset,
  calculateMaxBuyQuantity,
  calculateAssetPercentage
};
