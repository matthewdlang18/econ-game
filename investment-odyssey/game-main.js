// Main entry point for Investment Odyssey game

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('Investment Odyssey game initializing...');

    // Initialize event listeners for welcome screen
    initializeWelcomeScreen();

    // Check for existing game in local storage
    checkExistingGame();

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

// Initialize welcome screen event listeners
function initializeWelcomeScreen() {
    const singlePlayerBtn = document.getElementById('single-player-btn');
    const classModeBtn = document.getElementById('class-mode-btn');

    if (singlePlayerBtn) {
        singlePlayerBtn.addEventListener('click', startSinglePlayerGame);
    }

    if (classModeBtn) {
        classModeBtn.addEventListener('click', joinClassGame);
    }
}

// Check for existing game in local storage
function checkExistingGame() {
    try {
        // Try to load game state from local storage
        const gameData = localStorage.getItem('investmentOdysseyGameData');

        if (gameData) {
            const parsedData = JSON.parse(gameData);
            if (parsedData && parsedData.gameState && parsedData.playerState) {
                // We have a saved game, ask user if they want to continue
                const continueGame = confirm('You have an existing game. Would you like to continue?');

                if (continueGame) {
                    // Load the game state
                    gameState = parsedData.gameState;
                    playerState = parsedData.playerState;
                    currentRound = parsedData.currentRound || 0;

                    // Show the game screen
                    document.getElementById('welcome-screen').style.display = 'none';
                    document.getElementById('game-screen').style.display = 'block';

                    // Load the game interface
                    loadGameInterface();

                    // Show sticky next round button
                    const stickyNextRoundBtn = document.getElementById('sticky-next-round');
                    if (stickyNextRoundBtn) {
                        stickyNextRoundBtn.style.display = 'flex';
                    }

                    return true;
                }
            }
        }
        return false;
    } catch (error) {
        console.error('Error checking for existing game:', error);
        return false;
    }
}

// Redirect to login page if no user data is available
function redirectToLogin() {
    window.location.href = '../index.html';
}

// Simple loadGameInterface function
function loadGameInterface() {
    console.log('Loading game interface...');

    // Create a simple game interface for testing
    const gameScreen = document.getElementById('game-screen');
    if (!gameScreen) {
        console.error('Game screen element not found');
        return;
    }

    gameScreen.innerHTML = `
        <div class="container mt-4">
            <div class="card">
                <div class="card-header bg-primary text-white">
                    <h3>Investment Odyssey Game</h3>
                </div>
                <div class="card-body">
                    <div class="alert alert-info">
                        <p>Game is being initialized. This is a temporary interface while we fix the integration.</p>
                    </div>
                    <div class="d-flex justify-content-between align-items-center mb-3">
                        <div>
                            <strong>Round:</strong> <span id="current-round">${currentRound}</span>
                        </div>
                        <div>
                            <strong>Cash:</strong> $<span id="player-cash">${playerState ? playerState.cash.toFixed(2) : '10000.00'}</span>
                        </div>
                    </div>
                    <div class="text-center mt-4">
                        <button id="next-round-btn" class="btn btn-primary btn-lg">Next Round</button>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Initialize event listeners
    const nextRoundBtn = document.getElementById('next-round-btn');
    if (nextRoundBtn) {
        nextRoundBtn.addEventListener('click', function() {
            console.log('Next round button clicked');
            nextRound();
        });
    }
}

// Start a single player game
async function startSinglePlayerGame() {
    try {
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
        document.getElementById('welcome-screen').style.display = 'none';
        document.getElementById('game-screen').style.display = 'block';

        // Load the game interface
        loadGameInterface();

        // Initialize the game
        initializeGame();

        // Add initial prices to price history
        for (const [asset, price] of Object.entries(gameState.assetPrices)) {
            gameState.priceHistory[asset].push(price);
        }

        // Add initial CPI to CPI history
        gameState.CPIHistory.push(gameState.CPI);

        // Update UI to show initial state
        updateUI();

        // Show notification
        showNotification('Game started! You have $10,000 to invest. Click "Next Round" to advance the game.', 'success');
    } catch (error) {
        console.error('Error starting single player game:', error);
        alert('An error occurred while starting the game. Please try again.');
    }
}

// Join a class game
async function joinClassGame() {
    try {
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
        document.getElementById('welcome-screen').style.display = 'none';
        document.getElementById('game-screen').style.display = 'block';

        // Load the game interface
        loadGameInterface();
    } catch (error) {
        console.error('Error joining class game:', error);
        alert('An error occurred while joining the class game. Please try again.');
    }
}
