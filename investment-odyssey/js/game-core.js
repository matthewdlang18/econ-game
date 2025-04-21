/**
 * Game Core for Investment Odyssey
 *
 * This file contains the core game logic and state management.
 */

// Game state
let gameState = {
    gameId: null,
    roundNumber: 0,
    maxRounds: 20,
    assetPrices: {
        'S&P 500': 100.00,
        'Small Caps': 100.00,
        'Corporate Bonds': 100.00,
        'Treasury Bonds': 100.00,
        'Gold': 100.00,
        'Bitcoin': 50000.00 // Bitcoin starts at a higher price to match real-world scale
    },
    priceHistory: {
        'S&P 500': [],
        'Small Caps': [],
        'Corporate Bonds': [],
        'Treasury Bonds': [],
        'Gold': [],
        'Bitcoin': []
    },
    CPI: 100.00,
    CPIHistory: [],
    lastBitcoinCrashRound: 0,
    bitcoinShockRange: [-0.5, -0.75], // Initial shock range for Bitcoin crashes
    gameMode: 1 // 1 for single player, 2 for class mode
};

// Player state
let playerState = {
    userId: null,
    userName: null,
    cash: 10000.00,
    portfolio: {
        'S&P 500': 0,
        'Small Caps': 0,
        'Corporate Bonds': 0,
        'Treasury Bonds': 0,
        'Gold': 0,
        'Bitcoin': 0
    },
    tradeHistory: [],
    portfolioHistory: []
};

// Asset return characteristics
const assetReturns = {
    'S&P 500': { mean: 0.02, stdDev: 0.04, inflation: 0.0, min: -0.15, max: 0.20 },
    'Small Caps': { mean: 0.025, stdDev: 0.06, inflation: 0.0, min: -0.20, max: 0.30 },
    'Corporate Bonds': { mean: 0.01, stdDev: 0.02, inflation: -0.5, min: -0.10, max: 0.15 },
    'Treasury Bonds': { mean: 0.005, stdDev: 0.01, inflation: -0.8, min: -0.05, max: 0.10 },
    'Gold': { mean: 0.005, stdDev: 0.05, inflation: 0.7, min: -0.15, max: 0.25 },
    'Bitcoin': { mean: 0.50, stdDev: 1.00, inflation: 0.0, min: -0.73, max: 2.50 }
};

// Initialize game
function initializeGame() {
    try {
        console.log('Initializing game...');

        // Check if we have a saved game ID in localStorage
        const savedGameId = localStorage.getItem('investment_odyssey_game_id');

        // Reset game state
        gameState.gameId = savedGameId || (crypto.randomUUID ? crypto.randomUUID() :
            'game_' + Math.random().toString(36).substring(2, 15));

        // Save game ID to localStorage
        localStorage.setItem('investment_odyssey_game_id', gameState.gameId);

        gameState.roundNumber = 0;
        gameState.maxRounds = 20;
        gameState.assetPrices = {
            'S&P 500': 100.00,
            'Small Caps': 100.00,
            'Corporate Bonds': 100.00,
            'Treasury Bonds': 100.00,
            'Gold': 100.00,
            'Bitcoin': 50000.00 // Bitcoin starts at a higher price to match real-world scale
        };
        gameState.priceHistory = {
            'S&P 500': [],
            'Small Caps': [],
            'Corporate Bonds': [],
            'Treasury Bonds': [],
            'Gold': [],
            'Bitcoin': []
        };
        gameState.CPI = 100.00;
        gameState.CPIHistory = [];
        gameState.lastBitcoinCrashRound = 0;
        gameState.bitcoinShockRange = [-0.5, -0.75];

        // Get game mode from local storage or default to single (1)
        const storedGameMode = localStorage.getItem('game_mode');
        if (storedGameMode) {
            if (storedGameMode.toLowerCase() === 'class') {
                gameState.gameMode = 2; // Class mode
            } else {
                gameState.gameMode = 1; // Single player mode
            }
        } else {
            gameState.gameMode = 1; // Default to single player
        }

        // Reset player state
        playerState.cash = 10000.00;
        playerState.portfolio = {
            'S&P 500': 0,
            'Small Caps': 0,
            'Corporate Bonds': 0,
            'Treasury Bonds': 0,
            'Gold': 0,
            'Bitcoin': 0
        };
        playerState.tradeHistory = [];
        playerState.portfolioHistory = [];

        // Get user info from auth service
        const user = window.Service ? window.Service.getCurrentUser() : null;
        if (user) {
            playerState.userId = user.id;
            playerState.userName = user.name;
            console.log('User info loaded:', playerState.userId, playerState.userName);
        } else {
            // Generate a guest ID if not logged in
            playerState.userId = 'guest_' + Date.now();
            playerState.userName = 'Guest';
            console.log('Guest user created:', playerState.userId);
        }

        // We'll create the game record in Supabase in the startGame function
        // This ensures we have all the necessary data before creating the game

        console.log('Game initialized with ID:', gameState.gameId);
        return true;
    } catch (error) {
        console.error('Error initializing game:', error);
        return false;
    }
}

// Start game
async function startGame() {
    try {
        console.log('Starting game...');

        // Reset game
        initializeGame();

        // Create game in Supabase first
        const gameCreated = await createGameInSupabase();
        if (!gameCreated) {
            console.warn('Failed to create game in Supabase, but continuing with local game');
        }

        // Generate initial prices
        generateNewPrices();

        // Save initial state
        saveGameState();

        // Update UI
        updateUI();

        console.log('Game started successfully');
        return true;
    } catch (error) {
        console.error('Error starting game:', error);
        return false;
    }
}

// Generate new prices for all assets
function generateNewPrices() {
    try {
        console.log('Starting generateNewPrices function');

        // Save current prices to history
        for (const asset in gameState.assetPrices) {
            gameState.priceHistory[asset].push(gameState.assetPrices[asset]);
        }
        gameState.CPIHistory.push(gameState.CPI);

        // Generate inflation (CPI change)
        const inflationMean = 0.005; // 0.5% average inflation per round
        const inflationStdDev = 0.002; // Standard deviation of inflation
        const inflationChange = generateRandomReturn(inflationMean, inflationStdDev);
        gameState.CPI = gameState.CPI * (1 + inflationChange);

        // Generate new prices for each asset
        for (const asset in gameState.assetPrices) {
            const returns = assetReturns[asset];

            // Calculate inflation component
            const inflationComponent = inflationChange * returns.inflation;

            // Special case for Bitcoin
            if (asset === 'Bitcoin') {
                const bitcoinPrice = gameState.assetPrices[asset];
                let bitcoinReturn;

                // Bitcoin has special growth patterns based on its price
                if (bitcoinPrice < 10000) {
                    // Low price: rapid growth
                    bitcoinReturn = 2 + Math.random() * 2; // Return between 200% and 400%
                    console.log(`Bitcoin price < 10000: Rapid growth return: ${bitcoinReturn.toFixed(2)}`);
                } else if (bitcoinPrice >= 1000000) {
                    // Very high price: crash
                    bitcoinReturn = -0.3 - Math.random() * 0.2; // Return between -30% and -50%
                    console.log(`Bitcoin price >= 1000000: Crash return: ${bitcoinReturn.toFixed(2)}`);
                } else {
                    // Normal price range: simplified random return
                    bitcoinReturn = returns.mean + (Math.random() * 2 - 1) * returns.stdDev;

                    // Adjust Bitcoin's return based on its current price
                    const priceThreshold = 100000;
                    if (bitcoinPrice > priceThreshold) {
                        // Calculate how many increments above threshold
                        const incrementsAboveThreshold = Math.max(0, (bitcoinPrice - priceThreshold) / 50000);

                        // Reduce volatility as price grows (more mature asset)
                        const volatilityReduction = Math.min(0.7, incrementsAboveThreshold * 0.05);
                        const adjustedStdDev = returns.stdDev * (1 - volatilityReduction);

                        // Use a skewed distribution to avoid clustering around the mean
                        // This creates more varied returns while still respecting the reduced volatility
                        const u1 = Math.random();
                        const u2 = Math.random();
                        const normalRandom = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);

                        // Adjust the mean based on price to create more varied returns
                        const adjustedMean = returns.mean * (0.5 + (Math.random() * 0.5));

                        // Recalculate return with reduced volatility and varied mean
                        bitcoinReturn = adjustedMean + (normalRandom * adjustedStdDev);

                        console.log(`Bitcoin price > ${priceThreshold}: Adjusted StdDev: ${adjustedStdDev.toFixed(2)}, Adjusted Mean: ${adjustedMean.toFixed(2)}, Return: ${bitcoinReturn.toFixed(2)}`);
                    }

                    // Check for Bitcoin crash (4-year cycle)
                    console.log(`Checking 4-year cycle: Current round: ${gameState.roundNumber}, Last crash: ${gameState.lastBitcoinCrashRound}, Diff: ${gameState.roundNumber - gameState.lastBitcoinCrashRound}`);
                    if (gameState.roundNumber - gameState.lastBitcoinCrashRound >= 4) {
                        const crashChance = Math.random();
                        console.log(`4-year cycle condition met! Crash chance: ${crashChance.toFixed(2)}`);

                        if (crashChance < 0.5) { // 50% chance of crash after 4 rounds
                            // Apply shock based on current shock range
                            const shockMin = gameState.bitcoinShockRange[0];
                            const shockMax = gameState.bitcoinShockRange[1];
                            bitcoinReturn = shockMin + Math.random() * (shockMax - shockMin);

                            // Update last crash round
                            gameState.lastBitcoinCrashRound = gameState.roundNumber;

                            // Update shock range for next crash (less severe but still negative)
                            gameState.bitcoinShockRange = [
                                Math.min(Math.max(gameState.bitcoinShockRange[0] + 0.1, -0.5), -0.05),
                                Math.min(Math.max(gameState.bitcoinShockRange[1] + 0.1, -0.75), -0.15)
                            ];

                            console.log(`BITCOIN CRASH in round ${gameState.roundNumber} with return ${bitcoinReturn.toFixed(2)}`);
                            console.log(`New shock range: [${gameState.bitcoinShockRange[0].toFixed(2)}, ${gameState.bitcoinShockRange[1].toFixed(2)}]`);
                        }
                    }
                }

                // Ensure Bitcoin return is within bounds
                bitcoinReturn = Math.max(
                    returns.min,
                    Math.min(returns.max, bitcoinReturn)
                );

                // Apply return to price
                gameState.assetPrices[asset] = gameState.assetPrices[asset] * (1 + bitcoinReturn);
            } else {
                // Normal return calculation for other assets
                let assetReturn = generateRandomReturn(returns.mean, returns.stdDev) + inflationComponent;

                // Ensure return is within bounds
                assetReturn = Math.max(
                    returns.min,
                    Math.min(returns.max, assetReturn)
                );

                gameState.assetPrices[asset] = gameState.assetPrices[asset] * (1 + assetReturn);
            }

            // Ensure prices don't go below a minimum value
            gameState.assetPrices[asset] = Math.max(gameState.assetPrices[asset], 1.0);
        }

        console.log('generateNewPrices function completed successfully');
    } catch (error) {
        console.error('Error in generateNewPrices function:', error);
    }
}

// Generate a random return based on mean and standard deviation
function generateRandomReturn(mean, stdDev) {
    // Box-Muller transform to generate normally distributed random numbers
    let u = 0, v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();

    const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    return mean + z * stdDev;
}

// Calculate total portfolio value
function calculatePortfolioValue() {
    let totalValue = 0;
    for (const asset in playerState.portfolio) {
        totalValue += playerState.portfolio[asset] * gameState.assetPrices[asset];
    }
    return totalValue;
}

// Calculate total value (cash + portfolio)
function calculateTotalValue() {
    return playerState.cash + calculatePortfolioValue();
}

// Execute a trade
function executeTrade(asset, action, amount, quantity) {
    // Validate inputs
    if (!asset || !action || (amount <= 0 && quantity <= 0)) {
        console.error('Invalid trade parameters');
        return false;
    }

    const price = gameState.assetPrices[asset];
    let tradeQuantity = quantity;
    let tradeCost = 0;

    // Calculate quantity if amount is provided
    if (amount > 0) {
        tradeQuantity = amount / price;
    }

    // Calculate total cost
    tradeCost = tradeQuantity * price;

    // Execute the trade based on action
    if (action === 'buy') {
        // Check if player has enough cash
        if (tradeCost > playerState.cash) {
            console.error('Not enough cash for this trade');
            return false;
        }

        // Update portfolio and cash
        playerState.portfolio[asset] = (playerState.portfolio[asset] || 0) + tradeQuantity;
        playerState.cash -= tradeCost;
    } else if (action === 'sell') {
        // Check if player has enough of the asset
        if (tradeQuantity > (playerState.portfolio[asset] || 0)) {
            console.error('Not enough of this asset to sell');
            return false;
        }

        // Update portfolio and cash
        playerState.portfolio[asset] = (playerState.portfolio[asset] || 0) - tradeQuantity;
        playerState.cash += tradeCost;
    } else {
        console.error('Invalid trade action');
        return false;
    }

    // Record the trade in history
    playerState.tradeHistory.push({
        round: gameState.roundNumber,
        asset: asset,
        action: action,
        quantity: tradeQuantity,
        price: price,
        total: tradeCost,
        timestamp: new Date().toISOString()
    });

    // Save game state
    saveGameState();

    // Update UI
    updateUI();

    console.log(`Trade executed: ${action} ${tradeQuantity.toFixed(4)} ${asset} at $${price.toFixed(2)} for $${tradeCost.toFixed(2)}`);
    return true;
}

// Advance to next round
function nextRound() {
    try {
        console.log('Starting nextRound function');

        // Check if we've already reached the maximum number of rounds
        if (gameState.roundNumber >= gameState.maxRounds) {
            console.log('Maximum rounds reached, ending game');
            endGame();
            return;
        }

        // Increment round number
        gameState.roundNumber++;
        console.log('Round number incremented to:', gameState.roundNumber);

        try {
            // Generate new prices
            console.log('Generating new prices...');
            generateNewPrices();
            console.log('New prices generated:', gameState.assetPrices);
        } catch (priceError) {
            console.error('Error generating new prices:', priceError);
        }

        // Save portfolio value history
        playerState.portfolioHistory.push({
            round: gameState.roundNumber,
            cash: playerState.cash,
            portfolioValue: calculatePortfolioValue(),
            totalValue: calculateTotalValue(),
            timestamp: new Date().toISOString()
        });

        try {
            // Save game state
            console.log('Saving game state...');
            saveGameState();
            console.log('Game state saved');
        } catch (saveError) {
            console.error('Error saving game state:', saveError);
        }

        try {
            // Update UI
            console.log('Updating UI...');
            updateUI();
            console.log('UI updated');
        } catch (updateError) {
            console.error('Error in updateUI function:', updateError);
        }

        try {
            // Check if game is over
            if (gameState.roundNumber >= gameState.maxRounds) {
                console.log('Game is over, calling endGame()');
                endGame();
            }
        } catch (endGameError) {
            console.error('Error checking if game is over:', endGameError);
        }

        return true;
    } catch (error) {
        console.error('Error in nextRound function:', error);
        return false;
    }
}

// End game
function endGame() {
    // Calculate final portfolio value
    const finalPortfolioValue = calculateTotalValue();

    // Save score to leaderboard
    saveScoreToLeaderboard(finalPortfolioValue);

    // Show game over message
    alert(`Game Over! Your final portfolio value is $${finalPortfolioValue.toFixed(2)}`);

    console.log('Game ended with final portfolio value:', finalPortfolioValue);
}

// Save score to leaderboard
async function saveScoreToLeaderboard(finalPortfolio) {
    try {
        // Check if Service is available
        if (!window.Service) {
            console.error('Service not available for saving score');
            return false;
        }

        const user = window.Service.getCurrentUser();
        if (!user) {
            console.error('User not logged in, score not saved to leaderboard');
            return false;
        }

        // Get section info if available
        let taName = null;
        let sectionId = null;

        if (user.sectionId) {
            sectionId = user.sectionId;
            const sectionResult = await window.Service.getSection(sectionId);
            if (sectionResult.success) {
                taName = sectionResult.data.ta;
            }
        }

        // Save score to leaderboard
        const result = await window.Service.saveGameScore(
            user.id,
            user.name,
            gameState.gameId,
            'investment-odyssey',
            gameState.gameMode,
            finalPortfolio,
            taName,
            sectionId
        );

        if (result.success) {
            console.log('Score saved to leaderboard:', result.data);
            return true;
        } else {
            console.error('Error saving score to leaderboard:', result.error);
            return false;
        }
    } catch (error) {
        console.error('Error saving score to leaderboard:', error);
        return false;
    }
}

// Save game state to local storage
function saveGameState() {
    try {
        // Save game state
        localStorage.setItem('investment_odyssey_game_state', JSON.stringify(gameState));

        // Save player state
        localStorage.setItem('investment_odyssey_player_state', JSON.stringify(playerState));

        // Save to Supabase
        saveGameToSupabase();

        return true;
    } catch (error) {
        console.error('Error saving game state:', error);
        return false;
    }
}



// Load game state from local storage
function loadGameState() {
    try {
        // Load game state
        const savedGameState = localStorage.getItem('investment_odyssey_game_state');
        if (savedGameState) {
            gameState = JSON.parse(savedGameState);
        }

        // Load player state
        const savedPlayerState = localStorage.getItem('investment_odyssey_player_state');
        if (savedPlayerState) {
            playerState = JSON.parse(savedPlayerState);
        }

        // Update UI
        updateUI();

        // Check if game is over
        if (gameState.roundNumber >= gameState.maxRounds) {
            // Disable next round button
            document.getElementById('next-round').disabled = true;

            // Enable start game button
            document.getElementById('start-game').disabled = false;
        } else if (gameState.roundNumber > 0) {
            // Enable next round button
            document.getElementById('next-round').disabled = false;

            // Disable start game button
            document.getElementById('start-game').disabled = true;
        }

        return true;
    } catch (error) {
        console.error('Error loading game state:', error);
        return false;
    }
}

// Create game in Supabase
async function createGameInSupabase() {
    try {
        // Check if Service is available
        if (!window.Service) {
            console.log('Service not available for creating game');
            return false;
        }

        // Make sure we have a valid game ID
        if (!gameState.gameId) {
            console.error('No game ID available for creating in Supabase');
            return false;
        }

        // Make sure we have a valid user ID
        if (!playerState.userId) {
            // Try to get user info from auth service
            const user = window.Service ? window.Service.getCurrentUser() : null;
            if (user) {
                playerState.userId = user.id;
                playerState.userName = user.name;
            } else {
                // Generate a guest ID if not logged in
                playerState.userId = 'guest_' + Date.now();
                playerState.userName = 'Guest';
            }
        }

        console.log('Creating game in Supabase with ID:', gameState.gameId);

        // Create game record in Supabase using Service
        const result = await window.Service.createGame(
            gameState.gameId,
            playerState.userId,
            'investment-odyssey',
            gameState.gameMode,
            gameState.maxRounds
        );

        if (!result.success) {
            console.error('Error creating game in Supabase:', result.error);
            return false;
        }

        console.log('Game created successfully in Supabase:', result.data);
        return true;
    } catch (error) {
        console.error('Exception creating game in Supabase:', error);
        return false;
    }
}

// Save game to Supabase
async function saveGameToSupabase() {
    try {
        // Check if Service is available
        if (!window.Service) {
            console.log('Service not available for saving to Supabase');
            return false;
        }

        // Make sure we have a valid game ID
        if (!gameState.gameId) {
            console.error('No game ID available for saving to Supabase');
            return false;
        }

        // Make sure we have a valid user ID
        if (!playerState.userId) {
            // Try to get user info from auth service
            const user = window.Service ? window.Service.getCurrentUser() : null;
            if (user) {
                playerState.userId = user.id;
                playerState.userName = user.name;
            } else {
                // Generate a guest ID if not logged in
                playerState.userId = 'guest_' + Date.now();
                playerState.userName = 'Guest';
            }
        }

        // Make sure the game exists in Supabase
        const gameCreated = await createGameInSupabase();
        if (!gameCreated) {
            console.warn('Failed to create game in Supabase, skipping save');
            return false;
        }

        // Try to save game round
        try {
            // Only save if we have a valid round number and asset prices
            if (gameState.roundNumber !== undefined && gameState.assetPrices) {
                const roundResult = await window.Service.saveGameRound(
                    gameState.gameId,
                    gameState.roundNumber,
                    gameState.assetPrices,
                    gameState.priceHistory,
                    gameState.CPI,
                    gameState.CPIHistory
                );

                if (!roundResult.success) {
                    console.error('Error saving game round to Supabase:', roundResult.error);
                }
            } else {
                console.log('Skipping game round save - invalid round number or asset prices');
            }
        } catch (roundError) {
            console.error('Exception saving game round to Supabase:', roundError);
        }

        // Try to save player state
        try {
            // Only save if we have valid game ID, user ID, round number, cash, and portfolio
            if (gameState.gameId && playerState.userId && gameState.roundNumber !== undefined &&
                playerState.cash !== undefined && playerState.portfolio) {

                const portfolioValue = calculatePortfolioValue();
                const playerResult = await window.Service.savePlayerState(
                    gameState.gameId,
                    playerState.userId,
                    gameState.roundNumber,
                    playerState.cash,
                    playerState.portfolio,
                    playerState.tradeHistory || [],
                    portfolioValue,
                    playerState.portfolioHistory || []
                );

                if (!playerResult.success) {
                    console.error('Error saving player state to Supabase:', playerResult.error);
                } else {
                    console.log('Player state saved to Supabase successfully');
                }
            } else {
                console.log('Skipping player state save - missing required data');
                console.log('Game ID:', gameState.gameId);
                console.log('User ID:', playerState.userId);
                console.log('Round:', gameState.roundNumber);
                console.log('Cash:', playerState.cash);
                console.log('Portfolio:', playerState.portfolio ? 'Valid' : 'Invalid');
            }
        } catch (playerError) {
            console.error('Exception saving player state to Supabase:', playerError);
        }

        // Even if there are errors, we'll continue with the game
        // The data is saved to localStorage as a backup
        return true;
    } catch (error) {
        console.error('Error saving to Supabase:', error);
        return false;
    }
}

// Reset game
function resetGame() {
    try {
        console.log('Resetting game...');

        // Clear localStorage to ensure a fresh start
        localStorage.removeItem('investment_odyssey_game_state');
        localStorage.removeItem('investment_odyssey_player_state');
        localStorage.removeItem('investment_odyssey_game_id');

        // Reset all charts first
        resetAllCharts();

        // Generate a new game ID
        gameState.gameId = crypto.randomUUID ? crypto.randomUUID() :
            'game_' + Math.random().toString(36).substring(2, 15);

        // Save new game ID to localStorage
        localStorage.setItem('investment_odyssey_game_id', gameState.gameId);

        console.log('New game ID generated:', gameState.gameId);

        // Initialize new game
        initializeGame();

        // Create game in Supabase
        createGameInSupabase().then(success => {
            if (!success) {
                console.warn('Failed to create game in Supabase during reset');
            }
        });

        // Generate initial prices
        generateNewPrices();

        // Save game state
        saveGameState();

        // Update UI
        updateUI();

        // Enable start game button
        const startGameBtn = document.getElementById('start-game');
        if (startGameBtn) startGameBtn.disabled = false;

        // Disable next round button
        const nextRoundBtn = document.getElementById('next-round');
        if (nextRoundBtn) nextRoundBtn.disabled = true;

        // Hide sticky next round button
        const stickyNextRoundBtn = document.getElementById('sticky-next-round');
        if (stickyNextRoundBtn) stickyNextRoundBtn.style.display = 'none';

        console.log('Game has been reset.');
        return true;
    } catch (error) {
        console.error('Error resetting game:', error);
        return false;
    }
}

// Make functions available globally
window.initializeGame = initializeGame;
window.startGame = startGame;
window.nextRound = nextRound;
window.endGame = endGame;
window.executeTrade = executeTrade;
window.calculatePortfolioValue = calculatePortfolioValue;
window.calculateTotalValue = calculateTotalValue;
window.saveGameState = saveGameState;
window.loadGameState = loadGameState;
window.resetGame = resetGame;

// Initialize when the document is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('Document loaded, initializing game...');

    // Check if we need to force a reset
    const urlParams = new URLSearchParams(window.location.search);
    const forceReset = urlParams.get('reset') === 'true';

    if (forceReset) {
        console.log('Force reset requested, resetting game...');
        resetGame();
        // Remove the reset parameter from the URL
        window.history.replaceState({}, document.title, window.location.pathname);
    } else {
        // Try to load saved game state
        if (!loadGameState()) {
            // If no saved state, initialize a new game
            initializeGame();
        }
    }

    // Set up event listeners
    const startGameBtn = document.getElementById('start-game');
    if (startGameBtn) {
        startGameBtn.addEventListener('click', startGame);
    }

    const nextRoundBtn = document.getElementById('next-round');
    if (nextRoundBtn) {
        nextRoundBtn.addEventListener('click', nextRound);
    }

    const stickyNextRoundBtn = document.getElementById('sticky-next-round');
    if (stickyNextRoundBtn) {
        stickyNextRoundBtn.addEventListener('click', nextRound);
    }

    const restartGameBtn = document.getElementById('restart-game');
    if (restartGameBtn) {
        restartGameBtn.addEventListener('click', resetGame);
    }
});
