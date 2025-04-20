// Game Core JavaScript for Investment Odyssey

// Format currency function
function formatCurrency(value) {
    return parseFloat(value).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

// Game state
let gameState = {
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
        'S&P 500': [],
        'Bonds': [],
        'Real Estate': [],
        'Gold': [],
        'Commodities': [],
        'Bitcoin': []
    },
    lastCashInjection: 0,
    totalCashInjected: 0,
    maxRounds: 20,
    CPI: 100,
    CPIHistory: [],
    lastBitcoinCrashRound: 0,
    bitcoinShockRange: [-0.5, -0.75] // Initial shock range for Bitcoin crashes
};

// Player state
let playerState = {
    cash: 10000,
    portfolio: {},
    tradeHistory: [],
    portfolioValueHistory: [10000]
};

// Last round prices for change calculation
let lastRoundPrices = {};
let lastPricesRoundNumber = 0;

// Initialize game
function initializeGame() {
    // Reset game state
    gameState = {
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
            'S&P 500': [],
            'Bonds': [],
            'Real Estate': [],
            'Gold': [],
            'Commodities': [],
            'Bitcoin': []
        },
        lastCashInjection: 0,
        totalCashInjected: 0,
        maxRounds: 20,
        CPI: 100,
        CPIHistory: [],
        lastBitcoinCrashRound: 0,
        bitcoinShockRange: [-0.5, -0.75] // Initial shock range for Bitcoin crashes
    };

    // Reset player state
    playerState = {
        cash: 10000,
        portfolio: {},
        tradeHistory: [],
        portfolioValueHistory: [10000]
    };

    // Update UI
    updateUI();

    // Save game state to local storage
    saveGameState();
}

// Reset all charts
function resetAllCharts() {
    // Portfolio chart
    if (window.portfolioChart) {
        window.portfolioChart.destroy();
        window.portfolioChart = null;
    }

    // Portfolio allocation chart
    if (window.portfolioAllocationChart) {
        window.portfolioAllocationChart.destroy();
        window.portfolioAllocationChart = null;
    }

    // Asset price charts
    if (window.assetPriceCharts) {
        for (const chart of Object.values(window.assetPriceCharts)) {
            if (chart) {
                chart.destroy();
            }
        }
        window.assetPriceCharts = {};
    }

    // CPI chart
    if (window.cpiChart) {
        window.cpiChart.destroy();
        window.cpiChart = null;
    }

    // Comparative returns chart
    if (window.comparativeReturnsChart) {
        window.comparativeReturnsChart.destroy();
        window.comparativeReturnsChart = null;
    }
    
    // Reset checkbox listeners
    window.checkboxListenersSet = false;
}

// Start a new game
function startGame() {
    // Reset all charts first
    resetAllCharts();

    // Reset game
    initializeGame();

    // Add initial prices to price history
    for (const [asset, price] of Object.entries(gameState.assetPrices)) {
        gameState.priceHistory[asset].push(price);
    }

    // Add initial CPI to CPI history
    gameState.CPIHistory.push(gameState.CPI);

    // Initialize lastRoundPrices with initial prices
    lastRoundPrices = {...gameState.assetPrices};
    lastPricesRoundNumber = gameState.roundNumber;

    // Update UI
    updateUI();

    // Update game progress
    updateGameProgress();

    // Save game state
    saveGameState();

    // Show notification
    showNotification('Game started! You have $10,000 to invest.', 'success');
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

        try {
            // Update price history
            console.log('Updating price history...');
            for (const [asset, price] of Object.entries(gameState.assetPrices)) {
                if (gameState.priceHistory[asset]) {
                    gameState.priceHistory[asset].push(price);
                } else {
                    gameState.priceHistory[asset] = [price];
                }
            }
            console.log('Price history updated');
        } catch (historyError) {
            console.error('Error updating price history:', historyError);
        }

        try {
            // Update CPI
            console.log('Updating CPI...');
            updateCPI();
            console.log('CPI updated to:', gameState.CPI);
        } catch (cpiError) {
            console.error('Error updating CPI:', cpiError);
        }

        try {
            // Update portfolio value history
            console.log('Updating portfolio value history...');
            const portfolioValue = calculatePortfolioValue();
            const totalValue = playerState.cash + portfolioValue;
            playerState.portfolioValueHistory.push(totalValue);
            console.log('Portfolio value history updated:', playerState.portfolioValueHistory);
        } catch (portfolioError) {
            console.error('Error updating portfolio value history:', portfolioError);
        }

        try {
            // Update game progress
            console.log('Updating game progress...');
            updateGameProgress();
            console.log('Game progress updated');
        } catch (progressError) {
            console.error('Error updating game progress:', progressError);
        }

        try {
            // Generate cash injection
            console.log('Generating cash injection...');
            generateCashInjection();
            console.log('Cash injection generated:', gameState.lastCashInjection);
        } catch (cashError) {
            console.error('Error generating cash injection:', cashError);
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

        try {
            // Save game state to local storage
            console.log('Saving game state...');
            saveGameState();
            console.log('Game state saved');
        } catch (saveError) {
            console.error('Error saving game state:', saveError);
        }

        // Show notification for cash injection
        if (gameState.lastCashInjection > 0) {
            showNotification(`You received a cash injection of $${gameState.lastCashInjection.toFixed(2)}!`, 'success');
        }

    } catch (error) {
        console.error('Error in nextRound function:', error);
    }
}

// Generate new prices
function generateNewPrices() {
    // Store last round prices for change calculation
    lastRoundPrices = {...gameState.assetPrices};
    lastPricesRoundNumber = gameState.roundNumber - 1;

    // S&P 500 - Moderate volatility
    const sp500Change = (Math.random() * 0.2) - 0.05; // -5% to +15%
    gameState.assetPrices['S&P 500'] *= (1 + sp500Change);

    // Bonds - Low volatility
    const bondsChange = (Math.random() * 0.06) - 0.01; // -1% to +5%
    gameState.assetPrices['Bonds'] *= (1 + bondsChange);

    // Real Estate - Moderate volatility with slight upward bias
    const realEstateChange = (Math.random() * 0.15) - 0.05; // -5% to +10%
    gameState.assetPrices['Real Estate'] *= (1 + realEstateChange);

    // Gold - Higher volatility
    const goldChange = (Math.random() * 0.25) - 0.1; // -10% to +15%
    gameState.assetPrices['Gold'] *= (1 + goldChange);

    // Commodities - High volatility
    const commoditiesChange = (Math.random() * 0.3) - 0.15; // -15% to +15%
    gameState.assetPrices['Commodities'] *= (1 + commoditiesChange);

    // Bitcoin - Extreme volatility with occasional crashes
    let bitcoinChange;
    
    // Check if it's time for a Bitcoin crash (approximately every 5-8 rounds)
    const roundsSinceLastCrash = gameState.roundNumber - gameState.lastBitcoinCrashRound;
    const crashProbability = Math.min(0.1 + (roundsSinceLastCrash * 0.05), 0.4); // Increases over time
    
    if (Math.random() < crashProbability) {
        // Bitcoin crash
        const crashSeverity = Math.random() * (gameState.bitcoinShockRange[1] - gameState.bitcoinShockRange[0]) + gameState.bitcoinShockRange[0];
        bitcoinChange = crashSeverity; // -50% to -75% crash
        gameState.lastBitcoinCrashRound = gameState.roundNumber;
        
        // Make the next crash potentially more severe
        gameState.bitcoinShockRange[0] -= 0.05;
        gameState.bitcoinShockRange[1] -= 0.05;
    } else {
        // Normal Bitcoin volatility
        bitcoinChange = (Math.random() * 0.6) - 0.2; // -20% to +40%
    }
    
    gameState.assetPrices['Bitcoin'] *= (1 + bitcoinChange);

    // Ensure prices don't go below a minimum threshold
    const minPrices = {
        'S&P 500': 10,
        'Bonds': 50,
        'Real Estate': 1000,
        'Gold': 500,
        'Commodities': 10,
        'Bitcoin': 1000
    };

    for (const [asset, minPrice] of Object.entries(minPrices)) {
        if (gameState.assetPrices[asset] < minPrice) {
            gameState.assetPrices[asset] = minPrice;
        }
    }
}

// Update CPI
function updateCPI() {
    // Generate a random CPI change with upward bias
    const cpiChange = (Math.random() * 0.05) - 0.01; // -1% to +4%
    gameState.CPI *= (1 + cpiChange);
    
    // Add to CPI history
    gameState.CPIHistory.push(gameState.CPI);
}

// Generate cash injection
function generateCashInjection() {
    // Base amount increases each round to simulate growing economy but needs to be random
    const baseAmount = 5000 + (gameState.roundNumber * 500); // Starts at 5000, increases by 500 each round
    const variability = 1000; // Higher variability for more dynamic gameplay

    // Generate random cash injection with increasing trend
    const cashInjection = baseAmount + (Math.random() * 2 - 1) * variability;

    // Update player cash
    playerState.cash += cashInjection;

    // Update game state
    gameState.lastCashInjection = cashInjection;
    gameState.totalCashInjected += cashInjection;
}

// Calculate portfolio value
function calculatePortfolioValue() {
    let totalValue = 0;
    
    for (const [asset, quantity] of Object.entries(playerState.portfolio)) {
        const price = gameState.assetPrices[asset] || 0;
        totalValue += price * quantity;
    }
    
    return totalValue;
}

// Calculate total value (cash + portfolio)
function calculateTotalValue() {
    return playerState.cash + calculatePortfolioValue();
}

// Update game progress
function updateGameProgress() {
    const currentRoundDisplay = document.getElementById('current-round-display');
    const roundProgress = document.getElementById('round-progress');
    
    if (currentRoundDisplay) {
        currentRoundDisplay.textContent = gameState.roundNumber;
    }
    
    if (roundProgress) {
        const progressPercentage = (gameState.roundNumber / gameState.maxRounds) * 100;
        roundProgress.style.width = `${progressPercentage}%`;
        roundProgress.setAttribute('aria-valuenow', progressPercentage);
        roundProgress.textContent = `${Math.round(progressPercentage)}%`;
    }
}

// End game
async function endGame() {
    // Calculate final portfolio value
    const portfolioValue = calculatePortfolioValue();
    const totalValue = playerState.cash + portfolioValue;
    
    // Show game over message
    showNotification(`Game Over! Your final portfolio value is $${totalValue.toFixed(2)}`, 'success', 10000);
    
    // Disable next round button
    const nextRoundBtn = document.getElementById('next-round');
    if (nextRoundBtn) {
        nextRoundBtn.disabled = true;
    }
    
    const stickyNextRoundBtn = document.getElementById('sticky-next-round');
    if (stickyNextRoundBtn) {
        stickyNextRoundBtn.style.display = 'none';
    }
    
    // Enable start game button
    const startGameBtn = document.getElementById('start-game');
    if (startGameBtn) {
        startGameBtn.disabled = false;
    }
    
    // Get student info from localStorage
    const studentId = localStorage.getItem('student_id');
    const studentName = localStorage.getItem('student_name');
    const isGuest = localStorage.getItem('is_guest') === 'true';
    
    // Save score to localStorage
    try {
        const leaderboard = JSON.parse(localStorage.getItem('investment-odyssey-scores') || '[]');

        // Add the new score
        leaderboard.push({
            id: `score_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            studentId: studentId || 'guest_' + Date.now(),
            studentName: studentName || 'Guest',
            finalPortfolio: totalValue,
            timestamp: new Date().toISOString(),
            isGuest: isGuest,
            gameType: 'investment-odyssey',
            gameMode: 'single'
        });

        // Sort by score (descending)
        leaderboard.sort((a, b) => b.finalPortfolio - a.finalPortfolio);

        // Save back to localStorage
        localStorage.setItem('investment-odyssey-scores', JSON.stringify(leaderboard));

        console.log('Score saved to localStorage');
        showNotification('Your score has been saved to the leaderboard!', 'success', 5000);
    } catch (localError) {
        console.error('Failed to save score to localStorage:', localError);
        showNotification('Failed to save your score. Please try again.', 'danger', 5000);
    }
    
    // If Supabase service is available, save score there too
    if (typeof window.Service !== 'undefined' && typeof window.Service.saveGameScore === 'function') {
        try {
            const result = await window.Service.saveGameScore(
                studentId,
                studentName,
                'investment-odyssey',
                totalValue,
                null, // TA name
                false // Not a class game
            );
            
            if (result.success) {
                console.log('Score saved to Supabase successfully');
            } else {
                console.error('Error saving score to Supabase:', result.error);
            }
        } catch (error) {
            console.error('Error saving score to Supabase:', error);
        }
    }
}

// Save game state to local storage
function saveGameState() {
    try {
        const gameData = {
            gameState: gameState,
            playerState: playerState
        };

        localStorage.setItem('investmentOdysseyGameData', JSON.stringify(gameData));
        return true;
    } catch (error) {
        console.error('Error saving game state:', error);
        return false;
    }
}

// Load game state from local storage
function loadGameState() {
    try {
        const gameData = localStorage.getItem('investmentOdysseyGameData');
        
        if (gameData) {
            const parsedData = JSON.parse(gameData);
            
            // Validate data
            if (parsedData.gameState && parsedData.playerState) {
                // Load game state
                gameState = parsedData.gameState;
                playerState = parsedData.playerState;
                
                // Initialize lastRoundPrices
                lastRoundPrices = {...gameState.assetPrices};
                lastPricesRoundNumber = gameState.roundNumber;
                
                // Update UI
                updateUI();
                
                // Update game progress
                updateGameProgress();
                
                // Check if game is over
                if (gameState.roundNumber >= gameState.maxRounds) {
                    // Disable next round button
                    const nextRoundBtn = document.getElementById('next-round');
                    if (nextRoundBtn) {
                        nextRoundBtn.disabled = true;
                    }
                    
                    // Enable start game button
                    const startGameBtn = document.getElementById('start-game');
                    if (startGameBtn) {
                        startGameBtn.disabled = false;
                    }
                } else if (gameState.roundNumber > 0) {
                    // Enable next round button
                    const nextRoundBtn = document.getElementById('next-round');
                    if (nextRoundBtn) {
                        nextRoundBtn.disabled = false;
                    }
                    
                    // Disable start game button
                    const startGameBtn = document.getElementById('start-game');
                    if (startGameBtn) {
                        startGameBtn.disabled = true;
                    }
                    
                    // Show sticky next round button
                    const stickyNextRoundBtn = document.getElementById('sticky-next-round');
                    if (stickyNextRoundBtn) {
                        stickyNextRoundBtn.style.display = 'flex';
                    }
                }
                
                return true;
            }
        }
    } catch (error) {
        console.error('Error loading game state:', error);
    }
    
    return false;
}

// Show notification
function showNotification(message, type = 'info', duration = 3000) {
    // Create notification element if it doesn't exist
    let notification = document.getElementById('game-notification');
    
    if (!notification) {
        notification = document.createElement('div');
        notification.id = 'game-notification';
        notification.className = 'notification';
        document.body.appendChild(notification);
    }
    
    // Set notification type
    notification.className = `notification notification-${type}`;
    
    // Set message
    notification.textContent = message;
    
    // Show notification
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // Hide notification after duration
    setTimeout(() => {
        notification.classList.remove('show');
    }, duration);
}

// Initialize event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Start game button
    const startGameBtn = document.getElementById('start-game');
    if (startGameBtn) {
        startGameBtn.addEventListener('click', startGame);
    }
    
    // Next round button
    const nextRoundBtn = document.getElementById('next-round');
    if (nextRoundBtn) {
        nextRoundBtn.addEventListener('click', nextRound);
    }
    
    // Sticky next round button
    const stickyNextRoundBtn = document.getElementById('sticky-next-round');
    if (stickyNextRoundBtn) {
        stickyNextRoundBtn.addEventListener('click', nextRound);
    }
    
    // Restart game button
    const restartGameBtn = document.getElementById('restart-game');
    if (restartGameBtn) {
        restartGameBtn.addEventListener('click', function() {
            if (confirm('Are you sure you want to restart the game? All progress will be lost.')) {
                startGame();
            }
        });
    }
    
    // Try to load saved game
    if (!loadGameState()) {
        // If no saved game, initialize a new one
        initializeGame();
    }
});
