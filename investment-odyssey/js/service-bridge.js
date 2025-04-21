/**
 * Service Bridge for Investment Odyssey
 *
 * This file connects the game to the Supabase services.
 * It creates a global Service object that can be used by the game.
 */

// Import services with fallback mechanism
let authService, gameService, sectionService, leaderboardService;

try {
    // Try to import services as ES modules
    import('./services/auth-service.js').then(module => {
        authService = module.default;
        console.log('Auth service loaded');
    }).catch(error => {
        console.error('Error loading auth service:', error);
    });

    import('./services/game-service.js').then(module => {
        gameService = module.default;
        console.log('Game service loaded');
    }).catch(error => {
        console.error('Error loading game service:', error);
    });

    import('./services/section-service.js').then(module => {
        sectionService = module.default;
        console.log('Section service loaded');
    }).catch(error => {
        console.error('Error loading section service:', error);
    });

    import('./services/leaderboard-service.js').then(module => {
        leaderboardService = module.default;
        console.log('Leaderboard service loaded');
    }).catch(error => {
        console.error('Error loading leaderboard service:', error);
    });
} catch (error) {
    console.error('Error importing services:', error);
}

// Helper function to check if a service is available
function checkService(service, name) {
    if (!service) {
        console.error(`${name} service not available`);
        return false;
    }
    return true;
}

// Create the Service object
window.Service = {
    // Authentication
    registerStudent: async function(name, passcode) {
        if (!checkService(authService, 'Auth')) return { success: false, error: 'Auth service not available' };
        return await authService.registerStudent(name, passcode);
    },

    loginStudent: async function(name, passcode) {
        if (!checkService(authService, 'Auth')) return { success: false, error: 'Auth service not available' };
        return await authService.loginStudent(name, passcode);
    },

    loginTA: async function(name, passcode) {
        if (!checkService(authService, 'Auth')) return { success: false, error: 'Auth service not available' };
        return await authService.loginTA(name, passcode);
    },

    setGuestMode: function() {
        if (!checkService(authService, 'Auth')) return { success: false, error: 'Auth service not available' };
        return authService.setGuestMode();
    },

    isGuest: function() {
        if (!checkService(authService, 'Auth')) return false;
        return authService.isGuest();
    },

    getCurrentUser: function() {
        if (!checkService(authService, 'Auth')) return null;
        return authService.getCurrentUser();
    },

    isLoggedIn: function() {
        if (!checkService(authService, 'Auth')) return false;
        return authService.isLoggedIn();
    },

    isTA: function() {
        if (!checkService(authService, 'Auth')) return false;
        return authService.isTA();
    },

    isStudent: function() {
        if (!checkService(authService, 'Auth')) return false;
        return authService.isStudent();
    },

    clearSession: function() {
        if (!checkService(authService, 'Auth')) return false;
        return authService.clearSession();
    },

    // Sections
    getAllSections: async function() {
        return await sectionService.getAllSections();
    },

    getTASections: async function(taId) {
        return await sectionService.getTASections(taId);
    },

    getSection: async function(sectionId) {
        return await sectionService.getSection(sectionId);
    },

    createSection: async function(taId, day, time, location) {
        return await sectionService.createSection(taId, day, time, location);
    },

    updateSection: async function(sectionId, day, time, location) {
        return await sectionService.updateSection(sectionId, day, time, location);
    },

    deleteSection: async function(sectionId) {
        return await sectionService.deleteSection(sectionId);
    },

    getSectionStudents: async function(sectionId) {
        return await sectionService.getSectionStudents(sectionId);
    },

    addStudentToSection: async function(studentId, sectionId) {
        return await sectionService.addStudentToSection(studentId, sectionId);
    },

    removeStudentFromSection: async function(studentId) {
        return await sectionService.removeStudentFromSection(studentId);
    },

    // Games
    createGame: async function(type, creatorId, sectionId = null, maxRounds = 20) {
        if (!checkService(gameService, 'Game')) return { success: false, error: 'Game service not available' };
        return await gameService.createGame(type, creatorId, sectionId, maxRounds);
    },

    getGame: async function(gameId) {
        if (!checkService(gameService, 'Game')) return { success: false, error: 'Game service not available' };
        return await gameService.getGame(gameId);
    },

    updateGameStatus: async function(gameId, status) {
        if (!checkService(gameService, 'Game')) return { success: false, error: 'Game service not available' };
        return await gameService.updateGameStatus(gameId, status);
    },

    updateGameRound: async function(gameId, roundNumber) {
        if (!checkService(gameService, 'Game')) return { success: false, error: 'Game service not available' };
        return await gameService.updateGameRound(gameId, roundNumber);
    },

    saveGameRound: async function(gameId, roundNumber, assetPrices, priceHistory, cpi, cpiHistory) {
        if (!checkService(gameService, 'Game')) return { success: false, error: 'Game service not available' };
        return await gameService.saveGameRound(gameId, roundNumber, assetPrices, priceHistory, cpi, cpiHistory);
    },

    getGameRound: async function(gameId, roundNumber) {
        if (!checkService(gameService, 'Game')) return { success: false, error: 'Game service not available' };
        return await gameService.getGameRound(gameId, roundNumber);
    },

    savePlayerState: async function(gameId, userId, roundNumber, cash, portfolio, tradeHistory, portfolioValue, portfolioHistory) {
        if (!checkService(gameService, 'Game')) return { success: false, error: 'Game service not available' };
        return await gameService.savePlayerState(gameId, userId, roundNumber, cash, portfolio, tradeHistory, portfolioValue, portfolioHistory);
    },

    getPlayerState: async function(gameId, userId, roundNumber) {
        if (!checkService(gameService, 'Game')) return { success: false, error: 'Game service not available' };
        return await gameService.getPlayerState(gameId, userId, roundNumber);
    },

    getGamePlayerStates: async function(gameId) {
        return await gameService.getGamePlayerStates(gameId);
    },

    getPlayerHistory: async function(gameId, userId) {
        return await gameService.getPlayerHistory(gameId, userId);
    },

    getLatestPlayerState: async function(gameId, userId) {
        return await gameService.getLatestPlayerState(gameId, userId);
    },

    saveGameScore: async function(userId, userName, gameId, gameType, gameMode, finalPortfolio, taName = null, sectionId = null) {
        if (!checkService(gameService, 'Game')) {
            console.error('Game service not available for saving score');
            // Save to localStorage as fallback
            try {
                const scores = JSON.parse(localStorage.getItem('investment_odyssey_scores') || '[]');
                scores.push({
                    userId,
                    userName,
                    gameId,
                    gameType,
                    gameMode,
                    finalPortfolio,
                    taName,
                    sectionId,
                    timestamp: new Date().toISOString()
                });
                localStorage.setItem('investment_odyssey_scores', JSON.stringify(scores));
                return { success: true, data: { message: 'Score saved to localStorage' } };
            } catch (error) {
                console.error('Error saving score to localStorage:', error);
                return { success: false, error: 'Failed to save score' };
            }
        }
        return await gameService.saveGameScore(userId, userName, gameId, gameType, gameMode, finalPortfolio, taName, sectionId);
    },

    // Leaderboard
    getSinglePlayerLeaderboard: async function(limit = 100) {
        return await leaderboardService.getSinglePlayerLeaderboard(limit);
    },

    getClassLeaderboard: async function(sectionId, limit = 100) {
        return await leaderboardService.getClassLeaderboard(sectionId, limit);
    },

    getAllClassLeaderboards: async function(limit = 100) {
        return await leaderboardService.getAllClassLeaderboards(limit);
    },

    getPlayerBestScore: async function(userId) {
        return await leaderboardService.getPlayerBestScore(userId);
    },

    getPlayerBestClassScore: async function(userId, sectionId) {
        return await leaderboardService.getPlayerBestClassScore(userId, sectionId);
    },

    getGameStatistics: async function(gameType = 'investment-odyssey') {
        return await leaderboardService.getGameStatistics(gameType);
    },

    getPlayerStatistics: async function(userId, gameType = 'investment-odyssey') {
        return await leaderboardService.getPlayerStatistics(userId, gameType);
    }
};

// Log that the service bridge is loaded
console.log('Investment Odyssey Service Bridge loaded');
