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
            
            // Create score object
            const scoreData = {
                student_id: studentId,
                student_name: studentName,
                game_type: gameType,
                score: score,
                section_id: sectionId || null,
                ta_name: taName,
                is_class_game: isClassGame,
                created_at: new Date().toISOString()
            };
            
            // Save score to Supabase
            const { data, error } = await window.supabase
                .from('game_scores')
                .insert([scoreData]);
            
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
                .from('game_scores')
                .select('*')
                .eq('game_type', gameType)
                .order('score', { ascending: false })
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
                .from('game_scores')
                .select('*')
                .eq('student_id', studentId)
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
                .from('game_scores')
                .select('*')
                .eq('section_id', sectionId)
                .eq('game_type', gameType)
                .order('score', { ascending: false });
            
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
