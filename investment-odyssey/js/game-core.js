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
async function startGame() {
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

    // Enable/disable buttons
    const nextRoundBtn = document.getElementById('next-round');
    if (nextRoundBtn) {
        nextRoundBtn.disabled = false;
    }

    const startGameBtn = document.getElementById('start-game');
    if (startGameBtn) {
        startGameBtn.disabled = true;
    }

    // Show sticky next round button
    const stickyNextRoundBtn = document.getElementById('sticky-next-round');
    if (stickyNextRoundBtn) {
        stickyNextRoundBtn.style.display = 'flex';
    }

    // Save game state
    await saveGameState();

    // Show notification
    showNotification('Game started! You have $10,000 to invest.', 'success');
}

// Advance to next round
async function nextRound() {
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
            // Save game state to local storage and Supabase
            console.log('Saving game state...');
            await saveGameState();
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

// Asset returns configuration - from macro3.py
// Make it available globally for other scripts
window.assetReturns = {
    'S&P 500': {
        mean: 0.1151,
        stdDev: 0.1949,
        min: -0.43,
        max: 0.50
    },
    'Bonds': {
        mean: 0.0334,
        stdDev: 0.0301,
        min: 0.0003,
        max: 0.14
    },
    'Real Estate': {
        mean: 0.0439,
        stdDev: 0.0620,
        min: -0.12,
        max: 0.24
    },
    'Gold': {
        mean: 0.0648,
        stdDev: 0.2076,
        min: -0.32,
        max: 1.25
    },
    'Commodities': {
        mean: 0.0815,
        stdDev: 0.1522,
        min: -0.25,
        max: 2.00
    },
    'Bitcoin': {
        mean: 0.50,
        stdDev: 1.00,
        min: -0.73,
        max: 2.50
    }
};

// Correlation matrix for assets - from macro3.py
// Make it available globally for other scripts
window.correlationMatrix = [
    [1.0000, -0.5169, 0.3425, 0.0199, 0.1243, 0.4057],
    [-0.5169, 1.0000, 0.0176, 0.0289, -0.0235, -0.2259],
    [0.3425, 0.0176, 1.0000, -0.4967, -0.0334, 0.1559],
    [0.0199, 0.0289, -0.4967, 1.0000, 0.0995, -0.5343],
    [0.1243, -0.0235, -0.0334, 0.0995, 1.0000, 0.0436],
    [0.4057, -0.2259, 0.1559, -0.5343, 0.0436, 1.0000]
];

// Generate new prices
function generateNewPrices() {
    try {
        // Store last round prices for change calculation
        lastRoundPrices = {...gameState.assetPrices};
        lastPricesRoundNumber = gameState.roundNumber - 1;

        // Generate correlated random returns
        const assetNames = Object.keys(window.assetReturns);
        const means = assetNames.map(asset => window.assetReturns[asset].mean);
        const stdDevs = assetNames.map(asset => window.assetReturns[asset].stdDev);

        // Generate uncorrelated standard normal random variables
        const uncorrelatedZ = [];
        for (let i = 0; i < assetNames.length; i++) {
            // Box-Muller transform for normal distribution
            const u1 = Math.random();
            const u2 = Math.random();
            const z = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
            uncorrelatedZ.push(z);
        }

        // Apply Cholesky decomposition to get correlated random variables
        // This is a simplified approach - we'll use the correlation matrix directly
        const correlatedReturns = {};

        // Special handling for Bitcoin
        let bitcoinReturn;

        // Check if it's time for a Bitcoin crash (approximately every 5-8 rounds)
        const roundsSinceLastCrash = gameState.roundNumber - gameState.lastBitcoinCrashRound;
        const crashProbability = Math.min(0.1 + (roundsSinceLastCrash * 0.05), 0.4); // Increases over time

        if (Math.random() < crashProbability) {
            // Bitcoin crash
            const crashSeverity = Math.random() * (gameState.bitcoinShockRange[1] - gameState.bitcoinShockRange[0]) + gameState.bitcoinShockRange[0];
            bitcoinReturn = crashSeverity; // -50% to -75% crash
            gameState.lastBitcoinCrashRound = gameState.roundNumber;

            // Make the next crash potentially more severe
            gameState.bitcoinShockRange[0] -= 0.05;
            gameState.bitcoinShockRange[1] -= 0.05;
        } else {
            // Normal Bitcoin volatility with correlation to other assets
            let weightedReturn = 0;
            for (let j = 0; j < assetNames.length; j++) {
                weightedReturn += window.correlationMatrix[5][j] * uncorrelatedZ[j];
            }
            bitcoinReturn = window.assetReturns['Bitcoin'].mean + window.assetReturns['Bitcoin'].stdDev * weightedReturn;
        }

        // Ensure Bitcoin return is within bounds
        bitcoinReturn = Math.max(
            window.assetReturns['Bitcoin'].min,
            Math.min(window.assetReturns['Bitcoin'].max, bitcoinReturn)
        );

        correlatedReturns['Bitcoin'] = bitcoinReturn;

        // Generate correlated returns for other assets
        for (let i = 0; i < assetNames.length - 1; i++) { // Skip Bitcoin which we handled separately
            const asset = assetNames[i];
            if (asset === 'Bitcoin') continue;

            let weightedReturn = 0;
            for (let j = 0; j < assetNames.length; j++) {
                weightedReturn += window.correlationMatrix[i][j] * uncorrelatedZ[j];
            }

            let assetReturn = means[i] + stdDevs[i] * weightedReturn;

            // Ensure return is within bounds
            assetReturn = Math.max(
                window.assetReturns[asset].min,
                Math.min(window.assetReturns[asset].max, assetReturn)
            );

            correlatedReturns[asset] = assetReturn;
        }

        // Apply returns to prices and update history
        for (const [asset, price] of Object.entries(gameState.assetPrices)) {
            const returnRate = correlatedReturns[asset] || 0;
            const newPrice = price * (1 + returnRate);
            gameState.assetPrices[asset] = newPrice;

            // Add the new price to the history
            gameState.priceHistory[asset].push(newPrice);
        }

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
    } catch (error) {
        console.error('Error in generateNewPrices function:', error);
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
            id: `score_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
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
            console.log('Attempting to save score to Supabase...');
            console.log('Student ID:', studentId);
            console.log('Student Name:', studentName || 'Guest');
            console.log('Total Value:', totalValue);

            // If studentId is not available, try to get it from localStorage
            const userId = studentId || localStorage.getItem('student_id') || 'guest_' + Date.now();
            const userName = studentName || localStorage.getItem('student_name') || 'Guest';

            const result = await window.Service.saveGameScore(
                userId,
                userName,
                'investment-odyssey',
                totalValue,
                null, // TA name
                false // Not a class game
            );

            if (result.success) {
                console.log('Score saved to Supabase successfully');
                showNotification('Your score has been saved to the global leaderboard!', 'success', 5000);
            } else {
                console.error('Error saving score to Supabase:', result.error);
                showNotification('Failed to save your score to the global leaderboard.', 'warning', 5000);
            }
        } catch (error) {
            console.error('Error saving score to Supabase:', error);
            showNotification('Failed to save your score to the global leaderboard.', 'warning', 5000);
        }
    } else {
        console.warn('Supabase service not available, score not saved to global leaderboard');
    }
}

// Save game state to local storage and Supabase
async function saveGameState() {
    try {
        const gameData = {
            gameState: gameState,
            playerState: playerState
        };

        // Save to localStorage
        localStorage.setItem('investmentOdysseyGameData', JSON.stringify(gameData));

        // Save to Supabase if available
        const studentId = localStorage.getItem('student_id');
        if (studentId && typeof window.Service !== 'undefined' && typeof window.Service.saveGameState === 'function') {
            try {
                console.log('Saving game state to Supabase...');
                const result = await window.Service.saveGameState(studentId, 'investment-odyssey', gameData);
                if (result.success) {
                    console.log('Game state saved to Supabase successfully');
                } else {
                    console.error('Error saving game state to Supabase:', result.error);
                }
            } catch (supabaseError) {
                console.error('Error saving game state to Supabase:', supabaseError);
            }
        }

        return true;
    } catch (error) {
        console.error('Error saving game state:', error);
        return false;
    }
}

// Load game state from local storage or Supabase
async function loadGameState() {
    try {
        // First try to load from localStorage
        const localGameData = localStorage.getItem('investmentOdysseyGameData');
        let parsedData = null;

        if (localGameData) {
            parsedData = JSON.parse(localGameData);
        }

        // If not found in localStorage, try to load from Supabase
        if (!parsedData) {
            const studentId = localStorage.getItem('student_id');
            if (studentId && typeof window.Service !== 'undefined' && typeof window.Service.loadGameState === 'function') {
                try {
                    console.log('Loading game state from Supabase...');
                    const result = await window.Service.loadGameState(studentId, 'investment-odyssey');
                    if (result.success) {
                        console.log('Game state loaded from Supabase successfully');
                        parsedData = result.data;

                        // Save to localStorage for future use
                        localStorage.setItem('investmentOdysseyGameData', JSON.stringify(parsedData));
                    } else {
                        console.log('No game state found in Supabase:', result.error);
                    }
                } catch (supabaseError) {
                    console.error('Error loading game state from Supabase:', supabaseError);
                }
            }
        }

        // If we have data from either source, load it
        if (parsedData && parsedData.gameState && parsedData.playerState) {
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
document.addEventListener('DOMContentLoaded', async function() {
    // Start game button
    const startGameBtn = document.getElementById('start-game');
    if (startGameBtn) {
        startGameBtn.addEventListener('click', () => {
            startGame().catch(error => {
                console.error('Error starting game:', error);
                showNotification('Error starting game. Please try again.', 'danger', 3000);
            });
        });
    }

    // Next round button
    const nextRoundBtn = document.getElementById('next-round');
    if (nextRoundBtn) {
        nextRoundBtn.addEventListener('click', () => {
            nextRound().catch(error => {
                console.error('Error advancing to next round:', error);
                showNotification('Error advancing to next round. Please try again.', 'danger', 3000);
            });
        });
    }

    // Sticky next round button
    const stickyNextRoundBtn = document.getElementById('sticky-next-round');
    if (stickyNextRoundBtn) {
        stickyNextRoundBtn.addEventListener('click', () => {
            nextRound().catch(error => {
                console.error('Error advancing to next round:', error);
                showNotification('Error advancing to next round. Please try again.', 'danger', 3000);
            });
        });
    }

    // Restart game button
    const restartGameBtn = document.getElementById('restart-game');
    if (restartGameBtn) {
        restartGameBtn.addEventListener('click', function() {
            if (confirm('Are you sure you want to restart the game? All progress will be lost.')) {
                startGame().catch(error => {
                    console.error('Error restarting game:', error);
                    showNotification('Error restarting game. Please try again.', 'danger', 3000);
                });
            }
        });
    }

    // Try to load saved game
    try {
        // Show loading indicator
        showNotification('Loading game data...', 'info', 2000);

        // Try to load from localStorage or Supabase
        const gameLoaded = await loadGameState();

        if (!gameLoaded) {
            // If no saved game, initialize a new one
            initializeGame();
        } else {
            showNotification('Game loaded successfully!', 'success', 2000);
        }
    } catch (error) {
        console.error('Error during initialization:', error);
        // Initialize a new game as fallback
        initializeGame();
        showNotification('Failed to load saved game. Starting new game.', 'warning', 3000);
    }
});
