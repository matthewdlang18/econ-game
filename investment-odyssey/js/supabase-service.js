// Supabase Service for Investment Odyssey

// Service object for Supabase integration
window.Service = {
    // Save game score to Supabase
    saveGameScore: async function(studentId, studentName, gameType, score, taName = null, isClassGame = false) {
        try {
            // Check if Supabase client is available
            if (!window.supabase) {
                console.error('Supabase client not available');
                return { success: false, error: 'Supabase client not available' };
            }

            // Check if student ID is available
            if (!studentId) {
                console.error('Student ID not available');
                return { success: false, error: 'Student ID not available' };
            }

            // Get section ID from localStorage
            const sectionId = localStorage.getItem('section_id');

            // Save score to Supabase
            const { data, error } = await window.supabase
                .from('leaderboard')
                .insert([{
                    user_id: studentId,
                    user_name: studentName,
                    game_id: 'single_player_' + Date.now(),
                    game_type: gameType,
                    game_mode: isClassGame ? 'class' : 'single',
                    final_portfolio: score,
                    ta_name: taName,
                    section_id: sectionId,
                    created_at: new Date().toISOString()
                }]);

            if (error) {
                console.error('Error saving score to Supabase:', error);
                return { success: false, error: error.message };
            }

            return { success: true, data };
        } catch (error) {
            console.error('Error saving score to Supabase:', error);
            return { success: false, error: error.message };
        }
    },

    // Get game scores from Supabase
    getGameScores: async function(gameType, limit = 10) {
        try {
            // Check if Supabase client is available
            if (!window.supabase) {
                console.error('Supabase client not available');
                return { success: false, error: 'Supabase client not available' };
            }

            // Get scores from Supabase
            const { data, error } = await window.supabase
                .from('leaderboard')
                .select('*')
                .eq('game_type', gameType)
                .order('final_portfolio', { ascending: false })
                .limit(limit);

            if (error) {
                console.error('Error getting scores from Supabase:', error);
                return { success: false, error: error.message };
            }

            return { success: true, data };
        } catch (error) {
            console.error('Error getting scores from Supabase:', error);
            return { success: false, error: error.message };
        }
    },

    // Get student's game scores from Supabase
    getStudentGameScores: async function(studentId, gameType) {
        try {
            // Check if Supabase client is available
            if (!window.supabase) {
                console.error('Supabase client not available');
                return { success: false, error: 'Supabase client not available' };
            }

            // Check if student ID is available
            if (!studentId) {
                console.error('Student ID not available');
                return { success: false, error: 'Student ID not available' };
            }

            // Get scores from Supabase
            const { data, error } = await window.supabase
                .from('leaderboard')
                .select('*')
                .eq('user_id', studentId)
                .eq('game_type', gameType)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error getting student scores from Supabase:', error);
                return { success: false, error: error.message };
            }

            return { success: true, data };
        } catch (error) {
            console.error('Error getting student scores from Supabase:', error);
            return { success: false, error: error.message };
        }
    },

    // Get section's game scores from Supabase
    getSectionGameScores: async function(sectionId, gameType) {
        try {
            // Check if Supabase client is available
            if (!window.supabase) {
                console.error('Supabase client not available');
                return { success: false, error: 'Supabase client not available' };
            }

            // Check if section ID is available
            if (!sectionId) {
                console.error('Section ID not available');
                return { success: false, error: 'Section ID not available' };
            }

            // Get scores from Supabase
            const { data, error } = await window.supabase
                .from('leaderboard')
                .select('*')
                .eq('section_id', sectionId)
                .eq('game_type', gameType)
                .order('final_portfolio', { ascending: false });

            if (error) {
                console.error('Error getting section scores from Supabase:', error);
                return { success: false, error: error.message };
            }

            return { success: true, data };
        } catch (error) {
            console.error('Error getting section scores from Supabase:', error);
            return { success: false, error: error.message };
        }
    }
};
