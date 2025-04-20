// Supabase Service for Investment Odyssey

// Service object for Supabase integration
window.Service = {
    // Check if Supabase client is properly initialized
    isSupabaseAvailable: function() {
        const available = typeof window.supabase !== 'undefined' &&
               typeof window.supabase.from === 'function' &&
               typeof window.supabase.auth === 'object';

        if (!available) {
            console.error('Supabase client not properly initialized. Current state:', window.supabase);
        }

        return available;
    },

    // Save game state to Supabase
    saveGameState: async function(studentId, gameType, gameData) {
        try {
            // Check if Supabase client is available
            if (!this.isSupabaseAvailable()) {
                console.warn('Supabase client not properly initialized');
                return { success: false, error: 'Supabase client not properly initialized' };
            }

            // Check if student ID is available
            if (!studentId) {
                console.error('Student ID not available');
                return { success: false, error: 'Student ID not available' };
            }

            try {
                // Check if game data exists for this user
                const { data: existingData, error: checkError } = await window.supabase
                    .from('game_states')
                    .select('id')
                    .eq('user_id', studentId)
                    .eq('game_type', gameType)
                    .maybeSingle();

                if (checkError) {
                    console.error('Error checking for existing game state:', checkError);
                    return { success: false, error: checkError.message };
                }

                let result;
                if (existingData) {
                    // Update existing game state
                    result = await window.supabase
                        .from('game_states')
                        .update({
                            game_data: gameData,
                            updated_at: new Date().toISOString()
                        })
                        .eq('id', existingData.id);
                } else {
                    // Insert new game state
                    result = await window.supabase
                        .from('game_states')
                        .insert([
                            {
                                user_id: studentId,
                                game_type: gameType,
                                game_data: gameData,
                                created_at: new Date().toISOString(),
                                updated_at: new Date().toISOString()
                            }
                        ]);
                }

                if (result.error) {
                    console.error('Error saving game state to Supabase:', result.error);
                    return { success: false, error: result.error.message };
                }

                return { success: true, data: result.data };
            } catch (supabaseError) {
                console.error('Supabase operation failed:', supabaseError);
                return { success: false, error: supabaseError.message };
            }
        } catch (error) {
            console.error('Error saving game state to Supabase:', error);
            return { success: false, error: error.message };
        }
    },

    // Load game state from Supabase
    loadGameState: async function(studentId, gameType) {
        try {
            // Check if Supabase client is available
            if (!this.isSupabaseAvailable()) {
                console.warn('Supabase client not properly initialized');
                return { success: false, error: 'Supabase client not properly initialized' };
            }

            // Check if student ID is available
            if (!studentId) {
                console.error('Student ID not available');
                return { success: false, error: 'Student ID not available' };
            }

            try {
                // Get game state from Supabase
                const { data, error } = await window.supabase
                    .from('game_states')
                    .select('game_data')
                    .eq('user_id', studentId)
                    .eq('game_type', gameType)
                    .maybeSingle();

                if (error) {
                    console.error('Error loading game state from Supabase:', error);
                    return { success: false, error: error.message };
                }

                if (!data) {
                    return { success: false, error: 'No game state found' };
                }

                return { success: true, data: data.game_data };
            } catch (supabaseError) {
                console.error('Supabase operation failed:', supabaseError);
                return { success: false, error: supabaseError.message };
            }
        } catch (error) {
            console.error('Error loading game state from Supabase:', error);
            return { success: false, error: error.message };
        }
    },

    // Save game score to Supabase
    saveGameScore: async function(studentId, studentName, gameType, score, taName = null, isClassGame = false) {
        try {
            // Check if Supabase client is available
            if (!this.isSupabaseAvailable()) {
                console.warn('Supabase client not properly initialized');
                return { success: false, error: 'Supabase client not properly initialized' };
            }

            // Check if student ID is available
            if (!studentId) {
                console.error('Student ID not available');
                return { success: false, error: 'Student ID not available' };
            }

            try {
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
            } catch (supabaseError) {
                console.error('Supabase operation failed:', supabaseError);
                return { success: false, error: supabaseError.message };
            }
        } catch (error) {
            console.error('Error saving score to Supabase:', error);
            return { success: false, error: error.message };
        }
    },

    // Get game scores from Supabase
    getGameScores: async function(gameType, limit = 10) {
        try {
            // Check if Supabase client is available
            if (!this.isSupabaseAvailable()) {
                console.warn('Supabase client not properly initialized');
                return { success: false, error: 'Supabase client not properly initialized' };
            }

            try {
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
            } catch (supabaseError) {
                console.error('Supabase operation failed:', supabaseError);
                return { success: false, error: supabaseError.message };
            }
        } catch (error) {
            console.error('Error getting scores from Supabase:', error);
            return { success: false, error: error.message };
        }
    },

    // Get student's game scores from Supabase
    getStudentGameScores: async function(studentId, gameType) {
        try {
            // Check if Supabase client is available
            if (!this.isSupabaseAvailable()) {
                console.warn('Supabase client not properly initialized');
                return { success: false, error: 'Supabase client not properly initialized' };
            }

            // Check if student ID is available
            if (!studentId) {
                console.error('Student ID not available');
                return { success: false, error: 'Student ID not available' };
            }

            try {
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
            } catch (supabaseError) {
                console.error('Supabase operation failed:', supabaseError);
                return { success: false, error: supabaseError.message };
            }
        } catch (error) {
            console.error('Error getting student scores from Supabase:', error);
            return { success: false, error: error.message };
        }
    },

    // Get section's game scores from Supabase
    getSectionGameScores: async function(sectionId, gameType) {
        try {
            // Check if Supabase client is available
            if (!this.isSupabaseAvailable()) {
                console.warn('Supabase client not properly initialized');
                return { success: false, error: 'Supabase client not properly initialized' };
            }

            // Check if section ID is available
            if (!sectionId) {
                console.error('Section ID not available');
                return { success: false, error: 'Section ID not available' };
            }

            try {
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
            } catch (supabaseError) {
                console.error('Supabase operation failed:', supabaseError);
                return { success: false, error: supabaseError.message };
            }
        } catch (error) {
            console.error('Error getting section scores from Supabase:', error);
            return { success: false, error: error.message };
        }
    }
};
