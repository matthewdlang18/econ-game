/**
 * Service for Investment Odyssey
 *
 * This file contains the service functions for the game.
 */

// Service object
const Service = {
    // Check if user is in guest mode
    isGuest: function() {
        // Check if guest mode is enabled in localStorage
        const isGuestMode = localStorage.getItem('investment_odyssey_guest_mode') === 'true';

        // Also check if user ID starts with 'guest_'
        const userId = localStorage.getItem('investment_odyssey_user_id') ||
                      localStorage.getItem('student_id');
        const isGuestId = userId && userId.startsWith('guest_');

        return isGuestMode || isGuestId;
    },

    // Set guest mode
    setGuestMode: function() {
        localStorage.setItem('investment_odyssey_guest_mode', 'true');
        localStorage.setItem('investment_odyssey_user_id', 'guest_' + Date.now());
        localStorage.setItem('investment_odyssey_user_name', 'Guest');
        localStorage.setItem('investment_odyssey_user_role', 'guest');
    },

    // Clear session
    clearSession: function() {
        localStorage.removeItem('investment_odyssey_user_id');
        localStorage.removeItem('investment_odyssey_user_name');
        localStorage.removeItem('investment_odyssey_user_role');
        localStorage.removeItem('investment_odyssey_user_section');
        localStorage.removeItem('investment_odyssey_guest_mode');
    },
    // Get current user
    getCurrentUser: function() {
        // Try to get user info from localStorage
        const userId = localStorage.getItem('student_id');
        const userName = localStorage.getItem('student_name');
        const sectionId = localStorage.getItem('section_id');

        if (userId && userName) {
            return {
                id: userId,
                name: userName,
                sectionId: sectionId
            };
        }

        // Try to get user info from game-specific localStorage
        const gameUserId = localStorage.getItem('investment_odyssey_user_id');
        const gameUserName = localStorage.getItem('investment_odyssey_user_name');

        if (gameUserId && gameUserName) {
            return {
                id: gameUserId,
                name: gameUserName
            };
        }

        return null;
    },

    // Get section info
    getSection: async function(sectionId) {
        try {
            if (!window.supabase) {
                console.error('Supabase not available');
                return { success: false, error: 'Supabase not available' };
            }

            const { data, error } = await window.supabase
                .from('sections')
                .select('*, profiles:ta_id(name)')
                .eq('id', sectionId)
                .maybeSingle();

            if (error) {
                console.error('Error fetching section:', error);
                return { success: false, error: error };
            }

            if (!data) {
                return { success: false, error: 'Section not found' };
            }

            return {
                success: true,
                data: {
                    id: data.id,
                    day: data.day,
                    time: data.time,
                    location: data.location,
                    ta: data.profiles ? data.profiles.name : null
                }
            };
        } catch (error) {
            console.error('Exception in getSection:', error);
            return { success: false, error: error };
        }
    },

    // Save game round
    saveGameRound: async function(gameId, roundNumber, assetPrices, priceHistory, cpi, cpiHistory) {
        try {
            if (!window.supabase) {
                console.error('Supabase not available');
                return { success: false, error: 'Supabase not available' };
            }

            console.log(`Saving game round: gameId=${gameId}, roundNumber=${roundNumber}`);

            const { data, error } = await window.supabase
                .from('game_rounds')
                .upsert({
                    game_id: gameId,
                    round_number: roundNumber,
                    asset_prices: assetPrices,
                    price_history: priceHistory,
                    cpi: cpi,
                    cpi_history: cpiHistory,
                    created_at: new Date().toISOString()
                }, { onConflict: 'game_id,round_number' })
                .select();

            if (error) {
                console.error('Error saving game round:', error);
                return { success: false, error: error };
            }

            console.log('Game round saved successfully:', data);
            return { success: true, data: data };
        } catch (error) {
            console.error('Exception in saveGameRound:', error);
            return { success: false, error: error };
        }
    },

    // Save player state
    savePlayerState: async function(gameId, userId, roundNumber, cash, portfolio, tradeHistory, portfolioValue, portfolioHistory) {
        try {
            if (!window.supabase) {
                console.error('Supabase not available');
                return { success: false, error: 'Supabase not available' };
            }

            console.log(`Saving player state: gameId=${gameId}, userId=${userId}, roundNumber=${roundNumber}`);

            const { data, error } = await window.supabase
                .from('player_states')
                .upsert({
                    game_id: gameId,
                    user_id: userId,
                    round_number: roundNumber,
                    cash: cash,
                    portfolio: portfolio,
                    trade_history: tradeHistory,
                    portfolio_value: portfolioValue,
                    portfolio_history: portfolioHistory,
                    updated_at: new Date().toISOString()
                }, { onConflict: 'game_id,user_id' })
                .select();

            if (error) {
                console.error('Error saving player state:', error);
                return { success: false, error: error };
            }

            console.log('Player state saved successfully:', data);
            return { success: true, data: data };
        } catch (error) {
            console.error('Exception in savePlayerState:', error);
            return { success: false, error: error };
        }
    },

    // Save game score
    saveGameScore: async function(userId, userName, gameId, gameType, gameMode, score, taName, sectionId) {
        try {
            if (!window.supabase) {
                console.error('Supabase not available');
                return { success: false, error: 'Supabase not available' };
            }

            console.log(`Saving game score: userId=${userId}, gameId=${gameId}, score=${score}`);

            const { data, error } = await window.supabase
                .from('game_scores')
                .upsert({
                    user_id: userId,
                    user_name: userName,
                    game_id: gameId,
                    game_type: gameType,
                    game_mode: gameMode,
                    score: score,
                    ta_name: taName,
                    section_id: sectionId,
                    created_at: new Date().toISOString()
                }, { onConflict: 'user_id,game_id' })
                .select();

            if (error) {
                console.error('Error saving game score:', error);
                return { success: false, error: error };
            }

            console.log('Game score saved successfully:', data);
            return { success: true, data: data };
        } catch (error) {
            console.error('Exception in saveGameScore:', error);
            return { success: false, error: error };
        }
    }
};

// Make Service available globally
window.Service = Service;
