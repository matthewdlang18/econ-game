/**
 * Service Bridge for Investment Odyssey
 *
 * This file connects the game to the Supabase services.
 * It creates a global Service object that can be used by the game.
 */

// Import services
import authService from './services/auth-service.js';
import gameService from './services/game-service.js';
import sectionService from './services/section-service.js';
import leaderboardService from './services/leaderboard-service.js';

// Create the Service object
window.Service = {
    // Authentication
    registerStudent: async function(name, passcode) {
        return await authService.registerStudent(name, passcode);
    },

    loginStudent: async function(name, passcode) {
        return await authService.loginStudent(name, passcode);
    },

    loginTA: async function(name, passcode) {
        return await authService.loginTA(name, passcode);
    },

    setGuestMode: function() {
        return authService.setGuestMode();
    },

    isGuest: function() {
        return authService.isGuest();
    },

    getCurrentUser: function() {
        return authService.getCurrentUser();
    },

    isLoggedIn: function() {
        return authService.isLoggedIn();
    },

    isTA: function() {
        return authService.isTA();
    },

    isStudent: function() {
        return authService.isStudent();
    },

    clearSession: function() {
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
        return await gameService.createGame(type, creatorId, sectionId, maxRounds);
    },

    getGame: async function(gameId) {
        return await gameService.getGame(gameId);
    },

    updateGameStatus: async function(gameId, status) {
        return await gameService.updateGameStatus(gameId, status);
    },

    updateGameRound: async function(gameId, roundNumber) {
        return await gameService.updateGameRound(gameId, roundNumber);
    },

    saveGameRound: async function(gameId, roundNumber, assetPrices, priceHistory, cpi, cpiHistory) {
        return await gameService.saveGameRound(gameId, roundNumber, assetPrices, priceHistory, cpi, cpiHistory);
    },

    getGameRound: async function(gameId, roundNumber) {
        return await gameService.getGameRound(gameId, roundNumber);
    },

    savePlayerState: async function(gameId, userId, roundNumber, cash, portfolio, tradeHistory, portfolioValue, portfolioHistory) {
        return await gameService.savePlayerState(gameId, userId, roundNumber, cash, portfolio, tradeHistory, portfolioValue, portfolioHistory);
    },

    getPlayerState: async function(gameId, userId, roundNumber) {
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
